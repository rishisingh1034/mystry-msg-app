import { NextResponse, NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    // Add detailed logging
    console.log('Middleware executing');
    console.log('Current path:', request.nextUrl.pathname);

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    console.log('Token:', token ? 'Present' : 'Not Found');

    const url = request.nextUrl

    // Logging for specific redirect conditions
    if (token) {
        console.log('Token is present, checking redirect conditions');
        if (url.pathname.startsWith("/sign-in") ||
            url.pathname.startsWith("/sign-up") ||
            url.pathname.startsWith("/verify") ||
            url.pathname === "/") {
            console.log('Redirecting to dashboard due to authenticated user');
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    if (!token) {
        console.log('No token found, checking protection');
        if (url.pathname.startsWith("/dashboard")) {
            console.log('Redirecting to sign-in due to no authentication');
            return NextResponse.redirect(new URL('/sign-in', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/",
        "/sign-in",
        "/sign-up",
        "/dashboard/:path*",
        "/verify/:path*"
    ],
}