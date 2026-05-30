import React, { useState } from 'react';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Field, Input, Select } from '../../../shared/components/Field';
import PageHeader from '../../../shared/components/PageHeader';
import SectionLabel from '../../../shared/components/SectionLabel';
import StatusBadge from '../../../shared/components/StatusBadge';
import { Table, Td } from '../../../shared/components/Table';
import WorldBadge from '../../../shared/components/WorldBadge';

const ROLE_OPTS = ['Resource Manager', 'Transit Officer', 'Commercial Citizen'];

const CodeGenerationPage: React.FC = () => {
  const { codes, generateCodes, expireCode, worlds } = useApp();
  const [world, setWorld]     = useState('GLV');
  const [role, setRole]       = useState('Commercial Citizen');
  const [qty, setQty]         = useState(1);
  const [fWorld, setFWorld]   = useState('All');
  const [fRole, setFRole]     = useState('All');
  const [fStatus, setFStatus] = useState('All');

  const worldOpts = worlds.map(w => ({ value: w.id, label: w.name }));
  const filtered = codes.filter(c =>
    (fWorld  === 'All' || c.world  === fWorld) &&
    (fRole   === 'All' || c.role   === fRole) &&
    (fStatus === 'All' || c.status === fStatus),
  );

  return (
    <div>
      <PageHeader title="Code Generation" sub="Issue access codes tagged to a world and role. No open registration." />

      <Card className="p-5 mb-6">
        <SectionLabel>Generate Codes</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Field label="World">
            <Select options={worldOpts} value={world} onChange={e => setWorld(e.target.value)} />
          </Field>
          <Field label="Role">
            <Select options={ROLE_OPTS} value={role} onChange={e => setRole(e.target.value)} />
          </Field>
          <Field label="Quantity" hint={role === 'Commercial Citizen' ? 'bulk issue permitted' : 'government role — issue 1'}>
            <Input type="number" min="1" max="50" value={qty} onChange={e => setQty(Math.max(1, +e.target.value || 1))} />
          </Field>
          <Button variant="solid" icon="plus" className="h-[38px]" onClick={() => generateCodes(world, role, qty)}>
            Generate
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line flex-wrap">
          <SectionLabel className="mb-0">
            Issued Codes <span className="text-fg-muted font-mono ml-1">{filtered.length}</span>
          </SectionLabel>
          <div className="flex items-center gap-2">
            <Select options={['All', ...worlds.map(w => ({ value: w.id, label: w.name }))]} value={fWorld} onChange={e => setFWorld(e.target.value)} />
            <Select options={['All', ...ROLE_OPTS]} value={fRole} onChange={e => setFRole(e.target.value)} />
            <Select options={['All', 'Available', 'Used', 'Expired']} value={fStatus} onChange={e => setFStatus(e.target.value)} />
          </div>
        </div>
        <div className="px-3 pb-1">
          <Table headers={['Code', 'World', 'Role', 'Status', 'Used By', { label: 'Created' }, { label: '', align: 'right' }]}>
            {filtered.map(c => (
              <tr key={c.code} className="border-b border-line last:border-0 hover:bg-bg-tertiary/40">
                <Td mono className="text-fg font-medium">{c.code}</Td>
                <Td><WorldBadge worldId={c.world} size="sm" /></Td>
                <Td className="text-fg-secondary">{c.role}</Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td className="text-fg-secondary">{c.usedBy || <span className="text-fg-muted">—</span>}</Td>
                <Td mono className="text-fg-muted text-[12px]/[1.45]">{c.created}</Td>
                <Td align="right">
                  {c.status === 'Available' && (
                    <Button size="sm" variant="ghost" onClick={() => expireCode(c.code)}>Expire</Button>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default CodeGenerationPage;
