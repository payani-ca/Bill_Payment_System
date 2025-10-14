# seed_data.py
import random
import string
from datetime import datetime, timedelta
from pymongo import MongoClient
from constants.utilitiesconst import UTILITIES
import uuid

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["billingsystem"]

def random_mobile():
    return f"9{random.randint(100000000, 999999999)}"

def random_name():
    first = random.choice(["Arun", "Divya", "Kiran", "Sneha", "Vikram", "Priya", "Rahul", "Sita", "Vijay", "Asha"])
    last = random.choice(["Kumar", "Reddy", "Nair", "Patel", "Sharma", "Gupta", "Iyer"])
    return f"{first} {last}"

def random_city():
    return random.choice(["Hyderabad", "Bangalore", "Mumbai", "Chennai", "Delhi", "Pune"])

def random_country():
    return "India"

def random_wallet_balance():
    return round(random.uniform(100, 10000), 2)

def random_provider(utility_type):
    if isinstance(UTILITIES[utility_type], list):
        return random.choice(UTILITIES[utility_type])
    elif isinstance(UTILITIES[utility_type], dict):
        state = random.choice(list(UTILITIES[utility_type].keys()))
        provider = random.choice(UTILITIES[utility_type][state])
        return state, provider
    return None

def create_seed_data():
    db.Users.drop()
    db.Wallets.drop()
    db.Transactions.drop()
    db.Utilities.drop()

    users = []
    wallets = []
    transactions = []
    utilities = []

    now = datetime.now()

    # Create 20 Users
    for i in range(20):
        user_id = str(uuid.uuid4())
        user = {
            "_id": user_id,
            "Name": random_name(),
            "Password": ''.join(random.choices(string.ascii_letters + string.digits, k=8)),
            "Mobile": random_mobile(),
            "dob": str(datetime(1990, 1, 1) + timedelta(days=random.randint(0, 10000))),
            "city": random_city(),
            "country": "India",
            "country_code": "+91",
            "wallet_balance": random_wallet_balance(),
            "LastLoginDate": now - timedelta(days=random.randint(1, 30)),
            "LastModified": now,
            "CreatedOn": now,
            "DeletedOn": None
        }
        users.append(user)

        wallet = {
            "_id": str(uuid.uuid4()),
            "UserID": user_id,
            "Amount": user["wallet_balance"],
            "Transaction": [],
            "MPIN": f"{random.randint(1000, 9999)}",
            "LastModified": now,
            "CreatedOn": now,
            "DeletedOn": None
        }
        wallets.append(wallet)

        # Add 3 Transactions per user
        for j in range(3):
            tx = {
                "_id": str(uuid.uuid4()),
                "Amount": round(random.uniform(50, 500), 2),
                "spentOn": random.choice(["Electricity", "Recharge", "Water", "CreditCard", "Gas"]),
                "Date": (now - timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d"),
                "Time": (now - timedelta(hours=random.randint(1, 100))).strftime("%H:%M:%S"),
                "UserID": user_id,
                "VendorDetails": random.choice(["Paytm", "PhonePe", "Google Pay", "Amazon Pay"]),
                "LastModified": now,
                "CreatedOn": now,
                "DeletedOn": None
            }
            transactions.append(tx)

        # Add 2 Utilities per user
        for k in range(2):
            utility_type = random.choice(list(UTILITIES.keys()))
            state, provider = (None, None)
            if isinstance(UTILITIES[utility_type], dict):
                state = random.choice(list(UTILITIES[utility_type].keys()))
                provider = random.choice(UTILITIES[utility_type][state])
            else:
                provider = random.choice(UTILITIES[utility_type])

            utility = {
                "_id": str(uuid.uuid4()),
                "UtilityName": utility_type.capitalize(),
                "Amount": round(random.uniform(100, 1000), 2),
                "Status": random.choice(["Paid", "Pending"]),
                "Date": (now - timedelta(days=random.randint(1, 5))).strftime("%Y-%m-%d"),
                "UtilityID": str(uuid.uuid4()),
                "DueDate": (now + timedelta(days=random.randint(3, 20))).strftime("%Y-%m-%d"),
                "UserID": user_id,
                "state": state,
                "provider": provider,
                "Service#": str(random.randint(100000, 999999)),
                "mobile": user["Mobile"],
                "nextDueDate": (now + timedelta(days=random.randint(20, 40))).strftime("%Y-%m-%d"),
                "LastModified": now,
                "CreatedOn": now,
                "DeletedOn": None
            }
            utilities.append(utility)

    # Insert all
    db.Users.insert_many(users)
    db.Wallets.insert_many(wallets)
    db.Transactions.insert_many(transactions)
    db.Utilities.insert_many(utilities)

    print(f"Seeded {len(users)} Users, {len(wallets)} Wallets, {len(transactions)} Transactions, {len(utilities)} Utilities into MongoDB.")


# if __name__ == "__main__":
#     create_seed_data()
