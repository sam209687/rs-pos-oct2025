"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SalesMetricsProps {
  totalRevenue: number;
  totalSales: number;
  avgOrderValue: number;
}

export function SalesTrackingMetrics({ totalRevenue, totalSales, avgOrderValue }: SalesMetricsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <Card className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹ {totalRevenue?.toLocaleString() || '0'}</div>
          <p className="text-xs text-gray-300 mt-1">+20.1% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <ShoppingBag className="h-4 w-4 text-gray-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales?.toLocaleString() || '0'}</div>
          <p className="text-xs text-gray-300 mt-1">+180.1% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹ {avgOrderValue?.toLocaleString() || '0'}</div>
          <p className="text-xs text-gray-300 mt-1">+19% from last month</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}