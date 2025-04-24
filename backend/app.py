from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.security import generate_password_hash, check_password_hash
import requests
import random
import pandas as pd
from openai import OpenAI
import traceback


load_dotenv()

app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key")
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
jwt = JWTManager(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(50), nullable = False)
    password_hash = db.Column(db.String(256), nullable = False)

    def to_dict(self):
        return{
            "id": self.id,
            "username": self.username
        }
    
class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    drug = db.Column(db.String(100), nullable = False)
    dosage = db.Column(db.String(50), nullable = False)
    freq = db.Column(db.String(50), nullable = False)
    days = db.Column(db.String(20), nullable = False)
    interaction = db.Column(db.Boolean)
    background_med = db.Column(db.String(100), nullable = False)
    question = db.Column(db.String(200))
    completed = db.Column(db.Boolean , default = False)
    date = db.Column(db.String(20))
    qty = db.Column(db.Integer)

    def to_dict(self):
        return{
            "id": self.id,
            "user_id": self.user_id,
            "drug": self.drug,
            "dosage": self.dosage,
            "freq": self.freq,
            "days": self.days,
            "interaction": self.interaction,
            "background_med": self.background_med,
            "question": self.question,
            "completed": self.completed,
            "date": self.date,
            "qty": self.qty
        }
    
class Result(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    presc = db.Column(db.Integer, db.ForeignKey("prescription.id"))
    qty = db.Column(db.Integer, nullable = False)
    drug_name = db.Column(db.String(40), nullable = False)
    dosageResp = db.Column(db.Integer, nullable = False)
    interactResp = db.Column(db.Boolean, nullable = False)
    questionResp = db.Column(db.String(100), nullable = False)
    aiResp = db.Column(db.String(200))
    score = db.Column(db.Integer)

    def to_dict(self):
        return{
            "id": self.id,
            "presc": self.presc,
            "qty": self.qty,
            "drug_name": self.drug_name,
            "dosageResp": self.dosageResp,
            "interactResp": self.interactResp,
            "questionResp": self.questionResp,
            "aiResp": self.aiResp,
            "score": self.score
        }
    
df = pd.read_csv("ddinter_downloads_code_A.csv")

with app.app_context():
    db.create_all()

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("Invalid token callback:", error)
    return jsonify({"msg": "Invalid token", "error": error}), 422


@jwt.unauthorized_loader
def unauthorized_callback(error):
    print("Unauthorized callback:", error)
    return jsonify({"msg": "Missing token", "error": error}), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("Expired token callback")
    return jsonify({"msg": "Token has expired"}), 401


@app.route("/api/signup", methods = ["POST"])
def sign_up():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    existing_User = User.query.filter_by(username = username).first()

    if existing_User:
        return jsonify({"message": "username exists"})
    
    hashed_password = generate_password_hash(password)

    new_User = User(username = username, password_hash = hashed_password)
    db.session.add(new_User)
    db.session.commit()

    token = create_access_token(identity=str(new_User.id))
    return jsonify({
        "access_token": token,
        "user": new_User.to_dict()
    }), 201

@app.route("/api/login", methods = ["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    loggingInUser = User.query.filter_by(username = username).first()

    if not loggingInUser or not check_password_hash(loggingInUser.password_hash, password):
        return jsonify({"message": "Invalid credentials"}), 401
    
    token = create_access_token(identity=str(loggingInUser.id))

    return jsonify({
        "access_token": token,
        "user": loggingInUser.to_dict()
    }), 200

@app.route("/api/username" , methods = ["GET"])
@jwt_required()
def get_username():
    id = get_jwt_identity()

    user = db.session.get(User, id)

    return jsonify({"username": user.username})

@app.route("/api/createprescription", methods = ["POST"])
@jwt_required()
def create_presc():
    drug_list = ["Amoxicillin", "Ibuprofen", "Acetaminophen", "Metformin", "Lisinopril", "Dexamethasone"]
    user_id = get_jwt_identity()
    dosagesList = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1100, 1200]
    freqsList = ["QD", "BID", "TID", "QID"]
    daysList = [5, 7, 10, 14, 30]
    drug1 = random.choice(drug_list)
    drug_list.remove(drug1)
    drug2 = random.choice(drug_list)
    drug_list.append(drug1)

    mask = (
        ((df["Drug_A"] == drug1) & (df["Drug_B"] == drug2)) | ((df["Drug_A"] == drug2) & (df["Drug_B"] == drug1))
    )

    result = df[mask]
    interaction = False
    if result.empty or all(result["Level"] == "Unknown"):
        interaction = False
    else:
        interaction = True
    
    dosage = random.choice(dosagesList)
    freq = random.choice(freqsList)
    days = random.choice(daysList)

    messages = [
        {"role": "system", "content": "You are a helpful pharmacy assistant."},
        {"role": "user",   "content": f"Pretend you're a patient, find a side effect of {drug1} ask a pharmacist about the side effect of {drug1}. Do not mention that you are a patient"}
    ]

    try:
        resp = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=60,
            temperature=0.7
        )
        question = resp.choices[0].message.content.strip()
        new_presc = Prescription(user_id = user_id, drug = drug1, dosage = dosage, freq = freq, days = days, interaction = interaction, background_med = drug2, question = question)
        db.session.add(new_presc)
        db.session.commit()
        return jsonify({"id": new_presc.id})

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/getpresc", methods = ["GET"])
@jwt_required()
def get_presc():
    id = request.args.get("id", type=int)

    presc = db.session.get(Prescription, id)

    return jsonify(presc.to_dict())

@app.route("/api/results", methods = ["POST"])
@jwt_required()
def get_results():
    data = request.get_json()

    prescId = int(data["prescId"])
    interactResponse = data.get("interactResponse")
    questionResponse = data.get("questionResponse")
    qty = int(data["qty"])
    dosageResponse = int(data["dosageResponse"])
    drugResponse = data.get("drugResponse")

    if interactResponse == "Yes":
        interactResponse = True
    else:
        interactResponse = False

    new_result = Result(presc = prescId, qty = qty, interactResp = interactResponse, drug_name = drugResponse, questionResp = questionResponse, dosageResp = dosageResponse)

    db.session.add(new_result)
    db.session.commit()

    return jsonify({"id": new_result.id})

@app.route("/api/calculate", methods = ["GET"])
@jwt_required()
def calculate():
    resultId = request.args.get("resultId", type=int)
    date = request.args.get("dateString")

    result = db.session.get(Result, resultId)
    presc = db.session.get(Prescription, result.presc)

    score = 0

    if result.drug_name == presc.drug:
        score += 1
    try:
        if int(result.dosageResp) == int(presc.dosage):
            score += 1
    except ValueError:
        pass

    if result.interactResp == presc.interaction:
        score += 2

    correctQty = 0

    try:
        days = int(presc.days)
    except ValueError:
        days = 0
    
    if presc.freq == "QID":
        correctQty = days * 4

    elif presc.freq == "BID":
        correctQty = days * 2

    elif presc.freq == "TID":
        correctQty = days * 3
    
    else:
        correctQty = days
    
    if result.qty == correctQty:
        score += 1


    messages = [
        {"role": "system", "content": "You are rating a response from a pharmacist."},
        {"role": "user",   "content": f"Here is a question asked by a fake patient: {presc.question}. Here is the response from a student studying to be a pharmacist: {result.questionResp}. Rate the response out of 5 and give a sentence on what the student could have said better. Give a response like this: 2/5. The student could have provided more accurate and specific information..."}
    ]

    try:
        resp = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=80,
            temperature=0.7
        )
        message = resp.choices[0].message.content.strip()
        presc.completed = True
        presc.date = date
        presc.qty = correctQty
        messageScore = int(message[0])
        result.aiResp = message
        result.score = score + messageScore
        db.session.commit()
        return jsonify({"score": score, "question": message})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/history",  methods = ["GET"])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()

    history = Prescription.query.filter_by(user_id = user_id)
    completed = history.filter_by(completed = True)

    historyArray = []
    for complete in completed:
        historyArray.append(complete.to_dict())
    
    return jsonify(historyArray), 200
    
@app.route("/api/getresult", methods = ["GET"])
@jwt_required()
def get_result():
    prescId = request.args.get("id")

    result = Result.query.filter_by(presc = prescId).first()

    return jsonify(result.to_dict()), 200

@app.route("/api/score", methods = ["GET"])
@jwt_required()
def avg_score():
    user_id = get_jwt_identity()

    allPrescs = Prescription.query.filter_by(user_id = user_id, completed = True).all()
    total = len(allPrescs)

    if total == 0:
        return jsonify({"total": 0})

    scoreTotal = 0

    for presc in allPrescs:
        result = Result.query.filter_by(presc = presc.id).first()
        if result and result.score is not None:
            scoreTotal += result.score
    
    avg = round(scoreTotal / total, 1)

    return jsonify({"total" : avg})



if __name__ == "__main__":
    app.run(debug=True)