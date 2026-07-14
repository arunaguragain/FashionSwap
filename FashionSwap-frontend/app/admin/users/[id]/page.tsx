"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/api/axios";

export default function Page() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const base = (axios.defaults && (axios.defaults as any).baseURL) ? (axios.defaults as any).baseURL : '';
                const url = `${base}/api/admin/users/${id}`;
                const headers: Record<string, string> = {};
                try {
                    const m = document.cookie.match(/(?:^|; )auth_token=([^;]+)/);
                    const token = m ? decodeURIComponent(m[1]) : null;
                    if (token) headers['Authorization'] = `Bearer ${token}`;
                } catch (e) {
                    // ignore
                }
                const res = await fetch(url, { headers });
                if (!res.ok) {
                    const txt = await res.text().catch(() => null);
                    throw new Error(txt || `Failed to fetch user (${res.status})`);
                }
                const json = await res.json();
                if (mounted) setUser(json.data ?? json);
            } catch (err: any) {
                if (mounted) setError(err?.message || 'Unable to load user');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchUser();
        return () => { mounted = false };
    }, [id]);

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">{user?.name || 'User'}</h1>
                    <p className="text-sm text-gray-500">User ID: {id}</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/admin/users/${id}/edit`} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Edit</Link>
                    <Link href="/admin/users" className="rounded-full border border-sky-600 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50">Back to list</Link>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                {loading ? (
                    <div className="text-sm text-gray-600">Loading…</div>
                ) : error ? (
                    <div className="text-sm text-rose-600">{error}</div>
                ) : user ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-start">
                        <div className="md:col-span-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact</h3>
                            <div className="text-sm text-gray-600 space-y-3">
                                <div><span className="font-medium text-gray-900">Email:</span> {user.email || '—'}</div>
                                {user.phone && <div><span className="font-medium text-gray-900">Phone:</span> {user.phone}</div>}
                                {user.address && <div><span className="font-medium text-gray-900">Address:</span> {user.address}</div>}
                            </div>

                            <hr className="my-6" />

                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Details</h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <div><span className="font-medium text-gray-900">Role:</span> {user.role || 'user'}</div>
                                <div><span className="font-medium text-gray-900">Joined:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
                                <div><span className="font-medium text-gray-900">ID:</span> {user._id || user.id}</div>
                            </div>
                        </div>

                        <div className="md:col-span-8">
                            <div className="rounded-xl border border-gray-100 p-6">
                                <div className="w-full overflow-hidden rounded-2xl">
                                    <img
                                        src={user.profilePicture ? `${(axios.defaults as any).baseURL}/item_photos/${user.profilePicture}` : '/images/user.png'}
                                        alt="user photo"
                                        className="w-full h-72 object-cover rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-600">User not found.</div>
                )}
            </div>
        </div>
    );
}