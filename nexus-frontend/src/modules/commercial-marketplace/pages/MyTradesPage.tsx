import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';
import LoadingState from '../../../shared/components/LoadingState';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import Tabs from '../../../shared/components/Tabs';
import ItemThumb from '../components/ItemThumb';
import {
  getIncomingOffers, getOutgoingOffers, getCompletedOffers,
  acceptOffer, declineOffer, withdrawOffer,
} from '../apis/trade-offer.api';
import type { TradeOfferResponse, ListingResponse } from '../types/commercial-marketplace.types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', accepted: 'Accepted', declined: 'Declined', withdrawn: 'Withdrawn',
};

const SHIPMENT_LABEL: Record<string, string> = {
  preparing: 'Preparing', departed: 'Departed', in_transit: 'In Transit',
  delivered: 'Delivered', delayed: 'Delayed', cancelled: 'Cancelled',
};

// An accepted trade stays "Active" while its delivery shipment is still moving.
// Once delivered (or cancelled), it settles into History.
const isActiveTrade = (o: TradeOfferResponse) =>
  !!o.shipment && o.shipment.status !== 'delivered' && o.shipment.status !== 'cancelled';

const WorldTag: React.FC<{ name: string; color: string }> = ({ name, color }) => (
  <span className="inline-flex items-center gap-1.5 rounded text-[10px]/[1.45] font-semibold px-1.5 py-0.5"
    style={{ color, background: color + '22' }}>
    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: color }} />
    {name}
  </span>
);

interface PairProps {
  leftLabel: string;
  left: ListingResponse;
  leftWorld?: { name: string; color: string };
  rightLabel: string;
  right: ListingResponse;
  rightWorld?: { name: string; color: string };
}

const Pair: React.FC<PairProps> = ({ leftLabel, left, leftWorld, rightLabel, right, rightWorld }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
    <div>
      <div className="text-[10px]/[1.45] nx-uppercase text-fg-muted mb-1.5">{leftLabel}</div>
      <div className="flex items-center gap-2.5">
        <ItemThumb icon={left.category} imageUrl={left.images[0]?.imageUrl} size="sm" />
        <div>
          <div className="text-[13px]/[1.5] font-semibold text-fg line-clamp-1">{left.title}</div>
          {leftWorld && <div className="mt-0.5"><WorldTag name={leftWorld.name} color={leftWorld.color} /></div>}
        </div>
      </div>
    </div>
    <Icon name="arrow" size={16} className="text-fg-muted" />
    <div>
      <div className="text-[10px]/[1.45] nx-uppercase text-fg-muted mb-1.5">{rightLabel}</div>
      <div className="flex items-center gap-2.5">
        <ItemThumb icon={right.category} imageUrl={right.images[0]?.imageUrl} size="sm" />
        <div>
          <div className="text-[13px]/[1.5] font-semibold text-fg line-clamp-1">{right.title}</div>
          {rightWorld && <div className="mt-0.5"><WorldTag name={rightWorld.name} color={rightWorld.color} /></div>}
        </div>
      </div>
    </div>
  </div>
);

const MyTradesPage: React.FC = () => {
  const { flash } = useApp();
  const [tab, setTab] = useState('incoming');

  const [incoming, setIncoming] = useState<TradeOfferResponse[]>([]);
  const [outgoing, setOutgoing] = useState<TradeOfferResponse[]>([]);
  const [accepted, setAccepted] = useState<TradeOfferResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Accepted trades are split by their delivery shipment's status into the
  // Active (in transit) and History (delivered/settled) tabs.
  const active = accepted.filter(isActiveTrade);
  const history = accepted.filter(o => !isActiveTrade(o));

  // Load all lists at once so every tab count is correct immediately. State is
  // only set inside the promise callbacks (never synchronously), so the mount
  // effect doesn't trigger a cascading render; `loading` starts true.
  const load = useCallback(() => {
    Promise.all([getIncomingOffers(), getOutgoingOffers(), getCompletedOffers()])
      .then(([inc, out, done]) => {
        setIncoming(Array.isArray(inc) ? inc : []);
        setOutgoing(Array.isArray(out) ? out : []);
        setAccepted(Array.isArray(done) ? done : []);
      })
      .catch(() => flash('Failed to load offers'))
      .finally(() => setLoading(false));
  }, [flash]);

  useEffect(() => { load(); }, [load]);

  // A new incoming offer, or the counterparty resolving one, refreshes all
  // tabs (incoming/outgoing/active/history) and their counts in real time.
  useSocketEvent(SOCKET_EVENTS.OfferUpdated, () => load());

  const handleAccept = async (id: number) => {
    try {
      const updated = await acceptOffer(id);
      // Remove from incoming, add to the accepted pool. Its freshly created
      // delivery shipment starts "preparing", so it lands in the Active tab.
      setIncoming(prev => prev.filter(o => o.id !== id));
      setAccepted(prev => [updated, ...prev]);
      flash('Offer accepted');
    } catch { flash('Failed to accept offer'); }
  };

  const handleDecline = async (id: number) => {
    try {
      await declineOffer(id);
      // declined offer disappears from incoming; it won't appear in completed
      setIncoming(prev => prev.filter(o => o.id !== id));
      flash('Offer declined');
    } catch { flash('Failed to decline offer'); }
  };

  const handleWithdraw = async (id: number) => {
    try {
      const updated = await withdrawOffer(id);
      // update status in place — stays in history as "Withdrawn"
      setOutgoing(prev => prev.map(o => o.id === id ? updated : o));
      flash('Offer withdrawn');
    } catch { flash('Failed to withdraw offer'); }
  };

  const tabs = [
    { id: 'incoming', label: 'Incoming Offers', count: incoming.length },
    { id: 'outgoing', label: 'Outgoing Offers', count: outgoing.length },
    { id: 'active',   label: 'Active',          count: active.length },
    { id: 'history',  label: 'History',         count: history.length },
  ];

  return (
    <div>
      <PageHeader title="My Trades" sub="Barter offers you've sent and received." />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="mt-5 space-y-3">
        {loading && <LoadingState />}

        {!loading && tab === 'incoming' && (
          incoming.length === 0
            ? <Card><EmptyState icon="market" text="No incoming offers." /></Card>
            : incoming.map(o => (
                <Card key={o.id} className="p-4">
                  <Pair
                    leftLabel="They offer" left={o.offeredListing}
                    leftWorld={{ name: o.buyer.world.name, color: o.buyer.world.colorHex }}
                    rightLabel="For your" right={o.listing}
                  />
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                    <span className="text-[12px]/[1.45] font-mono text-fg-muted">{new Date(o.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" icon="check" onClick={() => handleAccept(o.id)}>Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDecline(o.id)}>Decline</Button>
                    </div>
                  </div>
                </Card>
              ))
        )}

        {!loading && tab === 'outgoing' && (
          outgoing.length === 0
            ? <Card><EmptyState icon="market" text="No outgoing offers." /></Card>
            : outgoing.map(o => (
                <Card key={o.id} className="p-4">
                  <Pair
                    leftLabel="You offered" left={o.offeredListing}
                    rightLabel="For their" right={o.listing}
                    rightWorld={{ name: o.seller.world.name, color: o.seller.world.colorHex }}
                  />
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                    <StatusBadge status={STATUS_LABEL[o.status] ?? o.status} />
                    {o.status === 'pending' && (
                      <Button size="sm" variant="danger" onClick={() => handleWithdraw(o.id)}>Withdraw</Button>
                    )}
                  </div>
                </Card>
              ))
        )}

        {!loading && tab === 'active' && (
          active.length === 0
            ? <Card><EmptyState icon="cargo" text="No active trades." sub="Accepted trades in transit will appear here." /></Card>
            : active.map(o => (
                <Card key={o.id} className="p-4">
                  <Pair leftLabel="You gave" left={o.offeredListing} rightLabel="You received" right={o.listing} />
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line">
                    <span className="text-[12px]/[1.45] text-fg-muted nx-uppercase">Delivery</span>
                    {o.shipment && (
                      <>
                        <StatusBadge
                          status={SHIPMENT_LABEL[o.shipment.status] ?? o.shipment.status}
                          pulse={o.shipment.status === 'delayed'}
                        />
                        <span className="text-[12px]/[1.45] font-mono text-fg-muted">{o.shipment.shipmentCode}</span>
                      </>
                    )}
                    <span className="text-[12px]/[1.45] font-mono text-fg-muted ml-auto">
                      {o.resolvedAt ? new Date(o.resolvedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </Card>
              ))
        )}

        {!loading && tab === 'history' && (
          history.length === 0
            ? <Card><EmptyState icon="market" text="No completed trades." sub="Delivered trades will settle here." /></Card>
            : history.map(o => (
                <Card key={o.id} className="p-4">
                  <Pair leftLabel="You gave" left={o.offeredListing} rightLabel="You received" right={o.listing} />
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line">
                    <span className="text-[12px]/[1.45] text-fg-muted nx-uppercase">Partner</span>
                    <span className="text-[13px]/[1.5] text-fg">{o.seller.name}</span>
                    <WorldTag name={o.seller.world.name} color={o.seller.world.colorHex} />
                    <span className="text-[12px]/[1.45] font-mono text-fg-muted ml-auto">
                      {o.resolvedAt ? new Date(o.resolvedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </Card>
              ))
        )}
      </div>
    </div>
  );
};

export default MyTradesPage;
