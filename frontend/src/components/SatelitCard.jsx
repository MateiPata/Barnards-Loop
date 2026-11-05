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
  const imagineUrl =
    satelit.imagine ||
    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=120&auto=format&fit=crop&q=80";

  const cardClass = [
    satelit.operational ? "item-card" : "item-card done",
    isSelected ? "selected-card" : "",
    isCompared ? "compared-card" : "",
  ]
    .join(" ")
    .trim();

  // Calculul perioadei unei orbite complete in minute
  const razaKm = 6371 + (Number(satelit.altitudine) || 550);
  const perioadaMin = (
    (2 * Math.PI * razaKm) /
    ((Number(satelit.viteza) || 7.58) * 60)
  ).toFixed(1);

  return (
    <li className={cardClass} onClick={() => onSelect && onSelect(satelit.id)}>
      <div className="card-top-row">
        <label className="card-main" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!satelit.operational}
            onChange={() => onToggle(satelit.id)}
          />
          <img
            src={imagineUrl}
            alt={satelit.nume}
            className="satellite-thumb"
          />
          <div className="satellite-details">
            <div className="satellite-title-row">
              <h3>{satelit.nume}</h3>
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

        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <span
            className={`status-pill ${
              satelit.operational ? "status-online" : "status-maint"
            }`}
          >
            <span className="status-dot" />
            <span className="status">
              {satelit.operational ? "Operațional" : "Mentenanță"}
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
          >
            Șterge
          </button>
        </div>
      </div>

      {/* Grila cu parametrii orbitali ai satelitului */}
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
    </li>
  );
}