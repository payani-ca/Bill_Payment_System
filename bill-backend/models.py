# models.py
import uuid
from datetime import datetime
import bcrypt

# ------------------ Helper Functions ------------------
def generate_user_id():
    """Generate a custom alphanumeric UserID."""
    return str(uuid.uuid4())[:8]  # 8-char alphanumeric

def generate_tx_id():
    """Generate Transaction ID."""
    return str(uuid.uuid4())[:10]

def generate_utility_id():
    """Generate Utility ID."""
    return str(uuid.uuid4())[:10]

def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

def hash_mpin(mpin: str) -> bytes:
    return bcrypt.hashpw(mpin.encode("utf-8"), bcrypt.gensalt())

# ------------------ BaseModel ------------------
class BaseModel:
    def __init__(self):
        self.CreatedOn = datetime.now()
        self.LastModified = datetime.now()
        self.DeletedOn = None

# ------------------ User ------------------
class User(BaseModel):
    def __init__(self, userID, name, password, mobile, dob, city, pan, aadhar, country, country_code="+91", wallet_balance=0.0, role="user"):
        super().__init__()
        self._id = str(uuid.uuid4())           # internal MongoDB _id
        self.UserID = userID       # custom alphanumeric
        self.Name = name
        self.Password = hash_password(password)
        self.Mobile = mobile
        self.dob = dob
        self.city = city
        self.country = country
        self.pan = pan,
        self.aadhar = aadhar
        self.country_code = country_code
        self.wallet_balance = wallet_balance
        self.role = role
        self.LastLoginDate = None

# ------------------ Wallet ------------------
class Wallet(BaseModel):
    def __init__(self, user_id, amount=0.0, mpin=None):
        super().__init__()
        self._id = str(uuid.uuid4())
        self.WalletID = str(uuid.uuid4())[:8]
        self.UserID = user_id
        self.Amount = amount
        self.Transaction = []          # list of Transaction dicts
        self.MPIN = hash_mpin(mpin) if mpin else None

# ------------------ Transaction ------------------
class Transaction(BaseModel):
    def __init__(self, user_id, amount, spent_on="Misc", vendor_details=""):
        super().__init__()
        self.TxID = generate_tx_id()
        self.Amount = amount
        self.spentOn = spent_on
        self.Date = datetime.now().date()
        self.Time = datetime.now().time()
        self.UserID = user_id
        self.VendorDetails = vendor_details

# ------------------ Utilities (Parent Class) ------------------
class Utility(BaseModel):
    def __init__(self, user_id, amount, status="Pending", utility_name="", due_date=None):
        super().__init__()
        self.UtilityID = generate_utility_id()
        self.UserID = user_id
        self.UtilityName = utility_name
        self.Amount = amount
        self.Status = status          # Paid / Pending
        self.DueDate = due_date or datetime.now().date()

# ------------------ Child Classes ------------------
class Electricity(Utility):
    def __init__(self, user_id, amount, state, provider, service_no, mobile, next_due_date=None):
        super().__init__(user_id, amount, utility_name="Electricity", due_date=next_due_date)
        self.state = state
        self.provider = provider
        self.ServiceNo = service_no
        self.Mobile = mobile
        self.NextDueDate = next_due_date

class Gas(Utility):
    def __init__(self, user_id, amount, state, provider, service_no, mobile, next_due_date=None):
        super().__init__(user_id, amount, utility_name="Gas", due_date=next_due_date)
        self.state = state
        self.provider = provider
        self.ServiceNo = service_no
        self.Mobile = mobile
        self.NextDueDate = next_due_date

class Water(Utility):
    def __init__(self, user_id, amount, state, provider, service_no, next_due_date=None):
        super().__init__(user_id, amount, utility_name="Water", due_date=next_due_date)
        self.state = state
        self.provider = provider
        self.ServiceNo = service_no
        self.NextDueDate = next_due_date

class CreditCard(Utility):
    def __init__(self, user_id, amount, card_no, mobile, name, bank_id, bank_name, next_due_date=None):
        super().__init__(user_id, amount, utility_name="CreditCard", due_date=next_due_date)
        self.CardNo = card_no
        self.Mobile = mobile
        self.Name = name
        self.BankID = bank_id
        self.BankName = bank_name
        self.NextDueDate = next_due_date

class Recharge(Utility):
    def __init__(self, user_id, amount, provider, mobile, validity, next_due_date=None):
        super().__init__(user_id, amount, utility_name="Recharge", due_date=next_due_date)
        self.Provider = provider
        self.Mobile = mobile
        self.Validity = validity
        self.NextDueDate = next_due_date

class DTH(Utility):
    def __init__(self, user_id, amount, provider, mobile, service_no, next_due_date=None):
        super().__init__(user_id, amount, utility_name="DTH", due_date=next_due_date)
        self.Provider = provider
        self.Mobile = mobile
        self.ServiceNo = service_no
        self.NextDueDate = next_due_date

class FastTag(Utility):
    def __init__(self, user_id, amount, provider, vehicle_no, mobile, next_due_date=None):
        super().__init__(user_id, amount, utility_name="FastTag", due_date=next_due_date)
        self.Provider = provider
        self.VehicleNo = vehicle_no
        self.Mobile = mobile
        self.NextDueDate = next_due_date

class LoanRepayment(Utility):
    def __init__(self, user_id, amount, provider, service_no, mobile, next_due_date=None):
        super().__init__(user_id, amount, utility_name="LoanRepayment", due_date=next_due_date)
        self.Provider = provider
        self.ServiceNo = service_no
        self.Mobile = mobile
        self.NextDueDate = next_due_date
