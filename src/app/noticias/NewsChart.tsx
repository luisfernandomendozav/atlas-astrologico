"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { LineChart, ScatterChart } from "echarts/charts";
import {
  GridComponent, TooltipComponent, DataZoomComponent,
  LegendComponent, MarkLineComponent, MarkAreaComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { NewsMarker, NewsCategory } from "../newsTypes";
import { NEWS_LABEL } from "../newsTypes";

echarts.use([
  LineChart, ScatterChart, GridComponent, TooltipComponent,
  DataZoomComponent, LegendComponent, MarkLineComponent, MarkAreaComponent,
  CanvasRenderer,
]);

// ECharts renders to canvas: CSS variables don't resolve, so use hex directly
const HEX: Record<string, string> = {
  politics:  "#bb795c",
  economics: "#c3a267",
  religion:  "#758d7c",
  science:   "#7b8ba1",
  climate:   "#9a7b8d",
  society:   "#8c8c84",
};
const INK = "#292c27", MUTED = "#777970", LINE = "#dcd9d0";
const CAT_ORDER: NewsCategory[] = ["politics", "economics", "religion", "science", "climate", "society"];
const TODAY = "2026-10-13";

type Pt = {
  date: string;
  tension: number; flow: number; concentration: number;
  intensity: number; lunarPhase: number;
  retrogrades: string[];
};
type Eclipse = { date: string; type: "solar" | "lunar"; kind: string };
type TimelineData = { points: Pt[]; eclipses: Eclipse[] };

function smooth(vals: number[], w: number): number[] {
  return vals.map((_, i) => {
    const s = Math.max(0, i - w), e = Math.min(vals.length, i + w + 1);
    const sl = vals.slice(s, e);
    return sl.reduce((a, v) => a + v, 0) / sl.length;
  });
}

const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SERIES_TO_CONCEPT: Record<string, string> = {
  "Tensión": "tension",
  "Fluidez": "fluidez",
  "Conjunciones": "conjunciones",
  "Mercurio ℞": "rx-mercurio",
  "Venus ℞": "rx-venus",
  "Marte ℞": "rx-marte",
  "Júpiter ℞": "rx-jupiter",
  "Saturno ℞": "rx-saturno",
};

type EclipseVis = { date: string; visible: boolean; obscuration?: number | null };

export function NewsChart({
  news, focus, selectedId, onConceptClick, location,
}: {
  news: NewsMarker[];
  focus?: { date: string } | null;
  selectedId?: number | null;
  onConceptClick?: (conceptId: string) => void;
  location?: { lat: number; lon: number; label: string } | null;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const chartRef  = useRef<echarts.ECharts | null>(null);
  const legendSelRef = useRef<Record<string, boolean> | null>(null);
  const conceptCbRef = useRef(onConceptClick);
  conceptCbRef.current = onConceptClick;
  const [data,  setData]  = useState<TimelineData | null>(null);
  const [visMap, setVisMap] = useState<EclipseVis[] | null>(null);
  const [error, setError] = useState("");

  // Eclipse visibility for the selected observer location
  useEffect(() => {
    if (!location) { setVisMap(null); return; }
    let alive = true;
    fetch(`/api/eclipses?lat=${location.lat}&lon=${location.lon}`)
      .then(r => r.json())
      .then(d => { if (alive && d.solar) setVisMap([...d.solar, ...d.lunar]); })
      .catch(() => {});
    return () => { alive = false; };
  }, [location]);

  // Fetch astro timeline once
  useEffect(() => {
    fetch("/api/timeline?v=5")
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d as TimelineData; })
      .then(setData)
      .catch(() => setError("No se pudo cargar la línea de tiempo."));
  }, []);

  // Init chart + resize handling
  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const chart = echarts.init(el);
    chartRef.current = chart;
    chart.on("legendselectchanged", (e) => {
      legendSelRef.current = (e as { selected: Record<string, boolean> }).selected;
    });
    // Clicking a line, retro band, or eclipse diamond opens its glossary entry
    chart.on("click", (params) => {
      const p = params as {
        componentType: string; seriesName?: string;
        data?: { news?: unknown; eclipse?: { type: string } };
      };
      if (p.data && typeof p.data === "object" && "news" in p.data) return; // news dots keep their tooltip
      if (p.data?.eclipse) {
        conceptCbRef.current?.(p.data.eclipse.type === "solar" ? "eclipse-solar" : "eclipse-lunar");
        return;
      }
      const concept = p.seriesName ? SERIES_TO_CONCEPT[p.seriesName] : undefined;
      if (concept) conceptCbRef.current?.(concept);
    });
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => { ro.disconnect(); chart.dispose(); chartRef.current = null; };
  }, []);

  // Build / rebuild option
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data) return;

    // Preserve current zoom window across notMerge rebuilds (filters, selection)
    let zoom: { start?: number; end?: number } = {};
    try {
      const prev = chart.getOption() as { dataZoom?: { start?: number; end?: number }[] } | null;
      if (prev?.dataZoom?.[0]) zoom = { start: prev.dataZoom[0].start, end: prev.dataZoom[0].end };
    } catch { /* first render: no option yet */ }

    const { points, eclipses } = data;
    const dates = points.map(p => p.date);
    const tS = smooth(points.map(p => p.tension), 5);
    const fS = smooth(points.map(p => p.flow), 5);
    const cS = smooth(points.map(p => p.concentration), 5);
    const maxVal = Math.max(...tS, ...fS, ...cS);
    const yMax = Math.ceil(maxVal * 1.65);

    // News: one row per category above the curves
    const rowY = (cat: NewsCategory) =>
      maxVal * (1.14 + CAT_ORDER.indexOf(cat) * 0.082);

    const newsSeries = CAT_ORDER.map(cat => ({
      name: NEWS_LABEL[cat],
      type: "scatter" as const,
      data: news.filter(n => n.category === cat).map(n => ({
        value: [n.date, rowY(cat)],
        news: n,
      })),
      symbolSize: (_: unknown, p: { data: { news: NewsMarker } }) =>
        p.data.news.id === selectedId ? 14 : 7,
      itemStyle: {
        color: HEX[cat],
        borderColor: "#f4f0e8",
        borderWidth: 1,
        opacity: 0.92,
      },
      emphasis: { scale: 1.8 },
      z: 10,
    }));

    // Retrograde bands: consecutive runs where the planet appears in pt.retrogrades
    const rxRuns = (planet: string): [string, string][] => {
      const runs: [string, string][] = [];
      let start: string | null = null;
      points.forEach(pt => {
        const isRx = pt.retrogrades.includes(planet);
        if (isRx && start === null) start = pt.date;
        if (!isRx && start !== null) { runs.push([start, pt.date]); start = null; }
      });
      if (start !== null) runs.push([start, points[points.length - 1].date]);
      return runs;
    };

    const RX_PLANETS: [string, string, string][] = [
      ["Mercurio ℞", "Mercurio", "#c3a267"],
      ["Venus ℞",    "Venus",    "#758d7c"],
      ["Marte ℞",    "Marte",    "#bb795c"],
      ["Júpiter ℞",  "Júpiter",  "#7b8ba1"],
      ["Saturno ℞",  "Saturno",  "#8c8c84"],
    ];

    const rxSeries = RX_PLANETS.map(([name, planet, color]) => ({
      name,
      type: "line" as const,
      data: [] as number[][],
      itemStyle: { color },
      lineStyle: { color, opacity: 0 },
      markArea: {
        // clickable: opens the planet's retrograde glossary entry
        silent: false,
        itemStyle: { color, opacity: 0.1 },
        emphasis: { itemStyle: { opacity: 0.22 } },
        data: rxRuns(planet).map(([s, e]) => [{ xAxis: s }, { xAxis: e }]),
      },
      z: 1,
    }));

    // Match each eclipse to its local-visibility entry (±2 days tolerance)
    const eclipseVis = (date: string): EclipseVis | undefined => {
      if (!visMap) return undefined;
      const ms = new Date(date).getTime();
      return visMap.find(v => Math.abs(new Date(v.date).getTime() - ms) <= 2 * 86_400_000);
    };

    const eclipseSeries = {
      name: "Eclipses",
      type: "scatter" as const,
      data: eclipses.map(ec => {
        const vis = eclipseVis(ec.date);
        const col = ec.type === "solar" ? "#c3a267" : "#758d7c";
        return {
          value: [ec.date, maxVal * 1.06],
          eclipse: ec,
          vis,
          symbolSize: vis?.visible ? 10 : 6,
          itemStyle: vis?.visible === false
            ? { color: "transparent", borderColor: col, borderWidth: 1, opacity: 0.45 }
            : { color: col, opacity: 0.85 },
        };
      }),
      symbol: "diamond",
      z: 9,
    };

    const lineSeries = (
      [["Tensión", tS, "#bb795c"], ["Fluidez", fS, "#758d7c"], ["Conjunciones", cS, "#c3a267"]] as const
    ).map(([name, vals, color], i) => ({
      name,
      type: "line" as const,
      data: vals.map((v, j) => [dates[j], +v.toFixed(2)]),
      showSymbol: false,
      triggerLineEvent: true,
      sampling: "lttb" as const,
      lineStyle: { color, width: 1.6 },
      itemStyle: { color },
      areaStyle: { color, opacity: 0.06 },
      z: 3,
      ...(i === 0 ? {
        markLine: {
          silent: true,
          symbol: "none",
          data: [{ xAxis: TODAY }],
          lineStyle: { color: INK, width: 1.2, opacity: 0.5, type: "solid" as const },
          label: { formatter: "HOY", color: INK, fontSize: 10, fontFamily: "DM Sans" },
        },
      } : {}),
    }));

    chart.setOption({
      animation: false,
      textStyle: { fontFamily: "'DM Sans', sans-serif" },
      legend: {
        top: 0,
        left: 0,
        data: [
          "Tensión", "Fluidez", "Conjunciones", "Eclipses",
          "Mercurio ℞", "Venus ℞", "Marte ℞", "Júpiter ℞", "Saturno ℞",
        ],
        selected: legendSelRef.current ?? { "Júpiter ℞": false, "Saturno ℞": false },
        textStyle: { color: MUTED, fontSize: 11 },
        itemWidth: 14, itemHeight: 8,
      },
      grid: { left: 42, right: 18, top: 34, bottom: 74 },
      xAxis: {
        type: "time",
        min: "2019-01-01", max: "2034-12-31",
        axisLine: { lineStyle: { color: LINE } },
        axisLabel: { color: MUTED, fontSize: 11 },
        splitLine: { show: false },
        axisPointer: {
          show: true, snap: false,
          lineStyle: { color: INK, opacity: 0.3, type: "dashed" },
          label: {
            backgroundColor: INK,
            formatter: ({ value }: { value: number }) =>
              new Date(value).toISOString().slice(0, 10),
          },
        },
      },
      yAxis: {
        type: "value",
        max: yMax,
        splitNumber: 4,
        axisLabel: {
          color: MUTED, fontSize: 10,
          formatter: (v: number) => (v > maxVal * 1.05 ? "" : String(v)),
        },
        splitLine: { lineStyle: { color: LINE, type: "dashed", opacity: 0.6 } },
        axisPointer: { show: true, label: { show: false }, lineStyle: { color: INK, opacity: 0.15 } },
      },
      tooltip: {
        trigger: "item",
        backgroundColor: "#fbfaf6",
        borderColor: LINE,
        textStyle: { color: INK, fontSize: 12 },
        extraCssText: "max-width:360px;white-space:normal;box-shadow:0 2px 12px rgba(0,0,0,.08)",
        formatter: (p: {
          seriesName?: string; seriesType?: string; marker?: string;
          value?: [string | number, number] | number;
          data?: { news?: NewsMarker; eclipse?: Eclipse; value?: [string | number, number]; xAxis?: string };
        }) => {
          // markLine/axis items arrive without a value tuple — skip them
          const raw = Array.isArray(p.value) ? p.value[0]
            : Array.isArray(p.data?.value) ? p.data.value[0]
            : p.data?.xAxis;
          if (raw == null) return "";
          const d = new Date(raw).toLocaleDateString("es-MX", {
            day: "numeric", month: "long", year: "numeric",
          });
          if (p.data?.news) {
            const nm = p.data.news;
            return `<b>${d}</b><br/>
              <span style="color:${HEX[nm.category]};font-weight:700">● ${NEWS_LABEL[nm.category]} · #${nm.id}</span><br/>
              <b>${esc(nm.headline)}</b><br/>
              <span style="color:${MUTED};font-size:11px">${esc(nm.summary)}</span>`;
          }
          if (p.data?.eclipse) {
            const ec = p.data.eclipse;
            const vis = (p.data as { vis?: EclipseVis }).vis;
            const visLine = vis == null ? ""
              : vis.visible
                ? `<br/><span style="color:#758d7c">✓ Visible desde ${esc(location?.label ?? "la ubicación")}${vis.obscuration != null ? ` · ${Math.round(vis.obscuration * 100)}% oscurecido` : ""}</span>`
                : `<br/><span style="color:${MUTED}">✗ No visible desde ${esc(location?.label ?? "la ubicación")}</span>`;
            return `<b>${d}</b><br/>Eclipse ${ec.type === "solar" ? "Solar" : "Lunar"} · ${ec.kind}${visLine}`;
          }
          const y = Array.isArray(p.value) ? p.value[1] : undefined;
          return y == null
            ? `<b>${d}</b>`
            : `<b>${d}</b><br/>${p.marker ?? ""} ${p.seriesName ?? ""}: ${Number(y).toFixed(1)}`;
        },
      },
      dataZoom: [
        { type: "inside", xAxisIndex: 0, throttle: 40, ...zoom },
        {
          type: "slider", xAxisIndex: 0, bottom: 10, height: 26, ...zoom,
          borderColor: LINE,
          backgroundColor: "rgba(0,0,0,0.02)",
          fillerColor: "rgba(117,141,124,0.14)",
          dataBackground: { lineStyle: { color: MUTED, opacity: 0.4 }, areaStyle: { color: MUTED, opacity: 0.1 } },
          selectedDataBackground: { lineStyle: { color: "#758d7c" }, areaStyle: { color: "#758d7c", opacity: 0.15 } },
          handleStyle: { color: "#fbfaf6", borderColor: MUTED },
          moveHandleStyle: { color: LINE },
          textStyle: { color: MUTED, fontSize: 10 },
          labelFormatter: (v: number) => new Date(v).toISOString().slice(0, 7),
        },
      ],
      series: [...rxSeries, ...lineSeries, eclipseSeries, ...newsSeries],
    }, { notMerge: true });
  }, [data, news, selectedId, visMap, location]);

  // Zoom to a focused date (table row click)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !focus || !data) return;
    const ms = new Date(focus.date + "T12:00:00Z").getTime();
    const span = 60 * 86_400_000;
    chart.dispatchAction({
      type: "dataZoom",
      startValue: ms - span,
      endValue: ms + span,
    });
  }, [focus, data]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="timelineWrap" style={{ position: "relative" }}>
      <div className="timelineHeader">
        <span className="eyebrow">
          EVENTOS CELESTES Y NOTICIAS · 2019–2034
          <span style={{ opacity: 0.45, marginLeft: 10, fontWeight: 400 }}>
            · rueda del mouse o barra inferior para zoom · cursor sobre un punto para leer la noticia
            · clic en una línea, banda o eclipse para ver qué significa
          </span>
        </span>
      </div>
      <div ref={holderRef} style={{ width: "100%", height: 520 }} />
      {!data && !error && (
        <p className="loading" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          Calculando 2019–2030…
        </p>
      )}
    </div>
  );
}
