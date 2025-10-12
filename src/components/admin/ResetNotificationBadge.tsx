// src/components/admin/ResetNotificationBadge.tsx
"use client";

import { getResetRequestsCount } from '@/actions/admin.actions';
import { useEffect, useState } from 'react';
// import { getResetRequestsCount } from '@/lib/actions/admin.actions';

export function ResetNotificationBadge() {
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const { count } = await getResetRequestsCount();
      setRequestCount(count);
    }
    fetchCount();

    // Optional: Poll for new requests every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (requestCount === 0) {
    return null; // Don't render anything if there are no requests
  }

  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
      {requestCount}
    </span>
  );
}