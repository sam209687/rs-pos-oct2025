// src/lib/auth.ts

import NextAuth, { DefaultSession } from 'next-auth';
import { authConfig } from './auth.config';

// ✅ MODIFICATION: The JWT interface is now inside this single module declaration.
declare module 'next-auth' {
  /**
   * Extends the built-in session.user type.
   */
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'cashier';
      personalEmail?: string;
      isAdminInitialSetupComplete?: boolean;
    } & DefaultSession['user'];
  }

  /**
   * Extends the built-in user type.
   */
  interface User {
    role: 'admin' | 'cashier';
    personalEmail?: string;
    isAdminInitialSetupComplete?: boolean;
  }

  /**
   * Extends the built-in JWT type.
   */
  interface JWT {
    role: 'admin' | 'cashier';
    personalEmail?: string;
    isAdminInitialSetupComplete?: boolean;
  }
}

// The old "declare module 'next-auth/jwt'" block has been removed.

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);