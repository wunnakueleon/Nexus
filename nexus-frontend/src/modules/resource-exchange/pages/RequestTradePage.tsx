import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import { tradeApi } from '../apis/trade.api';
import { resourceApi } from '../apis/resource.api';
import type { ResourceType, TradeUrgency } from '../types/resource-exchange.types';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Field, Input, Textarea, Select } from '../../../shared/components/Field';
import PageHeader from '../../../shared/components/PageHeader';
import WorldBadge from '../../../shared/components/WorldBadge';

const RESOURCE_OPTIONS = ['fuel', 'water', 'food', 'medicine', 'steel'];
const URGENCY_OPTIONS  = ['normal', 'urgent', 'critical'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const DEMO_USER_ID = 1; // placeholder until auth is wired

const RequestTradePage: React.FC = () => {
  const { worlds, worldById, operator } = useApp();
  const navigate = useNavigate();

  // world name → DB integer id map
  const [nameToDbId, setNameToDbId] = useState<Record<string, number>>({});
  const [submitting, setSubmitting]  = useState(false);

  useEffect(() => {
    resourceApi.getAll().then(res => {
      const map: Record<string, number> = {};
      res.data.data.forEach(r => { map[r.world.name] = r.worldId; });
      setNameToDbId(map);
    });
  }, []);

  const myWorldName  = operator?.worldId ? worldById(operator.worldId).name : null;
  const myDbWorldId  = myWorldName ? nameToDbId[myWorldName] ?? null : null;

  const otherWorlds  = useMemo(
    () => worlds.filter(w => w.name !== myWorldName),
    [worlds, myWorldName],
  );

  const [toWorldStrId, setToWorldStrId] = useState<string>('');
  const [wantRes,  setWantRes]  = useState<ResourceType>('fuel');
  const [wantQty,  setWantQty]  = useState(1000);
  const [offerRes, setOfferRes] = useState<ResourceType>('food');
  const [offerQty, setOfferQty] = useState(1000);
  const [urgency,  setUrgency]  = useState<TradeUrgency>('normal');
  const [comment,  setComment]  = useState('');

  // Set default target world once worlds are loaded
  useEffect(() => {
    if (!toWorldStrId && otherWorlds.length > 0) {
      setToWorldStrId(otherWorlds[0].id);
    }
  }, [otherWorlds, toWorldStrId]);

  const submit = async () => {
    if (!myDbWorldId || !toWorldStrId) return;
    const toWorldName = worldById(toWorldStrId).name;
    const toDbWorldId = nameToDbId[toWorldName];
    if (!toDbWorldId) return;

    setSubmitting(true);
    try {
      await tradeApi.create({
        fromWorldId:       myDbWorldId,
        toWorldId:         toDbWorldId,
        requestedByUserId: DEMO_USER_ID,
        resourceWanted:    wantRes,
        quantityWanted:    wantQty,
        resourceOffered:   offerRes,
        quantityOffered:   offerQty,
        urgency,
        requestComment:    comment || undefined,
      });
      navigate('/resource-exchange/trade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Request Trade" sub="Propose a one-shot resource exchange with another world." />
      <Card className="p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <Field label="From">
            <div className="py-1">
              {operator?.worldId && <WorldBadge worldId={operator.worldId} />}
            </div>
          </Field>
          <Field label="To">
            <Select
              options={otherWorlds.map(w => ({ value: w.id, label: w.name }))}
              value={toWorldStrId}
              onChange={e => setToWorldStrId(e.target.value)}
            />
          </Field>
        </div>

        <div className="border border-line rounded p-4 bg-bg-input/50">
          <div className="text-[11px]/[1.45] nx-uppercase text-fg-muted mb-3">Resource you want</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Resource">
              <Select
                options={RESOURCE_OPTIONS.map(r => ({ value: r, label: cap(r) }))}
                value={wantRes}
                onChange={e => setWantRes(e.target.value as ResourceType)}
              />
            </Field>
            <Field label="Quantity">
              <Input type="number" min="1" value={wantQty} onChange={e => setWantQty(+e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="border border-line rounded p-4 bg-bg-input/50">
          <div className="text-[11px]/[1.45] nx-uppercase text-fg-muted mb-3">Resource you offer</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Resource">
              <Select
                options={RESOURCE_OPTIONS.map(r => ({ value: r, label: cap(r) }))}
                value={offerRes}
                onChange={e => setOfferRes(e.target.value as ResourceType)}
              />
            </Field>
            <Field label="Quantity">
              <Input type="number" min="1" value={offerQty} onChange={e => setOfferQty(+e.target.value)} />
            </Field>
          </div>
        </div>

        <Field label="Urgency">
          <Select
            options={URGENCY_OPTIONS.map(u => ({ value: u, label: cap(u) }))}
            value={urgency}
            onChange={e => setUrgency(e.target.value as TradeUrgency)}
          />
        </Field>

        <Field label="Comment (optional)">
          <Textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add context for your request..." />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => navigate('/resource-exchange/trade')}>Cancel</Button>
          <Button variant="solid" icon="arrow" onClick={submit} disabled={submitting || !myDbWorldId}>
            {submitting ? 'Sending…' : 'Send Request'}
          </Button>
        </div>

      </Card>
    </div>
  );
};

export default RequestTradePage;
