import React from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import EmptyState from '../../../shared/components/EmptyState';
import PageHeader from '../../../shared/components/PageHeader';
import { Table, Td } from '../../../shared/components/Table';
import WorldBadge from '../../../shared/components/WorldBadge';

const ApprovalQueuePage: React.FC = () => {
  const { approvals, resolveApproval } = useApp();

  return (
    <div>
      <PageHeader title="Approval Queue" sub="Pending access requests awaiting neutral review." />
      <Card>
        {approvals.length === 0
          ? <EmptyState icon="users" text="No pending requests." sub="All access requests resolved" />
          : <div className="px-3 pt-1 pb-1">
              <Table headers={['Applicant', 'World', 'Role', { label: 'Code' }, { label: 'Submitted' }, { label: 'Action', align: 'right' }]}>
                {approvals.map(a => (
                  <tr key={a.id} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                    <Td className="font-semibold text-fg">{a.name}</Td>
                    <Td><WorldBadge worldId={a.world} size="sm" /></Td>
                    <Td className="text-fg-secondary">{a.role}</Td>
                    <Td mono className="text-fg-secondary">{a.code}</Td>
                    <Td mono className="text-fg-muted text-[12px]/[1.45]">{a.date}</Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="primary" icon="check" onClick={() => resolveApproval(a.id, 'approve')}>Approve</Button>
                        <Button size="sm" variant="danger" icon="x" onClick={() => resolveApproval(a.id, 'reject')}>Reject</Button>
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

export default ApprovalQueuePage;
