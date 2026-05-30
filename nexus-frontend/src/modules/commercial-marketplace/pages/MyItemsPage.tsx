import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import ItemThumb from '../components/ItemThumb';

const BASE = '/commercial-marketplace';

const MyItemsPage: React.FC = () => {
  const { myItems, deleteItem } = useApp();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="My Items" sub="Inventory you've posted to the marketplace."
        actions={<Button variant="primary" icon="plus" onClick={() => navigate(`${BASE}/post`)}>Post Item</Button>} />
      <Card>
        {myItems.length === 0
          ? <EmptyState icon="box" text="You have not posted any items." sub="Post an item to begin trading" />
          : <div className="px-3 pb-1">
              <Table headers={[
                { label: '', w: '56px' }, 'Title', 'Category', 'Condition', 'Status',
                { label: 'Posted' }, { label: 'Actions', align: 'right' },
              ]}>
                {myItems.map(it => (
                  <tr key={it.id} className="border-b border-line last:border-0">
                    <Td><ItemThumb icon={it.icon} size="sm" /></Td>
                    <Td className="font-semibold text-fg">{it.title}</Td>
                    <Td className="text-fg-secondary text-[13px]/[1.5]">{it.category}</Td>
                    <Td>
                      <span className="text-[10px]/[1.45] nx-uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-dim text-amber">{it.condition}</span>
                    </Td>
                    <Td><StatusBadge status={it.status} /></Td>
                    <Td mono className="text-fg-muted text-[12px]/[1.45]">{it.date}</Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" icon="edit" disabled={it.status !== 'Available'}>Edit</Button>
                        <Button size="sm" variant="danger" icon="trash" disabled={it.status !== 'Available'} onClick={() => deleteItem(it.id)}>Delete</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>}
      </Card>
    </div>
  );
};

export default MyItemsPage;
