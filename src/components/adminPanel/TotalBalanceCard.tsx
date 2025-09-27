"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface TotalBalanceCardProps {
  totalBalance: number;
  totalSales: number;
}

export function TotalBalanceCard({ totalBalance, totalSales }: TotalBalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <span className="text-sm text-green-500">+1.23%</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹ {totalBalance.toLocaleString()}</div>
          <p className="text-xs text-gray-400 mt-1">{totalSales} Sales This Month</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}