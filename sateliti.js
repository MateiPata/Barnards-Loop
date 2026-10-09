const sateliti = [
  {
    id: 1,
    nume: "AeroSat-1X",
    operational: true,
    orbita: "leo",
    norad: 54891,
    altitudine: 550,
    misiune: "comunicatii"
  },
  {
    id: 2,
    nume: "Sentinel-Alpha",
    operational: false,
    orbita: "meo",
    norad: 43120,
    altitudine: 20200,
    misiune: "observare"
  },
  {
    id: 3,
    nume: "GeoRelay-01",
    operational: true,
    orbita: "geo",
    norad: 39845,
    altitudine: 35786,
    misiune: "navigatie"
  }
];

const ORBITE = ["leo", "meo", "geo", "heo", "sso"];

function listeazaNume(lista) {
  return lista.map((s) => s.nume);
}

function numaraOperationali(lista) {
  return lista.filter((s) => s.operational).length;
}

function cautaDupaNume(lista, text) {
  const textCurat = text.toLowerCase().trim();
  return lista.filter(
    (s) =>
      s.nume.toLowerCase().includes(textCurat) ||
      s.misiune.toLowerCase().includes(textCurat)
  );
}

function nextId(lista) {
  return lista.reduce((max, s) => Math.max(max, s.id), 0) + 1;
}

function adaugaSatelit(
  lista,
  nume,
  orbita = "leo",
  norad = 0,
  altitudine = 500,
  misiune = "comunicatii"
) {
  const numeCurat = nume ? nume.trim() : "";

  // Validari
  if (!numeCurat) {
    console.warn("Eroare validare: Numele satelitului nu poate fi gol.");
    return lista;
  }


  if (!ORBITE.includes(orbita)) {
    console.warn(
      `Eroare validare: Regim orbital invalid ('${orbita}'). Valori permise: ${ORBITE.join(", ")}.`
    );
    return lista;
  }

  if (Number(altitudine) < 100) {
    console.warn("Eroare validare: Altitudinea orbitala trebuie sa fie de cel puțin 100 km.");
    return lista;
  }

  const nou = {
    id: nextId(lista),
    nume: numeCurat,
    operational: true,
    orbita: orbita,
    norad: Number(norad) || 50000 + nextId(lista),
    altitudine: Number(altitudine),
    misiune: misiune
  };

  return [...lista, nou];
}

function comutaOperational(lista, id) {
  return lista.map((s) =>
    s.id === id ? { ...s, operational: !s.operational } : s
  );
}

function stergeSatelit(lista, id) {
  return lista.filter((s) => s.id !== id);
}

/* ==========================================================
   Teste consola
   ========================================================== */

console.log("--- Citire ---");
console.log("Nume sateliti:", listeazaNume(sateliti).join(", "));
console.log("Operationali:", numaraOperationali(sateliti));
console.log("Cautare 'aero':", listeazaNume(cautaDupaNume(sateliti, "aero")).join(", "));

console.log("--- Adăugare ---");
let listaActualizata = adaugaSatelit(
  sateliti,
  "Starlink-V2-101",
  "leo",
  59001,
  550,
  "comunicatii"
);
console.log("Lista noua:", listaActualizata.length, "sateliti");
console.log("Originalul a ramas cu:", sateliti.length, "sateliti");

console.log("--- Modificare si stergere ---");
listaActualizata = comutaOperational(listaActualizata, 1);
console.log(
  "Dupa comutare stare satelit ID 1 (AeroSat devine mentenanta), operationali:",
  numaraOperationali(listaActualizata)
);
listaActualizata = stergeSatelit(listaActualizata, 3);
console.log(
  "Dupa stergerea satelitului ID 3 (GeoRelay-01):",
  listeazaNume(listaActualizata).join(", ")
);

console.log("--- Validare ---");
// Testari
adaugaSatelit(listaActualizata, " ");
adaugaSatelit(listaActualizata, "CosmoTest-9", "orbita_invalida");
adaugaSatelit(listaActualizata, "SubOrbital-1", "leo", 59999, 50);