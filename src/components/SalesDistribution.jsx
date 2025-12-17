import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export default function SalesDistribution({ data }) {
  const chartData = useMemo(() => {
    let totalRetail = 0;
    let totalWarehouse = 0;
    let totalTransfers = 0;
    
    data.forEach(row => {
      totalRetail += row['RETAIL SALES'];
      totalWarehouse += row['WAREHOUSE SALES'];
      totalTransfers += row['RETAIL TRANSFERS'];
    });
    
    return [
      { name: 'Retail Sales', value: totalRetail },
      { name: 'Warehouse Sales', value: totalWarehouse },
      { name: 'Retail Transfers', value: totalTransfers }
    ];
  }, [data]);

  return (
    <div className="chart-container">
      <h2>Sales Distribution</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString('en-US', { maximumFractionDigits: 2 })} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

