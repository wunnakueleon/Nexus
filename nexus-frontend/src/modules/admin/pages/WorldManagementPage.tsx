import React, { useState } from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import { Field, Input, Textarea } from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';

const PALETTE = ['#7A8C3A', '#3A8C8C', '#4A6FA5', '#A04030', '#C47A1A', '#5F8A3E'];

const WorldManagementPage: React.FC = () => {
  const { worlds, worldReqs, worldHist, resolveWorldReq, requestWorld } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState('');
  const [color, setColor]       = useState('#7A8C3A');
  const [reason, setReason]     = useState('');

  const submit = () => {
    if (!name.trim() || !reason.trim()) return;
    requestWorld(name.trim(), color, reason.trim());
    setShowForm(false); setName(''); setReason('');
  };

  return (
    <div>
      <PageHeader
        title="World Management"
        sub="Active worlds, governance requests, and decision history."
        actions={<Button variant="primary" icon="plus" onClick={() => setShowForm(true)}>Request New World</Button>}
      />

      <SectionLabel>Active Worlds</SectionLabel>
      <Card className="mb-7">
        <div className="px-3 pb-1">
          <Table headers={['World', 'Identity', { label: 'Added' }, { label: 'Actions', align: 'right' }]}>
            {worlds.map(w => (
              <tr key={w.id} className="border-b border-line last:border-0">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-sm" style={{ background: w.color }} />
                    <span className="font-semibold text-fg">{w.name}</span>
                  </div>
                </Td>
                <Td className="text-fg-secondary">{w.identity}</Td>
                <Td mono className="text-fg-muted text-[12px]/[1.45]">{w.added}</Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" icon="edit">Edit</Button>
                    <Button size="sm" variant="danger">Request Removal</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <SectionLabel>Pending Requests</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-7">
        {worldReqs.length === 0 && (
          <Card className="col-span-full"><EmptyState icon="globe" text="No pending world requests." /></Card>
        )}
        {worldReqs.map(r => (
          <Card key={r.id} className="p-4" topStripe={r.color}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px]/[1.45] font-semibold nx-uppercase px-2 py-0.5 rounded"
                  style={{
                    color:      r.type === 'Addition' ? '#5F8A3E' : '#D93025',
                    background: r.type === 'Addition' ? '#142010' : '#2B0A08',
                  }}>
                  {r.type}
                </span>
                <span className="font-semibold text-fg">{r.world}</span>
              </div>
              <StatusBadge status="Pending" />
            </div>
            <p className="text-sm text-fg-secondary mb-3">{r.reason}</p>
            <div className="flex items-center gap-2 mb-3 text-[11px]/[1.45] font-mono text-pending nx-uppercase">
              <span className="w-1.5 h-1.5 rounded-sm bg-pending animate-pulse-crit" />
              Awaiting external deliberation
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px]/[1.45] font-mono text-fg-muted">{r.date}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" icon="check" onClick={() => resolveWorldReq(r.id, 'approve')}>Mark Approved</Button>
                <Button size="sm" variant="danger" icon="x" onClick={() => resolveWorldReq(r.id, 'reject')}>Mark Rejected</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionLabel>Request History</SectionLabel>
      <Card>
        <div className="px-3 pb-1">
          <Table headers={['Type', 'World', 'Reason', { label: 'Window' }, 'Result']}>
            {worldHist.map(h => (
              <tr key={h.id} className="border-b border-line last:border-0">
                <Td className="text-fg-secondary">{h.type}</Td>
                <Td className="font-semibold text-fg">{h.world}</Td>
                <Td className="text-fg-secondary max-w-xs"><span className="line-clamp-1">{h.reason}</span></Td>
                <Td mono className="text-fg-muted text-[12px]/[1.45]">{h.dates}</Td>
                <Td><StatusBadge status={h.status} /></Td>
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
    </div>
  );
};

export default WorldManagementPage;
