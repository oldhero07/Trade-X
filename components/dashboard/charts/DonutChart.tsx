import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AllocationData } from '../../../types/dashboard';

interface DonutChartProps {
  data: AllocationData;
  height?: number;
}

export default function DonutChart({ data, height = 300 }: DonutChartProps) {
  const chartData = [
    {
      name: 'Stocks',
      value: data.stocks.value,
      percentage: data.stocks.percentage,
      color: '#22c55e'
    },
    {
      name: 'Crypto',
      value: data.crypto.value,
      percentage: data.crypto.percentage,
      color: '#3b82f6'
    },
    {
      name: 'Cash',
      value: data.cash.value,
      percentage: data.cash.percentage,
      color: '#6b7280'
    }
  ].filter(item => item.value > 0); // Only show non-zero allocations

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-1">{data.name}</p>
          <p className="text-gray-300 text-sm">
            {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white text-sm font-medium">{entry.value}</span>
            </div>
            <div className="text-right">
              <p className="text-white text-sm font-bold">
                {entry.payload.percentage.toFixed(1)}%
              </p>
              <p className="text-gray-400 text-xs">
                {formatCurrency(entry.payload.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="40%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}