import React, { useState } from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';
import PageHeader from '../../../shared/components/PageHeader';
import { Select } from '../../../shared/components/Field';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import WorldBadge from '../../../shared/components/WorldBadge';

const UserDirectoryPage: React.FC = () => {
  const { users, toggleUser, worlds } = useApp();
  const [q, setQ]           = useState('');
  const [fWorld, setFWorld] = useState('All');
  const [fRole, setFRole]   = useState('All');
  const [fStatus, setFStatus] = useState('All');

  const filtered = users.filter(u =>
    (q       === '' || u.name.toLowerCase().includes(q.toLowerCase())) &&
    (fWorld  === 'All' || u.world  === fWorld) &&
    (fRole   === 'All' || u.role   === fRole) &&
    (fStatus === 'All' || u.status === fStatus),
  );

  return (
    <div>
      <PageHeader title="User Directory" sub="All approved operators across the four worlds." />
      <Card>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search operators..."
              className="w-full bg-bg-input border border-line rounded text-fg text-sm pl-8 pr-3 py-2 placeholder:text-fg-muted focus:border-amber" />
          </div>
          <Select options={['All', ...worlds.map(w => ({ value: w.id, label: w.name }))]} value={fWorld} onChange={e => setFWorld(e.target.value)} />
          <Select options={['All', 'Resource Manager', 'Transit Officer', 'Commercial Citizen']} value={fRole} onChange={e => setFRole(e.target.value)} />
          <Select options={['All', 'Active', 'Revoked']} value={fStatus} onChange={e => setFStatus(e.target.value)} />
        </div>
        <div className="px-3 pb-1">
          {filtered.length === 0
            ? <EmptyState icon="users" text="No operators match." />
            : <Table headers={['Name', 'World', 'Role', 'Status', { label: 'Approved' }, { label: 'Action', align: 'right' }]}>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                    <Td className="font-semibold text-fg">{u.name}</Td>
                    <Td><WorldBadge worldId={u.world} size="sm" /></Td>
                    <Td className="text-fg-secondary">{u.role}</Td>
                    <Td><StatusBadge status={u.status} /></Td>
                    <Td mono className="text-fg-muted text-[12px]/[1.45]">{u.approved}</Td>
                    <Td align="right">
                      {u.status === 'Active'
                        ? <Button size="sm" variant="danger" onClick={() => toggleUser(u.id)}>Revoke Access</Button>
                        : <Button size="sm" variant="primary" onClick={() => toggleUser(u.id)}>Reinstate</Button>}
                    </Td>
                  </tr>
                ))}
              </Table>}
        </div>
      </Card>
    </div>
  );
};

export default UserDirectoryPage;
