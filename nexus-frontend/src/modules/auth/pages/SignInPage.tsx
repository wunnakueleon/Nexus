import { Link } from 'react-router-dom';
import Card from '../../../shared/components/Card';
import Wordmark from '../../../shared/components/Wordmark';
import SignInForm from '../components/SignInForm';

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-bg nx-grid flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Wordmark size="lg" />

        <Card className="w-full p-6 sm:p-7">
          <div className="text-sm font-semibold text-amber nx-uppercase mb-5">Access portal</div>
          <SignInForm />
        </Card>

        <Link to="/signup" className="text-xs font-mono text-fg-muted hover:text-amber transition-colors">
          New operator? Create an account
        </Link>
      </div>
    </div>
  );
};

export default SignInPage;
