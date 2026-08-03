import json
from datetime import date, timedelta
from pathlib import Path

from src.schemas.market import PricePoint, PricePrediction

_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "sample_prices.json"
_TREND_THRESHOLD_PERCENT = 3.0  # below this magnitude, we call it "stable" rather than up/down

_price_points: list[PricePoint] | None = None


def _load_price_points() -> list[PricePoint]:
    global _price_points
    if _price_points is None:
        raw = json.loads(_DATA_PATH.read_text())
        _price_points = [PricePoint(**row) for row in raw]
    return _price_points


def predict_price(item: str, market: str = "Mile 12") -> PricePrediction:
    points = [p for p in _load_price_points() if p.item == item.lower() and p.market == market]
    if not points:
        raise ValueError(f"No price history for '{item}' at '{market}'")

    points.sort(key=lambda p: p.date)
    today = date.fromisoformat(points[-1].date)
    recent_cutoff = today - timedelta(days=7)

    recent = [p.price for p in points if date.fromisoformat(p.date) > recent_cutoff]
    prior = [p.price for p in points if date.fromisoformat(p.date) <= recent_cutoff]

    recent_avg = sum(recent) / len(recent) if recent else points[-1].price
    prior_avg = sum(prior) / len(prior) if prior else recent_avg

    percent_change = ((recent_avg - prior_avg) / prior_avg * 100) if prior_avg else 0.0

    if percent_change > _TREND_THRESHOLD_PERCENT:
        trend = "up"
    elif percent_change < -_TREND_THRESHOLD_PERCENT:
        trend = "down"
    else:
        trend = "stable"

    # Sample data is placeholder, not verified real-world numbers — cap confidence
    # accordingly regardless of how clean the trend math looks.
    all_sample = all(p.source == "sample" for p in points)
    if len(recent) >= 5 and len(prior) >= 5:
        confidence = "medium" if all_sample else "high"
    else:
        confidence = "low"

    advice = _advice_for(item, market, trend)

    return PricePrediction(
        item=item,
        market=market,
        unit=points[-1].unit,
        current_avg_price=round(recent_avg, -1),
        trend=trend,
        percent_change=round(percent_change, 1),
        confidence=confidence,
        advice=advice,
        data_source="sample" if all_sample else "mixed",
    )


def _advice_for(item: str, market: str, trend: str) -> str:
    name = item.title()
    if trend == "up":
        return f"{name} price dey rise for {market} — sell now if you get stock."
    if trend == "down":
        return f"{name} price dey fall for {market} — good time to buy."
    return f"{name} price steady for {market} right now."
