import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';
import PageHeader from '../../../shared/components/PageHeader';
import { Select } from '../../../shared/components/Field';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
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
  rejected: 'Rejected',
};

const STATUS_FILTERS = ['Active', 'Revoked', 'Rejected'] as const;

const WorldPill: React.FC<{ world: AdminWorldSummary }> = ({ world }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded font-semibold text-[10px]/[1.45] px-1.5 py-0.5 whitespace-nowrap"
    style={{ color: world.colorHex, background: `${world.colorHex}22` }}
  >
    <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: world.colorHex }} />
    {world.name}
  </span>
);

// A Select that doesn't stretch full-width — for use in filter bars
const FilterSelect: React.FC<React.ComponentProps<typeof Select>> = (props) => (
  <div className="w-36">
    <Select {...props} />
  </div>
);

const UserDirectoryPage: React.FC = () => {
  const [users, setUsers] = useState<UserDirectoryRow[]>([]);
  const [worlds, setWorlds] = useState<AdminWorldSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [fWorld, setFWorld] = useState('All');
  const [fRole, setFRole] = useState('All');
  const [fStatus, setFStatus] = useState('All');

  const worldMap = useMemo(
    () => Object.fromEntries(worlds.map(w => [w.id, w])),
    [worlds],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userList, worldList] = await Promise.all([fetchUsers(), fetchWorlds()]);
      setUsers(userList);
      setWorlds(worldList);
    } catch {
      setError('Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const filtered = useMemo(() => users.filter(u =>
    (q === '' || u.name.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase())) &&
    (fWorld === 'All' || String(u.worldId) === fWorld) &&
    (fRole === 'All' || ROLE_LABELS[u.role] === fRole) &&
    (fStatus === 'All' || STATUS_LABELS[u.status] === fStatus),
  ), [users, q, fWorld, fRole, fStatus]);

  const handleStatus = async (id: number, action: 'revoke' | 'reinstate') => {
    setError(null);
    try {
      const updated = await updateUserStatus(id, action);
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    } catch {
      setError('Unable to update user status.');
    }
  };

  return (
    <div>
      <PageHeader title="User Directory" sub="All approved operators across the four worlds." />
      <Card>
        {error && <div className="px-4 pt-4 text-xs text-critical font-mono">{error}</div>}

        {/* Filter bar — search + dropdowns in a single scrollable row */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line overflow-x-auto">
          <div className="relative shrink-0 w-48">
            <Icon name="search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search operators..."
              className="w-full bg-bg-input border border-line rounded text-fg text-sm pl-8 pr-3 py-2 placeholder:text-fg-muted focus:border-amber"
            />
          </div>
          <FilterSelect
            options={['All', ...worlds.map(w => ({ value: String(w.id), label: w.name }))]}
            value={fWorld}
            onChange={e => setFWorld(e.target.value)}
          />
          <FilterSelect
            options={['All', ...Object.values(ROLE_LABELS)]}
            value={fRole}
            onChange={e => setFRole(e.target.value)}
          />
          <FilterSelect
            options={['All', ...STATUS_FILTERS]}
            value={fStatus}
            onChange={e => setFStatus(e.target.value)}
          />
        </div>

        {/* Scrollable table wrapper */}
        <div className="overflow-x-auto">
          {loading
            ? <div className="px-4 py-4 text-sm text-fg-secondary">Loading users...</div>
            : filtered.length === 0
              ? <EmptyState icon="users" text="No operators match." />
              : <Table headers={['Name', 'Username', 'World', 'Role', 'Status', { label: 'Approved' }, { label: 'Action', align: 'right' }]}>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                      <Td className="font-semibold text-fg whitespace-nowrap">{u.name}</Td>
                      <Td mono className="text-fg-secondary whitespace-nowrap">{u.username}</Td>
                      <Td className="whitespace-nowrap">
                        {worldMap[u.worldId]
                          ? <WorldPill world={worldMap[u.worldId]} />
                          : <span className="text-fg-muted text-xs">{u.worldName}</span>}
                      </Td>
                      <Td className="text-fg-secondary whitespace-nowrap">{ROLE_LABELS[u.role]}</Td>
                      <Td className="whitespace-nowrap"><StatusBadge status={STATUS_LABELS[u.status]} /></Td>
                      <Td mono className="text-fg-muted text-[12px]/[1.45] whitespace-nowrap">
                        {u.approvedAt ? new Date(u.approvedAt).toLocaleDateString() : '—'}
                      </Td>
                      <Td align="right" className="whitespace-nowrap">
                        {u.status === 'active'
                          ? <Button size="sm" variant="danger" onClick={() => handleStatus(u.id, 'revoke')}>Revoke Access</Button>
                          : <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStatus(u.id, 'reinstate')}
                              disabled={u.status === 'rejected' || worldMap[u.worldId]?.status !== 'active'}
                              title={
                                u.status === 'rejected'
                                  ? 'User was rejected'
                                  : worldMap[u.worldId]?.status !== 'active'
                                    ? 'World removed — cannot reinstate'
                                    : undefined
                              }
                            >
                              Reinstate
                            </Button>}
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
