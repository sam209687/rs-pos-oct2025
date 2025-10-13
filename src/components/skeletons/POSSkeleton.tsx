import { Skeleton } from "@/components/ui/skeleton";

export function POSSkeleton() {
  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Left Panel: Products Section */}
      <div className="flex flex-col space-y-4 bg-gray-800 p-4 rounded-lg">
        <Skeleton className="h-10 w-full" /> {/* Search bar */}

        <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-400">
          <Skeleton className="h-4 w-3/4" /> {/* Product Header */}
          <Skeleton className="h-4 w-1/2" /> {/* Price Header */}
          <Skeleton className="h-4 w-1/4" /> {/* Qty Header */}
        </div>

        {/* Product List Skeletons */}
        <div className="space-y-3 flex-1 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" /> {/* Product Name */}
                <Skeleton className="h-3 w-1/2" /> {/* Product Description */}
              </div>
              <Skeleton className="h-4 w-1/4" /> {/* Price */}
              <Skeleton className="h-8 w-16" /> {/* Add Button */}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Cart Details Section */}
      <div className="flex flex-col space-y-4 bg-gray-800 p-4 rounded-lg">
        {/* Cart Header */}
        <div className="flex justify-between items-center border-b pb-2 border-gray-700">
          <Skeleton className="h-6 w-1/3" /> {/* Cart (0) */}
          <Skeleton className="h-6 w-1/4" /> {/* Total Price */}
        </div>

        {/* Customer Details Form Skeletons */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/3" /> {/* Customer Details Label */}
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-9 w-full" /> {/* Phone Number Input */}
            <Skeleton className="h-9 w-full" /> {/* Name Input */}
          </div>
          <Skeleton className="h-9 w-full" /> {/* Address Input */}
        </div>

        {/* Total Items & Subtotal */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/5" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/5" />
          </div>
        </div>
        
        {/* Payment Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-10 w-full" /> {/* Cash Button */}
          <Skeleton className="h-10 w-full" /> {/* UPI Button */}
          <Skeleton className="h-10 w-full" /> {/* Card Button */}
        </div>

        {/* Total Payable */}
        <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-700">
          <Skeleton className="h-6 w-1/3" /> {/* Total Payable Label */}
          <Skeleton className="h-6 w-1/4" /> {/* Total Payable Amount */}
        </div>

        {/* Action Buttons (Print Bill, Clear) */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Skeleton className="h-10 w-full" /> {/* Print Bill Button */}
          <Skeleton className="h-10 w-full" /> {/* Clear Button */}
        </div>
      </div>
    </div>
  );
}