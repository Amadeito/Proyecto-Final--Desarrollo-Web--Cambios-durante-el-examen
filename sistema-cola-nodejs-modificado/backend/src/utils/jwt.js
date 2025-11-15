const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function sign(user) {
  const payload = { sub: user.UserId, username: user.Username, role: user.RoleName };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
}

function verify(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifySocketToken(token) {
  return verify(token);
}

module.exports = { sign, verify, verifySocketToken };
