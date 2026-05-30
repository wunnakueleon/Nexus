import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import WorldBadge from '../../../shared/components/WorldBadge';
import ItemThumb from '../components/ItemThumb';

const BASE = '/commercial-marketplace';

const TradeOfferPage: React.FC = () => {
  const { listings, myItems, submitOffer } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const l = listings.find(x => x.id === id);
  const available = myItems.filter(i => i.status === 'Available');
  const [sel, setSel] = useState<string | null>(null);
  if (!l) return <EmptyState icon="market" text="Listing not found." />;

  const handleSubmit = () => {
    const chosen = available.find(i => i.id === sel);
    if (chosen) { submitOffer(l, chosen); navigate(`${BASE}/my-trades`); }
  };

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(`${BASE}/browse/${l.id}`)} className="flex items-center gap-1.5 text-[12px]/[1.45] font-semibold nx-uppercase text-fg-secondary hover:text-fg mb-4">
        <Icon name="chevron" size={14} className="rotate-180" />Listing
      </button>
      <PageHeader title="Offer a Trade" sub="Select one of your available items to offer in exchange." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-4">
          <SectionLabel>Item You Want</SectionLabel>
          <div className="flex gap-3">
            <ItemThumb icon={l.icon} />
            <div>
              <div className="text-sm font-semibold text-fg">{l.title}</div>
              <div className="mt-1"><WorldBadge worldId={l.world} size="sm" /></div>
              <p className="text-[13px]/[1.5] text-fg-secondary mt-2">{l.desc}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <SectionLabel>Select Your Offer</SectionLabel>
          {available.length === 0
            ? <EmptyState icon="box" text="No items to offer. Post an item first." />
            : <div className="grid grid-cols-2 gap-2">
                {available.map(it => (
                  <button key={it.id} onClick={() => setSel(it.id)}
                    className={`text-left p-2.5 rounded border transition-colors ${sel === it.id ? 'border-amber bg-amber/5' : 'border-line hover:border-line-hover'}`}>
                    <ItemThumb icon={it.icon} size="lg" />
                    <div className="text-[12px]/[1.45] font-semibold text-fg mt-2 line-clamp-1">{it.title}</div>
                    <span className="text-[10px]/[1.45] nx-uppercase text-fg-muted">{it.category}</span>
                  </button>
                ))}
              </div>}
        </Card>
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="solid" size="lg" icon="check" disabled={!sel} onClick={handleSubmit}>Submit Offer</Button>
      </div>
    </div>
  );
};

export default TradeOfferPage;
