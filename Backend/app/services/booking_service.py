from datetime import datetime


def calculate_days(start_date: datetime, end_date: datetime):
    delta = end_date - start_date
    return max(delta.days, 1)


def calculate_price(days: int, price_per_day: float):
    return days * price_per_day