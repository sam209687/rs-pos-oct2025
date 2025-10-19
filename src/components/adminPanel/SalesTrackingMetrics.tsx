// src/components/adminPanel/SalesTrackingMetrics.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, TrendingUp, Wallet, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator'; 
import { useEnlargement } from '@/lib/useEnlargement'; 

// Define the structure for the depositable charges breakdown
interface DepositableCharges {
    packingCharges: number;
    laborCharges: number;
    electricityCharges: number;
    oecCharges: number;
}

interface SalesMetricsProps {
  totalRevenue: number;
  totalSales: number;
  avgOrderValue: number;
  totalProfit: number; 
  totalDeposits: number; 
  depositableCharges: DepositableCharges; 
}

export function SalesTrackingMetrics({ 
    totalRevenue, 
    totalSales, 
    avgOrderValue, 
    totalProfit, 
    totalDeposits,
    depositableCharges 
}: SalesMetricsProps) {
  
  const { isEnlarged, setIsEnlarged } = useEnlargement(); 

  const cardClassName = "bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-gray-700 shadow-xl transition-all duration-300 hover:scale-[1.02]";
  const titleClassName = "text-xs font-medium text-gray-200 uppercase";
  const valueClassName = "text-xl font-bold";
  const iconClassName = "h-4 w-4 text-gray-200";

  // Detailed content for the enlarged view
  const DepositDetailsContent = (
    <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-200">Depositable Charges Breakdown:</h3>
      <p className="text-sm flex justify-between">
        <span className="font-semibold">Total Packing Charges:</span> 
        <span className="text-green-400"> ₹ {depositableCharges.packingCharges.toFixed(2)}</span>
      </p>
      <p className="text-sm flex justify-between">
        <span className="font-semibold">Total Labor Charges:</span> 
        <span className="text-green-400"> ₹ {depositableCharges.laborCharges.toFixed(2)}</span>
      </p>
      <p className="text-sm flex justify-between">
        <span className="font-semibold">Total Electricity Charges:</span> 
        <span className="text-green-400"> ₹ {depositableCharges.electricityCharges.toFixed(2)}</span>
      </p>
      <p className="text-sm flex justify-between">
        <span className="font-semibold">Total OEC Charges:</span> 
        <span className="text-green-400"> ₹ {depositableCharges.oecCharges.toFixed(2)}</span>
      </p>
      <Separator className="bg-gray-700 my-3" />
      <p className="text-md font-extrabold flex justify-between">
        <span>Total Amount to Deposit:</span> 
        <span className="text-yellow-400"> ₹ {totalDeposits.toFixed(2)}</span>
      </p>
    </div>
  );


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid gap-4 md:grid-cols-3 lg:grid-cols-5"
    >
      {/* 1. Total Revenue Card */}
      <Card className={cardClassName}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={titleClassName}>Total Revenue</CardTitle>
          <DollarSign className={iconClassName} />
        </CardHeader>
        <CardContent>
          <div className={valueClassName}>₹ {totalRevenue?.toLocaleString() || '0'}</div>
          <p className="text-xs text-gray-300 mt-1">+20.1% from last month</p>
        </CardContent>
      </Card>

      {/* 2. Total Sales Card */}
      <Card className={cardClassName}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={titleClassName}>Total Sales</CardTitle>
          <ShoppingBag className={iconClassName} />
        </CardHeader>
        <CardContent>
          <div className={valueClassName}>{totalSales?.toLocaleString() || '0'}</div>
          <p className="text-xs text-gray-300 mt-1">+180.1% from last month</p>
        </CardContent>
      </Card>

      {/* 3. Average Order Value Card */}
      <Card className={cardClassName}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={titleClassName}>Avg. Order Value</CardTitle>
          <TrendingUp className={iconClassName} />
        </CardHeader>
        <CardContent>
          <div className={valueClassName}>₹ {avgOrderValue?.toLocaleString() || '0'}</div>
          <p className="text-xs text-gray-300 mt-1">+19% from last month</p>
        </CardContent>
      </Card>

      {/* 4. Profit Details Card */}
      <Card className={cardClassName}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={titleClassName}>Net Profit</CardTitle>
          <Wallet className={iconClassName} />
        </CardHeader>
        <CardContent>
          <div className={`${valueClassName} ${totalProfit >= 0 ? 'text-green-300' : 'text-red-400'}`}>
            ₹ {totalProfit?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-gray-300 mt-1">Profit after cost & overheads</p>
        </CardContent>
      </Card>

      {/* 5. Total Deposits Card (MODIFIED to be clickable/enlargeable) */}
      <Dialog open={isEnlarged} onOpenChange={setIsEnlarged}>
        <DialogTrigger asChild>
          <Card className={`${cardClassName} cursor-pointer`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={titleClassName}>Total Deposits</CardTitle>
              <Banknote className={iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={valueClassName}>
                ₹ {totalDeposits?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-300 mt-1">Total charges to be deposited</p>
            </CardContent>
          </Card>
        </DialogTrigger>
        
        {/* Enlarged Dialog Content */}
        <DialogContent className="sm:max-w-md bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Total Deposits Details</DialogTitle>
          </DialogHeader>
          {DepositDetailsContent}
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}