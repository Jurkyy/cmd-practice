import subprocess
import shlex
import os
import shutil 
import re 
from .task_loader import Task 
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

    try:
        # Ensure working directory exists, or default to current if not specified or invalid
        if not os.path.isdir(working_directory):
            print(f"Warning: Working directory '{working_directory}' not found. Using current directory instead.")
            cwd = "."
        else:
            cwd = working_directory

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

    command_structure_ok = True
    command_checks = task.evaluation.get("check_command_contains")
    if command_checks and isinstance(command_checks, list): # Ensure it's a list
        for check_item in command_checks:
            if not isinstance(check_item, dict): # Ensure item is a dict
                continue
            substring = check_item.get("substring")
            is_optional = check_item.get("optional", False)
            use_regex = check_item.get("is_regex", False)

            if not substring: # Skip if substring is not defined
                continue

            found = False
            if use_regex:
                if re.search(substring, user_command):
                    found = True
            else:
                if substring in user_command:
                    found = True
            
            if not found and not is_optional:
                command_structure_ok = False
                break

    eval_method = task.evaluation.get("method")
    expected_stdout = task.evaluation.get("expected_stdout", "")
    # Normalize expected_stdout newlines if they were escaped in JSON
    if isinstance(expected_stdout, str):
        expected_stdout = expected_stdout.replace('\\n', '\n').strip()

    is_correct = False # Initialize is_correct

    if eval_method == "exact_match":
        # For exact match, we usually expect no errors and specific stdout
        exact_match_output_conditions_met = False
        if return_code == 0 and actual_stdout == expected_stdout and not actual_stderr:
            exact_match_output_conditions_met = True
        # Allow for tasks that expect specific stderr
        elif return_code !=0 and task.evaluation.get("expected_stderr") and actual_stderr == task.evaluation.get("expected_stderr") and actual_stdout == expected_stdout:
             exact_match_output_conditions_met = True
        elif return_code == 0 and actual_stdout == expected_stdout and task.evaluation.get("allow_stderr_if_stdout_matches", False):
            exact_match_output_conditions_met = True
        
        if exact_match_output_conditions_met and command_structure_ok: # Combine with command structure check
            is_correct = True

    elif eval_method == "contains_substring":
        # For contains_substring, we primarily check stdout. Stderr might be ignored or checked separately.
        contains_substring_output_conditions_met = False
        if return_code == 0: # Usually expect success for this
            expected_stdout_substrings: List[str] = task.evaluation.get("expected_stdout_substrings", [])
            
            if not expected_stdout_substrings: # If no output substrings to check, command success is enough for this part
                contains_substring_output_conditions_met = True
            else:
                all_output_substrings_found = True
                for sub in expected_stdout_substrings:
                    if sub not in actual_stdout:
                        all_output_substrings_found = False
                        break
                if all_output_substrings_found: # This implies expected_stdout_substrings is not empty
                    contains_substring_output_conditions_met = True
            
        if contains_substring_output_conditions_met and command_structure_ok: # Combine with command structure check
            is_correct = True
    
    elif eval_method == "complex_script_evaluation": 
        filesystem_conditions_met = False # Assume false until proven true
        stdout_condition_met = False
        stderr_condition_met = False

        # 1. Filesystem check
        eval_config = task.evaluation
        fs_check_config = eval_config.get("check_destination_dir_contents")
        
        if fs_check_config and isinstance(fs_check_config, dict):
            working_dir = task.input_details.get("working_directory", ".")
            # For this task, the target directory to check is 'data/destination_dir'
            # This could be generalized by adding a "target_dir" field to fs_check_config in the JSON
            target_dir_name = "data/destination_dir" # Specific to current task structure
            full_target_dir_path = os.path.join(working_dir, target_dir_name)

            if not os.path.isdir(full_target_dir_path):
                print(f"Evaluator: Target directory for checks '{full_target_dir_path}' does not exist.")
                filesystem_conditions_met = False
            else:
                actual_files_in_target_dir = os.listdir(full_target_dir_path)
                
                expected_files_ok = True
                expected_file_paths = fs_check_config.get("expected_files", [])
                if not expected_file_paths: # If empty, it's trivially true for this part
                    pass
                else:
                    for item_path in expected_file_paths:
                        basename_to_check = os.path.basename(item_path)
                        if basename_to_check not in actual_files_in_target_dir:
                            expected_files_ok = False
                            # print(f"Evaluator: Expected file '{basename_to_check}' not found in '{full_target_dir_path}'.")
                            break
                
                unexpected_files_ok = True
                if expected_files_ok: # Only proceed if expected files were okay
                    unexpected_file_paths = fs_check_config.get("unexpected_files", [])
                    if not unexpected_file_paths: # If empty, it's trivially true
                        pass
                    else:
                        for item_path in unexpected_file_paths:
                            basename_to_check = os.path.basename(item_path)
                            if basename_to_check in actual_files_in_target_dir:
                                unexpected_files_ok = False
                                # print(f"Evaluator: Unexpected file '{basename_to_check}' found in '{full_target_dir_path}'.")
                                break
                
                if expected_files_ok and unexpected_files_ok:
                    filesystem_conditions_met = True
        else:
            # If no fs_check_config, consider it passing this condition, or decide if it should be mandatory
            filesystem_conditions_met = True # Or False if this check is mandatory for this method

        # 2. Stdout check (using regex pattern)
        expected_stdout_pattern = eval_config.get("expected_stdout_pattern", "")
        if expected_stdout_pattern:
            # Using re.MULTILINE if pattern is expected to span multiple lines, which is common for ls output.
            # Using re.DOTALL if '.' should match newlines, but usually not needed for line-based patterns.
            if re.search(expected_stdout_pattern, actual_stdout, re.MULTILINE):
                stdout_condition_met = True
        elif not actual_stdout: # If no pattern and no stdout, it's a match for stdout.
            stdout_condition_met = True


        # 3. Stderr check
        expected_stderr = eval_config.get("expected_stderr", "")
        if actual_stderr == expected_stderr:
            stderr_condition_met = True

        # 4. Final correctness
        if command_structure_ok and filesystem_conditions_met and stdout_condition_met and stderr_condition_met:
            is_correct = True

    # Add more evaluation methods here as needed (e.g., regex_match, script_check)
    # For script_check, you might run another script that takes user_stdout and returns true/false

    return is_correct, actual_stdout, actual_stderr

if __name__ == '__main__':
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