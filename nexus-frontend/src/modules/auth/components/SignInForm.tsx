import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { Field, Input } from '../../../shared/components/Field';

type SignInPayload = {
  username: string;
  password: string;
};

const SignInForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SignInPayload, string>>>({});

  const handleSignIn = (_payload: SignInPayload) => {
    // Placeholder for future sign-in flow.
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof SignInPayload, string>> = {};
    if (!username.trim()) nextErrors.username = 'Username is required.';
    if (!password.trim()) nextErrors.password = 'Password is required.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    handleSignIn({ username, password });
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

      <Button type="submit" variant="solid" size="lg" className="w-full">
        Sign In
      </Button>
    </form>
  );
};

export default SignInForm;
