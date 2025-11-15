const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// POST /api/patients
router.post('/', async (req, res) => {
  const { firstName, lastName, birthDate, phone, identification } = req.body;
  try {
    const pool = await db.connect();
    const result = await pool.request()
      .input('FirstName', firstName)
      .input('LastName', lastName)
      .input('BirthDate', birthDate)
      .input('Phone', phone)
      .input('Identification', identification)
      .query(`INSERT INTO Patients (FirstName, LastName, BirthDate, Phone, Identification)
        OUTPUT INSERTED.PatientId
        VALUES (@FirstName, @LastName, @BirthDate, @Phone, @Identification)`);
    const patientId = result.recordset[0].PatientId;
    res.status(201).json({ patientId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
