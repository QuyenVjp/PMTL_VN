"""Editable file for autoresearch experiments.

Only this file should be modified by the optimization loop.
"""

from __future__ import annotations


# Parameters intentionally initialized away from optimum.
SLOPE = 0.45
BIAS = -0.75
WOBBLE = 0.8


def predict(x: float) -> float:
    # A simple function the loop can improve by tuning constants above.
    return SLOPE * x + BIAS + WOBBLE * (x**2)
