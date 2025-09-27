"use client";

import { useAdminPanelStore, DashboardData } from '@/store/adminPanelStore';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
// import { TotalBalanceCard } from './TotalBalanceCard';
// import { AnalyticsPerformanceChart } from './AnalyticsPerformanceChart';
import { MonthlySalesChart } from './MonthlySalesChart';
import { SalesOverviewChart } from './SalesOverviewChart';
import { IncomeExpenseCards } from './IncomeExpenseCards';
import { TransactionHistoryTable } from './TransactionHistoryTable';
import { getSalesDataByVariant } from '@/actions/sales.actions';
import { getSalesMetrics } from '@/actions/salesTracking.actions';
import dynamic from 'next/dynamic';
import { SalesTrackingMetrics } from './SalesTrackingMetrics';
import { DashboardFilter } from './DashboardFilter';
import { PermanentCalendarCard } from './PermanentCalendarCard';

const DynamicSalesOverviewChart = dynamic(
  () => import('./SalesOverviewChart').then((mod) => mod.SalesOverviewChart),
  { ssr: false }
);

interface DashboardPageProps {
  initialData: DashboardData | null;
}

export function DashboardPage({ initialData }: DashboardPageProps) {
  const { dashboardData, isLoading, fetchDashboardData, refreshData } = useAdminPanelStore();
  const [salesData, setSalesData] = useState([]);
  const [salesMetrics, setSalesMetrics] = useState({ totalRevenue: 0, totalSales: 0, avgOrderValue: 0 });
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#AF19FF', '#FF008C'];

  const handleFilterChange = (filterType: string, newFromDate?: Date, newToDate?: Date) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  useEffect(() => {
    if (initialData) {
      useAdminPanelStore.setState({ dashboardData: initialData, isLoading: false });
    }
    const fetchAllData = async () => {
      const salesResult = await getSalesDataByVariant(fromDate, toDate);
      const metricsResult = await getSalesMetrics(fromDate, toDate);

      if (salesResult.success) {
        const processedData = salesResult.data.map((item: any, index: number) => ({
          ...item,
          fill: chartColors[index % chartColors.length],
        }));
        setSalesData(processedData);
      }
      if (metricsResult.success) {
        setSalesMetrics(metricsResult.data);
      }
    };
    fetchAllData();
  }, [initialData, fromDate, toDate]);

  if (isLoading || !dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <DashboardFilter onFilterChange={handleFilterChange} />
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>

      <SalesTrackingMetrics 
        totalRevenue={salesMetrics.totalRevenue}
        totalSales={salesMetrics.totalSales}
        avgOrderValue={salesMetrics.avgOrderValue}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* <TotalBalanceCard totalBalance={dashboardData.totalBalance} totalSales={dashboardData.totalSales} /> */}
        <DynamicSalesOverviewChart data={salesData} />
        {/* <AnalyticsPerformanceChart data={dashboardData.analyticsPerformance} /> */}
        <PermanentCalendarCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlySalesChart data={dashboardData.saleOverview} />
        {/* <IncomeExpenseCards income={dashboardData.income} expense={dashboardData.expense} /> */}
      </div>

      <TransactionHistoryTable data={dashboardData.transactionHistory} />
    </div>
  );
}