// src/lib/auth.config.ts

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import { getUserModel } from '@/lib/models/user';
import bcrypt from 'bcryptjs';
import { IUser } from '@/lib/models/user';

export const authConfig = {
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
      async authorize(credentials) {
        const loginEmail = (credentials?.email as string | undefined)?.trim();
        const password = (credentials?.password as string | undefined)?.trim();

        if (!loginEmail || !password) return null;

        await connectToDatabase();
        const User = getUserModel();
        const user: IUser | null = await User.findOne({ email: loginEmail }).lean();

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) return null;

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
        const authUser = user as any;
        token.id = authUser.id;
        token.role = authUser.role;
        token.personalEmail = authUser.personalEmail;
        token.isAdminInitialSetupComplete = authUser.isAdminInitialSetupComplete;
      }
      return token;
    },
    // ✅ MODIFICATION: This safely constructs the session.user object.
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'cashier';
        session.user.personalEmail = token.personalEmail as string | undefined;
        session.user.isAdminInitialSetupComplete = token.isAdminInitialSetupComplete as boolean | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;