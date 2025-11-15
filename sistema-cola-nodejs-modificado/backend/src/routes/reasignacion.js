const express = require("express");
const router = express.Router();
const db = require("../utils/db");

router.post("/reasignar", async (req, res) => {
  try {
    const { turnoId, clinicaNuevaId, motivo, clinicaAnteriorId } = req.body;

    await db.query(
      `UPDATE Turnos SET clinicaId = @clinicaNuevaId WHERE id = @turnoId`,
      { turnoId, clinicaNuevaId }
    );

    await db.query(
      `INSERT INTO ReasignacionesTurnos (turnoId, clinicaAnteriorId, clinicaNuevaId, motivo)
       VALUES (@turnoId, @clinicaAnteriorId, @clinicaNuevaId, @motivo)`,
      { turnoId, clinicaAnteriorId, clinicaNuevaId, motivo }
    );

    res.json({ message: "Turno reasignado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al reasignar turno" });
  }
});

module.exports = router;
