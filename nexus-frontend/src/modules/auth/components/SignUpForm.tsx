import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { Field, Input } from '../../../shared/components/Field';

type SignUpPayload = {
  name: string;
  username: string;
  password: string;
  inviteCode: string;
};

const SignUpForm = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpPayload, string>>>({});

  const handleSignUp = (_payload: SignUpPayload) => {
    // Placeholder for future sign-up flow.
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof SignUpPayload, string>> = {};
    if (!name.trim()) nextErrors.name = 'Name is required.';
    if (!username.trim()) nextErrors.username = 'Username is required.';
    if (!password.trim()) nextErrors.password = 'Password is required.';
    if (!inviteCode.trim()) nextErrors.inviteCode = 'Invite code is required.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    handleSignUp({ name, username, password, inviteCode });
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

      <Button type="submit" variant="solid" size="lg" className="w-full">
        Submit
      </Button>
    </form>
  );
};

export default SignUpForm;
