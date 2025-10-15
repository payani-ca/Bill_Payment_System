# app.py
from flask import Flask
from seed_data import create_seed_data
import os
import secrets
from electricity import electricity_bp
from recharge import recharge_bp
from dth import dth_bp
from creditcard import credit_bp
from flask_cors import CORS
from water import water_bp
from gas import gas_bp
from fasttag import fasttag_bp
from loanrepayment import loan_bp


app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", secrets.token_hex(32))

CORS(app, supports_credentials=True)

# Run seeding once at startup
with app.app_context():
    create_seed_data()

from controllers import init_routes
init_routes(app)
# ---- Register Blueprints ----
app.register_blueprint(electricity_bp)
app.register_blueprint(recharge_bp)
app.register_blueprint(dth_bp)
app.register_blueprint(credit_bp)
app.register_blueprint(water_bp)
app.register_blueprint(gas_bp)
app.register_blueprint(fasttag_bp)
app.register_blueprint(loan_bp)

@app.route("/")
def index():
    return {"message": "Bill Payment System API Initialized and Data Seeded"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
