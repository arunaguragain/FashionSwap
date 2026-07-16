import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // Don't apply the main Layout component to auth pages
  // This prevents hydration issues and allows auth pages to render cleanly
  return (
    <main className="flex-1 min-h-screen bg-parchment">
      {children}
    </main>
  );
}
