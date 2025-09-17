// src/components/skelton/skelton.tsx
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming this path is correct for your shadcn setup

interface SkeltonLoaderProps {
  // You can add props here to make the skeleton more flexible
  // For example, if you want different types or counts of skeleton items:
  // type?: 'homepage' | 'card' | 'text';
  // itemCount?: number;
}

const SkeltonLoader: React.FC<SkeltonLoaderProps> = () => {
  return (
    <div className="space-y-4 w-full max-w-md">
      {/* Example skeleton layout - customize as needed */}
      <Skeleton className="h-10 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
};

export default SkeltonLoader;