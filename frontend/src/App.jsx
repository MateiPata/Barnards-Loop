import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import SatelitiPage from "./pages/SatelitiPage.jsx";
import SatelitDetaliuPage from "./pages/SatelitDetaliuPage.jsx";
import HartaPage from "./pages/HartaPage.jsx";
import DesprePage from "./pages/DesprePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function temaInitiala() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [tema, setTema] = useState(temaInitiala);
  const [telemetrieLive, setTelemetrieLive] = useState(true);

  function handleTema() {
    const noua = tema === "dark" ? "light" : "dark";
    setTema(noua);
    document.documentElement.dataset.theme = noua;
  }

  return (
    <Routes>
      <Route
        element={
          <Layout
            tema={tema}
            onToggleTema={handleTema}
            telemetrieLive={telemetrieLive}
            onToggleLive={() => setTelemetrieLive((v) => !v)}
          />
        }
      >
        <Route
          path="/"
          element={<SatelitiPage telemetrieLive={telemetrieLive} />}
        />
        <Route path="/sateliti/:id" element={<SatelitDetaliuPage />} />
        <Route
          path="/harta"
          element={<HartaPage tema={tema} telemetrieLive={telemetrieLive} />}
        />
        <Route path="/despre" element={<DesprePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}