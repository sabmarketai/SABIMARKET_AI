from typing import Literal

from pydantic import BaseModel


class PricePoint(BaseModel):
    """One historical price observation for an item at a market."""

    item: str
    market: str
    date: str  # ISO date
    price: float  # naira, per the item's standard unit (e.g. per basket)
    unit: str
    source: str = "sample"  # "sample" (placeholder) | "trader_report" | "nbs" | "wfp" once real sources exist


class PricePrediction(BaseModel):
    item: str
    market: str
    unit: str
    current_avg_price: float
    trend: Literal["up", "down", "stable"]
    percent_change: float  # over the lookback window, e.g. last 7 days vs prior 7 days
    confidence: Literal["low", "medium", "high"]
    advice: str  # short, trader-facing message in Pidgin/English
    data_source: str  # "sample" while we're on placeholder data, so nobody mistakes this for a real signal
