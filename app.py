from __future__ import annotations

import tkinter as tk
from tkinter import messagebox

from calculator import Calculator, CalculatorError


class CalculatorApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Basic Calculator")
        self.resizable(False, False)

        self.calculator = Calculator()

        self._build_widgets()

    def _build_widgets(self) -> None:
        # Inputs
        tk.Label(self, text="First number:").grid(row=0, column=0, padx=8, pady=4, sticky="e")
        tk.Label(self, text="Second number:").grid(row=1, column=0, padx=8, pady=4, sticky="e")

        self.entry_a = tk.Entry(self, width=15)
        self.entry_b = tk.Entry(self, width=15)
        self.entry_a.grid(row=0, column=1, padx=8, pady=4)
        self.entry_b.grid(row=1, column=1, padx=8, pady=4)

        # Operation buttons
        button_frame = tk.Frame(self)
        button_frame.grid(row=2, column=0, columnspan=2, pady=(8, 4))

        tk.Button(button_frame, text="+", width=4, command=self._on_add).grid(row=0, column=0, padx=4)
        tk.Button(button_frame, text="-", width=4, command=self._on_subtract).grid(row=0, column=1, padx=4)
        tk.Button(button_frame, text="×", width=4, command=self._on_multiply).grid(row=0, column=2, padx=4)
        tk.Button(button_frame, text="÷", width=4, command=self._on_divide).grid(row=0, column=3, padx=4)

        # Result
        tk.Label(self, text="Result:").grid(row=3, column=0, padx=8, pady=4, sticky="e")
        self.result_var = tk.StringVar(value="0")
        tk.Label(self, textvariable=self.result_var, width=15, anchor="w").grid(
            row=3, column=1, padx=8, pady=4, sticky="w"
        )

        # Clear button
        tk.Button(self, text="C", width=4, command=self._on_clear).grid(
            row=4, column=0, columnspan=2, pady=(4, 8)
        )

    def _get_inputs(self) -> tuple[float, float] | None:
        try:
            a = float(self.entry_a.get())
            b = float(self.entry_b.get())
            return a, b
        except ValueError:
            messagebox.showerror("Invalid input", "Please enter valid numbers.")
            return None

    def _set_result(self, value: float) -> None:
        # Strip trailing .0 for integers
        if value.is_integer():
            self.result_var.set(str(int(value)))
        else:
            self.result_var.set(str(value))

    def _on_add(self) -> None:
        operands = self._get_inputs()
        if operands is None:
            return
        a, b = operands
        result = self.calculator.add(a, b)
        self._set_result(result)

    def _on_subtract(self) -> None:
        operands = self._get_inputs()
        if operands is None:
            return
        a, b = operands
        result = self.calculator.subtract(a, b)
        self._set_result(result)

    def _on_multiply(self) -> None:
        operands = self._get_inputs()
        if operands is None:
            return
        a, b = operands
        result = self.calculator.multiply(a, b)
        self._set_result(result)

    def _on_divide(self) -> None:
        operands = self._get_inputs()
        if operands is None:
            return
        a, b = operands
        try:
            result = self.calculator.divide(a, b)
        except CalculatorError as exc:
            messagebox.showerror("Error", str(exc))
            return
        self._set_result(result)

    def _on_clear(self) -> None:
        cleared_value = self.calculator.clear()
        self.entry_a.delete(0, tk.END)
        self.entry_b.delete(0, tk.END)
        self._set_result(cleared_value)


def main() -> None:
    app = CalculatorApp()
    app.mainloop()


if __name__ == "__main__":
    main()

