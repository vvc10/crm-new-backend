import otpGenerator from 'otp-generator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/dbConfig.js';  // Ensure db is correctly imported
import { sendMail } from '../utils/mailer.js'; // Send OTP to email
import { validateAdminOtp } from '../models/adminModel.js'; // Validate OTP

// Admin Registration
export const registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  console.log(`Registering admin with email: ${email}`);

  try {
    // Check if the admin already exists
    const existingAdminQuery = 'SELECT * FROM admin_users WHERE email = ?';
    db.query(existingAdminQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking if admin exists:', err);
        return res.status(500).send('Internal server error.');
      }

      if (results.length > 0) {
        console.log(`Admin already exists with email: ${email}`);
        return res.status(409).send('Admin already exists.');
      }

      // Generate OTP for the admin registration (but don't complete registration yet)
      const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
      console.log(`Generated OTP for admin registration: ${otp}`);

      // Hash the password before storing
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Insert admin user into the database
      const sql = `
        INSERT INTO admin_users (email, password, otp)
        VALUES (?, ?, ?)
      `;
      db.query(sql, [email, hashedPassword, otp], async (err, result) => {
        if (err) {
          console.error('Error inserting admin:', err);
          return res.status(500).send('Error registering admin.');
        }

        // Send OTP via email
        try {
          await sendMail(email, 'Your OTP for Admin Registration', `Your OTP is: ${otp}`);
          console.log(`OTP sent to admin email: ${email}`);
          return res.status(200).send('Admin registered and OTP sent.');
        } catch (error) {
          console.error('Error sending OTP:', error);
          return res.status(500).send('Error sending OTP.');
        }
      });
    });
  } catch (err) {
    console.error('Error registering admin:', err);
    return res.status(500).send('Error registering admin.');
  }
};

// Admin Login - Verify OTP and Generate Token
export const loginAdmin = async (req, res) => {
  const { email, password, otp } = req.body;

  console.log(`Logging in admin with email: ${email}`);

  try {
    // Check if admin exists
    const checkAdminQuery = 'SELECT * FROM admin_users WHERE email = ?';
    db.query(checkAdminQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking admin:', err);
        return res.status(500).send('Internal server error.');
      }

      if (results.length === 0) {
        console.log(`Admin with email ${email} does not exist.`);
        return res.status(404).send('Admin not found.');
      }

      const admin = results[0];

      // Check password
      const isPasswordValid = bcrypt.compareSync(password, admin.password);
      if (!isPasswordValid) {
        console.log(`Invalid password for admin with email: ${email}`);
        return res.status(401).send('Invalid password.');
      }

      // OTP validation
      if (admin.otp !== otp) {
        console.log(`Invalid OTP for admin with email: ${email}`);
        return res.status(400).send('Invalid OTP.');
      }

      console.log(`OTP verified successfully for admin with email: ${email}`);

      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET, // Ensure to set your JWT_SECRET in .env
        { expiresIn: '3h' } 
      );

      console.log(`JWT token generated for admin: ${email}`);

      // Return the token to the admin
      return res.status(200).send({
        message: 'Admin verified successfully.',
        token
      });
    });
  } catch (err) {
    console.error('Error logging in admin:', err);
    return res.status(500).send('Error logging in admin.');
  }
};

 
// Admin - Send OTP
export const sendOtp = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin exists
    const checkAdminQuery = 'SELECT * FROM admin_users WHERE email = ?';
    db.query(checkAdminQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking admin:', err);
        return res.status(500).send('Internal server error.');
      }

      if (results.length === 0) {
        console.log(`Admin with email ${email} does not exist.`);
        return res.status(404).send('Admin not found.');
      }

      const admin = results[0];

      // Check if the password matches
      const isPasswordValid = bcrypt.compareSync(password, admin.password);
      if (!isPasswordValid) {
        console.log(`Invalid password for admin with email: ${email}`);
        return res.status(401).send('Invalid password.');
      }

      // Generate OTP if email and password are correct
      const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
      console.log(`Generated OTP: ${otp}`);

      // Update OTP in the database
      const updateOtpQuery = 'UPDATE admin_users SET otp = ? WHERE email = ?';
      db.query(updateOtpQuery, [otp, email], async (err) => {
        if (err) {
          console.error('Error updating OTP:', err);
          return res.status(500).send('Error sending OTP.');
        }

        // Send OTP via email
        try {
          await sendMail(email, 'Your OTP for Admin Login', `Your OTP is: ${otp}`);
          console.log(`OTP sent to admin email: ${email}`);
          return res.status(200).send('OTP sent successfully.');
        } catch (error) {
          console.error('Error sending OTP:', error);
          return res.status(500).send('Error sending OTP.');
        }
      });
    });
  } catch (err) {
    console.error('Error in sendOtp:', err);
    return res.status(500).send('Error sending OTP.');
  }
};
