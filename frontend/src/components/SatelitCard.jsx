import { useState } from "react";
import { Link } from "react-router-dom";
import { ETICHETE_MISIUNE, ETICHETE_ORBITA } from "../constants.js";
import styles from "./SatelitCard.module.css";

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
    styles.card,
    esteMentenanta ? styles.done : "",
    isSelected ? styles.selected : "",
    isCompared ? styles.compared : "",
  ]
    .filter(Boolean)
    .join(" ");

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
      <div className={styles.topRow}>
        <div className={styles.leftGroup}>
          <div className={styles.main} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={esteMentenanta}
              onChange={() => onToggle(satelit.id)}
              aria-label={`Marchează ${satelit.nume}`}
              data-testid="item-toggle"
            />
            <img
              src={imagineUrl}
              alt={satelit.nume}
              className={styles.thumb}
            />
            <div>
              <div className={styles.titleRow}>
                <Link
                  to={`/sateliti/${satelit.id}`}
                  className={styles.title}
                  data-testid="item-link"
                >
                  {satelit.nume}
                </Link>
                <span className={`badge badge-${satelit.orbita}`}>
                  {ETICHETE_ORBITA[satelit.orbita] ||
                    satelit.orbita.toUpperCase()}
                </span>
                {satelit.model && (
                  <span className={styles.modelTag}>{satelit.model}</span>
                )}
              </div>
              <p className={styles.meta}>
                NORAD #{satelit.norad} &middot; Tip:{" "}
                <strong>
                  {ETICHETE_MISIUNE[satelit.misiune] || satelit.misiune}
                </strong>{" "}
                &middot; Operator:{" "}
                <strong>{satelit.operator || "SpaceX / ESA"}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.btnExpand} ${extins ? styles.open : ""}`}
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

        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <span
            className={`${styles.statusPill} ${
              esteMentenanta ? styles.statusMaint : ""
            }`}
          >
            <span className={styles.statusDot} />
            <span className={styles.status}>
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

      {extins && (
        <div className={styles.telemetrySpecs}>
          <div className={styles.specBox}>
            <span className={styles.specLabel}>Altitudine</span>
            <span className={styles.specValue}>{satelit.altitudine} km</span>
          </div>
          <div className={styles.specBox}>
            <span className={styles.specLabel}>Viteză Orbitală</span>
            <span className={styles.specValue}>
              {satelit.viteza ?? 7.58} km/s
            </span>
          </div>
          <div className={styles.specBox}>
            <span className={styles.specLabel}>Perioadă Orbită</span>
            <span className={styles.specValue}>{perioadaMin} min</span>
          </div>
          <div className={styles.specBox}>
            <span className={styles.specLabel}>Loc Lansare</span>
            <span className={styles.specValue}>
              {satelit.locLansare || "Cape Canaveral"}
            </span>
          </div>
          <div className={styles.specBox}>
            <span className={styles.specLabel}>Ciclu Viață (EOL)</span>
            <span className={styles.specValue}>
              {satelit.anLansare || 2024} &rarr; {satelit.decommission || 2031}{" "}
              ({satelit.inclinatie ?? 53.2}&deg;)
            </span>
          </div>
        </div>
      )}
    </li>
  );
}