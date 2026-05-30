import React, { useState } from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import Tabs from '../../../shared/components/Tabs';
import WorldBadge from '../../../shared/components/WorldBadge';
import type { TradeItemRef } from '../../../shared/types/shared.types';
import ItemThumb from '../components/ItemThumb';

interface PairProps {
  leftLabel: string;
  left: TradeItemRef;
  leftWorld?: string;
  rightLabel: string;
  right: TradeItemRef;
  rightWorld?: string;
}

const Pair: React.FC<PairProps> = ({ leftLabel, left, leftWorld, rightLabel, right, rightWorld }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
    <div>
      <div className="text-[10px]/[1.45] nx-uppercase text-fg-muted mb-1.5">{leftLabel}</div>
      <div className="flex items-center gap-2.5">
        <ItemThumb icon={left.icon} size="sm" />
        <div>
          <div className="text-[13px]/[1.5] font-semibold text-fg line-clamp-1">{left.title}</div>
          {leftWorld && <div className="mt-0.5"><WorldBadge worldId={leftWorld} size="sm" /></div>}
        </div>
      </div>
    </div>
    <Icon name="arrow" size={16} className="text-fg-muted" />
    <div>
      <div className="text-[10px]/[1.45] nx-uppercase text-fg-muted mb-1.5">{rightLabel}</div>
      <div className="flex items-center gap-2.5">
        <ItemThumb icon={right.icon} size="sm" />
        <div>
          <div className="text-[13px]/[1.5] font-semibold text-fg line-clamp-1">{right.title}</div>
          {rightWorld && <div className="mt-0.5"><WorldBadge worldId={rightWorld} size="sm" /></div>}
        </div>
      </div>
    </div>
  </div>
);

const MyTradesPage: React.FC = () => {
  const { offers, respondOffer, withdrawOffer } = useApp();
  const [tab, setTab] = useState('incoming');
  const incoming  = offers.filter(o => o.dir === 'incoming');
  const outgoing  = offers.filter(o => o.dir === 'outgoing');
  const completed = offers.filter(o => o.dir === 'completed');
  const tabs = [
    { id: 'incoming',  label: 'Incoming Offers', count: incoming.length },
    { id: 'outgoing',  label: 'Outgoing Offers', count: outgoing.length },
    { id: 'completed', label: 'Completed',        count: completed.length },
  ];

  return (
    <div>
      <PageHeader title="My Trades" sub="Barter offers you've sent and received." />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="mt-5 space-y-3">
        {tab === 'incoming' && (
          incoming.length === 0
            ? <Card><EmptyState icon="market" text="No incoming offers." /></Card>
            : incoming.map(o => o.theirItem && o.yourItem && (
                <Card key={o.id} className="p-4">
                  <Pair leftLabel="They offer" left={o.theirItem} leftWorld={o.theirItem.world} rightLabel="For your" right={o.yourItem} />
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                    <span className="text-[12px]/[1.45] font-mono text-fg-muted">{o.date}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" icon="check" onClick={() => respondOffer(o.id, 'accept')}>Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => respondOffer(o.id, 'decline')}>Decline</Button>
                    </div>
                  </div>
                </Card>
              ))
        )}
        {tab === 'outgoing' && (
          outgoing.length === 0
            ? <Card><EmptyState icon="market" text="No outgoing offers." /></Card>
            : outgoing.map(o => o.yourItem && o.theirItem && (
                <Card key={o.id} className="p-4">
                  <Pair leftLabel="You offered" left={o.yourItem} rightLabel="For their" right={o.theirItem} rightWorld={o.theirItem.world} />
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                    <StatusBadge status={o.status} />
                    {o.status === 'Pending' && (
                      <Button size="sm" variant="danger" onClick={() => withdrawOffer(o.id)}>Withdraw</Button>
                    )}
                  </div>
                </Card>
              ))
        )}
        {tab === 'completed' && (
          completed.length === 0
            ? <Card><EmptyState icon="market" text="No completed trades." /></Card>
            : completed.map(o => o.gave && o.got && (
                <Card key={o.id} className="p-4">
                  <Pair leftLabel="You gave" left={o.gave} rightLabel="You received" right={o.got} />
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line">
                    <span className="text-[12px]/[1.45] text-fg-muted nx-uppercase">Partner</span>
                    <span className="text-[13px]/[1.5] text-fg">{o.partner}</span>
                    {o.world && <WorldBadge worldId={o.world} size="sm" />}
                    <span className="text-[12px]/[1.45] font-mono text-fg-muted ml-auto">{o.date}</span>
                  </div>
                </Card>
              ))
        )}
      </div>
    </div>
  );
};

export default MyTradesPage;
