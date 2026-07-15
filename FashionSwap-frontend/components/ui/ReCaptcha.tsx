"use client";

import { useEffect, useRef, useState } from "react";

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export default function ReCaptcha({ onVerify, onExpire, onError }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<number | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
      console.warn("reCAPTCHA site key not found");
      return;
    }

    // Callback that Google calls once the script loads
    if (typeof window !== "undefined") {
      (window as any).onReCaptchaLoad = () => {
        if (containerRef.current && (window as any).grecaptcha && !containerRef.current.hasChildNodes()) {
          try {
            const id = (window as any).grecaptcha.render(containerRef.current, {
              sitekey: siteKey,
              callback: onVerify,
              "expired-callback": onExpire,
              "error-callback": onError,
            });
            setWidgetId(id);
          } catch (e) {
            console.error("reCAPTCHA render error", e);
          }
        }
      };
    }

    // Load the script if not already loaded
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
      // Script is already loaded, render immediately
      if (containerRef.current && widgetId === null && !containerRef.current.hasChildNodes()) {
        try {
          const id = (window as any).grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            "expired-callback": onExpire,
            "error-callback": onError,
          });
          setWidgetId(id);
        } catch (e) {
          console.error("reCAPTCHA render error", e);
        }
      }
    }

    return () => {
      // Google's script attaches event listeners to window and tries to access the DOM.
      // Calling reset() while React is actively destroying the node causes a "Cannot read properties of null (reading 'style')" error.
      // We intentionally do nothing here to let the browser garbage collect the iframe safely.
    };
  }, [onVerify, onExpire, onError]); // Be careful not to change these functions frequently

  return <div ref={containerRef} className="my-3 min-h-[78px]"></div>;
}
