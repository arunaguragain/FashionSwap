"use client";

import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Protected from '../../components/common/Protected';
import { BellRing, ShieldCheck, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState('show');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Preferences</p>
          <h1 className="mt-2 font-headline text-3xl text-on-surface">Account settings</h1>
          <p className="mt-2 text-sm leading-7 text-on-surface-variant">Fine-tune how FashionSwap communicates with you and how your profile appears.</p>
        </div>

        <div className="space-y-4 rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-6 shadow-[0_24px_80px_rgba(27,28,25,0.06)] sm:p-8">
          <label className="flex items-center justify-between rounded-[1.25rem] border border-outline/15 bg-surface-container-low p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary"><BellRing className="h-4 w-4" /></div>
              <div>
                <p className="font-semibold text-on-surface">Email notifications</p>
                <p className="mt-1 text-sm text-on-surface-variant">Receive updates about offers, orders, and new messages.</p>
              </div>
            </div>
            <input type="checkbox" checked={notifications} onChange={() => setNotifications((value) => !value)} className="h-5 w-5 rounded border-outline/30 accent-primary" />
          </label>

          <label className="block rounded-[1.25rem] border border-outline/15 bg-surface-container-low p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary"><ShieldCheck className="h-4 w-4" /></div>
              <div className="w-full">
                <p className="font-semibold text-on-surface">Profile visibility</p>
                <p className="mt-1 text-sm text-on-surface-variant">Choose whether buyers can see your profile information.</p>
                <select value={privacy} onChange={(event) => setPrivacy(event.target.value)} className="mt-4 w-full rounded-2xl border border-outline/30 bg-surface-container-lowest px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15">
                  <option value="show">Show profile to buyers</option>
                  <option value="limited">Show only basic details</option>
                  <option value="hide">Hide profile from buyers</option>
                </select>
              </div>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave}>Save settings</Button>
            {saved ? <span className="text-sm text-secondary">Saved successfully</span> : null}
          </div>

          <div className="rounded-[1.25rem] border border-error/20 bg-error/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-error">Delete account</p>
                <p className="mt-1 text-sm text-error/80">This action is irreversible and requires confirmation.</p>
              </div>
              {!confirmDelete ? (
                <Button variant="secondary" className="border-error/20 text-error hover:bg-error/10" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />Delete account
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="border-error/20 text-error hover:bg-error/10" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  <Button className="bg-error text-on-error hover:bg-error/90">Confirm delete</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
