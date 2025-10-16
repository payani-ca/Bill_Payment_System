from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from controllers import wallets_col, transactions_col, check_password
from constants.utilitiesconst import UTILITIES
import uuid

gas_bp = Blueprint("gas", __name__, url_prefix="/api/gas")


# --- Helper to compute amount ---
def sum_ascii(s):
    return sum(ord(ch) for ch in s)


# -------------------- BILL GENERATION --------------------
@gas_bp.route("/bill", methods=["POST"])
@jwt_required()
def generate_bill():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()
    state = data.get("state")
    provider = data.get("provider")
    #ServiceNo = data.get("ServiceNo")
    today = datetime.now().strftime("%Y-%m-%d")
    service_no = f"G-{sum_ascii('gas')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"

    if not state or not provider:
        return jsonify({"msg": "Missing state or provider"}), 400

    # expected_service_no = f"G-{sum_ascii('gas')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"
    # if ServiceNo != expected_service_no:
    #     return jsonify({"msg": "Invalid ServiceNo"}), 400

    # Verify provider exists in our constants
    valid_states = UTILITIES["gas"]
    if state not in valid_states or provider not in valid_states[state]:
        return jsonify({"msg": "Invalid state or provider"}), 400

    # Generate mock bill amount
    amount = sum_ascii("gas") + sum_ascii(provider) + sum_ascii(user_id) + sum_ascii(today)
    if amount > 1000:
        amount = amount / 10

    return jsonify({
        "bill_amount": round(amount, 2),
        "userID": user_id,
        "ServiceNo": service_no
    }), 200


# -------------------- PAYMENT --------------------
@gas_bp.route("/pay", methods=["POST"])
@jwt_required()
def pay_bill():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()

    required = ["state", "provider", "mobile", "bill_amount", "mpin", "service_no"]
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

    # Check MPIN
    if not check_password(data["mpin"], wallet["MPIN"]):
        return jsonify({"msg": "Invalid MPIN"}), 401

    amount = float(data["bill_amount"])
    if amount <= 0:
        return jsonify({"msg": "Invalid amount"}), 400
    if wallet["Amount"] < amount:
        return jsonify({"msg": "Insufficient wallet balance, please top-up"}), 400

    vendor = f"Gas : {data['state']} : {data['provider']}"
    tx = {
        "TxID": str(uuid.uuid4()),
        "UserID": user_id,
        "Utility": "Gas",
        "VendorDetails": vendor,
        "Amount": amount,
        "Status": "Paid",
        "Timestamp": datetime.now(),
        "ServiceNo": data["service_no"]
    }
    transactions_col.insert_one(tx)

    # Deduct wallet balance
    wallets_col.update_one(
        {"UserID": user_id},
        {"$inc": {"Amount": -amount}, "$push": {"Transaction": tx}}
    )

    return jsonify({
        "msg": "Gas bill payment successful",
        "vendor": vendor,
        "new_balance": wallet["Amount"] - amount
    }), 200


# -------------------- GENERATE SERVICE NUMBER --------------------
@gas_bp.route("/service_no", methods=["POST"])
@jwt_required()
def get_service_no():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()
    provider = data.get("provider")
    state = data.get("state")

    if not state or not provider:
        return jsonify({"msg": "Missing state or provider"}), 400

    today = datetime.now().strftime("%Y-%m-%d")
    service_no = f"G-{sum_ascii('gas')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"

    return jsonify({
        "service_no": service_no,
        "userID": user_id,
        "state": state,
        "provider": provider
    }), 200
