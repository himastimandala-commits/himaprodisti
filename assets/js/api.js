const API_URL = "https://script.google.com/macros/s/AKfycbxK1IzsCmHQYmX8IdoROfUDPz57qvam5SoYr499ZyN8fAuI4l3Va-o5bMzgnYtiHzcw/exec";

async function api(action, payload = {}, method = "POST", extraParams = ""){
  const url = `${API_URL}?action=${encodeURIComponent(action)}${extraParams}`;
  const body = new URLSearchParams(payload);

  const res = await fetch(url, { method, body: method === "GET" ? null : body });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { ok:false, message: "Response bukan JSON: " + text.slice(0,180) }; }
}
