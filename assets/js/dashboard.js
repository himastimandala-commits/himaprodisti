let chart;

function buildChart(labels, values){
  const ctx = document.getElementById("chartAngkatan");
  if(chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label:"Jumlah", data: values }]
    },
    options: {
      responsive:true,
      plugins:{ legend:{ display:false } },
      scales:{ y:{ beginAtZero:true } }
    }
  });
}

async function initDashboard(){
  wireShell("dashboard.html");
  const alertBox = document.getElementById("alertDash");
  alertBox.className = "alert alert-info";
  alertBox.textContent = "Memuat statistik...";

  const res = await api("stats", {}, "GET");
  if(!res.ok){
    alertBox.className = "alert alert-danger";
    alertBox.textContent = res.message || "Gagal memuat statistik";
    return;
  }

  const s = res.data || {};
  document.getElementById("kpiMembers").textContent = s.totalMembers || 0;
  document.getElementById("kpiOfficers").textContent = s.totalOfficers || 0;
  document.getElementById("kpiAlumni").textContent = s.totalAlumni || 0;
  document.getElementById("kpiAgenda").textContent = s.upcomingAgenda || 0;

  const labels = (s.byAngkatan || []).map(x => String(x.angkatan));
  const values = (s.byAngkatan || []).map(x => Number(x.total || 0));
  buildChart(labels, values);

  document.getElementById("topAngkatan").textContent = `Top: ${s.topAngkatan || "-"}`;
  document.getElementById("insight").innerHTML = `
    <ul class="mb-0">
      <li>Angkatan terbanyak: <b>${s.topAngkatan || "-"}</b></li>
      <li>Total anggota: <b>${s.totalMembers || 0}</b></li>
      <li>Total pengurus: <b>${s.totalOfficers || 0}</b></li>
      <li>Total alumni: <b>${s.totalAlumni || 0}</b></li>
      <li>Update sistem: <b>${(s.generatedAt || "").slice(0,19).replace("T"," ")}</b></li>
    </ul>
  `;

  alertBox.className = "alert alert-success";
  alertBox.textContent = "Statistik berhasil dimuat.";
}

document.addEventListener("DOMContentLoaded", initDashboard);
