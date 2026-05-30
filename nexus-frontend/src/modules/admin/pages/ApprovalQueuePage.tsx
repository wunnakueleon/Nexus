import React from 'react';
import PageHeader from '../../../shared/components/PageHeader';
import ApprovalQueue from '../components/ApprovalQueue';

const ApprovalQueuePage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Approval Queue" sub="Pending access requests awaiting neutral review." />
      <ApprovalQueue />
    </div>
  );
};

export default ApprovalQueuePage;
