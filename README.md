# Command-Line Practice Tool

## Overview

This project is an interactive command-line tool designed to help users practice and improve their skills with various shell commands. Users are presented with tasks, and they can enter commands to solve them, receiving feedback, hints, and relevant "man page" information. The tool also tracks scores and supports different difficulty levels.

## Features

* **Interactive Tasks**: Practice a variety of commands (e.g., `find`, `grep`, `awk`, `sed`, `ls`, `cut`, `rm`, `ping`, `head`, `tail`, `wc`, `uniq`, `sort`).
* **Task Selection by Command**: Filter and select tasks based on specific commands you want to practice.
* **Difficulty Levels**: Tasks are categorized by difficulty (easy, medium, hard).
* **Hints**: Get hints if you're stuck on a task.
* **Man Page Info**: Access concise "man page" style information for commands using the `man <command>` feature.
* **Setup Files**: Tasks can automatically create necessary files and directory structures.
* **Input Autocompletion**: Basic autocompletion for commands and file paths.
* **Scoring & Highscores**: Tracks tasks attempted, solved, and solved on the first try. Saves highscores per user.
* **Centralized Man Pages**: Man page information is stored in `man_pages.json` for easy updates.
* **Extensible**: Easily add new tasks by creating JSON files in the `tasks/` directory.

## Prerequisites

* Python (3.8 or newer recommended)
* [uv](https://github.com/astral-sh/uv): A fast Python package installer and resolver.
* [direnv](https://direnv.net/): An environment switcher for the shell.

## Setup

1. **Clone the repository (if you haven't already):**

    ```bash
    git clone <your-repository-url>
    cd <your-repository-name>
    ```

2. **Set up the Python environment using `uv`:**
    * Create a virtual environment (if you haven't already):

        ```bash
        uv venv
        ```

    * Install dependencies and the project itself. Your `pyproject.toml` is configured with a `build-system` and `tool.setuptools` to correctly package the `src` directory. `uv` will use `uv.lock` if it exists and is up-to-date with `pyproject.toml`. Otherwise, it resolves dependencies from `pyproject.toml` and updates `uv.lock`.
        Ensure your `pyproject.toml` also has `[tool.uv] package = true` for `uv sync` to correctly install your project scripts.

        ```bash
        uv sync
        ```

    * If you were previously using a `requirements.txt` file primarily, ensure your dependencies are now listed in `pyproject.toml` under the `[project.dependencies]` section for `uv sync` to pick them up correctly. If `requirements.txt` is still needed for some specific workflow, `uv pip install -r requirements.txt` can still be used after activating the venv.

3. **Enable `direnv`:**
    Run the following command in the project's root directory (where the `.envrc` file is located):

    ```bash
    direnv allow
    ```

    This will automatically activate the Python virtual environment (created by `uv` in `.venv/`) whenever you `cd` into the project directory, thanks to the `.envrc` file:

    ```
    watch_file uv.lock
    source .venv/bin/activate
    ```

## Running the Application

Once the setup is complete and the virtual environment is active (either via `direnv` or manually sourcing `source .venv/bin/activate`):

There are two main ways to run the application:

1. **Directly using the Python interpreter:**

    ```bash
    python src/main.py
    ```

2. **Using the installed console script (recommended after setup):**
    After running `uv sync` (and ensuring `[tool.uv] package = true` is in your `pyproject.toml`), the script defined in `pyproject.toml` (`cmd-practice`) should be available. You can then run:

    ```bash
    cmd-practice
    ```

    This is often more convenient and is the standard way to run applications packaged with `pyproject.toml`.

    *Troubleshooting:* If `cmd-practice` is not found after `uv sync`:
    * Ensure `[tool.uv] package = true` is in your `pyproject.toml`.
    * Try explicitly installing the project in editable mode: `uv pip install -e .`
    * Make sure your virtual environment is active.
    * Check if the script is in your virtual environment's `bin` (or `Scripts` on Windows) directory (e.g., `.venv/bin/cmd-practice`).

You will be greeted by the application and can start practicing commands.

## Project Structure

* `src/main.py`: The main application script.
* `src/task_loader.py`: Handles loading task definitions from JSON files.
* `src/evaluator.py`: Responsible for evaluating the user's commands.
* `pyproject.toml`: Project metadata and dependency specifications (used by `uv`).
* `uv.lock`: Lockfile for Python dependencies managed by `uv`.
* `tasks/`: Contains JSON files, each defining a practice task.
* `man_pages.json`: Centralized storage for "man page" information used by the `man` command in the tool.
* `.envrc`: `direnv` configuration to auto-activate the virtual environment.
* `highscores.json`: Stores user highscores. (Generated on first run/save)

## Adding New Tasks

To add a new task:

1. Create a new JSON file in the `tasks/` directory (e.g., `tasks/my_new_task_01.json`).
2. Follow the structure of existing task files. Key fields include:
    * `id`: Unique identifier for the task.
    * `title`: Display title for the task.
    * `description`: What the user needs to achieve.
    * `command_to_practice`: The primary command(s) this task focuses on (e.g., "grep", or "find, mv, ls" for multiple primary commands used in filtering).
    * `example_solution`: A correct command string.
    * `difficulty`: "easy", "medium", or "hard".
    * `setup_files` (optional): An array of objects to create files/directories needed for the task.
        * `action`: e.g., "create_file", "create_directory".
        * `path`: File or directory path (can include subdirectories, relative to `working_directory`).
        * `content`: Content for the file (if `action` is "create_file").
    * `input_details`:
        * `prompt_for_command`: Custom prompt text.
        * `working_directory`: Directory where the command should be virtually executed. It is strongly recommended to set this to "data" (e.g., "data" or "data/some_task_specific_subdir") to ensure tasks are self-contained and use a dedicated area for file operations. Paths in `setup_files` are relative to this `working_directory`.
        * `required_files_for_task` (optional): List of files/directories relevant to the task, shown with the `show` command.
    * `evaluation`: Defines how the user's command is assessed. Contains a `method` and method-specific fields:
        * `method` (string): The core evaluation strategy. Common methods include:
            * `"exact_match"`: User's command `stdout`, `stderr`, and `return_code` must exactly match expected values. Also checks `check_command_contains` if provided.
            * `"contains_substring"`: User's command `stdout` must contain all specified substrings. `return_code` is usually expected to be 0. Also checks `check_command_contains` if provided.
            * `"complex_script_evaluation"`: Used for tasks requiring checks on the filesystem state, regex matching for `stdout`, and specific `stderr`, in addition to `check_command_contains`.

        * **Common Evaluation Fields (used by multiple methods):**
            * `expected_stdout` (string): Expected standard output. For `exact_match`, this is a literal string (newlines `\n` are normalized). For other methods, its usage might vary.
            * `expected_stderr` (string, optional): Expected standard error. Often an empty string `""` if no error is expected.
            * `allow_stderr_if_stdout_matches` (boolean, optional, defaults to `false`): For `exact_match`, if true, allows non-empty `stderr` as long as `stdout` is correct and `return_code` is 0.
            * `check_command_contains` (array of objects, optional): An array to verify the structure of the user's command itself. Each object in the array is a check:
                * `substring` (string, required): The string or regex pattern to look for in the user's command.
                * `optional` (boolean, optional, defaults to `false`): If `true`, this specific check failing won't cause the overall command structure validation to fail.
                * `is_regex` (boolean, optional, defaults to `false`): If `true`, the `substring` is treated as a regular expression pattern for matching.

        * **Fields for `"contains_substring"` method:**
            * `expected_stdout_substrings` (array of strings): A list of substrings that must all be present in the user's `stdout` for the output check to pass.

        * **Fields for `"complex_script_evaluation"` method:**
            * `check_destination_dir_contents` (object, optional): Defines filesystem checks.
                * `expected_files` (array of strings): List of file paths (basenames are extracted and checked) that *must* exist in the target directory after the command executes.
                * `unexpected_files` (array of strings): List of file paths (basenames are extracted and checked) that *must not* exist in the target directory.
                * `target_check_directory` (string, optional, e.g., "data/destination_dir"): Specifies the directory (relative to `working_directory`) where filesystem checks (`expected_files`, `unexpected_files`) are performed. If not provided, the evaluator might use a default or this check might be skipped (current behavior may need review/standardization if this field is omitted).
            * `expected_stdout_pattern` (string, optional): A regular expression pattern that the user's `stdout` must match (uses `re.MULTILINE`).
            * `expected_stderr` (string, optional): The exact expected `stderr`.

    * `hints` (optional): An array of strings providing hints to the user.

3. The `man_page_info` for the `command_to_practice` should be added/updated in the central `man_pages.json` file if not already present or if the existing information can be improved.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs, feature requests, or new task ideas.

---

