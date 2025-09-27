"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface AnalyticsPerformanceChartProps {
  data: { year: string; sales: number; }[];
}

export function AnalyticsPerformanceChart({ data }: AnalyticsPerformanceChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Analytics Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="year" stroke="#888888" />
              <Tooltip />
              <Bar dataKey="sales" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}