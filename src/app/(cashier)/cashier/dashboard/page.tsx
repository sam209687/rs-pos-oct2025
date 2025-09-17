// src/app/(cashier)/cashier/dashboard/page.tsx
import React from "react";

export default function CashierDashboardPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome, Cashier!</h2>
      <p className="text-gray-700 dark:text-gray-300">
        This is your main point of sale (POS) dashboard. You can manage transactions, view sales reports, and more from here.
      </p>

      {/* Add your POS specific content here */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">New Sale</h3>
          <p className="text-gray-600 dark:text-gray-400">Start a new transaction.</p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to POS</button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">View Reports</h3>
          <p className="text-gray-600 dark:text-gray-400">Access daily sales and transaction reports.</p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View Reports</button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Manage Returns</h3>
          <p className="text-gray-600 dark:text-gray-400">Process product returns or exchanges.</p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Process Returns</button>
        </div>
      </div>
    </div>
  );
}