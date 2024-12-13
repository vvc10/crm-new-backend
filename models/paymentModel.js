import db from '../config/dbConfig.js';

// Add a new payment to the database
export const addPayment = (user_id, name, amount_paid, transaction_id, status, payment_date, signature, terms_accepted, payment_details_accepted) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO payments (user_id, name, amount_paid, transaction_id, status, payment_date, signature, terms_accepted, payment_details_accepted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [user_id, name, amount_paid, transaction_id, status, payment_date, signature, terms_accepted, payment_details_accepted], (err, result) => {
      if (err) {
        reject(err);  // Reject promise on error
      } else {
        resolve(result.insertId);  // Return the inserted payment ID
      }
    });
  });
};

// Get all payments for a specific user
export const getPaymentsByUserId = async (user_id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM payments WHERE user_id = ?';
    
    db.query(query, [user_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Get all payments (for admin) - No filtering by user
export const getAllPayments = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM payments';
    
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};



export const updatePaymentDetailsAccepted = (paymentId, payment_details_accepted) => {
  return new Promise((resolve, reject) => {
    const updateQuery = 'UPDATE payments SET payment_details_accepted = ? WHERE id = ?';
    db.query(updateQuery, [payment_details_accepted, paymentId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Update the payment status in the database
export const updatePaymentStatusModel = (paymentId, status) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE payments SET status = ? WHERE id = ?';

    // Execute the query
    db.query(query, [status, paymentId], (err, result) => {
      if (err) {
        reject(err); // Reject the promise if there's an error
      } else {
        resolve(result); // Resolve the promise with the query result
      }
    });
  });
};

