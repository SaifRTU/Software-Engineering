## Basic Calculator (Tkinter, Python)

This is a small, test-driven calculator application built with **Python** and **Tkinter**.  
The focus is on clean separation between **pure calculation logic** and the **GUI**, along with unit tests.

### Features

- **Addition**: adds two numbers (e.g., 5 + 3 = 8)
- **Subtraction**: subtracts two numbers (e.g., 10 − 4 = 6)
- **Multiplication**: multiplies two numbers (e.g., 6 × 7 = 42)
- **Division**: divides two numbers, with division-by-zero handled gracefully
- **Clear (C)**: resets both inputs and the displayed result to zero

### Project Layout

- `calculator.py` — pure `Calculator` logic (no UI code)
- `app.py` — Tkinter GUI that uses `Calculator`
- `tests/test_calculator.py` — unit tests for all operations
- `requirements.txt` — Python test dependency (`pytest`)

### Setup

1. Create and activate a virtual environment (optional but recommended):

```bash
python -m venv .venv
source .venv/bin/activate  # on macOS/Linux
# .venv\Scripts\activate   # on Windows
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

### Running the Application

Make sure you are in the project root, then run:

```bash
python app.py
```

This opens a small window where you can:

- Enter two numbers
- Click `+`, `-`, `×`, or `÷` to compute the result
- Click `C` to clear both inputs and set the result back to `0`

If you try to divide by zero, a message box will appear instead of the app crashing.

### Running Tests

From the project root:

```bash
pytest
```

This will run the unit tests in `tests/test_calculator.py` to verify:

- All four operations work correctly
- Division by zero raises a `CalculatorError`
- `clear()` resets the value to zero

