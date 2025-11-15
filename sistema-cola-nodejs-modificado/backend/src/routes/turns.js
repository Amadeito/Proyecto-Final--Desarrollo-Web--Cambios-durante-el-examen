const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

// helper to get next number for clinic
async function getNextNumber(clinicId) {
  const pool = await db.connect();
  const result = await pool.request().input('clinicId', clinicId)
    .query('SELECT ISNULL(MAX(Number), 0) + 1 AS NextNum FROM Turns WHERE ClinicId = @clinicId');
  return result.recordset[0].NextNum;
}

// POST /api/turns -- create from pretriage or direct
router.post('/', async (req, res) => {
  const { patientId, clinicId, priority } = req.body;
  if (!patientId || !clinicId) return res.status(400).json({ message: 'Missing fields' });
  try {
    const pool = await db.connect();
    const nextNum = await getNextNumber(clinicId);
    const result = await pool.request()
      .input('clinicId', clinicId)
      .input('patientId', patientId)
      .input('number', nextNum)
      .input('priority', priority || 3)
      .query(`INSERT INTO Turns (ClinicId, PatientId, Number, Status, Priority)
        OUTPUT INSERTED.TurnId, INSERTED.Number
        VALUES (@clinicId, @patientId, @number, 'waiting', @priority)`);
    const turn = result.recordset[0];
    // emit socket
    const io = req.app.get('io');
    io.to(`clinic_${clinicId}`).emit('turnCreated', { turn: { turnId: turn.TurnId, number: turn.Number, clinicId } });
    res.status(201).json({ turnId: turn.TurnId, number: turn.Number });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/turns/queue/:clinicId
router.get('/queue/:clinicId', async (req, res) => {
  const clinicId = req.params.clinicId;
  try {
    const pool = await db.connect();
    const result = await pool.request().input('clinicId', clinicId)
      .query(`SELECT t.TurnId, t.Number, t.Status, t.Priority, p.FirstName, p.LastName
        FROM Turns t
        JOIN Patients p ON t.PatientId = p.PatientId
        WHERE t.ClinicId = @clinicId AND t.Status IN ('waiting','called')
        ORDER BY t.Priority ASC, t.CreatedAt ASC`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/turns/:turnId/call
router.post('/:turnId/call', async (req, res) => {
  const turnId = req.params.turnId;
  const doctorId = req.body.doctorId || null;
  try {
    const pool = await db.connect();
    const result = await pool.request().input('turnId', turnId)
      .query(`UPDATE Turns SET Status='called', CalledAt=GETUTCDATE(), DoctorId=@doctorId
        OUTPUT INSERTED.TurnId, INSERTED.ClinicId, INSERTED.Number
        WHERE TurnId = @turnId`)
      .input('doctorId', doctorId);
    const updated = result.recordset[0];
    if (!updated) return res.status(404).json({ message: 'Turn not found' });
    const io = req.app.get('io');
    io.to(`clinic_${updated.ClinicId}`).emit('turnUpdated', { action: 'called', turn: updated });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/turns/:turnId/finish
router.post('/:turnId/finish', async (req, res) => {
  const turnId = req.params.turnId;
  try {
    const pool = await db.connect();
    const result = await pool.request().input('turnId', turnId)
      .query(`UPDATE Turns SET Status='finished', FinishedAt=GETUTCDATE()
        OUTPUT INSERTED.TurnId, INSERTED.ClinicId, INSERTED.Number
        WHERE TurnId = @turnId`);
    const updated = result.recordset[0];
    if (!updated) return res.status(404).json({ message: 'Turn not found' });
    const io = req.app.get('io');
    io.to(`clinic_${updated.ClinicId}`).emit('turnUpdated', { action: 'finished', turn: updated });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/turns/:turnId/absent
router.post('/:turnId/absent', async (req, res) => {
  const turnId = req.params.turnId;
  try {
    const pool = await db.connect();
    const result = await pool.request().input('turnId', turnId)
      .query(`UPDATE Turns SET Status='absent' OUTPUT INSERTED.TurnId, INSERTED.ClinicId, INSERTED.Number WHERE TurnId = @turnId`);
    const updated = result.recordset[0];
    if (!updated) return res.status(404).json({ message: 'Turn not found' });
    const io = req.app.get('io');
    io.to(`clinic_${updated.ClinicId}`).emit('turnUpdated', { action: 'absent', turn: updated });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
