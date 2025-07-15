import calendar

from datetime import datetime
from dataclasses import dataclass
from typing import Any, Dict, List

@dataclass
class PaymentScheduleItem:
    payment_number: int
    date: str
    amount: float
    fee: float
    remaining_balance: float
    accumulated_payments: int = 0


@dataclass
class InvestmentBreakdownItem:
    month: int
    balance: float
    monthly_return: float
    cumulative_return: float


@dataclass
class Results:
    recommendation: Dict[str, Any]
    installment: Dict[str, float]
    lump_sum: Dict[str, float]
    payment_schedule: List[PaymentScheduleItem]
    investment_breakdown: List[InvestmentBreakdownItem]


class PaymentCalculator:
    @staticmethod
    def add_months(date: datetime, months: int) -> datetime:
        """Add months to a date"""
        month = date.month - 1 + months
        year = date.year + month // 12
        month = month % 12 + 1
        day = min(date.day, calendar.monthrange(year, month)[1])
        return datetime(year, month, day)

    @staticmethod
    def difference_in_months(date1: datetime, date2: datetime) -> int:
        """Calculate difference in months between two dates"""
        return (date1.year - date2.year) * 12 + date1.month - date2.month

    @staticmethod
    def format_date(date: datetime) -> str:
        """Format date for display"""
        return date.strftime("%b %d, %Y")

    @classmethod
    def calculate_payment_strategy(cls, data: Dict[str, Any]) -> Results:
        """Calculate the optimal payment strategy"""
        total_amount = float(data.get("totalAmount", 0))
        installments = int(data.get("installments", 0))
        on_time_fee = float(data.get("onTimeFee", 0))
        return_rate = float(data.get("returnRate", 0))
        first_date = datetime.strptime(data.get("firstPaymentDate"), "%Y-%m-%d")
        lump_sum_date = datetime.strptime(data.get("lumpSumDate"), "%Y-%m-%d")
        postpone_months = int(data.get("postponeMonths", 0))

        installment_amount = total_amount / installments
        max_postpone_months = cls.difference_in_months(lump_sum_date, first_date)
        postpone_months = min(postpone_months, max_postpone_months)

        # Generate payment schedule with postponement
        payment_schedule = []
        for i in range(installments-postpone_months):
            payment_date = cls.add_months(first_date, i + postpone_months)
            amount = installment_amount
            fee = 0
            accumulated_payments = 1

            # Handle postponement logic
            if i == 0 and postpone_months > 0:
                # 1st payment after postponement has all postponed payments
                accumulated_payments = postpone_months + 1
                amount = installment_amount * accumulated_payments
                # One-time fee applied to first actual payment
                fee = on_time_fee
            elif i == 0:
                # Regular first payment
                fee = on_time_fee

            remaining_balance = total_amount - (installment_amount * (i + 1))

            schedule_item = PaymentScheduleItem(
                payment_number=i + 1,
                date=cls.format_date(payment_date),
                amount=amount,
                fee=fee,
                remaining_balance=max(0, remaining_balance),
            )

            # Add accumulated payments info if applicable
            if accumulated_payments > 1:
                schedule_item.accumulated_payments = accumulated_payments

            payment_schedule.append(schedule_item)

        # Calculate installment strategy
        total_fees = on_time_fee

        # Calculate returns for remaining balance with monthly compounding
        # For postponed payments, investment returns accrue during
        # postponement and after each payment
        investment_returns = 0
        monthly_return_rate = return_rate / 100 / 12  # Monthly return rate
        investment_breakdown = []

        # Investment returns during postponement period
        for i in range(postpone_months):
            monthly_return = total_amount * monthly_return_rate
            investment_returns += monthly_return
            investment_breakdown.append(
                InvestmentBreakdownItem(
                    month=i + 1,
                    balance=total_amount,
                    monthly_return=monthly_return,
                    cumulative_return=investment_returns,
                )
            )

        # Investment returns after each payment (excluding the final payment)
        for i in range(postpone_months, installments - 1):
            remaining_balance = total_amount - (installment_amount * (i + 1))
            if remaining_balance > 0:
                monthly_return = remaining_balance * monthly_return_rate
                investment_returns += monthly_return
                investment_breakdown.append(
                    InvestmentBreakdownItem(
                        month=i + 1,
                        balance=remaining_balance,
                        monthly_return=monthly_return,
                        cumulative_return=investment_returns,
                    )
                )

        installment_net_cost = total_amount + total_fees - investment_returns

        # Calculate lump sum strategy
        months_to_lump_sum = cls.difference_in_months(lump_sum_date, first_date)
        opportunity_cost = (
            total_amount * (return_rate / 100) * (months_to_lump_sum / 12)
        )
        lump_sum_net_cost = total_amount + opportunity_cost

        # Determine recommendation
        savings = abs(installment_net_cost - lump_sum_net_cost)
        if lump_sum_net_cost < installment_net_cost:
            strategy = "Lump Sum"
        else:
            strategy = "Installment"

        return Results(
            recommendation={"strategy": strategy, "savings": savings},
            installment={
                "totalAmount": total_amount,
                "totalFees": total_fees,
                "investmentReturns": investment_returns,
                "netCost": installment_net_cost,
            },
            lump_sum={
                "totalAmount": total_amount,
                "fees": 0,
                "opportunityCost": opportunity_cost,
                "netCost": lump_sum_net_cost,
            },
            payment_schedule=payment_schedule,
            investment_breakdown=investment_breakdown,
        )