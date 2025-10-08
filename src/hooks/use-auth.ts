// src/hooks/use-auth.ts
"use client";

import { useState, useEffect } from 'react';
import { getSessionUser } from '@/actions/auth.actions'; // This is now a NextAuth session-aware action

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const result = await getSessionUser();
      
      if (result.success && result.data) {
        setUser(result.data as User);
      } else {
        console.error(result.message);
        setUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  return { user, isLoading };
}