import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

// Define validation schema
const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const baseUrl = process.env.NEXTAUTH_URL;
if (!baseUrl || !baseUrl.startsWith('http')) {
  console.error('Invalid NEXTAUTH_URL, falling back to default:', baseUrl);
  throw new Error('NEXTAUTH_URL is not properly configured');
}

const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            throw new Error('Email is required');
          }
          if (!credentials?.password) {
            throw new Error('Password is required');
          }

          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          const verifyUrl = new URL('/api/auth/verify', baseUrl);

          const response = await fetch(verifyUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const user = await response.json();

          if (!user.is_verified) {
            throw new Error(
              'Email not verified. Please check your email for verification code.'
            );
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.created_at,
            bio: user.bio,
            cover: user.cover,
            avatar: user.avatar,
            isVerified: user.is_verified,
          };
        } catch (error) {
          if (error.message.includes('Email not verified')) {
            throw error;
          }
          if (
            error.message !== 'Email is required' &&
            error.message !== 'Password is required'
          ) {
            console.error('Authentication error:', error.message);
            throw new Error('Invalid credentials');
          }
          throw error;
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
        token.bio = user.bio;
        token.cover = user.cover;
        token.avatar = user.avatar;
        token.isVerified = user.isVerified;
        token.lastActive = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.createdAt = token.createdAt;
        session.user.bio = token.bio;
        session.user.cover = token.cover;
        session.user.avatar = token.avatar;
        session.user.isVerified = token.isVerified;
        session.user.lastActive = token.lastActive;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: sessionTimeout / 1000,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
});
