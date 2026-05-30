import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingState from '../../../shared/components/LoadingState';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import ItemThumb from '../components/ItemThumb';
import { getMyListings, deleteListing } from '../apis/listing.api';
import type { ListingResponse } from '../types/commercial-marketplace.types';

const BASE = '/commercial-marketplace';

const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  in_pending_trade: 'In Pending Trade',
  traded: 'Traded',
};

const MyItemsPage: React.FC = () => {
  const { flash } = useApp();
  const navigate = useNavigate();

  const [items, setItems] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getMyListings()
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load your items.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteListing(id);
      setItems(prev => prev.filter(i => i.id !== id));
      flash('Item removed');
    } catch {
      flash('Failed to delete item');
    }
  };

  return (
    <div>
      <PageHeader title="My Items" sub="Inventory you've posted to the marketplace."
        actions={<Button variant="primary" icon="plus" onClick={() => navigate(`${BASE}/post`)}>Post Item</Button>} />
      <Card>
        {loading && <LoadingState />}
        {error && <EmptyState icon="box" text={error} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState icon="box" text="You have not posted any items." sub="Post an item to begin trading" />
        )}
        {!loading && !error && items.length > 0 && (
          <div className="px-3 pb-1">
            <Table headers={[
              { label: '', w: '56px' }, 'Title', 'Category', 'Condition', 'Status',
              { label: 'Posted' }, { label: 'Actions', align: 'right' },
            ]}>
              {items.map(it => (
                <tr key={it.id} className="border-b border-line last:border-0">
                  <Td><ItemThumb icon={it.category} size="sm" /></Td>
                  <Td className="font-semibold text-fg">{it.title}</Td>
                  <Td className="text-fg-secondary text-[13px]/[1.5]">{it.category}</Td>
                  <Td>
                    <span className="text-[10px]/[1.45] nx-uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-dim text-amber">{it.condition}</span>
                  </Td>
                  <Td><StatusBadge status={STATUS_LABEL[it.status] ?? it.status} /></Td>
                  <Td mono className="text-fg-muted text-[12px]/[1.45]">
                    {new Date(it.createdAt).toLocaleDateString()}
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" icon="edit" disabled={it.status !== 'available'}>Edit</Button>
                      <Button size="sm" variant="danger" icon="trash" disabled={it.status !== 'available'} onClick={() => handleDelete(it.id)}>Delete</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyItemsPage;
