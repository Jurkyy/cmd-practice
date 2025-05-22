import subprocess
import shlex
import os
from .task_loader import Task # Assuming Task class is in task_loader.py
from typing import Tuple, List, Any

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
            is_recursive = "-r" in original_command_parts or "--recursive" in original_command_parts
            
            dry_run_output_lines = []
            actual_files_to_report = []

            for item_arg in files_to_remove_args:
                # This is a very basic glob handler, might need enhancement
                if "*" in item_arg or "?" in item_arg or "[" in item_arg: # Basic globbing check
                    # Need to expand glob in the context of the working directory
                    # For safety, and simplicity, let's not execute 'ls' or similar here in the dry run
                    # We'll just indicate the glob pattern.
                    # A more advanced version would use glob.glob()
                    # For example:
                    # import glob
                    # expanded_items = glob.glob(os.path.join(cwd, item_arg))
                    # For now, just reflect the glob pattern.
                    dry_run_output_lines.append(f"Would attempt to remove files matching pattern: {item_arg}")
                    actual_files_to_report.append(f"(files matching '{item_arg}')")
                else:
                    # Construct full path to check existence
                    full_item_path = os.path.join(cwd, item_arg)
                    if os.path.isdir(full_item_path):
                        if is_recursive:
                            dry_run_output_lines.append(f"Would recursively remove directory: {item_arg}")
                            actual_files_to_report.append(item_arg + "/")
                        else:
                            return "", f"Error: cannot remove '{item_arg}': Is a directory (specify -r or --recursive to remove directories).", 1
                    elif os.path.exists(full_item_path):
                        dry_run_output_lines.append(f"Would remove file: {item_arg}")
                        actual_files_to_report.append(item_arg)
                    else:
                        # If the file doesn't exist, rm wouldn't do anything or might error depending on options
                        # For simplicity, we'll say it would attempt to remove.
                        # rm usually errors if a file doesn't exist and -f isn't used.
                        # Let's simulate that if -f is not present.
                        is_force = "-f" in original_command_parts or "--force" in original_command_parts
                        if not is_force:
                            return "", f"Error: cannot remove '{item_arg}': No such file or directory.", 1
                        else: # if -f is present, rm doesn't complain about non-existent files
                             dry_run_output_lines.append(f"Would attempt to remove non-existent file (due to -f): {item_arg}")
                             # actual_files_to_report.append(f"{item_arg} (non-existent)") # Not added to the "removed" list

            if not dry_run_output_lines and files_to_remove_args: # If files were specified but none would be actioned (e.g. all non-existent without -f)
                 # This case should ideally be handled by the loop above returning an error.
                 # If it reaches here, it implies -f was used and no existing files matched.
                return "Dry run: No existing files specified would be removed.", "", 0 # Simulate success for dry run


            # Construct a more informative dry-run message
            # Example: Dry run: rm -rf some_file some_dir/
            # This command would have removed: some_file, some_dir/
            # stdout = f"Dry run: {command_str}\nThis command would have removed: {', '.join(actual_files_to_report)}"
            
            # Simplified: "Dry run: would remove file1, dir1/"
            final_dry_run_message = f"Dry run: This command would have removed: {', '.join(actual_files_to_report)}"
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
    # Basic test for execute_command
    print("Testing execute_command...")
    stdout, stderr, retcode = execute_command("echo Hello World")
    print(f"Cmd: echo Hello World -> Stdout: '{stdout}', Stderr: '{stderr}', Retcode: {retcode}")
    
    stdout, stderr, retcode = execute_command("ls -l data") # Assumes 'data' directory exists
    print(f"Cmd: ls -l data -> Retcode: {retcode}") # Just print retcode, stdout can be long
    # print(f"Stdout:\n{stdout}")

    stdout, stderr, retcode = execute_command("nonexistentcommand")
    print(f"Cmd: nonexistentcommand -> Stdout: '{stdout}', Stderr: '{stderr}', Retcode: {retcode}")

    stdout, stderr, retcode = execute_command("grep 'apple' data/words_and_numbers.csv")
    print(f"Cmd: grep 'apple' data/words_and_numbers.csv -> Stdout: '{stdout}', Stderr: '{stderr}', Retcode: {retcode}")

    # Create a dummy Task object for testing evaluate_command
    class MockTask(Task):
        def __init__(self, id, title, description, command_to_practice, example_solution, setup_files, input_details, evaluation, hints):
            super().__init__(id, title, description, command_to_practice, example_solution, setup_files, input_details, evaluation, hints)

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