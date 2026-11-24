import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

const STELE_FUNDAL = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 7) % 98}%`,
  top: `${(i * 37 + 11) % 96}%`,
  isPink: i % 3 === 0,
  size: i % 5 === 0 ? 3 : 2,
  delay: `${(i * 0.7) % 8}s`,
  duration: `${4 + (i % 5)}s`,
}));

function navClass({ isActive }) {
  return isActive ? `${styles.navTab} ${styles.active}` : styles.navTab;
}

export default function Layout({
  tema,
  onToggleTema,
  telemetrieLive,
  onToggleLive,
}) {
  return (
    <>
      <div className={styles.starfield} aria-hidden="true">
        {STELE_FUNDAL.map((st) => (
          <span
            key={st.id}
            className={`${styles.starDot} ${
              st.isPink ? styles.starPink : styles.starWhite
            }`}
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

      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <div className={styles.headerLogo}>
              <img
                src={
                  tema === "dark"
                    ? "/BL_white-removebg-preview.png"
                    : "/BL_black-removebg-preview.png"
                }
                alt="Barnard's Loop Logo"
              />
            </div>

            <div className={styles.headerBrand}>
              <h1>Barnard&apos;s Loop</h1>
              <p>
                Monitorizarea și managementul flotei de sateliți pe orbite
                terestre.
              </p>
            </div>
          </div>
        </div>

        <nav className={styles.appNav} data-testid="nav">
          <div className={styles.navLeft}>
            <button
              type="button"
              className={`${styles.livePill} ${
                !telemetrieLive ? styles.isPaused : ""
              }`}
              onClick={onToggleLive}
              title="Pornește / Oprește simularea în timp real"
            >
              <span className={styles.liveDot} />
              {telemetrieLive ? "Live" : "Pauză"}
            </button>

            <NavLink to="/" end className={navClass}>
              Panou Sateliți (Home)
            </NavLink>
            <NavLink to="/harta" className={navClass}>
              Hartă 2D &amp; Glob 3D
            </NavLink>
            <NavLink to="/despre" className={navClass}>
              Despre
            </NavLink>
          </div>

          <div className={styles.navRight}>
            <button
              className={styles.themeToggle}
              onClick={onToggleTema}
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

      <main className={styles.container}>
        <Outlet />
      </main>

      <footer className={styles.footer}>Proiect Tehnologii Web</footer>
    </>
  );
}