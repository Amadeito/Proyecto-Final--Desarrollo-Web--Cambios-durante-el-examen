function openReasignModal(turnoId, clinicaAnteriorId) {
  document.getElementById("turnoId").value = turnoId;
  document.getElementById("clinicaAnteriorId").value = clinicaAnteriorId;
  document.getElementById("modalReasignar").style.display = "block";
}

function closeReasignModal() {
  document.getElementById("modalReasignar").style.display = "none";
}

async function reasignarTurno() {
  const turnoId = document.getElementById("turnoId").value;
  const clinicaAnteriorId = document.getElementById("clinicaAnteriorId").value;
  const clinicaNuevaId = document.getElementById("clinicaNuevaId").value;
  const motivo = document.getElementById("motivo").value;

  const response = await fetch("/api/reasignacion/reasignar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turnoId, clinicaAnteriorId, clinicaNuevaId, motivo }),
  });

  const data = await response.json();
  alert(data.message);
  closeReasignModal();
  location.reload();
}
