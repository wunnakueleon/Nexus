import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import { tradeApi } from '../apis/trade.api';
import { resourceApi } from '../apis/resource.api';
import type { TradeRequestRow } from '../types/resource-exchange.types';
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
import LoadingState from '../../../shared/components/LoadingState';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString();

const nameToFrontendId = (name: string, worlds: { id: string; name: string }[]) =>
  worlds.find(w => w.name === name)?.id ?? name;

// ---- RespondModal ------------------------------------------------------------
interface RespondModalProps {
  trade: TradeRequestRow;
  action: 'accept' | 'decline';
  onClose: () => void;
  onDone: () => void;
}

const RespondModal: React.FC<RespondModalProps> = ({ trade, action, onClose, onDone }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const accept = action === 'accept';

  const confirm = async () => {
    setLoading(true);
    try {
      const payload = { responseComment: comment };
      if (accept) {
        await tradeApi.accept(trade.id, payload);
      } else {
        await tradeApi.decline(trade.id, payload);
      }
      onDone();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={accept ? 'Accept Trade' : 'Decline Trade'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={accept ? 'solid' : 'danger'} onClick={confirm} disabled={loading}>
            {loading ? 'Processing…' : accept ? 'Confirm Accept' : 'Confirm Decline'}
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

// ---- TradeBody --------------------------------------------------------------
const TradeBody: React.FC<{ trade: TradeRequestRow }> = ({ trade }) => (
  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
    <div className="bg-bg-input border border-line rounded p-2 sm:p-3">
      <div className="text-[11px]/[1.45] nx-uppercase text-fg-muted mb-1">They want</div>
      <div className="font-mono text-xs sm:text-sm text-fg">
        {trade.quantityWanted.toLocaleString()}{' '}
        <span className="text-fg-secondary capitalize">{trade.resourceWanted}</span>
      </div>
    </div>
    <div className="bg-bg-input border border-line rounded p-2 sm:p-3">
      <div className="text-[11px]/[1.45] nx-uppercase text-fg-muted mb-1">They offer</div>
      <div className="font-mono text-xs sm:text-sm text-fg">
        {trade.quantityOffered.toLocaleString()}{' '}
        <span className="text-fg-secondary capitalize">{trade.resourceOffered}</span>
      </div>
    </div>
  </div>
);

// ---- TradeDashboardPage -----------------------------------------------------
interface TradeModal { trade: TradeRequestRow; action: 'accept' | 'decline'; }

const TradeDashboardPage: React.FC = () => {
  const { worlds, worldById, operator } = useApp();
  const navigate = useNavigate();

  const [trades, setTrades]   = useState<TradeRequestRow[]>([]);
  const [myDbId, setMyDbId]   = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('incoming');
  const [modal, setModal]     = useState<TradeModal | null>(null);

  const myWorldName = operator?.worldId ? worldById(operator.worldId).name : null;

  const fetchAll = useCallback(async () => {
    try {
      const resRes = await resourceApi.getAll();
      const myRow  = (resRes.data.data ?? []).find(r => r.world.name === myWorldName);
      const dbId   = myRow?.worldId ?? null;
      setMyDbId(dbId);
      if (dbId) {
        const tradeRes = await tradeApi.getByWorld(dbId);
        setTrades(tradeRes.data.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [myWorldName]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const incoming = useMemo(() => trades.filter(t => t.toWorldId === myDbId && t.status === 'pending'), [trades, myDbId]);
  const outgoing = useMemo(() => trades.filter(t => t.fromWorldId === myDbId), [trades, myDbId]);
  const active   = useMemo(() => trades.filter(t => (t.fromWorldId === myDbId || t.toWorldId === myDbId) && t.status === 'accepted'), [trades, myDbId]);
  const history  = useMemo(() => trades.filter(t => (t.fromWorldId === myDbId || t.toWorldId === myDbId) && ['declined', 'fulfilled', 'cancelled'].includes(t.status)), [trades, myDbId]);

  const tabs = [
    { id: 'incoming', label: 'Incoming',      count: incoming.length },
    { id: 'outgoing', label: 'Outgoing',      count: outgoing.length },
    { id: 'active',   label: 'Active',        count: active.length },
    { id: 'history',  label: 'History',       count: history.length },
  ];

  const cancel  = async (id: number) => { await tradeApi.cancel(id);  fetchAll(); };
  const fulfill = async (id: number) => { await tradeApi.fulfill(id); fetchAll(); };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Trade Dashboard"
        sub="Resource exchange requests to and from your world."
        actions={
          <Button variant="primary" icon="plus" onClick={() => navigate('/resource-exchange/trade/new')}>
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">New</span>
          </Button>
        }
      />

      <div className="overflow-x-auto">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div className="mt-4 sm:mt-5">

        {/* Incoming */}
        {tab === 'incoming' && (
          incoming.length === 0
            ? <Card><EmptyState icon="resource" text="No incoming requests." /></Card>
            : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {incoming.map(t => (
                  <Card key={t.id} className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-sm min-w-0 flex-wrap">
                        <WorldBadge worldId={nameToFrontendId(t.fromWorld.name, worlds)} size="sm" />
                        <span className="text-fg-muted text-xs">requests from you</span>
                      </div>
                      <StatusBadge status={cap(t.urgency)} pulse={t.urgency === 'critical'} />
                    </div>
                    <TradeBody trade={t} />
                    {t.requestComment && (
                      <p className="text-[13px]/[1.5] text-fg-secondary italic border-l-2 border-line pl-3 mb-3">
                        "{t.requestComment}"
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[12px]/[1.45] font-mono text-fg-muted">{fmtDateTime(t.createdAt)}</span>
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
                  <Card key={t.id} className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-sm min-w-0 flex-wrap">
                        <span className="text-fg-muted text-xs">request to</span>
                        <WorldBadge worldId={nameToFrontendId(t.toWorld.name, worlds)} size="sm" />
                      </div>
                      <StatusBadge status={cap(t.status)} />
                    </div>
                    <TradeBody trade={t} />
                    {['accepted', 'declined'].includes(t.status) && t.responseComment && (
                      <p className="text-[13px]/[1.5] text-fg-secondary italic border-l-2 border-line pl-3 mb-3">
                        <span className="not-italic text-fg-muted nx-uppercase text-[10px]/[1.45] block mb-0.5">Response</span>
                        "{t.responseComment}"
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[12px]/[1.45] font-mono text-fg-muted">{fmtDateTime(t.createdAt)}</span>
                      {t.status === 'pending' && (
                        <Button size="sm" variant="danger" onClick={() => cancel(t.id)}>Cancel</Button>
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
                  <Card key={t.id} className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <WorldBadge worldId={nameToFrontendId(t.fromWorld.name, worlds)} size="sm" />
                        <Icon name="arrow" size={14} className="text-fg-muted" />
                        <WorldBadge worldId={nameToFrontendId(t.toWorld.name, worlds)} size="sm" />
                      </div>
                      <StatusBadge status="Accepted" />
                    </div>
                    <TradeBody trade={t} />
                    {t.responseComment && (
                      <p className="text-[13px]/[1.5] text-fg-secondary italic border-l-2 border-line pl-3 mb-3">
                        "{t.responseComment}"
                      </p>
                    )}
                    <div className="border-t border-line pt-3 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[12px]/[1.45] font-mono text-fg-muted">{fmtDateTime(t.createdAt)}</span>
                      <Button size="sm" variant="primary" icon="check" onClick={() => fulfill(t.id)}>
                        Mark Fulfilled
                      </Button>
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
              : <div className="overflow-x-auto">
                  <Table headers={[{ label: 'Date' }, 'Worlds', 'Exchange', 'Status']}>
                    {history.map(t => (
                      <tr key={t.id} className="border-b border-line last:border-0">
                        <Td mono className="text-fg-muted text-[12px]/[1.45] whitespace-nowrap hidden sm:table-cell">
                          {fmtDate(t.createdAt)}
                        </Td>
                        <Td>
                          <div className="flex items-center gap-1">
                            <WorldBadge worldId={nameToFrontendId(t.fromWorld.name, worlds)} size="sm" dot={false} />
                            <Icon name="arrow" size={10} className="text-fg-muted shrink-0" />
                            <WorldBadge worldId={nameToFrontendId(t.toWorld.name, worlds)} size="sm" dot={false} />
                          </div>
                        </Td>
                        <Td className="font-mono text-[11px]/[1.45] sm:text-[12px]/[1.45] text-fg-secondary capitalize">
                          {t.quantityWanted.toLocaleString()} {t.resourceWanted} ⇄ {t.quantityOffered.toLocaleString()} {t.resourceOffered}
                        </Td>
                        <Td><StatusBadge status={cap(t.status)} /></Td>
                      </tr>
                    ))}
                  </Table>
                </div>}
          </Card>
        )}
      </div>

      {modal && (
        <RespondModal
          trade={modal.trade}
          action={modal.action}
          onClose={() => setModal(null)}
          onDone={fetchAll}
        />
      )}
    </div>
  );
};

export default TradeDashboardPage;
