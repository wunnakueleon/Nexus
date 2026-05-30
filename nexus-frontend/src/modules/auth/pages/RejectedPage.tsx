import { Link } from 'react-router-dom';
import Card from '../../../shared/components/Card';
import Wordmark from '../../../shared/components/Wordmark';

const RejectedPage = () => {
  return (
    <div className="min-h-screen bg-bg nx-grid flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Wordmark size="lg" />

        <Card className="w-full p-6 sm:p-7 text-center">
          <div className="text-sm font-semibold text-critical nx-uppercase mb-3">Access Rejected</div>
          <p className="text-sm text-fg-secondary">
            Your request was not approved. If you believe this is a mistake, contact the admin authority for review.
          </p>
        </Card>

        <Link to="/signin" className="text-xs font-mono text-fg-muted hover:text-amber transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default RejectedPage;
