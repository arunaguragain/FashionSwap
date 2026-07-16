"use client";

import React, { useEffect, useState } from 'react';
import Protected from '../../components/common/Protected';
import { BellRing, ShieldCheck, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { disableMfa, deactivateAccount } from '@/lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState('show');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { user, setUser, checkAuth, logout } = useAuth();
  const router = useRouter();
  const { pushToast } = useToast();

  const [showDisableMfa, setShowDisableMfa] = useState(false);
  const [mfaPassword, setMfaPassword] = useState('');
  const [mfaDisabling, setMfaDisabling] = useState(false);
  const [showMfaPassword, setShowMfaPassword] = useState(false);

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

  const handleDeactivate = async () => {
    if (!mfaPassword) return pushToast({ title: 'Password required', description: 'Please enter your password to deactivate your account.', tone: 'info' });
    setMfaDisabling(true);
    try {
      await deactivateAccount(mfaPassword);
      pushToast({ title: 'Account deactivated', description: 'Your account has been deactivated.', tone: 'success' });
      await logout();
    } catch (e: unknown) {
      pushToast({ title: 'Failed to deactivate', description: e instanceof Error ? e.message : 'Incorrect password', tone: 'error' });
    } finally {
      setMfaDisabling(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!mfaPassword) return pushToast({ title: 'Password required', description: 'Please enter your password to disable MFA.', tone: 'info' });
    setMfaDisabling(true);
    try {
      await disableMfa(mfaPassword);
      pushToast({ title: 'MFA Disabled', description: 'Two-factor authentication has been turned off.', tone: 'success' });
      setShowDisableMfa(false);
      setMfaPassword('');
      // Force user data refresh to update context
      if (user) {
         setUser({ ...user, mfaEnabled: false });
         // optionally, update cookie:
         if (typeof window !== 'undefined') {
             // Refresh the authenticated user so the current MFA state is reflected everywhere.
             await checkAuth();
         }
      }
    } catch (e: unknown) {
      pushToast({ title: 'Failed to disable MFA', description: e instanceof Error ? e.message : 'Incorrect password', tone: 'error' });
    } finally {
      setMfaDisabling(false);
    }
  };

  return (
    <Protected>
      <div className="w-full px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="w-full overflow-hidden rounded-[24px] border border-border/80 bg-white shadow-[0_18px_48px_rgba(53,39,30,0.08)]">
          <div className="grid items-start gap-0 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="border-b border-border/70 bg-parchment/70 p-6 sm:p-8 xl:border-b-0 xl:border-r">
              <span className="inline-flex items-center rounded-full border border-terracotta/15 bg-terracotta/10 px-3 py-1 text-xs font-semibold tracking-wide text-terracotta-dark">
                Account preferences
              </span>
              <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-charcoal sm:text-4xl">
                Settings
              </h1>
              <p className="mt-3 text-sm leading-6 text-ink">
                Manage notifications, profile visibility, account security, and sensitive account actions from one place.
              </p>

              <div className="mt-6 grid gap-2 text-sm text-charcoal-soft sm:grid-cols-3 xl:grid-cols-1">
                <p className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2"><span className="h-2 w-2 rounded-full bg-terracotta" />Notifications</p>
                <p className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2"><span className="h-2 w-2 rounded-full bg-sage" />Profile & privacy</p>
                <p className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2"><span className="h-2 w-2 rounded-full bg-charcoal" />Security</p>
              </div>
            </aside>

            <section>
              <div className="border-b border-border/70 px-6 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">Your preferences</p>
                <h2 className="mt-1.5 font-display text-2xl font-bold text-charcoal">Account controls</h2>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
              
              <label className="group flex cursor-pointer items-center justify-between gap-5 rounded-[16px] border border-border/80 bg-parchment/50 p-4 transition-all hover:border-terracotta/50 hover:bg-terracotta/[0.035] sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta transition-transform group-hover:scale-105">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-charcoal">Email notifications</p>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-ink">
                      Receive updates about offers, orders, and new messages directly to your inbox.
                    </p>
                  </div>
                </div>
                <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${notifications ? 'bg-terracotta' : 'bg-border'}`}>
                  <input type="checkbox" checked={notifications} onChange={() => setNotifications((value) => !value)} className="sr-only" />
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </span>
              </label>

              <div className="rounded-[16px] border border-border/80 bg-parchment/50 p-4 transition-colors hover:border-sage/50 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-sage">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="w-full">
                    <p className="text-[16px] font-semibold text-charcoal">Profile visibility</p>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-ink">
                      Choose whether buyers can see your full profile information.
                    </p>
                    <div className="mt-4 max-w-md">
                      <select 
                        value={privacy} 
                        onChange={(event) => setPrivacy(event.target.value)} 
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                      >
                        <option value="show">Show profile to buyers</option>
                        <option value="limited">Show only basic details</option>
                        <option value="hide">Hide profile from buyers</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* MFA Settings */}
              <div className="rounded-[16px] border border-border/80 bg-parchment/50 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-charcoal/10 text-charcoal">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[16px] font-semibold text-charcoal">Two-factor authentication</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user?.mfaEnabled ? 'bg-sage/15 text-sage-dark' : 'bg-border/70 text-ink'}`}>{user?.mfaEnabled ? 'Protected' : 'Not enabled'}</span>
                        </div>
                        <p className="mt-1 text-sm text-ink leading-relaxed max-w-md">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      
                      {!showDisableMfa && (
                        user?.mfaEnabled ? (
                          <button 
                            onClick={() => setShowDisableMfa(true)}
                            className="shrink-0 rounded-xl border border-border bg-white px-6 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-parchment-dark"
                          >
                            Disable
                          </button>
                        ) : (
                          <button 
                            onClick={() => router.push('/mfa/setup')}
                            className="shrink-0 rounded-xl bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-terracotta-dark"
                          >
                            Enable
                          </button>
                        )
                      )}
                    </div>

                    {showDisableMfa && (
                      <div className="mt-4 rounded-xl border border-red-100 bg-white p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm font-medium text-charcoal mb-3">Verify your password to disable MFA</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <input 
                              type={showMfaPassword ? "text" : "password"}
                              value={mfaPassword}
                              onChange={(e) => setMfaPassword(e.target.value)}
                              placeholder="Enter your current password"
                              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-charcoal outline-none focus:border-terracotta"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setShowMfaPassword(!showMfaPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink hover:text-charcoal"
                            >
                              {showMfaPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setShowDisableMfa(false); setMfaPassword(''); }}
                              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-parchment"
                              disabled={mfaDisabling}
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleDisableMFA}
                              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                              disabled={mfaDisabling}
                            >
                              {mfaDisabling ? 'Disabling...' : 'Confirm Disable'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-5">
                <p className="text-sm text-ink">Changes are saved only when you confirm.</p>
                <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleSave} 
                  className="rounded-xl bg-terracotta px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(196,98,45,0.2)] transition-colors hover:bg-terracotta-dark"
                >
                  Save settings
                </button>
                {saved && (
                  <span className="text-sm font-medium text-sage-dark bg-sage/12 px-4 py-2 rounded-full animate-in fade-in zoom-in duration-300">
                    Saved successfully
                  </span>
                )}
                </div>
              </div>

              <div className="rounded-[16px] border border-red-200/80 bg-red-50/70 p-4 sm:p-5">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[16px] font-semibold text-red-700">Deactivate account</p>
                    <p className="mt-1 text-sm text-red-600/80">
                      Deactivating your account will hide your profile and active listings. You will not be able to log in until you reactivate it.
                    </p>
                  </div>
                  {!confirmDelete ? (
                    <div className="flex sm:justify-start mt-2">
                      <button 
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-[15px] font-medium text-red-600 transition-colors hover:bg-red-50" 
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Deactivate account
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-red-200 bg-white p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <p className="text-sm font-medium text-red-700 mb-3">Verify your password to confirm deactivation</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input 
                            type={showMfaPassword ? "text" : "password"}
                            value={mfaPassword}
                            onChange={(e) => setMfaPassword(e.target.value)}
                            placeholder="Enter your current password"
                            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-charcoal outline-none focus:border-terracotta"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowMfaPassword(!showMfaPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink hover:text-charcoal"
                          >
                            {showMfaPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-parchment" 
                            onClick={() => { setConfirmDelete(false); setMfaPassword(''); }}
                            disabled={mfaDisabling}
                          >
                            Cancel
                          </button>
                          <button 
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                            onClick={handleDeactivate}
                            disabled={mfaDisabling}
                          >
                            {mfaDisabling ? 'Deactivating...' : 'Confirm deactivate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              </div>
            </section>
          </div>
        </div>
      </div>
    </Protected>
  );
}
