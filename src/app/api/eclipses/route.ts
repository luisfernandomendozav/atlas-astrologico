import { NextRequest, NextResponse } from "next/server";
import * as Astronomy from "astronomy-engine";

const START = new Date("2019-01-01T00:00:00Z");
const END   = new Date("2034-12-31T00:00:00Z");

// Local eclipse visibility for an observer: solar eclipses are only visible
// along their path; lunar eclipses only where the Moon is above the horizon.
export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(req.nextUrl.searchParams.get("lon") ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return NextResponse.json({ error: "lat/lon inválidos" }, { status: 400 });
  }
  const observer = new Astronomy.Observer(lat, lon, 0);

  const solar: { date: string; visible: boolean; obscuration: number | null }[] = [];
  let t = Astronomy.MakeTime(START);
  for (;;) {
    const g = Astronomy.SearchGlobalSolarEclipse(t);
    if (g.peak.date > END) break;
    // A local eclipse matching this global one must peak within ~1 day of it
    // and with the Sun above the horizon.
    const local = Astronomy.SearchLocalSolarEclipse(g.peak.AddDays(-1.5), observer);
    const matches = Math.abs(local.peak.time.ut - g.peak.ut) < 1.5;
    const visible = matches && local.peak.altitude > 0;
    solar.push({
      date: g.peak.date.toISOString().slice(0, 10),
      visible,
      obscuration: visible ? Math.round(local.obscuration * 100) / 100 : null,
    });
    t = g.peak.AddDays(10);
  }

  const lunar: { date: string; visible: boolean }[] = [];
  let tl = Astronomy.MakeTime(START);
  for (;;) {
    const le = Astronomy.SearchLunarEclipse(tl);
    if (le.peak.date > END) break;
    const eq = Astronomy.Equator(Astronomy.Body.Moon, le.peak, observer, true, true);
    const hor = Astronomy.Horizon(le.peak, observer, eq.ra, eq.dec, "normal");
    lunar.push({
      date: le.peak.date.toISOString().slice(0, 10),
      visible: hor.altitude > 0,
    });
    tl = le.peak.AddDays(10);
  }

  return NextResponse.json(
    { lat, lon, solar, lunar },
    { headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
