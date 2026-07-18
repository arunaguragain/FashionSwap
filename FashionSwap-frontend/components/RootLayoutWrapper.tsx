"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Layout from "./Layout";

interface RootLayoutWrapperProps {
  children: ReactNode;
}

export default function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  const pathname = usePathname() || "/";
  
  // Don't apply Layout wrapper on auth pages
  const authPagePaths = ['/login', '/register', '/forgot-password', '/reset-password', '/mfa'];
  const isAuthPage = pathname ? authPagePaths.some((path) => pathname.startsWith(path)) : false;
  
  // Don't apply Layout wrapper on admin pages (admin has its own layout)
  const isAdminPage = pathname.startsWith('/admin');

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }
  
  // Apply Layout to non-auth, non-admin pages
  return <Layout>{children}</Layout>;
}
