import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

// Define validation schema
const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  // .min(6, "Password must be at least 6 characters")
  // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  // .regex(
  //   /[!*&?,.-_]/,
  //   "Password must contain at least one special character (!*&?,.-_)"
  // ),
});

// Determine the base URL based on environment with fallback
const baseUrl = process.env.NEXTAUTH_URL;
if (!baseUrl || !baseUrl.startsWith("http")) {
  console.error("Invalid NEXTAUTH_URL, falling back to default:", baseUrl);
  throw new Error("NEXTAUTH_URL is not properly configured");
}

const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Check for empty fields first
          if (!credentials?.email) {
            throw new Error("Email is required");
          }
          if (!credentials?.password) {
            throw new Error("Password is required");
          }

          // Validate credentials with Zod
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          // Use the baseUrl for API call with validation
          const verifyUrl = new URL("/api/auth/verify", baseUrl);

          const response = await fetch(verifyUrl.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error("Invalid credentials");
          }

          const user = await response.json();
          return {
            id: user.id, // UUID is already a string
            username: user.username,
            email: user.email,
            createdAt: user.created_at,
            bio: user.bio, // Bio field
            cover: user.cover, // Cover field
            avatar: user.avatar, // Added avatar field
          };
        } catch (error) {
          // If error is not about missing fields, return generic error
          if (
            error.message !== "Email is required" &&
            error.message !== "Password is required"
          ) {
            console.error("Authentication error:", error.message);
            throw new Error("Invalid credentials");
          }
          // Rethrow missing field errors
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // UUID string
        token.username = user.username;
        token.email = user.email;
        token.createdAt = user.createdAt;
        token.bio = user.bio;
        token.cover = user.cover;
        token.avatar = user.avatar;
        token.lastActive = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id; // UUID string
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.createdAt = token.createdAt;
        session.user.bio = token.bio;
        session.user.cover = token.cover;
        session.user.avatar = token.avatar;
        session.user.lastActive = token.lastActive;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: sessionTimeout / 1000, // Session expires after 24 hours of inactivity
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
});
