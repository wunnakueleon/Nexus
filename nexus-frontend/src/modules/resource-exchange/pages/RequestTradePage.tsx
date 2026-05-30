import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Field, Input, Textarea, Select } from '../../../shared/components/Field';
import PageHeader from '../../../shared/components/PageHeader';
import WorldBadge from '../../../shared/components/WorldBadge';
import type { Trade } from '../../../shared/types/shared.types';

const BASE = '/resource-exchange';

const RequestTradePage: React.FC = () => {
  const { operator, worlds, RESOURCES, sendTrade } = useApp();
  const navigate = useNavigate();
  const mine = operator.worldId ?? '';
  const others = worlds.filter(w => w.id !== mine);

  const [to, setTo]           = useState(others[0]?.id ?? '');
  const [wantRes, setWantRes] = useState('Fuel');
  const [wantQty, setWantQty] = useState(1000);
  const [offerRes, setOfferRes] = useState('Food');
  const [offerQty, setOfferQty] = useState(1000);
  const [urgency, setUrgency] = useState<Trade['urgency']>('Normal');
  const [comment, setComment] = useState('');

  const submit = () => {
    sendTrade({ from: mine, to, wantRes, wantQty, offerRes, offerQty, urgency, comment });
    navigate(`${BASE}/trade`);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Request Trade" sub="Propose a one-shot resource exchange with another world." />
      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="From">
            <div className="py-1"><WorldBadge worldId={mine} /></div>
          </Field>
          <Field label="To">
            <Select
              options={others.map(w => ({ value: w.id, label: w.name }))}
              value={to}
              onChange={e => setTo(e.target.value)}
            />
          </Field>
        </div>

        <div className="border border-line rounded p-4 bg-bg-input/50">
          <div className="text-[11px]/[1.45] nx-uppercase text-fg-muted mb-3">Resource you want</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Resource">
              <Select options={RESOURCES} value={wantRes} onChange={e => setWantRes(e.target.value)} />
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
              <Select options={RESOURCES} value={offerRes} onChange={e => setOfferRes(e.target.value)} />
            </Field>
            <Field label="Quantity">
              <Input type="number" min="1" value={offerQty} onChange={e => setOfferQty(+e.target.value)} />
            </Field>
          </div>
        </div>

        <Field label="Urgency">
          <Select
            options={['Normal', 'Urgent', 'Critical']}
            value={urgency}
            onChange={e => setUrgency(e.target.value as Trade['urgency'])}
          />
        </Field>
        <Field label="Comment (optional)">
          <Textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add context for your request..." />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => navigate(`${BASE}/trade`)}>Cancel</Button>
          <Button variant="solid" icon="arrow" onClick={submit}>Send Request</Button>
        </div>
      </Card>
    </div>
  );
};

export default RequestTradePage;
