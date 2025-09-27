"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface MonthlySalesChartProps {
  data: { month: string; sales: number; }[];
}

export function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" stroke="#888888" />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}