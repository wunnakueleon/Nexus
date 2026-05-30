import React, { useState } from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import WorldBadge from '../../../shared/components/WorldBadge';
import type { ResourceStock } from '../../../shared/types/shared.types';

const STOCK_STATUS: ResourceStock['status'][] = ['Surplus', 'Stable', 'Low', 'Critical'];

const ResourceOverviewPage: React.FC = () => {
  const { stocks, worlds, operator, saveStocks, unitOf } = useApp();
  const mine = operator.worldId ?? '';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ResourceStock[] | null>(null);

  const startEdit = () => {
    setDraft(stocks[mine].map(r => ({ ...r })));
    setEditing(true);
  };
  const save = () => {
    if (draft) saveStocks(mine, draft);
    setEditing(false);
  };

  return (
    <div>
      <PageHeader
        title="Resource Overview"
        sub="Live stock telemetry across all active worlds. You may edit your own world's levels."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {worlds.map(w => {
          const isMine = w.id === mine;
          const rows = isMine && editing && draft ? draft : (stocks[w.id] ?? []);
          return (
            <Card key={w.id} topStripe={w.color} className="flex flex-col">
              <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                <span className="font-semibold text-fg text-sm">{w.name}</span>
                <WorldBadge worldId={w.id} size="sm" dot={false} />
              </div>
              <div className="px-1 py-1 flex-1">
                <table className="w-full">
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.resource} className="border-b border-line/60 last:border-0">
                        <td className="py-2 pl-2.5 pr-1 text-[12px]/[1.3] text-fg">{r.resource}</td>
                        <td className="py-2 px-1 text-right">
                          {isMine && editing
                            ? <input
                                type="number"
                                value={r.stock}
                                onChange={e => {
                                  const d = [...draft!];
                                  d[i] = { ...d[i], stock: +e.target.value };
                                  setDraft(d);
                                }}
                                className="w-20 bg-bg-input border border-line rounded text-fg text-[13px]/[1.5] font-mono px-1.5 py-1 text-right focus:border-amber"
                              />
                            : <span className="font-mono text-[13px]/[1.5] text-fg tnum">
                                {r.stock.toLocaleString()}{' '}
                                <span className="text-fg-muted text-[10px]/[1.3]">{unitOf(r.resource)}</span>
                              </span>}
                        </td>
                        <td className="py-2 px-1 text-center">
                          {isMine && editing
                            ? <select
                                value={r.status}
                                onChange={e => {
                                  const d = [...draft!];
                                  d[i] = { ...d[i], status: e.target.value as ResourceStock['status'] };
                                  setDraft(d);
                                }}
                                className="bg-bg-input border border-line rounded text-[11px]/[1.45] px-1 py-1 text-fg focus:border-amber"
                              >
                                {STOCK_STATUS.map(s => <option key={s}>{s}</option>)}
                              </select>
                            : <StatusBadge status={r.status} pulse={r.status === 'Critical'} />}
                        </td>
                        <td className="py-2 pl-1 pr-2.5 text-right font-mono text-[10px]/[1.3] text-fg-muted whitespace-nowrap">
                          {r.burn} {unitOf(r.resource)}/day
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isMine && (
                <div className="px-3 py-3 border-t border-line">
                  {editing
                    ? <div className="flex gap-2">
                        <Button size="sm" variant="solid" className="flex-1" icon="check" onClick={save}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                      </div>
                    : <Button size="sm" variant="primary" className="w-full" icon="edit" onClick={startEdit}>Edit Stocks</Button>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceOverviewPage;
