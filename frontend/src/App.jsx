import { useState, useEffect } from "react";
import SatelitList from "./components/SatelitList.jsx";
import OrbitGlobe from "./components/OrbitGlobe.jsx";

// Datele initiale ale flotei de sateliti
const SATELITI_INITIALI = [
  {
    id: 1,
    nume: "AeroSat-1X",
    operational: true,
    orbita: "leo",
    norad: 54891,
    altitudine: 550,
    viteza: 7.58,
    inclinatie: 53.2,
    misiune: "internet",
    model: "Starlink-V2 Bus",
    operator: "SpaceX",
    locLansare: "Cape Canaveral SLC-40",
    anLansare: 2024,
    decommission: 2031,
    imagine:
      "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    nume: "Sentinel-Alpha",
    operational: false,
    orbita: "meo",
    norad: 43120,
    altitudine: 20200,
    viteza: 3.87,
    inclinatie: 56.0,
    misiune: "observare",
    model: "Galileo-FOC",
    operator: "ESA / Copernicus",
    locLansare: "Kourou ELA-3",
    anLansare: 2021,
    decommission: 2030,
    imagine:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    nume: "GeoRelay-01",
    operational: true,
    orbita: "geo",
    norad: 39845,
    altitudine: 35786,
    viteza: 3.07,
    inclinatie: 8.5,
    misiune: "positioning",
    model: "Eurostar-3000",
    operator: "Eutelsat / NASA",
    locLansare: "Kennedy LC-39A",
    anLansare: 2019,
    decommission: 2034,
    imagine:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=120&auto=format&fit=crop&q=80",
  },
];

// Lista categoriilor de sateliti după rol
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

// Coordonatele stelelor de fundal
const STELE_FUNDAL = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 7) % 98}%`,
  top: `${(i * 37 + 11) % 96}%`,
  isPink: i % 3 === 0,
  size: i % 5 === 0 ? 3 : 2,
  delay: `${(i * 0.7) % 8}s`,
  duration: `${4 + (i % 5)}s`,
}));

// Set de imagini pentru asignarea automata la crearea unui satelit
const POZE_SATELITI = [
  "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581822261290-991b38693d1b?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1457364887197-9150188c107b?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=120&auto=format&fit=crop&q=80",
];

// Selectarea aleatoare a unei imagini din set
function alegePozaRandom() {
  const index = Math.floor(Math.random() * POZE_SATELITI.length);
  return POZE_SATELITI[index];
}

// Calculul vitezei orbitale Kepler
function calculeazaVitezaKepler(altKm) {
  const mu = 398600.4418;
  const r = 6371.0 + (Number(altKm) || 550);
  return Number(Math.sqrt(mu / r).toFixed(2));
}

// Calculul perioadei orbitale in minute
function calculeazaPerioadaMin(altKm, velKms) {
  const r = 6371.0 + (Number(altKm) || 550);
  const v = Number(velKms) || 7.58;
  return Number(((2 * Math.PI * r) / (v * 60)).toFixed(1));
}

// Citirea temei de pornire din sistemul de operare
function temaInitiala() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Calculul distantei 3D in kilometri intre doi sateliti
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

export default function App() {
  const [sateliti, setSateliti] = useState(SATELITI_INITIALI);
  const [tema, setTema] = useState(temaInitiala);
  const [meniuActiv, setMeniuActiv] = useState("home");

  const [telemetrieLive, setTelemetrieLive] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [secundeSimulare, setSecundeSimulare] = useState(0);

  // State pentru filtre, cautare si sortare
  const [cautare, setCautare] = useState("");
  const [filtruOrbita, setFiltruOrbita] = useState("toate");
  const [filtruTip, setFiltruTip] = useState("toate");
  const [filtruStare, setFiltruStare] = useState("toti");
  const [sortare, setSortare] = useState("implicit");

  // State pentru Comparator si pentru lista (Watchlist)
  const [compareIds, setCompareIds] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [doarWatchlist, setDoarWatchlist] = useState(false);

  // State pentru formularul de adaugare / editare satelit
  const [editingId, setEditingId] = useState(null);
  const [nume, setNume] = useState("");
  const [norad, setNorad] = useState("");
  const [altitudine, setAltitudine] = useState("550");
  const [viteza, setViteza] = useState("7.58");
  const [orbita, setOrbita] = useState("leo");
  const [misiune, setMisiune] = useState("internet");
  const [model, setModel] = useState("Starlink-V2 Bus");
  const [operator, setOperator] = useState("");
  const [locLansare, setLocLansare] = useState("Cape Canaveral SLC-40");
  const [anLansare, setAnLansare] = useState("2025");
  const [decommission, setDecommission] = useState("2032");
  const [inclinatie, setInclinatie] = useState("53.0");

  // Actualizarea periodica a telemetriei cand simularea live este activa
  useEffect(() => {
    if (!telemetrieLive) return;
    const interval = setInterval(() => {
      setSecundeSimulare((s) => s + 1.5);
      setSateliti((prev) =>
        prev.map((s) => {
          if (!s.operational) return s;
          const deltaAlt = (Math.random() - 0.5) * 0.2;
          const deltaVel = (Math.random() - 0.5) * 0.01;
          return {
            ...s,
            altitudine: Number((s.altitudine + deltaAlt).toFixed(1)),
            viteza: Number((s.viteza + deltaVel).toFixed(2)),
          };
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, [telemetrieLive]);

  function handleAltitudineChange(val) {
    setAltitudine(val);
    if (Number(val) >= 100) {
      setViteza(String(calculeazaVitezaKepler(val)));
    }
  }

  function handleToggle(id) {
    setSateliti((prev) =>
      prev.map((s) => (s.id === id ? { ...s, operational: !s.operational } : s))
    );
  }

  function handleDelete(id) {
    setSateliti((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editingId === id) reseteazaFormular();
    setCompareIds((prev) => prev.filter((item) => item !== id));
    setWatchlistIds((prev) => prev.filter((item) => item !== id));
  }

  function handleStartEdit(sat) {
    setEditingId(sat.id);
    setNume(sat.nume);
    setNorad(String(sat.norad));
    setAltitudine(String(sat.altitudine));
    setViteza(String(sat.viteza ?? 7.58));
    setOrbita(sat.orbita);
    setMisiune(sat.misiune);
    setModel(sat.model || "Starlink-V2 Bus");
    setOperator(sat.operator || "");
    setLocLansare(sat.locLansare || "Cape Canaveral SLC-40");
    setAnLansare(String(sat.anLansare || 2024));
    setDecommission(String(sat.decommission || 2031));
    setInclinatie(String(sat.inclinatie ?? 53.0));
    setMeniuActiv("home");
  }

  function reseteazaFormular() {
    setEditingId(null);
    setNume("");
    setNorad("");
    setAltitudine("550");
    setViteza("7.58");
    setOrbita("leo");
    setMisiune("internet");
    setModel("Starlink-V2 Bus");
    setOperator("");
    setLocLansare("Cape Canaveral SLC-40");
    setAnLansare("2025");
    setDecommission("2032");
    setInclinatie("53.0");
  }

  // Adaugarea unui satelit nou sau salvarea modificarilor unui satelit existent
  function handleSubmitFormular(e) {
    e.preventDefault();
    const numeCurat = nume.trim();
    if (!numeCurat) return;

    if (editingId !== null) {
      setSateliti((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                nume: numeCurat,
                orbita,
                norad: Number(norad) || s.norad,
                altitudine: Number(altitudine) || 550,
                viteza: Number(viteza) || calculeazaVitezaKepler(altitudine),
                inclinatie: Number(inclinatie) || 53.0,
                misiune,
                model,
                operator: operator.trim() || "SpaceX / ESA",
                locLansare,
                anLansare: Number(anLansare) || 2025,
                decommission: Number(decommission) || 2032,
                imagine: s.imagine, // Pastreaza poza pe care o avea deja la editare
              }
            : s
        )
      );
      reseteazaFormular();
    } else {
      const nextId = sateliti.reduce((max, s) => Math.max(max, s.id), 0) + 1;
      const nou = {
        id: nextId,
        nume: numeCurat,
        operational: true,
        orbita,
        norad: Number(norad) || 50000 + nextId,
        altitudine: Number(altitudine) || 550,
        viteza: Number(viteza) || calculeazaVitezaKepler(altitudine),
        inclinatie: Number(inclinatie) || 53.0,
        misiune,
        model,
        operator: operator.trim() || "SpaceX / ESA",
        locLansare,
        anLansare: Number(anLansare) || 2025,
        decommission: Number(decommission) || 2032,
        imagine: alegePozaRandom(), // Asigneaza automat o poza random din set
      };

      setSateliti((prev) => [...prev, nou]);
      reseteazaFormular();
    }
  }

  // Gestionarea satelitilor selectati in Comparator (maxim 2)
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

  // Gestionarea satelitilor adaugati in Cumul (Watchlist)
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

  const operationali = sateliti.filter((s) => s.operational).length;

  // Filtrarea si sortarea listei de sateliti
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
        (filtruStare === "operationali" && s.operational) ||
        (filtruStare === "mentenanta" && !s.operational);

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

  // Componenta vizuala pentru Comparatorul de sateliti (afisata atat in Home cat si in Harta/Glob)
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
              <div className="brand-badge-row">
                <button
                  type="button"
                  className={`live-pill ${
                    telemetrieLive ? "is-live" : "is-paused"
                  }`}
                  onClick={() => setTelemetrieLive((v) => !v)}
                >
                  <span className="live-dot" />
                  {telemetrieLive
                    ? "Simulare Live: PORNITĂ"
                    : "Simulare Live: OPRITĂ"}
                </button>
              </div>
              <h1>Barnard's Loop</h1>
              <p>
                Monitorizarea și managementul flotei de sateliți pe orbite
                terestre.
              </p>
            </div>
          </div>

          <div className="header-right">
            <p className="app-count">
              {sateliti.length} sateliți, dintre care {operationali}{" "}
              operaționali
            </p>
            <button
              className="theme-toggle"
              onClick={handleTema}
              aria-pressed={tema === "dark"}
            >
              {tema === "dark" ? "Mod luminos" : "Mod întunecat"}
            </button>
          </div>
        </div>

        <nav className="app-nav">
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
        </nav>
      </header>

      <main className="container">
        {meniuActiv === "home" && (
          <div className="workspace-grid">
            <section className="panel">
              <h2>
                {editingId !== null
                  ? `Editează satelit (#${editingId})`
                  : "Adaugă satelit"}
              </h2>
              <form className="item-form" onSubmit={handleSubmitFormular}>
                <label>
                  Identificator satelit
                  <input
                    type="text"
                    name="titlu"
                    placeholder="Ex: AeroSat-1X"
                    value={nume}
                    onChange={(e) => setNume(e.target.value)}
                    required
                  />
                </label>

                <div className="form-row">
                  <label>
                    ID NORAD
                    <input
                      type="number"
                      name="norad"
                      placeholder="Ex: 54891"
                      min="1"
                      value={norad}
                      onChange={(e) => setNorad(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Altitudine (km)
                    <input
                      type="number"
                      name="altitudine"
                      placeholder="Ex: 550"
                      min="100"
                      value={altitudine}
                      onChange={(e) => handleAltitudineChange(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Viteză Orbitală (km/s)
                    <input
                      type="number"
                      step="0.01"
                      value={viteza}
                      onChange={(e) => setViteza(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Înclinație (&deg;)
                    <input
                      type="number"
                      step="0.1"
                      value={inclinatie}
                      onChange={(e) => setInclinatie(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Regim orbital
                    <select
                      name="eticheta"
                      value={orbita}
                      onChange={(e) => setOrbita(e.target.value)}
                    >
                      <option value="leo">LEO (Low Earth)</option>
                      <option value="meo">MEO (Medium Earth)</option>
                      <option value="geo">GEO (Geostationary)</option>
                      <option value="heo">HEO (Highly Elliptical)</option>
                      <option value="sso">SSO (Sun-Sync)</option>
                    </select>
                  </label>

                  <label>
                    Tip Satelit (Types)
                    <select
                      name="misiune"
                      value={misiune}
                      onChange={(e) => setMisiune(e.target.value)}
                    >
                      <option value="internet">Internet</option>
                      <option value="comunicatii">Communications</option>
                      <option value="positioning">Positioning</option>
                      <option value="observare">Earth Imaging</option>
                      <option value="weather">Weather</option>
                      <option value="stiintific">Science</option>
                      <option value="iot">IoT</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Model satelit
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    >
                      <option value="Starlink-V2 Bus">Starlink-V2 Bus</option>
                      <option value="Galileo-FOC">Galileo-FOC</option>
                      <option value="Eurostar-3000">Eurostar-3000</option>
                      <option value="CubeSat-6U">CubeSat-6U</option>
                    </select>
                  </label>

                  <label>
                    Deținător / Operator
                    <input
                      type="text"
                      placeholder="Ex: SpaceX / ESA"
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Locul lansării
                    <select
                      value={locLansare}
                      onChange={(e) => setLocLansare(e.target.value)}
                    >
                      <option value="Cape Canaveral SLC-40">
                        Cape Canaveral SLC-40
                      </option>
                      <option value="Kennedy LC-39A">Kennedy LC-39A</option>
                      <option value="Kourou ELA-3">Kourou ELA-3</option>
                      <option value="Vandenberg SLC-4E">
                        Vandenberg SLC-4E
                      </option>
                    </select>
                  </label>

                  <label>
                    An dezafectare (EOL)
                    <input
                      type="number"
                      value={decommission}
                      onChange={(e) => setDecommission(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-buttons">
                  <button type="submit">
                    {editingId !== null
                      ? "Salvează modificările"
                      : "Adaugă satelit"}
                  </button>
                  {editingId !== null && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={reseteazaFormular}
                    >
                      Anulează
                    </button>
                  )}
                </div>
              </form>
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

              {/* Filtre pe Orbite, Tipuri (Types), Stare si Cumul (Watchlist) */}
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

              <SatelitList
                sateliti={satelitiFiltrati}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleStartEdit}
                onCompare={handleToggleCompare}
                compareIds={compareIds}
                onToggleWatchlist={handleToggleWatchlist}
                watchlistIds={watchlistIds}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
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

            <OrbitGlobe
              sateliti={satelitiFiltrati}
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
          </section>
        )}
      </main>

      <footer className="app-footer">Proiect Tehnologii Web</footer>
    </>
  );
}