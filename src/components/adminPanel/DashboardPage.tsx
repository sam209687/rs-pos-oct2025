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
import { CustomerDetailsTable } from "./CustomerDetailsTable"; 
import { SalesTrackingMetrics } from "./SalesTrackingMetrics";
import { DashboardFilter } from "./DashboardFilter";
import { PermanentCalendarCard } from "./PermanentCalendarCard";
import { StockAlertCard } from "./StockAlertCard";
import { BoardPriceCard } from "./BoardPriceCard"; // Imported new component

import { useMonthlySalesStore } from "@/store/monthlySales.store"; 
import { useCustomerDetailsStore } from "@/store/customerDetails.store"; 
import { useStockAlertStore } from "@/store/stockAlert.store"; 
import { useBoardPriceStore } from "@/store/boardPrice.store"; // Imported new store


const DynamicSalesOverviewChart = dynamic(
  () => import("./SaleOverviewChart").then((mod) => mod.SalesOverviewChart),
  { ssr: false }
);

interface DashboardPageProps {
  initialData: DashboardData | null;
}

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
  depositableCharges: DepositableCharges; 
}

export function DashboardPage({ initialData }: DashboardPageProps) {
  const { dashboardData, isLoading, refreshData } = useAdminPanelStore();

  const { monthlySales, isLoading: isMonthlySalesLoading, fetchMonthlySales } = useMonthlySalesStore(); 
  
  // Destructure Board Price Store data
  const { 
    products: boardPriceProducts, 
    totalProducts,
    isLoading: isBoardPriceLoading, 
    error: boardPriceError, 
    fetchProducts: fetchBoardPrices 
  } = useBoardPriceStore();

  // Destructure Customer Details Store data
  const { 
    newCustomers, 
    totalCustomerCount, 
    isLoading: isCustomerLoading, 
    fetchCustomerDetails 
  } = useCustomerDetailsStore(); 

  // Destructure Stock Alert Store data
  const { 
    lowStockVariants, 
    isLoading: isStockAlertLoading, 
    error: stockAlertError, 
    fetchLowStockAlerts 
  } = useStockAlertStore();

  const [salesData, setSalesData] = useState<VariantSalesData[]>([]);
  
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

    // Fetch dynamic data for the new components
    fetchMonthlySales();
    fetchCustomerDetails(); 
    fetchLowStockAlerts(); 
    fetchBoardPrices(); // ✅ FIX: Call fetchBoardPrices on mount

    const fetchAllData = async () => {
      try {
        const [salesResult, basicMetricsResult, financialResult] =
          await Promise.all([
            getSalesDataByVariant(fromDate, toDate),
            getSalesMetrics(fromDate, toDate),
            getFinancialMetrics(),
          ]);

        console.log("💰 Financial Metrics:", financialResult);

        const totalProfit =
          financialResult.success && financialResult.data
            ? financialResult.data.totalProfit
            : 0;

        const totalDeposits =
          financialResult.success && financialResult.data
            ? financialResult.data.totalDeposits
            : 0;
            
        const depositableCharges = 
            financialResult.success && financialResult.data && financialResult.data.depositableCharges
            ? financialResult.data.depositableCharges
            : allMetrics.depositableCharges;

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
            depositableCharges, 
          });
        } else {
          setAllMetrics((prev) => ({
            ...prev,
            totalProfit,
            totalDeposits,
            depositableCharges,
          }));
        }

      } catch (err) {
        console.error("❌ Dashboard fetch error:", err);
      }
    };

    fetchAllData();
  }, [
    initialData, 
    fromDate, 
    toDate, 
    fetchMonthlySales, 
    fetchCustomerDetails,
    fetchLowStockAlerts,
    fetchBoardPrices // ✅ FIX: Added to dependencies
  ]); 

  // ✅ FIX: Include isBoardPriceLoading in the main loading check
  if (isLoading || !dashboardData || isMonthlySalesLoading || isCustomerLoading || isStockAlertLoading || isBoardPriceLoading) {
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
        depositableCharges={allMetrics.depositableCharges}
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

      {/* 🛑 ROW 1: Monthly Sales Chart and Customer Details Table (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlySalesChart data={monthlySales} /> 
        
        <CustomerDetailsTable 
            data={newCustomers}
            totalCustomerCount={totalCustomerCount}
            isLoading={isCustomerLoading}
        />
      </div>
      
      {/* 🛑 ROW 2: Stock Alert Card (1 column, full width) */}
      <div className="grid grid-cols-1 gap-4">
        <StockAlertCard
            data={lowStockVariants} 
            isLoading={isStockAlertLoading}
            error={stockAlertError}
        />
      </div>

      {/* 🛑 ROW 3: Board Price Card (1 column, full width) */}
      <div className="grid grid-cols-1 gap-4">
        <BoardPriceCard
            data={boardPriceProducts}
            totalCount={totalProducts}
            isLoading={isBoardPriceLoading}
            error={boardPriceError}
        />
      </div>
      
      {/* Transaction History Table (If needed, place it here as full width) */}
      {/* <TransactionHistoryTable data={dashboardData.transactionHistory} /> */}
    </div>
  );
}