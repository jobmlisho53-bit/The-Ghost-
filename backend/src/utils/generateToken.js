const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Make sure we're using the same secret as in the auth middleware
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = generateToken;
