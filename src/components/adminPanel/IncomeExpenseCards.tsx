"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface IncomeExpenseCardsProps {
  income: number;
  expense: number;
}

export function IncomeExpenseCards({ income, expense }: IncomeExpenseCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹ {income.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹ {expense.toLocaleString()}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}