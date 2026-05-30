import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Icon from '../../../shared/components/Icon';
import Card from '../../../shared/components/Card';
import { Select } from '../../../shared/components/Field';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingState from '../../../shared/components/LoadingState';
import PageHeader from '../../../shared/components/PageHeader';
import ItemThumb from '../components/ItemThumb';
import { getListings } from '../apis/listing.api';
import type { ListingResponse, ListingCategory } from '../types/commercial-marketplace.types';
import { LISTING_CATEGORIES } from '../schemas/listing.schema';

const BASE = '/commercial-marketplace';

const WorldTag: React.FC<{ name: string; color: string }> = ({ name, color }) => (
  <span className="inline-flex items-center gap-1.5 rounded text-[10px]/[1.45] font-semibold px-1.5 py-0.5"
    style={{ color, background: color + '22' }}>
    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: color }} />
    {name}
  </span>
);

const BrowseMarketplacePage: React.FC = () => {
  const { worlds } = useApp();
  const navigate = useNavigate();

  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState<ListingCategory | 'All'>('All');
  const [worldId, setWorldId] = useState<number | 'All'>('All');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {
      ...(cat !== 'All' && { category: cat }),
      ...(worldId !== 'All' && { worldId }),
    };
    getListings(params)
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load listings.'))
      .finally(() => setLoading(false));
  }, [cat, worldId]);

  // keyword filter is client-side to avoid re-fetching on every keystroke
  const filtered = q.trim()
    ? listings.filter(l => l.title.toLowerCase().includes(q.toLowerCase()))
    : listings;

  return (
    <div>
      <PageHeader title="Browse Marketplace" sub="Citizen-to-citizen barter across the four worlds." />
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Icon name="search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search listings..."
            className="w-full bg-bg-input border border-line rounded text-fg text-sm pl-8 pr-3 py-2 placeholder:text-fg-muted focus:border-amber" />
        </div>
        <Select
          options={['All', ...LISTING_CATEGORIES]}
          value={cat}
          onChange={e => setCat(e.target.value as ListingCategory | 'All')}
        />
        <Select
          options={[{ value: 'All', label: 'All Worlds' }, ...worlds.map(w => ({ value: String(w.id), label: w.name }))]}
          value={String(worldId)}
          onChange={e => setWorldId(e.target.value === 'All' ? 'All' : Number(e.target.value))}
        />
      </div>

      {loading && <LoadingState />}
      {error && <Card><EmptyState icon="market" text={error} /></Card>}
      {!loading && !error && filtered.length === 0 && (
        <Card><EmptyState icon="market" text="No listings match your filters." /></Card>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(l => (
            <button key={l.id} onClick={() => navigate(`${BASE}/browse/${l.id}`)} className="text-left">
              <Card className="overflow-hidden hover:border-line-hover transition-colors h-full flex flex-col">
                <ItemThumb icon={l.category} size="lg" />
                <div className="p-3.5 flex-1 flex flex-col">
                  <div className="text-sm font-semibold text-fg mb-2 line-clamp-1">{l.title}</div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[10px]/[1.45] nx-uppercase font-semibold px-1.5 py-0.5 rounded bg-bg-tertiary text-fg-secondary border border-line">{l.category}</span>
                    <span className="text-[10px]/[1.45] nx-uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-dim text-amber">{l.condition}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-line">
                    <WorldTag name={l.user.world.name} color={l.user.world.colorHex} />
                    <span className="text-[11px]/[1.45] font-mono text-fg-muted">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseMarketplacePage;
