import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';
import PageHeader from '../../../shared/components/PageHeader';
import { Select } from '../../../shared/components/Field';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import WorldBadge from '../../../shared/components/WorldBadge';
import { fetchUsers, updateUserStatus } from '../apis/user.api';
import { fetchWorlds } from '../apis/world.api';
import type { AdminWorldSummary, UserDirectoryRow } from '../types/admin.types';

const ROLE_LABELS: Record<UserDirectoryRow['role'], string> = {
  resource_manager: 'Resource Manager',
  transit_officer: 'Transit Officer',
  commercial_citizen: 'Commercial Citizen',
};

const STATUS_LABELS: Record<UserDirectoryRow['status'], string> = {
  active: 'Active',
  revoked: 'Revoked',
};

const WORLD_NAME_TO_ID: Record<string, string> = {
  GloriaVenus: 'GLV',
  NanPtune: 'NPT',
  MinUranus: 'MNU',
  WunnaMars: 'WNM',
};

const UserDirectoryPage: React.FC = () => {
  const [users, setUsers] = useState<UserDirectoryRow[]>([]);
  const [worlds, setWorlds] = useState<AdminWorldSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [fWorld, setFWorld] = useState('All');
  const [fRole, setFRole] = useState('All');
  const [fStatus, setFStatus] = useState('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userList, worldList] = await Promise.all([fetchUsers(), fetchWorlds()]);
      setUsers(userList);
      setWorlds(worldList);
    } catch (err) {
      setError('Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = useMemo(() => users.filter(u =>
    (q === '' || u.name.toLowerCase().includes(q.toLowerCase())) &&
    (fWorld === 'All' || String(u.worldId) === fWorld) &&
    (fRole === 'All' || ROLE_LABELS[u.role] === fRole) &&
    (fStatus === 'All' || STATUS_LABELS[u.status] === fStatus),
  ), [users, q, fWorld, fRole, fStatus]);

  const handleStatus = async (id: number, action: 'revoke' | 'reinstate') => {
    setError(null);
    try {
      const updated = await updateUserStatus(id, action);
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError('Unable to update user status.');
    }
  };

  return (
    <div>
      <PageHeader title="User Directory" sub="All approved operators across the four worlds." />
      <Card>
        {error && <div className="px-4 pt-4 text-xs text-critical font-mono">{error}</div>}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search operators..."
              className="w-full bg-bg-input border border-line rounded text-fg text-sm pl-8 pr-3 py-2 placeholder:text-fg-muted focus:border-amber" />
          </div>
          <Select options={['All', ...worlds.map(w => ({ value: String(w.id), label: w.name }))]} value={fWorld} onChange={e => setFWorld(e.target.value)} />
          <Select options={['All', ...Object.values(ROLE_LABELS)]} value={fRole} onChange={e => setFRole(e.target.value)} />
          <Select options={['All', ...Object.values(STATUS_LABELS)]} value={fStatus} onChange={e => setFStatus(e.target.value)} />
        </div>
        <div className="px-3 pb-1">
          {loading
            ? <div className="px-1 py-4 text-sm text-fg-secondary">Loading users...</div>
            : filtered.length === 0
              ? <EmptyState icon="users" text="No operators match." />
              : <Table headers={['Name', 'World', 'Role', 'Status', { label: 'Approved' }, { label: 'Action', align: 'right' }]}>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                      <Td className="font-semibold text-fg">{u.name}</Td>
                      <Td><WorldBadge worldId={WORLD_NAME_TO_ID[u.worldName] ?? u.worldName} size="sm" /></Td>
                      <Td className="text-fg-secondary">{ROLE_LABELS[u.role]}</Td>
                      <Td><StatusBadge status={STATUS_LABELS[u.status]} /></Td>
                      <Td mono className="text-fg-muted text-[12px]/[1.45]">
                        {u.approvedAt ? new Date(u.approvedAt).toLocaleDateString() : '—'}
                      </Td>
                      <Td align="right">
                        {u.status === 'active'
                          ? <Button size="sm" variant="danger" onClick={() => handleStatus(u.id, 'revoke')}>Revoke Access</Button>
                          : <Button size="sm" variant="primary" onClick={() => handleStatus(u.id, 'reinstate')}>Reinstate</Button>}
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
