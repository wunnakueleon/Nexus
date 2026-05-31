import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import WorldBadge from '../../../shared/components/WorldBadge';
import type { Shipment } from '../../../shared/types/shared.types';
import { getShipments } from '../apis/shipment.api';
import type { ShipmentSummary } from '../types/cargo-logistics.types';

// Matches seed creation order — update if DB is re-seeded with different IDs
const WORLD_BY_ID: Record<number, string> = { 1: 'GLV', 2: 'NPT', 3: 'MNU', 4: 'WNM' };
const WORLD_CODE_TO_ID: Record<string, number> = { GLV: 1, NPT: 2, MNU: 3, WNM: 4 };

const STATUS_LABEL: Record<string, string> = {
  preparing: 'Preparing', departed: 'Departed', in_transit: 'In Transit',
  delivered: 'Delivered', delayed: 'Delayed', cancelled: 'Cancelled',
};

// Carries the human-readable shipmentCode alongside the numeric id used for routing
type BoardRow = Shipment & { code: string };

function adaptSummary(s: ShipmentSummary): BoardRow {
  return {
    id: String(s.id),
    code: s.shipmentCode,
    origin: WORLD_BY_ID[s.originWorldId] ?? String(s.originWorldId),
    dest: WORLD_BY_ID[s.destinationWorldId] ?? String(s.destinationWorldId),
    status: STATUS_LABEL[s.status] ?? s.status,
    departure: s.scheduledDeparture ?? 'TBD',
    eta: s.estimatedArrival ?? 'TBD',
    flagged: false,
    manifest: s.items.map(i => ({ res: i.resourceType, qty: i.quantity, notes: i.conditionNotes ?? '' })),
    timeline: [],
    flags: [],
    ref: null,
  };
}

const SHIP_STATUSES = ['All', 'Preparing', 'Departed', 'In Transit', 'Delivered', 'Delayed'];
const dirOf = (sh: Shipment, mine: string) => sh.origin === mine ? 'OUTBOUND' : 'INBOUND';
const BASE = '/cargo-logistics';

const ShipmentBoardPage: React.FC = () => {
  const { operator } = useApp();
  const navigate = useNavigate();
  const mine = operator.worldId ?? '';
  const [filter, setFilter] = useState('All');
  const [shipments, setShipments] = useState<BoardRow[]>([]);

  const load = useCallback(() => {
    getShipments(undefined, WORLD_CODE_TO_ID[mine])
      .then(data => setShipments(data.map(adaptSummary)))
      .catch(() => setShipments([]));
  }, [mine]);

  useEffect(() => { load(); }, [load]);

  // Any shipment created/advanced/delivered/cancelled/flagged refreshes the
  // board; client-side filtering keeps only rows touching this world.
  useSocketEvent(SOCKET_EVENTS.ShipmentUpdated, load);

  const list = shipments.filter(s =>
    (s.origin === mine || s.dest === mine) &&
    (filter === 'All' || s.status === filter),
  );

  return (
    <div>
      <PageHeader title="Shipment Board" sub="All cargo moving to and from your world." />
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {SHIP_STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-[11px]/[1.45] font-semibold nx-uppercase px-3 py-1.5 rounded border whitespace-nowrap transition-colors ${filter === s ? 'border-amber text-amber bg-amber/10' : 'border-line text-fg-secondary hover:border-line-hover'}`}>
            {s}
          </button>
        ))}
      </div>
      <Card>
        {list.length === 0
          ? <EmptyState icon="cargo" text="No shipments in this state." />
          : <>
            {/* Desktop / tablet: table (scrolls horizontally if it ever overflows) */}
            <div className="hidden md:block px-3 pb-1 overflow-x-auto">
              <Table headers={['Shipment ID', 'Dir', 'Route', 'Contents', { label: 'Departed' }, { label: 'ETA' }, 'Status', { label: '', w: '24px' }]}>
                {list.map(s => (
                  <tr key={s.id} onClick={() => navigate(`${BASE}/shipments/${s.id}`)}
                    className="border-b border-line last:border-0 hover:bg-bg-tertiary/50 cursor-pointer">
                    <Td mono className="text-fg font-medium whitespace-nowrap">{s.code}</Td>
                    <Td><StatusBadge status={dirOf(s, mine)} /></Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <WorldBadge worldId={s.origin} size="sm" dot={false} />
                        <Icon name="arrow" size={12} className="text-fg-muted" />
                        <WorldBadge worldId={s.dest} size="sm" dot={false} />
                      </div>
                    </Td>
                    <Td className="text-fg-secondary text-[13px]/[1.5]">
                      <span className="line-clamp-1">{s.manifest.map(m => `${m.qty} ${m.res}`).join(', ')}</span>
                    </Td>
                    <Td mono className="text-fg-muted text-[12px]/[1.45] whitespace-nowrap">{s.departure}</Td>
                    <Td mono className="text-fg-muted text-[12px]/[1.45] whitespace-nowrap">{s.eta}</Td>
                    <Td><StatusBadge status={s.status} pulse={s.status === 'Delayed'} /></Td>
                    <Td>
                      {s.flagged && <span className="w-2 h-2 rounded-sm bg-critical inline-block animate-pulse-crit" />}
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="md:hidden divide-y divide-line">
              {list.map(s => (
                <button key={s.id} onClick={() => navigate(`${BASE}/shipments/${s.id}`)}
                  className="w-full text-left p-4 hover:bg-bg-tertiary/50 cursor-pointer">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-sm text-fg font-medium truncate">{s.code}</span>
                      {s.flagged && <span className="w-2 h-2 rounded-sm bg-critical inline-block shrink-0 animate-pulse-crit" />}
                    </div>
                    <StatusBadge status={s.status} pulse={s.status === 'Delayed'} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <WorldBadge worldId={s.origin} size="sm" dot={false} />
                    <Icon name="arrow" size={12} className="text-fg-muted" />
                    <WorldBadge worldId={s.dest} size="sm" dot={false} />
                    <StatusBadge status={dirOf(s, mine)} />
                  </div>
                  {s.manifest.length > 0 && (
                    <div className="text-fg-secondary text-[13px]/[1.5] line-clamp-1 mb-1.5">
                      {s.manifest.map(m => `${m.qty} ${m.res}`).join(', ')}
                    </div>
                  )}
                  <div className="flex gap-4 text-[12px]/[1.45] font-mono text-fg-muted">
                    <span>Dep {s.departure}</span>
                    <span>ETA {s.eta}</span>
                  </div>
                </button>
              ))}
            </div>
          </>}
      </Card>
    </div>
  );
};

export default ShipmentBoardPage;
