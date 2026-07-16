"use client";

import React, { useMemo, useState } from 'react';
import { createListing, uploadListingImage } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';
import Protected from '../../../components/common/Protected';
import { Camera, X as XIcon, ImagePlus, Info } from 'lucide-react';

const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];
const conditions = [
  { id: 'New', label: 'New', desc: 'Never worn, tags still on' },
  { id: 'Like New', label: 'Like New', desc: 'Worn 1–3 times' },
  { id: 'Good', label: 'Good', desc: 'Some signs of wear' },
  { id: 'Fair', label: 'Fair', desc: 'Visible wear' },
];

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 8) {
      pushToast({ title: 'Photo limit reached', description: 'You can add up to 8 images.', tone: 'error' });
      return;
    }
    
    setIsUploadingImage(true);
    setFieldErrors((prev) => ({ ...prev, images: '' }));
    
    try {
      const res = await uploadListingImage(file);
      if (res && res.url) {
        setImages((prev) => [...prev, res.url]);
      }
    } catch (err: unknown) {
      pushToast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Unable to upload image.', tone: 'error' });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
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
      
      setTitle('');
      setDescription('');
      setCategory('Tops');
      setBrand('');
      setSize('');
      setColor('');
      setCondition('Good');
      setMaterial('');
      setPrice('');
      setLocation('');
      setImages([]);
      
      const id = res?.data?._id || res?.data?.id || res?.id || res?._id;
      if (id) {
        router.push(`/listing/${id}`);
      }
    } catch (e: unknown) {
      const data = e && typeof e === 'object' && 'data' in e
        ? (e as { data?: { errors?: Record<string, string> } }).data
        : undefined;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      pushToast({ title: 'Create failed', description: e instanceof Error ? e.message : 'Unable to create listing.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="w-full px-4 py-6 sm:px-6 md:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center rounded-full bg-terracotta/12 px-3 py-1 text-xs font-semibold text-terracotta-dark">
              Create
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight text-charcoal md:text-4xl">List an item</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              Fill in the details, the more information you provide, the faster it sells.
            </p>
          </div>
          <span className="w-fit rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink shadow-sm">
            {imageCountText}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="w-full rounded-[22px] border border-border/70 bg-white shadow-[0_18px_50px_rgba(53,39,30,0.08)]">
          <div className="grid gap-8 p-5 md:p-7 lg:grid-cols-[1.02fr_0.98fr]">
            
            {/* LEFT COLUMN */}
            <div className="space-y-7">
              {/* Photos Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>Photos</h2>
                    <p className="mt-1 text-sm text-ink">Add up to 8 photos so buyers can inspect your item.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((src, index) => (
                    <div key={src + index} className="group relative aspect-square overflow-hidden rounded-[14px] border border-border bg-sand-light">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Preview ${index + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-charcoal backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {images.length < 8 && (
                    <div className="flex aspect-square flex-col justify-center gap-3 rounded-[14px] border border-dashed border-border bg-parchment-dark/50 p-4 transition-colors hover:border-terracotta/50">
                      <div className="flex items-center justify-center gap-2 text-ink">
                        <ImagePlus className="h-4 w-4 text-terracotta" />
                      </div>
                      <label className="w-full cursor-pointer flex flex-col items-center">
                        <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-white border border-border px-2 py-1.5 text-xs font-medium text-charcoal hover:bg-parchment-dark transition-colors">
                          <Camera className="h-3 w-3" /> {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                      {fieldErrors.images && <p className="text-xs text-red-600 text-center">{fieldErrors.images}</p>}
                    </div>
                  )}
                </div>
              </section>

              {/* Title & Description Section */}
              <section className="space-y-4 border-t border-border/50 pt-6">
                <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>Listing overview</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Handwoven Dhaka kurti — rust & navy"
                      className="w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                    />
                    {fieldErrors.title && <p className="mt-2 text-sm text-red-600">{fieldErrors.title}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe measurements, material, condition, and any details buyers should know."
                      rows={5}
                      className="w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-ink flex items-center gap-1"><Info size={12}/> Be specific to sell faster</p>
                      <p className="text-xs text-ink">{description.length}/500 characters</p>
                    </div>
                    {fieldErrors.description && <p className="mt-2 text-sm text-red-600">{fieldErrors.description}</p>}
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-7">
              {/* Category & Condition */}
              <div className="grid gap-6 sm:grid-cols-2">
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>Category</h2>
                    {fieldErrors.category && <p className="text-sm text-red-600">{fieldErrors.category}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          category === cat
                            ? 'bg-terracotta text-white'
                            : 'bg-parchment border border-border text-charcoal hover:border-terracotta/40'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>Condition</h2>
                    {fieldErrors.condition && <p className="text-sm text-red-600">{fieldErrors.condition}</p>}
                  </div>
                  <div className="grid gap-2">
                    {conditions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCondition(item.id)}
                        className={`rounded-[12px] border px-4 py-3 text-left transition-all duration-200 ${
                          condition === item.id
                            ? 'border-terracotta bg-terracotta/6 shadow-[0_8px_18px_rgba(196,98,45,0.10)]'
                            : 'border-border bg-white hover:border-terracotta/40 hover:bg-parchment'
                        }`}
                      >
                        <p className={`font-display text-[15px] font-semibold leading-none ${condition === item.id ? 'text-terracotta-dark' : 'text-charcoal'}`}>{item.label}</p>
                        <p className="mt-1.5 text-xs text-ink">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Item Specifics */}
              <section className="space-y-4 border-t border-border/50 pt-6">
                <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>Item specifics</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Brand</label>
                    <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta" />
                    {fieldErrors.brand && <p className="mt-2 text-sm text-red-600">{fieldErrors.brand}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Size</label>
                    <input value={size} onChange={(e) => setSize(e.target.value)} className="w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta" />
                    {fieldErrors.size && <p className="mt-2 text-sm text-red-600">{fieldErrors.size}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Color</label>
                    <input value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta" />
                    {fieldErrors.color && <p className="mt-2 text-sm text-red-600">{fieldErrors.color}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Material</label>
                    <input value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta" />
                    {fieldErrors.material && <p className="mt-2 text-sm text-red-600">{fieldErrors.material}</p>}
                  </div>
                </div>
              </section>

              {/* Pricing & Location */}
              <section className="space-y-4 border-t border-border/50 pt-6">
                <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>Pricing & location</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Price (Rs.)</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink">Rs.</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="0"
                        className="w-full rounded-[12px] border border-border bg-white px-4 py-3 pl-12 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                      />
                    </div>
                    {fieldErrors.askingPrice && <p className="mt-2 text-sm text-red-600">{fieldErrors.askingPrice}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Meetup location</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                    >
                      <option value="">Select city</option>
                      {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan'].map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {fieldErrors.location && <p className="mt-2 text-sm text-red-600">{fieldErrors.location}</p>}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex flex-col gap-3 border-t border-border/70 bg-parchment/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-end md:px-7">
            <button type="button" onClick={() => router.back()} className="w-full rounded-[12px] border border-border bg-white px-6 py-3 text-[15px] font-medium text-charcoal transition-colors hover:bg-parchment-dark sm:w-auto">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="w-full rounded-[12px] bg-terracotta px-8 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:opacity-70 sm:w-auto">
              {loading ? 'Publishing...' : 'Publish listing'}
            </button>
          </div>
        </form>
      </div>
    </Protected>
  );
}
