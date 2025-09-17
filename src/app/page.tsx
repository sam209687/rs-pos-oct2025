// src/app/page.tsx
'use client'; // This component will run on the client-side

import React, { useState, useEffect } from 'react';
import SkeltonLoader from '@/components/skelton/skelton'; // Import your new skeleton component

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching or component loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show skeleton for 2 seconds

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {isLoading ? (
        // Render your reusable SkeltonLoader component here
        <SkeltonLoader />
      ) : (
        // Actual HomePage content after loading
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Homepage!</h1>
          <p className="text-lg text-gray-700">Content has loaded successfully.</p>
          {/* Add more of your actual homepage content here */}
          <p className="mt-8">This is where your dashboard or main application view would go if authenticated.</p>
        </div>
      )}
    </div>
  );
}