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
    weather: "WeatherInfo | None" = None  # only set when the item is a perishable


class WeatherInfo(BaseModel):
    market: str
    temperature_c: float
    condition: str  # short human-readable description, e.g. "light rain likely"
    rain_expected: bool  # true if today/tomorrow's rain chance is high
    rain_probability_percent: float


class MarketOption(BaseModel):
    market: str
    current_avg_price: float
    trend: Literal["up", "down", "stable"]
    percent_change: float
    weather: WeatherInfo


class MarketRecommendation(BaseModel):
    item: str
    action: Literal["buy", "sell"]
    recommended_market: str
    reason: str
    options: list[MarketOption]  # all markets considered, for transparency
