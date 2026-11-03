"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import landTopo from "world-atlas/land-110m.json";

export type GeoLoc = { lat: number; lon: number; label: string };

export const GEO_PRESETS: GeoLoc[] = [
  { label: "Hermosillo",       lat: 29.0729, lon: -110.9559 },
  { label: "Ciudad de México", lat: 19.4326, lon: -99.1332 },
  { label: "Madrid",           lat: 40.4168, lon: -3.7038 },
  { label: "Tokio",            lat: 35.6762, lon: 139.6503 },
];

const SIZE = 290;
const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land);
const GRATICULE = geoGraticule10();

export function GlobePicker({ value, onChange }: { value: GeoLoc; onChange: (l: GeoLoc) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // rotation = [lambda, phi]: center of view is at (-lambda, -phi)
  const [rotation, setRotation] = useState<[number, number]>([-value.lon, -value.lat]);
  const dragRef = useRef<{ x: number; y: number; r: [number, number]; moved: boolean } | null>(null);

  const buildProjection = useCallback(
    (rot: [number, number]) =>
      geoOrthographic()
        .translate([SIZE / 2, SIZE / 2])
        .scale(SIZE / 2 - 8)
        .rotate([rot[0], rot[1]]),
    [],
  );

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);

    const projection = buildProjection(rotation);
    const path = geoPath(projection, ctx);

    // Sphere
    ctx.beginPath(); path({ type: "Sphere" });
    ctx.fillStyle = "#fdfcf8"; ctx.fill();
    ctx.strokeStyle = "#dcd9d0"; ctx.lineWidth = 1; ctx.stroke();

    // Graticule
    ctx.beginPath(); path(GRATICULE);
    ctx.strokeStyle = "rgba(220,217,208,0.7)"; ctx.lineWidth = 0.5; ctx.stroke();

    // Land
    ctx.beginPath(); path(LAND);
    ctx.fillStyle = "rgba(117,141,124,0.22)"; ctx.fill();
    ctx.strokeStyle = "rgba(119,121,112,0.55)"; ctx.lineWidth = 0.7; ctx.stroke();

    // Pin (only when on the visible hemisphere)
    const front = geoDistance([value.lon, value.lat], [-rotation[0], -rotation[1]]) < Math.PI / 2 - 0.02;
    const p = projection([value.lon, value.lat]);
    if (front && p) {
      ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(187,121,92,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#bb795c"; ctx.fill();
      ctx.strokeStyle = "#f4f0e8"; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }, [rotation, value, buildProjection]);

  const canvasXY = (e: React.PointerEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    const [x, y] = canvasXY(e);
    dragRef.current = { x, y, r: rotation, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const [x, y] = canvasXY(e);
    const dx = x - d.x, dy = y - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    // Rotate on both axes: horizontal drag spins longitude, vertical drag tilts latitude
    const K = 0.45;
    setRotation([
      d.r[0] + dx * K,
      Math.max(-85, Math.min(85, d.r[1] - dy * K)),
    ]);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || d.moved) return;
    // Click without drag: drop the pin
    const projection = buildProjection(rotation);
    const coords = projection.invert?.(canvasXY(e));
    if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) return;
    // Reject clicks outside the sphere (invert extrapolates)
    if (geoDistance(coords, [-rotation[0], -rotation[1]]) > Math.PI / 2) return;
    onChange({
      lon: +coords[0].toFixed(4),
      lat: +coords[1].toFixed(4),
      label: "Personalizada",
    });
  };

  const pickPreset = (p: GeoLoc) => {
    onChange(p);
    setRotation([-p.lon, -p.lat]);
  };

  return (
    <div className="globePicker">
      <canvas
        ref={canvasRef}
        className="globeCanvas"
        style={{ width: SIZE, height: SIZE }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Globo terráqueo: arrastra para rotar, clic para colocar el pin"
      />
      <div className="globePresets">
        {GEO_PRESETS.map(p => (
          <button
            key={p.label}
            className={"conceptChip" + (value.label === p.label ? " globePresetSel" : "")}
            onClick={() => pickPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
