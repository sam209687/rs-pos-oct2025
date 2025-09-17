// src/app/(admin)/admin/dashboard/page.tsx
import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Admin Dashboard</h1>
      <p className="text-gray-700 dark:text-gray-300">
        This is where you can manage your POS system.
      </p>
      {/* Add dashboard widgets and content here */}
    </div>
  );
}