import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';
import Icon from '../../../shared/components/Icon';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingState from '../../../shared/components/LoadingState';
import PageHeader from '../../../shared/components/PageHeader';
import ItemThumb from '../components/ItemThumb';
import FilterSelect from '../components/FilterSelect';
import { getListings } from '../apis/listing.api';
import type { ListingResponse, ListingCategory, ListingCondition } from '../types/commercial-marketplace.types';
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
  const navigate = useNavigate();

  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState<ListingCategory | 'All'>('All');
  const [worldId, setWorldId] = useState<number | 'All'>('All');
  const [status, setStatus] = useState<'All' | 'available' | 'in_pending_trade'>('All');
  const [cond, setCond] = useState<ListingCondition | 'All'>('All');

  // Fetch the full board; all filtering is client-side below.
  // State is set only in the promise callbacks (never synchronously), so the
  // mount effect doesn't cause a cascading render. `loading` starts true.
  const load = useCallback(() => {
    getListings()
      .then(data => { setListings(Array.isArray(data) ? data : []); setError(null); })
      .catch(() => setError('Failed to load listings.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Any citizen posting, editing, removing, or trading an item changes the
  // shared board — refresh quietly so listings appear/disappear live.
  useSocketEvent(SOCKET_EVENTS.ListingUpdated, () => load());

  // World options derived from real listing data (numeric backend IDs)
  const worldOptions = useMemo(() => {
    const seen = new Map<number, string>();
    listings.forEach(l => seen.set(l.user.world.id, l.user.world.name));
    return [
      { value: 'All', label: 'All Worlds' },
      ...[...seen].map(([wid, name]) => ({ value: String(wid), label: name })),
    ];
  }, [listings]);

  const filtered = listings.filter(l =>
    (cat === 'All' || l.category === cat) &&
    (worldId === 'All' || l.user.world.id === worldId) &&
    (status === 'All' || l.status === status) &&
    (cond === 'All' || l.condition === cond) &&
    (q.trim() === '' || l.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <PageHeader title="Browse Marketplace" sub="Citizen-to-citizen barter across the four worlds." />

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        {/* Search — takes available space */}
        <div className="relative flex-1">
          <Icon name="search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search listings..."
            className="w-full bg-bg-input border border-line rounded text-fg text-sm pl-8 pr-3 py-2 placeholder:text-fg-muted focus:border-amber transition-colors"
          />
        </div>

        {/* Filters — 2×2 grid on mobile, single row on sm+ */}
        <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2">
          <FilterSelect
            className="sm:min-w-[130px]"
            options={[{ value: 'All', label: 'Category' }, ...LISTING_CATEGORIES.map(c => ({ value: c, label: c }))]}
            value={cat}
            onChange={v => setCat(v as ListingCategory | 'All')}
          />
          <FilterSelect
            className="sm:min-w-[130px]"
            options={[
              { value: 'All', label: 'Condition' },
              { value: 'new_item', label: 'New' },
              { value: 'used', label: 'Used' },
              { value: 'handmade', label: 'Handmade' },
              { value: 'rare', label: 'Rare' },
            ]}
            value={cond}
            onChange={v => setCond(v as ListingCondition | 'All')}
          />
          <FilterSelect
            className="sm:min-w-[150px]"
            options={worldOptions}
            value={String(worldId)}
            onChange={v => setWorldId(v === 'All' ? 'All' : Number(v))}
          />
          <FilterSelect
            className="sm:min-w-[130px]"
            options={[
              { value: 'All', label: 'Status' },
              { value: 'available', label: 'Available' },
              { value: 'in_pending_trade', label: 'Negotiated' },
            ]}
            value={status}
            onChange={v => setStatus(v as 'All' | 'available' | 'in_pending_trade')}
          />
        </div>
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
                <div className="relative">
                  <div className={l.status === 'in_pending_trade' ? 'opacity-50' : ''}>
                    <ItemThumb icon={l.category} imageUrl={l.images[0]?.imageUrl} size="lg" />
                  </div>
                  {l.status === 'in_pending_trade' && (
                    <span className="absolute top-2 left-2 text-[9px]/[1.45] nx-uppercase font-semibold px-1.5 py-0.5 rounded bg-bg-secondary/90 text-amber border border-amber/40">
                      In Pending Deal
                    </span>
                  )}
                </div>
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
