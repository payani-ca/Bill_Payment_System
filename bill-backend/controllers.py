# controller.py
from flask import request, jsonify
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    create_refresh_token, get_jwt_identity, get_jwt, unset_jwt_cookies
)
from functools import wraps
from datetime import datetime, timezone
import bcrypt
import re
from pymongo import MongoClient
import uuid
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# It's assumed your models.py defines classes primarily for structure/type-hinting,
# but we will build dictionaries manually here to ensure DB key consistency.
# from models import User, Wallet, Transaction

# ------------------ MongoDB Setup ------------------
client = MongoClient("mongodb://localhost:27017/")
db = client["billingsystem"]

users_col = db["Users"]
wallets_col = db["Wallets"]
transactions_col = db["Transactions"]
utilities_col = db["Utilities"]
revoked_col = db["revoked_tokens"]
reminders_col = db["Reminders"]

# ------------------ JWT Setup ------------------
jwt = JWTManager()  # Will be initialized in init_routes


# ------------------ Helper Functions ------------------
def hash_password(plain_password: str) -> str:
    """Hashes a password and returns it as a string for DB storage."""
    hashed_bytes = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return hashed_bytes.decode("utf-8")


def check_password(plain_password: str, hashed_password_str: str) -> bool:
    """Checks a plain password against a hashed password string from the DB."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password_str.encode("utf-8"))


def validate_mobile(mobile: str) -> bool:
    return bool(re.fullmatch(r"[0-9]{7,15}", mobile))


def role_required(allowed_roles):
    """Decorator for role-based access."""

    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                return jsonify({"msg": "Forbidden - insufficient role"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator

#change
# ------------------ Initialize Routes ------------------
def init_routes(app):
    global jwt
    jwt.init_app(app)

    # ------------------ Register ------------------
    @app.route("/register", methods=["POST"])
    def register():
        data = request.get_json(force=True)
        required = ["name", "password", "mobile", "dob", "city", "country", "mpin", "pan", "aadhar"]

        # Check for missing fields
        if not all(k in data for k in required):
            return jsonify({"msg": "Missing fields"}), 400

        # Validate mobile number
        if not validate_mobile(data["mobile"]):
            return jsonify({"msg": "Invalid mobile"}), 400

        # Validate PAN format (e.g. ABCDE1234F)
        pan_pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
        if not re.match(pan_pattern, data["pan"].upper()):
            return jsonify({"msg": "Invalid PAN format"}), 400

        # Validate Aadhaar format (12 digits)
        aadhar_pattern = r"^\d{12}$"
        if not re.match(aadhar_pattern, data["aadhar"]):
            return jsonify({"msg": "Invalid Aadhaar number"}), 400

        # Check for existing mobile number
        if users_col.find_one({"Mobile": data["mobile"]}):
            return jsonify({"msg": "Mobile already registered"}), 409

        user_id = data["userID"]
        current_time = datetime.now()

        # Create user document
        user_doc =  {
            "UserID": user_id,
            "Name": data["name"],
            "Password": hash_password(data["password"]),
            "Mobile": data["mobile"],
            "DOB": data["dob"],
            "City": data["city"],
            "Country": data["country"],
            "PAN": data["pan"].upper(),
            "Aadhaar": data["aadhar"],
            "role": "user",
            "CreatedOn": current_time,
            "LastModified": current_time,
        }
        users_col.insert_one(user_doc)

        # Create wallet document
        wallet_doc = {
            "WalletID": str(uuid.uuid4()),
            "UserID": user_id,
            "Amount": float(data.get("wallet_balance", 0.0)),
            "MPIN": hash_password(data["mpin"]),
            "Transaction": [],
            "CreatedOn": current_time,
            "LastModified": current_time,
        }
        wallets_col.insert_one(wallet_doc)

        return jsonify({"msg": "User registered successfully", "user_id": user_id}), 201

    # ------------------ Login ------------------
    @app.route("/login", methods=["POST"])
    def login():
        data = request.get_json(force=True)
        mobile = data.get("mobile")
        password = data.get("password")

        if not mobile or not password:
            return jsonify({"msg": "Missing credentials"}), 400

        user = users_col.find_one({"Mobile": mobile})

        if not user or not check_password(password, user["Password"]):
            return jsonify({"msg": "Invalid mobile or password"}), 401

        identity = user.get("UserID")
        additional_claims = {"role": user.get("role", "user")}
        access_token = create_access_token(identity=identity, additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=identity, additional_claims=additional_claims)

        # Fetch wallet balance
        wallet_doc = wallets_col.find_one({"UserID": identity})
        wallet_balance = wallet_doc["Amount"] if wallet_doc else 1000.0

        # Fetch all transactions for this user
        user_transactions = list(transactions_col.find(
            {"UserID": identity},
            {"_id": 0}  # exclude MongoDB internal _id
        ))

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "UserID": identity,
                "Name": user.get("Name"),
                "role": user.get("role"),
                "Mobile": user.get("Mobile"),
                "City": user.get("City"),
                "Country": user.get("Country"),
                "PAN": user.get("PAN"),
                "Aadhaar": user.get("Aadhaar"),
                "wallet_balance": wallet_balance,
                "bills": user_transactions
            }
        }), 200

    # ------------------ Logout ------------------
    @app.route("/logout", methods=["POST"])
    @jwt_required()
    def logout():
        jti = get_jwt().get("jti")
        exp = get_jwt().get("exp")
        revoked_col.insert_one({"jti": jti, "expires": datetime.fromtimestamp(exp, tz=timezone.utc)})
        resp = jsonify({"msg": "Successfully logged out"})
        unset_jwt_cookies(resp)
        return resp, 200

    # ------------------ Payment ------------------
    @app.route("/payment", methods=["POST"])
    @jwt_required()
    def payment():
        data = request.get_json(force=True)
        user_id = get_jwt_identity()
        wallet_doc = wallets_col.find_one({"UserID": user_id})

        if not wallet_doc:
            return jsonify({"msg": "Wallet not found"}), 404

        # Verify MPIN
        input_mpin = data.get("mpin")
        if not input_mpin or not check_password(input_mpin, wallet_doc["MPIN"]):
            return jsonify({"msg": "Invalid MPIN"}), 401

        amount = float(data.get("amount", 0))
        if amount <= 0:
            return jsonify({"msg": "Payment amount must be positive"}), 400
        if amount > wallet_doc["Amount"]:
            return jsonify({"msg": "Insufficient balance"}), 400

        # Create Transaction document
        tx_doc = {
            "TxID": str(uuid.uuid4()),
            "UserID": user_id,
            "Amount": amount,
            "SpentOn": data.get("spentOn", "Misc"),
            "VendorDetails": data.get("vendor", ""),
            "Timestamp": datetime.now()
        }
        transactions_col.insert_one(tx_doc)

        # Update Wallet
        wallets_col.update_one(
            {"UserID": user_id},
            {
                "$inc": {"Amount": -amount},
                "$push": {"Transaction": tx_doc},
                "$set": {"LastModified": datetime.now()}
            }
        )

        return jsonify({
            "msg": "Payment successful",
            "transaction_id": tx_doc["TxID"],
            "new_balance": wallet_doc["Amount"] - amount
        }), 200

    @app.route("/wallet/topup", methods=["POST"])
    @jwt_required()
    def wallet_topup():
        data = request.get_json(force=True)
        user_id = get_jwt_identity()

        wallet_doc = wallets_col.find_one({"UserID": user_id})
        if not wallet_doc:
            return jsonify({"msg": "Wallet not found"}), 404

        # Validate MPIN
        input_mpin = data.get("mpin")
        if not input_mpin or not check_password(input_mpin, wallet_doc["MPIN"]):
            return jsonify({"msg": "Invalid MPIN"}), 401

        # Validate amount
        amount = float(data.get("amount", 0))
        if amount <= 0:
            return jsonify({"msg": "Top-up amount must be positive"}), 400

        old_balance = wallet_doc["Amount"]
        new_balance = old_balance + amount

        # Record the transaction
        tx_doc = {
            "TxID": str(uuid.uuid4()),
            "UserID": user_id,
            "Amount": amount,
            "Utility": "Wallet Top-up",
            "VendorDetails": "Self / Payment Gateway",
            "Timestamp": datetime.now(),
            "Status": "Paid",
            "ServiceNo": str(uuid.uuid4())
        }
        transactions_col.insert_one(tx_doc)

        # Update wallet balance
        wallets_col.update_one(
            {"UserID": user_id},
            {
                "$inc": {"Amount": amount},
                "$push": {"Transaction": tx_doc},
                "$set": {"LastModified": datetime.now()}
            }
        )

        return jsonify({
            "msg": "Wallet top-up successful",
            "transaction_id": tx_doc["TxID"],
            "old_balance": old_balance,
            "topup_amount": amount,
            "new_balance": new_balance
        }), 200


    # ------------------ Reminders ------------------
    @app.route("/reminders", methods=["GET", "POST"])
    @jwt_required()
    def reminders():
        user_id = get_jwt_identity()
        if request.method == "POST":
            data = request.get_json(force=True)
            reminder = {
                "ReminderID": str(uuid.uuid4()),
                "UserID": user_id,
                "title": data.get("title"),
                "utility_id": data.get("utility_id"),
                "due_date": data.get("due_date"),
                "notify_before_days": data.get("notify_before_days", 1),
                "created_on": datetime.now(),
                "last_modified": datetime.now(),
                "sent": False
            }
            reminders_col.insert_one(reminder)
            return jsonify({"msg": "Reminder created"}), 201
        else:  # GET request
            rems = list(reminders_col.find({"UserID": user_id}, {'_id': 0}))
            return jsonify({"reminders": rems}), 200

    # ------------------ Admin Stats ------------------
    @app.route("/admin/stats", methods=["GET"])
    @role_required(["admin"])
    def admin_stats():
        total_users = users_col.count_documents({})

        # More efficient way to calculate total balance using an aggregation pipeline
        pipeline = [{"$group": {"_id": None, "total": {"$sum": "$Amount"}}}]
        total_wallet_balance = list(wallets_col.aggregate(pipeline))[0]['total'] if wallets_col.count_documents(
            {}) > 0 else 0

        total_transactions = transactions_col.count_documents({})

        return jsonify({
            "total_users": total_users,
            "total_wallet_balance": total_wallet_balance,
            "total_transactions": total_transactions
        }), 200

    # ------------------ Spend Analysis ------------------
    @app.route("/user/spend-analysis", methods=["GET"])
    @jwt_required()
    def user_spend_analysis():
        user_id = get_jwt_identity()

        wallet_doc = wallets_col.find_one({"UserID": user_id})
        transactions = list(transactions_col.find({"UserID": user_id}, {"_id": 0}))

        if not wallet_doc:
            return jsonify({"msg": "Wallet not found"}), 404

        if not transactions:
            return jsonify({"msg": "No transactions found for user"}), 404

        wallet_balance = wallet_doc.get("Amount", 0.0)

        # Create a summarized prompt for Gemini
        context_text = f"""
        The user (ID: {user_id}) has a wallet balance of ₹{wallet_balance}.
        Here are their last 10 transactions:

        """

        for tx in transactions[-10:]:
            context_text += f"- ₹{tx.get('Amount')} spent on {tx.get('VendorDetails')} ({tx.get('SpentOn')})\n"

        context_text += """
        Provide a concise financial analysis (max 100 words) summarizing the user's spending behavior,
        highlighting key spending areas, and suggest 3 clear ways to save or manage money better.
        Format output as:
        1️⃣ Spending Summary
        2️⃣ Suggestions (3 short points)
        Keep it human-readable and well formatted.
        """

        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(context_text)
            analysis = response.text.strip()

            return jsonify({
                "user_id": user_id,
                "wallet_balance": wallet_balance,
                "analysis": analysis
            }), 200

        except Exception as e:
            return jsonify({"msg": "Error generating analysis", "error": str(e)}), 500

    @app.route("/bills", methods=["GET"])
    @jwt_required()
    def getbills():
        user_id = get_jwt_identity()

        wallet_doc = wallets_col.find_one({"UserID": user_id})
        transactions = list(transactions_col.find({"UserID": user_id}, {"_id": 0}))


        if not transactions:
            return jsonify({"msg": "No transactions found for user"}), 404

        return jsonify({
                "user_id": user_id,

                "transactions": transactions
            }), 200

