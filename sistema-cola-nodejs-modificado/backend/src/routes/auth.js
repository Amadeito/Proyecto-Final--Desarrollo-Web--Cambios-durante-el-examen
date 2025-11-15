const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../utils/db');
const { sign } = require('../utils/jwt');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing username/password' });
  try {
    const pool = await db.connect();
    const result = await pool.request().input('username', username).query(`
      SELECT u.UserId, u.Username, u.PasswordHash, r.Name AS RoleName
      FROM Users u
      JOIN Roles r ON u.RoleId = r.RoleId
      WHERE u.Username = @username`);
    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = sign(user);
    res.json({ accessToken: token, user: { userId: user.UserId, username: user.Username, role: user.RoleName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
