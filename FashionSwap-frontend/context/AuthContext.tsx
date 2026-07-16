"use client"
import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { clearAuthCookies } from "@/lib/cookie";
import { useRouter, usePathname } from "next/navigation";
import { whoAmI } from '@/lib/api/auth';

interface AuthContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    user: any;
    setUser: (user: any) => void;
    logout: () => Promise<void>;
    loading: boolean;
    checkAuth: (force?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
const AUTH_PAGE_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);

    // Keep ref in sync with pathname
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    const checkAuth = useCallback(async (force = false) => {
        // Use ref to get current pathname without stale closure
        const currentPathnameValue = pathnameRef.current;
        const currentIsAuthPage = currentPathnameValue ? AUTH_PAGE_PATHS.some((path) => currentPathnameValue.startsWith(path)) || currentPathnameValue.startsWith('/mfa') : false;
        
        // If not forcing, skip fetch on auth pages to avoid noisy failed requests
        if (currentIsAuthPage && !force) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await whoAmI();
            setUser(data);
            setIsAuthenticated(true);
        } catch (err) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const logout = async () => {
        try {
            await clearAuthCookies();
            setIsAuthenticated(false);
            setUser(null);
            router.push("/login");
        } catch (error) {
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, logout, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

