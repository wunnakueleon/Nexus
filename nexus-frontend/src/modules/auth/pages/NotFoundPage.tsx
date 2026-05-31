import { Link } from 'react-router-dom';
import Card from '../../../shared/components/Card';
import Wordmark from '../../../shared/components/Wordmark';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-bg nx-grid flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Wordmark size="lg" />

        <Card className="w-full p-6 sm:p-7 text-center">
          <div className="text-3xl font-mono font-semibold text-amber mb-2">404</div>
          <div className="text-sm font-semibold text-fg nx-uppercase mb-3">Sector Not Found</div>
          <p className="text-sm text-fg-secondary">
            This coordinate doesn't map to any known location on the network. The route may have been
            decommissioned or never existed.
          </p>
        </Card>

        <Link to="/" className="text-xs font-mono text-fg-muted hover:text-amber transition-colors">
          Return to base
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
