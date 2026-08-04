import json
from datetime import date, timedelta
from pathlib import Path

import httpx

from src.schemas.market import MarketOption, MarketRecommendation, PricePoint, PricePrediction, WeatherInfo

_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "sample_prices.json"
_TREND_THRESHOLD_PERCENT = 3.0  # below this magnitude, we call it "stable" rather than up/down

_MARKETS = ["Mile 12", "Balogun", "Agege"]
_MARKET_COORDINATES = {
    "Mile 12": (6.5763, 3.3900),
    "Balogun": (6.4549, 3.3915),
    "Agege": (6.6018, 3.3245),
}
_PERISHABLE_ITEMS = {"tomato", "orange", "pepper"}  # beans (dried) is not weather-sensitive the same way
_RAIN_PROBABILITY_THRESHOLD = 60.0  # percent — above this, we call it "rain expected"

_price_points: list[PricePoint] | None = None


def _load_price_points() -> list[PricePoint]:
    global _price_points
    if _price_points is None:
        raw = json.loads(_DATA_PATH.read_text())
        _price_points = [PricePoint(**row) for row in raw]
    return _price_points


def get_weather(market: str) -> WeatherInfo:
    if market not in _MARKET_COORDINATES:
        raise ValueError(f"No weather coordinates configured for '{market}'")
    lat, lon = _MARKET_COORDINATES[market]

    response = httpx.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,precipitation,weather_code",
            "daily": "precipitation_probability_max",
            "timezone": "Africa/Lagos",
            "forecast_days": 2,
        },
        timeout=10.0,
    )
    response.raise_for_status()
    data = response.json()

    current = data["current"]
    rain_probability = max(data["daily"]["precipitation_probability_max"][:2])
    rain_expected = rain_probability >= _RAIN_PROBABILITY_THRESHOLD

    condition = "rain likely" if rain_expected else "no significant rain expected"

    return WeatherInfo(
        market=market,
        temperature_c=current["temperature_2m"],
        condition=condition,
        rain_expected=rain_expected,
        rain_probability_percent=rain_probability,
    )


def predict_price(item: str, market: str = "Mile 12") -> PricePrediction:
    item = item.lower()
    points = [p for p in _load_price_points() if p.item == item and p.market == market]
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

    weather = None
    advice = _advice_for(item, market, trend)
    if item in _PERISHABLE_ITEMS:
        try:
            weather = get_weather(market)
        except Exception:
            weather = None  # weather is a bonus signal — never break the prediction if it's unreachable
        if weather and weather.rain_expected:
            advice += f" Rain dey come for {market} — perishables fit cost more soon, no delay."

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
        weather=weather,
    )


def _advice_for(item: str, market: str, trend: str) -> str:
    name = item.title()
    if trend == "up":
        return f"{name} price dey rise for {market} — sell now if you get stock."
    if trend == "down":
        return f"{name} price dey fall for {market} — good time to buy."
    return f"{name} price steady for {market} right now."


def recommend_market(item: str, action: str) -> MarketRecommendation:
    options: list[MarketOption] = []
    for market in _MARKETS:
        try:
            prediction = predict_price(item, market)
        except ValueError:
            continue  # this market has no data for this item — skip it, don't fail the whole comparison

        try:
            weather = get_weather(market)
        except Exception:
            weather = WeatherInfo(
                market=market, temperature_c=0.0, condition="weather unavailable",
                rain_expected=False, rain_probability_percent=0.0,
            )

        options.append(
            MarketOption(
                market=market,
                current_avg_price=prediction.current_avg_price,
                trend=prediction.trend,
                percent_change=prediction.percent_change,
                weather=weather,
            )
        )

    if not options:
        raise ValueError(f"No price history for '{item}' in any market")

    # Buying: cheapest market wins. Selling: highest-price market wins.
    reverse = action == "sell"
    options.sort(key=lambda o: o.current_avg_price, reverse=reverse)
    best = options[0]

    verb = "buy" if action == "buy" else "sell"
    reason = (
        f"{best.market} has the best price for {item} right now (₦{best.current_avg_price:,.0f}), "
        f"{'trending down' if best.trend == 'down' else 'trending up' if best.trend == 'up' else 'holding steady'}."
    )
    if best.weather.rain_expected:
        reason += f" Rain is likely there soon ({best.weather.rain_probability_percent:.0f}% chance) — {verb} soon rather than wait."
    else:
        reason += " No rain risk there right now."

    return MarketRecommendation(
        item=item, action=action, recommended_market=best.market, reason=reason, options=options
    )
