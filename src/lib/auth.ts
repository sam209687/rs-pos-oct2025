// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import { getUserModel } from '@/lib/models/user';
import bcrypt from 'bcryptjs';
import { IUser } from '@/lib/models/user';
import { Types } from 'mongoose';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "yourlogin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('--- Authorize Function Called ---');
        console.log('Credentials received:', credentials);

        const loginEmail = (credentials?.email as string | undefined)?.trim();
        const password = (credentials?.password as string | undefined)?.trim();

        if (!loginEmail || !password) {
          console.error('Authorize: Missing email or password.');
          return null;
        }

        await connectToDatabase();
        const User = getUserModel();

        const user: IUser | null = await User.findOne({ email: loginEmail }).lean();
        console.log('User found by email:', user ? user.email : 'None');

        if (!user) {
          console.error('Authorize: No user found with this email.');
          return null;
        }

        if (!user.password) {
          console.error('Authorize: User found, but password is not set.');
          return null;
        }

        // ✅ FIX: Added new logs to debug bcrypt
        console.log('Input Password:', password);
        console.log('DB Hashed Password:', user.password);

        // This is the core check. bcrypt.compare checks a plaintext password against a hash.
        const isValid = await bcrypt.compare(password, user.password);
        
        console.log('Password comparison result:', isValid);
        
        if (!isValid) {
          console.error('Authorize: Invalid password.');
          return null;
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          personalEmail: user.personalEmail,
          isAdminInitialSetupComplete: user.isAdminInitialSetupComplete,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as import('next-auth').User & {
            role: "admin" | "cashier";
            personalEmail?: string;
            isAdminInitialSetupComplete?: boolean;
        };

        token.id = authUser.id;
        token.email = authUser.email;
        token.name = authUser.name;
        token.role = authUser.role;
        token.personalEmail = authUser.personalEmail;
        token.isAdminInitialSetupComplete = authUser.isAdminInitialSetupComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id!;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.role = token.role as "admin" | "cashier";
        session.user.personalEmail = token.personalEmail!;
        session.user.isAdminInitialSetupComplete = token.isAdminInitialSetupComplete!;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

declare module 'next-auth' {
  interface User {
    personalEmail?: string;
    isAdminInitialSetupComplete?: boolean;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    personalEmail?: string;
    isAdminInitialSetupComplete?: boolean;
  }
}