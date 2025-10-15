#Payani
Install dependencies:

pip install -r requirements.txt








# Backend Endpoints:
POST
http://localhost:5000/register
{
    "userID":"capayani",
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

POST 
http://localhost:5000/login
{
   
  "password": "Pass123!",
  "mobile": "9876543211"
 
}


POST
http://localhost:5000/logout

add access tokens in auth headers
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2MDUyNzA1OCwianRpIjoiN2ZiODZmMDAtMjUzMy00YWY2LTk3M2UtMTM1N2NiNzY4MWU0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImNhcGF5YW5pIiwibmJmIjoxNzYwNTI3MDU4LCJjc3JmIjoiMGYyNjY1YWEtZTI1My00Njk1LTg2YzUtM2ZmNTI5NjQwMzgyIiwiZXhwIjoxNzYwNTI3OTU4LCJyb2xlIjoidXNlciJ9.NshGjDajHAG4LefKAOnKjGPmgu6wiRVutacjmeexbB4
# bills endpoint to fetch amount to be paid
POST
http://localhost:5000/electricity/bill
{
  "state": "Tamil Nadu",
  "provider": "TNEB"
}

res:
{
    "ServiceNo": "E-1185-297-838-490",
    "bill_amount": 281.0,
    "userID": "capayani"
}

POST
http://localhost:5000/recharge/bill
{
  "provider": "Airtel"
}

res:
{
    "ServiceNo": "R-833-609-838-490",
    "bill_amount": 277.0,
    "userID": "capayani"
}

POST
http://localhost:5000/dth/bill
{
  "provider": "Airtel DTH"
}
res:
{
    "ServiceNo": "D-320-865-838-490",
    "bill_amount": 251.3,
    "userID": "capayani"
}

POST
http://localhost:5000/creditcard/bill
{
  "provider": "SBI Card"
}
res:
{
    "ServiceNo": "C-1045-632-838-490",
    "bill_amount": 294.1,
    "userID": "capayani"
}

# ############################################
POST
http://127.0.0.1:5000/water/bill
{
  "city": "Mumbai",
  "provider": "BMC Water"
}

res:
{
    "ServiceNo": "W-547-757-838-490",
    "bill_amount": 263.2,
    "userID": "capayani"
}

POST
http://127.0.0.1:5000/gas/bill
{
  "state": "Karnataka",
  "provider": "Indane"
}

res:
{
    "ServiceNo": "G-315-591-838-490",
    "bill_amount": 223.4,
    "userID": "capayani"
}

POST
http://127.0.0.1:5000/fasttag/bill
{
    "provider": "ICICI FastTag"
}

res:
{
    "ServiceNo": "F-746-1067-838-490",
    "bill_amount": 314.1,
    "userID": "capayani"
}

POST
http://127.0.0.1:5000/loanrepayment/bill
{
  "provider": "HDFC"
}

res:
{
    "ServiceNo": "L-426-277-838-490",
    "bill_amount": 203.1,
    "userID": "capayani"
}




# endpoints for payment

POST
http://localhost:5000/creditcard/pay
{
    "service_no": "C-1045-632-838-490",
    "bill_amount": 294.1,
    "mobile":"9876543210",
  "state": "Tamil Nadu",
  "provider": "SBI Card",
  "mpin":"1234",
  "card_number": 15655276562625
}

res:
{
    "RemainingBalance": 705.9,
    "TxID": "c403eb22-e11a-48fb-9606-7adb69ab26f1",
    "msg": "Credit Card payment successful"
}


POST
http://localhost:5000/dth/pay
{
    "service_no": "D-320-865-838-490",
    "bill_amount": 251.3,
    "mobile":"9876543210",
  "state": "Tamil Nadu",
  "provider": "Airtel DTH",
  "mpin":"1234"
}
res:
{
    "msg": "DTH payment successful",
    "new_balance": 454.59999999999997,
    "vendor": "DTH : Airtel DTH"
}

POST
http://localhost:5000/recharge/pay
{
    "service_no": "R-833-609-838-490",
    "bill_amount": 111,
    "mobile":"9876543210",
  "state": "Tamil Nadu",
  "provider": "Airtel",
  "mpin":"1234"
} 
Res:
{
    "msg": "Recharge successful",
    "new_balance": 343.59999999999997,
    "vendor": "Recharge : Airtel"
}

POST
http://localhost:5000/electricity/pay
{
    "service_no": "E-1185-297-838-490",
    "bill_amount": 111,
    "mobile":"9876543210",
  "state": "Tamil Nadu",
  "provider": "TANGEDCO",
  "mpin":"1234"
}
Res:
{
    "msg": "Electricity payment successful",
    "new_balance": 232.59999999999997,
    "vendor": "Electricity : Tamil Nadu : TANGEDCO"
}

Electricity:
service_no = f"E-{sum_ascii('electricity')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"

POST
http://localhost:5000/wallet/topup
{
      "amount": "1000",
  "mpin": "1234"
}

# #########################

POST
http://127.0.0.1:5000/water/pay
{
  "city": "Mumbai",
  "provider": "BMC Water",
  "mobile": "9876543210",
  "bill_amount": 263.2,
  "mpin": "1234",
  "service_no": "W-547-757-838-490"
}

res:
{
    "msg": "Water bill payment successful",
    "new_balance": 395.7,
    "vendor": "Water : Mumbai : BMC Water"
}


POST
http://127.0.0.1:5000/gas/pay
{
    "state": "Karnataka",
    "provider": "Indane",
    "mobile": "9876543210",
    "bill_amount": 199.3,
    "mpin": "1234",
    "service_no": "G-315-591-597-490"
}

res:
{
    "msg": "Gas bill payment successful",
    "new_balance": 196.39999999999998,
    "vendor": "Gas : Karnataka : Indane"
}


POST
http://127.0.0.1:5000/fasttag/pay
{
    "provider": "ICICI FastTag",
    "mobile": "9876543210",
    "bill_amount": 314.1,
    "mpin": "1234",
    "service_no": "F-746-1067-838-490"
}

res:
{
    "msg": "FastTag payment successful",
    "new_balance": 685.9,
    "vendor": "FastTag : ICICI FastTag"
}

POST
http://127.0.0.1:5000/loanrepayment/pay
{
  "provider": "HDFC",
  "mobile": "9876543210",
  "bill_amount":203.1,
  "mpin": "1234",                    
  "service_no": "L-426-277-838-490"
}

res:
{
    "msg": "Loan repayment successful",
    "new_balance": 482.79999999999995,
    "vendor": "Loan : HDFC"
}
