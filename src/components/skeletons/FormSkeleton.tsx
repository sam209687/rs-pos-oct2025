import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-10 w-1/4" />
      </div>
    </div>
  );
}