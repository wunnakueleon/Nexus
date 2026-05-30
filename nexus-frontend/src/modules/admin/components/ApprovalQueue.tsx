import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import { Table, Td } from "../../../shared/components/Table";
import WorldBadge from "../../../shared/components/WorldBadge";
import { fetchApprovalQueue, resolveApproval } from "../apis/approval.api";
import type { ApprovalAction, ApprovalQueueItem } from "../types/admin.types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  resource_manager: "Resource Manager",
  transit_officer: "Transit Officer",
  commercial_citizen: "Commercial Citizen",
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApprovalQueue();
      if (!Array.isArray(data)) {
        setRows([]);
        setError("Approval queue payload invalid.");
        return;
      }
      setRows(data);
    } catch (err) {
      setRows([]);
      setError("Unable to load approval queue.");
    } finally {
      setLoading(false);
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

  return (
    <Card>
      {error && <div className="px-4 pt-4 text-xs text-critical font-mono">{error}</div>}
      {loading
        ? <div className="px-4 py-6 text-sm text-fg-secondary">Loading approval queue...</div>
        : !hasRows
          ? <EmptyState icon="users" text="No pending requests." sub="All access requests resolved" />
          : <div className="px-3 pt-1 pb-1">
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
  );
};

export default ApprovalQueue;
