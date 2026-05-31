import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import { Field, Input, Textarea } from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import {
  fetchPendingWorldRequests,
  fetchWorldRequestHistory,
  fetchWorlds,
  resolveWorldRequest,
  submitWorldRequest,
  updateWorld,
} from '../apis/world.api';
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';
import type { AdminWorldSummary, WorldRequestRow } from '../types/admin.types';

const PALETTE = ['#7A8C3A', '#3A8C8C', '#4A6FA5', '#A04030', '#C47A1A', '#5F8A3E'];

const WorldManagementPage: React.FC = () => {
  const [worlds, setWorlds] = useState<AdminWorldSummary[]>([]);
  const [pending, setPending] = useState<WorldRequestRow[]>([]);
  const [history, setHistory] = useState<WorldRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7A8C3A');
  const [reason, setReason] = useState('');

  const [showRemoval, setShowRemoval] = useState(false);
  const [removalReason, setRemovalReason] = useState('');
  const [removalWorld, setRemovalWorld] = useState<AdminWorldSummary | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editWorld, setEditWorld] = useState<AdminWorldSummary | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#7A8C3A');

  // State is set only in the promise callbacks (never synchronously), so the
  // mount effect doesn't cause a cascading render. `loading` starts true. The
  // promise is returned so action handlers can await a refresh.
  const loadData = useCallback(() => {
    return Promise.all([
      fetchWorlds(),
      fetchPendingWorldRequests(),
      fetchWorldRequestHistory(),
    ])
      .then(([worldList, pendingList, historyList]) => {
        setWorlds(worldList);
        setPending(pendingList);
        setHistory(historyList);
        setError(null);
      })
      .catch(() => setError('Unable to load world management data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Another admin submitting/resolving a world request, or editing a world,
  // refreshes the active list, pending cards and history together.
  useSocketEvent(SOCKET_EVENTS.WorldUpdated, () => loadData());

  const activeWorlds = useMemo(() => worlds.filter(w => w.status === 'active'), [worlds]);

  const submit = async () => {
    if (!name.trim() || !reason.trim()) return;
    setError(null);
    try {
      const row = await submitWorldRequest({
        requestType: 'addition',
        worldName: name.trim(),
        colorHex: color,
        reason: reason.trim(),
      });
      setPending(prev => [row, ...prev]);
      setShowForm(false);
      setName('');
      setReason('');
    } catch (err) {
      setError('Unable to submit world request.');
    }
  };

  const submitRemoval = async () => {
    if (!removalWorld || !removalReason.trim()) return;
    setError(null);
    try {
      const row = await submitWorldRequest({
        requestType: 'removal',
        worldName: removalWorld.name,
        worldId: removalWorld.id,
        colorHex: removalWorld.colorHex,
        reason: removalReason.trim(),
      });
      setPending(prev => [row, ...prev]);
      setShowRemoval(false);
      setRemovalReason('');
      setRemovalWorld(null);
    } catch (err) {
      setError('Unable to submit removal request.');
    }
  };

  const handleResolve = async (id: number, action: 'approve' | 'reject') => {
    setError(null);
    try {
      const updated = await resolveWorldRequest(id, action);
      setPending(prev => prev.filter(r => r.id !== updated.id));
      setHistory(prev => [updated, ...prev]);
      if (updated.requestType === 'addition' && updated.status === 'approved') {
        await loadData();
      }
      if (updated.requestType === 'removal' && updated.status === 'approved') {
        await loadData();
      }
    } catch (err) {
      setError('Unable to resolve request.');
    }
  };

  const openEdit = (world: AdminWorldSummary) => {
    setEditWorld(world);
    setEditName(world.name);
    setEditColor(world.colorHex);
    setShowEdit(true);
  };

  const submitEdit = async () => {
    if (!editWorld || !editName.trim()) return;
    setError(null);
    try {
      const updated = await updateWorld(editWorld.id, editName.trim(), editColor);
      setWorlds(prev => prev.map(w => (w.id === updated.id ? updated : w)));
      setShowEdit(false);
    } catch (err) {
      setError('Unable to update world.');
    }
  };

  return (
    <div>
      <PageHeader
        title="World Management"
        sub="Active worlds, governance requests, and decision history."
        actions={<Button variant="primary" icon="plus" onClick={() => setShowForm(true)}>Request New World</Button>}
      />

      {error && <div className="text-xs text-critical font-mono mb-4">{error}</div>}

      <SectionLabel>Active Worlds</SectionLabel>
      <Card className="mb-7">
        <div className="px-3 pb-1 overflow-x-auto">
          <Table headers={['World', 'Identity', { label: 'Added' }, { label: 'Actions', align: 'right' }]}>
            {loading
              ? <tr><Td colSpan={4} className="text-fg-secondary">Loading worlds...</Td></tr>
              : activeWorlds.map(w => (
              <tr key={w.id} className="border-b border-line last:border-0">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-sm" style={{ background: w.colorHex }} />
                    <span className="font-semibold text-fg">{w.name}</span>
                  </div>
                </Td>
                <Td className="text-fg-secondary">—</Td>
                <Td mono className="text-fg-muted text-[12px]/[1.45]">{new Date(w.createdAt).toLocaleDateString()}</Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => openEdit(w)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => { setRemovalWorld(w); setShowRemoval(true); }}>
                      Request Removal
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <SectionLabel>Pending Requests</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-7">
        {pending.length === 0 && (
          <Card className="col-span-full"><EmptyState icon="globe" text="No pending world requests." /></Card>
        )}
        {pending.map(r => (
          <Card key={r.id} className="p-4" topStripe={r.colorHex ?? '#5F8A3E'}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px]/[1.45] font-semibold nx-uppercase px-2 py-0.5 rounded"
                  style={{
                    color:      r.requestType === 'addition' ? '#5F8A3E' : '#D93025',
                    background: r.requestType === 'addition' ? '#142010' : '#2B0A08',
                  }}>
                  {r.requestType === 'addition' ? 'Addition' : 'Removal'}
                </span>
                <span className="font-semibold text-fg">{r.worldName}</span>
              </div>
              <StatusBadge status="Pending" />
            </div>
            <p className="text-sm text-fg-secondary mb-3">{r.reason}</p>
            <div className="flex items-center gap-2 mb-3 text-[11px]/[1.45] font-mono text-pending nx-uppercase">
              <span className="w-1.5 h-1.5 rounded-sm bg-pending animate-pulse-crit" />
              Awaiting external deliberation
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px]/[1.45] font-mono text-fg-muted">{new Date(r.requestedAt).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" icon="check" onClick={() => handleResolve(r.id, 'approve')}>Mark Approved</Button>
                <Button size="sm" variant="danger" icon="x" onClick={() => handleResolve(r.id, 'reject')}>Mark Rejected</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionLabel>Request History</SectionLabel>
      <Card>
        <div className="px-3 pb-1 overflow-x-auto">
          <Table headers={['Type', 'World', 'Reason', { label: 'Window' }, 'Result']}>
            {history.map(h => (
              <tr key={h.id} className="border-b border-line last:border-0">
                <Td className="text-fg-secondary">{h.requestType === 'addition' ? 'Addition' : 'Removal'}</Td>
                <Td className="font-semibold text-fg">{h.worldName}</Td>
                <Td className="text-fg-secondary max-w-xs"><span className="line-clamp-1">{h.reason}</span></Td>
                <Td mono className="text-fg-muted text-[12px]/[1.45]">
                  {new Date(h.requestedAt).toLocaleDateString()} → {h.resolvedAt ? new Date(h.resolvedAt).toLocaleDateString() : '—'}
                </Td>
                <Td><StatusBadge status={h.status === 'approved' ? 'Approved' : 'Rejected'} /></Td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      {showForm && (
        <Modal
          title="Request New World"
          onClose={() => setShowForm(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="solid" onClick={submit} disabled={!name.trim() || !reason.trim()}>Submit Request</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Proposed World Name">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CeresColony" />
            </Field>
            <Field label="Identity Color">
              <div className="flex gap-2">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded border-2 ${color === c ? 'border-fg' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Field>
            <Field label="Reason">
              <Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Justification for addition..." />
            </Field>
          </div>
        </Modal>
      )}

      {showRemoval && removalWorld && (
        <Modal
          title={`Request Removal — ${removalWorld.name}`}
          onClose={() => setShowRemoval(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowRemoval(false)}>Cancel</Button>
              <Button variant="solid" onClick={submitRemoval} disabled={!removalReason.trim()}>Submit Request</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Reason">
              <Textarea rows={3} value={removalReason} onChange={e => setRemovalReason(e.target.value)} placeholder="Justification for removal..." />
            </Field>
          </div>
        </Modal>
      )}

      {showEdit && editWorld && (
        <Modal
          title={`Edit World — ${editWorld.name}`}
          onClose={() => setShowEdit(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button variant="solid" onClick={submitEdit} disabled={!editName.trim()}>Save Changes</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="World Name">
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="World name" />
            </Field>
            <Field label="Identity Color">
              <div className="flex gap-2">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => setEditColor(c)}
                    className={`w-8 h-8 rounded border-2 ${editColor === c ? 'border-fg' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WorldManagementPage;
