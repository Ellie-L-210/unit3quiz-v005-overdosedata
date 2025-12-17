import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function YearlyComparison({ data }) {
  const chartData = useMemo(() => {
    const yearlyData = {};
    
    data.forEach(row => {
      const year = row.YEAR;
      if (!yearlyData[year]) {
        yearlyData[year] = {
          year: year.toString(),
          retailSales: 0,
          warehouseSales: 0,
          retailTransfers: 0,
          total: 0
        };
      }
      yearlyData[year].retailSales += row['RETAIL SALES'];
      yearlyData[year].warehouseSales += row['WAREHOUSE SALES'];
      yearlyData[year].retailTransfers += row['RETAIL TRANSFERS'];
      yearlyData[year].total += row['RETAIL SALES'] + row['WAREHOUSE SALES'] + row['RETAIL TRANSFERS'];
    });
    
    return Object.values(yearlyData).sort((a, b) => a.year.localeCompare(b.year));
  }, [data]);

  return (
    <div className="chart-container">
      <h2>Yearly Sales Comparison</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="retailSales" fill="#8884d8" name="Retail Sales" />
          <Bar dataKey="warehouseSales" fill="#82ca9d" name="Warehouse Sales" />
          <Bar dataKey="retailTransfers" fill="#ffc658" name="Retail Transfers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

