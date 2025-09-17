// src/app/(admin)/admin/manage-cashiers/add/page.tsx
import React from 'react';
import { AddCashierForm } from '@/components/admin/AddCashierForm'; // Create this component next

export default function AddCashierPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Cashier</h1>
      <AddCashierForm />
    </div>
  );
}