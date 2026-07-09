"use client";

import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Protected from '../../components/common/Protected';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState('show');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('fashionSwap-settings');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (typeof parsed.notifications === 'boolean') {
        setNotifications(parsed.notifications);
      }
      if (typeof parsed.privacy === 'string') {
        setPrivacy(parsed.privacy);
      }
    } catch (error) {
      console.error('Unable to load saved settings', error);
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('fashionSwap-settings', JSON.stringify({ notifications, privacy }));
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Protected>
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Preferences</p>
          <h1 className="text-2xl font-semibold text-slate-900">Account settings</h1>
          <p className="text-sm text-slate-500">Fine-tune how FashionSwap communicates with you and how your profile appears.</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div>
              <p className="font-medium text-slate-900">Email notifications</p>
              <p className="text-sm text-slate-500">Receive updates about offers, orders, and new messages.</p>
            </div>
            <input type="checkbox" checked={notifications} onChange={() => setNotifications((value) => !value)} className="h-5 w-5 rounded border-slate-300" />
          </label>

          <label className="block rounded-xl border border-slate-200 p-4">
            <p className="font-medium text-slate-900">Profile visibility</p>
            <p className="mb-3 text-sm text-slate-500">Choose whether buyers can see your profile information.</p>
            <select value={privacy} onChange={(event) => setPrivacy(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="show">Show profile to buyers</option>
              <option value="limited">Show only basic details</option>
              <option value="hide">Hide profile from buyers</option>
            </select>
          </label>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>Save settings</Button>
            {saved ? <span className="text-sm text-emerald-600">Saved successfully</span> : null}
          </div>
        </div>
      </div>
    </Protected>
  );
}
