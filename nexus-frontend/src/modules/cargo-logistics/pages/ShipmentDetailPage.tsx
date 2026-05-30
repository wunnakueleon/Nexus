import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import { Field, Textarea } from '../../../shared/components/Field';
import Icon from '../../../shared/components/Icon';
import Modal from '../../../shared/components/Modal';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import WorldBadge from '../../../shared/components/WorldBadge';
import type { Shipment } from '../../../shared/types/shared.types';

const dirOf = (sh: Shipment, mine: string) => sh.origin === mine ? 'OUTBOUND' : 'INBOUND';
const BASE = '/cargo-logistics';

const ShipmentDetailPage: React.FC = () => {
  const { shipments, operator, advanceShipment, confirmDelivery, addFlag } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mine = operator.worldId ?? '';
  const s = shipments.find(x => x.id === id);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagText, setFlagText] = useState('');

  if (!s) return <EmptyState icon="cargo" text="Shipment not found." />;
  const dir = dirOf(s, mine);
  const outbound = dir === 'OUTBOUND';

  return (
    <div>
      <button onClick={() => navigate(`${BASE}/shipments`)}
        className="flex items-center gap-1.5 text-[12px]/[1.45] font-semibold nx-uppercase text-fg-secondary hover:text-fg mb-4">
        <Icon name="chevron" size={14} className="rotate-180" />Shipment Board
      </button>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-mono font-semibold text-fg">{s.id}</h1>
          <StatusBadge status={s.status} pulse={s.status === 'Delayed'} />
          <StatusBadge status={dir} />
        </div>
        <div className="flex gap-2">
          {outbound ? (
            <>
              <Button variant="primary" icon="arrow" disabled={s.status === 'Delivered'} onClick={() => advanceShipment(s.id)}>Advance Status</Button>
              <Button variant="danger" icon="flag" onClick={() => setFlagOpen(true)}>Add Flag</Button>
            </>
          ) : (
            <>
              <Button variant="solid" icon="check" disabled={s.status === 'Delivered'} onClick={() => confirmDelivery(s.id)}>Confirm Delivery</Button>
              <Button variant="danger" icon="flag" onClick={() => setFlagOpen(true)}>Report Issue</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          {/* Route */}
          <Card className="p-4">
            <SectionLabel>Route</SectionLabel>
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <WorldBadge worldId={s.origin} />
                <div className="text-[11px]/[1.45] font-mono text-fg-muted mt-2">Depart {s.departure}</div>
              </div>
              <div className="flex-1 max-w-[180px] flex items-center">
                <span className="flex-1 h-px bg-line-hover" />
                <Icon name="cargo" size={16} className="text-amber mx-2" />
                <span className="flex-1 h-px bg-line-hover" />
              </div>
              <div className="text-center">
                <WorldBadge worldId={s.dest} />
                <div className="text-[11px]/[1.45] font-mono text-fg-muted mt-2">ETA {s.eta}</div>
              </div>
            </div>
          </Card>

          {/* Manifest */}
          <Card className="p-4">
            <SectionLabel>Manifest</SectionLabel>
            <Table headers={['Resource', { label: 'Quantity', align: 'right' }, 'Condition Notes']}>
              {s.manifest.map((m, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <Td className="text-fg">{m.res}</Td>
                  <Td mono align="right" className="text-fg">{m.qty.toLocaleString()}</Td>
                  <Td className="text-fg-secondary text-[13px]/[1.5]">{m.notes}</Td>
                </tr>
              ))}
            </Table>
          </Card>

          {/* Flags */}
          <Card className="p-4">
            <SectionLabel>Flags</SectionLabel>
            {s.flags.length === 0
              ? <p className="text-sm text-fg-muted">No issues reported.</p>
              : <div className="space-y-2">
                {s.flags.map((f, i) => (
                  <div key={i} className="flex gap-3 bg-critical-dim border border-critical/30 rounded p-3">
                    <Icon name="flag" size={15} className="text-critical shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[13px]/[1.5] text-fg">{f.desc}</div>
                      <div className="text-[11px]/[1.45] font-mono text-fg-muted mt-1">{f.ts} · {f.by}</div>
                    </div>
                  </div>
                ))}
              </div>}
          </Card>
        </div>

        {/* Timeline */}
        <Card className="p-4 h-fit">
          <SectionLabel>Status Timeline</SectionLabel>
          <div className="relative">
            {s.timeline.map((t, i) => (
              <div key={t.step} className="flex gap-3 pb-5 last:pb-0 relative">
                {i < s.timeline.length - 1 && (
                  <span className="absolute left-[5px] top-3 bottom-0 w-px" style={{ background: t.done ? '#D4890A' : '#2A3040' }} />
                )}
                <span className={`w-[11px] h-[11px] rounded-sm shrink-0 mt-1 relative z-10 ${t.done ? 'bg-amber' : t.current ? 'bg-amber animate-pulse-dot' : 'border border-line bg-bg-secondary'
                  }`} />
                <div>
                  <div className={`text-[13px]/[1.5] ${t.done || t.current ? 'text-fg' : 'text-fg-muted'} ${t.current ? 'font-bold' : ''}`}>{t.step}</div>
                  <div className="text-[11px]/[1.45] font-mono text-fg-muted">{t.ts ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {flagOpen && (
        <Modal
          title={outbound ? 'Add Flag' : 'Report Issue'}
          onClose={() => setFlagOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setFlagOpen(false)}>Cancel</Button>
              <Button variant="danger" disabled={!flagText.trim()}
                onClick={() => {
                  addFlag(s.id, flagText.trim(), `${mine} Transit`);
                  setFlagOpen(false);
                  setFlagText('');
                }}>
                Record Flag
              </Button>
            </>
          }
        >
          <Field label="Issue Description">
            <Textarea rows={3} value={flagText} onChange={e => setFlagText(e.target.value)} placeholder="Describe the disruption or condition..." />
          </Field>
        </Modal>
      )}
    </div>
  );
};

export default ShipmentDetailPage;
