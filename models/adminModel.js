import db from '../config/dbConfig.js';

// Validate admin OTP during login
export const validateAdminOtp = (email, otp) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM admin_users WHERE email = ? AND otp = ?';
    db.query(sql, [email, otp], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? results[0] : null);  // Return admin data if OTP matches
      }
    });
  });
};
