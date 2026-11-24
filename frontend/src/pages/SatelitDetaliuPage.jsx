import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSatelit } from "../api.js";
import { ETICHETE_MISIUNE, ETICHETE_ORBITA } from "../constants.js";
import styles from "./SatelitDetaliuPage.module.css";

export default function SatelitDetaliuPage() {
  const { id } = useParams();
  const [satelit, setSatelit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetchSatelit(id)
      .then((data) => {
        if (!ignore) {
          setSatelit(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <p className="info" data-testid="loading">
        Se încarcă datele satelitului...
      </p>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <p className="error" data-testid="error">
          Satelitul nu a putut fi încărcat: {error}
        </p>
        <Link to="/">Înapoi la listă</Link>
      </section>
    );
  }

  const razaKm = 6371 + (Number(satelit.altitudine) || 550);
  const perioadaMin = (
    (2 * Math.PI * razaKm) /
    ((Number(satelit.viteza) || 7.58) * 60)
  ).toFixed(1);

  return (
    <section className={`panel ${styles.detail}`} data-testid="detail">
      <Link to="/" className={styles.back}>
        &larr; Înapoi la listă
      </Link>

      <div className={styles.header}>
        {satelit.imagine && (
          <img
            src={satelit.imagine}
            alt={satelit.nume}
            className={styles.thumb}
          />
        )}
        <div>
          <h2
            className={satelit.mentenanta ? styles.done : undefined}
            data-testid="detail-title"
          >
            {satelit.nume}
          </h2>
          <span className={`badge badge-${satelit.orbita}`}>
            {ETICHETE_ORBITA[satelit.orbita] || satelit.orbita.toUpperCase()}
          </span>
        </div>
      </div>

      <dl className={styles.fields}>
        <dt>ID</dt>
        <dd>{satelit.id}</dd>

        <dt>Status</dt>
        <dd>{satelit.mentenanta ? "Mentenanță" : "Operațional"}</dd>

        <dt>ID NORAD</dt>
        <dd>#{satelit.norad}</dd>

        <dt>Misiune</dt>
        <dd>{ETICHETE_MISIUNE[satelit.misiune] || satelit.misiune}</dd>

        <dt>Model</dt>
        <dd>{satelit.model || "—"}</dd>

        <dt>Operator</dt>
        <dd>{satelit.operator || "—"}</dd>

        <dt>Altitudine</dt>
        <dd>{satelit.altitudine} km</dd>

        <dt>Viteză orbitală</dt>
        <dd>{satelit.viteza ?? 7.58} km/s</dd>

        <dt>Perioadă orbitală</dt>
        <dd>{perioadaMin} min</dd>

        <dt>Înclinație</dt>
        <dd>{satelit.inclinatie ?? 53.0}&deg;</dd>

        <dt>Loc lansare</dt>
        <dd>{satelit.locLansare || "—"}</dd>

        <dt>Ciclu viață (EOL)</dt>
        <dd>
          {satelit.anLansare || "—"} &rarr; {satelit.decommission || "—"}
        </dd>
      </dl>
    </section>
  );
}