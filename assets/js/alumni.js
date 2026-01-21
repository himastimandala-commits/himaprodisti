const AL = { list: [] };

function card(a, i){
  const foto = a.fotoUrl || "assets/img/logo.png";
  const status = String(a.status||"").toLowerCase() === "aktif" ? "success" : "secondary";

  return `
  <div class="col-md-6 col-lg-4" data-aos="zoom-in" data-aos-delay="${Math.min(i*40,240)}">
    <div class="card card-soft p-3 h-100">
      <div class="d-flex gap-3">
        <img class="avatar" src="${esc(foto)}" alt="foto">
        <div class="flex-fill">
          <div class="d-flex justify-content-between gap-2">
            <div class="fw-bold">${esc(a.nama || "-")}</div>
            <span class="badge text-bg-${status}">${esc(a.status || "-")}</span>
          </div>
          <div class="text-muted small">NIM: ${esc(a.nim || "-")}</div>

          <div class="mt-2 d-flex flex-wrap gap-2">
            <span class="badge rounded-pill text-bg-light border">Angkatan ${esc(a.angkatan || "-")}</span>
            <span class="badge rounded-pill text-bg-light border">${esc(a.kontak || "-")}</span>
          </div>

          <div class="text-muted small mt-2 line-clamp-2">
            TTL: ${esc(a.ttl || "-")} • Alamat: ${esc(a.alamat || "-")}
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function fillAngkatan(list){
  const sel = document.getElementById("filterAngkatan");
  const angs = [...new Set(list.map(x=>String(x.angkatan||"").trim()).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">Semua Angkatan</option>` + angs.map(a=>`<option>${esc(a)}</option>`).join("");
}

function apply(){
  const q = document.getElementById("q").value.trim().toLowerCase();
  const ang = document.getElementById("filterAngkatan").value;
  const st = document.getElementById("filterStatus").value;

  const filtered = AL.list.filter(x=>{
    const okQ = !q || JSON.stringify(x).toLowerCase().includes(q);
    const okA = !ang || String(x.angkatan||"") === ang;
    const okS = !st || String(x.status||"").toLowerCase() === st;
    return okQ && okA && okS;
  });

  document.getElementById("count").textContent = `${filtered.length} Alumni`;
  const grid = document.getElementById("grid");
  grid.innerHTML = filtered.map(card).join("") || `<div class="col-12"><div class="alert alert-warning">Data alumni belum ada.</div></div>`;
  if(window.AOS) AOS.refresh();
}

async function init(){
  wireShell("alumni.html");
  toast("alert","info","Memuat data alumni...");

  const res = await api("alumni", {}, "GET");
  if(!res.ok){
    toast("alert","danger", res.message || "Gagal load alumni");
    return;
  }

  AL.list = (res.data || []).slice().reverse();
  fillAngkatan(AL.list);
  toast("alert","success", `Loaded: ${AL.list.length} alumni`);
  apply();

  ["q","filterAngkatan","filterStatus"].forEach(id=>{
    document.getElementById(id).addEventListener("input", apply);
    document.getElementById(id).addEventListener("change", apply);
  });
}
document.addEventListener("DOMContentLoaded", init);
