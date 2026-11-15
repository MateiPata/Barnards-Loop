import { useState } from "react";

const ETICHETE_ORBITA = {
  leo: "LEO",
  meo: "MEO",
  geo: "GEO",
  heo: "HEO",
  sso: "SSO",
};

const ETICHETE_MISIUNE = {
  internet: "Internet",
  comunicatii: "Communications",
  positioning: "Positioning",
  observare: "Earth Imaging",
  weather: "Weather",
  stiintific: "Science",
  iot: "IoT",
  custom: "Custom",
};

export default function SatelitCard({
  satelit,
  onToggle,
  onDelete,
  onEdit,
  onCompare,
  isCompared,
  onToggleWatchlist,
  isInWatchlist,
  isSelected,
  onSelect,
}) {
  const [extins, setExtins] = useState(false);

  const imagineUrl =
    satelit.imagine ||
    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=120&auto=format&fit=crop&q=80";

  const esteMentenanta = Boolean(satelit.mentenanta);

  const cardClass = [
    esteMentenanta ? "item-card done" : "item-card",
    isSelected ? "selected-card" : "",
    isCompared ? "compared-card" : "",
  ]
    .join(" ")
    .trim();

  const razaKm = 6371 + (Number(satelit.altitudine) || 550);
  const perioadaMin = (
    (2 * Math.PI * razaKm) /
    ((Number(satelit.viteza) || 7.58) * 60)
  ).toFixed(1);

  return (
    <li
      className={cardClass}
      data-testid="item"
      data-id={satelit.id}
      onClick={() => onSelect && onSelect(satelit.id)}
    >
      <div className="card-top-row">
        <div className="card-left-group">
          <label className="card-main" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={esteMentenanta}
              onChange={() => onToggle(satelit.id)}
              data-testid="item-toggle"
            />
            <img
              src={imagineUrl}
              alt={satelit.nume}
              className="satellite-thumb"
            />
            <div className="satellite-details">
              <div className="satellite-title-row">
                <h3 data-testid="item-title">{satelit.nume}</h3>
                <span className={`badge badge-${satelit.orbita}`}>
                  {ETICHETE_ORBITA[satelit.orbita] ||
                    satelit.orbita.toUpperCase()}
                </span>
                {satelit.model && (
                  <span className="model-tag">{satelit.model}</span>
                )}
              </div>
              <p className="satellite-meta">
                NORAD #{satelit.norad} &middot; Tip:{" "}
                <strong>
                  {ETICHETE_MISIUNE[satelit.misiune] || satelit.misiune}
                </strong>{" "}
                &middot; Operator:{" "}
                <strong>{satelit.operator || "SpaceX / ESA"}</strong>
              </p>
            </div>
          </label>

          {/* Butonul sageata pentru afisarea/ascunderea telemetriei */}
          <button
            type="button"
            className={`btn-expand ${extins ? "open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setExtins((v) => !v);
            }}
            aria-label="Afișează detalii telemetrie"
            title={extins ? "Ascunde telemetria" : "Afișează telemetria"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <span
            className={`status-pill ${
              !esteMentenanta ? "status-online" : "status-maint"
            }`}
          >
            <span className="status-dot" />
            <span className="status">
              {!esteMentenanta ? "Operațional" : "Mentenanță"}
            </span>
          </span>

          <button
            type="button"
            className={`btn-action ${isInWatchlist ? "active" : ""}`}
            onClick={() => onToggleWatchlist(satelit.id)}
          >
            {isInWatchlist ? "În Watchlist" : "+ Watchlist"}
          </button>

          <button
            type="button"
            className={`btn-action ${isCompared ? "active" : ""}`}
            onClick={() => onCompare(satelit.id)}
          >
            {isCompared ? "În comparator" : "Compară"}
          </button>

          <button
            type="button"
            className="btn-action"
            onClick={() => onEdit(satelit)}
          >
            Editează
          </button>

          <button
            type="button"
            className="btn-danger"
            onClick={() => onDelete(satelit.id)}
            aria-label={`Șterge ${satelit.nume}`}
            data-testid="item-delete"
          >
            Șterge
          </button>
        </div>
      </div>

      {/* Sectiunea colapsabila cu parametrii si telemetria satelitului */}
      {extins && (
        <div className="telemetry-specs">
          <div className="spec-box">
            <span className="spec-label">Altitudine</span>
            <span className="spec-value">{satelit.altitudine} km</span>
          </div>
          <div className="spec-box">
            <span className="spec-label">Viteză Orbitală</span>
            <span className="spec-value">{satelit.viteza ?? 7.58} km/s</span>
          </div>
          <div className="spec-box">
            <span className="spec-label">Perioadă Orbită</span>
            <span className="spec-value">{perioadaMin} min</span>
          </div>
          <div className="spec-box">
            <span className="spec-label">Loc Lansare</span>
            <span className="spec-value">
              {satelit.locLansare || "Cape Canaveral"}
            </span>
          </div>
          <div className="spec-box">
            <span className="spec-label">Ciclu Viață (EOL)</span>
            <span className="spec-value">
              {satelit.anLansare || 2024} &rarr;{" "}
              {satelit.decommission || 2031} ({satelit.inclinatie ?? 53.2}&deg;)
            </span>
          </div>
        </div>
      )}
    </li>
  );
}