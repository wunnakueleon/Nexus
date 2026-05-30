import React from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import Card from '../../../shared/components/Card';
import PageHeader from '../../../shared/components/PageHeader';

const POS: Record<string, [number, number]> = {
  GLV: [300, 46],
  NPT: [548, 213],
  WNM: [300, 380],
  MNU: [52, 213],
};

interface TrafficInfo { n: number; delayed: boolean; }

const lineColor = (t: TrafficInfo) =>
  t.delayed ? '#D93025' : t.n >= 2 ? '#E8960C' : '#5F8A3E';

const RouteOverviewPage: React.FC = () => {
  const { shipments, worlds } = useApp();

  const present = worlds.filter(w => POS[w.id]);
  const pairs: [string, string][] = [];
  for (let i = 0; i < present.length; i++) {
    for (let j = i + 1; j < present.length; j++) {
      pairs.push([present[i].id, present[j].id]);
    }
  }

  const traffic = (a: string, b: string): TrafficInfo => {
    const ss = shipments.filter(s =>
      ((s.origin === a && s.dest === b) || (s.origin === b && s.dest === a)) &&
      s.status !== 'Delivered',
    );
    return { n: ss.length, delayed: ss.some(s => s.status === 'Delayed') };
  };

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
              return (
                <g key={a + b}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={lineColor(t)}
                    strokeWidth={1.5 + t.n * 2}
                    strokeOpacity={t.n ? 0.9 : 0.35} />
                  {t.n > 0 && (
                    <>
                      <rect x={mx - 11} y={my - 11} width="22" height="22" fill="#0D0F11" stroke={lineColor(t)} strokeWidth="1" rx="2" />
                      <text x={mx} y={my + 4} textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono" fill={lineColor(t)}>{t.n}</text>
                    </>
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
          <div className="text-[11px]/[1.45] font-mono text-fg-muted">line weight ∝ active shipments</div>
        </div>
      </Card>
    </div>
  );
};

export default RouteOverviewPage;
