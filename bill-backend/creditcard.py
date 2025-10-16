from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
from constants.utilitiesconst import UTILITIES
from controllers import wallets_col, transactions_col, utilities_col, check_password

credit_bp = Blueprint("credit_bp", __name__, url_prefix="/api/creditcard")

def sum_ascii(text):
    return sum(ord(ch) for ch in str(text))

def sum_of_ascii(text):
    return sum(ord(ch) for ch in str(text))

def compute_bill_amount(utility_name, provider, user_id):
    today = datetime.now().strftime("%Y-%m-%d")
    amount = (
        sum_of_ascii(utility_name)
        + sum_of_ascii(provider)
        + sum_of_ascii(user_id)
        + sum_of_ascii(today)
    )
    if amount > 1000:
        amount = amount / 10
    return round(amount, 2)

# GET /CreditCard/bill
@credit_bp.route("/bill", methods=["POST"])
@jwt_required()
def get_credit_bill():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()
    provider = data.get("provider")
    today = datetime.now().strftime("%Y-%m-%d")
    service_no = f"C-{sum_ascii('creditcard')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"

    if not provider or provider not in UTILITIES["creditcard"]:
        return jsonify({"msg": "Invalid or missing provider"}), 400

    amount = compute_bill_amount("CreditCard", provider, user_id)
    return jsonify({"bill_amount": amount, "userID": user_id,  "ServiceNo": service_no}), 200


# POST /CreditCard/pay
@credit_bp.route("/pay", methods=["POST"])
@jwt_required()
def pay_credit_bill():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()

    required = ["provider", "card_number", "bill_amount", "mpin",   "service_no"]
    if not all(k in data for k in required):
        return jsonify({"msg": "Missing required fields"}), 400
    existing_tx = transactions_col.find_one({
        "UserID": user_id,
        "ServiceNo": data["service_no"],
        "Status": "Paid"
    })
    if existing_tx:
        return jsonify({"msg": "This bill has already been paid"}), 400

    provider = data["provider"]
    card_number = data["card_number"]
    amount = float(data["bill_amount"])
    mpin = data["mpin"]

    if amount <= 0:
        return jsonify({"msg": "Invalid bill amount"}), 400

    if provider not in UTILITIES["creditcard"]:
        return jsonify({"msg": "Invalid provider"}), 400

    wallet = wallets_col.find_one({"UserID": user_id})
    if not wallet:
        return jsonify({"msg": "Wallet not found"}), 404

    if not check_password(data["mpin"], wallet["MPIN"]):
        return jsonify({"msg": "Invalid MPIN"}), 401

    if wallet["Amount"] < amount:
        return jsonify({"msg": "Insufficient balance"}), 400

    vendor_details = f"CreditCard : {provider}"
    tx_id = str(uuid.uuid4())

    transactions_col.insert_one({
        "TxID": tx_id,
        "UserID": user_id,
        "Amount": amount,
        "Utility": "CreditCard",
        "VendorDetails": vendor_details,
         "Status": "Paid",
        "Timestamp": datetime.now(),
        "ServiceNo": data["service_no"]
    })

    wallets_col.update_one({"UserID": user_id}, {"$inc": {"Amount": -amount}})


    return jsonify({
        "msg": "Credit Card payment successful",
        "TxID": tx_id,
        "RemainingBalance": wallet["Amount"] - amount
    }), 200


# -------------------- GENERATE SERVICE NUMBER --------------------
@credit_bp.route("/service_no", methods=["POST"])
@jwt_required()
def get_service_no():
    data = request.get_json(force=True)
    user_id = get_jwt_identity()
    provider = data.get("provider")

    if not provider:
        return jsonify({"msg": "Missing provider"}), 400

    if not provider or provider not in UTILITIES["creditcard"]:
        return jsonify({"msg": "Invalid provider"}), 400

    ServiceNo = data.get("ServiceNo")
    today = datetime.now().strftime("%Y-%m-%d")
    service_no = f"C-{sum_ascii('creditcard')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"

    expected_service_no = f"C-{sum_ascii('creditcard')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"

    # Validate ServiceNo
    if service_no != expected_service_no:
        return jsonify({"msg": "Invalid ServiceNo"}), 400

    today = datetime.now().strftime("%Y-%m-%d")

    # Create service number
    service_no = f"C-{sum_ascii('creditcard')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"

    return jsonify({"service_no": service_no, "userID": user_id, "provider": provider}), 200
