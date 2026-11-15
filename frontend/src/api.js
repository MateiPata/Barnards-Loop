// Configurarea adresei de baza si functia comuna pentru cererile HTTP
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    throw new Error(`Eroare server: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export function fetchSateliti() {
  return request("/sateliti");
}

export function createSatelit(satelit) {
  return request("/sateliti", {
    method: "POST",
    body: JSON.stringify(satelit),
  });
}

export function updateSatelit(id, changes) {
  return request(`/sateliti/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteSatelit(id) {
  return request(`/sateliti/${id}`, {
    method: "DELETE",
  });
}

export async function fetchWorldGeoJSON() {
  const res = await fetch(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  );
  if (!res.ok) {
    throw new Error(`Eroare incarcare harta: ${res.status}`);
  }
  return res.json();
}