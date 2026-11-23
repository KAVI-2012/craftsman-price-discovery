from typing import Dict

class CurrencyService:
    # Standard baseline rates to INR
    RATES_TO_INR: Dict[str, float] = {
        "INR": 1.0,
        "USD": 83.0,
        "EUR": 90.5,
        "GBP": 105.2,
        "JPY": 0.55,
        "SGD": 62.0,
        "AED": 22.6
    }

    @classmethod
    def convert_to_inr(cls, amount: float, currency: str) -> float:
        if not amount:
            return 0.0
        cur = currency.upper().strip()
        rate = cls.RATES_TO_INR.get(cur, 1.0)
        return round(amount * rate, 2)

    @classmethod
    def convert_from_inr(cls, inr_amount: float, target_currency: str) -> float:
        if not inr_amount:
            return 0.0
        cur = target_currency.upper().strip()
        rate = cls.RATES_TO_INR.get(cur, 1.0)
        return round(inr_amount / rate, 2)

    @classmethod
    def get_exchange_rate(cls, from_currency: str, to_currency: str = "INR") -> float:
        from_cur = from_currency.upper().strip()
        to_cur = to_currency.upper().strip()
        if from_cur == to_cur:
            return 1.0
        from_to_inr = cls.RATES_TO_INR.get(from_cur, 1.0)
        to_to_inr = cls.RATES_TO_INR.get(to_cur, 1.0)
        return round(from_to_inr / to_to_inr, 4)

currency_service = CurrencyService()

