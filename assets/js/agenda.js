const A = { list: [], editingId: null };

function badgeStatus(s){
  const v = String(s||"").toLowerCase();
  if(v === "upcoming") return `<span class="badge text-bg-primary">Upcoming</span>`;
  if(v === "done") return `<span class="badge text-bg-success">Done</span>`;
  return `<span class="badge text-bg-light border">${esc(s||"-")}</span>`;
}

function card(e, i){
  const cover = e.coverUrl || "assets/img/hero.jpg";
  const canDelete = isAdmin();

  return `
  <div class="col-12" data-aos="zoom-in" data-aos-delay="${Math.min(i*40,240)}">
    <div class="card card-soft overflow-hidden">
      <div class="row g-0">
        <div class="col-md-4" style="background:#fff;">
          <img src="${esc(cover)}" alt="cover" style="width:100%;height:100%;object-fit:cover;min-height:160px;">
        </div>
        <div class="col-md-8">
          <div class="p-3">
            <div class="d-flex justify-content-between gap-2">
              <div>
                <div class="fw-bold fs-5">${esc(e.judul || "-")}</div>
                <div class="text-muted small">
                  ${esc(e.tanggal || "-")} ${e.waktu ? "• "+esc(e.waktu) : ""} • ${esc(e.lokasi || "-")}
                </div>
              </div>
              <div class="text-end">
                ${badgeStatus(e.status)}
                <div class="text-muted small mt-1">ID: ${esc(e.id||"-")}</div>
              </div>
            </div>

            <div class="text-muted mt-2 line-clamp-2">${esc(e.deskripsi || "-")}</div>

            <div class="d-flex flex-wrap gap-2 mt-3">
              <button class="btn btn-sm btn-outline-secondary" data-edit="${esc(e.id)}">Edit</button>
              ${canDelete ? `<button class="btn btn-sm btn-outline-danger" data-del="${esc(e.id)}">Hapus</button>` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function render(list){
  document.getElementById("count").textContent = `${list.length} Agenda`;
  const grid = document.getElementById("grid");
  grid.innerHTML = list.map(card).join("") || `<div class="col-12"><div class="alert alert-warning">Belum ada agenda.</div></div>`;

  grid.querySelectorAll("[data-edit]").forEach(b=> b.addEventListener("click", ()=> startEdit(b.dataset.edit)));
  grid.querySelectorAll("[data-del]").forEach(b=> b.addEventListener("click", ()=> delAgenda(b.dataset.del)));

  if(window.AOS) AOS.refresh();
}

function apply(){
  const q = document.getElementById("q").value.trim().toLowerCase();
  const st = document.getElementById("filterStatus").value;

  const filtered = A.list.filter(x=>{
    const okQ = !q || JSON.stringify(x).toLowerCase().includes(q);
    const okS = !st || String(x.status||"").toLowerCase() === st;
    return okQ && okS;
  });

  render(filtered);
}

function resetForm(){
  A.editingId = null;
  document.getElementById("formTitle").textContent = "Tambah Agenda";
  document.getElementById("modeBadge").textContent = "CREATE";
  document.getElementById("btnSave").textContent = "Simpan";

  ["judul","tanggal","waktu","lokasi","deskripsi","coverUrl"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  document.getElementById("status").value = "upcoming";
}

function startEdit(id){
  const e = A.list.find(x => String(x.id) === String(id));
  if(!e) return;

  A.editingId = id;
  document.getElementById("formTitle").textContent = "Edit Agenda";
  document.getElementById("modeBadge").textContent = "UPDATE";
  document.getElementById("btnSave").textContent = "Update";

  document.getElementById("judul").value = e.judul || "";
  document.getElementById("tanggal").value = e.tanggal || "";
  document.getElementById("waktu").value = e.waktu || "";
  document.getElementById("lokasi").value = e.lokasi || "";
  document.getElementById("deskripsi").value = e.deskripsi || "";
  document.getElementById("coverUrl").value = e.coverUrl || "";
  document.getElementById("status").value = e.status || "upcoming";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadAgenda(){
  wireShell("agenda.html");
  toast("alert","info","Memuat agenda...");

  const res = await api("agenda", {}, "GET");
  if(!res.ok){
    toast("alert","danger", res.message || "Gagal load agenda");
    return;
  }

  A.list = (res.data || []).slice().sort((a,b)=>{
    return String(b.tanggal||"").localeCompare(String(a.tanggal||""));
  });

  toast("alert","success", `Loaded: ${A.list.length} agenda`);
  apply();
}

async function saveAgenda(ev){
  ev.preventDefault();
  toast("alert","info","Menyimpan agenda...");

  const payload = {
    judul: document.getElementById("judul").value.trim(),
    tanggal: document.getElementById("tanggal").value,
    waktu: document.getElementById("waktu").value,
    lokasi: document.getElementById("lokasi").value.trim(),
    deskripsi: document.getElementById("deskripsi").value.trim(),
    coverUrl: document.getElementById("coverUrl").value.trim(),
    status: document.getElementById("status").value
  };

  if(!payload.judul || !payload.tanggal){
    toast("alert","danger","Judul dan tanggal wajib.");
    return;
  }

  let res;
  if(A.editingId){
    res = await api("agenda", { id:A.editingId, ...payload }, "POST", "&_method=UPDATE");
  }else{
    res = await api("agenda", payload, "POST", "&_method=CREATE");
  }

  if(!res.ok){
    toast("alert","danger", res.message || "Gagal simpan agenda");
    return;
  }

  toast("alert","success", res.message || "Berhasil");
  resetForm();
  await loadAgenda();
}

async function delAgenda(id){
  if(!isAdmin()) return;
  if(!confirm("Yakin hapus agenda ini?")) return;

  toast("alert","info","Menghapus agenda...");
  const res = await api("agenda", { id }, "POST", "&_method=DELETE");
  if(!res.ok){
    toast("alert","danger", res.message || "Gagal hapus");
    return;
  }
  toast("alert","success", res.message || "Dihapus");
  await loadAgenda();
}

document.addEventListener("DOMContentLoaded", ()=>{
  wireShell("agenda.html");

  document.getElementById("formAgenda").addEventListener("submit", saveAgenda);
  document.getElementById("btnReset").addEventListener("click", resetForm);
  document.getElementById("btnRefresh").addEventListener("click", loadAgenda);

  ["q","filterStatus"].forEach(id=>{
    document.getElementById(id).addEventListener("input", apply);
    document.getElementById(id).addEventListener("change", apply);
  });

  resetForm();
  loadAgenda();
});
