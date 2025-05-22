from task_loader import load_all_tasks, Task
from evaluator import evaluate_command
from typing import List, Dict
import readline # For autocompletion
import os
import glob
import json # For caching
import time # For cache timestamp

# ANSI escape codes for colors
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m' # For hints or warnings
    RED = '\033[91m'    # For errors or incorrect answers
    ENDC = '\033[0m'    # Resets color
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    CYAN = '\033[96m'   # For stdout/stderr distinctions

# --- Autocompletion Setup ---
COMMAND_KEYWORDS = ['hint', 'skip', 'quit']
PATH_EXECUTABLES: List[str] = [] # Type hint for clarity
PATH_CACHE_FILE = ".path_executables_cache.json"
CACHE_MAX_AGE_SECONDS = 24 * 60 * 60  # 1 day

def load_path_executables_from_cache() -> List[str] | None:
    """Tries to load path executables from the cache file."""
    if os.path.exists(PATH_CACHE_FILE):
        try:
            with open(PATH_CACHE_FILE, 'r') as f:
                cache_data: Dict[str, any] = json.load(f)
            timestamp = cache_data.get("timestamp", 0)
            if time.time() - timestamp < CACHE_MAX_AGE_SECONDS:
                print(f"{Colors.YELLOW}Loading PATH executables from cache...{Colors.ENDC}")
                return cache_data.get("executables", [])
            else:
                print(f"{Colors.YELLOW}PATH cache expired. Re-scanning...{Colors.ENDC}")
        except (json.JSONDecodeError, IOError) as e:
            print(f"{Colors.RED}Error reading PATH cache: {e}. Re-scanning...{Colors.ENDC}")
    return None

def save_path_executables_to_cache(executables: List[str]):
    """Saves the list of executables to the cache file with a timestamp."""
    cache_data = {
        "timestamp": time.time(),
        "executables": executables
    }
    try:
        with open(PATH_CACHE_FILE, 'w') as f:
            json.dump(cache_data, f)
        print(f"{Colors.YELLOW}Saved PATH executables to cache.{Colors.ENDC}")
    except IOError as e:
        print(f"{Colors.RED}Error saving PATH cache: {e}{Colors.ENDC}")

def update_path_executables():
    """Updates the list of PATH executables, using a cache if available."""
    global PATH_EXECUTABLES
    cached_executables = load_path_executables_from_cache()
    if cached_executables is not None:
        PATH_EXECUTABLES = cached_executables
        return

    print(f"{Colors.YELLOW}Scanning PATH for executables (this might take a moment on first run)...{Colors.ENDC}")
    found_executables = []
    paths = os.environ.get('PATH', '').split(os.pathsep)
    for path_dir in paths:
        try:
            for item in os.listdir(path_dir):
                item_path = os.path.join(path_dir, item)
                if not os.path.isdir(item_path) and os.access(item_path, os.X_OK):
                    found_executables.append(item)
        except OSError:
            continue # Ignore errors like permission denied
    PATH_EXECUTABLES = sorted(list(set(found_executables))) # Unique and sorted
    save_path_executables_to_cache(PATH_EXECUTABLES)
    print(f"{Colors.YELLOW}Finished scanning PATH.{Colors.ENDC}")

# Call once at the start
update_path_executables()

CURRENT_TASK_WORKING_DIR = "."

def path_completer(text, state):
    line_buffer = readline.get_line_buffer()
    begidx = readline.get_begidx()
    endidx = readline.get_endidx()

    # The text readline is trying to complete (e.g., "s" in "data/s")
    # `text` parameter is exactly this.

    # Determine if we are completing the command or an argument
    is_command_completion = (line_buffer[:begidx].strip() == "")

    options = []

    # print(f"\nDebug: text='{text}', line='{line_buffer}', begidx={begidx}, endidx={endidx}, is_cmd={is_command_completion}")

    if is_command_completion:
        combined_options = COMMAND_KEYWORDS + PATH_EXECUTABLES
        options = [cmd for cmd in combined_options if cmd.startswith(text)]
    else:
        # Argument completion
        # directory_prefix is the part of the path before `text` (e.g., "data/" if input is "data/s")
        # It's the content of the line from the start of this argument up to begidx, excluding `text` itself.
        
        # Find the start of the current argument being typed
        current_arg_start_idx = 0
        # Iterate backwards from begidx-1 to find a space or beginning of command part
        temp_idx = begidx -1
        while temp_idx >=0:
            if line_buffer[temp_idx] == ' ':
                current_arg_start_idx = temp_idx + 1
                break
            temp_idx -=1
        else: # If no space found before, it means this arg started right after the command
             # This needs to be smarter, assume for now first space delimits cmd from first arg
            if ' ' in line_buffer:
                 current_arg_start_idx = line_buffer.find(' ') + 1
                 while current_arg_start_idx < len(line_buffer) and line_buffer[current_arg_start_idx] == ' ': # skip multiple spaces
                      current_arg_start_idx += 1
            else: # No spaces at all, this case should be command_completion
                 current_arg_start_idx = 0


        # The full text of the argument being typed, up to the cursor
        full_argument_text = line_buffer[current_arg_start_idx:endidx]
        
        # The directory part of what the user has typed for this argument
        # e.g. if user typed "cat some/dir/partialfile" and `text` is "partialfile",
        # `typed_dir_path` should be "some/dir/"
        typed_dir_path = ""
        if os.sep in full_argument_text:
            # If `text` is what readline is completing, then `line_buffer[begidx-len(text):begidx]` is wrong.
            # We need `line_buffer[current_arg_start_idx : begidx]` which is the prefix of the current word.
             typed_dir_path = os.path.dirname(line_buffer[current_arg_start_idx:begidx] + text) # Add text to get full path context for dirname
             if not typed_dir_path.endswith(os.sep) and typed_dir_path: # ensure trailing slash if not root
                 typed_dir_path += os.sep
        
        # if text is "s" and line is "cat data/s", typed_dir_path should be "data/"
        # if text is "s" and line is "cat s", typed_dir_path should be ""
        
        # Let's refine typed_dir_path:
        # It's the portion of the current argument *before* the `text` that readline is completing.
        prefix_of_current_text = line_buffer[current_arg_start_idx:begidx]


        # Base directory to search for files/subdirectories
        # If prefix_of_current_text is "data/", search_in_dir is "data/"
        # If prefix_of_current_text is "", search_in_dir is "." (relative to CURRENT_TASK_WORKING_DIR)
        search_in_dir_relative_to_task_wd = prefix_of_current_text
        
        # Absolute path for os.listdir
        abs_search_dir = os.path.abspath(os.path.join(CURRENT_TASK_WORKING_DIR, search_in_dir_relative_to_task_wd))
        
        # print(f"  ArgDebug: text='{text}', prefix_curr_text='{prefix_of_current_text}', search_in_rel='{search_in_dir_relative_to_task_wd}', abs_search='{abs_search_dir}'")

        if os.path.isdir(abs_search_dir):
            try:
                for item in os.listdir(abs_search_dir):
                    if item.startswith(text): # `text` is what readline wants to complete (e.g., "s")
                        # We must return what completes `text`.
                        # If item is "sample_doc.txt", this matches "s".
                        
                        # Check if the item is a directory to add a slash
                        # The path to check for isdir must be relative to where os.listdir was called
                        path_to_check_isdir = os.path.join(abs_search_dir, item)
                        if os.path.isdir(path_to_check_isdir):
                            options.append(item + os.sep)
                        else:
                            options.append(item)
            except OSError: # e.g., permission denied
                pass

        # Offer keywords if text is simple (no path separators)
        if not os.sep in text:
            options.extend([kw for kw in COMMAND_KEYWORDS if kw.startswith(text) and kw not in options])

    try:
        return options[state]
    except IndexError:
        return None

if 'libedit' in readline.__doc__:
    readline.parse_and_bind("bind ^I rl_complete")
else:
    readline.parse_and_bind("tab: complete")
readline.set_completer(path_completer)

def setup_task_environment(task: Task):
    """Sets up the environment for a given task, e.g., creating files."""
    if not task.setup_files:
        return

    print(f"{Colors.YELLOW}Setting up task environment...{Colors.ENDC}")
    for setup_action in task.setup_files:
        action = setup_action.get("action")
        path = setup_action.get("path")
        content = setup_action.get("content", "") # Default to empty content

        if action == "create_file":
            if not path:
                print(f"{Colors.RED}Error in task setup: 'create_file' action missing 'path'.{Colors.ENDC}")
                continue
            try:
                # Ensure parent directory exists
                dir_name = os.path.dirname(path)
                if dir_name: # If path includes a directory
                    os.makedirs(dir_name, exist_ok=True)
                
                with open(path, 'w') as f:
                    f.write(content)
                print(f"{Colors.GREEN}  Created file: {path}{Colors.ENDC}")
            except IOError as e:
                print(f"{Colors.RED}  Error creating file {path}: {e}{Colors.ENDC}")
        # Add more setup actions here if needed in the future (e.g., delete_file, create_dir)
        else:
            print(f"{Colors.YELLOW}  Unknown setup action '{action}' for path '{path}'. Skipping.{Colors.ENDC}")
    print(f"{Colors.YELLOW}Task environment setup complete.{Colors.ENDC}")

def display_task(task: Task):
    """Displays the task information to the user with colors."""
    global CURRENT_TASK_WORKING_DIR
    CURRENT_TASK_WORKING_DIR = task.input_details.get("working_directory", ".")
    if not os.path.isdir(CURRENT_TASK_WORKING_DIR):
        print(f"{Colors.YELLOW}Warning: Task working directory '{CURRENT_TASK_WORKING_DIR}' not found. Autocompletion will use current directory ('.').{Colors.ENDC}")
        CURRENT_TASK_WORKING_DIR = "."

    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*40}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}TASK: {task.title}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*40}{Colors.ENDC}")
    print(f"{Colors.BLUE}Description: {task.description}{Colors.ENDC}")
    if task.input_details.get("required_files_for_task"):
        print(f"{Colors.BLUE}Relevant file(s): {Colors.YELLOW}{', '.join(task.input_details['required_files_for_task'])}{Colors.ENDC}")
    print(f"{Colors.BLUE}{'-'*(len(task.description) if len(task.description) < 40 else 40)}{Colors.ENDC}")

def run_practice_session():
    """Main function to run the command-line practice session."""
    print(f"{Colors.GREEN}{Colors.BOLD}Welcome to the Command-Line Practice Tool!{Colors.ENDC}")
    all_tasks = load_all_tasks()

    if not all_tasks:
        print(f"{Colors.RED}No tasks found. Please add some task files to the 'tasks' directory.{Colors.ENDC}")
        return

    # --- Difficulty Selection ---
    available_difficulties = sorted(list(set(task.difficulty for task in all_tasks if task.difficulty)))
    prompt_options = ["all"] + available_difficulties
    difficulty_choice = ""

    while True:
        print(f"\n{Colors.HEADER}Select a difficulty level to practice:{Colors.ENDC}")
        for i, level in enumerate(prompt_options):
            print(f"  {Colors.YELLOW}{i + 1}. {level.capitalize()}{Colors.ENDC}")
        
        try:
            choice_input = input(f"{Colors.YELLOW}Enter number or name (e.g., '1' or 'all'): {Colors.ENDC}").strip().lower()
            if not choice_input:
                raise ValueError("Input cannot be empty.")

            selected_level = ""
            if choice_input.isdigit():
                choice_idx = int(choice_input) - 1
                if 0 <= choice_idx < len(prompt_options):
                    selected_level = prompt_options[choice_idx]
                else:
                    print(f"{Colors.RED}Invalid number choice. Please try again.{Colors.ENDC}")
                    continue
            elif choice_input in prompt_options:
                selected_level = choice_input
            else:
                print(f"{Colors.RED}Invalid difficulty name. Please choose from the list.{Colors.ENDC}")
                continue
            
            difficulty_choice = selected_level
            break
        except ValueError as e:
            print(f"{Colors.RED}Invalid input: {e}. Please enter a valid number or name.{Colors.ENDC}")

    tasks: List[Task] = []
    if difficulty_choice == "all":
        tasks = all_tasks
    else:
        tasks = [task for task in all_tasks if task.difficulty == difficulty_choice]

    if not tasks:
        print(f"{Colors.RED}No tasks found for the selected difficulty '{difficulty_choice.capitalize()}'. Exiting.{Colors.ENDC}")
        # Optionally, you could load all tasks or re-prompt here
        # For now, just exiting if no tasks match.
        return
    
    print(f"{Colors.GREEN}Starting session with {len(tasks)} {difficulty_choice.capitalize()} task(s)...{Colors.ENDC}")
    # --- End Difficulty Selection ---

    current_task_index = 0
    hint_level = 0
    user_command = "" # Initialize user_command

    # --- Score Tracking Initialization ---
    session_tasks_attempted = 0
    session_tasks_correct = 0
    session_tasks_correct_first_try = 0
    # For more detailed tracking, you could store IDs of completed tasks
    # completed_task_ids_session = set()
    # --- End Score Tracking Initialization ---

    while current_task_index < len(tasks):
        task = tasks[current_task_index]
        current_task_attempts = 0 # Track attempts for this specific task
        # Only increment session_tasks_attempted once per task when the user first sees it or makes an attempt.
        # For simplicity, let's count an attempt when they submit their first command for this task instance.
        # A more precise way would be upon first display, but this is fine.
        
        setup_task_environment(task)
        display_task(task)

        while True: # Inner loop for retrying the current task
            prompt_text = task.input_details.get("prompt_for_command", "Enter your command:")
            if current_task_attempts == 0: # First attempt for this task
                user_command = input(f"\n{Colors.YELLOW}{prompt_text}{Colors.ENDC}\n{Colors.YELLOW}(Type 'hint', 'skip', or 'quit'){Colors.ENDC}\n> ")
            else: # Subsequent attempts
                user_command = input(f"\n{Colors.YELLOW}Try again or type 'hint', 'skip', 'quit':{Colors.ENDC}\n> ")

            if current_task_attempts == 0: # First actual command submitted for this task
                session_tasks_attempted +=1

            current_task_attempts += 1

            if user_command.lower().strip() == 'quit':
                print(f"{Colors.GREEN}Thanks for practicing! Exiting.{Colors.ENDC}")
                # Display final score before breaking out of everything
                break # Breaks inner (retry) loop
            elif user_command.lower().strip() == 'skip':
                print(f"{Colors.YELLOW}Skipping task.{Colors.ENDC}")
                current_task_index += 1
                hint_level = 0
                break # Breaks inner (retry) loop, advances to next task
            elif user_command.lower().strip() == 'hint':
                if task.hints:
                    if hint_level < len(task.hints):
                        print(f"{Colors.GREEN}Hint ({hint_level + 1}/{len(task.hints)}): {task.hints[hint_level]}{Colors.ENDC}")
                        hint_level += 1
                    else:
                        print(f"{Colors.YELLOW}No more hints available for this task.{Colors.ENDC}")
                else:
                    print(f"{Colors.YELLOW}No hints available for this task.{Colors.ENDC}")
                # Doesn't count as a task attempt for scoring, user gets another chance to input command
                current_task_attempts -=1 # Decrement because hint is not an attempt at solution
                session_tasks_attempted -=1 # Also decrement session attempts if this was the first action
                continue # Continues inner (retry) loop, re-prompts for command

            is_correct, actual_stdout, actual_stderr = evaluate_command(user_command, task)

            print(f"\n{Colors.BOLD}--- Output ---{Colors.ENDC}")
            if actual_stdout:
                print(f"{Colors.CYAN}Stdout:{Colors.ENDC}")
                print(actual_stdout)
            if actual_stderr:
                print(f"{Colors.RED}Stderr:{Colors.ENDC}")
                print(actual_stderr)
            print(f"{Colors.BOLD}--------------{Colors.ENDC}")

            if is_correct:
                print(f"\n{Colors.GREEN}{Colors.BOLD}Correct! Well done.{Colors.ENDC}")
                session_tasks_correct += 1
                if current_task_attempts == 1:
                    session_tasks_correct_first_try += 1
                    print(f"{Colors.GREEN}{Colors.BOLD}Solved on the first try!{Colors.ENDC}")
                # completed_task_ids_session.add(task.id)
                current_task_index += 1
                hint_level = 0
                input(f"{Colors.GREEN}Press Enter to continue to the next task...{Colors.ENDC}")
                break # Breaks inner (retry) loop, advances to next task
            else:
                print(f"\n{Colors.RED}{Colors.BOLD}Incorrect. Please try again.{Colors.ENDC}")
                # User will be prompted by the 'Try again or type...' input at the start of the inner loop
                # No need for specific retry/skip/quit here as the main input handles it.
        
        if user_command.lower().strip() == 'quit': # If quit was chosen, break outer (tasks) loop too
            break
                
    if current_task_index >= len(tasks) and (not user_command or user_command.lower().strip() != 'quit'):
        print(f"\n{Colors.GREEN}{Colors.BOLD}Congratulations! You've completed all available tasks for this session.{Colors.ENDC}")

    # --- Display Session Score --- 
    print(f"\n{Colors.HEADER}{Colors.BOLD}--- Session Summary ---{Colors.ENDC}")
    total_tasks_in_selection = len(tasks)
    print(f"{Colors.BLUE}Difficulty selected: {difficulty_choice.capitalize()}{Colors.ENDC}")
    print(f"{Colors.BLUE}Total tasks in this selection: {total_tasks_in_selection}{Colors.ENDC}")
    print(f"{Colors.GREEN}Tasks attempted: {session_tasks_attempted}{Colors.ENDC}")
    print(f"{Colors.GREEN}Tasks solved correctly: {session_tasks_correct}{Colors.ENDC}")
    print(f"{Colors.GREEN}Tasks solved on the first try: {session_tasks_correct_first_try}{Colors.ENDC}")
    # Potential simple score:
    score = (session_tasks_correct_first_try * 10) + ((session_tasks_correct - session_tasks_correct_first_try) * 5)
    print(f"{Colors.GREEN}Your score for this session: {score}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}-----------------------{Colors.ENDC}")

if __name__ == "__main__":
    try:
        run_practice_session()
    finally:
        print(Colors.ENDC)
