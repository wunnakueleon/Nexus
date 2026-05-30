import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import { Field, Textarea } from '../../../shared/components/Field';
import Icon from '../../../shared/components/Icon';
import Modal from '../../../shared/components/Modal';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import Tabs from '../../../shared/components/Tabs';
import WorldBadge from '../../../shared/components/WorldBadge';
import type { Trade } from '../../../shared/types/shared.types';

// ---- RespondModal ----------------------------------------------------------
interface RespondModalProps {
  trade: Trade;
  action: 'accept' | 'decline';
  onClose: () => void;
}

const RespondModal: React.FC<RespondModalProps> = ({ trade, action, onClose }) => {
  const { respondTrade } = useApp();
  const [comment, setComment] = useState('');
  const accept = action === 'accept';
  return (
    <Modal
      title={accept ? 'Accept Trade' : 'Decline Trade'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant={accept ? 'solid' : 'danger'}
            onClick={() => { respondTrade(trade.id, action, comment); onClose(); }}
          >
            {accept ? 'Confirm Accept' : 'Confirm Decline'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-fg-secondary mb-4">
        {accept
          ? 'Accepting will lock this exchange and auto-generate a shipment in Cargo Logistics.'
          : 'Declining is final and will be recorded permanently.'}
      </p>
      <Field label="Comment (optional)" hint="recorded once with this decision — not a conversation">
        <Textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add context for your decision..." />
      </Field>
    </Modal>
  );
};

// ---- TradeBody -------------------------------------------------------------
const TradeBody: React.FC<{ trade: Trade }> = ({ trade }) => (
  <div className="grid grid-cols-2 gap-3 mb-3">
    <div className="bg-bg-input border border-line rounded p-3">
      <div className="text-[11px]/[1.45] nx-uppercase text-fg-muted mb-1">They want</div>
      <div className="font-mono text-sm text-fg">
        {trade.wantQty.toLocaleString()} <span className="text-fg-secondary">{trade.wantRes}</span>
      </div>
    </div>
    <div className="bg-bg-input border border-line rounded p-3">
      <div className="text-[11px]/[1.45] nx-uppercase text-fg-muted mb-1">They offer</div>
      <div className="font-mono text-sm text-fg">
        {trade.offerQty.toLocaleString()} <span className="text-fg-secondary">{trade.offerRes}</span>
      </div>
    </div>
  </div>
);

// ---- TradeDashboard --------------------------------------------------------
interface TradeModal {
  trade: Trade;
  action: 'accept' | 'decline';
}

const TradeDashboardPage: React.FC = () => {
  const { trades, operator, cancelTrade, fulfillTrade } = useApp();
  const navigate = useNavigate();
  const mine = operator.worldId ?? '';

  const incoming = trades.filter(t => t.to === mine && t.status === 'Pending');
  const outgoing = trades.filter(t => t.from === mine);
  const active   = trades.filter(t => (t.from === mine || t.to === mine) && t.status === 'Accepted');
  const history  = trades.filter(t => (t.from === mine || t.to === mine) && ['Declined', 'Fulfilled'].includes(t.status));

  const [tab, setTab] = useState('incoming');
  const [modal, setModal] = useState<TradeModal | null>(null);

  const tabs = [
    { id: 'incoming', label: 'Incoming',     count: incoming.length },
    { id: 'outgoing', label: 'Outgoing',     count: outgoing.length },
    { id: 'active',   label: 'Active Trades',count: active.length },
    { id: 'history',  label: 'History',      count: history.length },
  ];

  return (
    <div>
      <PageHeader
        title="Trade Dashboard"
        sub="Resource exchange requests to and from your world."
        actions={
          <Button variant="primary" icon="plus" onClick={() => navigate('/resource-exchange/trade/new')}>
            New Request
          </Button>
        }
      />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="mt-5">

        {/* Incoming */}
        {tab === 'incoming' && (
          incoming.length === 0
            ? <Card><EmptyState icon="resource" text="No incoming requests." /></Card>
            : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {incoming.map(t => (
                  <Card key={t.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <WorldBadge worldId={t.from} size="sm" />
                        <span className="text-fg-muted">requests from you</span>
                      </div>
                      <StatusBadge status={t.urgency} pulse={t.urgency === 'Critical'} />
                    </div>
                    <TradeBody trade={t} />
                    {t.comment && (
                      <p className="text-[13px]/[1.5] text-fg-secondary italic border-l-2 border-line pl-3 mb-3">"{t.comment}"</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[12px]/[1.45] font-mono text-fg-muted">{t.date}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" icon="check" onClick={() => setModal({ trade: t, action: 'accept' })}>Accept</Button>
                        <Button size="sm" variant="ghost" onClick={() => setModal({ trade: t, action: 'decline' })}>Decline</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
        )}

        {/* Outgoing */}
        {tab === 'outgoing' && (
          outgoing.length === 0
            ? <Card><EmptyState icon="resource" text="No outgoing requests." /></Card>
            : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {outgoing.map(t => (
                  <Card key={t.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-fg-muted">request to</span>
                        <WorldBadge worldId={t.to} size="sm" />
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    <TradeBody trade={t} />
                    {['Accepted', 'Declined'].includes(t.status) && t.responderComment && (
                      <p className="text-[13px]/[1.5] text-fg-secondary italic border-l-2 border-line pl-3 mb-3">
                        <span className="not-italic text-fg-muted nx-uppercase text-[10px]/[1.45] block mb-0.5">Response</span>
                        "{t.responderComment}"
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[12px]/[1.45] font-mono text-fg-muted">{t.date}</span>
                      {t.status === 'Pending' && (
                        <Button size="sm" variant="danger" onClick={() => cancelTrade(t.id)}>Cancel</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
        )}

        {/* Active */}
        {tab === 'active' && (
          active.length === 0
            ? <Card><EmptyState icon="resource" text="No active trades." /></Card>
            : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {active.map(t => (
                  <Card key={t.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <WorldBadge worldId={t.from} size="sm" />
                        <Icon name="arrow" size={14} className="text-fg-muted" />
                        <WorldBadge worldId={t.to} size="sm" />
                      </div>
                      <StatusBadge status="Accepted" />
                    </div>
                    <TradeBody trade={t} />
                    <div className="border-t border-line pt-3 mt-1">
                      <div className="text-[11px]/[1.45] nx-uppercase text-fg-muted mb-2">Activity Log</div>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex gap-2 text-[12px]/[1.45]">
                          <span className="font-mono text-fg-muted">{t.date}</span>
                          <span className="text-fg-secondary">Accepted — {t.responderComment || 'no comment'}</span>
                        </div>
                        <div className="flex gap-2 text-[12px]/[1.45]">
                          <span className="font-mono text-fg-muted">2391.118</span>
                          <span className="text-fg-secondary">Shipment dispatched via Cargo Logistics</span>
                        </div>
                      </div>
                      <Button size="sm" variant="primary" icon="check" onClick={() => fulfillTrade(t.id)}>Mark Fulfilled</Button>
                    </div>
                  </Card>
                ))}
              </div>
        )}

        {/* History */}
        {tab === 'history' && (
          <Card>
            {history.length === 0
              ? <EmptyState icon="resource" text="No completed trades." />
              : <div className="px-3 pb-1">
                  <Table headers={[{ label: 'Date' }, 'Worlds', 'Exchange', 'Status']}>
                    {history.map(t => (
                      <tr key={t.id} className="border-b border-line last:border-0">
                        <Td mono className="text-fg-muted text-[12px]/[1.45]">{t.date}</Td>
                        <Td>
                          <div className="flex items-center gap-1.5">
                            <WorldBadge worldId={t.from} size="sm" dot={false} />
                            <Icon name="arrow" size={12} className="text-fg-muted" />
                            <WorldBadge worldId={t.to} size="sm" dot={false} />
                          </div>
                        </Td>
                        <Td className="font-mono text-[12px]/[1.45] text-fg-secondary">
                          {t.wantQty.toLocaleString()} {t.wantRes} ⇄ {t.offerQty.toLocaleString()} {t.offerRes}
                        </Td>
                        <Td><StatusBadge status={t.status} /></Td>
                      </tr>
                    ))}
                  </Table>
                </div>}
          </Card>
        )}
      </div>

      {modal && (
        <RespondModal trade={modal.trade} action={modal.action} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

export default TradeDashboardPage;
