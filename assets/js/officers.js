const O = { list: [] };

function card(p, i){
  const foto = p.fotoUrl || "assets/img/logo.png";
  const status = String(p.status||"").toLowerCase() === "aktif" ? "success" : "secondary";
  const periode = p.periode || "-";

  return `
  <div class="col-md-6 col-lg-4" data-aos="zoom-in" data-aos-delay="${Math.min(i*40,240)}">
    <div class="card card-soft p-3 h-100">
      <div class="d-flex gap-3">
        <img class="avatar" src="${esc(foto)}" alt="foto">
        <div class="flex-fill">
          <div class="d-flex justify-content-between gap-2">
            <div class="fw-bold">${esc(p.nama || "-")}</div>
            <span class="badge text-bg-${status}">${esc(p.status || "-")}</span>
          </div>
          <div class="text-muted small">NIM: ${esc(p.nim || "-")}</div>
          <div class="mt-2">
            <div class="fw-semibold">${esc(p.jabatan || "-")}</div>
            <div class="text-muted small">${esc(p.divisi || "-")} • Periode ${esc(periode)}</div>
          </div>
        </div>
      </div>

      <hr>
      <div class="d-flex flex-wrap gap-2">
        <span class="badge rounded-pill text-bg-light border">Angkatan ${esc(p.angkatan || "-")}</span>
        <span class="badge rounded-pill text-bg-light border">${esc(p.kontak || "-")}</span>
      </div>
    </div>
  </div>
  `;
}

function fillFilters(list){
  const divSel = document.getElementById("filterDivisi");
  const perSel = document.getElementById("filterPeriode");

  const divs = [...new Set(list.map(x=>String(x.divisi||"").trim()).filter(Boolean))].sort();
  const pers = [...new Set(list.map(x=>String(x.periode||"").trim()).filter(Boolean))].sort().reverse();

  divSel.innerHTML = `<option value="">Semua Divisi</option>` + divs.map(d=>`<option>${esc(d)}</option>`).join("");
  perSel.innerHTML = `<option value="">Semua Periode</option>` + pers.map(p=>`<option>${esc(p)}</option>`).join("");
}

function apply(){
  const q = document.getElementById("q").value.trim().toLowerCase();
  const div = document.getElementById("filterDivisi").value;
  const per = document.getElementById("filterPeriode").value;

  const filtered = O.list.filter(x=>{
    const okQ = !q || JSON.stringify(x).toLowerCase().includes(q);
    const okD = !div || String(x.divisi||"") === div;
    const okP = !per || String(x.periode||"") === per;
    return okQ && okD && okP;
  });

  document.getElementById("count").textContent = `${filtered.length} Pengurus`;
  const grid = document.getElementById("grid");
  grid.innerHTML = filtered.map(card).join("") || `<div class="col-12"><div class="alert alert-warning">Data pengurus belum ada.</div></div>`;
  if(window.AOS) AOS.refresh();
}

async function init(){
  wireShell("officers.html");
  toast("alert","info","Memuat struktur kepengurusan...");

  const res = await api("officers", {}, "GET");
  if(!res.ok){
    toast("alert","danger", res.message || "Gagal load pengurus");
    return;
  }

  O.list = (res.data || []);
  fillFilters(O.list);
  toast("alert","success", `Loaded: ${O.list.length} pengurus`);

  ["q","filterDivisi","filterPeriode"].forEach(id=>{
    document.getElementById(id).addEventListener("input", apply);
    document.getElementById(id).addEventListener("change", apply);
  });

  apply();
}
document.addEventListener("DOMContentLoaded", init);
