import { addPayment, getPaymentsByUserId, getAllPayments, updatePaymentStatusModel } from '../models/paymentModel.js';

// Create a new payment record
export const createPayment = async (req, res) => {
  const { user_id, name, amount_paid, transaction_id, status, payment_date, signature, terms_accepted, payment_details_accepted } = req.body;

  // Validate the required fields
  if (!user_id || !name || !amount_paid || !transaction_id || !status || !payment_date) {
    return res.status(400).send('All payment details are required.');
  }

  try {
    // Add the payment to the database
    const paymentId = await addPayment(user_id, name, amount_paid, transaction_id, status, payment_date, signature, terms_accepted, payment_details_accepted);

    // Send the response
    res.status(201).send({
      message: 'Payment created successfully.',
      paymentId,
    });
  } catch (err) {
    console.error('Error creating payment:', err.message);
    res.status(500).send('Error creating payment.');
  }
};

// Get all payments for a specific user
export const getPaymentsByUser = async (req, res) => {
  const { user_id } = req.params;  

  try {
 
    console.log(`Fetching payments for user_id: ${user_id}`);
     // Get payments by user_id   
    const payments = await getPaymentsByUserId(user_id);

    if (payments.length === 0) {
      return res.status(404).json({ message: 'No payments found for this user.' });
    }

    // Return payments in response
    res.status(200).json(payments);
  } catch (err) {
    console.error('Error fetching payments for user:', err.message);
    res.status(500).json({ message: 'Error fetching payments.', error: err.message });
  }
};

// Get all payments for admin (admin view)
export const getAllPaymentsForAdmin = async (req, res) => {
  try {
    // Get all payments
    const payments = await getAllPayments();

    if (payments.length === 0) {
      return res.status(404).send('No payments found.');
    }

    // Return all payments in response
    res.status(200).json(payments);
  } catch (err) {
    console.error('Error fetching all payments:', err.message);
    res.status(500).send('Error fetching payments.');
  }
};



// Controller to verify and update payment_details_accepted
export const verifyPaymentDetails = async (req, res) => {
  const { paymentId } = req.params;
  const { payment_details_accepted } = req.body;

  // Ensure payment_details_accepted is either 0 or 1
  if (payment_details_accepted !== 0 && payment_details_accepted !== 1) {
    return res.status(400).send('Invalid value for payment_details_accepted. It should be 0 or 1.');
  }

  // Query to update payment_details_accepted
  const updatePaymentQuery = 'UPDATE payments SET payment_details_accepted = ? WHERE id = ?';

  db.query(updatePaymentQuery, [payment_details_accepted, paymentId], (err, result) => {
    if (err) {
      console.error('Error updating payment details:', err);
      return res.status(500).send('Error updating payment details.');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Payment not found.');
    }

    return res.status(200).send({
      message: 'Payment details successfully updated.',
      updatedRows: result.affectedRows,
    });
  });
};

// Controller to get all payments by user
export const getAllPaymentsByUser = (req, res) => {
  const { userId } = req.params;

  const getPaymentsQuery = 'SELECT * FROM payments WHERE user_id = ?';

  db.query(getPaymentsQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching payments:', err);
      return res.status(500).send('Error fetching payments.');
    }

    if (results.length === 0) {
      return res.status(404).send('No payments found for this user.');
    }

    return res.status(200).send(results);
  });
};

// Controller to update payment status
export const updatePaymentStatus = async (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;

  // Validate the payment status
  const validStatuses = ['Success', 'Pending', 'Failed']; 
  if (!validStatuses.includes(status)) {
      console.error("Invalid status:", status);
      return;
  }
  

  try {
    // Call the updatePaymentStatus model function (renamed to avoid conflict)
    const result = await updatePaymentStatusModel(paymentId, status);  // Renamed here

    // If no rows were affected, return an error (payment not found)
    if (result.affectedRows === 0) {
      return res.status(404).send('Payment not found.');
    }

    // Return success message
    return res.status(200).send({
      message: 'Payment status successfully updated.',
      updatedRows: result.affectedRows,
    });
  } catch (err) {
    console.error('Error updating payment status:', err.message);
    res.status(500).send('Error updating payment status.');
  }
};
