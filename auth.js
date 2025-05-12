import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

// Define validation schema
const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Determine the base URL based on environment with fallback
const baseUrl = process.env.NEXTAUTH_URL;
if (!baseUrl || !baseUrl.startsWith("http")) {
  console.error("Invalid NEXTAUTH_URL, falling back to default:", baseUrl);
  throw new Error("NEXTAUTH_URL is not properly configured");
}

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
          // Validate credentials with Zod
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          // Use the baseUrl for API call with validation
          const verifyUrl = new URL("/api/auth/verify", baseUrl);
          console.log("Verifying with URL:", verifyUrl.toString());

          const response = await fetch(verifyUrl.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            if (response.status === 401) {
              throw new Error(error.error || "Invalid credentials");
            } else {
              throw new Error(error.error || "Authentication failed");
            }
          }

          const user = await response.json();
          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            createdAt: user.created_at,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.createdAt = user.createdAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
});
