import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '../../../shared/hooks/useApp';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { Input, Textarea, Select } from '../../../shared/components/Field';
import Icon from '../../../shared/components/Icon';
import LoadingState from '../../../shared/components/LoadingState';
import PageHeader from '../../../shared/components/PageHeader';
import { createListing, getListingById, updateListing, uploadImages } from '../apis/listing.api';
import { postItemSchema, LISTING_CATEGORIES, LISTING_CONDITIONS, type PostItemFormValues } from '../schemas/listing.schema';

const BASE = '/commercial-marketplace';

const ErrMsg: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="text-[11px]/[1.45] text-critical mt-1 font-mono">{msg}</p> : null;

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xs font-medium text-fg-secondary nx-uppercase mb-1.5">{children}</div>
);

const PostItemPage: React.FC = () => {
  const { flash } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // server URLs of uploaded images — used for both preview and submission
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<PostItemFormValues>({
    resolver: zodResolver(postItemSchema),
    defaultValues: { category: 'tools', condition: 'used' },
  });

  // Edit mode: load the existing listing and prefill the form. `loading` already
  // starts true in edit mode, so the effect needn't set it synchronously.
  useEffect(() => {
    if (!id) return;
    getListingById(Number(id))
      .then(l => {
        reset({ title: l.title, description: l.description, category: l.category, condition: l.condition });
        setImages(l.images.map(img => img.imageUrl));
      })
      .catch(() => flash('Failed to load item'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files);
      // Append to existing photos (cap at 4) so adding one at a time accumulates
      setImages(prev => [...prev, ...urls].slice(0, 4));
    } catch {
      flash('Could not upload one of the images');
    } finally {
      setUploading(false);
    }
    e.target.value = ''; // allow re-selecting the same file
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data: PostItemFormValues) => {
    try {
      if (isEdit && id) {
        await updateListing(Number(id), { ...data, imageUrls: images });
        flash('Item updated');
      } else {
        await createListing({ ...data, imageUrls: images });
        flash('Item posted to marketplace');
      }
      navigate(`${BASE}/my-items`);
    } catch {
      flash(isEdit ? 'Failed to update item' : 'Failed to post item — backend may not be running');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={isEdit ? 'Edit Item' : 'Post Item'}
        sub={isEdit ? 'Update your marketplace listing.' : 'List an item for barter on the marketplace.'}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-5">

          <div>
            <Label>Photos</Label>
            <p className="text-[11px]/[1.45] text-fg-muted mb-2 font-mono">up to 4 — first is primary</p>
            <div className="grid grid-cols-5 gap-2">
              <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()}
                className="aspect-square border border-dashed border-line-hover rounded flex flex-col items-center justify-center text-fg-muted hover:border-amber hover:text-amber cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait">
                <Icon name="plus" size={18} />
                <span className="text-[9px]/[1.4] font-mono mt-1 nx-uppercase">{uploading ? '...' : 'Add'}</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-bg-input border border-line rounded overflow-hidden relative">
                  {images[i]
                    ? <>
                        <img src={images[i]} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-sm bg-bg-secondary/80 flex items-center justify-center text-fg-muted hover:text-critical">
                          <Icon name="x" size={10} />
                        </button>
                      </>
                    : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Title</Label>
            <Input {...register('title')} placeholder="e.g. Reinforced Work Gloves" />
            <ErrMsg msg={errors.title?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Controller name="category" control={control} render={({ field }) => (
                <Select options={[...LISTING_CATEGORIES]} value={field.value} onChange={e => field.onChange(e.target.value)} />
              )} />
              <ErrMsg msg={errors.category?.message} />
            </div>
            <div>
              <Label>Condition</Label>
              <Controller name="condition" control={control} render={({ field }) => (
                <Select options={[...LISTING_CONDITIONS]} value={field.value} onChange={e => field.onChange(e.target.value)} />
              )} />
              <ErrMsg msg={errors.condition?.message} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={4} {...register('description')} placeholder="Describe the item, its condition, and any details..." />
            <ErrMsg msg={errors.description?.message} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => navigate(`${BASE}/my-items`)}>Cancel</Button>
            <Button variant="solid" icon={isEdit ? 'check' : 'plus'} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Post Item'}
            </Button>
          </div>

        </Card>
      </form>
    </div>
  );
};

export default PostItemPage;
