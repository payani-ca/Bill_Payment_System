from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from controllers import wallets_col, transactions_col, check_password
from constants.utilitiesconst import UTILITIES
import uuid

loan_bp = Blueprint("loanrepayment", __name__, url_prefix="/api/loanrepayment")

def sum_ascii(s):
    return sum(ord(ch) for ch in s)

# -------------------- SERVICE NUMBER --------------------
@loan_bp.route("/service_no", methods=["POST"])
@jwt_required()
def get_service_no():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()
    provider = data.get("provider")

    if not provider:
        return jsonify({"msg": "Missing provider"}), 400

    today = datetime.now().strftime("%Y-%m-%d")
    service_no = f"L-{sum_ascii('loan')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"
    return jsonify({"service_no": service_no, "userID": user_id, "provider": provider}), 200

# -------------------- BILL GENERATION --------------------
@loan_bp.route("/bill", methods=["POST"])
@jwt_required()
def generate_bill():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()
    provider = data.get("provider")
    #ServiceNo = data.get("ServiceNo")

    if not provider:
        return jsonify({"msg": "Missing provider"}), 400

    today = datetime.now().strftime("%Y-%m-%d")
    service_no = f"L-{sum_ascii('loan')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"
    #
    # if ServiceNo != expected_service_no:
    #     return jsonify({"msg": "Invalid ServiceNo"}), 400

    if provider not in UTILITIES["loanrepayment"]:
        return jsonify({"msg": "Invalid provider"}), 400

    amount = sum_ascii("loan") + sum_ascii(provider) + sum_ascii(user_id) + sum_ascii(today)
    if amount > 1000:
        amount = amount / 10

    return jsonify({"bill_amount": round(amount, 2), "userID": user_id, "ServiceNo": service_no}), 200

# -------------------- PAYMENT --------------------
@loan_bp.route("/pay", methods=["POST"])
@jwt_required()
def pay_bill():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()

    required = ["provider", "mobile", "bill_amount", "mpin", "service_no"]
    if not all(k in data for k in required):
        return jsonify({"msg": "Missing fields"}), 400

    existing_tx = transactions_col.find_one({
        "UserID": user_id,
        "ServiceNo": data["service_no"],
        "Status": "Paid"
    })
    if existing_tx:
        return jsonify({"msg": "This bill has already been paid"}), 400

    wallet = wallets_col.find_one({"UserID": user_id})
    if not wallet:
        return jsonify({"msg": "Wallet not found"}), 404

    if not check_password(data["mpin"], wallet["MPIN"]):
        return jsonify({"msg": "Invalid MPIN"}), 401

    amount = float(data["bill_amount"])
    if amount <= 0:
        return jsonify({"msg": "Invalid amount"}), 400
    if wallet["Amount"] < amount:
        return jsonify({"msg": "Insufficient wallet balance"}), 400

    provider = data.get("provider")
    if not provider:
        return jsonify({"msg": "Missing provider"}), 400

    vendor = f"Loan : {provider}"

    tx = {
        "TxID": str(uuid.uuid4()),
        "UserID": user_id,
        "Utility": "LoanRepayment",
        "VendorDetails": vendor,
        "Amount": amount,
        "Status": "Paid",
        "Timestamp": datetime.now(),
        "ServiceNo": data["service_no"]
    }
    transactions_col.insert_one(tx)
    wallets_col.update_one(
        {"UserID": user_id},
        {"$inc": {"Amount": -amount}, "$push": {"Transaction": tx}}
    )

    return jsonify({
        "msg": "Loan repayment successful",
        "vendor": vendor,
        "new_balance": wallet["Amount"] - amount
    }), 200
