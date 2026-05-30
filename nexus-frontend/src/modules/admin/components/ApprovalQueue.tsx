import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import { Field, Input, Select } from "../../../shared/components/Field";
import PageHeader from "../../../shared/components/PageHeader";
import SectionLabel from "../../../shared/components/SectionLabel";
import StatusBadge from "../../../shared/components/StatusBadge";
import { Table, Td } from "../../../shared/components/Table";
import WorldBadge from "../../../shared/components/WorldBadge";
import { fetchApprovalHistory, fetchApprovalQueue, resolveApproval } from "../apis/approval.api";
import { fetchWorlds } from "../apis/world.api";
import type {
  ApprovalAction,
  ApprovalHistoryItem,
  ApprovalQueueItem,
  AdminWorldSummary,
} from "../types/admin.types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  resource_manager: "Resource Manager",
  transit_officer: "Transit Officer",
  commercial_citizen: "Commercial Citizen",
};

const ROLE_FILTERS = ['Resource Manager', 'Transit Officer', 'Commercial Citizen'];

const WORLD_NAME_TO_ID: Record<string, string> = {
  GloriaVenus: "GLV",
  NanPtune: "NPT",
  MinUranus: "MNU",
  WunnaMars: "WNM",
};

const formatTimestamp = (value: string) => {
  const stamp = new Date(value);
  if (Number.isNaN(stamp.getTime())) return value;
  return stamp.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ApprovalQueue: React.FC = () => {
  const [rows, setRows] = useState<ApprovalQueueItem[]>([]);
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([]);
  const [worlds, setWorlds] = useState<AdminWorldSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [q, setQ] = useState('');
  const [fWorld, setFWorld] = useState('All');
  const [fRole, setFRole] = useState('All');
  const [fStatus, setFStatus] = useState('All');

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [queueData, historyData, worldData] = await Promise.all([
        fetchApprovalQueue(),
        fetchApprovalHistory(),
        fetchWorlds(),
      ]);
      if (!Array.isArray(queueData)) {
        setRows([]);
        setError("Approval queue payload invalid.");
      } else {
        setRows(queueData);
      }
      setHistory(Array.isArray(historyData) ? historyData : []);
      setWorlds(worldData);
    } catch (err) {
      setRows([]);
      setHistory([]);
      setError("Unable to load approval queue.");
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  const handleResolve = async (id: number, action: ApprovalAction) => {
    setBusyId(id);
    setError(null);
    try {
      await resolveApproval(id, action);
      setRows(prev => prev.filter(row => row.id !== id));
    } catch (err) {
      setError("Unable to update approval status.");
    } finally {
      setBusyId(null);
    }
  };

  const hasRows = rows.length > 0;
  const tableRows = useMemo(
    () => rows.map(row => ({
      ...row,
      worldBadgeId: WORLD_NAME_TO_ID[row.worldName] ?? row.worldName,
      roleLabel: ROLE_LABELS[row.role] ?? row.role,
      submittedLabel: formatTimestamp(row.submittedAt),
    })),
    [rows],
  );

  const historyRows = useMemo(
    () => history
      .filter(item => {
        const nameMatch = q === '' || item.name.toLowerCase().includes(q.toLowerCase());
        const worldMatch = fWorld === 'All' || String(item.worldId) === fWorld;
        const roleMatch = fRole === 'All' || ROLE_LABELS[item.role] === fRole;
        const statusMatch = fStatus === 'All' || (fStatus === 'Approved' ? item.status === 'approved' : item.status === 'rejected');
        return nameMatch && worldMatch && roleMatch && statusMatch;
      })
      .map(item => ({
        ...item,
        worldBadgeId: WORLD_NAME_TO_ID[item.worldName] ?? item.worldName,
        roleLabel: ROLE_LABELS[item.role],
        statusLabel: item.status === 'approved' ? 'Approved' : 'Rejected',
        resolvedLabel: item.resolvedAt ? formatTimestamp(item.resolvedAt) : '—',
      })),
    [history, q, fWorld, fRole, fStatus],
  );

  return (
    <div>
      <PageHeader title="Approval Queue" sub="Pending access requests awaiting neutral review." />

      <Card className="mb-6">
        {error && <div className="px-4 pt-4 text-xs text-critical font-mono">{error}</div>}
        {loading
          ? <div className="px-4 py-6 text-sm text-fg-secondary">Loading approval queue...</div>
          : !hasRows
            ? <EmptyState icon="users" text="No pending requests." sub="All access requests resolved" />
            : <div className="px-3 pt-1 pb-1 overflow-x-auto">
                <Table headers={['Applicant', 'World', 'Role', { label: 'Code' }, { label: 'Submitted' }, { label: 'Action', align: 'right' }]}>
                  {tableRows.map(row => (
                    <tr key={row.id} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                      <Td className="font-semibold text-fg">{row.name}</Td>
                      <Td><WorldBadge worldId={row.worldBadgeId} size="sm" /></Td>
                      <Td className="text-fg-secondary">{row.roleLabel}</Td>
                      <Td mono className="text-fg-secondary">{row.code}</Td>
                      <Td mono className="text-fg-muted text-[12px]/[1.45]">{row.submittedLabel}</Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            icon="check"
                            disabled={busyId === row.id}
                            onClick={() => handleResolve(row.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon="x"
                            disabled={busyId === row.id}
                            onClick={() => handleResolve(row.id, "reject")}
                          >
                            Reject
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </Table>
              </div>}
      </Card>

      <SectionLabel>Resolution History</SectionLabel>
      <Card>
        <div className="px-4 py-3 border-b border-line">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <Field label="Search">
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search applicant" />
            </Field>
            <Field label="World">
              <Select options={['All', ...worlds.map(w => ({ value: String(w.id), label: w.name }))]} value={fWorld} onChange={e => setFWorld(e.target.value)} />
            </Field>
            <Field label="Role">
              <Select options={['All', ...ROLE_FILTERS]} value={fRole} onChange={e => setFRole(e.target.value)} />
            </Field>
            <Field label="Status">
              <Select options={['All', 'Approved', 'Rejected']} value={fStatus} onChange={e => setFStatus(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="px-3 pb-1 overflow-x-auto">
          {historyLoading
            ? <div className="px-1 py-4 text-sm text-fg-secondary">Loading history...</div>
            : historyRows.length === 0
              ? <EmptyState icon="users" text="No history yet." sub="Resolved approvals will appear here." />
              : <Table headers={['Applicant', 'World', 'Role', 'Status', { label: 'Resolved' }]}>
                  {historyRows.map(item => (
                    <tr key={item.id} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                      <Td className="font-semibold text-fg">{item.name}</Td>
                      <Td><WorldBadge worldId={item.worldBadgeId} size="sm" /></Td>
                      <Td className="text-fg-secondary">{item.roleLabel}</Td>
                      <Td><StatusBadge status={item.statusLabel} /></Td>
                      <Td mono className="text-fg-muted text-[12px]/[1.45]">{item.resolvedLabel}</Td>
                    </tr>
                  ))}
                </Table>}
        </div>
      </Card>
    </div>
  );
};

export default ApprovalQueue;
