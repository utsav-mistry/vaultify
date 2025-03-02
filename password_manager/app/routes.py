from flask import render_template, redirect, url_for, flash, request, session, send_file
from app import app, db, bcrypt
from app.models import User, Password
from app.utils import generate_otp, send_otp_email
from app.forms import RegistrationForm, LoginForm, PasswordForm
from flask_login import login_user, current_user, logout_user, login_required
from app.utils import generate_aes_key , aes_encrypt, aes_decrypt
from datetime import datetime, timedelta
from sqlalchemy import text, exc
from PIL import Image
import io
from io import BytesIO
# OTP expiration time (e.g., 5 minutes)
OTP_EXPIRATION_TIME = timedelta(minutes=5)


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
    # Direct SQL query to fetch logs for the current user
    query = text("SELECT * FROM logs WHERE user_id = :user_id ORDER BY timestamp DESC")
    logs = db.session.execute(query, {'user_id': current_user.id}).fetchall()
    
    # Pass logs to the profile.html template
    return render_template('profile.html', logs=logs)

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
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    """Check if the uploaded file is an allowed image format."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

    if not file or file.filename == '' or not file.content_type.startswith('image/') or not allowed_file(file.filename):
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
def get_profile_image(user_id):

    """Retrieve and serve the user's profile image from the database."""
    user = User.query.get_or_404(user_id)
    if user.profile_image:
        return send_file(BytesIO(user.profile_image), mimetype='image/jpeg')
    
    return '', 404