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
        console.log('Credentials received (raw):', credentials);

        const loginEmail = (credentials?.email as string | undefined)?.trim();
        const password = (credentials?.password as string | undefined)?.trim();

        if (!loginEmail || !password) {
          console.log('Authorize: Missing email or password');
          return null;
        }

        await connectToDatabase();
        const User = getUserModel();

        // const user: IUser | null = await User.findOne({ email: loginEmail });
        const user: IUser | null = await User.findOne({ email: loginEmail }).lean();
        console.log('User found by email:', user ? user.email : 'None');

        if (!user) {
          console.log('Authorize: No user found with this email.');
          return null;
        }

        if (!user.password) {
          console.log('Authorize: User found but no password set (e.g., initial admin setup pending).');
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        // TEMPORARY DEBUGGING LOGS - REMOVE AFTER FIXING
        const isValidSync = bcrypt.compareSync(password, user.password);
        console.log('Password provided (raw):', password);
        console.log('Password stored (hashed):', user.password);
        console.log('Password provided (raw) length:', password.length);
        console.log('Password stored (hashed) length:', user.password.length);
        console.log('Password comparison result (sync):', isValidSync);

        // Get character codes to find hidden characters
        console.log('Password provided (raw) char codes:', [...password].map(char => char.charCodeAt(0)));
        // For the hash, you don't typically inspect char codes, but its length is useful.
        // END TEMPORARY DEBUGGING LOGS

        console.log('Password comparison result:', isValid);
        console.log('Password comparison result (async):', isValid); // Your existing log
        console.log('Password comparison result (sync):', bcrypt.compareSync(password, user.password));

        if (!isValid) {
          console.log('Authorize: Invalid password');
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || 'Admin',
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
        // Cast the 'user' object to the NextAuth 'User' interface,
        // which includes your augmented properties.
        const authUser = user as import('next-auth').User;

        token.id = authUser.id;
        token.email = authUser.email;
        token.name = authUser.name;
        token.role = authUser.role; // This should now be correctly typed
        token.personalEmail = authUser.personalEmail ?? '';
        token.isAdminInitialSetupComplete = authUser.isAdminInitialSetupComplete ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id!;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.role = token.role!;
        session.user.personalEmail = token.personalEmail!;
        session.user.isAdminInitialSetupComplete = token.isAdminInitialSetupComplete!;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// Extend the Session and JWT types to include custom fields
declare module 'next-auth' {
  interface User {
    personalEmail?: string;
    isAdminInitialSetupComplete?: boolean;
    // Keep this comment: 'role' is usually already defined as string by NextAuth,
    // so we don't redefine it here to avoid "identical modifiers" errors.
    // TypeScript will infer its more specific type from the authorize return value.
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    personalEmail?: string;
    isAdminInitialSetupComplete?: boolean;
    // Keep this comment: 'role' is usually already defined as string by NextAuth.
    // We let the jwt callback handle its type assignment.
  }
}