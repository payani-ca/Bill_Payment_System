import pytest
import requests

BASE_URL = "http://localhost:5000"

recharge_service_no = ""
dth_service_no = ""
cc_service_no = ""
gas_service_no = ""
water_service_no = ""
loan_service_no = ""
fasttag_service_no = ""

# -------------------- FIXTURES --------------------

@pytest.fixture(scope="session")
def user_data():
    return {
        "userID": "capayani",
        "name": "John Doe",
        "password": "Pass123!",
        "mobile": "9876543210",
        "dob": "1990-01-01",
        "city": "Mumbai",
        "country": "India",
        "mpin": "1234",
        "pan": "DROOO7827U",
        "aadhar": "123456792678",
        "wallet_balance": 1000
    }


@pytest.fixture(scope="session")
def token():
    """Register (if needed) and login user"""
    # Try register first
    requests.post(f"{BASE_URL}/register", json={
        "userID": "capayani",
        "name": "John Doe",
        "password": "Pass123!",
        "mobile": "9876543210",
        "dob": "1990-01-01",
        "city": "Mumbai",
        "country": "India",
        "mpin": "1234",
        "pan": "DRO0O7827U",
        "aadhar": "123456792678",
        "wallet_balance": 1000
    })

    # Login
    resp = requests.post(f"{BASE_URL}/login", json={
        "mobile": "9876543210",
        "password": "Pass123!"
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    access_token = resp.json()["access_token"]
    yield access_token


def auth_headers(token):
    """Attach Authorization header"""
    return {"Authorization": f"Bearer {token}"}


# -------------------- TESTS --------------------

def test_register(user_data):
    """User registration and invalid mobile"""
    resp = requests.post(f"{BASE_URL}/register", json=user_data)
    assert resp.status_code in [201, 409]

    invalid_data = user_data.copy()
    invalid_data["mobile"] = "999"
    resp = requests.post(f"{BASE_URL}/register", json=invalid_data)
    assert resp.status_code == 400
    assert "Invalid mobile" in resp.text


def test_login_success(token):
    assert token is not None
    assert len(token) > 10


def test_login_invalid_password():
    resp = requests.post(f"{BASE_URL}/login", json={
        "mobile": "9876543211",
        "password": "wrongpass"
    })
    assert resp.status_code == 401
    assert "Invalid mobile or password" in resp.text


# -------------------- ELECTRICITY --------------------

def test_electricity_bill(token):
    resp = requests.post(f"{BASE_URL}/electricity/bill",
                         json={"state": "Tamil Nadu", "provider": "TNEB"},
                         headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    pytest.elec_service_no = data.get("ServiceNo")
    assert "bill_amount" in data


def test_electricity_pay(token):
    if not hasattr(pytest, "elec_service_no"):
        pytest.skip("No electricity ServiceNo found")

    bill = requests.post(f"{BASE_URL}/electricity/bill",
                         json={"state": "Tamil Nadu", "provider": "TNEB"},
                         headers=auth_headers(token)).json()

    pay_data = {
        "service_no": bill["ServiceNo"],
        "bill_amount": bill["bill_amount"],
        "mobile": "9876543210",
        "state": "Tamil Nadu",
        "provider": "TNEB",
        "mpin": "1234"
    }
    resp = requests.post(f"{BASE_URL}/electricity/pay",
                         json=pay_data, headers=auth_headers(token))
    assert resp.status_code in [200, 400]


# -------------------- RECHARGE --------------------

def test_recharge_bill(token):
    """Generate recharge bill (mobile recharge)"""
    resp = requests.post(f"{BASE_URL}/recharge/bill",
                         json={"provider": "Airtel",   "userID": "capayani"},
                         headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    global recharge_service_no
    recharge_service_no= data.get("ServiceNo")
    assert "bill_amount" in data


def test_recharge_pay(token):
    global recharge_service_no
    pay_data = {
        "userID": "capayani",
        "service_no":recharge_service_no,
        "bill_amount": 199,
        "mobile": "9876543210",
        "provider": "Airtel",
        "mpin": "1234"
    }
    resp = requests.post(f"{BASE_URL}/recharge/pay",
                         json=pay_data, headers=auth_headers(token))
    assert resp.status_code in [200, 400]


# -------------------- DTH --------------------

def test_dth_bill(token):
    """Generate DTH bill"""
    resp = requests.post(f"{BASE_URL}/dth/bill",
                         json={"provider": "Sun Direct"},
                         headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    global dth_service_no
    dth_service_no = data.get("ServiceNo")
    assert "bill_amount" in data


def test_dth_pay(token):

    global dth_service_no


    pay_data = {
        "service_no":dth_service_no,
        "provider": "Sun Direct",
        "subscriber_id": "12345678",
        "amount": 250,
        "mpin": "1234"
    }
    resp = requests.post(f"{BASE_URL}/dth/pay",
                         json=pay_data, headers=auth_headers(token))
    assert resp.status_code in [200, 400]


# -------------------- CREDIT CARD --------------------

def test_creditcard_bill(token):
    """Generate Credit Card bill"""
    resp = requests.post(f"{BASE_URL}/creditcard/bill",
                         json={ "provider": "SBI Card"},
                         headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    global cc_service_no
    cc_service_no = data.get("ServiceNo")
    assert "bill_amount" in data


def test_creditcard_pay(token):
    global cc_service_no

    pay_data = {
        "service_no": cc_service_no,
        "bill_amount": 294.0,
        "mobile":"9876543210",
        "state": "Tamil Nadu",
        "provider": "SBI Card",
        "mpin":"1234",
        "card_number": 15655276562625
    }
    resp = requests.post(f"{BASE_URL}/creditcard/pay",
                         json=pay_data, headers=auth_headers(token))
    assert resp.status_code in [200, 400]


# -------------------- GAS --------------------

def test_gas_bill(token):
    """Generate Gas bill"""
    resp = requests.post(f"{BASE_URL}/gas/bill",
                         json={"state": "Karnataka", "provider": "Indane"},
                         headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    global gas_service_no
    gas_service_no = data.get("ServiceNo")
    assert "bill_amount" in data


def test_gas_pay(token):
    global gas_service_no

    pay_data = {
        "service_no": gas_service_no,
        "bill_amount": 290.0,
        "mobile": "9876543210",
        "state": "Karnataka",
        "provider": "Indane",
        "mpin": "1234"
    }
    resp = requests.post(f"{BASE_URL}/gas/pay",
                         json=pay_data, headers=auth_headers(token))
    assert resp.status_code in [200, 400]


# -------------------- WATER --------------------
def test_water_bill(token):
    """Generate Water bill"""
    resp = requests.post(f"{BASE_URL}/water/bill",
                         json={"city": "Mumbai", "provider": "BMC Water"},
                         headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    global water_service_no
    water_service_no = data.get("ServiceNo")
    assert "bill_amount" in data


def test_water_pay(token):
    global water_service_no

    pay_data = {
        "service_no": water_service_no,
        "bill_amount": 180.0,
        "mobile": "9876543210",
        "state": "Maharashtra",
        "provider": "BMC",
        "mpin": "1234"
    }
    resp = requests.post(f"{BASE_URL}/water/pay",
                         json=pay_data, headers=auth_headers(token))
    assert resp.status_code in [200, 400]


# -------------------- LOAN REPAYMENT --------------------

def test_loanrepayment_bill(token):
    """Generate Loan Repayment bill"""
    resp = requests.post(f"{BASE_URL}/loanrepayment/bill",
                         json={"provider": "HDFC"},
                         headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    global loan_service_no
    loan_service_no = data.get("ServiceNo")
    assert "bill_amount" in data


def test_loanrepayment_pay(token):
    global loan_service_no

    pay_data = {
        "service_no": loan_service_no,
        "bill_amount": 500.0,
        "mobile": "9876543210",
        "provider": "HDFC Bank",
        "mpin": "1234"
    }
    resp = requests.post(f"{BASE_URL}/loanrepayment/pay",
                         json=pay_data, headers=auth_headers(token))
    assert resp.status_code in [200, 400]


# -------------------- FASTTAG --------------------

def test_fasttag_bill(token):
    """Generate FastTag bill"""
    resp = requests.post(f"{BASE_URL}/fasttag/bill",
                         json={"provider": "ICICI FastTag"},
                         headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    global fasttag_service_no
    fasttag_service_no = data.get("ServiceNo")
    assert "bill_amount" in data


def test_fasttag_pay(token):
    global fasttag_service_no

    pay_data = {
        "service_no": fasttag_service_no,
        "bill_amount": 350.0,
        "mobile": "9876543210",
        "provider": "ICICI FastTag",
        "mpin": "1234"
    }
    resp = requests.post(f"{BASE_URL}/fasttag/pay",
                         json=pay_data, headers=auth_headers(token))
    assert resp.status_code in [200, 400]

# -------------------- LOGOUT --------------------

def test_logout(token):
    resp = requests.post(f"{BASE_URL}/logout", headers=auth_headers(token))
    assert resp.status_code == 200
    assert "Successfully logged out" in resp.text
