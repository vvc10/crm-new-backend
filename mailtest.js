import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' for Gmail SMTP
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or App Password
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'recipient_email@example.com', // Replace with a valid recipient email
  subject: 'Test Email',
  text: 'This is a test email from Nodemailer.',
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error('Error sending test email:', err);
  } else {
    console.log('Email sent successfully:', info.response);
  }
});
