// next-auth.d.ts (create if it doesn't exist, or modify existing)
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: "admin" | "cashier";
      personalEmail?: string; // Add personal email
      // The `email` property is already part of DefaultSession["user"]
      // so you don't need to redeclare it here unless you want to be super explicit.
      // But ensure it means the *login* email.
    };
  }

  interface User extends DefaultUser {
    id?: string;
    role?: "admin" | "cashier";
    personalEmail?: string; // Add personal email
    // The `email` property is already part of DefaultUser.
    // Ensure it correctly maps to the login email from your database.
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "cashier";
    personalEmail?: string; // Add personal email
    // The `email` property is already part of JWT.
    // Ensure it correctly maps to the login email.
  }
}





