const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_SERVER || 'smtp-relay.brevo.com',
    port: process.env.MAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });
};

// Send OTP email
const sendOTPEmail = async (userEmail, otp) => {
  try {
    console.log('Creating email transporter...');
    console.log('Email config:', {
      host: process.env.MAIL_SERVER,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USERNAME,
      sender: process.env.MAIL_DEFAULT_SENDER
    });

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER,
      to: userEmail,
      subject: 'Your OTP Code for Vaultify',
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f7fa;
                color: #333;
              }
              .email-container {
                background-color: #ffffff;
                width: 100%;
                max-width: 300px;
                margin: 0 auto;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #007bff;
                font-size: 30px;
                margin-bottom: 20px;
                font-weight: 600;
              }
              p {
                font-size: 16px;
                line-height: 1.6;
                color: #555;
                margin-bottom: 20px;
              }
              .otp {
                align-items: center;
                text-align: center;
              }
              .otp-code {
                display: inline-block;
                font-size: 22px;
                font-weight: 700;
                padding: 12px 20px;
                background-color: #e1f5fe;
                border-radius: 6px;
                color: #007bff;
                margin-bottom: 20px;
              }
              .footer {
                font-size: 12px;
                color: #999;
                text-align: center;
                margin-top: 30px;
              }
              .footer p {
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h2>Your OTP Code for Vaultify</h2>
              <p>Hi there,</p>
              <p>We've received a request to send you a one-time password (OTP) for your Vaultify account. To proceed, please use the following OTP:</p>
              <div class="otp">
                <div class="otp-code">${otp}</div>
              </div>
              <p>This code is valid for the next 5 minutes. If you did not request this code, please disregard this email.</p>
              <p>If you need assistance or have any questions, feel free to contact us at <a href="mailto:auth.vaultify@gmail.com">auth.vaultify@gmail.com</a>.</p>
              <p style="text-align:left;">Best regards,<br>The Vaultify Team</p>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>Vaultify, Inc. | Ahmedabad, India</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    console.log('Sending password reset email to:', userEmail);
    console.log('Frontend URL:', process.env.FRONTEND_URL);

    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    console.log('Reset URL:', resetUrl);

    const mailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER,
      to: userEmail,
      subject: 'Password Reset Request - Vaultify',
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f7fa;
                color: #333;
              }
              .email-container {
                background-color: #ffffff;
                width: 100%;
                max-width: 400px;
                margin: 0 auto;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #007bff;
                font-size: 24px;
                margin-bottom: 20px;
                font-weight: 600;
              }
              p {
                font-size: 16px;
                line-height: 1.6;
                color: #555;
                margin-bottom: 20px;
              }
              .reset-button {
                display: inline-block;
                background-color: #007bff;
                color: #fff;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
              }
              .footer {
                font-size: 12px;
                color: #999;
                text-align: center;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h2>Password Reset Request</h2>
              <p>Hi there,</p>
              <p>We received a request to reset your password for your Vaultify account. Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
              <p>This link is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
              <p>If you need assistance, contact us at <a href="mailto:auth.vaultify@gmail.com">auth.vaultify@gmail.com</a>.</p>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>Vaultify, Inc. | Ahmedabad, India</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send inactivity warning email (7 days)
const sendInactivityEmail = async (userEmail, username) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER,
      to: userEmail,
      subject: 'We Miss You at Vaultify!',
      html: `
        <html>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; color: #333;">
            <div style="background: #fff; max-width: 400px; margin: 0 auto; padding: 32px; border-radius: 8px; box-shadow: 0 6px 12px rgba(0,0,0,0.08);">
              <h2 style="color: #007bff;">Hi ${username || 'there'},</h2>
              <p>We noticed you haven’t logged in to Vaultify for a while. Your passwords are safe, but we recommend logging in regularly to keep your account active.</p>
              <p>If you have any questions or need help, reply to this email or contact our support team.</p>
              <p style="margin-top: 32px; font-size: 13px; color: #888;">This is an automated message. Please do not reply directly.</p>
            </div>
          </body>
        </html>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending inactivity email:', error);
    return false;
  }
};

// Send account paused email (30 days)
const sendPauseEmail = async (userEmail, username) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER,
      to: userEmail,
      subject: 'Your Vaultify Account Has Been Paused',
      html: `
        <html>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; color: #333;">
            <div style="background: #fff; max-width: 400px; margin: 0 auto; padding: 32px; border-radius: 8px; box-shadow: 0 6px 12px rgba(0,0,0,0.08);">
              <h2 style="color: #007bff;">Hi ${username || 'there'},</h2>
              <p>Your Vaultify account has been paused due to 30 days of inactivity. To reactivate, please log in and follow the reactivation instructions, or contact our support team if you need help.</p>
              <p>Your data remains safe and encrypted. If you did not expect this, please contact us immediately.</p>
              <p style="margin-top: 32px; font-size: 13px; color: #888;">This is an automated message. Please do not reply directly.</p>
            </div>
          </body>
        </html>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending pause email:', error);
    return false;
  }
};

// Send reactivation email (reactivation link)
const sendReactivationEmail = async (userEmail, username, reactivationUrl) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.MAIL_DEFAULT_SENDER,
      to: userEmail,
      subject: 'Reactivate Your Vaultify Account',
      html: `
        <html>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; color: #333;">
            <div style="background: #fff; max-width: 400px; margin: 0 auto; padding: 32px; border-radius: 8px; box-shadow: 0 6px 12px rgba(0,0,0,0.08);">
              <h2 style="color: #007bff;">Hi ${username || 'there'},</h2>
              <p>We received a request to reactivate your Vaultify account. If this was you, please click the button below to reactivate your account:</p>
              <div style="margin: 24px 0; text-align: center;">
                <a href="${reactivationUrl}" style="background: #007bff; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reactivate Account</a>
              </div>
              <p>If you did not request this, you can safely ignore this email.</p>
              <p style="margin-top: 32px; font-size: 13px; color: #888;">This is an automated message. Please do not reply directly.</p>
            </div>
          </body>
        </html>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending reactivation email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendInactivityEmail,
  sendPauseEmail,
  sendReactivationEmail
}; 