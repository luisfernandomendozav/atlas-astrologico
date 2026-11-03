"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NEWS_COL, NEWS_LABEL, type NewsCategory } from "../newsTypes";
import { NewsChart } from "./NewsChart";
import { ConceptSidebar } from "./ConceptSidebar";
import { GlobePicker, GEO_PRESETS, type GeoLoc } from "./GlobePicker";
import { GLOSSARY, CONCEPT_GROUPS } from "./glossary";
import { WORLD_NEWS } from "./worldNews";

const CATEGORIES: NewsCategory[] = ["politics", "economics", "religion", "science", "climate", "society"];

export function NoticiasView() {
  const [focus, setFocus]           = useState<{ date: string } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [catFilter, setCatFilter]   = useState<NewsCategory | null>(null);
  const [conceptId, setConceptId]   = useState<string | null>(null);
  const [location, setLocation]     = useState<GeoLoc>(GEO_PRESETS[0]);
  const chartRef = useRef<HTMLDivElement>(null);

  // Deep-link support: /noticias?c=tension opens that concept
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c && GLOSSARY.some(g => g.id === c)) setConceptId(c);
  }, []);

  const visibleNews = useMemo(
    () => catFilter ? WORLD_NEWS.filter(n => n.category === catFilter) : WORLD_NEWS,
    [catFilter],
  );

  const focusNews = (id: number, date: string) => {
    setSelectedId(id);
    setFocus({ date });
    chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fmtDate = (d: string) =>
    new Date(d + "T12:00:00Z").toLocaleDateString("es-MX", {
      day: "numeric", month: "short", year: "numeric",
    });

  return (
    <>
      <section className="dataSection newsSection" style={{ paddingTop: 52, paddingBottom: 20 }}>
        <div style={{ marginBottom: 28 }}>
          <span className="eyebrow">NOTICIAS GLOBALES · 2019–2026</span>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 400, fontSize: 34, margin: "12px 0 8px",
            letterSpacing: "-0.02em", color: "var(--ink)",
          }}>
            {WORLD_NEWS.length} noticias sobre el cielo
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.75, maxWidth: 680, margin: 0 }}>
            Los eventos mundiales más relevantes de 2019 a 2026 mapeados sobre los eventos
            celestes. Cada punto es una noticia; pasa el cursor para leerla o haz clic en una
            fila de la tabla para centrar la gráfica. Acerca con la rueda del mouse para
            separar los periodos densos.
          </p>
        </div>

        {/* Category filter */}
        <div className="newsFilter">
          <button
            className={"newsFilterBtn" + (catFilter === null ? " sel" : "")}
            onClick={() => setCatFilter(null)}>
            Todas ({WORLD_NEWS.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={"newsFilterBtn" + (catFilter === cat ? " sel" : "")}
              style={{ color: catFilter === cat ? undefined : NEWS_COL[cat] }}
              onClick={() => setCatFilter(f => f === cat ? null : cat)}>
              ● {NEWS_LABEL[cat]} ({WORLD_NEWS.filter(n => n.category === cat).length})
            </button>
          ))}
        </div>

        {/* ── Observer location (globe picker) ── */}
        <div className="globeSection">
          <GlobePicker value={location} onChange={setLocation} />
          <div className="globeInfo">
            <span className="eyebrow">UBICACIÓN DE OBSERVACIÓN</span>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400, fontSize: 26, margin: "10px 0 4px", letterSpacing: "-0.02em",
            }}>
              {location.label}
            </h2>
            <p className="globeCoords">
              {Math.abs(location.lat).toFixed(2)}° {location.lat >= 0 ? "N" : "S"} ·{" "}
              {Math.abs(location.lon).toFixed(2)}° {location.lon < 0 ? "O" : "E"}
            </p>
            <p className="globeNote">
              Arrastra la esfera para rotarla en ambos ejes y haz clic para colocar el pin.
              Los aspectos (tensión, fluidez, conjunciones) y los retrógrados son{" "}
              <strong>geocéntricos</strong>: se calculan desde el centro de la Tierra y son
              idénticos desde cualquier lugar del planeta. Lo que sí cambia con tu ubicación
              es la <strong>visibilidad de los eclipses</strong> — en la gráfica, los rombos
              llenos fueron visibles desde el punto seleccionado y los huecos no.
            </p>
          </div>
        </div>

        {/* ── Combined astro + news timeline (ECharts) ── */}
        <div ref={chartRef} style={{ scrollMarginTop: 70 }}>
          <NewsChart
            news={visibleNews}
            focus={focus}
            selectedId={selectedId}
            onConceptClick={setConceptId}
            location={location}
          />
        </div>
      </section>

      {/* ── Glossary chips ── */}
      <section className="dataSection newsSection" style={{ paddingTop: 32, paddingBottom: 0 }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: 4 }}>
          GLOSARIO · CLIC EN CUALQUIER CONCEPTO
        </span>
        <p style={{ color: "var(--muted)", fontSize: 12.5, margin: "0 0 16px", lineHeight: 1.6 }}>
          También puedes hacer clic directamente en las líneas, bandas retrógradas y eclipses de la gráfica.
        </p>
        {CONCEPT_GROUPS.map(group => (
          <div key={group} className="glossaryGroup">
            <span className="glossaryGroupName">{group}</span>
            <div className="conceptRelatedChips">
              {GLOSSARY.filter(c => c.group === group).map(c => (
                <button key={c.id} className="conceptChip" onClick={() => setConceptId(c.id)}>
                  {c.symbol} {c.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Full news table ── */}
      <section className="dataSection newsSection" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>
          TODAS LAS NOTICIAS · CLIC PARA VER EN LA GRÁFICA
        </span>
        <div className="newsTableWrap">
          <table className="newsTable">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Evento</th>
                <th>Por qué fue importante</th>
              </tr>
            </thead>
            <tbody>
              {visibleNews.map(item => (
                <tr
                  key={item.id}
                  className={selectedId === item.id ? "newsRowSel" : ""}
                  onClick={() => focusNews(item.id, item.date)}
                >
                  <td style={{ color: NEWS_COL[item.category], fontWeight: 700 }}>{item.id}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDate(item.date)}</td>
                  <td>
                    <span className="newsTableCat" style={{ color: NEWS_COL[item.category] }}>
                      {NEWS_LABEL[item.category]}
                    </span>
                  </td>
                  <td className="newsTableEvent">{item.headline}</td>
                  <td className="newsTableWhy">{item.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ConceptSidebar
        conceptId={conceptId}
        onClose={() => setConceptId(null)}
        onNavigate={setConceptId}
      />
    </>
  );
}
