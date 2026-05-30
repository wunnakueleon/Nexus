import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Field, Input, Select } from '../../../shared/components/Field';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import WorldBadge from '../../../shared/components/WorldBadge';
import { fetchAccessCodes, generateAccessCodes, expireAccessCode } from '../apis/code.api';
import { fetchWorlds } from '../apis/world.api';
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

const WORLD_NAME_TO_ID: Record<string, string> = {
  GloriaVenus: 'GLV',
  NanPtune: 'NPT',
  MinUranus: 'MNU',
  WunnaMars: 'WNM',
};

const formatStamp = (value: string) => {
  const stamp = new Date(value);
  if (Number.isNaN(stamp.getTime())) return value;
  return stamp.toLocaleDateString();
};

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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [worldList, codeList] = await Promise.all([fetchWorlds(), fetchAccessCodes()]);
      setWorlds(worldList);
      setCodes(codeList);
      if (worldList.length && !world) {
        setWorld(String(worldList[0].id));
      }
    } catch (err) {
      setError('Unable to load access codes.');
    } finally {
      setLoading(false);
    }
  }, [world]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const worldOpts = worlds.map(w => ({ value: String(w.id), label: w.name }));
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
    } catch (err) {
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
    } catch (err) {
      setError('Unable to expire code.');
    } finally {
      setBusy(false);
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
            <Select options={ROLE_OPTS} value={role} onChange={e => setRole(e.target.value)} />
          </Field>
          <Field label="Quantity" hint={role === 'Commercial Citizen' ? 'bulk issue permitted' : 'government role — issue 1 per generation'}>
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
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line flex-wrap">
          <SectionLabel className="mb-0">
            Issued Codes <span className="text-fg-muted font-mono ml-1">{filtered.length}</span>
          </SectionLabel>
          <div className="flex items-center gap-2">
            <Select options={['All', ...worlds.map(w => ({ value: String(w.id), label: w.name }))]} value={fWorld} onChange={e => setFWorld(e.target.value)} />
            <Select options={['All', ...ROLE_OPTS]} value={fRole} onChange={e => setFRole(e.target.value)} />
            <Select options={['All', 'Available', 'Used', 'Expired']} value={fStatus} onChange={e => setFStatus(e.target.value)} />
          </div>
        </div>
        <div className="px-3 pb-1">
          {loading
            ? <div className="px-1 py-4 text-sm text-fg-secondary">Loading codes...</div>
            : <Table headers={['Code', 'World', 'Role', 'Status', 'Used By', { label: 'Created' }, { label: '', align: 'right' }]}>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                    <Td mono className="text-fg font-medium">{c.code}</Td>
                    <Td><WorldBadge worldId={WORLD_NAME_TO_ID[c.worldName] ?? c.worldName} size="sm" /></Td>
                    <Td className="text-fg-secondary">{ROLE_LABEL[c.role]}</Td>
                    <Td><StatusBadge status={STATUS_LABEL[c.status]} /></Td>
                    <Td className="text-fg-secondary">{c.usedBy || <span className="text-fg-muted">—</span>}</Td>
                    <Td mono className="text-fg-muted text-[12px]/[1.45]">{formatStamp(c.createdAt)}</Td>
                    <Td align="right">
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
