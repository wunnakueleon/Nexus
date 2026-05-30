import React from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import Card from '../../../shared/components/Card';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';

interface MetricProps {
  label: string;
  value: number | string;
  accent?: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, accent }) => (
  <Card className="p-4">
    <div className="text-xs font-medium text-fg-secondary nx-uppercase mb-2">{label}</div>
    <div className="text-2xl font-mono font-semibold tnum" style={{ color: accent ?? '#E8ECF1' }}>{value}</div>
  </Card>
);

const PlatformOverviewPage: React.FC = () => {
  const { users, codes, approvals, trades, shipments, listings, worlds } = useApp();

  const activeUsers   = users.filter(u => u.status === 'Active').length;
  const usedCodes     = codes.filter(c => c.status === 'Used').length;
  const availCodes    = codes.filter(c => c.status === 'Available').length;
  const activeTrades  = trades.filter(t => ['Pending', 'Accepted'].includes(t.status)).length;
  const activeShip    = shipments.filter(s => s.status !== 'Delivered').length;
  const perWorld      = worlds.map(w => ({ w, n: users.filter(u => u.world === w.id && u.status === 'Active').length }));

  return (
    <div>
      <PageHeader title="Platform Overview" sub="Network-wide operational telemetry." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Metric label="Active Operators"  value={activeUsers}      accent="#D4890A" />
        <Metric label="Pending Approvals" value={approvals.length} accent={approvals.length ? '#E8960C' : '#5F8A3E'} />
        <Metric label="Active Trades"     value={activeTrades} />
        <Metric label="Active Shipments"  value={activeShip} />
      </div>

      <SectionLabel>Operators Per World</SectionLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {perWorld.map(({ w, n }) => (
          <Card key={w.id} className="p-4" topStripe={w.color}>
            <div className="text-xs font-medium nx-uppercase mb-2" style={{ color: w.color }}>{w.name}</div>
            <div className="text-2xl font-mono font-semibold tnum text-fg">{n}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Metric label="Codes — Available"    value={availCodes} accent="#5F8A3E" />
        <Metric label="Codes — Used"         value={usedCodes}  accent="#8A95A5" />
        <Metric label="Marketplace Listings" value={listings.length} />
      </div>
    </div>
  );
};

export default PlatformOverviewPage;
