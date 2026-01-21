function wireShell(activeHref){
  const user = requireAuth();
  const who = document.getElementById("who");
  if(who) who.textContent = `${user.username} • ${user.role}`;

  document.getElementById("btnLogout")?.addEventListener("click", logout);

  // highlight nav
  if(activeHref){
    document.querySelectorAll(".nav-link").forEach(a=>{
      if(a.getAttribute("href") === activeHref) a.classList.add("active");
    });
  }
}

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function toIdDate(iso){
  try{
    return new Date(iso).toLocaleDateString("id-ID",{ day:"2-digit", month:"long", year:"numeric" });
  }catch{ return ""; }
}

function toast(elId, type, msg){
  const el = document.getElementById(elId);
  if(!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
}
