// middleware.js
import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export default auth((req) => {
  // auth() function runs first and handles sessions

  // After auth() completes, we can add our custom logic
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth; // Check if user is authenticated
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/')
  );

  // If user is not logged in and trying to access a protected route
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Optional: Redirect logged-in users away from auth pages
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // Continue with the request if everything is fine
  return NextResponse.next();
});

// Configure which paths middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};