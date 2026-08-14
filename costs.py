import json, os, tempfile, threading
from datetime import datetime, date

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COSTS_PATH = os.path.join(BASE_DIR, "claude_costs.json")
_lock = threading.Lock()

DAILY_WARN_USD = 1.0
DAILY_HARD_KILL_USD = 5.0

PRICING = {
    "claude-haiku-4-5-20251001": {"input": 1.00 / 1_000_000, "output": 5.00 / 1_000_000},
}
_DEFAULT_PRICE = PRICING["claude-haiku-4-5-20251001"]


def _load() -> dict:
    # dict.update() statt "return raw" - sonst KeyError auf "calls"/"daily",
    # falls schon eine claude_costs.json im alten Format existiert.
    data = {"calls": [], "daily": {}, "total_cost_usd": 0.0,
            "total_input_tokens": 0, "total_output_tokens": 0}
    if os.path.exists(COSTS_PATH):
        try:
            with open(COSTS_PATH) as f:
                raw = json.load(f)
            data.update(raw)
            data.setdefault("calls", [])
            data.setdefault("daily", {})
        except Exception:
            pass
    return data


def _write(data: dict):
    dir_ = os.path.dirname(COSTS_PATH)
    fd, tmp_path = tempfile.mkstemp(dir=dir_)
    with os.fdopen(fd, "w") as tmp:
        json.dump(data, tmp, ensure_ascii=False, indent=2)
    os.replace(tmp_path, COSTS_PATH)


def is_hard_killed_today() -> bool:
    data = _load()
    today = date.today().isoformat()
    return data.get("daily", {}).get(today, {}).get("hard_killed", False)


def today_summary() -> dict:
    data = _load()
    today = date.today()
    today_key = today.isoformat()
    day = data.get("daily", {}).get(today_key, {"cost_usd": 0.0, "calls": 0})

    month_total = year_total = 0.0
    for day_key, day_data in data.get("daily", {}).items():
        try:
            d = date.fromisoformat(day_key)
        except ValueError:
            continue
        cost = day_data.get("cost_usd", 0.0)
        if d.year == today.year and d.month == today.month:
            month_total += cost
        if d.year == today.year:
            year_total += cost

    return {
        "cost_usd": round(day.get("cost_usd", 0.0), 4),
        "calls": day.get("calls", 0),
        "warn_usd": DAILY_WARN_USD,
        "hard_kill_usd": DAILY_HARD_KILL_USD,
        "hard_killed": day.get("hard_killed", False),
        "month_usd": round(month_total, 4),
        "year_usd": round(year_total, 4),
        "total_usd": round(data.get("total_cost_usd", 0.0), 4),
    }


def record_call(model: str, input_tokens: int, output_tokens: int, context: str) -> dict:
    price = PRICING.get(model, _DEFAULT_PRICE)
    cost_usd = input_tokens * price["input"] + output_tokens * price["output"]
    today = date.today().isoformat()

    with _lock:
        data = _load()
        data["calls"].append({
            "ts": datetime.now().isoformat(timespec="seconds"),
            "input_tokens": input_tokens, "output_tokens": output_tokens,
            "cost_usd": cost_usd, "context": context,
        })
        data["calls"] = data["calls"][-500:]

        day = data["daily"].setdefault(today, {
            "cost_usd": 0.0, "calls": 0, "notified_1usd": False, "hard_killed": False,
        })
        day["cost_usd"] += cost_usd
        day["calls"] += 1

        data["total_cost_usd"] = data.get("total_cost_usd", 0.0) + cost_usd
        data["total_input_tokens"] = data.get("total_input_tokens", 0) + input_tokens
        data["total_output_tokens"] = data.get("total_output_tokens", 0) + output_tokens

        warn_1usd = False
        if day["cost_usd"] >= DAILY_WARN_USD and not day["notified_1usd"]:
            day["notified_1usd"] = True
            warn_1usd = True

        hard_kill = day["cost_usd"] >= DAILY_HARD_KILL_USD
        if hard_kill:
            day["hard_killed"] = True

        _write(data)

    return {"cost_usd": cost_usd, "day_total_usd": day["cost_usd"],
            "warn_1usd": warn_1usd, "hard_kill": hard_kill}
