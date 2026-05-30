import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Field, Input, Textarea, Select } from '../../../shared/components/Field';
import Icon from '../../../shared/components/Icon';
import PageHeader from '../../../shared/components/PageHeader';
import { createListing } from '../apis/listing.api';
import { postItemSchema, LISTING_CATEGORIES, LISTING_CONDITIONS, type PostItemFormValues } from '../schemas/listing.schema';

const BASE = '/commercial-marketplace';

const PostItemPage: React.FC = () => {
  const { flash } = useApp();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PostItemFormValues>({
    resolver: zodResolver(postItemSchema),
    defaultValues: { category: 'tools', condition: 'used' },
  });

  const onSubmit = async (data: PostItemFormValues) => {
    try {
      await createListing(data);
      flash('Item posted to marketplace');
      navigate(`${BASE}/my-items`);
    } catch {
      flash('Failed to post item');
    }
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

        <Field label="Title" error={errors.title?.message}>
          <Input {...register('title')} placeholder="e.g. Reinforced Work Gloves" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" error={errors.category?.message}>
            <Select options={LISTING_CATEGORIES} {...register('category')} />
          </Field>
          <Field label="Condition" error={errors.condition?.message}>
            <Select options={LISTING_CONDITIONS} {...register('condition')} />
          </Field>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <Textarea rows={4} {...register('description')} placeholder="Describe the item, its condition, and any details..." />
        </Field>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={() => navigate(`${BASE}/my-items`)}>Cancel</Button>
          <Button variant="solid" icon="plus" type="submit" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
            {isSubmitting ? 'Posting...' : 'Post Item'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PostItemPage;
