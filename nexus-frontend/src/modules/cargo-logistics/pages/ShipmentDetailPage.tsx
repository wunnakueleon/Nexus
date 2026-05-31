import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingState from '../../../shared/components/LoadingState';
import { Field, Textarea } from '../../../shared/components/Field';
import Icon from '../../../shared/components/Icon';
import Modal from '../../../shared/components/Modal';
import SectionLabel from '../../../shared/components/SectionLabel';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import WorldBadge from '../../../shared/components/WorldBadge';
import type { Shipment } from '../../../shared/types/shared.types';
import {
  addFlag as apiAddFlag,
  advanceShipment as apiAdvance,
  deliverShipment as apiDeliver,
  getShipment,
} from '../apis/shipment.api';
import type { ShipmentDetail } from '../types/cargo-logistics.types';

// Matches seed creation order — update if DB is re-seeded with different IDs
const WORLD_BY_ID: Record<number, string> = { 1: 'GLV', 2: 'NPT', 3: 'MNU', 4: 'WNM' };

const STATUS_LABEL: Record<string, string> = {
  preparing: 'Preparing', departed: 'Departed', in_transit: 'In Transit',
  delivered: 'Delivered', delayed: 'Delayed', cancelled: 'Cancelled',
};

const DISPLAY_STEPS = ['Created', 'Preparing', 'Departed', 'In Transit', 'Delivered'];
const API_STEPS     = ['',        'preparing', 'departed', 'in_transit', 'delivered'];

// Carries the human-readable shipmentCode alongside the numeric id used for routing
type DetailView = Shipment & { code: string };

function adaptDetail(s: ShipmentDetail): DetailView {
  const tsByStatus: Record<string, string> = {};
  for (const t of s.timeline) tsByStatus[t.status] = t.timestamp;
  const curIdx = Math.max(API_STEPS.indexOf(s.status), 0);

  return {
    id: String(s.id),
    code: s.shipmentCode,
    origin: WORLD_BY_ID[s.originWorldId] ?? String(s.originWorldId),
    dest: WORLD_BY_ID[s.destinationWorldId] ?? String(s.destinationWorldId),
    status: STATUS_LABEL[s.status] ?? s.status,
    departure: s.scheduledDeparture ?? 'TBD',
    eta: s.estimatedArrival ?? 'TBD',
    flagged: s.flags.length > 0,
    manifest: s.items.map(i => ({ res: i.resourceType, qty: i.quantity, notes: i.conditionNotes ?? '' })),
    timeline: DISPLAY_STEPS.map((step, i) => ({
      step,
      ts: tsByStatus[API_STEPS[i]] ?? null,
      done: i < curIdx,
      current: i === curIdx,
    })),
    flags: s.flags.map(f => ({
      desc: f.description,
      ts: new Date(f.createdAt).toLocaleString(),
      by: `Officer #${f.reportedByUserId}`,
    })),
    ref: s.tradeRequestId ? String(s.tradeRequestId) : null,
  };
}

const dirOf = (sh: Shipment, mine: string) => sh.origin === mine ? 'OUTBOUND' : 'INBOUND';
const BASE = '/cargo-logistics';

const ShipmentDetailPage: React.FC = () => {
  const { operator, flash } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mine = operator?.worldId ?? '';

  const numericId = Number(id);
  const isApiId = Number.isInteger(numericId) && numericId > 0;

  const [shipment, setShipment] = useState<DetailView | null>(null);
  // Start loading only for a valid id; an invalid id is "not found" immediately,
  // so the effect never needs to set loading synchronously.
  const [loading, setLoading] = useState(isApiId);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagText, setFlagText] = useState('');

  const load = useCallback(() => {
    if (!isApiId) return;
    getShipment(numericId)
      .then(data => setShipment(adaptDetail(data)))
      .catch(() => setShipment(null))
      .finally(() => setLoading(false));
  }, [isApiId, numericId]);

  useEffect(() => { load(); }, [load]);

  // If another officer advances/flags this shipment while it's open, the route,
  // timeline and flags refresh in place. (Filtering by this id isn't needed —
  // re-pulling the open shipment is cheap and always correct.)
  useSocketEvent(SOCKET_EVENTS.ShipmentUpdated, load);

  const handleAdvance = async () => {
    try {
      setShipment(adaptDetail(await apiAdvance(numericId)));
    } catch {
      flash('Failed to advance shipment status.');
    }
  };

  const handleDeliver = async () => {
    try {
      setShipment(adaptDetail(await apiDeliver(numericId)));
    } catch {
      flash('Failed to confirm delivery.');
    }
  };

  const handleFlag = async () => {
    if (!flagText.trim()) return;
    try {
      await apiAddFlag(numericId, { flagType: 'other', description: flagText.trim() });
      setShipment(adaptDetail(await getShipment(numericId)));
      setFlagOpen(false);
      setFlagText('');
    } catch {
      flash('Failed to record flag.');
    }
  };

  if (loading) return <LoadingState text="Loading shipment…" />;
  if (!shipment) return <EmptyState icon="cargo" text="Shipment not found." />;
  const dir = dirOf(shipment, mine);
  const outbound = dir === 'OUTBOUND';

  return (
    <div>
      <button onClick={() => navigate(`${BASE}/shipments`)}
        className="flex items-center gap-1.5 text-[12px]/[1.45] font-semibold nx-uppercase text-fg-secondary hover:text-fg mb-4">
        <Icon name="chevron" size={14} className="rotate-180" />Shipment Board
      </button>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-mono font-semibold text-fg">{shipment.code}</h1>
          <StatusBadge status={shipment.status} pulse={shipment.status === 'Delayed'} />
          <StatusBadge status={dir} />
        </div>
        <div className="flex gap-2">
          {outbound ? (
            <>
              <Button variant="primary" icon="arrow" disabled={shipment.status === 'Delivered'} onClick={handleAdvance}>Advance Status</Button>
              <Button variant="danger" icon="flag" onClick={() => setFlagOpen(true)}>Add Flag</Button>
            </>
          ) : (
            <>
              <Button variant="solid" icon="check" disabled={shipment.status === 'Delivered'} onClick={handleDeliver}>Confirm Delivery</Button>
              <Button variant="danger" icon="flag" onClick={() => setFlagOpen(true)}>Report Issue</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          <Card className="p-4">
            <SectionLabel>Route</SectionLabel>
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <WorldBadge worldId={shipment.origin} />
                <div className="text-[11px]/[1.45] font-mono text-fg-muted mt-2">Depart {shipment.departure}</div>
              </div>
              <div className="flex-1 max-w-[180px] flex items-center">
                <span className="flex-1 h-px bg-line-hover" />
                <Icon name="cargo" size={16} className="text-amber mx-2" />
                <span className="flex-1 h-px bg-line-hover" />
              </div>
              <div className="text-center">
                <WorldBadge worldId={shipment.dest} />
                <div className="text-[11px]/[1.45] font-mono text-fg-muted mt-2">ETA {shipment.eta}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <SectionLabel>Manifest</SectionLabel>
            <Table headers={['Resource', { label: 'Quantity', align: 'right' }, 'Condition Notes']}>
              {shipment.manifest.map((m, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <Td className="text-fg">{m.res}</Td>
                  <Td mono align="right" className="text-fg">{m.qty.toLocaleString()}</Td>
                  <Td className="text-fg-secondary text-[13px]/[1.5]">{m.notes}</Td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card className="p-4">
            <SectionLabel>Flags</SectionLabel>
            {shipment.flags.length === 0
              ? <p className="text-sm text-fg-muted">No issues reported.</p>
              : <div className="space-y-2">
                {shipment.flags.map((f, i) => (
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

        <Card className="p-4 h-fit">
          <SectionLabel>Status Timeline</SectionLabel>
          <div className="relative">
            {shipment.timeline.map((t, i) => (
              <div key={t.step} className="flex gap-3 pb-5 last:pb-0 relative">
                {i < shipment.timeline.length - 1 && (
                  <span className="absolute left-[5px] top-3 bottom-0 w-px" style={{ background: t.done ? '#D4890A' : '#2A3040' }} />
                )}
                <span className={`w-[11px] h-[11px] rounded-sm shrink-0 mt-1 relative z-10 ${t.done ? 'bg-amber' : t.current ? 'bg-amber animate-pulse-dot' : 'border border-line bg-bg-secondary'}`} />
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
              <Button variant="danger" disabled={!flagText.trim()} onClick={handleFlag}>
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
