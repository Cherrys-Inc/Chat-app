import os

from flask_socketio import SocketIO, emit
from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from jinja2 import meta

app = Flask(__name__)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URI")
db = SQLAlchemy(app)
app.config['SECRET_KEY'] = os.getenv("secret")
app.host = "http://localhost:3000"
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")
online_users = {}


class User(db.Model):
    userName = db.Column(db.String(200))
    email = db.Column(db.String(200))
    uid = db.Column(db.String(200), primary_key=True)
    isOnline = db.Column(db.Integer)


class Messagedb(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500))
    sender = db.Column(db.String(500))
    receiver = db.Column(db.String(200))


def to_json(self):
    return {
        'userName': self.userName,
        'email': self.email,
        'uid': self.uid,
        'isOnline': self.isOnline

    }


@app.route('/add', methods=['POST'])
@cross_origin()
def create():
    user = User()
    json_data = request.get_json(force=True)
    user.userName = json_data['userName']
    user.email = json_data['email']
    user.uid = json_data['uid']
    user.isOnline = json_data['isOnline']

    db.session.add(user)
    db.session.commit()
    return "Record added"


@app.route('/get', methods=['GET'])
def home():
    data = []
    user_list = User.query.all()

    for user in user_list:
        data.append(user.email)
    return jsonify(data)


@app.route('/send', methods=['POST'])
def save_message():
    messagedb = Messagedb()
    msg_data = request.get_json(force=True)
    messagedb.message = msg_data['message']
    messagedb.sender = msg_data['from']
    messagedb.receiver = msg_data['to']
    db.session.add(messagedb)
    db.session.commit()
    return "Record added"


@app.route('/response', methods=['GET', 'POST'])
def response():
    msg_det = request.get_json()
    query1 = Messagedb.query.filter_by(sender=str(msg_det["from"]), receiver=str(msg_det["to"])).all()
    data = []
    for msg in query1:
        data.append({msg.sender, msg.receiver, msg.message})
    return data


@app.route('/status', methods=['POST'])
def status():
    email = request.data
    user = User.query.filter_by(email=email)
    user.isOnline = 1
    return "Status Updated"


@app.route('/signout', methods=['POST'])
def signout():
    email = request.data
    user = User.query.filter_by(email=email)
    user.isOnline = 0
    return "Signed Out"


@socketio.on('add-user')
def add_user(data):
    online_users[str(data)] = request.sid


@socketio.on('send-msg')
def handle_message(data):
    user_email = str(data.get("to"))
    user_to_send = online_users.get(user_email)
    message = str(data.get("message"))
    socketio.emit("msg-receive", callback=message, room=user_to_send)


if __name__ == "__main__":
    socketio.run(app, debug=True, host="localhost", port=5000)
