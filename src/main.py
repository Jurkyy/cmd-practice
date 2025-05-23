if __name__ == "__main__" and (__package__ is None or __package__ == ''):
    import sys
    import os
    # Get the absolute path to the directory containing this file (src/)
    current_file_dir = os.path.dirname(os.path.abspath(__file__))
    # Get the absolute path to the parent directory (the project root)
    project_root = os.path.dirname(current_file_dir)
    # Add the project root to sys.path, so 'src' can be imported as a package
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    # Set __package__ to tell Python that this module is part of the 'src' package
    __package__ = "src"

from .task_loader import load_all_tasks, Task
from .evaluator import evaluate_command, execute_command
from typing import List, Dict
import readline # For autocompletion
import os
import glob
import json # For caching
import time # For cache timestamp
import random # For shuffling tasks

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
COMMAND_KEYWORDS = ['hint', 'skip', 'quit', 'show', 'help', 'answer']
PATH_EXECUTABLES: List[str] = [] # Type hint for clarity
PATH_CACHE_FILE = ".path_executables_cache.json"
CACHE_MAX_AGE_SECONDS = 24 * 60 * 60  # 1 day

HIGHSCORE_FILE = "highscores.json"
MAN_PAGES_FILE = "man_pages.json" # Added constant

MAN_PAGES_DATA: Dict[str, str] = {} # Added global for man page data

def load_man_pages():
    """Loads man page information from the JSON file."""
    global MAN_PAGES_DATA
    if not os.path.exists(MAN_PAGES_FILE):
        print(f"{Colors.RED}Man pages file '{MAN_PAGES_FILE}' not found.{Colors.ENDC}")
        MAN_PAGES_DATA = {}
        return

    try:
        with open(MAN_PAGES_FILE, 'r') as f:
            MAN_PAGES_DATA = json.load(f)
        # print(f"{Colors.YELLOW}Man pages loaded successfully.{Colors.ENDC}") # Optional: for debugging
    except (json.JSONDecodeError, IOError) as e:
        print(f"{Colors.RED}Error loading man pages: {e}. Man command might not work as expected.{Colors.ENDC}")
        MAN_PAGES_DATA = {}

def load_highscores() -> Dict[str, int]:
    """Loads highscores from the JSON file."""
    if not os.path.exists(HIGHSCORE_FILE):
        return {}
    try:
        with open(HIGHSCORE_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"{Colors.RED}Error loading highscores: {e}. Starting with empty scores.{Colors.ENDC}")
        return {}

def save_highscore(user: str, score: int):
    """Saves or updates a user's highscore."""
    scores = load_highscores()
    # Update score only if it's higher or user doesn't exist
    if score > scores.get(user, -1):
        scores[user] = score
        try:
            with open(HIGHSCORE_FILE, 'w') as f:
                json.dump(scores, f, indent=4)
            print(f"{Colors.GREEN}Highscore for {user} saved!{Colors.ENDC}")
        except IOError as e:
            print(f"{Colors.RED}Error saving highscore: {e}{Colors.ENDC}")

def display_highscores():
    """Displays the top 5 highscores."""
    scores = load_highscores()
    if not scores:
        print(f"{Colors.YELLOW}No highscores recorded yet.{Colors.ENDC}")
        return

    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*15} TOP HIGHSCORES {'='*14}{Colors.ENDC}")
    # Sort scores by value in descending order
    sorted_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    
    for i, (user, score) in enumerate(sorted_scores[:5]): # Display top 5
        print(f"{Colors.CYAN}{i+1}. {user:<20} {score:>5} points{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*40}{Colors.ENDC}")

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
load_man_pages() # Call to load man pages

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
    """Sets up the environment for a given task, e.g., creating files and directories."""
    if not task.setup_files:
        return

    print(f"{Colors.YELLOW}Setting up task environment...{Colors.ENDC}")
    
    base_working_dir = task.input_details.get("working_directory", ".")
    try:
        if base_working_dir != ".": # Avoid creating the current directory if it's "."
            os.makedirs(base_working_dir, exist_ok=True)
            print(f"{Colors.BLUE}  Ensured base working directory exists: {base_working_dir}{Colors.ENDC}")
    except OSError as e:
        print(f"{Colors.RED}  Error creating base working directory {base_working_dir}: {e}. Setup might fail.{Colors.ENDC}")
        # Decide if we should return or try to continue
        # For now, let's try to continue, individual file/dir ops will show further errors.

    for setup_action in task.setup_files:
        action = setup_action.get("action")
        relative_path = setup_action.get("path") # Path relative to working_directory
        content = setup_action.get("content", "")

        if not relative_path:
            print(f"{Colors.RED}Error in task setup: Action '{action}' missing 'path'. Skipping.{Colors.ENDC}")
            continue
            
        # Construct the full path using the task's working directory
        full_path = os.path.join(base_working_dir, relative_path)

        if action == "create_file":
            try:
                # Ensure parent directory of the file exists
                dir_name = os.path.dirname(full_path)
                if dir_name:
                    os.makedirs(dir_name, exist_ok=True)
                
                with open(full_path, 'w') as f:
                    f.write(content)
                print(f"{Colors.GREEN}  Created/Overwritten file: {full_path}{Colors.ENDC}")
            except IOError as e:
                print(f"{Colors.RED}  Error creating/writing file {full_path}: {e}{Colors.ENDC}")
            except OSError as e: # Catch potential errors from makedirs for file's parent
                print(f"{Colors.RED}  Error ensuring directory for file {full_path}: {e}{Colors.ENDC}")

        elif action == "create_directory":
            try:
                os.makedirs(full_path, exist_ok=True)
                print(f"{Colors.GREEN}  Ensured directory: {full_path}{Colors.ENDC}")
            except OSError as e:
                print(f"{Colors.RED}  Error creating directory {full_path}: {e}{Colors.ENDC}")
        else:
            print(f"{Colors.YELLOW}  Unknown setup action '{action}' for path '{relative_path}'. Skipping.{Colors.ENDC}")
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
    display_highscores() # Display highscores at the start
    all_tasks = load_all_tasks()

    if not all_tasks:
        print(f"{Colors.RED}No tasks found. Please add some task files to the 'tasks' directory.{Colors.ENDC}")
        return

    # --- Command Selection ---
    def get_task_individual_commands(command_str: str) -> List[str]:
        if not command_str:
            return []
        # Split by comma, strip whitespace from each part, filter out empty strings, then unique and sort.
        return sorted(list(set(c.strip() for c in command_str.split(',') if c.strip())))

    all_unique_individual_commands = set()
    if all_tasks:
        for task in all_tasks:
            for cmd_part in get_task_individual_commands(task.command_to_practice):
                all_unique_individual_commands.add(cmd_part)
    
    # This is the list of unique individual commands like ["awk", "find", "grep", "ls", "mv", ...]
    available_individual_commands = sorted(list(all_unique_individual_commands))
    
    selected_commands_list: List[str] = [] # Stores user's chosen *individual* commands
    filter_by_all_commands = False

    if available_individual_commands:
        while True:
            print(f"\n{Colors.HEADER}Select command(s) to practice (optional):{Colors.ENDC}")
            
            command_task_counts_display = {"all": len(all_tasks)}
            for ind_cmd in available_individual_commands:
                count = 0
                for task in all_tasks:
                    if ind_cmd in get_task_individual_commands(task.command_to_practice):
                        count += 1
                command_task_counts_display[ind_cmd] = count

            # options_display will be like ["all", "awk", "find", "grep", ...]
            options_display = ["all"] + available_individual_commands
            for i, cmd_option_disp in enumerate(options_display):
                count = command_task_counts_display[cmd_option_disp]
                print(f"  {Colors.YELLOW}{i + 1}. {cmd_option_disp.capitalize()} ({count} task{'s' if count != 1 else ''}){Colors.ENDC}")
            
            try:
                choice_input_str = input(f"{Colors.YELLOW}Enter numbers or names, comma-separated (e.g., '1,3' or 'grep,find', 'all', or press Enter for all): {Colors.ENDC}").strip().lower()
                
                if not choice_input_str or choice_input_str == "all":
                    filter_by_all_commands = True
                    selected_commands_list = [] 
                    break

                choices_from_input = [c.strip() for c in choice_input_str.split(',') if c.strip()]
                if not choices_from_input: # Handles input like "," or just spaces leading to no valid parts
                    filter_by_all_commands = True # Treat as pressing Enter
                    selected_commands_list = []
                    break

                current_selection_valid = True
                temp_selected_individual_commands: List[str] = []

                for choice_part in choices_from_input:
                    command_found_for_part = False
                    if choice_part.isdigit():
                        choice_idx = int(choice_part) - 1
                        if 0 <= choice_idx < len(options_display):
                            selected_name_from_option = options_display[choice_idx] # This is an individual command or "all"
                            if selected_name_from_option == "all": 
                                filter_by_all_commands = True
                                temp_selected_individual_commands = [] 
                                break # Break from choice_part loop, outer will break due to filter_by_all_commands
                            if selected_name_from_option not in temp_selected_individual_commands:
                                temp_selected_individual_commands.append(selected_name_from_option)
                            command_found_for_part = True
                        else:
                            print(f"{Colors.RED}Invalid number choice: {choice_part}.{Colors.ENDC}")
                            current_selection_valid = False; break 
                    else: # It's a name (should be an individual command name)
                        if choice_part in available_individual_commands: # Exact match
                            if choice_part not in temp_selected_individual_commands:
                                temp_selected_individual_commands.append(choice_part)
                            command_found_for_part = True
                        else: # Try prefix matching against available_individual_commands
                            possible_matches = [ind_cmd for ind_cmd in available_individual_commands if ind_cmd.startswith(choice_part)]
                            if len(possible_matches) == 1:
                                matched_cmd = possible_matches[0]
                                print(f"{Colors.YELLOW}Interpreted '{choice_part}' as '{matched_cmd}'.{Colors.ENDC}")
                                if matched_cmd not in temp_selected_individual_commands:
                                    temp_selected_individual_commands.append(matched_cmd)
                                command_found_for_part = True
                            elif len(possible_matches) > 1:
                                print(f"{Colors.RED}Ambiguous command '{choice_part}'. Matches: {', '.join(possible_matches)}. Please be more specific or use numbers.{Colors.ENDC}")
                                current_selection_valid = False; break
                            else: 
                                print(f"{Colors.RED}Invalid command name: '{choice_part}'. Not found in the list of individual commands.{Colors.ENDC}")
                                current_selection_valid = False; break
                
                if filter_by_all_commands: break # Exit while loop if "all" was chosen

                if current_selection_valid and temp_selected_individual_commands:
                    selected_commands_list = sorted(list(set(temp_selected_individual_commands))) 
                    break # Exit while loop with valid selections
                elif current_selection_valid and not temp_selected_individual_commands: 
                    # This case should be rare if choices_from_input was not empty but all parts were invalid
                    print(f"{Colors.RED}No valid commands selected. Please try again or press Enter for all.{Colors.ENDC}")
                # If not current_selection_valid, error was already printed, loop continues.
            except ValueError: 
                print(f"{Colors.RED}Invalid input format. Please enter numbers or command names, comma-separated.{Colors.ENDC}")
    else: # No available_individual_commands from tasks at all
        filter_by_all_commands = True 

    # Task Filtering Logic
    filtered_by_command_tasks: List[Task] = []
    command_display_name = "All Commands" 

    if filter_by_all_commands or not selected_commands_list: # If "all" or no specific commands were effectively chosen
        filtered_by_command_tasks = all_tasks
        # command_display_name remains "All Commands"
    else:
        temp_filtered_list = []
        for task in all_tasks:
            task_inds = get_task_individual_commands(task.command_to_practice)
            # Include task if any of its individual commands are in the user's selected list
            if any(sel_cmd in task_inds for sel_cmd in selected_commands_list):
                temp_filtered_list.append(task)
        filtered_by_command_tasks = temp_filtered_list
        if selected_commands_list: # Ensure display name is updated only if there are selections
             command_display_name = ", ".join([cmd.capitalize() for cmd in selected_commands_list])

    if not filtered_by_command_tasks:
        if filter_by_all_commands or not selected_commands_list : # No specific filter applied or filter yielded nothing from all_tasks
             print(f"{Colors.RED}No tasks found at all. Please check the 'tasks' directory or your filter.{Colors.ENDC}")
        else: # Specific commands were selected, but no tasks matched them
             print(f"{Colors.RED}No tasks found for the selected command(s): {command_display_name}. Exiting.{Colors.ENDC}")
        return
    # --- End Command Selection ---

    # --- Difficulty Selection ---
    available_difficulties = sorted(list(set(task.difficulty for task in filtered_by_command_tasks if task.difficulty)))
    
    # Define the desired order for difficulties
    difficulty_order = ["easy", "medium", "hard"]
    
    # Sort available_difficulties according to difficulty_order
    # Start with levels that are in our defined order
    custom_sorted_difficulties = [d for d in difficulty_order if d in available_difficulties]
    # Add any other difficulties not in our predefined order (e.g., if a new one was added to a task file)
    # These will be appended at the end, sorted alphabetically among themselves.
    for d in available_difficulties:
        if d not in custom_sorted_difficulties:
            custom_sorted_difficulties.append(d)
            
    prompt_options = ["all"] + custom_sorted_difficulties
    difficulty_choice = ""

    while True:
        print(f"\n{Colors.HEADER}Select a difficulty level to practice (for command(s): {command_display_name}):{Colors.ENDC}")
        # Calculate task counts for each difficulty based on already filtered tasks
        task_counts = {"all": len(filtered_by_command_tasks)}
        for diff_level in custom_sorted_difficulties:
            task_counts[diff_level] = sum(1 for task in filtered_by_command_tasks if task.difficulty == diff_level)

        for i, level in enumerate(prompt_options):
            count = task_counts.get(level, 0) # Use .get for safety if a difficulty level has 0 tasks after command filtering
            print(f"  {Colors.YELLOW}{i + 1}. {level.capitalize()} ({count} task{'s' if count != 1 else ''}){Colors.ENDC}")
        
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
        tasks = filtered_by_command_tasks # Use command-filtered tasks
    else:
        tasks = [task for task in filtered_by_command_tasks if task.difficulty == difficulty_choice]

    if not tasks:
        print(f"{Colors.RED}No tasks found for the selected command(s) '{command_display_name}' and difficulty '{difficulty_choice.capitalize()}'. Exiting.{Colors.ENDC}")
        return
    
    random.shuffle(tasks) # Randomize the order of the selected tasks
    
    print(f"{Colors.GREEN}Starting session with {len(tasks)} task(s) (Command(s): {command_display_name}, Difficulty: {difficulty_choice.capitalize()})...{Colors.ENDC}")
    # --- End Difficulty Selection ---

    # Initialize session statistics
    session_stats = {
        "tasks_attempted": 0,
        "tasks_correct": 0,
        "tasks_correct_first_try": 0,
        "total_hints_used": 0,
        "total_attempts_overall": 0, # Counts each command run
        "commands_practiced": set(),
        "difficulties_attempted": {}, # e.g. {"easy": {"correct": 1, "total": 2}}
        "session_start_time": time.time()
    }
    user_name = input(f"{Colors.YELLOW}Enter your name for this session: {Colors.ENDC}").strip()
    if not user_name:
        user_name = "Anonymous"

    current_task_index = 0
    hint_level = 0
    user_command = "" # Initialize user_command

    while current_task_index < len(tasks):
        task = tasks[current_task_index]
        current_task_attempts = 0 # Track attempts for this specific task
        # Only increment session_tasks_attempted once per task when the user first sees it or makes an attempt.
        # For simplicity, let's count an attempt when they submit their first command for this task instance.
        # A more precise way would be upon first display, but this is fine.
        
        setup_task_environment(task)
        display_task(task)

        while True: # Inner loop for retrying the current task
            prompt_text = task.input_details.get("prompt_for_command", "Enter your command")
            if current_task_attempts == 0: # First attempt for this task
                user_command = input(f"\n{Colors.YELLOW}{prompt_text} (or type 'help'):{Colors.ENDC}\n> ")
            else: # Subsequent attempts
                user_command = input(f"\n{Colors.YELLOW}Try again (or type 'help'):{Colors.ENDC}\n> ")

            if current_task_attempts == 0: # First actual command submitted for this task
                session_stats["tasks_attempted"] +=1

            current_task_attempts += 1
            user_command_lower = user_command.lower().strip()

            if user_command_lower == 'quit':
                print(f"{Colors.GREEN}Thanks for practicing! Exiting.{Colors.ENDC}")
                break 
            elif user_command_lower == 'skip':
                print(f"{Colors.YELLOW}Skipping task.{Colors.ENDC}")
                current_task_index += 1
                hint_level = 0
                # Ensure task is marked as attempted but not correct if skipped
                # (Already handled by tasks_attempted incrementing on first command submit)
                # If difficulty tracking is per task, ensure it's also marked for this difficulty
                session_stats["difficulties_attempted"].setdefault(difficulty_choice, {"correct": 0, "total": 0})["total"] = \
                    session_stats["difficulties_attempted"].get(difficulty_choice, {}).get("total", 0) + 1
                break
            elif user_command_lower == 'answer':
                print(f"{Colors.HEADER}{Colors.BOLD}--- Task Answer ---{Colors.ENDC}")
                print(f"{Colors.GREEN}The example solution is: {task.example_solution}{Colors.ENDC}")
                print(f"{Colors.YELLOW}No points awarded for this task.{Colors.ENDC}")
                
                # Update session stats: task attempted, but not correct
                # tasks_attempted is already incremented on first command submission
                # Ensure difficulty tracking reflects an attempt for this difficulty
                session_stats["difficulties_attempted"].setdefault(difficulty_choice, {"correct": 0, "total": 0})["total"] = \
                    session_stats["difficulties_attempted"].get(difficulty_choice, {}).get("total", 0) + 1
                
                current_task_index += 1
                hint_level = 0
                input(f"{Colors.GREEN}Press Enter to continue to the next task...{Colors.ENDC}")
                break # Go to the next task
            elif user_command_lower == 'hint':
                if task.hints:
                    if hint_level < len(task.hints):
                        print(f"{Colors.GREEN}Hint ({hint_level + 1}/{len(task.hints)}): {task.hints[hint_level]}{Colors.ENDC}")
                        hint_level += 1
                    else:
                        print(f"{Colors.YELLOW}No more hints available for this task.{Colors.ENDC}")
                else:
                    print(f"{Colors.YELLOW}No hints available for this task.{Colors.ENDC}")
                current_task_attempts -=1 
                if current_task_attempts < 0: current_task_attempts = 0 # Ensure not negative
                if session_stats["tasks_attempted"] > 0 and current_task_attempts == 0: # if it was the first action and now it's not an attempt
                     session_stats["tasks_attempted"] -=1
                session_stats["total_hints_used"] += 1
                continue 
            elif user_command_lower == 'show':
                print(f"\n{Colors.HEADER}{Colors.BOLD}--- Showing Task Files ---{Colors.ENDC}")
                relevant_files = task.input_details.get("required_files_for_task")
                if relevant_files:
                    files_shown_count = 0
                    for file_path_from_task in relevant_files:
                        # Assume file_path_from_task is relative to CURRENT_TASK_WORKING_DIR
                        # or an absolute path if it starts with os.sep
                        if os.path.isabs(file_path_from_task):
                            full_path = file_path_from_task
                        else:
                            full_path = os.path.join(CURRENT_TASK_WORKING_DIR, file_path_from_task)
                        
                        if os.path.exists(full_path):
                            try:
                                # Check if it's a directory first
                                if os.path.isdir(full_path):
                                    print(f"{Colors.YELLOW}Skipping directory: {file_path_from_task}{Colors.ENDC}")
                                    # Optionally, list directory contents if desired in future
                                    # print(f"{Colors.BLUE}Contents of directory {file_path_from_task}:{Colors.ENDC}")
                                    # for item in os.listdir(full_path):
                                    #     print(f"  {item}")
                                    continue
                                with open(full_path, 'r') as f:
                                    content = f.read()
                                print(f"{Colors.CYAN}File: {file_path_from_task}{Colors.ENDC}")
                                print(f"{Colors.BLUE}{'-'*20}{Colors.ENDC}")
                                print(content.strip()) # .strip() to remove trailing newlines from print
                                print(f"{Colors.BLUE}{'-'*20}{Colors.ENDC}")
                                files_shown_count += 1
                            except IOError as e:
                                print(f"{Colors.RED}Error reading file {file_path_from_task}: {e}{Colors.ENDC}")
                            except Exception as e:
                                print(f"{Colors.RED}An unexpected error occurred while trying to show {file_path_from_task}: {e}{Colors.ENDC}")
                        else:
                            # Check if it was a setup file to show its intended content
                            found_in_setup = False
                            if task.setup_files:
                                for setup_action in task.setup_files:
                                    if setup_action.get("action") == "create_file" and setup_action.get("path") == file_path_from_task:
                                        content = setup_action.get("content", "[No content defined in setup]")
                                        print(f"{Colors.CYAN}File (from setup): {file_path_from_task}{Colors.ENDC}")
                                        print(f"{Colors.BLUE}(Note: This file was expected to be created by the task setup but was not found on disk. Displaying intended content.){Colors.ENDC}")
                                        print(f"{Colors.BLUE}{'-'*20}{Colors.ENDC}")
                                        print(content.strip())
                                        print(f"{Colors.BLUE}{'-'*20}{Colors.ENDC}")
                                        files_shown_count += 1
                                        found_in_setup = True
                                        break
                            if not found_in_setup:
                                print(f"{Colors.YELLOW}File not found: {file_path_from_task} (at {full_path}){Colors.ENDC}")
                    if files_shown_count == 0 and not relevant_files:
                        print(f"{Colors.YELLOW}No specific files are listed as relevant for this task, or they could not be displayed.{Colors.ENDC}")
                    elif files_shown_count == 0 and relevant_files: # Files were listed but none shown (e.g. all were dirs or not found)
                         print(f"{Colors.YELLOW}Could not display any of the relevant files for this task.{Colors.ENDC}")
                else:
                    print(f"{Colors.YELLOW}No specific files are listed as relevant for this task.{Colors.ENDC}")
                print(f"{Colors.HEADER}{Colors.BOLD}------------------------{Colors.ENDC}")
                
                current_task_attempts -=1 
                if current_task_attempts < 0: current_task_attempts = 0
                if session_stats["tasks_attempted"] > 0 and current_task_attempts == 0:
                     session_stats["tasks_attempted"] -=1
                # No need to increment session_stats["total_attempts_overall"] for 'show'
                continue
            elif user_command_lower == 'help':
                print(f"\n{Colors.HEADER}{Colors.BOLD}--- Available Commands ---{Colors.ENDC}")
                print(f"{Colors.CYAN}help{Colors.ENDC}                - Show this help message.")
                print(f"{Colors.CYAN}hint{Colors.ENDC}                - Get a hint for the current task.")
                print(f"{Colors.CYAN}show{Colors.ENDC}                - Show relevant files for the current task.")
                print(f"{Colors.CYAN}answer{Colors.ENDC}              - Show the answer for the current task (no points).")
                print(f"{Colors.CYAN}man <command_name>{Colors.ENDC}  - Show manual page info for a specific command.")
                print(f"{Colors.CYAN}skip{Colors.ENDC}                - Skip the current task.")
                print(f"{Colors.CYAN}quit{Colors.ENDC}                - Exit the practice tool.")
                print(f"{Colors.HEADER}{Colors.BOLD}------------------------{Colors.ENDC}")
                current_task_attempts -=1 
                if current_task_attempts < 0: current_task_attempts = 0
                if session_stats["tasks_attempted"] > 0 and current_task_attempts == 0:
                     session_stats["tasks_attempted"] -=1
                continue
            elif user_command_lower.startswith("man "):
                command_name = user_command.split(" ", 1)[1].strip()
                if command_name in MAN_PAGES_DATA:
                    print(f"\n{Colors.GREEN}{MAN_PAGES_DATA[command_name]}{Colors.ENDC}")
                else:
                    print(f"{Colors.YELLOW}No man page info found for '{command_name}'. Try \'man {command_name}\' in your actual terminal.{Colors.ENDC}")
                current_task_attempts -=1
                if current_task_attempts < 0: current_task_attempts = 0 # Ensure not negative
                if session_stats["tasks_attempted"] > 0 and current_task_attempts == 0: # if it was the first action and now it's not an attempt
                     session_stats["tasks_attempted"] -=1
                session_stats["total_attempts_overall"] += 1
                continue

            # If we reach here, the command is an attempt to solve the task
            session_stats["total_attempts_overall"] += 1

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
                session_stats["tasks_correct"] += 1
                if current_task_attempts == 1:
                    session_stats["tasks_correct_first_try"] += 1
                    print(f"{Colors.GREEN}{Colors.BOLD}Solved on the first try!{Colors.ENDC}")
                session_stats["commands_practiced"].add(user_command)
                session_stats["difficulties_attempted"].setdefault(difficulty_choice, {"correct": 0, "total": 0})["correct"] += 1
                session_stats["difficulties_attempted"].setdefault(difficulty_choice, {"correct": 0, "total": 0})["total"] += 1
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

    # --- Session Summary ---
    session_duration = time.time() - session_stats["session_start_time"]
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*15} SESSION SUMMARY {'='*15}{Colors.ENDC}")
    print(f"{Colors.BLUE}Session duration: {time.strftime('%H:%M:%S', time.gmtime(session_duration))}{Colors.ENDC}")
    print(f"{Colors.BLUE}Tasks attempted: {session_stats['tasks_attempted']}{Colors.ENDC}")
    print(f"{Colors.GREEN}Tasks solved: {session_stats['tasks_correct']}{Colors.ENDC}")
    print(f"{Colors.GREEN}Solved on first try: {session_stats['tasks_correct_first_try']}{Colors.ENDC}")
    print(f"{Colors.YELLOW}Total hints used: {session_stats['total_hints_used']}{Colors.ENDC}")
    print(f"{Colors.CYAN}Total commands run: {session_stats['total_attempts_overall']}{Colors.ENDC}")
    
    if session_stats["tasks_correct"] > 0:
        save_highscore(user_name, session_stats["tasks_correct"]) # Save score based on tasks correct

    print(f"{Colors.BLUE}Commands practiced: {Colors.YELLOW}{', '.join(sorted(list(session_stats['commands_practiced']))) if session_stats['commands_practiced'] else 'None'}{Colors.ENDC}")
    print(f"{Colors.BLUE}Difficulty breakdown:{Colors.ENDC}")
    for difficulty, stats in session_stats["difficulties_attempted"].items():
        print(f"{Colors.BLUE}{difficulty.capitalize()}:")
        print(f"{Colors.BLUE}  Correct: {stats['correct']}")
        print(f"{Colors.BLUE}  Total: {stats['total']}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*40}{Colors.ENDC}")

if __name__ == "__main__":
    try:
        run_practice_session()
    finally:
        print(Colors.ENDC)
