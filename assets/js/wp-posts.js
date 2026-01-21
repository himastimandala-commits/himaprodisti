const WP_SITE = "himaprodisti.wordpress.com";
const WP_API_BASE = `https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}/posts/`;

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || div.innerText || "").trim();
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function getFeaturedImage(post) {
  if (post && post.featured_image) return post.featured_image;

  if (post && post.attachments) {
    const keys = Object.keys(post.attachments);
    if (keys.length) {
      const att = post.attachments[keys[0]];
      if (att && att.URL) return att.URL;
    }
  }

  return "assets/img/hero.jpg";
}

async function fetchPostsByCategory(category, number = 6) {
  const url = `${WP_API_BASE}?category=${encodeURIComponent(
    category
  )}&number=${number}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function renderWpPosts(posts) {
  const grid = document.getElementById("wpGrid");
  grid.innerHTML = "";

  posts.forEach((p, idx) => {
    const img = getFeaturedImage(p);
    const title = stripHtml(p.title) || "(Tanpa Judul)";
    const excerpt = stripHtml(p.excerpt) || "";
    const shortExcerpt =
      excerpt.length > 140 ? excerpt.slice(0, 140) + "..." : excerpt;

    // ✅ 4 kolom di desktop
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-3";
    col.setAttribute("data-aos", "fade-up");
    col.setAttribute("data-aos-delay", String(50 * Math.min(idx, 6)));

    col.innerHTML = `
    <div class="wp-card h-100 shadow-sm border-0 rounded-4 overflow-hidden d-flex flex-column">
      <div class="wp-img-wrap position-relative">
        <img src="${img}" alt="${title}" class="w-100 object-fit-cover" style="height:180px;">
        <span class="wp-meta position-absolute top-0 end-0 m-2 px-2 py-1 bg-dark bg-opacity-75 text-white rounded small">
          ${formatDate(p.date)} • ${p.author?.name || "Admin"}
        </span>
      </div>
      <div class="pad flex-grow-1 d-flex flex-column">
        <h5 class="fw-bold mb-2 mt-2 text-primary">${title}</h5>
        <p class="wp-excerpt text-secondary small flex-grow-1">${shortExcerpt}</p>
        <a class="wp-link mt-2 btn btn-outline-primary btn-sm rounded-pill align-self-start" href="${
          p.URL
        }" target="_blank" rel="noopener">
          Baca selengkapnya →
        </a>
      </div>
    </div>
  `;

    grid.appendChild(col);
  });

  if (window.AOS) AOS.refresh();
}

async function loadWpCategory(category) {
  const status = document.getElementById("wpStatus");
  status.textContent = "Memuat postingan...";

  try {
    const data = await fetchPostsByCategory(category, 6);
    const posts = data.posts || [];

    if (!posts.length) {
      status.textContent = `Tidak ada postingan pada kategori "${category}".`;
      document.getElementById("wpGrid").innerHTML = "";
      return;
    }

    status.textContent = `Menampilkan ${posts.length} postingan kategori "${category}".`;
    renderWpPosts(posts);
  } catch (err) {
    status.textContent = `Gagal memuat postingan (${err.message}).`;
    document.getElementById("wpGrid").innerHTML = "";
  }
}

function initWpTabs() {
  const tabs = document.querySelectorAll(".wp-tab");
  tabs.forEach((btn) => {
    btn.addEventListener("click", async () => {
      tabs.forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      await loadWpCategory(btn.dataset.cat);
    });
  });

  loadWpCategory("berita");
}

document.addEventListener("DOMContentLoaded", initWpTabs);
