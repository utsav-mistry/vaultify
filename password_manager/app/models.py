from app import db, login_manager
from flask_login import UserMixin
from datetime import datetime

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    aes_key = db.Column(db.String(64), nullable=False)  # User-specific AES key
    profile_image = db.Column(db.LargeBinary)  # Store profile image as LONGBLOB    
    passwords = db.relationship('Password', backref='owner', lazy=True)
    logs = db.relationship('Log', backref='user', lazy=True)  # Allow querying logs per user

class Password(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    website = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), nullable=False)
    encrypted_password = db.Column(db.String(255), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)  # Ensure timestamping
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Fixed ForeignKey reference
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    action = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text, nullable=True)
