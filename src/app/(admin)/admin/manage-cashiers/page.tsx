// src/app/(admin)/admin/manage-cashiers/page.tsx
// (No changes here, this is just to show it remains the same as your last provided code)
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { TableUI } from '@/components/uies/table/tableui'; // Assuming this path
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react';
import Link from 'next/link'; // Changed back to 'next/link' for navigation
import { useSearchParams } from 'next/navigation'; // Correct import for useSearchParams
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility for conditional classnames
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

// Define the type for a Cashier item in the table
interface Cashier {
  _id: string;
  sNo: number;
  name: string;
  aadhaar: string;
  status: 'active' | 'inactive';
  personalEmail: string; // Renamed from email
  email: string; // Renamed from username (this is the login email)
  phone: string;
  storeLocation: string;
  // Add fields for OTP management (though not strictly needed in the *initial* fetch for this flow,
  // they are useful if the backend also sends them or for clarity)
  // passwordResetToken?: string; // This will hold the OTP
  // passwordResetExpires?: string; // ISO string of expiry date
}

export default function ManageCashiersPage() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otpDialogOpened, setOtpDialogOpened] = useState(false);
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(null);
  const [tempOTPs, setTempOTPs] = useState<{ [key: string]: { otp: string; expiresAt: Date } }>({});

  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  // useRef to store references to table rows for scrolling and highlighting
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  // Effect to fetch cashiers on component mount
  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cashier'); // Your existing API to fetch cashiers
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch cashiers');
        }
        const data: Cashier[] = await response.json();
        const cashiersWithSNo = data.map((cashier, index) => ({
          ...cashier,
          sNo: index + 1,
        }));
        setCashiers(cashiersWithSNo);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message || 'Error fetching cashiers.');
      } finally {
        setLoading(false);
      }
    };
    fetchCashiers();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to scroll to and highlight a specific cashier row if highlightId is present in URL
  useEffect(() => {
    if (highlightId && cashiers.length > 0) {
      const targetRow = rowRefs.current[highlightId];
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight class for animation
        targetRow.classList.add('bg-yellow-100', 'dark:bg-yellow-900', 'animate-pulse');
        const timer = setTimeout(() => {
          targetRow.classList.remove('bg-yellow-100', 'dark:bg-yellow-900', 'animate-pulse');
        }, 3000); // Remove highlight after 3 seconds
        return () => clearTimeout(timer); // Cleanup timer if component unmounts or highlightId changes
      }
    }
  }, [cashiers, highlightId]); // Re-run when cashiers data loads or highlightId changes

  // Effect to clean up expired OTPs from local state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTempOTPs(prevOTPs => {
        const newOTPs = { ...prevOTPs };
        for (const id in newOTPs) {
          if (new Date() > newOTPs[id].expiresAt) {
            delete newOTPs[id];
          }
        }
        return newOTPs;
      });
    }, 10000); // Check every 10 seconds for expired OTPs

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []); // Empty dependency array means this runs once on mount

  // Column definitions for the TableUI
  const columns = [
    { key: 'sNo', header: 'S/No' },
    { key: 'name', header: 'Name' },
    {
      key: 'aadhaar',
      header: 'Aadhaar',
      render: (item: Cashier) => (
        `XXXXXXXX${item.aadhaar.slice(-4)}` // Mask Aadhaar number
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Cashier) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
    { key: 'email', header: 'Login Email' },
    { key: 'personalEmail', header: 'Personal Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'storeLocation', header: 'Store Location' },
  ];

  // Function to render action buttons for each cashier row
  const renderCashierActions = (cashier: Cashier) => (
    <>
      <Button variant="ghost" size="icon" className="hover:text-blue-600">
        <Link href={`/admin/manage-cashiers/edit/${cashier._id}`} title="Edit Cashier">
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" className="hover:text-red-600" onClick={() => handleDeleteCashier(cashier._id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
      {/* Conditionally render OTP or Reset Icon */}
      {tempOTPs[cashier._id] && new Date() < tempOTPs[cashier._id].expiresAt ? (
        <div className="relative flex items-center justify-center space-x-1 px-2 py-1 text-sm font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded-md">
         <span>{tempOTPs[cashier._id].otp}</span>
          
          {/* Display remaining time */}
          <span className="text-xs font-normal bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full px-1 py-0.5 ml-1">
            {Math.ceil((tempOTPs[cashier._id].expiresAt.getTime() - new Date().getTime()) / (60 * 1000))}m
          </span>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-yellow-600"
          onClick={() => handleResetPasswordClick(cashier._id)}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </>
  );

  // Function to handle cashier deletion
  const handleDeleteCashier = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cashier?")) return;
    try {
      const response = await fetch(`/api/cashier/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete cashier');
      }
      toast.success("Cashier deleted successfully.");
      // Remove deleted cashier from local state
      setCashiers(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Error deleting cashier.');
    }
  };

  // Function to open the AlertDialog for password reset
  const handleResetPasswordClick = (id: string) => {
    setSelectedCashierId(id);
    setOtpDialogOpened(true);
  };

  // Function called when AlertDialog is confirmed (admin initiates reset)
  const confirmResetPassword = async () => {
    if (!selectedCashierId) return; // Should not happen if dialog was opened
    try {
      // Call the new API endpoint to initiate reset, which generates OTP and sends email
      const response = await fetch(`/api/admin/cashier-reset-initiate/${selectedCashierId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate cashier password reset');
      }
      const result = await response.json(); // Expected to contain otp and otpExpires

      toast.success(result.message || "Password reset OTP generated. Displaying on screen.");

      // Store OTP in local state with its expiry timestamp
      setTempOTPs(prevOTPs => ({
        ...prevOTPs,
        [selectedCashierId]: {
          otp: result.otp,
          expiresAt: new Date(result.otpExpires), // Convert ISO string to Date object
        },
      }));

    } catch (err: any) {
      toast.error(err.message || 'Error resetting password.');
    } finally {
      setSelectedCashierId(null); // Clear selected ID
      setOtpDialogOpened(false); // Close the dialog
    }
  };

  // Get the selected cashier's details for displaying in the AlertDialog
  const cashierToReset = selectedCashierId
    ? cashiers.find(c => c._id === selectedCashierId)
    : null;

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        Loading cashiers...
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-red-500 text-center min-h-[calc(100vh-64px)]">
        Error: {error}
      </div>
    );
  }

  // Render the main component
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Cashiers</h1>
        <Link href="/admin/manage-cashiers/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Cashier
          </Button>
        </Link>
      </div>

      {/* Table UI to display cashier data */}
      <TableUI<Cashier>
        data={cashiers}
        columns={columns}
        renderActions={renderCashierActions}
        rowKey="_id"
        // THIS IS CRUCIAL: Pass a prop to TableUI to handle row rendering with refs
        // You'll need to implement this `renderRowWrapper` in your TableUI component
        // This wrapper is used to attach the ref and conditional highlight class
        renderRowWrapper={(rowItem: Cashier, defaultTableRow: React.ReactNode) => (
          <tr
            key={rowItem._id}
            ref={el => { rowRefs.current[rowItem._id] = el; }}
            className={cn(
              "transition-all duration-300",
              highlightId === rowItem._id ? "bg-yellow-100 dark:bg-yellow-900" : ""
            )}
          >
            {/* Render the default table row cells as provided by TableUI */}
            {defaultTableRow}
          </tr>
        )}
      />

      {/* Shadcn AlertDialog for Password Reset Confirmation */}
      <AlertDialog open={otpDialogOpened} onOpenChange={setOtpDialogOpened}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to reset password?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will generate a new 4-digit OTP and display in 
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {/* {cashierToReset?.personalEmail || cashierToReset?.email} */}
              </span>{" "}
              same page. The OTP will be visible here for 1 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCashierId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>Confirm Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}