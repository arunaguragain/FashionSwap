import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "@/lib/cookie";

const publicRoutes = [
    '/admin_login',
    '/donor_login',
    '/volunteer_login',
    '/donor_register',
    '/volunteer_register',
    '/forget-password'
];
const adminRoutes = ['/admin'];
const userRoutes = ['/user'];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = await getAuthToken();
    const user = token ? await getUserData() : null;

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isUserRoute = userRoutes.some(route => pathname.startsWith(route));
    
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/donor_login', req.url));
    }

    if (token && user) {
        if (isAdminRoute && user.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
        // User routes - all authenticated users
        if (isUserRoute && user.role !== 'admin' && user.role !== 'donor' && user.role !== 'volunteer') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    if (isPublicRoute && token && user) {
        // Redirect authenticated users to their respective dashboards
        if (user.role === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        } else if (user.role === 'donor') {
            return NextResponse.redirect(new URL('/user/donor/dashboard', req.url));
        } else if (user.role === 'volunteer') {
            return NextResponse.redirect(new URL('/user/volunteer/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/user/:path*',
        '/admin_login',
        '/donor_login',
        '/volunteer_login',
        '/donor_register',
        '/volunteer_register',
        '/forget-password'
    ]
}
