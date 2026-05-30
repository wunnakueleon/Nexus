import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Icon from '../../../shared/components/Icon';
import Card from '../../../shared/components/Card';
import { Select } from '../../../shared/components/Field';
import EmptyState from '../../../shared/components/EmptyState';
import PageHeader from '../../../shared/components/PageHeader';
import WorldBadge from '../../../shared/components/WorldBadge';
import ItemThumb from '../components/ItemThumb';

const CATEGORIES = ['Tools', 'Food', 'Crafts', 'Tech', 'Clothing', 'Medicine', 'Art', 'Materials'];
const BASE = '/commercial-marketplace';

const BrowseMarketplacePage: React.FC = () => {
  const { listings, worlds } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [world, setWorld] = useState('All');
  const [sort, setSort] = useState('Newest');

  let list = listings.filter(l =>
    (q === '' || l.title.toLowerCase().includes(q.toLowerCase())) &&
    (cat === 'All' || l.category === cat) &&
    (world === 'All' || l.world === world),
  );
  if (sort === 'Newest') list = [...list].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader title="Browse Marketplace" sub="Citizen-to-citizen barter across the four worlds." />
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Icon name="search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search listings..."
            className="w-full bg-bg-input border border-line rounded text-fg text-sm pl-8 pr-3 py-2 placeholder:text-fg-muted focus:border-amber" />
        </div>
        <Select options={['All', ...CATEGORIES]} value={cat} onChange={e => setCat(e.target.value)} />
        <Select options={['All', ...worlds.map(w => ({ value: w.id, label: w.name }))]} value={world} onChange={e => setWorld(e.target.value)} />
        <Select options={['Newest', 'Most Popular']} value={sort} onChange={e => setSort(e.target.value)} />
      </div>

      {list.length === 0
        ? <Card><EmptyState icon="market" text="No listings match your filters." /></Card>
        : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map(l => (
              <button key={l.id} onClick={() => navigate(`${BASE}/browse/${l.id}`)} className="text-left">
                <Card className="overflow-hidden hover:border-line-hover transition-colors h-full flex flex-col">
                  <ItemThumb icon={l.icon} size="lg" />
                  <div className="p-3.5 flex-1 flex flex-col">
                    <div className="text-sm font-semibold text-fg mb-2 line-clamp-1">{l.title}</div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-[10px]/[1.45] nx-uppercase font-semibold px-1.5 py-0.5 rounded bg-bg-tertiary text-fg-secondary border border-line">{l.category}</span>
                      <span className="text-[10px]/[1.45] nx-uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-dim text-amber">{l.condition}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-line">
                      <WorldBadge worldId={l.world} size="sm" />
                      <span className="text-[11px]/[1.45] font-mono text-fg-muted">{l.date}</span>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>}
    </div>
  );
};

export default BrowseMarketplacePage;
