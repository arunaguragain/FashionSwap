"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import { API } from "@/lib/api/endpoints";

interface Props {
  userType: "Admin" | "User";
  autoLogin?: boolean;
}

export default function GoogleSignIn({ userType, autoLogin = true }: Props) {
  const router = useRouter();
  const { setIsAuthenticated, setUser } = useAuth();
  let pushToast: (t: any) => void | null = () => {};

  // utility to decode a base64url JWT payload
  function parseJwt(token: string): Record<string, any> {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  }
  try {
    // @ts-ignore
    const toastCtx = useToast();
    pushToast = toastCtx.pushToast;
  } catch (e) {
    // fallback: use react-toastify if available
    pushToast = (t: any) => {
      try { toast(t.title || t.description || ''); } catch (e) {}
    };
  }
  const [gsiStatus, setGsiStatus] = React.useState<string>("loading");

  useEffect(() => {
    const id = "google-client-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.id = id;
      document.head.appendChild(s);
      s.onload = () => initClient();
    } else {
      initClient();
    }

    function initClient() {
      // @ts-ignore
      const googleObj = window.google;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!googleObj || !clientId) return;

      try {
        // @ts-ignore
        googleObj.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (!response?.credential) return;
            (async () => {
              try {
                // for login flow, make a quick email-existence check before the
                // primary request.  this prevents account creation when the server
                // wrongly upserts on login.
                if (autoLogin) {
                  const payload = parseJwt(response.credential);
                  const email = payload.email;
                  if (email) {
                    try {
                      const existsResp = await fetch(
                        `${API.AUTH.EXISTS}?email=${encodeURIComponent(email)}`
                      );
                      if (existsResp.ok) {
                        const { exists } = await existsResp.json();
                        if (!exists) {
                          try {
                            pushToast({
                              title: 'No account found - please register first',
                              tone: 'error',
                            });
                          } catch (_) {}
                          return; // abort early
                        }
                      }
                      // if response not ok, ignore and continue; backend may not support endpoint
                    } catch (e) {
                      console.error('email check failed', e);
                      // log error but don't block login – backend fix required
                    }
                  }
                }

                // always send an explicit action so the server can differentiate
              // between login (existing account only) and register (create new user).
              const payloadBody: Record<string, any> = {
                idToken: response.credential,
                action: autoLogin ? 'login' : 'register',
              };

                const r = await fetch(`/api/auth/google`, {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payloadBody),
                });
                try {                 
                  const headers: Record<string,string> = {};
                  r.headers.forEach((v,k) => { headers[k]=v });
                } catch(e) {
                }
                let data: any = null;
                const contentType = r.headers.get("content-type") || "";
                if (!r.ok) {
                  try {
                    if (contentType.includes("application/json")) {
                      const errJson = await r.json();
                      try { pushToast({ title: errJson?.message || 'Request failed', description: undefined, tone: 'error' }); } catch(_) {}
                    } else {
                      const txt = await r.text().catch(() => null);
                      try { pushToast({ title: txt || 'Request failed', tone: 'error' }); } catch(_) {}
                    }
                  } catch (e) {
                    try { pushToast({ title: 'Request failed', tone: 'error' }); } catch(_) {}
                  }
                  return;
                }

                try {
                  if (contentType.includes("application/json")) {
                    data = await r.json();
                  } else {
                    const txt = await r.text().catch(() => null);
                    // Non-JSON successful response: show it and stop
                    try { pushToast({ title: txt || 'Unexpected server response', tone: 'error' }); } catch(_) {}
                    return;
                  }
                } catch(e) {
                  console.error('invalid json body', e);
                  try { pushToast({ title: 'Invalid server response', tone: 'error' }); } catch(_) {}
                  return;
                }

                if (data?.success) {
                  // if we're on the login page and the server responded with a freshly
                  // created user (this is the bug the user reported), treat that as a
                  // failure rather than silently logging them in.  the backend should
                  // reject, but some instances still return success+token.
                  const newUserIndicator =
                    data.newUser || data.created || data.isNew ||
                    (typeof data.message === 'string' && /register|created|new user/i.test(data.message));

                  if (autoLogin && newUserIndicator) {
                    try { pushToast({ title: 'No account found - please register first', tone: 'error' }); } catch (e) {}
                    return; // don't treat as a successful login
                  }

                  if (!autoLogin) {
                    // when creating a new account we don't want confusing server messages
                    try { pushToast({ title: 'Account created', description: 'Please login.', tone: 'success' }); } catch (e) {}
                    const loginPath = userType === 'Admin' ? '/admin_login' : '/login';
                    try { (router.push as any)(loginPath); } catch (e) { try { window.location.href = loginPath; } catch (_) {} }
                    return;
                  }

                  if (data.token) {
                    try { localStorage.setItem("auth_token", data.token); } catch(e){}
                  }
                  if (data.data) {
                    try { localStorage.setItem("user_data", JSON.stringify(data.data)); } catch(e){}
                    setUser && setUser(data.data);
                  }
                  try {
                    if (typeof document !== 'undefined' && data.token) {
                      const maxAge = 60 * 60 * 24 * 30; // 30 days
                      document.cookie = `auth_token=${encodeURIComponent(data.token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
                    }
                    if (typeof document !== 'undefined' && data.data) {
                      const ud = encodeURIComponent(JSON.stringify(data.data));
                      const maxAge = 60 * 60 * 24 * 30;
                      document.cookie = `user_data=${ud}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
                    }
                    // cookies set for client-side checks
                  } catch (e) {
                    console.error('Could not set cookies in client', e);
                  }
                  setIsAuthenticated && setIsAuthenticated(true);
                  const userRole = data.data?.role?.toLowerCase();
                  let redirectPath = "/profile";
                  if (userRole === "admin") redirectPath = "/admin/dashboard";
                  try {
                    // attempt client-side navigation
                    const pushResult = (router.push as any)(redirectPath);
                    // Normalize to a promise for awaiting if possible
                    const pushPromise = pushResult && typeof pushResult.then === 'function'
                      ? pushResult
                      : Promise.resolve(pushResult);

                    // Wait briefly for router to perform navigation
                    let navigated = false;
                    try {
                      await Promise.race([
                        pushPromise,
                        new Promise((res) => setTimeout(res, 600)),
                      ]);
                      // check location after attempt
                      navigated = window.location.pathname === redirectPath;
                    } catch (e) {
                      console.error('router.push promise rejected', e);
                    }

                    if (!navigated) {
                      // fallback to full redirect
                      window.location.href = redirectPath;
                    }
                  } catch (e) {
                    console.error('Redirect failed', e);
                    try {
                      window.location.href = redirectPath;
                    } catch (_) {}
                  }
                } else {
                  try { pushToast({ title: data?.message || 'Google sign-in failed', tone: 'error' }); } catch (e) { }
                }
              } catch (err) {
                console.error("Google sign-in request failed", err);
                try { pushToast({ title: 'Google sign-in failed', tone: 'error' }); } catch (e) {}
              }
            })();
          },
        });

        // Always render Google's popup button (avoids FedCM/prompt flow which may be disabled)
        try {
          const renderWhenReady = (attempts = 0) => {
              const container = document.getElementById("googleBtnHidden");
              if (container) {
                try {
                  // @ts-ignore
                  googleObj.accounts.id.renderButton(container, { theme: "outline", size: "large" });
                  setGsiStatus("button-rendered");
                  return;
                } catch (e) {
                  // If renderButton fails, try again after a delay
                  setTimeout(() => renderWhenReady(attempts + 1), 200);
                  return;
                }
              }
              setGsiStatus("no-container");
            };
          renderWhenReady(0);
        } catch (e) {
          console.error("GSI render error", e);
          setGsiStatus("render-error");
        }

        setGsiStatus((s) => (s === "loading" ? "initialized" : s));
      } catch (err) {
        console.error("GSI initialize error", err);
        setGsiStatus("init-error");
      }
    }
  }, [router]);

  const handleClick = () => {
    const btn = document.getElementById("googleBtnHidden")?.querySelector("button, div[role=button]");
    if (!btn) {
      pushToast({ title: "Google sign-in not ready", description: "Please try again.", tone: "info" });
    }
  };

  return (
    <div className="w-full">
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            const hidden = document.getElementById("googleBtnHidden");
            const inner = hidden?.querySelector("button, div[role=button]") as HTMLElement | null;
            if (inner) {
              try { inner.click(); } catch (e) { inner.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); }
            } else {
              try { pushToast({ title: 'Google sign-in not ready', description: 'Please try again.', tone: 'info' }); } catch(e){}
            }
          }}
          className="w-full flex items-center justify-center gap-3 bg-white border border-border text-charcoal py-3 rounded-[12px] text-[15px] font-medium hover:bg-parchment-dark transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div
          id="googleBtnHidden"
          style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
          aria-hidden="true"
        />
      </div>

      <style jsx>{`
        /* Keep the hidden container visually off-screen but present in DOM so its internal control can be clicked */
        #googleBtnHidden { overflow: hidden; }
      `}</style>
    </div>
  );
}
