"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { TooltipProps } from "recharts";
import { motion } from "framer-motion";

// 1. New Data Structure Interface
interface MonthlySalesData {
  month: string;
  totalInvoice: number; // Total number of invoices
  salesAmount: number; // Sum of the total sold amount
}

interface MonthlySalesChartProps {
  data: MonthlySalesData[];
}

// 💡 FIX: Manually define the required props for the CustomTooltip
// We use Omit to clean up the imported TooltipProps and manually add the required properties
// This solves the 'Property does not exist' error.
type CustomTooltipProps = Omit<
  TooltipProps<any, any>,
  "payload" | "label" | "active"
> & {
  active?: boolean;
  payload?: any[];
  label?: string | number;
};

// 2. Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  // The check remains the same
  if (active && payload && payload.length) {
    // Access the data object from the payload.
    const dataPoint = payload[0].payload as MonthlySalesData;

    return (
      <div className="p-3 bg-gray-800 border border-gray-700 text-white shadow-lg rounded-md">
        <p className="font-bold text-lg mb-1">{`${label} Sales`}</p>
        <p className="text-sm">
          <span className="font-medium">Total Invoices:</span>{" "}
          <span className="text-yellow-400">{dataPoint.totalInvoice}</span>
        </p>
        <p className="text-sm">
          <span className="font-medium">Sales Amount:</span>{" "}
          <span className="text-yellow-400">
            ₹{dataPoint.salesAmount.toLocaleString("en-IN")}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
    >
      <Card className="bg-gray-900 text-white border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Monthly Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                stroke="#A1A1AA"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                dataKey="salesAmount"
                stroke="#A1A1AA"
                axisLine={false}
                tickLine={false}
                // If all sales are very small, setting a domain helps
                // domain={[0, 'auto']}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              />

              <Bar
                dataKey="salesAmount"
                name="Sales Amount"
                fill="#FBBF24"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
