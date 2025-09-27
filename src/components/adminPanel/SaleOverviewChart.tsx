"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { SalesRadialChart } from '@/components/charts/SalesRadialChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { useTheme } from 'next-themes';

interface SalesOverviewChartProps {
  data: {
    productName: string;
    totalSales: number;
    fill: string;
  }[];
}

export function SalesOverviewChart({ data }: SalesOverviewChartProps) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const { theme } = useTheme();

  const chartTheme = theme === 'dark' ? {
    chartBackground: '#4a5568',
    labelFill: '#e2e8f0'
  } : {
    chartBackground: '#cbd5e0',
    labelFill: '#1f2937'
  };

  const filteredData = data.filter(item => !item.productName.includes("Oil Expelling"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg p-6">
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-bold">Total Items Sold</CardTitle> // ✅ FIX: Clearer title
          <p className="text-sm text-gray-400">Last 7 days</p>
        </CardHeader>
        <CardContent className="h-52 mt-4 p-0">
          {filteredData.length > 0 ? (
            <div className="flex flex-col justify-center items-center h-full">
              <Dialog open={isEnlarged} onOpenChange={setIsEnlarged}>
                <DialogTrigger asChild>
                  <div className="w-full h-full cursor-pointer">
                    <SalesRadialChart data={filteredData} chartBackground={chartTheme.chartBackground} labelFill={chartTheme.labelFill} />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl md:max-w-2xl bg-gray-900 text-white">
                  <DialogHeader>
                    <DialogTitle>Sales Overview (Enlarged)</DialogTitle>
                  </DialogHeader>
                  <div className="w-full h-[500px]">
                    <SalesRadialChart data={filteredData} chartBackground={chartTheme.chartBackground} labelFill={chartTheme.labelFill} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data to display.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}