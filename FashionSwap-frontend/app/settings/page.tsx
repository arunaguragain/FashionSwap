"use client";

import React, { useEffect, useState } from 'react';
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
      <div className="w-full px-6 py-10 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Left Column: Page Info */}
          <div className="lg:col-span-4 xl:col-span-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-terracotta/12 text-terracotta-dark mb-4">
              Preferences
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>
              Account settings
            </h1>
            <p className="mt-4 text-[15px] text-ink leading-relaxed">
              Fine-tune how FashionSwap communicates with you and how your profile appears to other users.
            </p>
          </div>

          {/* Right Column: Settings Form */}
          <div className="lg:col-span-8 xl:col-span-7 xl:col-start-5">
            <div className="space-y-6 rounded-[20px] bg-white border border-border/60 p-6 md:p-10 shadow-sm">
              
              <label className="flex items-center justify-between rounded-[16px] border border-border bg-parchment p-6 cursor-pointer hover:border-terracotta/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-terracotta/10 text-terracotta">
                    <BellRing className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-[17px]">Email notifications</p>
                    <p className="mt-1 text-sm text-ink leading-relaxed max-w-md">
                      Receive updates about offers, orders, and new messages directly to your inbox.
                    </p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={() => setNotifications((value) => !value)} 
                  className="h-5 w-5 rounded border-border accent-terracotta" 
                />
              </label>

              <label className="block rounded-[16px] border border-border bg-parchment p-6 cursor-pointer hover:border-terracotta/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-sage/10 text-sage">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="w-full">
                    <p className="font-semibold text-charcoal text-[17px]">Profile visibility</p>
                    <p className="mt-1 text-sm text-ink leading-relaxed max-w-md">
                      Choose whether buyers can see your full profile information.
                    </p>
                    <div className="mt-5 max-w-sm">
                      <select 
                        value={privacy} 
                        onChange={(event) => setPrivacy(event.target.value)} 
                        className="w-full rounded-[12px] border border-border bg-white px-4 py-3.5 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                      >
                        <option value="show">Show profile to buyers</option>
                        <option value="limited">Show only basic details</option>
                        <option value="hide">Hide profile from buyers</option>
                      </select>
                    </div>
                  </div>
                </div>
              </label>

              <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border/40">
                <button 
                  onClick={handleSave} 
                  className="bg-terracotta text-white px-8 py-3.5 rounded-[14px] text-[15px] font-medium hover:bg-terracotta-dark transition-colors"
                >
                  Save settings
                </button>
                {saved && (
                  <span className="text-sm font-medium text-sage-dark bg-sage/12 px-4 py-2 rounded-full animate-in fade-in zoom-in duration-300">
                    Saved successfully
                  </span>
                )}
              </div>

              <div className="mt-10 rounded-[16px] border border-red-200 bg-red-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-red-700 text-[17px]">Delete account</p>
                    <p className="mt-1 text-sm text-red-600/80">
                      This action is irreversible and requires confirmation.
                    </p>
                  </div>
                  {!confirmDelete ? (
                    <button 
                      className="inline-flex items-center gap-2 border border-red-200 text-red-600 bg-white px-5 py-3 rounded-[12px] text-[15px] font-medium hover:bg-red-50 transition-colors" 
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete account
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button 
                        className="border border-border text-charcoal bg-white px-5 py-3 rounded-[12px] text-[15px] font-medium hover:bg-parchment-dark transition-colors" 
                        onClick={() => setConfirmDelete(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="bg-red-600 text-white px-5 py-3 rounded-[12px] text-[15px] font-medium hover:bg-red-700 transition-colors"
                      >
                        Confirm delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
