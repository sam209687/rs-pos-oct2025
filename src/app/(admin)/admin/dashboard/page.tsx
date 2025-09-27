import { DashboardPage } from '@/components/adminPanel/DashboardPage';
import { getDashboardData } from '@/actions/adminPanel.Actions';
import { TopBar } from '@/components/adminPanel/topbar'; // Import the TopBar component

export default async function Dashboard() {
  const dashboardData = await getDashboardData();
  
  if (!dashboardData.success) {
    return <div>Error: {dashboardData.message}</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* <TopBar /> Render the TopBar here */}
      <DashboardPage initialData={dashboardData.data} />
    </div>
  );
}