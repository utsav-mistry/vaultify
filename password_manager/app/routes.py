from flask import render_template, redirect, url_for, flash, request, session, send_file, make_response, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest
from app import app, db, bcrypt
from app.models import User, Password, Device, Log
from app.forms import RegistrationForm, LoginForm, PasswordForm
from app.utils import generate_aes_key, aes_encrypt, aes_decrypt, generate_otp, send_otp_email, get_device_type, format_user_agent
from sqlalchemy import text, exc
from datetime import datetime, timedelta, timezone
from PIL import Image
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import pandas as pd
import xlwt
import csv
import os
import json
import io
from openpyxl import load_workbook

OTP_EXPIRATION_TIME = timedelta(minutes=5)


def get_client_ip():
    forwarded_for = request.headers.get('X-Forwarded-For', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.remote_addr


def get_user_agent():
    return request.headers.get('User-Agent', 'Unknown')

def log_device(user):
    ip = get_client_ip()
    ua = get_user_agent()

    if '(' in ua:
        device_name = ua.split('(')[1].split(')')[0]
    else:
        device_name = 'Unknown Device'

    existing_device = Device.query.filter_by(
        user_id=user.id,
        ip_address=ip,
        user_agent=ua
    ).first()

    if existing_device:
        existing_device.last_used = datetime.utcnow()
    else:
        # Check if this is the first device
        existing_devices = Device.query.filter_by(user_id=user.id).count()
        new_device = Device(
            user_id=user.id,
            device_name=device_name,
            ip_address=ip,
            user_agent=ua,
            is_approved = True if existing_devices == 0 else None, # auto-approve if first
            is_rejected=False
        )
        db.session.add(new_device)
        # Track this session's device
        db.session.flush()
        session['device_id'] = new_device.id

    db.session.commit()

@app.route("/")
@app.route("/index")
def index():
    return render_template('index.html')


@app.route("/register", methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = RegistrationForm()
    
    if form.validate_on_submit():
        # Check if the username or email already exists
        existing_user = User.query.filter(
            (User.username == form.username.data) | 
            (User.email == form.email.data)
        ).first()
        
        if existing_user:
            if existing_user.username == form.username.data:
                form.username.errors.append("Username already taken. Please choose a different one.")
            if existing_user.email == form.email.data:
                form.email.errors.append("Email already registered. Please use a different email.")
        else:
            # Generate OTP
            otp = generate_otp()

            # Store OTP, email, and expiration time in session
            session['otp'] = otp
            session['email'] = form.email.data
            session['otp_expiration'] = (datetime.now() + OTP_EXPIRATION_TIME).timestamp()  # Expiry time as timestamp
            session['username'] = form.username.data
            session['password'] = form.password.data 
            session['otp_action'] = 'register'

            send_otp_email(form.email.data, otp)

            flash('A verification OTP has been sent to your email. Please check your inbox.')
            return redirect(url_for('verify_otp'))  # Redirect to OTP verification page
    
    return render_template('register.html', form=form)


@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=True)
            log_device(user)
            return redirect(url_for('dashboard'))
        else:
            flash('Login failed. Check email and password.')
    return render_template('login.html', form=form)


@app.route("/dashboard", methods=['GET', 'POST'])
@login_required
def dashboard():
    passwords = Password.query.filter_by(user_id=current_user.id).all()

    # Create a list to store the Password model instances directly
    password_list = []
    for pw in passwords:
        decrypted_password = aes_decrypt(current_user.aes_key, pw.encrypted_password).decode()
        pw.decrypted_password = decrypted_password  # Add decrypted password as a property
        password_list.append(pw)

    # Handle search
    search_query = request.args.get('search')
    results = password_list  # Default: all passwords
    if search_query:
        if search_query:
            search_query = search_query.lower()
            results = [pw for pw in password_list if search_query in pw["website"].lower()]

    return render_template('dashboard.html', passwords=results)

@app.route('/delete_profile', methods=['GET', 'POST'])
@login_required
def delete_profile():
    if request.method == 'POST':
        # Delete all passwords associated with the user
        passwords = Password.query.filter_by(user_id=current_user.id).all()
        for password in passwords:
            db.session.delete(password)  # Delete each password
        
        # Now delete the user profile
        user = User.query.get(current_user.id)
        db.session.delete(user)  # Delete the user profile

        # Commit the changes to the database
        db.session.commit()

        flash('Your account and all associated passwords have been deleted.')
        # Log out the user (optional)
        logout_user()

        return redirect(url_for('index'))  # Redirect to homepage or login page

    # Render the confirmation page
    return render_template('delete_profile.html')


# Add Password Route
@app.route("/add_password", methods=['GET', 'POST'])
@login_required
def add_password():
    form = PasswordForm()
    if form.validate_on_submit():
        encrypted_password = aes_encrypt(current_user.aes_key, form.password.data)
        password_entry = Password(website=form.website.data,  # Store the website in plaintext
                                  username=form.username.data,
                                  encrypted_password=encrypted_password,
                                  user_id=current_user.id)
        db.session.add(password_entry)
        db.session.commit()
        flash('Password saved!')
        return redirect(url_for('dashboard'))
    return render_template('add_password.html', form=form)


@app.route("/edit_password/<int:password_id>", methods=['GET', 'POST'])
@login_required
def edit_password(password_id):
    password_entry = Password.query.get_or_404(password_id)
    form = PasswordForm()

    if form.validate_on_submit():
        # Update the existing password entry
        password_entry.website = form.website.data  # Update website (now in plaintext)
        password_entry.username = form.username.data
        password_entry.encrypted_password = aes_encrypt(current_user.aes_key, form.password.data)  # Encrypt the new password
        db.session.commit()
        flash('Password updated!')
        return redirect(url_for('dashboard'))

    # Pre-fill the form with existing data for editing
    form.website.data = password_entry.website
    form.username.data = password_entry.username
    form.password.data = aes_decrypt(current_user.aes_key, password_entry.encrypted_password).decode()

    return render_template('add_password.html', form=form)


# Delete Password Route
@app.route("/delete_password/<int:password_id>", methods=['POST'])
@login_required
def delete_password(password_id):
    password_entry = Password.query.get_or_404(password_id)
    if password_entry.user_id != current_user.id:
        flash('You cannot delete someone else\'s password.')
        return redirect(url_for('dashboard'))
    
    flash('Password Deletion Successfull')
    db.session.delete(password_entry)
    db.session.commit()
    return redirect(url_for('dashboard'))

@app.route('/profile')
@login_required
def profile():
    # Restore device_id from existing approved device if session was cleared
    if 'device_id' not in session:
        matching_device = Device.query.filter_by(
            user_id=current_user.id,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            is_rejected=False
        ).order_by(Device.id.desc()).first()

        if matching_device:
            session['device_id'] = matching_device.id

    current_device_id = session.get('device_id')

    # Fetch and convert logs
    logs = Log.query.filter_by(user_id=current_user.id).order_by(Log.timestamp.desc()).all()

    # Define IST using standard library
    IST = timezone(timedelta(hours=5, minutes=30))

    for log in logs:
        if log.timestamp:
            if log.timestamp.tzinfo is None:
                log.timestamp = log.timestamp.replace(tzinfo=timezone.utc)
            log.timestamp = log.timestamp.astimezone(IST)
            log.timestamp = log.timestamp.strftime('%Y-%m-%d %H:%M:%S')

    # Fetch user's devices
    devices = Device.query.filter_by(user_id=current_user.id).all()

    for device in devices:
        # Enrich device with type and formatted label
        device.device_type = get_device_type(device.user_agent)
        device.formatted_info = format_user_agent(device.user_agent)
        device.is_current = (device.id == current_device_id)

        # Format last_used timestamp
        if device.last_used:
            if device.last_used.tzinfo is None:
                device.last_used = device.last_used.replace(tzinfo=timezone.utc)
            device.last_used = device.last_used.astimezone(IST)

    return render_template('profile.html', logs=logs, devices=devices)

@app.route('/approve_device/<int:device_id>', methods=['POST'])
@login_required
def approve_device(device_id):
    device = Device.query.filter_by(id=device_id, user_id=current_user.id).first()

    if not device:
        flash("Device not found.", "danger")
        return redirect(url_for('profile'))

    if device.is_approved:
        flash("Device is already approved.", "info")
        return redirect(url_for('profile'))

    if device.is_rejected:
        flash("This device was rejected. You cannot approve it again.", "warning")
        return redirect(url_for('profile'))

    device.is_approved = True
    device.is_rejected = False
    db.session.commit()
    flash("Device approved.", "success")
    return redirect(url_for('profile'))


@app.before_request
def enforce_device_permissions():
    # Routes always allowed
    safe_endpoints = {
        'static', 'index', 'login', 'logout', 'register', 'verify_otp',
        'forgot_password', 'reset_password', 'dashboard',
        'add_password', 'edit_password', 'delete_password',
        'import_passwords', 'export_passwords', 'process_file'
    }

    if request.endpoint in safe_endpoints or (request.endpoint or '').startswith('get_profile_image'):
        return

    if current_user.is_authenticated:
        device_id = session.get('device_id')
        device = Device.query.filter_by(id=device_id, user_id=current_user.id).first()

        if not device:
            logout_user()
            session.pop('device_id', None)
            flash("Device not recognized.", "danger")
            return redirect(url_for('login'))

        if device.is_rejected:
            logout_user()
            session.pop('device_id', None)
            flash("This device was rejected. Access denied.", "danger")
            return redirect(url_for('login'))

        # Block access to device management features from unapproved devices
        restricted_endpoints = {
            'profile', 'revoke_device', 'approve_device', 'remove_profile_image',
            'update_profile_image', 'change_user_details', 'delete_profile'
        }

        if device.is_approved is not True and request.endpoint in restricted_endpoints:
            flash("You are using an unapproved device. Access denied for this action.", "warning")
            return redirect(url_for('dashboard'))


@app.route('/revoke_device/<int:device_id>', methods=['POST'])
@login_required
def revoke_device(device_id):
    device = Device.query.filter_by(id=device_id, user_id=current_user.id).first()
    
    if not device:
        flash("Device not found.", "danger")
        return redirect(url_for('profile'))

    all_devices = Device.query.filter_by(user_id=current_user.id, is_approved=True).all()

    # If this is the only approved device, block revocation
    if len(all_devices) == 1 and all_devices[0].id == device_id:
        flash("You cannot revoke your only approved device.", "warning")
        return redirect(url_for('profile'))

    # Mark as rejected
    device.is_approved = False
    device.is_rejected = True
    db.session.commit()
    flash("Device access revoked.", "success")

    # If current session's device, log out
    if device_id == session.get('device_id'):
        logout_user()
        session.pop('device_id', None)
        flash("This device has been revoked. Logging out.", "info")
        return redirect(url_for('index'))

    return redirect(url_for('profile'))



@app.route('/verify_otp', methods=['GET', 'POST'])
def verify_otp():
    if request.method == 'POST':
        otp = request.form.get('otp')

        # Retrieve OTP details from session
        session_otp = session.get('otp')
        otp_expiration = session.get('otp_expiration')
        email = session.get('email')  # Used in registration
        otp_action = session.get('otp_action')  # To differentiate actions

        if not session_otp:
            flash('Invalid request. Please try again.')
            return redirect(url_for('register' if otp_action == 'register' else 'change_user_details'))

        # Convert timestamp to datetime if needed
        if isinstance(otp_expiration, float):
            otp_expiration = datetime.fromtimestamp(otp_expiration)

        # Check if OTP is expired
        if datetime.now() > otp_expiration:
            flash('OTP has expired. Please request a new one.')
            return redirect(url_for('register' if otp_action == 'register' else 'change_user_details'))

        # Check if OTP is incorrect
        if otp != session_otp:
            flash('Invalid OTP. Please try again.')
            return render_template('verify_otp.html')

        if otp_action == 'register':
            # Handle user registration
            hashed_password = bcrypt.generate_password_hash(session['password']).decode('utf-8')
            aes_key = generate_aes_key()

            user = User(
                username=session['username'],
                email=email,
                password=hashed_password,
                aes_key=aes_key
            )
            db.session.add(user)
            db.session.commit()

            flash('Registration successful!')
            return redirect(url_for('login'))

        elif otp_action == 'update_details':
            # Handle user detail update
            new_username = session.pop('pending_username', None)
            new_email = session.pop('pending_email', None)

            if not new_username or not new_email:
                flash('Something went wrong. Please try again.')
                return redirect(url_for('change_user_details'))

            current_user.username = new_username
            current_user.email = new_email
            db.session.commit()

            flash('Your details have been updated successfully!')
            return redirect(url_for('profile'))

        # Clear session data
        session.pop('otp', None)
        session.pop('otp_expiration', None)
        session.pop('otp_action', None)

    return render_template('verify_otp.html')


@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if current_user.is_authenticated and request.method == 'POST':
        email = current_user.email  # Use logged-in user's email
    else:
        email = request.form.get('email')

    if request.method == 'POST':
        email = request.form['email']
        user = User.query.filter_by(email=email).first()

        if user:
            # Generate OTP for password reset
            otp = generate_otp()
            # Store OTP and email in session
            session['reset_otp'] = otp
            session['reset_email'] = email
            session['reset_otp_expiration'] = (datetime.now() + OTP_EXPIRATION_TIME).timestamp()

            # Send the OTP to the user's email
            send_otp_email(email, otp)

            flash('A password reset OTP has been sent to your email. Please check your inbox.')
            return redirect(url_for('reset_password'))  # Redirect to OTP verification page
        else:
            flash('No account found with that email address.')

    return render_template('forgot_password.html')

@app.route("/reset_password", methods=['GET', 'POST'])
def reset_password():
    reset_otp = session.get('reset_otp')
    reset_email = session.get('reset_email')
    reset_otp_expiration = session.get('reset_otp_expiration')

    if not reset_otp or not reset_email:
        flash('Invalid request. Please request a password reset first.')
        return redirect(url_for('forgot_password'))
    
    if request.method == 'POST':
        # Get the new password from the form
        new_password = request.form['password']
        
        # Ensure the new password is not empty
        if not new_password:
            flash('Password cannot be empty.')
            return render_template('reset_password.html')  # Stay on the reset page with the error

        # Check if OTP has expired
        if datetime.now() > datetime.fromtimestamp(reset_otp_expiration):
            flash('OTP has expired. Please request a new one.')
            return redirect(url_for('forgot_password'))

        # Check if the OTP provided by the user matches the one stored in session
        otp = request.form['otp']
        if otp != reset_otp:
            flash('Invalid OTP. Please try again.')
            return render_template('reset_password.html')  # Stay on the reset page with the error

        # Now hash the new password and update it in the database
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Retrieve the user from the database
        user = User.query.filter_by(email=reset_email).first()
        
        if user:
            user.password = hashed_password  # Update the user's password
            db.session.commit()  # Save the changes
            flash('Your password has been reset successfully.')
            
            # Clear session data after successful password reset
            session.pop('reset_otp', None)
            session.pop('reset_email', None)
            session.pop('reset_otp_expiration', None)
            
            return redirect(url_for('login'))  # Redirect to the login page

        else:
            flash('No account found with that email address.')
            return redirect(url_for('forgot_password'))  # Redirect to forgot password page

    return render_template('reset_password.html')

@app.route('/change_user_details', methods=['GET', 'POST'])
@login_required
def change_user_details():
    if request.method == 'POST':
        new_username = request.form.get('username')
        new_email = request.form.get('email')
        profile_image = request.files.get('profile_image')

        # Validate input
        if not new_username or not new_email:
            flash('Username and Email are required.')
            return redirect(url_for('change_user_details'))

        # Check if no changes are made
        if new_username == current_user.username and new_email == current_user.email:
            flash('No changes detected.')
            return redirect(url_for('change_user_details'))

        # Check if username is already taken (exclude the current user)
        existing_username = User.query.filter(User.username == new_username, User.id != current_user.id).first()
        if existing_username:
            flash('Username is already taken. Please choose another one.')
            return redirect(url_for('change_user_details'))

        if profile_image and profile_image.filename:
            current_user.profile_image = profile_image.read()
        # If only username is changing, update it directly
        if new_email == current_user.email:
            current_user.username = new_username
            db.session.commit()
            flash('Username updated successfully!')
            return redirect(url_for('profile'))

        # If email is changing, check if it's already in use
        existing_email = User.query.filter(User.email == new_email, User.id != current_user.id).first()
        if existing_email:
            flash('Email is already in use by another account.')
            return redirect(url_for('change_user_details'))

        # Generate OTP for email change
        otp = generate_otp()

        # Store OTP and new details in session
        session['otp'] = otp
        session['otp_expiration'] = (datetime.now() + OTP_EXPIRATION_TIME).timestamp()
        session['pending_username'] = new_username  # Keep track of the new username too
        session['pending_email'] = new_email
        session['otp_action'] = 'update_email'

        # Send OTP to the new email
        send_otp_email(new_email, otp)

        flash('A verification OTP has been sent to your new email. Please check your inbox.')
        return redirect(url_for('verify_otp'))

    return render_template('change_user_details.html', user=current_user)

@app.route("/learn_more", methods=['GET'])
def learn_more():
    return render_template("learn_more.html")


@app.route("/logout")
def logout():
    logout_user()
    session.pop('device_id', None)
    return redirect(url_for('index'))

@app.route("/privacy-policy")
def privacy_policy():
    return render_template("privacy_policy.html")

@app.route("/terms-of-service")
def terms_of_service():
    return render_template("terms_of_service.html")

@app.route("/version")
def version():
    return render_template("version.html")


# Allowed file types for profile images
ALLOWED_EXTENSIONS_PICTURE = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file_picture(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].strip().lower() in ALLOWED_EXTENSIONS_PICTURE

def resize_and_crop_image(image_data, target_size=(300, 300)):
    """Resize and crop image to a fixed square size (300x300)."""
    try:
        img = Image.open(io.BytesIO(image_data))
        img = img.convert("RGB")  # Convert to RGB to avoid transparency issues

        # Get original dimensions
        width, height = img.size

        # Determine the smaller dimension to make a square crop
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim

        # Crop to square
        img = img.crop((left, top, right, bottom))

        # Resize to target size
        img = img.resize(target_size, Image.Resampling.LANCZOS)

        # Save to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="JPEG", quality=85)
        return img_byte_arr.getvalue()
    
    except Exception as e:
        app.logger.error(f"Error processing image: {str(e)}")
        return None
    
@app.route('/update_profile_image', methods=['POST'])
@login_required
def update_profile_image():
    """Handle profile image upload and store in MySQL as a BLOB."""
    file = request.files.get('profile_image')

    if not file or file.filename == '' or not allowed_file_picture(file.filename):
        flash('Invalid file. Please upload a valid image (PNG, JPG, JPEG, GIF).', 'error')
        return redirect(url_for('profile'))

    try:
        file_data = file.read()
        processed_data = resize_and_crop_image(file_data)  # Resize and crop before saving
        
        if not processed_data:
            flash('Error processing image.', 'error')
            return redirect(url_for('profile'))

        user = User.query.get(current_user.id)
        if user:
            user.profile_image = processed_data  # Store the processed image
            db.session.commit()
            flash('Profile picture updated successfully!', 'success')
        else:
            flash('User not found.', 'error')

    except Exception as e:
        app.logger.error(f'Error updating profile image: {str(e)}')
        db.session.rollback()
        flash('Error updating profile picture. Please try again.', 'error')

    return redirect(url_for('profile'))

@app.route('/remove_profile_image', methods=['POST'])
@login_required
def remove_profile_image():
    """Remove the user's profile image."""
    try:
        user = User.query.get(current_user.id)
        if user and user.profile_image:
            user.profile_image = None  # Remove the image
            db.session.commit()
            flash('Profile picture removed successfully!', 'success')
        else:
            flash('No profile picture found.', 'info')

    except Exception as e:
        app.logger.error(f'Error removing profile image: {str(e)}')
        db.session.rollback()
        flash('Error removing profile picture. Please try again.', 'error')

    return redirect(url_for('profile'))

@app.route('/get_profile_image/<int:user_id>')
@login_required
def get_profile_image(user_id):
    """Retrieve and serve the user's profile image from the database."""
    
    # Ensure the logged-in user is trying to access their own profile image, or is an admin
    if current_user.id != user_id:
        return render_template('errors/403.html'), 403  # Render the 403 page
    
    # Retrieve the user from the database
    user = User.query.get_or_404(user_id)
    
    if user.profile_image:
        # Serve the profile image
        return send_file(BytesIO(user.profile_image), mimetype='image/jpeg')
    
    return '', 404  # Not found if the image doesn't exist

# v1.10.1

# Define allowed file extensions
ALLOWED_EXTENSIONS_FILE = {'csv', 'xls', 'xlsx', 'json'}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB limit for file upload

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_FILE

def validate_file_size(file):
    if len(file.read()) > MAX_FILE_SIZE:
        raise BadRequest("File is too large. Maximum allowed size is 25MB.")
    file.seek(0)  # Reset the file pointer to the start after reading its size.

@app.route("/import_password", methods=['POST'])
@login_required
def import_passwords():
    # Validate required fields
    if 'file' not in request.files or \
       not request.form.get('website_column') or \
       not request.form.get('username_column') or \
       not request.form.get('password_column'):
        return jsonify({"error": "Please map all required columns"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Allowed formats: CSV, Excel, JSON"}), 400

    try:
        validate_file_size(file)

        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()

        # Dynamically fetch column mappings from form
        website_column = request.form.get('website_column')
        username_column = request.form.get('username_column')
        password_column = request.form.get('password_column')

        new_entries = []

        if file_ext == 'csv':
                file_stream = io.TextIOWrapper(file.stream, encoding='utf-8')
                csv_reader = csv.DictReader(file_stream)

                for row in csv_reader:
                    new_entries.append(
                        Password(
                            website=row.get(website_column, "Unknown"),
                            username=row.get(username_column, ""),
                            encrypted_password=aes_encrypt(current_user.aes_key, row.get(password_column, "")),
                            user_id=current_user.id
                        )
                    )
        elif file_ext in ['xls', 'xlsx']:
            # Use pandas to read both xls and xlsx formats to avoid openpyxl limitation
            file.seek(0)
            df = pd.read_excel(file)

            # Check if columns exist in dataframe
            if website_column not in df.columns or username_column not in df.columns or password_column not in df.columns:
                return jsonify({"error": "One or more specified columns not found in the Excel file."}), 400

            for _, row in df.iterrows():
                new_entries.append(
                    Password(
                        website=row.get(website_column, "Unknown"),
                        username=row.get(username_column, ""),
                        encrypted_password=aes_encrypt(current_user.aes_key, row.get(password_column, "")),
                        user_id=current_user.id
                    )
                )

        elif file_ext == 'json':
            file_content = file.read().decode('utf-8')
            data = json.loads(file_content)

            for entry in data:
                new_entries.append(
                    Password(
                        website=entry.get(website_column, "Unknown"),
                        username=entry.get(username_column, "Unknown"),
                        encrypted_password=aes_encrypt(current_user.aes_key, entry.get(password_column, "")),
                        user_id=current_user.id
                    )
                )

        db.session.bulk_save_objects(new_entries)
        db.session.commit()

        flash(f"Successfully imported {len(new_entries)} passwords", "success")
        return redirect(url_for('dashboard'))

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Import failed: {str(e)}"}), 500

@app.route('/process_file', methods=['POST'])
@login_required
def process_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # Validate file size
        validate_file_size(file)

        # Read file based on extension
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()

        if file_ext == 'csv':
            # Use csv.DictReader for streaming CSV files
            file_stream = io.TextIOWrapper(file.stream, encoding='utf-8')
            csv_reader = csv.DictReader(file_stream)
            columns = csv_reader.fieldnames
            preview = [next(csv_reader) for _ in range(3)]  # Preview first 3 rows
            return jsonify({"columns": columns, "preview": preview})

        elif file_ext in ['xls', 'xlsx']:
            # Use pandas to read both xls and xlsx formats to avoid openpyxl limitation
            file.seek(0)
            df = pd.read_excel(file)
            columns = df.columns.tolist()
            preview = df.head(3).to_dict(orient='records')
            return jsonify({"columns": columns, "preview": preview})

        elif file_ext == 'json':
            # Process JSON file
            data = json.load(file)
            return jsonify({"columns": list(data[0].keys()), "preview": data[:3]})

        else:
            return jsonify({"error": "Unsupported file format"}), 400

    except Exception as e:
        return jsonify({"error": f"File processing error: {str(e)}"}), 400

@app.route('/export_passwords')
@login_required
def export_passwords():
    try:
        # Get request parameters
        file_format = request.args.get('format', 'csv').lower()
        filename = request.args.get('filename', 'passwords-vaultify').strip()

        # Sanitize filename
        filename = "".join(c for c in filename if c.isalnum() or c in ('-', '_')) or 'passwords-vaultify'

        # Get current user's passwords
        passwords = Password.query.filter_by(user_id=current_user.id).all()

        # Prepare data with decrypted passwords
        data = []
        for p in passwords:
            try:
                decrypted_pw = aes_decrypt(
                    current_user.aes_key,
                    p.encrypted_password
                ).decode('utf-8')
            except Exception as decryption_error:
                app.logger.error(f"Decryption error for entry {p.id}: {str(decryption_error)}")
                decrypted_pw = "DECRYPTION_ERROR"

            data.append({
                'website': p.website,
                'username': p.username,
                'password': decrypted_pw
            })

        # Create dataframe
        df = pd.DataFrame(data)
        
        # File metadata for PDF export

        export_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        metadata = {
            "exported_date": export_date,
            "filename": filename,
            "record_count": len(data)
        }
        # Validate format
        valid_formats = ['csv', 'xlsx', 'xls', 'json', 'pdf']
        if file_format not in valid_formats:
            return jsonify({'error': 'Invalid file format'}), 400

        # Create output buffer
        output = BytesIO()

        # Export based on format
        if file_format == 'csv':
            df.to_csv(output, index=False)
            output.seek(0)
            mimetype = 'text/csv'

        elif file_format == 'xlsx':
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Passwords')
            output.seek(0)
            mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

        elif file_format == 'xls':
            # Use xlwt directly for .xls export
            workbook = xlwt.Workbook()
            sheet = workbook.add_sheet('Passwords')

            # Write header row
            for col_idx, column in enumerate(df.columns):
                sheet.write(0, col_idx, column)

            # Write data rows
            for row_idx, row in enumerate(df.values, start=1):
                for col_idx, value in enumerate(row):
                    sheet.write(row_idx, col_idx, value)

            workbook.save(output)  # Save to BytesIO
            output.seek(0)
            mimetype = 'application/vnd.ms-excel'

        elif file_format == 'json':
            json_data = df.to_json(orient='records', indent=4)
            output.write(json_data.encode('utf-8'))
            output.seek(0)
            mimetype = 'application/json'

        elif file_format == 'pdf':
            doc = SimpleDocTemplate(output, pagesize=letter)
            elements = []

            # Title of the document
            title_text = "Vaultify Password Export"
            styles = getSampleStyleSheet()
            title = Paragraph(title_text, styles['Title'])
            elements.append(title)
            elements.append(Spacer(1, 20))  # Add space after title

            # Table Data
            table_data = [['Website', 'Username', 'Password']]
            for item in data:
                table_data.append([item['website'], item['username'], item['password']])

            table = Table(table_data)
            table.setStyle(TableStyle([ 
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightcyan])
            ]))
            elements.append(table)
            elements.append(Spacer(1, 20))  # Add space after table

            # Metadata under the table data
            export_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            metadata_text = f"Exported on: {export_date}\nFilename: {filename}\nRecords: {len(data)}"
            metadata_style = styles['Normal']
            metadata_style.fontSize = 8  # Smaller font size for metadata
            metadata = Paragraph(metadata_text, metadata_style)
            elements.append(metadata)

            doc.build(elements)
            output.seek(0)
            mimetype = 'application/pdf'

        # Finally return file
        return send_file(
            output,
            mimetype=mimetype,
            as_attachment=True,
            download_name=f"{filename}.{file_format}"
        )

    except Exception as e:
        app.logger.error(f'Export error: {str(e)}')
        return 'error Failed to generate export file. Please try again.', 500

@app.route('/.well-known/appspecific/com.chrome.devtools.json')
def chrome_devtools_stub():
    return '', 204  # No content


# 400 Bad Request
@app.errorhandler(400)
def bad_request_error(error):
    return render_template('errors/400.html'), 400

# 401 Unauthorized
@app.errorhandler(401)
def unauthorized_error(error):
    return render_template('errors/401.html'), 401

# 403 Forbidden
@app.errorhandler(403)
def forbidden_error(error):
    return render_template('errors/403.html'), 403

# 404 Not Found
@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

# 405 Method Not Allowed
@app.errorhandler(405)
def method_not_allowed_error(error):
    return render_template('errors/405.html'), 405

# 408 Request Timeout (optional, rare)
@app.errorhandler(408)
def request_timeout_error(error):
    return render_template('errors/408.html'), 408

# 413 Payload Too Large
@app.errorhandler(413)
def payload_too_large_error(error):
    return render_template('errors/413.html'), 413

# 415 Unsupported Media Type
@app.errorhandler(415)
def unsupported_media_type_error(error):
    return render_template('errors/415.html'), 415

# 429 Too Many Requests (if you have rate limiting)
@app.errorhandler(429)
def too_many_requests_error(error):
    return render_template('errors/429.html'), 429

# 500 Internal Server Error
@app.errorhandler(500)
def internal_server_error(error):
    return render_template('errors/500.html'), 500

# 502 Bad Gateway (optional, rare)
@app.errorhandler(502)
def bad_gateway_error(error):
    return render_template('errors/502.html'), 502

# 503 Service Unavailable (optional, rare)
@app.errorhandler(503)
def service_unavailable_error(error):
    return render_template('errors/503.html'), 503

# 504 Gateway Timeout (optional, rare)
@app.errorhandler(504)
def gateway_timeout_error(error):
    return render_template('errors/504.html'), 504
