import os

from datetime import datetime
from flask import Flask, jsonify, render_template, request

from tuition_strategy.calculator import PaymentCalculator

app = Flask(__name__)


@app.route("/")
def index():
    """Render the main calculator page"""
    return render_template("calculator.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    """API endpoint for payment strategy calculation"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = [
            "totalAmount",
            "installments",
            "onTimeFee",
            "returnRate",
            "firstPaymentDate",
            "lumpSumDate",
        ]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required: {field}"}), 400

        results = PaymentCalculator.calculate_payment_strategy(data)

        # Convert dataclasses to dictionaries for JSON serialization
        return jsonify(
            {
                "recommendation": results.recommendation,
                "installment": results.installment,
                "lumpSum": results.lump_sum,
                "paymentSchedule": [
                    {
                        "paymentNumber": item.payment_number,
                        "date": item.date,
                        "amount": item.amount,
                        "fee": item.fee,
                        "remainingBalance": item.remaining_balance,
                        "accumulatedPayments": item.accumulated_payments,
                    }
                    for item in results.payment_schedule
                ],
                "investmentBreakdown": [
                    {
                        "month": item.month,
                        "balance": item.balance,
                        "monthlyReturn": item.monthly_return,
                        "cumulativeReturn": item.cumulative_return,
                    }
                    for item in results.investment_breakdown
                ],
            }
        )

    except ValueError as e:
        return jsonify({"error": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Calculation error: {str(e)}"}), 500


@app.route("/health")
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })


def main():
    """
    Main function to run the Flask application.
    """
    try:
        port = int(os.environ.get("PORT", 5500))
        debug = os.environ.get("FLASK_ENV") == False
        app.run(host="0.0.0.0", port=port, debug=debug)
    except KeyboardInterrupt:
        # Handle Ctrl+C gracefully
        pass
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()
