// middleware.js - Fixed to allow landing page access
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // ✅ FIX: Include "/" as a public route so unauthenticated users can see landing page
  const publicRoutes = ["/", "/login", "/signup", "/verify"];
  
  // ✅ FIX: Use pathname instead of req.url for more reliable matching
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Get the base URL from NEXTAUTH_URL environment variable
  const baseUrl =
    process.env.NEXTAUTH_URL || "https://exam-summer-2025.vercel.app";

  // If user is not logged in and trying to access a protected route
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", baseUrl);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ FIX: Only redirect logged-in users away from auth pages (not from home)
  // Home page "/" should be accessible to both logged-in and logged-out users
  const authOnlyRoutes = ["/login", "/signup", "/verify"];
  if (isLoggedIn && authOnlyRoutes.includes(pathname)) {
    const homeUrl = new URL("/", baseUrl);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};