import subprocess
import shlex
import os
import glob # Added for glob expansion
import shutil # Added for rmtree in tests
from .task_loader import Task # Assuming Task class is in task_loader.py
from typing import Tuple, List, Any

# If Task is only needed for evaluate_command tests, MockTask can be self-contained for execute_command tests.
# For now, let's assume Task might be used by execute_command indirectly or by future tests.
# The proper fix is to run as a module or adjust sys.path for tests.

# Try to import Task for MockTask, but make it optional if evaluator is run standalone
# and Task is not strictly needed for the execute_command tests themselves.
_TaskDep = None
try:
    from .task_loader import Task as _TaskDep
except ImportError:
    # This allows the script to run standalone if task_loader is not found initially
    # The MockTask definition later will handle if _TaskDep is None
    print("Warning: .task_loader.Task not found, MockTask will be a basic object.")
    pass 

def execute_command(command_str: str, working_directory: str = ".") -> Tuple[str, str, int]:
    """Executes a shell command and returns its stdout, stderr, and return code."""
    if not command_str: # Handle empty command string
        return "", "Error: No command entered.", 1

    original_command_parts = shlex.split(command_str)
    command_name = original_command_parts[0] if original_command_parts else ""

    try:
        # Ensure working directory exists, or default to current if not specified or invalid
        if not os.path.isdir(working_directory):
            print(f"Warning: Working directory '{working_directory}' not found. Using current directory instead.")
            cwd = "."
        else:
            cwd = working_directory

        if command_name == "rm":
            # Implement dry-run for rm
            # Construct the message for the user
            # This is a simplified dry run. A more robust solution might involve:
            # - Parsing 'rm' options more thoroughly (e.g., -r, -f, specific file paths, globs)
            # - Actually checking which files/directories would be removed without deleting them.
            
            # For now, we'll just echo the command and pretend it's a dry run.
            # A more advanced dry run would involve listing files that *would* be deleted.

            files_to_remove_args = [arg for arg in original_command_parts[1:] if not arg.startswith('-')]
            
            if not files_to_remove_args:
                return "", "Error: rm command used without specifying files to remove.", 1

            # Check for -r or --recursive for directories
            # is_recursive = "-r" in original_command_parts or "--recursive" in original_command_parts
            
            dry_run_output_lines = []
            actual_files_to_report = []

            # Determine if -f or --force is used and if -r or --recursive is used
            # is_force = "-f" in original_command_parts or "--force" in original_command_parts
            is_recursive = False
            is_force = False
            options = [part for part in original_command_parts[1:] if part.startswith('-')]
            for opt_group in options:
                if opt_group == '--recursive':
                    is_recursive = True
                elif opt_group == '--force':
                    is_force = True
                elif opt_group.startswith('-') and not opt_group.startswith('--'): # Short options like -r, -f, -rf
                    if 'r' in opt_group:
                        is_recursive = True
                    if 'f' in opt_group:
                        is_force = True

            for item_arg in files_to_remove_args:
                expanded_items = []
                # Check if item_arg is a glob pattern
                if "*" in item_arg or "?" in item_arg or "[" in item_arg:
                    # Expand glob pattern in the context of the working directory
                    glob_path = os.path.join(cwd, item_arg)
                    expanded_items.extend(glob.glob(glob_path))
                    if not expanded_items and not is_force:
                        # If glob expands to nothing and -f is not used, rm usually errors for the pattern itself.
                        # However, behavior can vary. For simplicity, if it expands to nothing, 
                        # and -f is not present, we might state no files match or let it be handled if it was a literal.
                        # Standard rm behavior: `rm *.nonexistent` -> `rm: cannot remove '*.nonexistent': No such file or directory` if shell doesn't expand it to empty
                        # If shell expands to empty, command might not run or rm gets no args.
                        # Our shlex.split means rm gets the literal '*.nonexistent'.
                        # So, we should simulate the error for the pattern if it doesn't match anything and -f is not used.
                        dry_run_output_lines.append(f"Pattern '{item_arg}' did not match any files.")
                        # Continue to allow other arguments to be processed, or error out here?
                        # Let's mimic rm: if a pattern doesn't match and -f isn't there, it's an error.
                        return "", f"Error: cannot remove '{item_arg}': No such file or directory", 1
                    elif not expanded_items and is_force:
                        # If glob expands to nothing and -f is used, rm doesn't complain.
                        dry_run_output_lines.append(f"Pattern '{item_arg}' did not match any files (ignored due to -f).")
                        continue # Move to the next item_arg
                else:
                    expanded_items.append(os.path.join(cwd, item_arg)) # Treat as a literal path

                for full_item_path in expanded_items:
                    # Get the relative path for reporting, consistent with how item_arg was provided
                    # If full_item_path was from glob, it's absolute. We need to make it relative to cwd for reporting.
                    item_to_report = os.path.relpath(full_item_path, cwd)

                    if os.path.isdir(full_item_path):
                        if is_recursive:
                            dry_run_output_lines.append(f"Would recursively remove directory: {item_to_report}")
                            actual_files_to_report.append(item_to_report + "/")
                        else:
                            return "", f"Error: cannot remove '{item_to_report}': Is a directory (specify -r or --recursive to remove directories).", 1
                    elif os.path.exists(full_item_path):
                        dry_run_output_lines.append(f"Would remove file: {item_to_report}")
                        actual_files_to_report.append(item_to_report)
                    else:
                        # This part should ideally not be reached if glob didn't find it and wasn't forced.
                        # If it was a literal path that doesn't exist:
                        if not is_force:
                            return "", f"Error: cannot remove '{item_to_report}': No such file or directory.", 1
                        else:
                            dry_run_output_lines.append(f"Would attempt to remove non-existent file (due to -f): {item_to_report}")
            
            if not actual_files_to_report and files_to_remove_args:
                # This means arguments were provided, but no actual files/dirs were identified for removal
                # (e.g., all were non-existent and -f was used, or patterns matched nothing with -f)
                return "Dry run: No existing files or directories specified would be removed.", "", 0
            elif not files_to_remove_args: # Should have been caught earlier
                return "", "Error: rm command used without specifying files to remove.", 1


            # Construct a more informative dry-run message
            # Example: Dry run: rm -rf some_file some_dir/
            # This command would have removed: some_file, some_dir/
            # stdout = f"Dry run: {command_str}\nThis command would have removed: {', '.join(actual_files_to_report)}"
            
            # Simplified: "Dry run: would remove file1, dir1/"
            final_dry_run_message = f"Dry run: This command would have removed: {', '.join(sorted(list(set(actual_files_to_report))))}"
            return final_dry_run_message, "", 0 # Simulate success for dry run

        # Original execution path for non-rm commands
        process = subprocess.run(
            command_str, 
            shell=True, # Using shell=True to allow pipes, redirection, etc.
            capture_output=True, 
            text=True, 
            cwd=cwd, # Set the working directory
            timeout=10 # Add a timeout to prevent hanging commands
        )
        return process.stdout.strip(), process.stderr.strip(), process.returncode
    except subprocess.TimeoutExpired:
        return "", "Error: Command timed out.", 1 # Arbitrary non-zero return code
    except FileNotFoundError: # This might occur if the command itself is not found and shell=False
        return "", f"Error: Command or program not found: {shlex.split(command_str)[0]}", 127
    except Exception as e:
        return "", f"Error executing command: {e}", 1

def evaluate_command(user_command: str, task: Task) -> Tuple[bool, str, str]:
    """
    Evaluates the user's command against the task's criteria.
    Returns: (is_correct, actual_stdout, actual_stderr)
    """
    actual_stdout, actual_stderr, return_code = execute_command(
        user_command, 
        task.input_details.get("working_directory", ".")
    )

    # For some tasks, a non-zero return code might be acceptable or even expected.
    # For now, we assume 0 is success unless evaluation handles it differently.
    # if return_code != 0 and not actual_stderr: # if command failed but no stderr, put a generic one
    #    if not actual_stderr:
    #        actual_stderr = f"Command returned non-zero exit code: {return_code}"

    eval_method = task.evaluation.get("method")
    expected_stdout = task.evaluation.get("expected_stdout", "")
    # Normalize expected_stdout newlines if they were escaped in JSON
    if isinstance(expected_stdout, str):
        expected_stdout = expected_stdout.replace('\\n', '\n').strip()

    is_correct = False

    if eval_method == "exact_match":
        # For exact match, we usually expect no errors and specific stdout
        if return_code == 0 and actual_stdout == expected_stdout and not actual_stderr:
            is_correct = True
        # Allow for tasks that expect specific stderr
        elif return_code !=0 and task.evaluation.get("expected_stderr") and actual_stderr == task.evaluation.get("expected_stderr") and actual_stdout == expected_stdout:
             is_correct = True
        elif return_code == 0 and actual_stdout == expected_stdout and task.evaluation.get("allow_stderr_if_stdout_matches", False):
            is_correct = True


    elif eval_method == "contains_substring":
        # For contains_substring, we primarily check stdout. Stderr might be ignored or checked separately.
        if return_code == 0: # Usually expect success for this
            expected_substrings: List[str] = task.evaluation.get("expected_stdout_substrings", [])
            all_substrings_found = True
            for sub in expected_substrings:
                if sub not in actual_stdout:
                    all_substrings_found = False
                    break
            if all_substrings_found and not expected_substrings: # If no substrings, but command success, it's correct.
                 is_correct = True if not expected_substrings else False 
            elif all_substrings_found and expected_substrings:
                is_correct = True
    
    # Add more evaluation methods here as needed (e.g., regex_match, script_check)
    # For script_check, you might run another script that takes user_stdout and returns true/false

    return is_correct, actual_stdout, actual_stderr

if __name__ == '__main__':
    # import sys
    # import os
    # current_dir = os.path.dirname(os.path.abspath(__file__))
    # parent_dir = os.path.dirname(current_dir)
    # if parent_dir not in sys.path:
    # sys.path.insert(0, parent_dir)
    # from src.task_loader import Task # This was for the __main__ block

    # Basic test for execute_command
    print("Testing execute_command...")
    stdout, stderr, retcode = execute_command("echo Hello World")
    print(f"Cmd: echo Hello World -> Stdout: '{stdout}', Stderr: '{stderr}', Retcode: {retcode}")
    
    stdout, stderr, retcode = execute_command("nonexistentcommand")
    print(f"Cmd: nonexistentcommand -> Stdout: '{stdout}', Stderr: '{stderr}', Retcode: {retcode}")

    print("\n--- Testing rm dry-run with globbing ---")
    test_dir = os.path.join("data", "rm_test_dir")
    subdir_path = os.path.join(test_dir, "subdir")

    # Setup test directory and files
    try:
        os.makedirs(subdir_path, exist_ok=True)
        with open(os.path.join(test_dir, "file1.txt"), "w") as f: f.write("test1")
        with open(os.path.join(test_dir, "file2.txt"), "w") as f: f.write("test2")
        with open(os.path.join(test_dir, "another.log"), "w") as f: f.write("log")
        with open(os.path.join(subdir_path, "nested_file.txt"), "w") as f: f.write("nested")
        print(f"Test setup: Created directory {test_dir} with test files.")
    except Exception as e:
        print(f"Error during test setup: {e}")
        # Exit if setup fails, as tests would be invalid
        # raise

    rm_test_cases = [
        ("rm *.txt", test_dir, "Glob matching multiple .txt files"),
        ("rm file*.txt", test_dir, "Glob matching multiple file*.txt files"),
        ("rm another.log", test_dir, "Specific file"),
        ("rm *.log", test_dir, "Glob matching one .log file"),
        ("rm *.nonexistent", test_dir, "Glob matching no files (error expected)"),
        ("rm -f *.nonexistent", test_dir, "Glob matching no files (with -f)"),
        ("rm non_existent_file.txt", test_dir, "Non-existent specific file (error expected)"),
        ("rm -f non_existent_file.txt", test_dir, "Non-existent specific file (with -f)"),
        ("rm subdir", test_dir, "Directory without -r (error expected)"),
        ("rm -r subdir", test_dir, "Directory with -r"),
        ("rm -rf subdir", test_dir, "Directory with -rf"),
        ("rm -r non_exist_subdir", test_dir, "Non-existent directory with -r (error expected)"),
        ("rm -rf non_exist_subdir", test_dir, "Non-existent directory with -rf"),
        ("rm -r *.txt", test_dir, "Attempt to remove files with -r (should remove, not error as directory)"),
        ("rm file1.txt subdir", test_dir, "Multiple arguments, file and dir (error on dir)")
    ]

    for cmd, wd, desc in rm_test_cases:
        print(f"\nTest Case: {desc}")
        print(f"Cmd: {cmd} (in {wd})")
        stdout, stderr, retcode = execute_command(cmd, working_directory=wd)
        print(f"Stdout: '{stdout}'")
        print(f"Stderr: '{stderr}'")
        print(f"Retcode: {retcode}")

    # Teardown test directory
    try:
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir)
            print(f"\nTest teardown: Removed directory {test_dir}")
    except Exception as e:
        print(f"Error during test teardown: {e}")

    # Create a dummy Task object for testing evaluate_command
    class MockTask(Task):
        def __init__(self, id, title, description, command_to_practice, example_solution, setup_files, input_details, evaluation, hints):
            super().__init__(id, title, description, command_to_practice, example_solution, setup_files, input_details, evaluation, hints)
            # self.id = id
            # self.title = title
            # self.input_details = input_details
            # self.evaluation = evaluation

    print("\nTesting evaluate_command...")
    # Test 1: Exact match success
    task1_eval = {"method": "exact_match", "expected_stdout": "Hello World"}
    task1 = MockTask("test1", "Test Echo", "", "", "", [], {"working_directory": "."}, task1_eval, [])
    correct, out, err = evaluate_command("echo Hello World", task1)
    print(f"Test 1 (Exact Match Success): Correct={correct}, Out='{out}', Err='{err}'")
    assert correct == True

    # Test 2: Exact match failure (wrong output)
    correct, out, err = evaluate_command("echo Hello There", task1)
    print(f"Test 2 (Exact Match Fail - Output): Correct={correct}, Out='{out}', Err='{err}'")
    assert correct == False

    # Test 3: Exact match failure (command error)
    correct, out, err = evaluate_command("echooops Hello World", task1) # misspelled command
    print(f"Test 3 (Exact Match Fail - Command Error): Correct={correct}, Out='{out}', Err='{err}'")
    assert correct == False
    
    # Test 4: Contains substring success
    task2_eval = {"method": "contains_substring", "expected_stdout_substrings": ["apple", "10"]}
    task2 = MockTask("test2", "Test Grep", "", "", "", [], {"working_directory": "data"}, task2_eval, [])
    # We need data/words_and_numbers.csv with "apple,10"
    # Assuming words_and_numbers.csv is in ./data/
    correct, out, err = evaluate_command("grep apple words_and_numbers.csv", task2)
    print(f"Test 4 (Contains Substring Success): Correct={correct}, Out='{out}', Err='{err}'")
    assert correct == True

    # Test 5: Contains substring failure (missing one substring)
    task3_eval = {"method": "contains_substring", "expected_stdout_substrings": ["apple", "NOT_THERE"]}
    task3 = MockTask("test3", "Test Grep Fail", "", "", "", [], {"working_directory": "data"}, task3_eval, [])
    correct, out, err = evaluate_command("grep apple words_and_numbers.csv", task3)
    print(f"Test 5 (Contains Substring Fail): Correct={correct}, Out='{out}', Err='{err}'")
    assert correct == False
    
    # Test 6: Exact match with newline in expected output
    task4_eval = {"method": "exact_match", "expected_stdout": "line1\\nline2"}
    task4 = MockTask("test4", "Test Echo Newline", "", "", "", [], {"working_directory": "."}, task4_eval, [])
    correct, out, err = evaluate_command("printf 'line1\nline2'", task4)
    print(f"Test 6 (Exact Match Newline): Correct={correct}, Out='{out}', Err='{err}'")
    assert correct == True

    print("\nAll basic evaluator tests seemed to pass if no assertions failed.") 