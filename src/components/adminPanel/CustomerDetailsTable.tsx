"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { CustomerTableData } from '@/store/customerDetails.store'; 
import { Loader2 } from 'lucide-react';


interface CustomerDetailsTableProps {
  data: CustomerTableData[];
  totalCustomerCount: number;
  isLoading: boolean;
}

// Renamed component
export function CustomerDetailsTable({ data, totalCustomerCount, isLoading }: CustomerDetailsTableProps) {
  
  // Use a loading state indicator for the card
  if (isLoading) {
    return (
        <Card className="bg-gray-900 text-white border-gray-700 shadow-lg h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-500 mr-2" />
            <p>Loading Customer Data...</p>
        </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="h-full" // Ensure full height
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg h-full">
        <CardHeader className="pb-2">
          {/* Change main heading */}
          <CardTitle className="text-xl font-bold">Customer Details</CardTitle>
          {/* Add total customer count */}
          <p className="text-sm text-gray-400">Total Customers ({totalCustomerCount.toLocaleString()})</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                {/* Updated Headers */}
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Mobile</TableHead>
                <TableHead className="text-gray-400">Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Loop through new customer data */}
              {data.map((customer) => (
                <TableRow key={customer._id} className="border-gray-800">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.date}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No new customers found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}