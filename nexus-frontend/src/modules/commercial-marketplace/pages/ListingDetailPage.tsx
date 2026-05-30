import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingState from '../../../shared/components/LoadingState';
import ItemThumb from '../components/ItemThumb';
import { getListingById, getMyListings } from '../apis/listing.api';
import type { ListingResponse } from '../types/commercial-marketplace.types';

const BASE = '/commercial-marketplace';

const WorldTag: React.FC<{ name: string; color: string }> = ({ name, color }) => (
  <span className="inline-flex items-center gap-1.5 rounded text-[10px]/[1.45] font-semibold px-1.5 py-0.5"
    style={{ color, background: color + '22' }}>
    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: color }} />
    {name}
  </span>
);

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { flash } = useApp();

  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [isOwnListing, setIsOwnListing] = useState(false);
  const [hasAvailableItems, setHasAvailableItems] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagged, setFlagged] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getListingById(Number(id)), getMyListings()])
      .then(([l, mine]) => {
        setListing(l);
        const myUserId = mine[0]?.user.id ?? null;
        setIsOwnListing(myUserId !== null && myUserId === l.user.id);
        setHasAvailableItems(mine.some(i => i.status === 'available'));
      })
      .catch(() => setError('Failed to load listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (error || !listing) return <EmptyState icon="market" text={error ?? 'Listing not found.'} />;

  const l = listing;

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(`${BASE}/browse`)} className="flex items-center gap-1.5 text-[12px]/[1.45] font-semibold nx-uppercase text-fg-secondary hover:text-fg mb-4">
        <Icon name="chevron" size={14} className="rotate-180" />Browse
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <ItemThumb icon={l.category} imageUrl={l.images[0]?.imageUrl} size="lg" />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {l.images.slice(0, 4).map((img, i) => (
              <div key={img.id ?? i} className="aspect-square bg-bg-input border border-line rounded overflow-hidden">
                {img.imageUrl
                  ? <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  : <Icon name={l.category} size={14} className="text-fg-muted/60 m-auto mt-3" />}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - l.images.length) }).map((_, i) => (
              <div key={`ph-${i}`} className="aspect-square bg-bg-input border border-line rounded flex items-center justify-center">
                <Icon name={l.category} size={14} className="text-fg-muted/60" />
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
          <p className="text-sm text-fg leading-relaxed mb-5">{l.description}</p>
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-line">
            <span className="text-[12px]/[1.45] text-fg-muted nx-uppercase">Seller</span>
            <span className="text-sm text-fg font-medium">{l.user.name}</span>
            <WorldTag name={l.user.world.name} color={l.user.world.colorHex} />
          </div>
          {l.status === 'in_pending_trade'
            ? <div className="bg-amber-dim border border-amber/40 rounded p-4">
                <p className="text-sm text-amber">This item is currently being negotiated in a trade.</p>
              </div>
            : l.status !== 'available'
            ? <div className="bg-bg-tertiary border border-line rounded p-4">
                <p className="text-sm text-fg-secondary">This item has already been traded.</p>
              </div>
            : isOwnListing
              ? <div className="bg-bg-tertiary border border-line rounded p-4">
                  <p className="text-sm text-fg-secondary">This is your listing.</p>
                </div>
              : hasAvailableItems
                ? <Button variant="solid" size="lg" icon="market" onClick={() => navigate(`${BASE}/browse/${l.id}/offer`)}>Offer a Trade</Button>
                : <div className="bg-bg-tertiary border border-line rounded p-4">
                    <p className="text-sm text-fg-secondary mb-3">You need to post at least one item before you can trade.</p>
                    <Button variant="primary" icon="plus" onClick={() => navigate(`${BASE}/post`)}>Post Your First Item</Button>
                  </div>}
          <div className="mt-4">
            <button
              disabled={flagged}
              onClick={() => { setFlagged(true); flash('Listing flagged for review'); }}
              className="text-[12px]/[1.45] font-mono text-fg-muted hover:text-fg-secondary nx-uppercase flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-default"
            >
              <Icon name="flag" size={13} />{flagged ? 'Flagged for Review' : 'Flag Listing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
