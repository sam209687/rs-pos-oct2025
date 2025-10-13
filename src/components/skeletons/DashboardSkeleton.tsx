import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[120px] w-full rounded-lg" />
        <Skeleton className="h-[120px] w-full rounded-lg" />
        <Skeleton className="h-[120px] w-full rounded-lg" />
        <Skeleton className="h-[120px] w-full rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    </div>
  );
}