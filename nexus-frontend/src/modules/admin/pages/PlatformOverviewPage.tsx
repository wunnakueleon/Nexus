import React, { useEffect, useState } from 'react';
import Card from '../../../shared/components/Card';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import { fetchPlatformOverview } from '../apis/overview.api';
import type { PlatformOverview } from '../types/admin.types';

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

const MetricSkeleton: React.FC = () => (
  <Card className="p-4">
    <div className="h-3 w-24 bg-bg-tertiary rounded mb-3 animate-pulse" />
    <div className="h-7 w-12 bg-bg-tertiary rounded animate-pulse" />
  </Card>
);

const PlatformOverviewPage: React.FC = () => {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatformOverview()
      .then(setOverview)
      .catch(() => setError('Failed to load overview data.'));
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader title="Platform Overview" sub="Network-wide operational telemetry." />
        <p className="text-sm text-red-400 mt-4">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Platform Overview" sub="Network-wide operational telemetry." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {overview ? (
          <>
            <Metric label="Active Operators"  value={overview.activeOperators}  accent="#D4890A" />
            <Metric label="Pending Approvals" value={overview.pendingApprovals} accent={overview.pendingApprovals ? '#E8960C' : '#5F8A3E'} />
            <Metric label="Active Trades"     value={overview.activeTradeRequests} />
            <Metric label="Active Shipments"  value={overview.activeShipments} />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
        )}
      </div>

      <SectionLabel>Operators Per World</SectionLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {overview ? (
          overview.operatorsPerWorld.map(w => (
            <Card key={w.worldId} className="p-4" topStripe={w.colorHex}>
              <div className="text-xs font-medium nx-uppercase mb-2" style={{ color: w.colorHex }}>{w.worldName}</div>
              <div className="text-2xl font-mono font-semibold tnum text-fg">{w.activeOperators}</div>
            </Card>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {overview ? (
          <>
            <Metric label="Codes — Available"    value={overview.availableCodes}  accent="#5F8A3E" />
            <Metric label="Codes — Used"         value={overview.usedCodes}       accent="#8A95A5" />
            <Metric label="Marketplace Listings" value={overview.activeListings} />
          </>
        ) : (
          Array.from({ length: 3 }).map((_, i) => <MetricSkeleton key={i} />)
        )}
      </div>
    </div>
  );
};

export default PlatformOverviewPage;
