import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  );

  // Get the base URL from NEXTAUTH_URL environment variable
  const baseUrl =
    process.env.NEXTAUTH_URL || "https://exam-summer-2025.vercel.app";

  // If user is not logged in and trying to access a protected route
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", baseUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Optional: Redirect logged-in users away from auth pages
  if (isLoggedIn && isPublicRoute) {
    const homeUrl = new URL("/", baseUrl);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
