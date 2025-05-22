import json
import os
from typing import List, Dict, Any

TASKS_DIR = "tasks"

class Task:
    def __init__(self, id: str, title: str, description: str, command_to_practice: str,
                 example_solution: str, setup_files: List[Dict[str, str]],
                 input_details: Dict[str, Any], evaluation: Dict[str, Any],
                 hints: List[str]):
        self.id = id
        self.title = title
        self.description = description
        self.command_to_practice = command_to_practice
        self.example_solution = example_solution
        self.setup_files = setup_files
        self.input_details = input_details
        self.evaluation = evaluation
        self.hints = hints

    def __repr__(self) -> str:
        return f"<Task id='{self.id}' title='{self.title}'>"

def load_task_from_file(filepath: str) -> Task | None:
    """Loads a single task from a JSON file."""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        return Task(**data)
    except FileNotFoundError:
        print(f"Error: Task file not found at {filepath}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {filepath}")
        return None
    except TypeError as e: # Catches errors if JSON keys don't match Task constructor
        print(f"Error: Missing or mismatched keys in JSON file {filepath}. Details: {e}")
        return None

def load_all_tasks(tasks_directory: str = TASKS_DIR) -> List[Task]:
    """Loads all tasks from JSON files in the specified directory."""
    all_tasks: List[Task] = []
    if not os.path.isdir(tasks_directory):
        print(f"Error: Tasks directory not found at {tasks_directory}")
        return all_tasks

    for filename in os.listdir(tasks_directory):
        if filename.endswith(".json"):
            filepath = os.path.join(tasks_directory, filename)
            task = load_task_from_file(filepath)
            if task:
                all_tasks.append(task)
    return all_tasks

if __name__ == '__main__':
    # Example usage:
    tasks = load_all_tasks()
    if tasks:
        print(f"Successfully loaded {len(tasks)} tasks:")
        for task_item in tasks:
            print(f"  - {task_item.title} (ID: {task_item.id})")
            print(f"    Description: {task_item.description}")
            print(f"    Command to practice: {task_item.command_to_practice}")
            # print(f"    Example solution: {task_item.example_solution}")
            # print(f"    Setup files: {task_item.setup_files}")
            # print(f"    Input details: {task_item.input_details}")
            # print(f"    Evaluation: {task_item.evaluation}")
            # print(f"    Hints: {task_item.hints}")
            if task_item.setup_files:
                print("    Requires setup files.")
            if task_item.evaluation.get('method') == 'contains_substring':
                 print(f"    Evaluation method: contains_substring - expects: {task_item.evaluation.get('expected_stdout_substrings')}")
            elif task_item.evaluation.get('method') == 'exact_match':
                 print(f"    Evaluation method: exact_match - expects: \n'''{task_item.evaluation.get('expected_stdout')}'''")


    else:
        print("No tasks were loaded.")

    print("\nTesting a specific task load:")
    specific_task = load_task_from_file(os.path.join(TASKS_DIR, "grep_avonturen_01.json"))
    if specific_task:
        print(f"Successfully loaded specific task: {specific_task.title}")
    else:
        print("Failed to load specific task.")

    print("\nTesting a non-existent task file:")
    non_existent_task = load_task_from_file(os.path.join(TASKS_DIR, "non_existent_task.json"))
    if not non_existent_task:
        print("Correctly handled non-existent task file.")

    print("\nTesting a task file with invalid JSON (if one exists, create manually for test):")
    # To test this, you would manually create an invalid JSON file in tasks/ e.g., invalid_task.json
    # invalid_task_test = load_task_from_file(os.path.join(TASKS_DIR, "invalid_task.json"))
    # if not invalid_task_test:
    #     print("Correctly handled invalid JSON task file (if tested).")

