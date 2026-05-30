import { Link } from 'react-router-dom';
import Card from '../../../shared/components/Card';
import Wordmark from '../../../shared/components/Wordmark';
import SignUpForm from '../components/SignUpForm';

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-bg nx-grid flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Wordmark size="lg" />

        <Card className="w-full p-6 sm:p-7">
          <div className="text-sm font-semibold text-amber nx-uppercase mb-5">Create account</div>
          <SignUpForm />
        </Card>

        <Link to="/signin" className="text-xs font-mono text-fg-muted hover:text-amber transition-colors">
          Already registered? Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;
