import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Field, Input, Select } from '../../../shared/components/Field';
import Icon from '../../../shared/components/Icon';
import PageHeader from '../../../shared/components/PageHeader';
import { createShipment as apiCreateShipment } from '../apis/shipment.api';

// Matches seed creation order — update if DB is re-seeded with different IDs
const WORLD_CODE_TO_ID: Record<string, number> = { GLV: 1, NPT: 2, MNU: 3, WNM: 4 };

interface ManifestDraft {
  res: string;
  qty: number;
  notes: string;
}

const BASE = '/cargo-logistics';

const CreateShipmentPage: React.FC = () => {
  const { operator, worlds, RESOURCES, flash } = useApp();
  const navigate = useNavigate();
  const mine = operator.worldId ?? '';
  const others = worlds.filter(w => w.id !== mine);

  const [dest, setDest] = useState(others[0]?.id ?? '');
  const [items, setItems] = useState<ManifestDraft[]>([{ res: 'Fuel', qty: 100, notes: '' }]);
  const [ref, setRef] = useState('');
  const [departure, setDeparture] = useState('');
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof ManifestDraft>(i: number, k: K, v: ManifestDraft[K]) =>
    setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

  const submit = async () => {
    setLoading(true);
    try {
      await apiCreateShipment({
        originWorldId: WORLD_CODE_TO_ID[mine] ?? 1,
        destinationWorldId: WORLD_CODE_TO_ID[dest] ?? 2,
        sourceType: 'manual',
        transportReference: ref || undefined,
        scheduledDeparture: departure || undefined,
        items: items.map(it => ({
          resourceType: it.res,
          quantity: it.qty,
          conditionNotes: it.notes || undefined,
        })),
      });
      navigate(`${BASE}/shipments`);
    } catch {
      flash('Failed to create shipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Create Shipment" sub="Dispatch cargo from your world to another." />
      <Card className="p-6 space-y-5">
        <Field label="Destination World">
          <Select options={others.map(w => ({ value: w.id, label: w.name }))} value={dest} onChange={e => setDest(e.target.value)} />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-fg-secondary nx-uppercase">Manifest</div>
            <Button size="sm" variant="outline" icon="plus" onClick={() => setItems([...items, { res: 'Water', qty: 100, notes: '' }])}>Add Item</Button>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex flex-col gap-2 pb-3 border-b border-line last:border-0 sm:grid sm:grid-cols-[1fr_90px_1.4fr_auto] sm:items-center sm:gap-2 sm:pb-0 sm:border-0">
                <Select options={RESOURCES} value={it.res} onChange={e => update(i, 'res', e.target.value)} />
                <Input type="number" min="1" value={it.qty} onChange={e => update(i, 'qty', +e.target.value)} />
                <Input value={it.notes} onChange={e => update(i, 'notes', e.target.value)} placeholder="Condition notes" />
                <button
                  onClick={() => items.length > 1 && setItems(items.filter((_, idx) => idx !== i))}
                  disabled={items.length === 1}
                  className="self-end sm:self-auto text-fg-muted hover:text-critical p-1.5 disabled:opacity-30"
                >
                  <Icon name="x" size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Transport Reference (optional)">
            <Input value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. corridor lane ID" />
          </Field>
          <Field label="Scheduled Departure">
            <Input value={departure} onChange={e => setDeparture(e.target.value)} placeholder="2391.xxx" />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => navigate(`${BASE}/shipments`)}>Cancel</Button>
          <Button variant="solid" icon="cargo" onClick={submit} disabled={loading}>
            {loading ? 'Creating…' : 'Create Shipment'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateShipmentPage;
