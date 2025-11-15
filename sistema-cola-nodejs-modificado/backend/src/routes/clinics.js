const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// GET /api/clinics
router.get('/', async (req, res) => {
  try {
    const pool = await db.connect();
    const result = await pool.request().query('SELECT ClinicId, Code, Name, Description FROM Clinics ORDER BY ClinicId');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
