function setSession(data){
  localStorage.setItem("hima_token", data.token);
  localStorage.setItem("hima_user", JSON.stringify(data.user));
}
function getSession(){
  const token = localStorage.getItem("hima_token");
  const user = localStorage.getItem("hima_user");
  return { token, user: user ? JSON.parse(user) : null };
}
function logout(){
  localStorage.removeItem("hima_token");
  localStorage.removeItem("hima_user");
  window.location.href = "login.html";
}
function requireAuth(){
  const { token, user } = getSession();
  if(!token || !user) window.location.href = "login.html";
  return user;
}
function isAdmin(){
  const { user } = getSession();
  return user && String(user.role).toLowerCase() === "admin";
}
async function handleLogin(e){
  e.preventDefault();
  const btn = document.getElementById("btnLogin");
  const alertBox = document.getElementById("alert");
  alertBox.className = "mt-3";
  alertBox.textContent = "";
  btn.disabled = true;
  btn.textContent = "Memproses...";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const result = await api("login", { username, password }, "POST");
  if(!result.ok){
    alertBox.className = "alert alert-danger mt-3";
    alertBox.textContent = result.message || "Login gagal";
    btn.disabled = false;
    btn.textContent = "Masuk";
    return;
  }

  setSession(result);
  alertBox.className = "alert alert-success mt-3";
  alertBox.textContent = "Login berhasil";
  setTimeout(()=> window.location.href = "dashboard.html", 350);
}
