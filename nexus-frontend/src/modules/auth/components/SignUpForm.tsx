import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/Button';
import { Field, Input } from '../../../shared/components/Field';
import { useApp } from '../../../shared/hooks/useApp';
import { signUp } from '../apis/auth.api';
import type { AuthResponse, SignUpPayload } from '../types/auth.types';

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

const SignUpForm = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpPayload, string>>>({});
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

    const roleLabel = ROLE_LABELS[response.role];
    const worldId = response.worldName ? WORLD_NAME_TO_ID[response.worldName] ?? null : null;
    setOperator({ role: roleLabel, worldId, name: response.name });
    navigate(ROLE_PATHS[response.role]);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof SignUpPayload, string>> = {};
    if (!name.trim()) nextErrors.name = 'Name is required.';
    if (!username.trim()) nextErrors.username = 'Username is required.';
    if (!password.trim()) nextErrors.password = 'Password is required.';
    if (!inviteCode.trim()) nextErrors.inviteCode = 'Invite code is required.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const response = await signUp({ name, username, password, inviteCode });
      handleRoute(response);
    } catch (err) {
      setSubmitError('Sign up failed. Check your invite code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field label="Name">
        <Input value={name} onChange={event => setName(event.target.value)} placeholder="Full name" />
        {errors.name && <div className="text-xs text-critical font-mono mt-1">{errors.name}</div>}
      </Field>

      <Field label="Username">
        <Input value={username} onChange={event => setUsername(event.target.value)} placeholder="Operator handle" />
        {errors.username && <div className="text-xs text-critical font-mono mt-1">{errors.username}</div>}
      </Field>

      <Field label="Password">
        <Input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Secure access key" />
        {errors.password && <div className="text-xs text-critical font-mono mt-1">{errors.password}</div>}
      </Field>

      <Field label="Invite Code" hint="Issued by your world's government">
        <Input value={inviteCode} onChange={event => setInviteCode(event.target.value)} placeholder="World authorization" />
        {errors.inviteCode && <div className="text-xs text-critical font-mono mt-1">{errors.inviteCode}</div>}
      </Field>

      {submitError && <div className="text-xs text-critical font-mono">{submitError}</div>}

      <Button type="submit" variant="solid" size="lg" className="w-full" disabled={submitting}>
        Submit
      </Button>
    </form>
  );
};

export default SignUpForm;
