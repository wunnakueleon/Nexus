import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';
import Card from '../../../shared/components/Card';
import PageHeader from '../../../shared/components/PageHeader';
import { getRouteOverview } from '../apis/shipment.api';
import type { RouteOverviewItem } from '../types/cargo-logistics.types';

// Matches seed creation order — update if DB is re-seeded with different IDs
const WORLD_BY_ID: Record<number, string> = { 1: 'GLV', 2: 'NPT', 3: 'MNU', 4: 'WNM' };

const POS: Record<string, [number, number]> = {
  GLV: [300, 46],
  NPT: [548, 213],
  WNM: [300, 380],
  MNU: [52, 213],
};

interface TrafficInfo { n: number; delayed: boolean; flagged: number; }

const FLAG_COLOR = '#E8960C';

const pairKey = (a: string, b: string) => [a, b].sort().join('-');

// Line colour reflects delay status only; flagged shipments get their own marker.
const lineColor = (t: TrafficInfo) =>
  t.delayed ? '#D93025' : t.n >= 2 ? '#E8960C' : '#5F8A3E';

const RouteOverviewPage: React.FC = () => {
  const { worlds } = useApp();
  const [routes, setRoutes] = useState<RouteOverviewItem[]>([]);

  const load = useCallback(() => {
    getRouteOverview()
      .then(data => setRoutes(data))
      .catch(() => setRoutes([]));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Corridor traffic weights shift whenever any shipment changes state.
  useSocketEvent(SOCKET_EVENTS.ShipmentUpdated, load);

  // Collapse directional corridors into unordered pairs, summing active traffic
  const trafficByPair = useMemo(() => {
    const m: Record<string, TrafficInfo> = {};
    for (const r of routes) {
      const a = WORLD_BY_ID[r.originWorldId] ?? String(r.originWorldId);
      const b = WORLD_BY_ID[r.destinationWorldId] ?? String(r.destinationWorldId);
      const key = pairKey(a, b);
      const prev = m[key] ?? { n: 0, delayed: false, flagged: 0 };
      m[key] = {
        n: prev.n + r.activeShipments,
        delayed: prev.delayed || (r.statusBreakdown.delayed ?? 0) > 0,
        flagged: prev.flagged + r.flaggedShipments,
      };
    }
    return m;
  }, [routes]);

  const present = worlds.filter(w => POS[w.id]);
  const pairs: [string, string][] = [];
  for (let i = 0; i < present.length; i++) {
    for (let j = i + 1; j < present.length; j++) {
      pairs.push([present[i].id, present[j].id]);
    }
  }

  const traffic = (a: string, b: string): TrafficInfo =>
    trafficByPair[pairKey(a, b)] ?? { n: 0, delayed: false, flagged: 0 };

  return (
    <div>
      <PageHeader title="Route Overview" sub="Inter-world cargo corridors. Read-only monitoring." />
      <Card className="p-5">
        <div className="relative w-full max-w-[600px] mx-auto" style={{ aspectRatio: '600/440' }}>
          <svg viewBox="0 0 600 440" className="w-full h-full">
            {pairs.map(([a, b]) => {
              const posA = POS[a], posB = POS[b];
              if (!posA || !posB) return null;
              const t = traffic(a, b);
              const [x1, y1] = posA, [x2, y2] = posB;
              const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;

              // Bow each corridor perpendicular to its straight path so the two
              // that cross the centre (GLV↔WNM and MNU↔NPT) separate into
              // distinct arcs instead of overlapping. The count badge sits on the
              // arc's apex, which also keeps the two centre labels from colliding.
              const dx = x2 - x1, dy = y2 - y1;
              const len = Math.hypot(dx, dy) || 1;
              const px = -dy / len, py = dx / len; // perpendicular unit vector
              const BOW = 30;
              const cx = mx + px * BOW * 2, cy = my + py * BOW * 2; // bezier control
              const lx = mx + px * BOW, ly = my + py * BOW;         // arc apex (label)
              const path = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

              return (
                <g key={a + b}>
                  <path d={path} fill="none"
                    stroke={lineColor(t)}
                    strokeWidth={1.5 + t.n * 2}
                    strokeOpacity={t.n ? 0.9 : 0.35}
                    strokeLinecap="round" />
                  {t.n > 0 && (
                    <>
                      <rect x={lx - 11} y={ly - 11} width="22" height="22" fill="#0D0F11" stroke={lineColor(t)} strokeWidth="1" rx="2" />
                      <text x={lx} y={ly + 4} textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono" fill={lineColor(t)}>{t.n}</text>
                    </>
                  )}
                  {/* Flagged shipments on this corridor — a distinct flag marker so
                      they read separately from the delayed (red) line colour. */}
                  {t.flagged > 0 && (
                    <g transform={`translate(${lx + 14}, ${ly - 9})`}>
                      <line x1="0" y1="0" x2="0" y2="17" stroke={FLAG_COLOR} strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M0.75 0.5 L8.5 3.25 L0.75 6 Z" fill={FLAG_COLOR} />
                      <text x="11" y="13" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono" fill={FLAG_COLOR}>{t.flagged}</text>
                    </g>
                  )}
                </g>
              );
            })}
            {present.map(w => {
              const pos = POS[w.id];
              if (!pos) return null;
              const [x, y] = pos;
              return (
                <g key={w.id}>
                  <rect x={x - 46} y={y - 20} width="92" height="40" fill="#151920" stroke={w.color} strokeWidth="1.5" rx="2" />
                  <rect x={x - 46} y={y - 20} width="92" height="3" fill={w.color} />
                  <text x={x} y={y + 6} textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="Oxanium" fill="#E8ECF1">{w.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-line flex-wrap">
          {([['#5F8A3E', 'Clear'], ['#E8960C', 'Busy'], ['#D93025', 'Disrupted']] as const).map(([c, l]) => (
            <div key={l} className="flex items-center gap-2 text-[12px]/[1.45] text-fg-secondary">
              <span className="w-5 h-1 rounded-sm" style={{ background: c }} />
              <span className="nx-uppercase">{l}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[12px]/[1.45] text-fg-secondary">
            <svg width="13" height="15" viewBox="0 0 13 16" aria-hidden="true">
              <line x1="2" y1="1" x2="2" y2="15" stroke={FLAG_COLOR} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2.75 1.5 L10.5 4.25 L2.75 7 Z" fill={FLAG_COLOR} />
            </svg>
            <span className="nx-uppercase">Flagged</span>
          </div>
          <div className="text-[11px]/[1.45] font-mono text-fg-muted">line weight ∝ active shipments</div>
        </div>
      </Card>
    </div>
  );
};

export default RouteOverviewPage;
