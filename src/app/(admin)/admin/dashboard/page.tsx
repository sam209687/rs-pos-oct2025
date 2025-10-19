// src/app/(admin)/admin/dashboard/page.tsx

import { DashboardPage } from '@/components/adminPanel/DashboardPage';
import { getDashboardData } from '@/actions/adminPanel.Actions';
import { TopBar } from '@/components/adminPanel/topbar'; // Import the TopBar component
import { DashboardData } from '@/store/adminPanelStore'; // Assuming you need this type for clarity

export default async function Dashboard() {
  const dashboardData = await getDashboardData();
  
  if (!dashboardData.success) {
    return <div>Error: {dashboardData.message}</div>;
  }

  // ✅ FIX: Explicitly cast the data to be either DashboardData or null.
  // We use the nullish coalescing operator (??) to ensure the type is `DashboardData | null`.
  const initialDataForProps: DashboardData | null = dashboardData.data ?? null;

  return (
    <div className="flex flex-col space-y-4">
      {/* <TopBar /> Render the TopBar here */}
      <DashboardPage initialData={initialDataForProps} />
    </div>
  );                  
}