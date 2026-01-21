const state = { members: [], editingId: null };

function requireAuth(){
  const { token, user } = getSession();
  if(!token || !user) window.location.href = "login.html";

  const who = document.getElementById("who");
  if(who) who.textContent = `${user.username} (${user.role || "user"})`;
}

function renderTable(){
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  if(state.members.length === 0){
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8">Belum ada data.</td>`;
    tbody.appendChild(tr);
    return;
  }

  state.members.forEach(m=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.id || ""}</td>
      <td>${m.nama || ""}</td>
      <td>${m.nim || ""}</td>
      <td>${m.divisi || ""}</td>
      <td>${m.jabatan || ""}</td>
      <td>${m.angkatan || ""}</td>
      <td>${m.kontak || ""}</td>
      <td>
        <div class="actions">
          <button class="small" data-edit="${m.id}">Edit</button>
          <button class="small danger" data-del="${m.id}">Hapus</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-edit]").forEach(b=>{
    b.addEventListener("click", ()=>startEdit(b.dataset.edit));
  });
  tbody.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", ()=>deleteMember(b.dataset.del));
  });
}

async function loadMembers(){
  const alertBox = document.getElementById("alertDash");
  alertBox.className = "alert";
  alertBox.textContent = "Memuat data...";

  const result = await api("members", {}, "GET");
  if(!result.ok){
    alertBox.className = "alert bad";
    alertBox.textContent = result.message || "Gagal load data";
    return;
  }

  state.members = result.data || [];
  alertBox.className = "alert good";
  alertBox.textContent = `Loaded: ${state.members.length} anggota`;
  renderTable();
}

function resetForm(){
  state.editingId = null;
  document.getElementById("formTitle").textContent = "Tambah Anggota";
  document.getElementById("btnSave").textContent = "Simpan";
  document.getElementById("nama").value = "";
  document.getElementById("nim").value = "";
  document.getElementById("divisi").value = "";
  document.getElementById("jabatan").value = "";
  document.getElementById("angkatan").value = "";
  document.getElementById("kontak").value = "";
}

function startEdit(id){
  const m = state.members.find(x => String(x.id) === String(id));
  if(!m) return;

  state.editingId = id;
  document.getElementById("formTitle").textContent = "Edit Anggota";
  document.getElementById("btnSave").textContent = "Update";

  document.getElementById("nama").value = m.nama || "";
  document.getElementById("nim").value = m.nim || "";
  document.getElementById("divisi").value = m.divisi || "";
  document.getElementById("jabatan").value = m.jabatan || "";
  document.getElementById("angkatan").value = m.angkatan || "";
  document.getElementById("kontak").value = m.kontak || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveMember(e){
  e.preventDefault();
  const alertBox = document.getElementById("alertDash");
  alertBox.className = "alert";
  alertBox.textContent = "Menyimpan...";

  const payload = {
    nama: document.getElementById("nama").value.trim(),
    nim: document.getElementById("nim").value.trim(),
    divisi: document.getElementById("divisi").value.trim(),
    jabatan: document.getElementById("jabatan").value.trim(),
    angkatan: document.getElementById("angkatan").value.trim(),
    kontak: document.getElementById("kontak").value.trim(),
  };

  if(!payload.nama || !payload.nim){
    alertBox.className = "alert bad";
    alertBox.textContent = "Nama dan NIM wajib diisi.";
    return;
  }

  let result;
  if(state.editingId){
    result = await api("members", { id: state.editingId, ...payload }, "POST", "&_method=UPDATE");
  }else{
    result = await api("members", payload, "POST", "&_method=CREATE");
  }

  if(!result.ok){
    alertBox.className = "alert bad";
    alertBox.textContent = result.message || "Gagal simpan";
    return;
  }

  alertBox.className = "alert good";
  alertBox.textContent = result.message || "Berhasil";
  resetForm();
  await loadMembers();
}

async function deleteMember(id){
  if(!confirm("Yakin hapus data ini?")) return;

  const alertBox = document.getElementById("alertDash");
  alertBox.className = "alert";
  alertBox.textContent = "Menghapus...";

  const result = await api("members", { id }, "POST", "&_method=DELETE");
  if(!result.ok){
    alertBox.className = "alert bad";
    alertBox.textContent = result.message || "Gagal hapus";
    return;
  }

  alertBox.className = "alert good";
  alertBox.textContent = result.message || "Dihapus";
  await loadMembers();
}

function wireDashboard(){
  document.getElementById("btnLogout").addEventListener("click", logout);
  document.getElementById("btnReset").addEventListener("click", resetForm);
  document.getElementById("formMember").addEventListener("submit", saveMember);
}

<script src="assets/js/wp-posts.js"></script>
