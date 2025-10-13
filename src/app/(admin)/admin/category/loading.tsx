import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function Loading() {
  // Since the Category page is likely a table, we use the TableSkeleton.
  return <TableSkeleton />;
}