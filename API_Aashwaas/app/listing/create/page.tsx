"use client";

import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { createListing } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';
import Protected from '../../../components/common/Protected';

const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function CreateListing() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tops');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState('Good');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (title.trim().length < 5) errors.title = 'Title must be at least 5 characters';
    if (description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
    if (!brand.trim()) errors.brand = 'Brand is required';
    if (!size.trim()) errors.size = 'Size is required';
    if (!color.trim()) errors.color = 'Color is required';
    if (!material.trim()) errors.material = 'Material is required';
    if (!price || Number(price) <= 0) errors.askingPrice = 'Price must be greater than 0';
    if (!location.trim()) errors.location = 'Location is required';
    if (!images.length) errors.images = 'At least one image is required';
    return errors;
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
        return;
      }
    } catch (e: any) {
      const data = e?.data;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      pushToast({ title: 'Create failed', description: e?.message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Create Listing</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded bg-white p-6 shadow">
          <Input name="title" label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} error={fieldErrors.title} />
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-700">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2" rows={4} />
            {fieldErrors.description && <p className="mt-1 text-sm text-danger-500">{fieldErrors.description}</p>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-700">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2">
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="brand" label="Brand" required value={brand} onChange={(e) => setBrand(e.target.value)} error={fieldErrors.brand} />
            <Input name="size" label="Size" required value={size} onChange={(e) => setSize(e.target.value)} error={fieldErrors.size} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="color" label="Color" required value={color} onChange={(e) => setColor(e.target.value)} error={fieldErrors.color} />
            <Input name="material" label="Material" required value={material} onChange={(e) => setMaterial(e.target.value)} error={fieldErrors.material} />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-700">Condition</span>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2">
              {conditions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <Input name="price" type="number" label="Price" required value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')} error={fieldErrors.askingPrice} />
          <Input name="location" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} error={fieldErrors.location} />
          <Input name="images" label="Image URLs" value={images.join(', ')} onChange={(e) => setImages(e.target.value.split(',').map((item) => item.trim()).filter(Boolean))} error={fieldErrors.images} />
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
        </form>
      </div>
    </Protected>
  );
}
