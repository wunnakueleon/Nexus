import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import type { OperatorState } from '../types/shared.types';
import { ROLES } from '../utils/roles';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { Field } from './Field';
import SectionLabel from './SectionLabel';
import Wordmark from './Wordmark';

const OperatorSelect: React.FC = () => {
  const { operator, setOperator, worlds } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [worldId, setWorldId] = useState(() => worlds[0]?.id ?? '');

  // Already authenticated — go straight to the role's base route.
  if (operator) {
    const current = ROLES.find(r => r.id === operator.role);
    return <Navigate to={current?.basePath ?? '/'} replace />;
  }

  const chosen = ROLES.find(r => r.id === role);
  const needsWorld = chosen && !chosen.neutral;
  const canEnter = !!role && (!!chosen?.neutral || !!worldId);

  const enter = () => {
    if (!canEnter || !chosen) return;
    const name = chosen.neutral
      ? 'Admin'
      : role === 'Commercial Citizen'
        ? 'You'
        : `${role.split(' ')[0]} Officer`;
    const op: OperatorState = { role, worldId: chosen.neutral ? null : worldId, name, status: 'active' };
    setOperator(op);
    navigate(chosen.basePath);
  };

  return (
    <div className="min-h-screen nx-grid flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-9">
          <Wordmark size="lg" />
          <p className="text-sm text-fg-secondary mt-6 text-center">Sustaining four worlds. Preventing extinction.</p>
          <div className="flex items-center gap-2 mt-4 text-[11px]/[1.45] font-mono text-fg-muted nx-uppercase">
            <span className="w-1.5 h-1.5 bg-stable rounded-sm animate-pulse-crit" /> Transmission link active
          </div>
        </div>

        <Card className="p-6">
          <SectionLabel>Select Operator Credential</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {ROLES.map(r => {
              const on = role === r.id;
              return (
                <button key={r.id} onClick={() => setRole(r.id)}
                  className={`text-left p-3.5 rounded border transition-colors flex gap-3 items-start ${on ? 'border-amber bg-bg-tertiary' : 'border-line bg-bg-input hover:border-line-hover'}`}>
                  <div className={`w-9 h-9 shrink-0 border rounded flex items-center justify-center ${on ? 'border-amber text-amber' : 'border-line text-fg-secondary'}`}>
                    <Icon name={r.icon} size={18} />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold nx-uppercase whitespace-nowrap ${on ? 'text-fg' : 'text-fg-secondary'}`}>{r.id}</div>
                    <div className="text-xs text-fg-muted mt-0.5 leading-snug">{r.feature}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {needsWorld && (
            <div className="mb-5">
              <Field label="Assigned World">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {worlds.map(w => {
                    const on = worldId === w.id;
                    return (
                      <button key={w.id} onClick={() => setWorldId(w.id)}
                        className={`p-2.5 rounded border text-left transition-colors ${on ? 'border-fg' : 'border-line hover:border-line-hover'}`}>
                        <span className="block w-full h-1 rounded-sm mb-2" style={{ background: w.color }} />
                        <span className="text-[12px]/[1.45] font-semibold" style={{ color: on ? w.color : '#8A95A5' }}>{w.name}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          )}

          <Button variant="solid" size="lg" className="w-full" disabled={!canEnter} onClick={enter} icon="power">
            Enter Platform
          </Button>
          <p className="text-[11px]/[1.45] font-mono text-fg-muted text-center mt-3 nx-uppercase">
            Demo · select any credential to inspect its feature
          </p>
        </Card>
      </div>
    </div>
  );
};

export default OperatorSelect;
