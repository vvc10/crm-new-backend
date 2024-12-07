import pkg from 'authorizenet';  // Import the entire package
const { APIContracts, APIControllers } = pkg;  // Destructure the components you need

import db from '../config/dbConfig.js';
import { sendMail } from '../utils/mailer.js';

// Authorize.Net credentials
const apiLoginID = process.env.AUTHORIZE_API_LOGIN_ID;
const transactionKey = process.env.AUTHORIZE_TRANSACTION_KEY;

const merchantAuthentication = new APIContracts.MerchantAuthenticationType();
merchantAuthentication.setName(apiLoginID);
merchantAuthentication.setTransactionKey(transactionKey);

export const createPayment = (req, res) => {
  const { amount, cardNumber, expirationDate, cardCode, email } = req.body;

  console.log(`Processing payment for email: ${email}`);
  console.log(`Amount: ${amount}, Card Number: ${cardNumber}, Expiration Date: ${expirationDate}`);

  const creditCard = new APIContracts.CreditCardType();
  creditCard.setCardNumber(cardNumber);
  creditCard.setExpirationDate(expirationDate);
  creditCard.setCardCode(cardCode);

  const payment = new APIContracts.PaymentType();
  payment.setCreditCard(creditCard);

  const transactionRequest = new APIContracts.TransactionRequestType();
  transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTH_CAPTURE_TRANSACTION);
  transactionRequest.setAmount(amount);
  transactionRequest.setPayment(payment);

  const createTransactionRequest = new APIContracts.CreateTransactionRequest();
  createTransactionRequest.setMerchantAuthentication(merchantAuthentication);
  createTransactionRequest.setTransactionRequest(transactionRequest);

  console.log('Transaction request created');

  const ctrl = new APIControllers.CreateTransactionController(createTransactionRequest);

  // Timeout after 30 seconds
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Payment processing timed out')), 30000)
  );

  // Process the payment and handle timeout
  Promise.race([
    new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        console.log('API Response:', apiResponse);

        const transactionResponse = apiResponse.getTransactionResponse();
        console.log('Transaction Response:', transactionResponse);

        if (transactionResponse != null && transactionResponse.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          console.log('Transaction successful:', transactionResponse.getTransId());
          const insertPaymentQuery = 'INSERT INTO payments (amount, card_number, transaction_id, email, status) VALUES (?, ?, ?, ?, ?)';
          db.query(insertPaymentQuery, [amount, cardNumber, transactionResponse.getTransId(), email, 'Success'], (err) => {
            if (err) {
              console.error('Error saving payment:', err);
              return reject('Error saving payment.');
            }

            console.log('Payment saved to database');
            sendMail(email, 'Payment Confirmation', `Your payment of $${amount} was successful. Transaction ID: ${transactionResponse.getTransId()}`)
              .then(() => resolve({
                message: 'Payment processed successfully.',
                transactionId: transactionResponse.getTransId(),
              }))
              .catch((emailErr) => {
                console.error('Error sending email:', emailErr);
                reject('Payment successful, but failed to send email.');
              });
          });
        } else {
          const errorMessage = transactionResponse.getMessages().getMessage()[0].getText();
          console.error('Payment processing failed:', errorMessage);
          reject(`Payment failed: ${errorMessage}`);
        }
      });
    }),
    timeoutPromise, // The timeout will reject if the payment processing takes too long
  ])
    .then((result) => res.status(200).send(result))
    .catch((error) => {
      console.error('Error during payment processing:', error);
      res.status(500).send(error.message || 'Payment processing failed.');
    });
};


// **Get Payment Details**
export const getPaymentDetails = (req, res) => {
  const { transactionId } = req.params;

  const query = 'SELECT * FROM payments WHERE transaction_id = ?';
  db.query(query, [transactionId], (err, results) => {
    if (err) {
      console.error('Error fetching payment details:', err);
      return res.status(500).send('Error fetching payment details.');
    }
    if (results.length === 0) return res.status(404).send('Payment not found.');

    res.status(200).send({ paymentDetails: results[0] });
  });
};

// **Get All Payments**
export const getAllPayments = (req, res) => {
  const query = 'SELECT * FROM payments';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all payments:', err);
      return res.status(500).send('Error fetching payments.');
    }

    res.status(200).send({ payments: results });
  });
};
