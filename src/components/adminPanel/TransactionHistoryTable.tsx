"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ITransaction } from '@/store/adminPanelStore';
import { motion } from 'framer-motion';

interface TransactionHistoryTableProps {
  data: ITransaction[];
}

export function TransactionHistoryTable({ data }: TransactionHistoryTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400 text-right">Amount</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((transaction, index) => (
                <TableRow key={index} className="border-gray-800">
                  <TableCell className="font-medium">{transaction.name}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell className="text-right">₹ {transaction.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === "Complete" ? "bg-green-500" : "bg-yellow-500"
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}