// src/components/adminPanel/StockAlertCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { LowStockVariant } from '@/store/stockAlert.store';

interface StockAlertCardProps {
  data: LowStockVariant[];
  isLoading: boolean;
  error: string | null;
}

export function StockAlertCard({ data, isLoading, error }: StockAlertCardProps) {
  
  const totalAlerts = data.length;

  if (isLoading) {
    return (
        // Added h-full to help match card height in grid
        <Card className="bg-gray-900 text-white border-yellow-500 shadow-lg h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-500 mr-2" />
            <p>Checking Stock Alerts...</p>
        </Card>
    );
  }

  if (error) {
    return (
        <Card className="bg-gray-900 text-red-500 border-red-500 shadow-lg h-full p-4">
            <p>Error: {error}</p>
        </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg h-full flex flex-col">
        <CardHeader className={`pb-2 ${totalAlerts > 0 ? 'border-b border-yellow-500/20' : ''}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center">
              <Zap className={`h-5 w-5 mr-2 ${totalAlerts > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
              Stock Alert
            </CardTitle>
            <p className={`text-sm font-semibold ${totalAlerts > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                {totalAlerts} Low Stock Item{totalAlerts !== 1 ? 's' : ''}
            </p>
          </div>
        </CardHeader>
        {/* Added flex-grow to ensure content fills remaining space */}
        <CardContent className="h-full overflow-y-auto flex-grow max-h-[350px]"> 
          {totalAlerts === 0 ? (
            <div className="py-8 text-center text-gray-400">
                All stock levels are healthy!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Product (SKU)</TableHead>
                  <TableHead className="text-gray-400 text-right">Stock</TableHead>
                  <TableHead className="text-gray-400 text-right">Alert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((variant) => (
                  <TableRow 
                    key={variant._id} 
                    className="border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {variant.productName} ({variant.variantVolume} {variant.unit}) 
                      {variant.variantColor && variant.variantColor !== 'N/A' && ` - ${variant.variantColor}`}
                    </TableCell>
                    <TableCell className="text-right text-yellow-400 font-bold">
                        {variant.stockQuantity}
                    </TableCell>
                    <TableCell className="text-right text-red-400">
                        {variant.stockAlertQuantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}