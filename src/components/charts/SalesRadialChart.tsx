"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from 'recharts';
import { Props } from 'recharts/types/component/DefaultLegendContent';

interface ChartProps {
  data: {
    productName: string;
    totalSales: number;
    fill: string;
  }[];
  chartBackground: string;
  labelFill: string;
}

interface LegendPayloadItem {
  payload: {
    productName: string;
    totalSales: number;
    fill: string;
  };
}

export function SalesRadialChart({ data, chartBackground, labelFill }: ChartProps) {
  const renderLegend = (props: Props) => {
    const { payload } = props;
    if (!payload || payload.length === 0) return null;

    const itemsPerRow = 3;
    const rows = [];
    for (let i = 0; i < payload.length; i += itemsPerRow) {
      rows.push(payload.slice(i, i + itemsPerRow));
    }

    return (
      <div className="flex flex-col gap-1 mt-2 text-[0.65rem]">
        {rows.map((row, rowIndex) => (
          <ul key={`row-${rowIndex}`} className="flex justify-center gap-x-2">
            {row.map((entry: any, index: number) => (
              <li key={`item-${index}`} className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.fill }}></div>
                <span className="text-gray-300 font-medium">{entry.payload.productName}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="40%"
        outerRadius="100%"
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <defs>
          {data.map((entry, index) => (
            <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0" key={`gradient-${index}`}>
              <stop offset="0%" stopColor={entry.fill} stopOpacity={0.8} />
              <stop offset="100%" stopColor={entry.fill} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
        <RadialBar
          // ✅ FIX: Use an object for the label prop to handle position and style
          label={{ 
            position: 'insideStart', 
            fill: labelFill, 
            fontSize: '10px',
            fontWeight: '600' // ✅ FIX: Add semi-bold font weight
          }}
          background={{ fill: chartBackground, opacity: 0.5 }}
          dataKey="totalSales"
          cornerRadius={10}
          fillOpacity={0.8}
        />
        <Legend content={renderLegend} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}