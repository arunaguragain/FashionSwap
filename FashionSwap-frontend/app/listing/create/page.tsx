"use client";

import React, { useMemo, useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { createListing } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';
import Protected from '../../../components/common/Protected';

const categories = ['Clothes', 'Bags', 'Shoes', 'Accessories', 'Jewellery'];
const conditions = [
  { id: 'New', label: 'New', desc: 'Never worn, tags still on' },
  { id: 'Like New', label: 'Like New', desc: 'Worn 1–3 times, perfect condition' },
  { id: 'Good', label: 'Good', desc: 'Some signs of wear, no damage' },
  { id: 'Fair', label: 'Fair', desc: 'Visible wear, clearly described' },
];

export default function CreateListing() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Clothes');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState('Good');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { pushToast } = useToast();
  const router = useRouter();

  const imageCountText = useMemo(() => `${images.length}/8 photos`, [images.length]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (title.trim().length < 5) errors.title = 'Title must be at least 5 characters';
    if (description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
    if (!category) errors.category = 'Category is required';
    if (!condition) errors.condition = 'Condition is required';
    if (!brand.trim()) errors.brand = 'Brand is required';
    if (!size.trim()) errors.size = 'Size is required';
    if (!color.trim()) errors.color = 'Color is required';
    if (!material.trim()) errors.material = 'Material is required';
    if (!price || Number(price) <= 0) errors.askingPrice = 'Price must be greater than 0';
    if (!location.trim()) errors.location = 'Location is required';
    if (!images.length) errors.images = 'At least one image is required';
    return errors;
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    if (images.length >= 8) {
      pushToast({ title: 'Photo limit reached', description: 'You can add up to 8 images.', tone: 'error' });
      return;
    }
    setImages((prev) => [...prev, imageUrl.trim()]);
    setImageUrl('');
    setFieldErrors((prev) => ({ ...prev, images: '' }));
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      pushToast({ title: 'Please fix the highlighted fields', tone: 'error' });
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const payload = {
        title,
        description,
        category,
        brand,
        size,
        color,
        condition,
        material,
        askingPrice: Number(price),
        negotiable: true,
        images,
        location,
        pickupAvailable: true,
        shippingAvailable: false,
      };

      const res = await createListing(payload);
      pushToast({ title: 'Listing created', tone: 'success' });
      const id = res?.data?._id || res?.data?.id || res?.id || res?._id;
      if (id) {
        router.push(`/listings/${id}`);
      }
    } catch (e: any) {
      const data = e?.data;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      pushToast({ title: 'Create failed', description: e?.message || 'Unable to create listing.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-on-surface sm:text-4xl">List an item</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Fill in the details — the more information you provide, the faster it sells.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-6 shadow-[0_24px_80px_rgba(27,28,25,0.06)] sm:p-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-on-surface">Photos</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Add up to 8 photos so buyers can inspect your item.</p>
              </div>
              <p className="text-sm text-on-surface-variant">{imageCountText}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((src, index) => (
                <div key={src + index} className="relative aspect-square overflow-hidden rounded-[1.25rem] border border-outline/15 bg-surface-container">
                  <img src={src} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant shadow-sm transition hover:bg-surface-container-hover"
                  >
                    ×
                  </button>
                </div>
              ))}

              {images.length < 8 && (
                <div className="flex flex-col gap-3 rounded-[1.5rem] border border-dashed border-outline/30 bg-surface-container p-4">
                  <Input
                    label="Image URL"
                    placeholder="Paste image link"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="rounded-[1rem]"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddImage} className="w-full py-3">
                    Add photo
                  </Button>
                  {fieldErrors.images && <p className="text-sm text-error">{fieldErrors.images}</p>}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-on-surface">Category</h2>
              {fieldErrors.category && <p className="text-sm text-error">{fieldErrors.category}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === cat
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline/30 bg-surface-container text-on-surface hover:border-primary/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-on-surface">Condition</h2>
              {fieldErrors.condition && <p className="text-sm text-error">{fieldErrors.condition}</p>}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {conditions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCondition(item.id)}
                  className={`rounded-[1.25rem] border p-4 text-left transition ${
                    condition === item.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-outline/30 bg-white hover:border-primary/50'
                  }`}
                >
                  <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">{item.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-4">
              <Input label="Title" placeholder="Handwoven Dhaka kurti — rust & navy" value={title} onChange={(e) => setTitle(e.target.value)} error={fieldErrors.title} />
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe measurements, material, condition, and any details buyers should know."
                  rows={5}
                  className="w-full rounded-[1.25rem] border border-outline/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <p className="mt-2 text-xs text-on-surface-variant">{description.length}/500 characters</p>
                {fieldErrors.description && <p className="mt-2 text-sm text-error">{fieldErrors.description}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <Input label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} error={fieldErrors.brand} />
              <Input label="Size" value={size} onChange={(e) => setSize(e.target.value)} error={fieldErrors.size} />
              <Input label="Color" value={color} onChange={(e) => setColor(e.target.value)} error={fieldErrors.color} />
              <Input label="Material" value={material} onChange={(e) => setMaterial(e.target.value)} error={fieldErrors.material} />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Price (Rs.)</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">Rs.</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0"
                  className="w-full rounded-[1.25rem] border border-outline/30 bg-surface-container-lowest px-4 py-3 pl-12 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              {fieldErrors.askingPrice && <p className="mt-2 text-sm text-error">{fieldErrors.askingPrice}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Meetup location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-[1.25rem] border border-outline/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select city</option>
                {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan'].map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {fieldErrors.location && <p className="mt-2 text-sm text-error">{fieldErrors.location}</p>}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={loading} className="w-full py-4 text-base">
              {loading ? 'Publishing...' : 'Publish listing'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full py-4 text-base">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Protected>
  );
}
