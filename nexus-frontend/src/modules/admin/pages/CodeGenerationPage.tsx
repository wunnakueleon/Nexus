import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Field, Input, Select } from '../../../shared/components/Field';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import { useApp } from '../../../shared/hooks/useApp';
import { fetchAccessCodes, generateAccessCodes, expireAccessCode } from '../apis/code.api';
import { fetchWorlds } from '../apis/world.api';
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';
import type { AccessCodeRole, AccessCodeRow, AdminWorldSummary } from '../types/admin.types';

const ROLE_OPTS = ['Resource Manager', 'Transit Officer', 'Commercial Citizen'] as const;

const ROLE_VALUE: Record<(typeof ROLE_OPTS)[number], AccessCodeRole> = {
  'Resource Manager': 'resource_manager',
  'Transit Officer': 'transit_officer',
  'Commercial Citizen': 'commercial_citizen',
};

const ROLE_LABEL: Record<AccessCodeRole, string> = {
  resource_manager: 'Resource Manager',
  transit_officer: 'Transit Officer',
  commercial_citizen: 'Commercial Citizen',
};

const STATUS_LABEL: Record<AccessCodeRow['status'], string> = {
  available: 'Available',
  used: 'Used',
  expired: 'Expired',
};

const formatStamp = (value: string) => {
  const stamp = new Date(value);
  if (Number.isNaN(stamp.getTime())) return value;
  return stamp.toLocaleDateString();
};

const WorldPill: React.FC<{ world: AdminWorldSummary }> = ({ world }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded font-semibold text-[10px]/[1.45] px-1.5 py-0.5 whitespace-nowrap"
    style={{ color: world.colorHex, background: `${world.colorHex}22` }}
  >
    <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: world.colorHex }} />
    {world.name}
  </span>
);

// A Select that shrinks responsively in filter bars
const FilterSelect: React.FC<React.ComponentProps<typeof Select>> = (props) => (
  <div className="min-w-0 flex-1">
    <Select {...props} />
  </div>
);

const CodeGenerationPage: React.FC = () => {
  const [worlds, setWorlds] = useState<AdminWorldSummary[]>([]);
  const [codes, setCodes] = useState<AccessCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [world, setWorld] = useState('');
  const [role, setRole] = useState<(typeof ROLE_OPTS)[number]>('Commercial Citizen');
  const [qty, setQty] = useState(1);
  const [fWorld, setFWorld] = useState('All');
  const [fRole, setFRole] = useState('All');
  const [fStatus, setFStatus] = useState('All');
  const { flash } = useApp();

  const worldMap = useMemo(
    () => Object.fromEntries(worlds.map(w => [w.id, w])),
    [worlds],
  );

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [worldList, codeList] = await Promise.all([fetchWorlds(), fetchAccessCodes()]);
      setWorlds(worldList);
      setCodes(codeList);
      const firstActive = worldList.find(w => w.status === 'active');
      if (firstActive && !world) setWorld(String(firstActive.id));
    } catch {
      setError('Unable to load access codes.');
    } finally {
      setLoading(false);
    }
  }, [world]);

  useEffect(() => { void loadData(); }, [loadData]);

  // Codes generated/expired by any admin, and world edits (which rename the
  // world pills), keep the issued-codes table current for everyone.
  useSocketEvent(
    [SOCKET_EVENTS.CodeUpdated, SOCKET_EVENTS.WorldUpdated],
    () => void loadData(true),
  );

  const activeWorlds = useMemo(() => worlds.filter(w => w.status === 'active'), [worlds]);
  const worldOpts = activeWorlds.map(w => ({ value: String(w.id), label: w.name }));

  const filtered = useMemo(() => codes.filter(c =>
    (fWorld === 'All' || String(c.worldId) === fWorld) &&
    (fRole === 'All' || ROLE_LABEL[c.role] === fRole) &&
    (fStatus === 'All' || STATUS_LABEL[c.status] === fStatus),
  ), [codes, fWorld, fRole, fStatus]);

  const effectiveQty = role === 'Commercial Citizen' ? qty : 1;
  const canGenerate = !!world && !busy;

  const onGenerate = async () => {
    if (!world) return;
    setBusy(true);
    setError(null);
    try {
      const created = await generateAccessCodes(Number(world), ROLE_VALUE[role], effectiveQty);
      setCodes(prev => [...created, ...prev]);
      if (role !== 'Commercial Citizen') setQty(1);
    } catch {
      setError('Unable to generate access codes.');
    } finally {
      setBusy(false);
    }
  };

  const onExpire = async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await expireAccessCode(id);
      setCodes(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch {
      setError('Unable to expire code.');
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      flash('Code copied');
    } catch {
      setError('Unable to copy code.');
    }
  };

  return (
    <div>
      <PageHeader title="Code Generation" sub="Issue access codes tagged to a world and role. No open registration." />

      <Card className="p-5 mb-6">
        <SectionLabel>Generate Codes</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Field label="World">
            <Select options={worldOpts} value={world} onChange={e => setWorld(e.target.value)} />
          </Field>
          <Field label="Role">
            <Select options={ROLE_OPTS} value={role} onChange={e => setRole(e.target.value as typeof role)} />
          </Field>
          <Field label="Quantity">
            <div className="text-[11px]/[1.45] text-fg-muted font-mono mb-1">
              {role === 'Commercial Citizen' ? 'bulk issue permitted' : 'government role — issue 1 per generation'}
            </div>
            <Input
              type="number"
              min="1"
              max="50"
              value={effectiveQty}
              disabled={role !== 'Commercial Citizen'}
              onChange={e => setQty(Math.max(1, +e.target.value || 1))}
            />
          </Field>
          <Button variant="solid" icon="plus" className="h-[38px]" onClick={onGenerate} disabled={!canGenerate}>
            Generate
          </Button>
        </div>
      </Card>

      <Card>
        {error && <div className="px-4 pt-4 text-xs text-critical font-mono">{error}</div>}

        {/* Filter bar — label left, dropdowns share remaining space */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <SectionLabel className="mb-0 shrink-0">
            Issued Codes <span className="text-fg-muted font-mono ml-1">{filtered.length}</span>
          </SectionLabel>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FilterSelect
              options={['All', ...worlds.map(w => ({ value: String(w.id), label: w.name }))]}
              value={fWorld}
              onChange={e => setFWorld(e.target.value)}
            />
            <FilterSelect
              options={['All', ...ROLE_OPTS]}
              value={fRole}
              onChange={e => setFRole(e.target.value)}
            />
            <FilterSelect
              options={['All', 'Available', 'Used', 'Expired']}
              value={fStatus}
              onChange={e => setFStatus(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable table wrapper */}
        <div className="overflow-x-auto">
          {loading
            ? <div className="px-4 py-4 text-sm text-fg-secondary">Loading codes...</div>
            : <Table headers={['Code', 'World', 'Role', 'Status', 'Used By', { label: 'Created' }, { label: '', align: 'right' }]}>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                    <Td mono className="text-fg font-medium whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <span>{c.code}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="copy"
                          className="px-1.5 py-1"
                          onClick={() => onCopy(c.code)}
                          aria-label="Copy code"
                          title="Copy"
                        />
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap">
                      {worldMap[c.worldId]
                        ? <WorldPill world={worldMap[c.worldId]} />
                        : <span className="text-fg-muted text-xs">{c.worldName}</span>}
                    </Td>
                    <Td className="text-fg-secondary whitespace-nowrap">{ROLE_LABEL[c.role]}</Td>
                    <Td className="whitespace-nowrap"><StatusBadge status={STATUS_LABEL[c.status]} /></Td>
                    <Td className="text-fg-secondary">{c.usedBy || <span className="text-fg-muted">—</span>}</Td>
                    <Td mono className="text-fg-muted text-[12px]/[1.45] whitespace-nowrap">{formatStamp(c.createdAt)}</Td>
                    <Td align="right" className="whitespace-nowrap">
                      {c.status === 'available' && (
                        <Button size="sm" variant="ghost" onClick={() => onExpire(c.id)} disabled={busy}>Expire</Button>
                      )}
                    </Td>
                  </tr>
                ))}
              </Table>}
        </div>
      </Card>
    </div>
  );
};

export default CodeGenerationPage;
