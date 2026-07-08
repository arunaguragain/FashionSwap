"use client";

import React from 'react';
import Button from '../../components/common/Button';

import Protected from '../../components/common/Protected';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getMyListings } from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyListings();
        setMyListings(res?.data ?? res ?? []);
      } catch (e) {}
    })();
  }, []);

  return (
    <Protected>
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="mb-2">Name: {user?.name || user?.fullName || '—'}</p>
        <p className="mb-2">Email: {user?.email || '—'}</p>
        <div className="mt-4">
          <Button>Edit profile</Button>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">My Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myListings.length === 0 ? (
            <>
              <div className="p-4 border rounded bg-white"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" /></div>
              <div className="p-4 border rounded bg-white"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" /></div>
            </>
          ) : myListings.map((l) => (
            <div key={l.id || l._id} className="p-4 border rounded bg-white">{l.title || l.name || 'Untitled'}</div>
          ))}
        </div>
      </section>
    </div>
    </Protected>
  );
}
