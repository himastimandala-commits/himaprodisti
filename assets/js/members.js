const S = { list: [], editingId: null };

function statusBadge(st){
  const v = String(st||"").toLowerCase();
  if(v === "aktif") return `<span class="badge text-bg-success">Aktif</span>`;
  if(v === "nonaktif") return `<span class="badge text-bg-secondary">Nonaktif</span>`;
  return `<span class="badge text-bg-light border">${esc(st||"-")}</span>`;
}

function row(m){
  const foto = m.fotoUrl || "assets/img/logo.png";
  const canDelete = isAdmin();

  return `
    <tr>
      <td><img class="avatar" src="${esc(foto)}" alt="foto"></td>
      <td>
        <div class="fw-semibold">${esc(m.nama)}</div>
        <div class="text-muted small">NIM: ${esc(m.nim)} • TTL: ${esc(m.ttl||"-")}</div>
        <div class="text-muted small line-clamp-2">Alamat: ${esc(m.alamat||"-")}</div>
        <div class="text-muted small">Kontak: ${esc(m.kontak||"-")}</div>
      </td>
      <td class="fw-semibold">${esc(m.angkatan||"-")}</td>
      <td>
        <div class="fw-semibold">${esc(m.divisi||"-")}</div>
        <div class="text-muted small">${esc(m.jabatan||"-")}</div>
      </td>
      <td>${statusBadge(m.status)}</td>
      <td class="text-end">
        <a class="btn btn-sm btn-outline-primary" href="kta.html?id=${encodeURIComponent(m.id)}">KTA</a>
        <button class="btn btn-sm btn-outline-secondary" data-edit="${esc(m.id)}">Edit</button>
        ${canDelete ? `<button class="btn btn-sm btn-outline-danger" data-del="${esc(m.id)}">Hapus</button>` : ""}
      </td>
    </tr>
  `;
}

function fillAngkatan(list){
  const sel = document.getElementById("filterAngkatan");
  const angs = [...new Set(list.map(x=>String(x.angkatan||"").trim()).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">Semua Angkatan</option>` + angs.map(a=>`<option>${esc(a)}</option>`).join("");
}

function render(list){
  document.getElementById("count").textContent = `${list.length} Anggota`;
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = list.map(row).join("") || `<tr><td colspan="6">Belum ada data.</td></tr>`;

  tbody.querySelectorAll("[data-edit]").forEach(b=>{
    b.addEventListener("click", ()=> startEdit(b.dataset.edit));
  });
  tbody.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", ()=> deleteMember(b.dataset.del));
  });

  if(window.AOS) AOS.refresh();
}

function apply(){
  const q = document.getElementById("q").value.trim().toLowerCase();
  const ang = document.getElementById("filterAngkatan").value;
  const st = document.getElementById("filterStatus").value;

  const filtered = S.list.filter(x=>{
    const okQ = !q || JSON.stringify(x).toLowerCase().includes(q);
    const okA = !ang || String(x.angkatan||"") === ang;
    const okS = !st || String(x.status||"").toLowerCase() === st;
    return okQ && okA && okS;
  });

  render(filtered);
}

function resetForm(){
  S.editingId = null;
  document.getElementById("formTitle").textContent = "Tambah Anggota";
  document.getElementById("modeBadge").textContent = "CREATE";
  document.getElementById("btnSave").textContent = "Simpan";

  ["nama","nim","ttl","alamat","angkatan","divisi","jabatan","kontak","fotoUrl"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  document.getElementById("status").value = "aktif";
}

function startEdit(id){
  const m = S.list.find(x => String(x.id) === String(id));
  if(!m) return;

  S.editingId = id;
  document.getElementById("formTitle").textContent = "Edit Anggota";
  document.getElementById("modeBadge").textContent = "UPDATE";
  document.getElementById("btnSave").textContent = "Update";

  document.getElementById("nama").value = m.nama || "";
  document.getElementById("nim").value = m.nim || "";
  document.getElementById("ttl").value = m.ttl || "";
  document.getElementById("alamat").value = m.alamat || "";
  document.getElementById("angkatan").value = m.angkatan || "";
  document.getElementById("divisi").value = m.divisi || "";
  document.getElementById("jabatan").value = m.jabatan || "";
  document.getElementById("kontak").value = m.kontak || "";
  document.getElementById("fotoUrl").value = m.fotoUrl || "";
  document.getElementById("status").value = (m.status || "aktif");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadMembers(){
  wireShell("members.html");
  toast("alertBox","info","Memuat data anggota...");

  const res = await api("members", {}, "GET");
  if(!res.ok){
    toast("alertBox","danger", res.message || "Gagal load data");
    return;
  }

  S.list = (res.data || []).slice().reverse();
  fillAngkatan(S.list);
  toast("alertBox","success", `Loaded: ${S.list.length} anggota`);
  apply();
}

async function saveMember(e){
  e.preventDefault();
  toast("alertBox","info","Menyimpan...");

  const payload = {
    nama: document.getElementById("nama").value.trim(),
    nim: document.getElementById("nim").value.trim(),
    ttl: document.getElementById("ttl").value.trim(),
    alamat: document.getElementById("alamat").value.trim(),
    angkatan: document.getElementById("angkatan").value.trim(),
    divisi: document.getElementById("divisi").value.trim(),
    jabatan: document.getElementById("jabatan").value.trim(),
    kontak: document.getElementById("kontak").value.trim(),
    fotoUrl: document.getElementById("fotoUrl").value.trim(),
    status: document.getElementById("status").value
  };

  if(!payload.nama || !payload.nim){
    toast("alertBox","danger","Nama dan NIM wajib diisi.");
    return;
  }

  let res;
  if(S.editingId){
    res = await api("members", { id:S.editingId, ...payload }, "POST", "&_method=UPDATE");
  }else{
    res = await api("members", payload, "POST", "&_method=CREATE");
  }

  if(!res.ok){
    toast("alertBox","danger", res.message || "Gagal simpan");
    return;
  }

  toast("alertBox","success", res.message || "Berhasil");
  resetForm();
  await loadMembers();
}

async function deleteMember(id){
  if(!isAdmin()) return;
  if(!confirm("Yakin hapus data anggota ini?")) return;

  toast("alertBox","info","Menghapus...");
  const res = await api("members", { id }, "POST", "&_method=DELETE");
  if(!res.ok){
    toast("alertBox","danger", res.message || "Gagal hapus");
    return;
  }
  toast("alertBox","success", res.message || "Dihapus");
  await loadMembers();
}

document.addEventListener("DOMContentLoaded", ()=>{
  wireShell("members.html");

  document.getElementById("formMember").addEventListener("submit", saveMember);
  document.getElementById("btnReset").addEventListener("click", resetForm);
  document.getElementById("btnRefresh").addEventListener("click", loadMembers);

  ["q","filterAngkatan","filterStatus"].forEach(id=>{
    document.getElementById(id).addEventListener("input", apply);
    document.getElementById(id).addEventListener("change", apply);
  });

  resetForm();
  loadMembers();
});
