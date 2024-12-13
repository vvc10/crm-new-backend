import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import db from '../config/dbConfig.js';
import { sendMail } from '../utils/mailer.js';

export const registerUser = async (req, res) => {
  const { name, email, location, address, contact_number } = req.body;

  console.log(`Registering user with email: ${email}`);

  // Check if the email already exists
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      res.status(500).send('Internal server error.');
      return;
    }

    if (results.length > 0) {
      console.log(`Email ${email} is already registered.`);
      res.status(409).send('Email already registered.');
      return;
    }

    // Insert user into the `users` table
    const insertUserQuery =
      'INSERT INTO users (name, email, location, address, contact_number) VALUES (?, ?, ?, ?, ?)';
    db.query(insertUserQuery, [name, email, location, address, contact_number], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        res.status(500).send('Error registering user.');
        return;
      }

      const userId = result.insertId;

      // Generate OTP
      const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
      console.log(`Generated OTP: ${otp}`);

      // Save OTP in the `otps` table
      const insertOtpQuery = 'INSERT INTO otps (user_id, otp) VALUES (?, ?)';
      db.query(insertOtpQuery, [userId, otp], async (err) => {
        if (err) {
          console.error('Error inserting OTP:', err);
          res.status(500).send('Error generating OTP.');
          return;
        }

        console.log(`OTP successfully stored for user ID: ${userId}`);

        // Send OTP via email
        try {
          await sendMail(email, 'Your OTP for Registration', `Your OTP is: ${otp}`);
          console.log(`OTP sent to ${email}`);

          // OTP to get response in json format
          res.status(200).json({ message: 'OTP sent successfully to your email.', user_id: userId });
        } catch (error) {
          console.error('Error sending OTP:', error);
          res.status(500).send('Error sending OTP.');
        }
      });
    });
  });
};

// **Generate OTP for Login**
export const generateLoginOtp = async (req, res) => {
  const { email } = req.body;

  console.log(`Generating OTP for login for email: ${email}`);

  // Check if the user exists
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      res.status(500).send('Internal server error.');
      return;
    }

    if (results.length === 0) {
      console.log(`User not found for email: ${email}`);
      res.status(404).send('User not found.');
      return;
    }

    // Generate OTP for login
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    console.log(`Generated OTP for login: ${otp}`);
    const userId = results[0].id; // Get user ID

    // Store OTP in the database without calculating expiration
    const insertOtpQuery = 'INSERT INTO otps (user_id, otp) VALUES (?, ?)';
    db.query(insertOtpQuery, [userId, otp], async (err, result) => {
      if (err) {
        console.error('Error inserting OTP:', err);
        res.status(500).send('Error generating OTP.');
        return;
      }

      console.log(`OTP successfully stored for email: ${email}`);

      // Send OTP via email
      try {
        await sendMail(email, 'Your OTP for Login', `Your OTP is: ${otp}`);
        console.log(`OTP sent to ${email}`);
        res.status(200).json({ message: 'OTP sent successfully to your email.'});
      } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send('Error sending OTP.');
      }
    });
  });
};


// **Login User with OTP**
export const loginUser = (req, res) => {
  const { email, otp } = req.body;

  console.log(`Logging in user with email: ${email}`);

  // Check if OTP exists and is valid (it's still in the database)
  const getOtpQuery = 'SELECT * FROM otps WHERE user_id = (SELECT id FROM users WHERE email = ?) AND otp = ?';
  db.query(getOtpQuery, [email, otp], (err, results) => {
    if (err) {
      console.error('Error fetching OTP:', err);
      res.status(500).send('Internal server error.');
      return;
    }

    if (results.length === 0) {
      console.log(`Invalid or expired OTP for email: ${email}`);
      return res.status(401).send('Invalid OTP.');
    }

    const otpRecord = results[0];

    console.log(`OTP verified successfully for email: ${email}`);

    // Fetch user data from the database based on email
    const getUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(getUserQuery, [email], (err, userResults) => {
      if (err) {
        console.error('Error fetching user:', err.message);
        res.status(500).send('Internal server error.');
        return;
      }

      if (userResults.length === 0) {
        res.status(404).send('User not found.');
        return;
      }

      const user = userResults[0];

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email },  process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log("JWT Secret:", process.env.JWT_SECRET);  // Add this to check the secret value

      // Clear OTP after successful login (optional, since OTPs are already removed by cron job)
      const deleteOtpQuery = 'DELETE FROM otps WHERE user_id = ?';
      db.query(deleteOtpQuery, [otpRecord.user_id], (err) => {
        if (err) {
          console.error('Error deleting OTP:', err);
        } else {
          console.log(`OTP cleared for email: ${email}`);
        }
      });

      console.log(`Login successful for email: ${email}`);
      res.status(200).send({
        message: 'Login successful.',
        token,
        user_id: user.id
      });
    });
  });
};



// **Logout User**
export const logoutUser = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('No token provided.');
  }

  const token = authHeader.split(' ')[1];

  // Blacklist the token
  tokenBlacklist.add(token);

  console.log(`Logout successful, token blacklisted.`);
  res.status(200).send('Logout successful.');
};

// Middleware to validate JWT and check blacklist
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('No token provided.');
  }

  const token = authHeader.split(' ')[1];

  // Check if the token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).send('Token is invalid or expired.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded token payload to the request
    next();
  } catch (err) {
    return res.status(403).send('Invalid token.');
  }
};
