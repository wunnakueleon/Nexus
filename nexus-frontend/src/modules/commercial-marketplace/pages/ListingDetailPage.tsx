import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import EmptyState from '../../../shared/components/EmptyState';
import WorldBadge from '../../../shared/components/WorldBadge';
import ItemThumb from '../components/ItemThumb';

const BASE = '/commercial-marketplace';

const ListingDetailPage: React.FC = () => {
  const { listings, myItems } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const l = listings.find(x => x.id === id);
  if (!l) return <EmptyState icon="market" text="Listing not found." />;
  const hasItems = myItems.some(i => i.status === 'Available');

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(`${BASE}/browse`)} className="flex items-center gap-1.5 text-[12px]/[1.45] font-semibold nx-uppercase text-fg-secondary hover:text-fg mb-4">
        <Icon name="chevron" size={14} className="rotate-180" />Browse
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <ItemThumb icon={l.icon} size="lg" />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-bg-input border border-line rounded flex items-center justify-center">
                <Icon name={l.icon} size={14} className="text-fg-muted/60" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-fg mb-2.5">{l.title}</h1>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-[11px]/[1.45] nx-uppercase font-semibold px-2 py-0.5 rounded bg-bg-tertiary text-fg-secondary border border-line">{l.category}</span>
            <span className="text-[11px]/[1.45] nx-uppercase font-semibold px-2 py-0.5 rounded bg-amber-dim text-amber">{l.condition}</span>
          </div>
          <p className="text-sm text-fg leading-relaxed mb-5">{l.desc}</p>
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-line">
            <span className="text-[12px]/[1.45] text-fg-muted nx-uppercase">Seller</span>
            <span className="text-sm text-fg font-medium">{l.seller}</span>
            <WorldBadge worldId={l.world} size="sm" />
          </div>
          {hasItems
            ? <Button variant="solid" size="lg" icon="market" onClick={() => navigate(`${BASE}/browse/${l.id}/offer`)}>Offer a Trade</Button>
            : <div className="bg-bg-tertiary border border-line rounded p-4">
                <p className="text-sm text-fg-secondary mb-3">You need to post at least one item before you can trade.</p>
                <Button variant="primary" icon="plus" onClick={() => navigate(`${BASE}/post`)}>Post Your First Item</Button>
              </div>}
          <div className="mt-4">
            <button className="text-[12px]/[1.45] font-mono text-fg-muted hover:text-fg-secondary nx-uppercase flex items-center gap-1.5">
              <Icon name="flag" size={13} />Flag Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
