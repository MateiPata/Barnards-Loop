import { useEffect, useState } from "react";
import styles from "./Comparator.module.css";

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

export default function Comparator({
  satelitiComparati,
  onClear,
  telemetrieLive,
}) {
  const [secundeSimulare, setSecundeSimulare] = useState(0);

  useEffect(() => {
    if (!telemetrieLive || satelitiComparati.length < 2) return;
    const interval = setInterval(() => {
      setSecundeSimulare((s) => s + 1.5);
    }, 1500);
    return () => clearInterval(interval);
  }, [telemetrieLive, satelitiComparati.length]);

  if (satelitiComparati.length === 0) return null;

  const distanta3DKm =
    satelitiComparati.length === 2
      ? calculeazaDistanta3DKm(
          satelitiComparati[0],
          satelitiComparati[1],
          secundeSimulare
        )
      : 0;

  return (
    <div className={styles.drawer}>
      <div className={styles.header}>
        <h3>Comparator Sateliți ({satelitiComparati.length}/2 selectați)</h3>
        <button type="button" className="btn-action" onClick={onClear}>
          Închide comparatorul
        </button>
      </div>

      {satelitiComparati.length === 1 ? (
        <p className={styles.hint}>
          Ai selectat <strong>{satelitiComparati[0].nume}</strong>. Selectează
          încă un satelit cu butonul <strong>„Compară”</strong> pentru a calcula
          distanța 3D și diferențele orbitale.
        </p>
      ) : (
        <div className={styles.grid}>
          {satelitiComparati.map((s) => (
            <div key={s.id} className={styles.col}>
              <div className={styles.titleRow}>
                <h4>{s.nume}</h4>
                <span className={`badge badge-${s.orbita}`}>
                  {s.orbita.toUpperCase()}
                </span>
              </div>
              <ul className={styles.specs}>
                <li>
                  <span>Altitudine:</span> <strong>{s.altitudine} km</strong>
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
                  <span>Înclinație:</span> <strong>{s.inclinatie}&deg;</strong>
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

          <div className={styles.delta}>
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
}