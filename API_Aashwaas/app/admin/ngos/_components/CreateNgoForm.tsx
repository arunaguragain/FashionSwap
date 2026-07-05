"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNGOsApi } from "@/lib/api/admin/ngos";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

type FormState = {
  name: string;
  registrationNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  focusAreas: string;
  image: string;
};

export default function CreateNgoForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    registrationNumber: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    focusAreas: "",
    image: "",
  });
  

  const updateField = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    const [file] = Array.from(files);
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.registrationNumber.trim()) next.registrationNumber = "Registration number is required.";
    if (!form.contactPerson.trim()) next.contactPerson = "Contact person is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.phone.trim()) next.phone = "Phone is required.";
    if (!form.address.trim()) next.address = "Address is required.";
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const focusAreas = form.focusAreas
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const result = await AdminNGOsApi.adminCreate(
        {
          name: form.name,
          registrationNumber: form.registrationNumber,
          contactPerson: form.contactPerson,
          phone: form.phone,
          email: form.email,
          address: form.address,
          focusAreas,
          image: form.image,
        },
        photoFile
      );

      pushToast({ title: 'NGO created', description: 'NGO created successfully', tone: 'success' });
      router.push(`/admin/ngos/${result.data.id}`);
    } catch (error) {
      const responseData = (error as { response?: { data?: unknown; status?: number } })?.response?.data;
      const status = (error as { response?: { status?: number } })?.response?.status;
      const message =
        (responseData as { message?: string; error?: string } | undefined)?.message ??
        (responseData as { message?: string; error?: string } | undefined)?.error ??
        (error as Error)?.message;
      const details =
        typeof responseData === "string"
          ? responseData.slice(0, 300)
          : responseData
            ? JSON.stringify(responseData).slice(0, 300)
            : "";
      const responseText =
        typeof responseData === "string"
          ? responseData
          : responseData
            ? JSON.stringify(responseData)
            : "";
      pushToast({ title: 'Unable to create NGO', description: message || 'Unable to create NGO right now', tone: 'error' });
      setErrors({
        form: message
          ? `Unable to create NGO: ${message}`
          : status
            ? `Unable to create NGO: HTTP ${status}${details ? ` - ${details}` : ""}`
            : "Unable to create NGO right now.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Add NGO</h1>
        <p className="text-sm text-gray-600">Create a new NGO profile for the platform</p>
      </div>

      {errors.form && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        {saving && (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/70 p-6">
            <div className="w-full max-w-3xl animate-pulse">
              <div className="h-6 w-1/3 rounded bg-gray-200" />
              <div className="mt-4 h-8 w-full rounded bg-gray-200" />
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="h-8 rounded bg-gray-200" />
                <div className="h-8 rounded bg-gray-200" />
              </div>
              <div className="mt-3 h-40 rounded bg-gray-200" />
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="name">
              NGO name
            </label>
            <input
              id="name"
              placeholder="e.g. Helping Hands Foundation"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={saving}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
            
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="registrationNumber">
              Registration number
            </label>
            <input
              id="registrationNumber"
              placeholder="e.g. NGO-123456"
              value={form.registrationNumber}
              onChange={(event) => updateField("registrationNumber", event.target.value)}
              disabled={saving}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
            
            {errors.registrationNumber && (
              <p className="mt-1 text-xs text-rose-600">{errors.registrationNumber}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900" htmlFor="contactPerson">
            Contact person
          </label>
          <input
            id="contactPerson"
            placeholder="e.g. Rekha Singh"
            value={form.contactPerson}
            onChange={(event) => updateField("contactPerson", event.target.value)}
            disabled={saving}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
          />
          
          {errors.contactPerson && (
            <p className="mt-1 text-xs text-rose-600">{errors.contactPerson}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              placeholder="contact@ngo.org"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              disabled={saving}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
            
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              placeholder="e.g. 9800000000"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              disabled={saving}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
            
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            placeholder="e.g. Boudha, Kathmandu"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            disabled={saving}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
          />
          
          {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="focusAreas">
              Focus areas
            </label>
            <input
              id="focusAreas"
              value={form.focusAreas}
              onChange={(event) => updateField("focusAreas", event.target.value)}
              placeholder="Education, Shelter, Nutrition"
              disabled={saving}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
            
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="photos">
              Photo
            </label>
            <input
              id="photos"
              type="file"
              accept="image/*"
              onChange={(event) => handlePhotos(event.target.files)}
              disabled={saving}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm disabled:opacity-70"
            />
          </div>
        </div>

        {photoPreview && (
          <div>
            <p className="text-sm font-semibold text-gray-900">Preview</p>
            <div className="mt-3 max-w-sm rounded-lg border border-gray-200 p-2">
              <img src={photoPreview} alt="NGO photo preview" className="h-32 w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                disabled={saving}
                className="mt-2 text-xs font-semibold text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Create NGO"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="ml-3 inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
