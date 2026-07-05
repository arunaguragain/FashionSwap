"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {NGOsApi, resolveNgoPhotoUrl, AdminNGOsApi } from "@/lib/api/admin/ngos";
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

export default function AdminNGOEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!id) {
      setError("Missing NGO id.");
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    NGOsApi.getById(id)
      .then((result) => {
        if (!active) return;
        const ngo = result.data;
        setForm({
          name: ngo.name,
          registrationNumber: ngo.registrationNumber,
          contactPerson: ngo.contactPerson,
          phone: ngo.phone,
          email: ngo.email,
          address: ngo.address,
          focusAreas: ngo.focusAreas.join(", "),
          image: ngo.image ?? "",
        });
        if (ngo.image) {
          setPhotoPreview(resolveNgoPhotoUrl(ngo.image));
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load NGO.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const updateField = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    const [file] = Array.from(files);
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setForm((prev) => (prev ? { ...prev, image: prev.image } : prev));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setForm((prev) => (prev ? { ...prev, image: "" } : prev));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    if (!id) {
      setError("Missing NGO id.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const focusAreas = form.focusAreas
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await AdminNGOsApi.adminUpdate(
        id,
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

      router.push(`/admin/ngos/${id}`);
      pushToast({ title: 'NGO updated', description: 'NGO updated successfully', tone: 'success' });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data
          ?.message ??
        (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data
          ?.error ??
        (error as Error)?.message;
      pushToast({ title: 'Unable to update NGO', description: message || 'Unable to update NGO right now', tone: 'error' });
      setError(message ? `Unable to update NGO: ${message}` : "Unable to update NGO right now.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading NGO...</div>;
  }

  if (error && !form) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/admin/ngos")}
          className="mt-4 inline-flex text-sm font-semibold text-blue-600"
        >
          Back to NGOs
        </button>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit NGO</h1>
        <p className="text-sm text-gray-500">Update profile details and verification</p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="name">
              NGO name
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="registrationNumber">
              Registration number
            </label>
            <input
              id="registrationNumber"
              value={form.registrationNumber}
              onChange={(event) => updateField("registrationNumber", event.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900" htmlFor="contactPerson">
            Contact person
          </label>
          <input
            id="contactPerson"
            value={form.contactPerson}
            onChange={(event) => updateField("contactPerson", event.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-900" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
          />
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
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
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
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
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
                className="mt-2 text-xs font-semibold text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/admin/ngos/${id}`)}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
