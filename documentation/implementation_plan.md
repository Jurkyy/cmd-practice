# Implementation Plan: Command-Line Practice Tool

## 1. Core Functionality

*   **Task Generation:**
    *   Define a set of practice tasks, each with:
        *   A clear description of the goal (e.g., "find all lines in `sample.txt` containing the word 'apple'").
        *   The target command(s) to be practiced (e.g., `grep`).
        *   Input files/data if necessary.
        *   Expected output or a way to verify the solution.
    *   Store tasks in a structured format (e.g., JSON, YAML, or plain text files).
*   **Task Presentation:**
    *   Display one task at a time to the user.
    *   Provide necessary context, like filenames or data snippets.
*   **Solution Input:**
    *   Allow the user to type in their command-line solution.
*   **Solution Evaluation:**
    *   Execute the user's command.
    *   Compare the output with the expected output or use a verification script.
    *   Provide feedback: "Correct!", "Incorrect, try again.", or hints.
*   **Progression:**
    *   Allow users to move to the next task.
    *   Potentially track progress (e.g., number of correct solutions).

## 2. Language Choice

*   **Python:**
    *   **Pros:** Good for string manipulation, file handling, and system interaction (`subprocess` module). Easier to structure larger applications. Cross-platform.
    *   **Cons:** Requires Python interpreter. Might feel less "native" for pure shell practice.
*   **Bash Script:**
    *   **Pros:** Native to the command line. Excellent for practicing shell commands directly.
    *   **Cons:** Can be more cumbersome for complex logic, data structures, and output comparison. Less portable than Python.

**Initial Recommendation:** Start with **Python** for its robustness in handling task logic, evaluation, and potential future expansions. The core of the user interaction will still be them typing shell commands.

## 3. Project Structure (Initial)

```
cmd-practice/
├── documentation/
│   └── implementation_plan.md
├── tasks/                  # Directory to store task definitions
│   ├── task1.json
│   └── task2.json
├── src/                    # Source code
│   ├── main.py             # Main script to run the tool
│   ├── task_loader.py      # Module to load tasks
│   └── evaluator.py        # Module to evaluate user solutions
└── data/                   # Sample files for tasks
    ├── sample1.txt
    └── table.csv
```

## 4. MVP (Minimum Viable Product) - Phase 1

*   Implement 3-5 simple tasks using `grep`, `ls`, and `cut`.
*   Basic task loading from JSON files.
*   Allow user to input a command.
*   Execute the command and show its raw output.
*   Simple "correct/incorrect" feedback based on exact output matching for one task.
*   A way to manually advance to the next task.
*   Written in Python.

## 5. Potential Enhancements (Post-MVP) - Phase 2+

*   **Safety:** For commands like `rm`, implement a sandbox or dry-run mode.
*   **More Tasks & Commands:** Expand to cover `find`, `rm` (with safety warnings!), `ping`, `awk`, `sed`, `wc`, `sort`, `uniq`, `head`, `tail`, etc.
*   **Difficulty Levels:** Categorize tasks by difficulty.
*   **Hints:** Provide optional hints for challenging tasks.
*   **Fuzzy Matching/Smarter Evaluation:** Allow for variations in output as long as the core goal is met (e.g., different ways to sort a list).
*   **Input Generation:** For some tasks, dynamically generate input files.
*   **Scoring/Tracking:** Keep track of user scores and completed tasks.
*   **User Accounts:** If deployed or shared.
*   **Interactive Mode:** Instead of one-shot commands, perhaps guide through multi-step processes.
*   **Theming/UI:** If expanded beyond a very basic CLI.
*   **"Man Page" Helper:** A quick way to look up options for commands being practiced.

## 6. Development Steps (Phase 1 - MVP)

1.  **Setup Project:** Create directory structure, initialize Git.
2.  **Define Task Format:** Finalize the JSON structure for tasks. Create initial task files.
3.  **Implement Task Loader (`task_loader.py`):** Function to read and parse task files.
4.  **Implement Core Logic (`main.py`):**
    *   Load a task.
    *   Display task description.
    *   Get user input.
5.  **Implement Evaluator (`evaluator.py`):**
    *   Function to execute the user's command (using `subprocess`).
    *   Compare output with expected output (initially exact match).
6.  **Integrate and Test:** Put all pieces together, write a simple loop in `main.py` to go through tasks.
7.  **Create Sample Data Files:** Populate the `data/` directory.

## 7. Technology Stack (MVP)

*   **Language:** Python 3
*   **Libraries:**
    *   `json` (for task parsing)
    *   `subprocess` (for running commands)
    *   (No external libraries needed for MVP initially)
