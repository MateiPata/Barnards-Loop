// Configurarea adresei serverului si functiile pentru cererile HTTP
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function fetchSateliti() {
  const res = await fetch(`${API_URL}/sateliti`);
  if (!res.ok) {
    throw new Error(`Eroare server: ${res.status}`);
  }
  return res.json();
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