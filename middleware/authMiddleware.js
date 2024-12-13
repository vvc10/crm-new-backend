import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('No token provided.');
  }

  const token = authHeader.split(' ')[1];
  console.log('Received token:', token);

  // Check if the secret key is correct
  console.log('JWT Secret being used:', process.env.JWT_SECRET); // Debugging secret

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded; // Attach user information (id, email) to the request
    next();
  } catch (err) {
    console.error('Error verifying token:', err);

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).send('Token has expired. Please log in again.');
    }
    
    return res.status(403).send('Invalid token.');
  }
};
