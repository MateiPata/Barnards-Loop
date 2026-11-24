import { useState } from "react";
import { ORBITE } from "../constants.js";
import styles from "./SatelitForm.module.css";

const NUME_MAX = 100;

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

function alegePozaRandom() {
  const index = Math.floor(Math.random() * POZE_SATELITI.length);
  return POZE_SATELITI[index];
}

function calculeazaVitezaKepler(altKm) {
  const mu = 398600.4418;
  const r = 6371.0 + (Number(altKm) || 550);
  return Number(Math.sqrt(mu / r).toFixed(2));
}

export default function SatelitForm({
  onAdd,
  satelitEditat,
  onSaveEdit,
  onCancelEdit,
}) {
  const [nume, setNume] = useState(satelitEditat?.nume || "");
  const [orbita, setOrbita] = useState(satelitEditat?.orbita || "leo");
  const [norad, setNorad] = useState(String(satelitEditat?.norad || 54900));
  const [altitudine, setAltitudine] = useState(
    String(satelitEditat?.altitudine || 550)
  );
  const [viteza, setViteza] = useState(String(satelitEditat?.viteza ?? 7.58));
  const [inclinatie, setInclinatie] = useState(
    String(satelitEditat?.inclinatie ?? 53.0)
  );
  const [misiune, setMisiune] = useState(satelitEditat?.misiune || "internet");
  const [model, setModel] = useState(satelitEditat?.model || "Starlink-V2 Bus");
  const [operator, setOperator] = useState(satelitEditat?.operator || "SpaceX");
  const [locLansare, setLocLansare] = useState(
    satelitEditat?.locLansare || "Cape Canaveral SLC-40"
  );
  const [decommission, setDecommission] = useState(
    String(satelitEditat?.decommission || 2032)
  );

  const [eroare, setEroare] = useState("");
  const [trimite, setTrimite] = useState(false);

  function handleAltitudineChange(val) {
    setAltitudine(val);
    if (Number(val) >= 100) {
      setViteza(String(calculeazaVitezaKepler(val)));
    }
  }

  function valideaza() {
    const n = nume.trim();
    if (n === "") return "Identificatorul satelitului este obligatoriu.";
    if (n.length > NUME_MAX) {
      return `Numele are maximum ${NUME_MAX} de caractere.`;
    }
    const altNum = Number(altitudine);
    if (altitudine === "" || Number.isNaN(altNum) || altNum < 100) {
      return "Altitudinea orbitală trebuie să fie de cel puțin 100 km.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const mesaj = valideaza();
    if (mesaj) {
      setEroare(mesaj);
      return;
    }

    setEroare("");
    setTrimite(true);

    try {
      const payload = {
        nume: nume.trim(),
        mentenanta: satelitEditat ? Boolean(satelitEditat.mentenanta) : false,
        orbita,
        norad: Number(norad) || 54900,
        altitudine: Number(altitudine) || 550,
        viteza: Number(viteza) || calculeazaVitezaKepler(altitudine),
        inclinatie: Number(inclinatie) || 53.0,
        misiune,
        model,
        operator: operator.trim() || "SpaceX / ESA",
        locLansare,
        anLansare: Number(satelitEditat?.anLansare) || 2025,
        decommission: Number(decommission) || 2032,
        imagine: satelitEditat ? satelitEditat.imagine : alegePozaRandom(),
      };

      if (satelitEditat && onSaveEdit) {
        await onSaveEdit(satelitEditat.id, payload);
      } else {
        await onAdd(payload);
      }

      setNume("");
      setOrbita("leo");
      setAltitudine("550");
      setViteza("7.58");
    } catch (err) {
      setEroare(err.message);
    } finally {
      setTrimite(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      data-testid="form"
    >
      <label>
        Identificator satelit
        <input
          type="text"
          name="nume"
          value={nume}
          onChange={(e) => setNume(e.target.value)}
          placeholder="Ex: AeroSat-1X"
          maxLength={NUME_MAX}
          aria-invalid={Boolean(eroare)}
          data-testid="form-title"
        />
      </label>

      <div className={styles.row}>
        <label>
          Regim orbital
          <select
            name="orbita"
            value={orbita}
            onChange={(e) => setOrbita(e.target.value)}
            data-testid="form-orbita"
          >
            {ORBITE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Altitudine (km)
          <input
            type="number"
            name="altitudine"
            value={altitudine}
            onChange={(e) => handleAltitudineChange(e.target.value)}
            placeholder="Ex: 550"
            data-testid="form-altitudine"
          />
        </label>
      </div>

      <div className={styles.row}>
        <label>
          ID NORAD
          <input
            type="number"
            name="norad"
            value={norad}
            onChange={(e) => setNorad(e.target.value)}
            placeholder="Ex: 54891"
          />
        </label>

        <label>
          Viteză Orbitală (km/s)
          <input
            type="number"
            step="0.01"
            value={viteza}
            onChange={(e) => setViteza(e.target.value)}
          />
        </label>
      </div>

      <div className={styles.row}>
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

      <div className={styles.row}>
        <label>
          Model satelit
          <select value={model} onChange={(e) => setModel(e.target.value)}>
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
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            placeholder="Ex: SpaceX / ESA"
          />
        </label>
      </div>

      <div className={styles.row}>
        <label>
          Locul lansării
          <select
            value={locLansare}
            onChange={(e) => setLocLansare(e.target.value)}
          >
            <option value="Cape Canaveral SLC-40">Cape Canaveral SLC-40</option>
            <option value="Kennedy LC-39A">Kennedy LC-39A</option>
            <option value="Kourou ELA-3">Kourou ELA-3</option>
            <option value="Vandenberg SLC-4E">Vandenberg SLC-4E</option>
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

      {eroare && (
        <p className="error" data-testid="form-error">
          {eroare}
        </p>
      )}

      <div className={styles.buttons}>
        <button
          type="submit"
          className="btn"
          disabled={trimite}
          data-testid="form-submit"
        >
          {trimite
            ? "Se salvează..."
            : satelitEditat
            ? "Salvează modificările"
            : "Adaugă"}
        </button>
        {satelitEditat && (
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onCancelEdit}
          >
            Anulează
          </button>
        )}
      </div>
    </form>
  );
}