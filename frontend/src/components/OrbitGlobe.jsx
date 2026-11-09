import { useEffect, useRef, useState } from "react";
import { fetchWorldGeoJSON } from "../api.js";

const ORBIT_COLORS = {
  leo: "#0ea5e9",
  meo: "#8b5cf6",
  geo: "#f59e0b",
  heo: "#ef4444",
  sso: "#10b981",
};

const EARTH_RADIUS_KM = 6371.0;

let cachedWorldData = null;

// Incarcarea geometriei continentelor si tarilor prin modulul API
async function incarcaHartaLumii() {
  if (cachedWorldData) return cachedWorldData;
  try {
    const data = await fetchWorldGeoJSON();
    const countries = data.features.flatMap((feat) => {
      const geom = feat.geometry;
      const name = feat.properties?.name || "";
      if (!geom) return [];
      if (geom.type === "Polygon") {
        return [{ name, ring: geom.coordinates[0] }];
      }
      if (geom.type === "MultiPolygon") {
        return geom.coordinates.map((poly) => ({ name, ring: poly[0] }));
      }
      return [];
    });

    const rings = countries.map((c) => c.ring);
    cachedWorldData = { rings, countries };
    return cachedWorldData;
  } catch {
    return { rings: [], countries: [] };
  }
}

// Verificare geometrica pentru apartenenta unui punct la un poligon
function punctInPoligon(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Clasificarea continentului pe baza coordonatelor geografice
function continentDinCoordonate(lat, lon) {
  if (lat < -60) return "Antarctica";
  if (lat >= 35 && lon >= -11 && lon <= 42) return "Europa";
  if (lat <= 37 && lat >= -36 && lon >= -18 && lon <= 52) return "Africa";
  if (lat < -10 && lon >= 110 && lon <= 180) return "Australia / Oceania";
  if (lon <= -30 && lat >= 12) return "America de Nord";
  if (lon <= -30 && lat < 12) return "America de Sud";
  return "Asia";
}

// Identificarea regiunii terestre sau oceanice sub-satelit
function determinaLocatiaExacta(lat, lon, countries) {
  const found = countries.find((c) => punctInPoligon(lon, lat, c.ring));
  if (found) {
    return `${continentDinCoordonate(lat, lon)} (${found.name})`;
  }

  if (lat > 66) return "Oceanul Arctic";
  if (lat < -60) return "Oceanul Sudic";
  if (lat >= 30 && lat <= 46 && lon >= -6 && lon <= 36)
    return "Marea Mediterană";

  if (lon >= -70 && lon <= 20) {
    return lat >= 0 ? "Oceanul Atlantic de Nord" : "Oceanul Atlantic de Sud";
  }
  if (lon > 20 && lon <= 115 && lat <= 25) {
    return "Oceanul Indian";
  }
  return lat >= 0 ? "Oceanul Pacific de Nord" : "Oceanul Pacific de Sud";
}

// Calculul pozitiei subsolare reale in functie de timpul UTC curent
function calculeazaPozitieSoareUTC() {
  const now = new Date();
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
  const diff = now - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const utcHours =
    now.getUTCHours() +
    now.getUTCMinutes() / 60 +
    now.getUTCSeconds() / 3600;

  const declRad =
    ((-23.44 * Math.PI) / 180) *
    Math.cos(((2 * Math.PI) / 365.24) * (dayOfYear + 10));
  const sunLonDeg = -15 * (utcHours - 12);
  const sunLonRad = (sunLonDeg * Math.PI) / 180;

  return { declRad, sunLonRad, sunLonDeg };
}

// Calculul pozitiei 3D si geografice la scara fizica reala
function calculeazaPozitiePeOrbita(sat, timpSec) {
  const vitezaKms = Number(sat.viteza) || 7.58;
  const altKm = Number(sat.altitudine) || 550;
  const razaKm = EARTH_RADIUS_KM + altKm;
  const seed = Number(sat.norad) || sat.id * 137;

  const nodAscendentRad = (((seed * 53) % 360) * Math.PI) / 180;
  const faza0 = (((sat.id * 89 + seed) % 360) * Math.PI) / 180;
  const incDeg = Number(sat.inclinatie ?? 53.0);
  const incRad = (incDeg * Math.PI) / 180;

  const omegaReal = vitezaKms / razaKm;
  const u = faza0 + timpSec * omegaReal;

  const sinLat = Math.sin(incRad) * Math.sin(u);
  const latRad = Math.asin(Math.max(-1, Math.min(1, sinLat)));
  const lonOrbital = Math.atan2(
    Math.sin(u) * Math.cos(incRad),
    Math.cos(u)
  );

  const rotatiePamantRad = (2 * Math.PI * timpSec) / 86164.0;
  const lonRad = lonOrbital + nodAscendentRad - rotatiePamantRad;

  let lonDeg = (lonRad * 180) / Math.PI;
  lonDeg = ((((lonDeg + 180) % 360) + 360) % 360) - 180;
  const latDeg = (latRad * 180) / Math.PI;

  const xKm = razaKm * Math.cos(latRad) * Math.sin(lonRad);
  const yKm = razaKm * Math.sin(latRad);
  const zKm = razaKm * Math.cos(latRad) * Math.cos(lonRad);

  return {
    lat: latDeg,
    lon: lonDeg,
    latRad,
    lonRad,
    u,
    incRad,
    nodAscendentRad,
    razaKm,
    xKm,
    yKm,
    zKm,
  };
}

export default function OrbitGlobe({
  sateliti,
  selectedId,
  onSelectSatelit,
  compareIds = [],
  onCompare,
  watchlistIds = [],
  onToggleWatchlist,
  doarWatchlist,
  onToggleDoarWatchlist,
  tema,
  telemetrieLive,
}) {
  const canvasRef = useRef(null);
  const [modAfisare, setModAfisare] = useState("3d");
  const [arataOrbite, setArataOrbite] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [pozitiiLive, setPozitiiLive] = useState([]);

  const timpRef = useRef(0);
  const satelitiRef = useRef(sateliti);
  const selectedIdRef = useRef(selectedId);
  const compareIdsRef = useRef(compareIds);
  const temaRef = useRef(tema);
  const modRef = useRef(modAfisare);
  const arataOrbiteRef = useRef(arataOrbite);
  const zoomRef = useRef(zoom);
  const liveRef = useRef(telemetrieLive);
  const worldDataRef = useRef({ rings: [], countries: [] });
  const rotatieRef = useRef({ x: 0.22, y: -0.35 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    satelitiRef.current = sateliti;
  }, [sateliti]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    compareIdsRef.current = compareIds;
  }, [compareIds]);

  useEffect(() => {
    temaRef.current = tema;
  }, [tema]);

  useEffect(() => {
    modRef.current = modAfisare;
  }, [modAfisare]);

  useEffect(() => {
    arataOrbiteRef.current = arataOrbite;
  }, [arataOrbite]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    liveRef.current = telemetrieLive;
  }, [telemetrieLive]);

  useEffect(() => {
    incarcaHartaLumii().then((data) => {
      worldDataRef.current = data;
    });
  }, []);

  // Controlul zoom-ului din rotita mouse-ului pe canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      setZoom((prev) =>
        Number(Math.max(0.18, Math.min(3.5, prev * factor)).toFixed(2))
      );
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let frameCount = 0;

    const unghiuriCerc = Array.from({ length: 180 }, (_, i) => i * 2);

    const render = () => {
      if (liveRef.current) {
        timpRef.current += 1 / 60;
      }
      frameCount += 1;

      const t = timpRef.current;
      const lista = satelitiRef.current;
      const selId = selectedIdRef.current;
      const compIds = compareIdsRef.current;
      const isDark = temaRef.current === "dark";
      const mod = modRef.current;
      const showLines = arataOrbiteRef.current;
      const currentZoom = zoomRef.current;
      const { rings, countries } = worldDataRef.current;
      const { declRad, sunLonRad } = calculeazaPozitieSoareUTC();

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const pozitiiMap = new Map();

      if (mod === "2d") {
        ctx.fillStyle = isDark ? "#080a0f" : "#f1f5f9";
        ctx.fillRect(0, 0, w, h);

        const lonToX = (lon) => ((lon + 180) / 360) * w;
        const latToY = (lat) => ((90 - lat) / 180) * h;

        ctx.strokeStyle = isDark
          ? "rgba(255, 255, 255, 0.04)"
          : "rgba(15, 23, 42, 0.05)";
        ctx.lineWidth = 1;

        for (let lon = -150; lon <= 150; lon += 30) {
          const x = lonToX(lon);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let lat = -60; lat <= 60; lat += 30) {
          const y = latToY(lat);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        ctx.fillStyle = isDark ? "#161a24" : "#cbd5e1";
        ctx.strokeStyle = isDark
          ? "rgba(255, 255, 255, 0.14)"
          : "rgba(15, 23, 42, 0.2)";
        ctx.lineWidth = 0.8;

        rings.forEach((ring) => {
          ctx.beginPath();
          ring.forEach(([lon, lat], i) => {
            const x = lonToX(lon);
            const y = latToY(lat);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });

        // Ciclul Zi / Noapte pe harta 2D
        ctx.fillStyle = isDark
          ? "rgba(0, 0, 0, 0.52)"
          : "rgba(15, 23, 42, 0.22)";
        ctx.beginPath();
        const sunDrawsSouthNight = declRad >= 0;
        ctx.moveTo(0, sunDrawsSouthNight ? h : 0);

        for (let x = 0; x <= w; x += 4) {
          const lonDeg = (x / w) * 360 - 180;
          const lonR = (lonDeg * Math.PI) / 180;
          const tanLat =
            -Math.cos(lonR - sunLonRad) /
            (Math.tan(declRad) || 0.0001);
          const termLatDeg = (Math.atan(tanLat) * 180) / Math.PI;
          ctx.lineTo(x, latToY(termLatDeg));
        }
        ctx.lineTo(w, sunDrawsSouthNight ? h : 0);
        ctx.closePath();
        ctx.fill();

        lista.forEach((sat) => {
          const color = ORBIT_COLORS[sat.orbita] || "#e53854";
          const isSelected = sat.id === selId;
          const isCompared = compIds.includes(sat.id);
          const pos = calculeazaPozitiePeOrbita(sat, t);

          if (showLines || isSelected) {
            const trackPoints = [...unghiuriCerc]
              .map((deg) => {
                const theta = (deg * Math.PI) / 180;
                const sLat =
                  (Math.asin(Math.sin(pos.incRad) * Math.sin(theta)) * 180) /
                  Math.PI;
                const sLonOrb = Math.atan2(
                  Math.sin(theta) * Math.cos(pos.incRad),
                  Math.cos(theta)
                );
                let sLon =
                  ((sLonOrb + pos.nodAscendentRad) * 180) / Math.PI;
                sLon = ((((sLon + 180) % 360) + 360) % 360) - 180;
                return { lon: sLon, lat: sLat };
              })
              .sort((a, b) => a.lon - b.lon);

            ctx.beginPath();
            trackPoints.forEach((pt, idx) => {
              const px = lonToX(pt.lon);
              const py = latToY(pt.lat);
              if (idx === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            });

            ctx.strokeStyle = isSelected
              ? "#e53854"
              : sat.operational
              ? `${color}99`
              : `${color}55`;
            ctx.lineWidth = isSelected ? 2.2 : 1.2;
            if (!sat.operational) ctx.setLineDash([5, 5]);
            else ctx.setLineDash([]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          const sx = lonToX(pos.lon);
          const sy = latToY(pos.lat);
          pozitiiMap.set(sat.id, { sx, sy, pos, sat });

          ctx.beginPath();
          ctx.arc(
            sx,
            sy,
            isSelected || isCompared ? 5.5 : 4,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = sat.operational ? color : "#9ca3af";
          ctx.fill();
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = isDark ? "#ffffff" : "#0f172a";
          ctx.stroke();

          ctx.font =
            isSelected || isCompared
              ? "bold 11px system-ui, sans-serif"
              : "600 10px system-ui, sans-serif";
          ctx.fillStyle = isDark ? "#f8fafc" : "#0f172a";
          ctx.fillText(sat.nume, sx + 8, sy + 3);
        });
      } else {
        ctx.fillStyle = isDark ? "#050609" : "#f1f5f9";
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const globeRadius = Math.min(w, h) * 0.25 * currentZoom;
        const rot = rotatieRef.current;

        const project3D = (x, y, z) => {
          const cosY = Math.cos(rot.y);
          const sinY = Math.sin(rot.y);
          const x1 = x * cosY - z * sinY;
          const z1 = z * cosY + x * sinY;

          const cosX = Math.cos(rot.x);
          const sinX = Math.sin(rot.x);
          const y2 = y * cosX - z1 * sinX;
          const z2 = z1 * cosX + y * sinX;

          return { x: cx + x1, y: cy - y2, z: z2 };
        };

        const sunVecX = Math.cos(declRad) * Math.sin(sunLonRad);
        const sunVecY = Math.sin(declRad);
        const sunVecZ = Math.cos(declRad) * Math.cos(sunLonRad);
        const sunProj = project3D(
          sunVecX * globeRadius,
          sunVecY * globeRadius,
          sunVecZ * globeRadius
        );

        const lightOffsetX = (sunProj.x - cx) * 0.55;
        const lightOffsetY = (sunProj.y - cy) * 0.55;
        const earthGrad = ctx.createRadialGradient(
          cx + lightOffsetX,
          cy + lightOffsetY,
          globeRadius * 0.1,
          cx,
          cy,
          globeRadius * 1.05
        );
        if (isDark) {
          earthGrad.addColorStop(0, "#1c3354");
          earthGrad.addColorStop(0.55, "#0d1829");
          earthGrad.addColorStop(1, "#030508");
        } else {
          earthGrad.addColorStop(0, "#e0f2fe");
          earthGrad.addColorStop(0.6, "#bae6fd");
          earthGrad.addColorStop(1, "#64748b");
        }

        ctx.fillStyle = earthGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isDark
          ? "rgba(56, 189, 248, 0.35)"
          : "rgba(2, 132, 199, 0.35)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        rings.forEach((ring) => {
          ctx.beginPath();
          let started = false;
          let avgSunDot = 0;
          let count = 0;

          for (let i = 0; i < ring.length; i += 2) {
            const [lon, lat] = ring[i];
            const radLat = (lat * Math.PI) / 180;
            const radLon = (lon * Math.PI) / 180;
            const nx = Math.cos(radLat) * Math.sin(radLon);
            const ny = Math.sin(radLat);
            const nz = Math.cos(radLat) * Math.cos(radLon);

            const p = project3D(
              nx * globeRadius,
              ny * globeRadius,
              nz * globeRadius
            );
            if (p.z > 0) {
              if (!started) {
                ctx.moveTo(p.x, p.y);
                started = true;
              } else {
                ctx.lineTo(p.x, p.y);
              }
              avgSunDot += nx * sunVecX + ny * sunVecY + nz * sunVecZ;
              count++;
            } else {
              started = false;
            }
          }

          if (count > 2) {
            const isDaylight = avgSunDot / count > 0;
            ctx.fillStyle = isDark
              ? isDaylight
                ? "#24344d"
                : "#0c121c"
              : isDaylight
              ? "#94a3b8"
              : "#475569";
            ctx.strokeStyle = isDark
              ? "rgba(255, 255, 255, 0.14)"
              : "rgba(15, 23, 42, 0.2)";
            ctx.lineWidth = 0.7;
            ctx.fill();
            ctx.stroke();
          }
        });

        lista.forEach((sat) => {
          const scaleFactor =
            1.0 + (Number(sat.altitudine) || 550) / EARTH_RADIUS_KM;
          const r = globeRadius * scaleFactor;
          const color = ORBIT_COLORS[sat.orbita] || "#e53854";
          const isSelected = sat.id === selId;
          const isCompared = compIds.includes(sat.id);
          const pos = calculeazaPozitiePeOrbita(sat, t);

          if (showLines || isSelected) {
            ctx.beginPath();
            for (let deg = 0; deg <= 360; deg += 4) {
              const theta = (deg * Math.PI) / 180;
              const sLatRad = Math.asin(
                Math.sin(pos.incRad) * Math.sin(theta)
              );
              const sLonRad =
                Math.atan2(
                  Math.sin(theta) * Math.cos(pos.incRad),
                  Math.cos(theta)
                ) + pos.nodAscendentRad;

              const ox = r * Math.cos(sLatRad) * Math.sin(sLonRad);
              const oy = r * Math.sin(sLatRad);
              const oz = r * Math.cos(sLatRad) * Math.cos(sLonRad);
              const p = project3D(ox, oy, oz);
              if (deg === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = isSelected ? "#e53854" : `${color}77`;
            ctx.lineWidth = isSelected ? 2.0 : 1.0;
            if (!sat.operational) ctx.setLineDash([4, 4]);
            else ctx.setLineDash([]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          const sx3d = r * Math.cos(pos.latRad) * Math.sin(pos.lonRad);
          const sy3d = r * Math.sin(pos.latRad);
          const sz3d = r * Math.cos(pos.latRad) * Math.cos(pos.lonRad);
          const sp = project3D(sx3d, sy3d, sz3d);

          const distFromCenter2D = Math.hypot(sp.x - cx, sp.y - cy);
          const occludedByEarth =
            sp.z < 0 && distFromCenter2D < globeRadius;

          if (!occludedByEarth) {
            pozitiiMap.set(sat.id, { sx: sp.x, sy: sp.y, pos, sat });

            ctx.beginPath();
            ctx.arc(
              sp.x,
              sp.y,
              isSelected || isCompared ? 5.5 : 3.8,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = sat.operational ? color : "#9ca3af";
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.font =
              isSelected || isCompared
                ? "bold 11px system-ui, sans-serif"
                : "600 10px system-ui, sans-serif";
            ctx.fillStyle = isDark ? "#f8fafc" : "#0f172a";
            ctx.fillText(sat.nume, sp.x + 7, sp.y + 3);
          }
        });
      }

      if (compIds.length === 2) {
        const p1 = pozitiiMap.get(compIds[0]);
        const p2 = pozitiiMap.get(compIds[1]);
        if (p1 && p2) {
          const distKm = Math.hypot(
            p2.pos.xKm - p1.pos.xKm,
            p2.pos.yKm - p1.pos.yKm,
            p2.pos.zKm - p1.pos.zKm
          );

          ctx.strokeStyle = "#34d399";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
          ctx.setLineDash([]);

          const mx = (p1.sx + p2.sx) / 2;
          const my = (p1.sy + p2.sy) / 2;
          ctx.font = "bold 12px system-ui, sans-serif";
          ctx.fillStyle = "#34d399";
          ctx.fillText(`${distKm.toFixed(1)} km`, mx + 6, my - 6);
        }
      }

      if (frameCount % 12 === 0) {
        const snapshot = lista.map((sat) => {
          const pos = calculeazaPozitiePeOrbita(sat, t);
          return {
            id: sat.id,
            nume: sat.nume,
            orbita: sat.orbita.toUpperCase(),
            stare: sat.operational ? "Operațional" : "Mentenanță",
            altitudine: sat.altitudine,
            viteza: sat.viteza ?? 7.58,
            lat: pos.lat.toFixed(2),
            lon: pos.lon.toFixed(2),
            regiune: determinaLocatiaExacta(pos.lat, pos.lon, countries),
          };
        });
        setPozitiiLive(snapshot);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || modRef.current !== "3d") return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    rotatieRef.current = {
      x: Math.max(-1.4, Math.min(1.4, rotatieRef.current.x + dy * 0.008)),
      y: rotatieRef.current.y + dx * 0.008,
    };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="orbital-visualizer">
      <div className="visualizer-toolbar">
        <div className="view-mode-switch">
          <button
            type="button"
            className={`orbit-pill ${modAfisare === "3d" ? "active" : ""}`}
            onClick={() => setModAfisare("3d")}
          >
            Glob 3D (Scară Reală & Zi/Noapte)
          </button>
          <button
            type="button"
            className={`orbit-pill ${modAfisare === "2d" ? "active" : ""}`}
            onClick={() => setModAfisare("2d")}
          >
            Hartă 2D (Terminator Solar & Regiuni)
          </button>
          <button
            type="button"
            className={`orbit-pill ${arataOrbite ? "active" : ""}`}
            onClick={() => setArataOrbite((v) => !v)}
          >
            Linii Orbită: {arataOrbite ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            className={`orbit-pill ${doarWatchlist ? "active" : ""}`}
            onClick={onToggleDoarWatchlist}
          >
            Doar Cumul / Watchlist ({watchlistIds.length})
          </button>
        </div>

        {modAfisare === "3d" && (
          <div className="zoom-controls">
            <span className="zoom-label">Scară Zoom: {zoom.toFixed(2)}x</span>
            <button
              type="button"
              className="orbit-pill"
              onClick={() =>
                setZoom((z) => Number(Math.min(3.5, z * 1.25).toFixed(2)))
              }
            >
              Zoom +
            </button>
            <button
              type="button"
              className="orbit-pill"
              onClick={() =>
                setZoom((z) => Number(Math.max(0.18, z * 0.8).toFixed(2)))
              }
            >
              Zoom &minus;
            </button>
            <button
              type="button"
              className="orbit-pill"
              onClick={() => setZoom(0.28)}
            >
              Vedere GEO (0.28x)
            </button>
            <button
              type="button"
              className="orbit-pill"
              onClick={() => setZoom(1.0)}
            >
              Vedere LEO (1.0x)
            </button>
          </div>
        )}
      </div>

      <div className="globe-canvas-box">
        <canvas
          ref={canvasRef}
          width={920}
          height={460}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="groundtrack-table-wrap">
        <table className="groundtrack-table">
          <thead>
            <tr>
              <th>Satelit</th>
              <th>Stare</th>
              <th>Orbită</th>
              <th>Altitudine</th>
              <th>Viteză</th>
              <th>Coordonate (Lat / Lon)</th>
              <th>Locație Exactă (Continent / Țară / Ocean)</th>
              <th>Acțiuni Hartă</th>
            </tr>
          </thead>
          <tbody>
            {pozitiiLive.map((p) => {
              const inWatchlist = watchlistIds.includes(p.id);
              const inCompare = compareIds.includes(p.id);
              return (
                <tr
                  key={p.id}
                  className={selectedId === p.id ? "row-selected" : ""}
                  onClick={() =>
                    onSelectSatelit(selectedId === p.id ? null : p.id)
                  }
                >
                  <td>
                    <strong>{p.nume}</strong>
                  </td>
                  <td>{p.stare}</td>
                  <td>{p.orbita}</td>
                  <td>{p.altitudine} km</td>
                  <td>{p.viteza} km/s</td>
                  <td>
                    {p.lat}&deg;, {p.lon}&deg;
                  </td>
                  <td>
                    <span className="region-badge">{p.regiune}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="table-actions">
                      <button
                        type="button"
                        className={`btn-action ${inWatchlist ? "active" : ""}`}
                        onClick={() => onToggleWatchlist(p.id)}
                      >
                        {inWatchlist ? "În Cumul" : "+ Cumul"}
                      </button>
                      <button
                        type="button"
                        className={`btn-action ${inCompare ? "active" : ""}`}
                        onClick={() => onCompare(p.id)}
                      >
                        {inCompare ? "Comparat" : "Compară"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}