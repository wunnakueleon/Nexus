import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Field, Input, Textarea, Select } from '../../../shared/components/Field';
import Icon from '../../../shared/components/Icon';
import PageHeader from '../../../shared/components/PageHeader';
import { CAT_ICON } from '../../../shared/utils/constants';

const CATEGORIES = ['Tools', 'Food', 'Crafts', 'Tech', 'Clothing', 'Medicine', 'Art', 'Materials'];
const CONDITIONS = ['New', 'Used', 'Handmade', 'Rare'];
const BASE = '/commercial-marketplace';

const PostItemPage: React.FC = () => {
  const { postItem } = useApp();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tools');
  const [condition, setCondition] = useState('Used');
  const [desc, setDesc] = useState('');
  const valid = title.trim() && desc.trim();

  const submit = () => {
    postItem({ title: title.trim(), category, condition, desc: desc.trim(), icon: CAT_ICON[category] ?? 'box' });
    navigate(`${BASE}/my-items`);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Post Item" sub="List an item for barter on the marketplace." />
      <Card className="p-6 space-y-5">
        <Field label="Photos" hint="up to 5 — first is primary · drop your own images later">
          <div className="grid grid-cols-5 gap-2">
            <div className="aspect-square border border-dashed border-line-hover rounded flex flex-col items-center justify-center text-fg-muted hover:border-amber hover:text-amber cursor-pointer transition-colors">
              <Icon name="plus" size={18} />
              <span className="text-[9px]/[1.4] font-mono mt-1 nx-uppercase">Add</span>
            </div>
            {[0, 1, 2, 3].map(i => <div key={i} className="aspect-square bg-bg-input border border-line rounded" />)}
          </div>
        </Field>
        <Field label="Title">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Reinforced Work Gloves" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <Select options={CATEGORIES} value={category} onChange={e => setCategory(e.target.value)} />
          </Field>
          <Field label="Condition">
            <Select options={CONDITIONS} value={condition} onChange={e => setCondition(e.target.value)} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the item, its condition, and any details..." />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate(`${BASE}/my-items`)}>Cancel</Button>
          <Button variant="solid" icon="plus" disabled={!valid} onClick={submit}>Post Item</Button>
        </div>
      </Card>
    </div>
  );
};

export default PostItemPage;
