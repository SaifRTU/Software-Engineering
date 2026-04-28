from __future__ import annotations


class CalculatorError(Exception):
    """Domain-specific error for calculator operations."""


class Calculator:
    """Pure calculator logic with basic arithmetic operations."""

    @staticmethod
    def add(a: float, b: float) -> float:
        return a + b

    @staticmethod
    def subtract(a: float, b: float) -> float:
        return a - b

    @staticmethod
    def multiply(a: float, b: float) -> float:
        return a * b

    @staticmethod
    def divide(a: float, b: float) -> float:
        if b == 0:
            raise CalculatorError("Cannot divide by zero.")
        return a / b

    @staticmethod
    def clear() -> float:
        """Represents clearing the current result/input back to zero."""
        return 0.0


__all__ = ["Calculator", "CalculatorError"]

