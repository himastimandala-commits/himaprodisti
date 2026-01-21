function getQueryId(){
  const url = new URL(window.location.href);
  return url.searchParams.get("id");
}

async function loadKTA(){
  const user = requireAuth();
  const status = document.getElementById("status");

  const id = getQueryId() || user.memberId;
  if(!id){
    status.className = "alert alert-danger";
    status.textContent = "memberId kosong. Isi kolom memberId di sheet users (isi id anggota dari sheet members).";
    return;
  }

  const res = await api("members", { id }, "GET", "&_method=GETONE");
  if(!res.ok){
    status.className = "alert alert-danger";
    status.textContent = res.message || "Gagal memuat data KTA";
    return;
  }

  const m = res.data;
  document.getElementById("foto").src = m.fotoUrl || "assets/img/logo.png";
  document.getElementById("nama").textContent = m.nama || "-";
  document.getElementById("nim").textContent = `NIM: ${m.nim || "-"}`;
  document.getElementById("ttl").textContent = `TTL: ${m.ttl || "-"}`;
  document.getElementById("angkatan").textContent = `Angkatan: ${m.angkatan || "-"}`;
  document.getElementById("divjab").textContent = `${m.divisi || "-"} • ${m.jabatan || "-"}`;

  const qrText = `HIMA-STI|${m.id}|${m.nim}|${m.nama}`;
  document.getElementById("qr").innerHTML = "";
  new QRCode(document.getElementById("qr"), { text: qrText, width: 78, height: 78 });

  status.className = "alert alert-success";
  status.textContent = "Siap dicetak.";
}

document.getElementById("btnPrint")?.addEventListener("click", ()=> window.print());
document.addEventListener("DOMContentLoaded", loadKTA);
