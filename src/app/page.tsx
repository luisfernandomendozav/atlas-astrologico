"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AstroWheel } from "./AstroWheel";
import { EnergyAnalysis } from "./EnergyAnalysis";

type Planet = {
  name: string; symbol: string; longitude: number;
  sign: string; degree: number; altitude: number;
  speed: number; retrograde: boolean;
};
type Chart = {
  at: string; lat: number; lon: number;
  planets: Planet[];
  aspects: { first: string; second: string; name: string; kind: string; orb: number }[];
  ascendant: { longitude: number; sign: string };
  midheaven: { longitude: number; sign: string };
  counts: { tension: number; flow: number; concentration: number };
  moon: { phase: number; name: string; illumination: number };
};

const places = [
  { label: "Hermosillo",      lat: 29.0729,  lon: -110.9559 },
  { label: "Ciudad de México", lat: 19.4326, lon:  -99.1332 },
  { label: "Madrid",           lat: 40.4168,  lon:   -3.7038 },
  { label: "Tokio",            lat: 35.6762,  lon:  139.6503 },
];

const localInput = (date: Date) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 19);
};
const fmt = (n: number) => {
  const minutes = Math.round(n * 60);
  return `${Math.floor(minutes / 60)}° ${minutes % 60}′`;
};

export default function Home() {
  const [today, setToday] = useState("");
  const [time,  setTime]  = useState("");
  const [mode,  setMode]  = useState<"live" | "timelapse" | "manual">("live");
  const [place, setPlace] = useState(places[0]);
  const [chart, setChart] = useState<Chart | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const now = new Date();
    setToday(now.toISOString().slice(0, 10));
    setTime(localInput(now));
  }, []);

  useEffect(() => {
    if (mode === "manual") return;
    if (mode === "live") {
      const id = window.setInterval(() => setTime(localInput(new Date())), 1000);
      return () => window.clearInterval(id);
    }
    const id = window.setInterval(() => setTime(prev => {
      const d = new Date(prev);
      d.setHours(d.getHours() + 1);
      return localInput(d);
    }), 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  // Re-fetch only when the minute changes — the seconds tick is display-only
  const fetchKey = time.slice(0, 16);
  useEffect(() => {
    const controller = new AbortController();
    const date = new Date(fetchKey);
    if (!Number.isFinite(date.getTime())) return;
    fetch(
      `/api/chart?at=${encodeURIComponent(date.toISOString())}&lat=${place.lat}&lon=${place.lon}`,
      { signal: controller.signal }
    )
      .then(async r => { const data = await r.json(); if (!r.ok) throw Error(data.error); return data as Chart; })
      .then(data => { setChart(data); setError(""); })
      .catch(e => { if (e.name !== "AbortError") setError(e.message || "Error de conexión"); });
    return () => controller.abort();
  }, [fetchKey, place]);

  const switchPlace = (label: string) => {
    const next = places.find(p => p.label === label);
    if (next) setPlace(next);
  };

  return (
    <main className="clockPage">

      {/* ── Header bar ── */}
      <header className="clockHead">
        <div className="brand">
          <span className="brandMark">✳</span>
          <span>ATLAS <small>ASTROLÓGICO</small></span>
        </div>
        <nav className="headNav">
          <span className="navLink navLinkSel">Carta Astrológica</span>
          <Link href="/noticias" className="navLink">Noticias</Link>
        </nav>
        <div className="headControls">
          <div className="clockBtns">
            <button
              className={"modeBtn" + (mode === "live" ? " sel" : "")}
              onClick={() => { setMode("live"); setTime(localInput(new Date())); }}
              title="Tiempo real">▶</button>
            <button
              className={"modeBtn" + (mode === "timelapse" ? " sel" : "")}
              onClick={() => setMode(m => m === "timelapse" ? "live" : "timelapse")}
              title="+1 hora por segundo">⏩</button>
            <span className="speedTag">
              {mode === "timelapse" ? "× 3600" : mode === "live" ? "× 1" : "Manual"}
            </span>
          </div>
          {mode === "manual" && (
            <input
              aria-label="Fecha y hora local"
              type="datetime-local"
              step={1}
              className="manualInput"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          )}
          <select
            aria-label="Lugar"
            className="citySelect"
            value={place.label}
            onChange={e => switchPlace(e.target.value)}>
            {places.map(p => <option key={p.label}>{p.label}</option>)}
          </select>
          <span className="coordinates">
            {Math.abs(place.lat).toFixed(2)}°&nbsp;{place.lat >= 0 ? "N" : "S"}
            &nbsp;·&nbsp;
            {Math.abs(place.lon).toFixed(2)}°&nbsp;{place.lon < 0 ? "O" : "E"}
          </span>
        </div>
      </header>

      {/* ── Clock face ── */}
      <section className="clockFace">
        {error && <p className="error" role="alert">{error}</p>}
        {!chart && !error && <p className="loading">Calculando el cielo…</p>}
        {chart && (
          <AstroWheel
            planets={chart.planets}
            aspects={chart.aspects}
            ascendant={chart.ascendant}
            midheaven={chart.midheaven}
            time={time}
            moon={chart.moon}
          />
        )}
      </section>

      {/* ── Detail panels ── */}
      {chart && (
        <section className="dataSection">
          <div className="panels">

            <article className="panel global">
              <div className="panelTop">
                <span className="eyebrow">CAPA 01 / GLOBAL</span>
                <span className="tinyStar">✦</span>
              </div>
              <h2>Aspectos</h2>
              <p className="panelDescription">
                Relaciones angulares geocéntricas con orbe ≤ 5°.
              </p>
              <div className="pulseLegend" style={{ margin: "18px 0" }}>
                <div><i className="dot rust" /> {chart.counts.tension} de tensión</div>
                <div><i className="dot sage" /> {chart.counts.flow} de fluidez</div>
                <div><i className="dot gold" /> {chart.counts.concentration} conjunciones</div>
              </div>

              {/* Moon phase */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "0.5px solid var(--line)" }}>
                <span className="eyebrow" style={{ display: "block", marginBottom: 10 }}>FASE LUNAR</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 22, opacity: 0.8 }}>
                    {chart.moon.illumination < 5 ? "🌑" :
                     chart.moon.illumination < 30 ? "🌒" :
                     chart.moon.illumination < 70 ? "🌓" :
                     chart.moon.illumination < 95 ? "🌔" : "🌕"}
                  </span>
                  <div>
                    <strong style={{ display: "block", fontSize: 13 }}>{chart.moon.name}</strong>
                    <small style={{ color: "var(--muted)" }}>{chart.moon.illumination}% iluminada · {chart.moon.phase.toFixed(0)}°</small>
                  </div>
                </div>
              </div>

              <h3 style={{ marginTop: 20 }}>Más cercanos <span>ORBE ≤ 5°</span></h3>
              <div className="aspects">
                {chart.aspects.length
                  ? chart.aspects.slice(0, 5).map((a, i) => (
                      <div className="aspect" key={`${a.first}-${a.second}-${i}`}>
                        <i className={"dot " + (a.kind === "tensión" ? "rust" : a.kind === "fluidez" ? "sage" : "gold")} />
                        <span>{a.first} · {a.second}<small>{a.name}</small></span>
                        <strong>{a.orb.toFixed(1)}°</strong>
                      </div>
                    ))
                  : <p>Sin aspectos mayores dentro de 5°.</p>}
              </div>
            </article>

            <article className="panel local">
              <div className="panelTop">
                <span className="eyebrow">CAPA 02 / LOCAL</span>
                <span className="tinyStar">⌖</span>
              </div>
              <h2>Visto desde {place.label}</h2>
              <p className="panelDescription">
                Horizonte y meridiano de este lugar. La manecilla sólida marca el ASC,
                la punteada el MC.
              </p>
              <div className="angles" style={{ marginTop: 28 }}>
                <div>
                  <span>ASCENDENTE <small>Horizonte este</small></span>
                  <strong>{chart.ascendant.sign} <small>{fmt(chart.ascendant.longitude % 30)}</small></strong>
                </div>
                <div>
                  <span>MEDIO CIELO <small>Meridiano local</small></span>
                  <strong>{chart.midheaven.sign} <small>{fmt(chart.midheaven.longitude % 30)}</small></strong>
                </div>
              </div>
            </article>

          </div>

          <div className="bottom">
            <div>
              <span className="eyebrow">POSICIONES PLANETARIAS</span>
              <h2>Una coordenada para cada cuerpo</h2>
            </div>
            <div className="planetGrid">
              {chart.planets.map(p => (
                <div className="planet" key={p.name}>
                  <span className="symbol" style={{ color: p.retrograde ? "var(--gold)" : undefined }}>
                    {p.symbol}
                  </span>
                  <span>
                    {p.name}
                    {p.retrograde && (
                      <sup style={{ color: "var(--gold)", fontSize: "0.7em", marginLeft: 2 }}>℞</sup>
                    )}
                    <small>{p.sign} · {fmt(p.degree)}</small>
                  </span>
                  <span className="altitude" title="Altura sobre el horizonte local">
                    {p.altitude >= 0 ? "↑" : "↓"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Energy analysis: past / present / future ── */}
      {today && (
        <section className="dataSection" style={{ paddingTop: 0 }}>
          <EnergyAnalysis today={today} />
        </section>
      )}

      <footer>
        Las posiciones se calculan con Astronomy Engine. Los aspectos y colores son
        convenciones astrológicas interpretativas,{" "}
        <strong>no mediciones físicas de energía ni predicciones.</strong>{" "}
        ASC y MC son aproximados; esta prueba no calcula casas ni líneas de astrocartografía.
      </footer>

    </main>
  );
}
