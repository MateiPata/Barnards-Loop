import { useState, useEffect } from "react";
import SatelitList from "./components/SatelitList.jsx";
import SatelitForm from "./components/SatelitForm.jsx";
import OrbitGlobe from "./components/OrbitGlobe.jsx";
import {
  fetchSateliti,
  createSatelit,
  updateSatelit,
  deleteSatelit,
} from "./api.js";

const TIPURI_SATELITI = [
  { id: "toate", label: "Toate Tipurile" },
  { id: "internet", label: "Internet" },
  { id: "comunicatii", label: "Communications" },
  { id: "positioning", label: "Positioning" },
  { id: "observare", label: "Earth Imaging" },
  { id: "weather", label: "Weather" },
  { id: "stiintific", label: "Science" },
  { id: "iot", label: "IoT" },
  { id: "custom", label: "Custom" },
];

const STELE_FUNDAL = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 7) % 98}%`,
  top: `${(i * 37 + 11) % 96}%`,
  isPink: i % 3 === 0,
  size: i % 5 === 0 ? 3 : 2,
  delay: `${(i * 0.7) % 8}s`,
  duration: `${4 + (i % 5)}s`,
}));

function calculeazaPerioadaMin(altKm, velKms) {
  const r = 6371.0 + (Number(altKm) || 550);
  const v = Number(velKms) || 7.58;
  return Number(((2 * Math.PI * r) / (v * 60)).toFixed(1));
}

function calculeazaDistanta3DKm(satA, satB, timpSec = 0) {
  if (!satA || !satB) return 0;
  const rA = 6371.0 + (Number(satA.altitudine) || 550);
  const rB = 6371.0 + (Number(satB.altitudine) || 550);
  const uA =
    (((satA.id * 89 + (Number(satA.norad) || 100)) % 360) * Math.PI) / 180 +
    timpSec * ((Number(satA.viteza) || 7.58) / rA);
  const uB =
    (((satB.id * 89 + (Number(satB.norad) || 200)) % 360) * Math.PI) / 180 +
    timpSec * ((Number(satB.viteza) || 7.58) / rB);
  const incA = ((Number(satA.inclinatie) || 53) * Math.PI) / 180;
  const incB = ((Number(satB.inclinatie) || 53) * Math.PI) / 180;

  const xA = rA * Math.cos(uA);
  const yA = rA * Math.sin(uA) * Math.sin(incA);
  const zA = rA * Math.sin(uA) * Math.cos(incA);

  const xB = rB * Math.cos(uB);
  const yB = rB * Math.sin(uB) * Math.sin(incB);
  const zB = rB * Math.sin(uB) * Math.cos(incB);

  return Math.hypot(xB - xA, yB - yA, zB - zA);
}

function temaInitiala() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [sateliti, setSateliti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tema, setTema] = useState(temaInitiala);
  const [meniuActiv, setMeniuActiv] = useState("home");

  const [telemetrieLive, setTelemetrieLive] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [secundeSimulare, setSecundeSimulare] = useState(0);

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

  useEffect(() => {
    if (!telemetrieLive || loading || error) return;
    const interval = setInterval(() => {
      setSecundeSimulare((s) => s + 1.5);
    }, 1500);
    return () => clearInterval(interval);
  }, [telemetrieLive, loading, error]);

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
      setSateliti((prev) =>
        prev.map((s) => (s.id === id ? actualizat : s))
      );
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

  function handleTema() {
    const noua = tema === "dark" ? "light" : "dark";
    setTema(noua);
    document.documentElement.dataset.theme = noua;
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

  const distanta3DKm =
    satelitiComparati.length === 2
      ? calculeazaDistanta3DKm(
          satelitiComparati[0],
          satelitiComparati[1],
          secundeSimulare
        )
      : 0;

  const renderComparator = () => {
    if (satelitiComparati.length === 0) return null;
    return (
      <div className="compare-drawer">
        <div className="compare-header">
          <h3>Comparator Sateliți ({satelitiComparati.length}/2 selectați)</h3>
          <button
            type="button"
            className="btn-action"
            onClick={() => setCompareIds([])}
          >
            Închide comparatorul
          </button>
        </div>

        {satelitiComparati.length === 1 ? (
          <p className="compare-hint">
            Ai selectat <strong>{satelitiComparati[0].nume}</strong>. Selectează
            încă un satelit cu butonul <strong>„Compară”</strong> pentru a
            calcula distanța 3D și diferențele orbitale.
          </p>
        ) : (
          <div className="compare-grid">
            {satelitiComparati.map((s) => (
              <div key={s.id} className="compare-col">
                <div className="satellite-title-row">
                  <h4>{s.nume}</h4>
                  <span className={`badge badge-${s.orbita}`}>
                    {s.orbita.toUpperCase()}
                  </span>
                </div>
                <ul className="compare-specs">
                  <li>
                    <span>Altitudine:</span>{" "}
                    <strong>{s.altitudine} km</strong>
                  </li>
                  <li>
                    <span>Viteză:</span> <strong>{s.viteza} km/s</strong>
                  </li>
                  <li>
                    <span>Perioadă orbită:</span>{" "}
                    <strong>
                      {calculeazaPerioadaMin(s.altitudine, s.viteza)} min
                    </strong>
                  </li>
                  <li>
                    <span>Înclinație:</span>{" "}
                    <strong>{s.inclinatie}&deg;</strong>
                  </li>
                  <li>
                    <span>Model / Operator:</span>{" "}
                    <strong>
                      {s.model} ({s.operator})
                    </strong>
                  </li>
                  <li>
                    <span>Dezafectare (EOL):</span>{" "}
                    <strong>Anul {s.decommission}</strong>
                  </li>
                </ul>
              </div>
            ))}

            <div className="compare-delta">
              <span>
                Distanță 3D Directă:{" "}
                <strong className="accent-text">
                  {distanta3DKm.toFixed(1)} km
                </strong>
              </span>
              <span>
                &Delta; Altitudine:{" "}
                <strong>
                  {Math.abs(
                    satelitiComparati[0].altitudine -
                      satelitiComparati[1].altitudine
                  ).toFixed(1)}{" "}
                  km
                </strong>
              </span>
              <span>
                &Delta; Viteză:{" "}
                <strong>
                  {Math.abs(
                    satelitiComparati[0].viteza - satelitiComparati[1].viteza
                  ).toFixed(2)}{" "}
                  km/s
                </strong>
              </span>
              <span>
                &Delta; Perioadă:{" "}
                <strong>
                  {Math.abs(
                    calculeazaPerioadaMin(
                      satelitiComparati[0].altitudine,
                      satelitiComparati[0].viteza
                    ) -
                      calculeazaPerioadaMin(
                        satelitiComparati[1].altitudine,
                        satelitiComparati[1].viteza
                      )
                  ).toFixed(1)}{" "}
                  min
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="starfield" aria-hidden="true">
        {STELE_FUNDAL.map((st) => (
          <span
            key={st.id}
            className={`star-dot ${st.isPink ? "star-pink" : "star-white"}`}
            style={{
              left: st.left,
              top: st.top,
              width: `${st.size}px`,
              height: `${st.size}px`,
              animationDelay: st.delay,
              animationDuration: st.duration,
            }}
          />
        ))}
      </div>

      <header className="app-header">
        <div className="header-container">
          <div className="header-left">
            <div className="header-logo">
              <img
                src={
                  tema === "dark"
                    ? "/BL_white-removebg-preview.png"
                    : "/BL_black-removebg-preview.png"
                }
                alt="Barnard's Loop Logo"
              />
            </div>

            <div className="header-brand">
              <h1>Barnard's Loop</h1>
              <p>
                Monitorizarea și managementul flotei de sateliți pe orbite
                terestre.
              </p>
            </div>
          </div>
        </div>

        {/* Bara de sub linia din antet: Stanga (Live + Tab-uri) | Dreapta (Contor + Tema) */}
        <nav className="app-nav">
          <div className="nav-left">
            <button
              type="button"
              className={`live-pill ${
                telemetrieLive ? "is-live" : "is-paused"
              }`}
              onClick={() => setTelemetrieLive((v) => !v)}
              title="Pornește / Oprește simularea în timp real"
            >
              <span className="live-dot" />
              {telemetrieLive ? "Live" : "Pauză"}
            </button>

            <button
              type="button"
              className={`nav-tab ${meniuActiv === "home" ? "active" : ""}`}
              onClick={() => setMeniuActiv("home")}
            >
              Panou Sateliți (Home)
            </button>
            <button
              type="button"
              className={`nav-tab ${meniuActiv === "globe" ? "active" : ""}`}
              onClick={() => setMeniuActiv("globe")}
            >
              Hartă 2D & Glob 3D
            </button>
          </div>

          <div className="nav-right">
            <p className="app-count">
              {operationali}/{sateliti.length} operaționali
            </p>
            <button
              className="theme-toggle"
              onClick={handleTema}
              aria-pressed={tema === "dark"}
              aria-label={tema === "dark" ? "Mod luminos" : "Mod întunecat"}
              title={
                tema === "dark"
                  ? "Treci pe Mod luminos"
                  : "Treci pe Mod întunecat"
              }
            >
              {tema === "dark" ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      <main className="container">
        {meniuActiv === "home" && (
          <div className="workspace-grid">
            <section className="panel">
              <h2>
                {satelitEditat
                  ? `Editează satelit (#${satelitEditat.id})`
                  : "Adaugă satelit"}
              </h2>
              <SatelitForm
                onAdd={handleAdd}
                satelitEditat={satelitEditat}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setSatelitEditat(null)}
              />
            </section>

            <section className="panel">
              {renderComparator()}

              <div className="list-header-bar">
                <h2>Sateliți pe orbită</h2>

                <div className="search-and-sort">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Caută satelit, NORAD, model, operator..."
                      value={cautare}
                      onChange={(e) => setCautare(e.target.value)}
                    />
                  </div>

                  <select
                    className="sort-select"
                    value={sortare}
                    onChange={(e) => setSortare(e.target.value)}
                    aria-label="Ordonează sateliții"
                  >
                    <option value="implicit">Sortare: Implicită</option>
                    <option value="nume-asc">Alfabetic (A &rarr; Z)</option>
                    <option value="alt-desc">
                      Altitudine (Mare &rarr; Mică)
                    </option>
                    <option value="alt-asc">
                      Altitudine (Mică &rarr; Mare)
                    </option>
                    <option value="viteza-desc">
                      Viteză (Mare &rarr; Mică)
                    </option>
                    <option value="eol-asc">
                      Dezafectare EOL (Urgent)
                    </option>
                  </select>
                </div>
              </div>

              <div className="filter-bar">
                <div className="filter-group">
                  {["toate", "leo", "meo", "geo", "heo", "sso"].map((orb) => (
                    <button
                      key={orb}
                      type="button"
                      className={`filter-chip ${
                        filtruOrbita === orb ? "active" : ""
                      }`}
                      onClick={() => setFiltruOrbita(orb)}
                    >
                      {orb === "toate" ? "Toate Orbitele" : orb.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="filter-group">
                  <button
                    type="button"
                    className={`filter-chip ${doarWatchlist ? "active" : ""}`}
                    onClick={() => setDoarWatchlist((v) => !v)}
                  >
                    Watchlist ({watchlistIds.length})
                  </button>
                  {watchlistIds.length > 0 && (
                    <button
                      type="button"
                      className="filter-chip"
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

              <div className="filter-bar">
                <div className="filter-group">
                  {TIPURI_SATELITI.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`filter-chip ${
                        filtruTip === t.id ? "active" : ""
                      }`}
                      onClick={() => setFiltruTip(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="filter-group">
                  {[
                    { id: "toti", label: "Toți" },
                    { id: "operationali", label: "Operaționali" },
                    { id: "mentenanta", label: "Mentenanță" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`filter-chip ${
                        filtruStare === st.id ? "active" : ""
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
        )}

        {meniuActiv === "globe" && (
          <section className="panel">
            {renderComparator()}

            <div className="list-header-bar">
              <h2>Hartă 2D & Glob 3D</h2>

              <div className="search-box">
                <input
                  type="text"
                  placeholder="Filtrează sateliții de pe hartă..."
                  value={cautare}
                  onChange={(e) => setCautare(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                {["toate", "leo", "meo", "geo", "heo", "sso"].map((orb) => (
                  <button
                    key={orb}
                    type="button"
                    className={`filter-chip ${
                      filtruOrbita === orb ? "active" : ""
                    }`}
                    onClick={() => setFiltruOrbita(orb)}
                  >
                    {orb === "toate" ? "Toate Orbitele" : orb.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="filter-group">
                {TIPURI_SATELITI.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`filter-chip ${
                      filtruTip === t.id ? "active" : ""
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
        )}
      </main>

      <footer className="app-footer">Proiect Tehnologii Web</footer>
    </>
  );
}