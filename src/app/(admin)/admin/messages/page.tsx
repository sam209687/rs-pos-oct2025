// src/app/(admin)/admin/messages/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';

interface CashierResetRequest {
  _id: string;
  name: string;
  email: string; // Login email
  personalEmail?: string; // Personal email where OTP would be sent
}

export default function AdminMessagesPage() {
  const [requests, setRequests] = useState<CashierResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/cashier-reset-requests');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch reset requests');
        }
        const data: CashierResetRequest[] = await response.json();
        setRequests(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message || 'Error fetching reset requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center min-h-[calc(100vh-64px)] p-6">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Mail className="mr-3 h-8 w-8" /> Cashier Reset Requests
      </h1>

      {requests.length === 0 ? (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-xl text-gray-500 dark:text-gray-400">No pending password reset requests from cashiers.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <Card key={req._id} className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-50">
                  Password Reset Request
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Received from {req.name} ({req.email}).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  "Messages received from "{req.email}" for resetting the password"
                </p>
                <Link href={`/admin/manage-cashiers?highlight=${req._id}`} passHref>
                  <Button variant="outline" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Go to Manage Cashiers <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}