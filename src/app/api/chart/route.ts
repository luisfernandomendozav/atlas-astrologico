import { NextRequest, NextResponse } from "next/server";
import * as Astronomy from "astronomy-engine";

const bodies = [
  ["Sol",      Astronomy.Body.Sun,     "☉"],
  ["Luna",     Astronomy.Body.Moon,    "☽"],
  ["Mercurio", Astronomy.Body.Mercury, "☿"],
  ["Venus",    Astronomy.Body.Venus,   "♀"],
  ["Marte",    Astronomy.Body.Mars,    "♂"],
  ["Júpiter",  Astronomy.Body.Jupiter, "♃"],
  ["Saturno",  Astronomy.Body.Saturn,  "♄"],
  ["Urano",    Astronomy.Body.Uranus,  "♅"],
  ["Neptuno",  Astronomy.Body.Neptune, "♆"],
  ["Plutón",   Astronomy.Body.Pluto,   "♇"],
] as const;

const signs = ["Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario","Capricornio","Acuario","Piscis"];

const aspects = [
  { name: "Conjunción", angle: 0,   kind: "concentración" },
  { name: "Sextil",     angle: 60,  kind: "fluidez" },
  { name: "Cuadratura", angle: 90,  kind: "tensión" },
  { name: "Trígono",    angle: 120, kind: "fluidez" },
  { name: "Oposición",  angle: 180, kind: "tensión" },
] as const;

const wrap       = (n: number) => ((n % 360) + 360) % 360;
const rad        = (n: number) => n * Math.PI / 180;
const deg        = (n: number) => n * 180 / Math.PI;
const separation = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

function speed(body: Astronomy.Body, date: Date): number {
  const h  = 12 * 3_600_000;
  const l1 = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(date.getTime() - h), true)).elon;
  const l2 = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(date.getTime() + h), true)).elon;
  let d = l2 - l1;
  while (d >  180) d -= 360;
  while (d < -180) d += 360;
  return d; // degrees / day
}

function moonPhaseName(p: number): string {
  const n = ((p % 360) + 360) % 360;
  if (n < 22.5 || n >= 337.5) return "Nueva";
  if (n < 67.5)  return "Creciente";
  if (n < 112.5) return "Cuarto Creciente";
  if (n < 157.5) return "Gibosa Creciente";
  if (n < 202.5) return "Llena";
  if (n < 247.5) return "Gibosa Menguante";
  if (n < 292.5) return "Cuarto Menguante";
  return "Menguante";
}

export function GET(req: NextRequest) {
  const raw  = req.nextUrl.searchParams;
  const date = new Date(raw.get("at") || "");
  const lat  = Number(raw.get("lat"));
  const lon  = Number(raw.get("lon"));

  if (
    !Number.isFinite(date.getTime()) ||
    !Number.isFinite(lat) || !Number.isFinite(lon) ||
    lat < -89.9 || lat > 89.9 || lon < -180 || lon > 180 ||
    date.getUTCFullYear() < 1900 || date.getUTCFullYear() > 2100
  ) {
    return NextResponse.json(
      { error: "Fecha o coordenadas fuera de rango (1900–2100; latitud ±89.9°)." },
      { status: 400 }
    );
  }

  try {
    const observer = new Astronomy.Observer(lat, lon, 0);

    const planets = bodies.map(([name, body, symbol]) => {
      const ecliptic = Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true));
      const eq       = Astronomy.Equator(body, date, observer, true, true);
      const horizon  = Astronomy.Horizon(date, observer, eq.ra, eq.dec, "normal");
      const spd      = speed(body, date);
      return {
        name, symbol,
        longitude:  ecliptic.elon,
        sign:       signs[Math.floor(ecliptic.elon / 30)],
        degree:     ecliptic.elon % 30,
        altitude:   horizon.altitude,
        speed:      Math.round(spd * 1000) / 1000,
        retrograde: spd < 0,
      };
    });

    const found = [];
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const distance = separation(planets[i].longitude, planets[j].longitude);
        for (const aspect of aspects) {
          const orb = Math.abs(distance - aspect.angle);
          if (orb <= 5) found.push({
            first: planets[i].name, second: planets[j].name,
            name: aspect.name, kind: aspect.kind,
            orb: Math.round(orb * 10) / 10,
          });
        }
      }
    }
    found.sort((a, b) => a.orb - b.orb);

    const theta   = rad(wrap(15 * Astronomy.SiderealTime(date) + lon));
    const epsilon = rad(23.4393);
    const phi     = rad(lat);
    const mc  = wrap(deg(Math.atan2(Math.sin(theta) / Math.cos(epsilon), Math.cos(theta))));
    const asc = wrap(deg(Math.atan2(-Math.cos(theta), Math.sin(theta) * Math.cos(epsilon) + Math.tan(phi) * Math.sin(epsilon))));

    const moonPhase = Astronomy.MoonPhase(date);

    return NextResponse.json({
      at: date.toISOString(), lat, lon,
      planets,
      aspects:    found.slice(0, 12),
      ascendant:  { longitude: asc, sign: signs[Math.floor(asc / 30)] },
      midheaven:  { longitude: mc,  sign: signs[Math.floor(mc  / 30)] },
      counts: {
        tension:       found.filter(a => a.kind === "tensión").length,
        flow:          found.filter(a => a.kind === "fluidez").length,
        concentration: found.filter(a => a.kind === "concentración").length,
      },
      moon: {
        phase:        Math.round(moonPhase * 10) / 10,
        name:         moonPhaseName(moonPhase),
        illumination: Math.round((1 - Math.cos(rad(moonPhase))) / 2 * 100),
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo calcular esta carta." }, { status: 500 });
  }
}
