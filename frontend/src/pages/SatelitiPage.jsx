import { useState, useEffect } from "react";
import SatelitList from "../components/SatelitList.jsx";
import SatelitForm from "../components/SatelitForm.jsx";
import Comparator from "../components/Comparator.jsx";
import { TIPURI_SATELITI } from "../constants.js";
import {
  fetchSateliti,
  createSatelit,
  updateSatelit,
  deleteSatelit,
} from "../api.js";
import styles from "./SatelitiPage.module.css";

export default function SatelitiPage({ telemetrieLive }) {
  const [sateliti, setSateliti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);

  const [cautare, setCautare] = useState("");
  const [filtruOrbita, setFiltruOrbita] = useState("toate");
  const [filtruTip, setFiltruTip] = useState("toate");
  const [filtruStare, setFiltruStare] = useState("toti");
  const [sortare, setSortare] = useState("implicit");

  const [compareIds, setCompareIds] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [doarWatchlist, setDoarWatchlist] = useState(false);
  const [satelitEditat, setSatelitEditat] = useState(null);

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

  async function handleAdd(nou) {
    const creat = await createSatelit(nou);
    setSateliti((prev) => [...prev, creat]);
  }

  async function handleToggle(id) {
    const sat = sateliti.find((s) => s.id === id);
    if (!sat) return;
    try {
      const actualizat = await updateSatelit(id, {
        mentenanta: !sat.mentenanta,
      });
      setSateliti((prev) => prev.map((s) => (s.id === id ? actualizat : s)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveEdit(id, changes) {
    const actualizat = await updateSatelit(id, changes);
    setSateliti((prev) => prev.map((s) => (s.id === id ? actualizat : s)));
    setSatelitEditat(null);
  }

  async function handleDelete(id) {
    try {
      await deleteSatelit(id);
      setSateliti((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
      if (satelitEditat?.id === id) setSatelitEditat(null);
      setCompareIds((prev) => prev.filter((item) => item !== id));
      setWatchlistIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleToggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }

  function handleToggleWatchlist(id) {
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const operationali = sateliti.filter((s) => !s.mentenanta).length;

  const satelitiFiltrati = sateliti
    .filter((s) => {
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

      const potrivireStare =
        filtruStare === "toti" ||
        (filtruStare === "operationali" && !s.mentenanta) ||
        (filtruStare === "mentenanta" && s.mentenanta);

      return (
        potrivireText && potrivireOrbita && potrivireTip && potrivireStare
      );
    })
    .sort((a, b) => {
      if (sortare === "nume-asc") return a.nume.localeCompare(b.nume);
      if (sortare === "alt-desc") return b.altitudine - a.altitudine;
      if (sortare === "alt-asc") return a.altitudine - b.altitudine;
      if (sortare === "viteza-desc") return (b.viteza || 0) - (a.viteza || 0);
      if (sortare === "eol-asc")
        return (a.decommission || 9999) - (b.decommission || 9999);
      return a.id - b.id;
    });

  const satelitiComparati = compareIds
    .map((id) => sateliti.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <div className={styles.grid}>
      <section className="panel">
        <h2>
          {satelitEditat
            ? `Editează satelit (#${satelitEditat.id})`
            : "Adaugă satelit"}
        </h2>
        <SatelitForm
          key={satelitEditat?.id ?? "new"}
          onAdd={handleAdd}
          satelitEditat={satelitEditat}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setSatelitEditat(null)}
        />
      </section>

      <section className="panel">
        <Comparator
          satelitiComparati={satelitiComparati}
          onClear={() => setCompareIds([])}
          telemetrieLive={telemetrieLive && !loading && !error}
        />

        <div className={styles.listHeaderBar}>
          <div>
            <h2>Sateliți pe orbită</h2>
            <p className={styles.summary}>
              {operationali}/{sateliti.length} operaționali
            </p>
          </div>

          <div className={styles.searchAndSort}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Caută satelit, NORAD, model, operator..."
                value={cautare}
                onChange={(e) => setCautare(e.target.value)}
              />
            </div>

            <select
              className={styles.sortSelect}
              value={sortare}
              onChange={(e) => setSortare(e.target.value)}
              aria-label="Ordonează sateliții"
            >
              <option value="implicit">Sortare: Implicită</option>
              <option value="nume-asc">Alfabetic (A &rarr; Z)</option>
              <option value="alt-desc">Altitudine (Mare &rarr; Mică)</option>
              <option value="alt-asc">Altitudine (Mică &rarr; Mare)</option>
              <option value="viteza-desc">Viteză (Mare &rarr; Mică)</option>
              <option value="eol-asc">Dezafectare EOL (Urgent)</option>
            </select>
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
            <button
              type="button"
              className={`${styles.filterChip} ${
                doarWatchlist ? styles.active : ""
              }`}
              onClick={() => setDoarWatchlist((v) => !v)}
            >
              Watchlist ({watchlistIds.length})
            </button>
            {watchlistIds.length > 0 && (
              <button
                type="button"
                className={styles.filterChip}
                onClick={() => {
                  setWatchlistIds([]);
                  setDoarWatchlist(false);
                }}
              >
                Golește Watchlist
              </button>
            )}
          </div>
        </div>

        <div className={styles.filterBar}>
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

          <div className={styles.filterGroup}>
            {[
              { id: "toti", label: "Toți" },
              { id: "operationali", label: "Operaționali" },
              { id: "mentenanta", label: "Mentenanță" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`${styles.filterChip} ${
                  filtruStare === st.id ? styles.active : ""
                }`}
                onClick={() => setFiltruStare(st.id)}
              >
                {st.label}
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
          <SatelitList
            sateliti={satelitiFiltrati}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={setSatelitEditat}
            onCompare={handleToggleCompare}
            compareIds={compareIds}
            onToggleWatchlist={handleToggleWatchlist}
            watchlistIds={watchlistIds}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </section>
    </div>
  );
}