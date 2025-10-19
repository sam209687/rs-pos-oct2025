"use client";

import { useAdminPanelStore, DashboardData } from "@/store/adminPanelStore";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

import {
  getSalesDataByVariant,
  type VariantSalesData,
} from "@/actions/sales.actions";
import { getSalesMetrics } from "@/actions/salesTracking.actions";
import { getFinancialMetrics } from "@/actions/invoice.actions";

import { MonthlySalesChart } from "./MonthlySalesChart";
import { TransactionHistoryTable } from "./TransactionHistoryTable";
import { SalesTrackingMetrics } from "./SalesTrackingMetrics";
import { DashboardFilter } from "./DashboardFilter";
import { PermanentCalendarCard } from "./PermanentCalendarCard";

const DynamicSalesOverviewChart = dynamic(
  () => import("./SaleOverviewChart").then((mod) => mod.SalesOverviewChart),
  { ssr: false }
);

interface DashboardPageProps {
  initialData: DashboardData | null;
}

// Define the structure for the depositable charges breakdown (must match the action's return)
interface DepositableCharges {
  packingCharges: number;
  laborCharges: number;
  electricityCharges: number;
  oecCharges: number;
}

interface AllMetrics {
  totalRevenue: number;
  totalSales: number;
  avgOrderValue: number;
  totalProfit: number;
  totalDeposits: number;
  // ✅ FIX 1: Add required property to state interface
  depositableCharges: DepositableCharges; 
}

export function DashboardPage({ initialData }: DashboardPageProps) {
  const { dashboardData, isLoading, refreshData } = useAdminPanelStore();

  const [salesData, setSalesData] = useState<VariantSalesData[]>([]);
  
  // ✅ FIX 2: Initialize state with the required nested object (fixes runtime error on initial render)
  const [allMetrics, setAllMetrics] = useState<AllMetrics>({
    totalRevenue: 0,
    totalSales: 0,
    avgOrderValue: 0,
    totalProfit: 0,
    totalDeposits: 0,
    depositableCharges: {
        packingCharges: 0,
        laborCharges: 0,
        electricityCharges: 0,
        oecCharges: 0,
    },
  });

  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

  const chartColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#AF19FF",
    "#FF008C",
  ];

  const handleFilterChange = useCallback(
    (filterType: string, newFromDate?: Date, newToDate?: Date) => {
      setFromDate(newFromDate);
      setToDate(newToDate);
    },
    []
  );

  const handleCalendarDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      setFromDate(startOfDay);
      setToDate(endOfDay);
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      useAdminPanelStore.setState({
        dashboardData: initialData,
        isLoading: false,
      });
    }

    const fetchAllData = async () => {
      try {
        const [salesResult, basicMetricsResult, financialResult] =
          await Promise.all([
            getSalesDataByVariant(fromDate, toDate),
            getSalesMetrics(fromDate, toDate),
            getFinancialMetrics(),
          ]);

        console.log("💰 Financial Metrics:", financialResult);

        // ✅ FIX 3: Safely extract profit, deposits, and the breakdown object
        const totalProfit =
          financialResult.success && financialResult.data
            ? financialResult.data.totalProfit
            : 0;

        const totalDeposits =
          financialResult.success && financialResult.data
            ? financialResult.data.totalDeposits
            : 0;
            
        // ✅ FIX 4: Extract the required breakdown object, defaulting to the initial state structure
        const depositableCharges = 
            financialResult.success && financialResult.data && financialResult.data.depositableCharges
            ? financialResult.data.depositableCharges
            : allMetrics.depositableCharges; // Use existing valid structure

        if (salesResult.success && salesResult.data) {
          const processedData = salesResult.data.map((item, index) => ({
            ...item,
            fill: chartColors[index % chartColors.length],
          }));
          setSalesData(processedData);
        }

        if (basicMetricsResult.success && basicMetricsResult.data) {
          setAllMetrics({
            ...basicMetricsResult.data,
            totalProfit,
            totalDeposits,
            depositableCharges, // ✅ FIX 5: Set the full breakdown object in state
          });
        } else {
          setAllMetrics((prev) => ({
            ...prev,
            totalProfit,
            totalDeposits,
            depositableCharges, // ✅ FIX 5: Set the full breakdown object in state
          }));
        }

      } catch (err) {
        console.error("❌ Dashboard fetch error:", err);
      }
    };

    fetchAllData();
  }, [initialData, fromDate, toDate]);

  if (isLoading || !dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <DashboardFilter onFilterChange={handleFilterChange} />
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <SalesTrackingMetrics
        totalRevenue={allMetrics.totalRevenue}
        totalSales={allMetrics.totalSales}
        avgOrderValue={allMetrics.avgOrderValue}
        totalProfit={allMetrics.totalProfit}
        totalDeposits={allMetrics.totalDeposits}
        depositableCharges={allMetrics.depositableCharges} // ✅ FIX 6: Pass the required prop
      />

      {/* Charts + Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <DynamicSalesOverviewChart data={salesData} />
        </div>
        <div className="lg:col-span-2">
          <PermanentCalendarCard
            selectedDate={toDate}
            onDateChange={handleCalendarDateChange}
          />
        </div>
      </div>

      {/* Monthly and Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlySalesChart data={dashboardData.saleOverview} />
      </div>

      <TransactionHistoryTable data={dashboardData.transactionHistory} />
    </div>
  );
}