function setActiveNav() {
  const links = document.querySelectorAll(".navbar-nav .nav-link");
  let found = false;
  links.forEach((link) => link.classList.remove("active"));
  for (const link of links) {
    const hash = link.getAttribute("href");
    if (hash && hash.startsWith("#")) {
      const section = document.querySelector(hash);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom > 80) {
          link.classList.add("active");
          found = true;
          break;
        }
      }
    }
  }
  if (!found) links[0].classList.add("active");
}
window.addEventListener("scroll", setActiveNav, { passive: true });
document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
  link.addEventListener("click", function () {
    document
      .querySelectorAll(".navbar-nav .nav-link")
      .forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});
document.addEventListener("DOMContentLoaded", setActiveNav);

document.getElementById("year").textContent = new Date().getFullYear();

// AOS
AOS.init({ once: true, duration: 800, offset: 60 });

// THEME
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector("i");

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  themeIcon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
  localStorage.setItem("theme", theme);
  if (window.AOS) AOS.refresh();
}

themeToggle.addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme") || "light";
  setTheme(current === "light" ? "dark" : "light");
});

const saved = localStorage.getItem("theme");
if (saved) setTheme(saved);

/* =========================
     API HELPER (WAJIB ADA)
     ========================= */
const apiBase = "assets/api.php"; // ganti kalau endpoint kamu beda

async function api(action, body = {}, method = "POST", extraQuery = "") {
  const url = `${apiBase}?action=${encodeURIComponent(action)}${
    extraQuery ? "&" + extraQuery : ""
  }`;

  const opt = { method, headers: {} };

  if (method !== "GET") {
    opt.headers["Content-Type"] = "application/json";
    opt.body = JSON.stringify(body || {});
  }

  try {
    const r = await fetch(url, opt);
    const ct = r.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await r.json()
      : await r.text();

    if (!r.ok) {
      return {
        ok: false,
        message: data && data.message ? data.message : "Request gagal",
        data: null,
      };
    }

    // kalau response JSON: {ok:true,data:{...}}
    if (typeof data === "object" && data !== null) {
      return {
        ok: data.ok !== false,
        message: data.message || "",
        data: data.data ?? data,
      };
    }

    return { ok: true, message: "", data };
  } catch (err) {
    return {
      ok: false,
      message: err.message || "Network error",
      data: null,
    };
  }
}

/* =========================
     COUNTER ANIMATION
     ========================= */
function animateTo(id, target) {
  const el = document.getElementById(id);
  if (!el) return;

  const end = Math.max(0, parseInt(target, 10) || 0);
  const start = parseInt((el.textContent || "0").replace(/\D/g, ""), 10) || 0;

  const duration = 900;
  const t0 = performance.now();

  function step(t) {
    const p = Math.min(1, (t - t0) / duration);
    const val = Math.floor(start + (end - start) * p);
    el.textContent = val.toLocaleString("id-ID");
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* =========================
     LOAD STATS (HIDUP)
     ========================= */
async function loadStats() {
  // default biar tetap tampil
  animateTo("statMembers", 0);
  animateTo("statAgenda", 0);
  animateTo("statOfficers", 0);
  animateTo("statAlumni", 0);

  const res = await api("stats", {}, "GET");

  if (!res.ok) {
    console.log("Stats gagal:", res.message);
    return;
  }

  const d = res.data || {};
  animateTo("statMembers", d.totalMembers || 0);
  animateTo("statAgenda", d.upcomingAgenda || 0);
  animateTo("statOfficers", d.totalOfficers || 0);
  animateTo("statAlumni", d.totalAlumni || 0);

  if (window.AOS) AOS.refresh();
}

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
});
