import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import { resourceApi } from '../apis/resource.api';
import type { ResourceRow, StockUpdate } from '../types/resource-exchange.types';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import WorldBadge from '../../../shared/components/WorldBadge';
import LoadingState from '../../../shared/components/LoadingState';

const STATUS_OPTIONS: ResourceRow['status'][] = ['surplus', 'stable', 'low', 'critical'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const unit = (type: string) => type === 'water' ? 'KL' : 'MT';

const ResourceOverviewPage: React.FC = () => {
  const { worlds, worldById, operator } = useApp();

  const [allResources, setAllResources]   = useState<ResourceRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [editing, setEditing]             = useState(false);
  const [draft, setDraft]                 = useState<ResourceRow[] | null>(null);
  const [saving, setSaving]               = useState(false);

  const fetchResources = useCallback(async () => {
    try {
      const res = await resourceApi.getAll();
      setAllResources(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // world name → DB integer id
  const nameToDbId = useMemo(() => {
    const map: Record<string, number> = {};
    allResources.forEach(r => { map[r.world.name] = r.worldId; });
    return map;
  }, [allResources]);

  // DB integer id → resources array
  const resourcesByDbId = useMemo(() => {
    const map: Record<number, ResourceRow[]> = {};
    allResources.forEach(r => {
      if (!map[r.worldId]) map[r.worldId] = [];
      map[r.worldId].push(r);
    });
    return map;
  }, [allResources]);

  const myWorldName  = operator?.worldId ? worldById(operator.worldId).name : null;
  const myDbWorldId  = myWorldName ? nameToDbId[myWorldName] ?? null : null;

  const startEdit = () => {
    if (!myDbWorldId) return;
    setDraft((resourcesByDbId[myDbWorldId] ?? []).map(r => ({ ...r })));
    setEditing(true);
  };

  const save = async () => {
    if (!draft || !myDbWorldId) return;
    setSaving(true);
    try {
      const stocks: StockUpdate[] = draft.map(r => ({
        resourceType: r.resourceType,
        stock: r.stock,
        status: r.status,
        burnRate: r.burnRate,
      }));
      await resourceApi.updateStocks(myDbWorldId, stocks);
      await fetchResources();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading resource telemetry..." />;

  return (
    <div>
      <PageHeader
        title="Resource Overview"
        sub="Live stock telemetry across all active worlds. You may edit your own world's levels."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {worlds.map(w => {
          const dbId  = nameToDbId[w.name];
          const isMine = dbId != null && dbId === myDbWorldId;
          const rows  = isMine && editing && draft ? draft : (dbId ? (resourcesByDbId[dbId] ?? []) : []);

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
                      <tr key={r.resourceType} className="border-b border-line/60 last:border-0">
                        <td className="py-2 pl-2.5 pr-1 text-[12px]/[1.3] text-fg capitalize">{r.resourceType}</td>
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
                                <span className="text-fg-muted text-[10px]/[1.3]">{unit(r.resourceType)}</span>
                              </span>}
                        </td>
                        <td className="py-2 px-1 text-center">
                          {isMine && editing
                            ? <select
                                value={r.status}
                                onChange={e => {
                                  const d = [...draft!];
                                  d[i] = { ...d[i], status: e.target.value as ResourceRow['status'] };
                                  setDraft(d);
                                }}
                                className="bg-bg-input border border-line rounded text-[11px]/[1.45] px-1 py-1 text-fg focus:border-amber"
                              >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                              </select>
                            : <StatusBadge status={cap(r.status)} pulse={r.status === 'critical'} />}
                        </td>
                        <td className="py-2 pl-1 pr-2.5 text-right font-mono text-[10px]/[1.3] text-fg-muted whitespace-nowrap">
                          {r.burnRate} {unit(r.resourceType)}/day
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
                        <Button size="sm" variant="solid" className="flex-1" icon="check" onClick={save} disabled={saving}>
                          {saving ? 'Saving…' : 'Save'}
                        </Button>
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
