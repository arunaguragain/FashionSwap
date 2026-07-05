"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import { API } from "@/lib/api/endpoints";

interface Props {
  userType: "Admin" | "Donor" | "Volunteer";
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
                    const loginPath = userType === 'Donor' ? '/donor_login' : userType === 'Volunteer' ? '/volunteer_login' : '/admin_login';
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
                  let redirectPath = "/auth/dashboard";
                  if (userRole === "donor") redirectPath = "/user/donor/dashboard";
                  else if (userRole === "volunteer") redirectPath = "/user/volunteer/dashboard";
                  else if (userRole === "admin") redirectPath = "/admin/dashboard";
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
          className="w-full h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200 shadow-lg overflow-hidden"
        >
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 flex items-center justify-center">
              <img src="/images/search.png" alt="Google" width={20} height={20} style={{ display: 'block' }} />
            </span>
            <span className="text-sm text-gray-800">Sign in with Google</span>
          </span>
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
