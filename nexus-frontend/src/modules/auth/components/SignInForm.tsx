import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/Button';
import { Field, Input } from '../../../shared/components/Field';
import { useApp } from '../../../shared/hooks/useApp';
import { signIn } from '../apis/auth.api';
import { signInSchema } from '../schemas/auth.schema';
import type { AuthResponse, SignInPayload } from '../types/auth.types';

const ROLE_LABELS: Record<AuthResponse['role'], string> = {
  admin: 'Admin',
  resource_manager: 'Resource Manager',
  transit_officer: 'Transit Officer',
  commercial_citizen: 'Commercial Citizen',
};

const ROLE_PATHS: Record<AuthResponse['role'], string> = {
  admin: '/admin/approval-queue',
  resource_manager: '/resource-exchange/overview',
  transit_officer: '/cargo-logistics/shipments',
  commercial_citizen: '/commercial-marketplace/browse',
};

const WORLD_NAME_TO_ID: Record<string, string> = {
  GloriaVenus: 'GLV',
  NanPtune: 'NPT',
  MinUranus: 'MNU',
  WunnaMars: 'WNM',
};

const SignInForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SignInPayload, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setOperator } = useApp();

  const handleRoute = (response: AuthResponse) => {
    if (response.status === 'pending') {
      navigate('/pending-approval');
      return;
    }
    if (response.status === 'rejected') {
      navigate('/account-rejected');
      return;
    }
    if (response.status === 'revoked') {
      navigate('/access-revoked');
      return;
    }

    const roleLabel = ROLE_LABELS[response.role];
    const worldId = response.worldName ? WORLD_NAME_TO_ID[response.worldName] ?? null : null;
    setOperator({ role: roleLabel, worldId, name: response.name, username, status: response.status });
    navigate(ROLE_PATHS[response.role]);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = signInSchema.safeParse({ username, password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      const response = await signIn({ username, password });
      handleRoute(response);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid username or password.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field label="Username">
        <Input value={username} onChange={event => setUsername(event.target.value)} placeholder="Operator handle" />
        {errors.username && <div className="text-xs text-critical font-mono mt-1">{errors.username}</div>}
      </Field>

      <Field label="Password">
        <Input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Secure access key" />
        {errors.password && <div className="text-xs text-critical font-mono mt-1">{errors.password}</div>}
      </Field>

      {submitError && <div className="text-xs text-critical font-mono">{submitError}</div>}

      <Button type="submit" variant="solid" size="lg" className="w-full" disabled={submitting}>
        Sign In
      </Button>
    </form>
  );
};

export default SignInForm;
