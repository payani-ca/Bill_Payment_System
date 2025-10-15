#Payani
Install dependencies:

pip install -r requirements.txt








#Backend Endpoints:
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






#Prasad