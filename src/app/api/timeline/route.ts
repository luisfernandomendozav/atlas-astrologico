import { NextResponse } from "next/server";
import * as Astronomy from "astronomy-engine";

const bodies = [
  Astronomy.Body.Sun, Astronomy.Body.Moon,
  Astronomy.Body.Mercury, Astronomy.Body.Venus, Astronomy.Body.Mars,
  Astronomy.Body.Jupiter, Astronomy.Body.Saturn,
  Astronomy.Body.Uranus, Astronomy.Body.Neptune, Astronomy.Body.Pluto,
];
const bodyNames = ["Sol","Luna","Mercurio","Venus","Marte","Júpiter","Saturno","Urano","Neptuno","Plutón"];

// Ingresses only for slow planets (skip Moon/Mercury/Venus/Sun/Mars — change sign too fast)
const ingressBodies    = [6, 7, 8, 9]; // Saturno, Urano, Neptuno, Plutón
const ingressSymbols   = ["♄","♅","♆","♇"];
const ingressNames     = ["Saturno","Urano","Neptuno","Plutón"];

const signSymbols = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const signNames   = ["Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario","Capricornio","Acuario","Piscis"];

const aspectAngles = [
  { angle: 0,   kind: "concentration" },
  { angle: 60,  kind: "flow" },
  { angle: 90,  kind: "tension" },
  { angle: 120, kind: "flow" },
  { angle: 180, kind: "tension" },
];
const separation = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

// Curated outer-planet events (conjunctions + major squares), computed with astronomy-engine
type Landmark = { date: string; sym: string; kind: "conjunction" | "square" | "ingress"; label: string };
const LANDMARKS: Landmark[] = [
  { date: "2020-01-12", sym: "♄☌♇", kind: "conjunction", label: "Saturno–Plutón" },
  { date: "2020-12-21", sym: "♃☌♄", kind: "conjunction", label: "Gran Conjunción" },
  { date: "2021-02-18", sym: "♄□♅", kind: "square",      label: "Sat□Ura ×1" },
  { date: "2021-06-15", sym: "♄□♅", kind: "square",      label: "Sat□Ura ×2" },
  { date: "2021-12-24", sym: "♄□♅", kind: "square",      label: "Sat□Ura ×3" },
  { date: "2022-04-12", sym: "♃☌♆", kind: "conjunction", label: "Júpiter–Neptuno" },
  { date: "2024-04-21", sym: "♃☌♅", kind: "conjunction", label: "Júpiter–Urano" },
  { date: "2026-02-20", sym: "♄☌♆", kind: "conjunction", label: "Saturno–Neptuno" },
];

const RANGE_START = new Date("2019-01-01T12:00:00Z");
const RANGE_END   = new Date("2034-12-31T12:00:00Z");
const STEP = 3;

export function GET() {
  try {

  const points: {
    date: string;
    tension: number; flow: number; concentration: number;
    intensity: number; lunarPhase: number;
    retrogrades: string[];
  }[] = [];

  const prevLons   = bodies.map(() => -1);
  const prevSigns  = new Array(bodies.length).fill(-1);
  const ingresses: { date: string; planet: string; symbol: string; sign: string; signSym: string }[] = [];

  const totalDays = Math.ceil((RANGE_END.getTime() - RANGE_START.getTime()) / 86_400_000);
  for (let d = 0; d < totalDays; d += STEP) {
    const date = new Date(RANGE_START.getTime() + d * 86_400_000);

    const lons = bodies.map(body =>
      Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon
    );

    let tension = 0, flow = 0, concentration = 0, intensity = 0;
    for (let i = 0; i < lons.length; i++) {
      for (let j = i + 1; j < lons.length; j++) {
        const dist = separation(lons[i], lons[j]);
        for (const asp of aspectAngles) {
          const orb = Math.abs(dist - asp.angle);
          if (orb <= 5) {
            if (asp.kind === "tension") tension++;
            else if (asp.kind === "flow") flow++;
            else concentration++;
            intensity += (5 - orb) / 5;
          }
        }
      }
    }

    const retrogrades: string[] = [];
    for (let i = 0; i < lons.length; i++) {
      if (prevLons[i] >= 0) {
        let diff = lons[i] - prevLons[i];
        while (diff >  180) diff -= 360;
        while (diff < -180) diff += 360;
        if (diff < 0) retrogrades.push(bodyNames[i]);
      }
      prevLons[i] = lons[i];
    }

    for (const idx of ingressBodies) {
      const sign    = Math.floor(lons[idx] / 30);
      const mapIdx  = ingressBodies.indexOf(idx);
      if (prevSigns[idx] >= 0 && sign !== prevSigns[idx]) {
        ingresses.push({
          date:    date.toISOString().slice(0, 10),
          planet:  ingressNames[mapIdx],
          symbol:  ingressSymbols[mapIdx],
          sign:    signNames[sign],
          signSym: signSymbols[sign],
        });
      }
      prevSigns[idx] = sign;
    }

    points.push({
      date:        date.toISOString().slice(0, 10),
      tension, flow, concentration,
      intensity:   Math.round(intensity * 100) / 100,
      lunarPhase:  Math.round(Astronomy.MoonPhase(date) * 10) / 10,
      retrogrades,
    });
  }

  // Eclipses — only total/annular (skip partial + penumbral)
  const eclipses: { date: string; type: "solar" | "lunar"; kind: string }[] = [];

  try {
    let e = Astronomy.SearchLunarEclipse(RANGE_START);
    while (e && e.peak.date < RANGE_END) {
      if ((e.kind as string) === "total")
        eclipses.push({ date: e.peak.date.toISOString().slice(0, 10), type: "lunar", kind: e.kind as string });
      e = Astronomy.NextLunarEclipse(e.peak);
    }
  } catch { /* ignore */ }

  try {
    let e = Astronomy.SearchGlobalSolarEclipse(RANGE_START);
    while (e && e.peak.date < RANGE_END) {
      if ((e.kind as string) === "total" || (e.kind as string) === "annular")
        eclipses.push({ date: e.peak.date.toISOString().slice(0, 10), type: "solar", kind: e.kind as string });
      e = Astronomy.NextGlobalSolarEclipse(e.peak);
    }
  } catch { /* ignore */ }

  eclipses.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(
    { points, eclipses, ingresses, landmarks: LANDMARKS },
    { headers: { "Cache-Control": "public, max-age=86400" } }
  );

  } catch (err) {
    console.error("[timeline]", err);
    return NextResponse.json({ error: "Error al calcular la línea de tiempo." }, { status: 500 });
  }
}
