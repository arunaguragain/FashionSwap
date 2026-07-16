import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "@/lib/cookie";

const publicRoutes = [
    '/admin_login',
    '/login',
    '/register',
    '/forget-password'
];
const adminRoutes = ['/admin'];
const userRoutes = ['/user', '/saved'];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = await getAuthToken();
    const user = token ? await getUserData() : null;

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isUserRoute = userRoutes.some(route => pathname.startsWith(route));
    
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (token && user) {
        if (isAdminRoute && user.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
        // User routes - all authenticated users
        if (isUserRoute && user.role !== 'admin' && user.role !== 'buyer' && user.role !== 'seller' && user.role !== 'user') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/user/:path*',
        '/saved',
    ]
}
