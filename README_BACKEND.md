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
  "mobile": "9876543211",
  "dob": "1990-01-01",
  "city": "Mumbai",
  "country": "India",
  "mpin": "1234",
  "pan": "DROO7827U",
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


# To get service# for electricity
POST
http://localhost:5000/electricity/service_no
{
  "state": "Tamil Nadu",
  "provider": "TNEB"
}

POST
http://localhost:5000/recharge/service_no
{
  "provider": "Airtel"
}

POST
http://localhost:5000/dth/service_no
{
  "provider": "Airtel DTH"
}

POST
http://localhost:5000/creditcard/service_no
{
  "provider": "SBI Card"
}

# bills endpoint to fetch amount to be paid
POST
http://localhost:5000/electricity/bill
{
  "state": "Tamil Nadu",
  "provider": "TNEB"
}

POST
http://localhost:5000/recharge/bill
{
  "provider": "Airtel"
}

POST
http://localhost:5000/dth/bill
{
  "provider": "Airtel DTH"
}

POST
http://localhost:5000/creditcard/bill
{
  "provider": "SBI Card"
}

# endpoints for payment

POST
http://localhost:5000/creditcard/pay
{
    "service_no": "C-833-609-838-490",
    "bill_amount": 277.0,
    "mobile":"9876543210",
  "state": "Tamil Nadu",
  "provider": "SBI Card",
  "mpin":"1234",
  "card_number": 15655276562625
}

#Prasad
Electricity:
service_no = f"E-{sum_ascii('electricity')}-{sum_ascii(provider)}-{sum_ascii(user_id)}-{sum_ascii(today)}"
