"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@/lib/api/axios";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

export default function EditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const base = (axios.defaults && (axios.defaults as any).baseURL) ? (axios.defaults as any).baseURL : '';
        const url = `${base}/api/admin/users/${id}`;
        const headers: Record<string, string> = {};
        try {
          const m = document.cookie.match(/(?:^|; )auth_token=([^;]+)/);
          const token = m ? decodeURIComponent(m[1]) : null;
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {}
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        const u = json.data ?? json;
        if (mounted) setForm({ name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(), email: u.email || '', role: u.role || 'user' });
        if (mounted && u.profilePicture) {
          const p = `${(axios.defaults as any).baseURL}/item_photos/${u.profilePicture}`;
          setPreview(p);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Unable to load user');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUser();
    return () => { mounted = false };
  }, [id]);

  const onFile = (f?: File) => {
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const base = (axios.defaults && (axios.defaults as any).baseURL) ? (axios.defaults as any).baseURL : '';
      const url = `${base}/api/admin/users/${id}`;
      const formData = new FormData();
      // try to split name into first/last minimally
      const parts = (form.name || '').trim().split(/\s+/);
      formData.append('name', form.name || '');
      formData.append('email', form.email || '');
      formData.append('role', form.role || 'user');
      if (file) {
        formData.append('image', file);
      }

      // (removed debug logging)

      const headers: Record<string, string> = {};
      try {
        const m = document.cookie.match(/(?:^|; )auth_token=([^;]+)/);
        const token = m ? decodeURIComponent(m[1]) : null;
        if (token) headers['Authorization'] = `Bearer ${token}`;
      } catch (e) {}

      const res = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        let txt: string | null = null;
        try {
          if (ct.includes('application/json')) {
            const j = await res.json().catch(() => null);
            txt = j ? JSON.stringify(j) : null;
          } else {
            txt = await res.text().catch(() => null);
          }
        } catch (e) {
          txt = null;
        }
        // Ensure we log a safe string and surface a readable error
        const safeText = txt == null ? `Save failed (${res.status})` : String(txt);
        // (removed debug logging)
        throw new Error(safeText);
      }
      pushToast({ title: 'User updated', description: 'User saved successfully', tone: 'success' });
      router.push('/admin/users');
    } catch (err: any) {
      setError(err?.message || 'Unable to save user');
      pushToast({ title: 'Unable to save user', description: err?.message || 'Unable to save user', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
        <p className="text-sm text-gray-500">Modify user details and profile picture</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-6">
            {error && <div className="text-sm text-rose-600">{error}</div>}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="col-span-1 flex flex-col items-center">
                <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100">
                  {preview ? (
                    <img src={preview} className="h-full w-full object-cover" alt="preview" />
                  ) : (
                    <img src="/images/user.png" className="h-full w-full object-cover" alt="placeholder" />
                  )}
                </div>
                <div className="mt-3">
                  <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files ? e.target.files[0] : undefined)} />
                  {preview && <div className="mt-2 text-sm text-rose-600"><button type="button" onClick={() => onFile()}>Remove</button></div>}
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Name</label>
                  <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Role</label>
                  <div className="relative mt-1">
                    <select
                      value={form.role}
                      onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
                      className="appearance-none w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="donor">Donor</option>
                      <option value="admin">Admin</option>
                      <option value="volunteer">Volunteer</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={saving} className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">{saving ? 'Saving…' : 'Save'}</button>
                  <button type="button" onClick={() => router.back()} className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
