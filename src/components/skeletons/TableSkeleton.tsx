import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="rounded-md border">
        {/* Table Header Skeleton */}
        <div className="flex items-center p-4 border-b">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4 ml-4" />
          <Skeleton className="h-5 w-1/2 ml-4" />
        </div>
        {/* Table Row Skeletons */}
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}