import { useEffect, useState } from "react";
import OrbitGlobe from "../components/OrbitGlobe.jsx";
import Comparator from "../components/Comparator.jsx";
import { TIPURI_SATELITI } from "../constants.js";
import { fetchSateliti } from "../api.js";
import styles from "./HartaPage.module.css";

export default function HartaPage({ tema, telemetrieLive }) {
  const [sateliti, setSateliti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [cautare, setCautare] = useState("");
  const [filtruOrbita, setFiltruOrbita] = useState("toate");
  const [filtruTip, setFiltruTip] = useState("toate");
  const [compareIds, setCompareIds] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [doarWatchlist, setDoarWatchlist] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await fetchSateliti();
        if (!ignore) setSateliti(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  function handleToggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function handleToggleWatchlist(id) {
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const satelitiFiltrati = sateliti.filter((s) => {
    if (doarWatchlist && !watchlistIds.includes(s.id)) return false;

    const text = cautare.toLowerCase().trim();
    const potrivireText =
      !text ||
      s.nume.toLowerCase().includes(text) ||
      String(s.norad).includes(text) ||
      (s.model && s.model.toLowerCase().includes(text)) ||
      (s.operator && s.operator.toLowerCase().includes(text)) ||
      (s.locLansare && s.locLansare.toLowerCase().includes(text));

    const potrivireOrbita =
      filtruOrbita === "toate" || s.orbita === filtruOrbita;

    const potrivireTip = filtruTip === "toate" || s.misiune === filtruTip;

    return potrivireText && potrivireOrbita && potrivireTip;
  });

  const satelitiComparati = compareIds
    .map((id) => sateliti.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <section className="panel">
      <Comparator
        satelitiComparati={satelitiComparati}
        onClear={() => setCompareIds([])}
        telemetrieLive={telemetrieLive && !loading && !error}
      />

      <div className={styles.listHeaderBar}>
        <h2>Hartă 2D &amp; Glob 3D</h2>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Filtrează sateliții de pe hartă..."
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          {["toate", "leo", "meo", "geo", "heo", "sso"].map((orb) => (
            <button
              key={orb}
              type="button"
              className={`${styles.filterChip} ${
                filtruOrbita === orb ? styles.active : ""
              }`}
              onClick={() => setFiltruOrbita(orb)}
            >
              {orb === "toate" ? "Toate Orbitele" : orb.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          {TIPURI_SATELITI.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.filterChip} ${
                filtruTip === t.id ? styles.active : ""
              }`}
              onClick={() => setFiltruTip(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="info" data-testid="loading">
          Se încarcă constelația de sateliți...
        </p>
      )}
      {error && (
        <p className="error" data-testid="error">
          {error}
        </p>
      )}
      {!loading && (
        <OrbitGlobe
          sateliti={satelitiFiltrati.map((s) => ({
            ...s,
            operational: !s.mentenanta,
          }))}
          selectedId={selectedId}
          onSelectSatelit={setSelectedId}
          compareIds={compareIds}
          onCompare={handleToggleCompare}
          watchlistIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          doarWatchlist={doarWatchlist}
          onToggleDoarWatchlist={() => setDoarWatchlist((v) => !v)}
          tema={tema}
          telemetrieLive={telemetrieLive}
        />
      )}
    </section>
  );
}