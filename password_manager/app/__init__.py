from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_mail import Mail
from dotenv import load_dotenv
import os

# Load environment variables from Vercel or local .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# App configurations
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'vaultify-spms')  # Use env var or default
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')  # Use Supabase PostgreSQL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Flask-Mail configuration (Brevo SMTP)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp-relay.brevo.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# Initialize Flask extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
migrate = Migrate(app, db)
mail = Mail(app)

# Ensure environment variables are loaded (for debugging)
if not app.config['SQLALCHEMY_DATABASE_URI']:
    raise ValueError("DATABASE_URL is not set. Check your environment variables.")

# Import routes
from app import routes
