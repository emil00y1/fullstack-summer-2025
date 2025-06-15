import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/verify",
    "/forgot-password",
    "/reset-password",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const baseUrl =
    process.env.NEXTAUTH_URL || "https://exam-summer-2025.vercel.app";

  // If user is not logged in and trying to access a protected route
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", baseUrl);
    return NextResponse.redirect(loginUrl);
  }

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
