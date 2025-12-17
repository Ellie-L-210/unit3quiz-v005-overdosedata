import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesByItemType({ data }) {
  const chartData = useMemo(() => {
    const typeData = {};
    
    data.forEach(row => {
      const itemType = row['ITEM TYPE'] || 'Unknown';
      if (!typeData[itemType]) {
        typeData[itemType] = {
          itemType,
          retailSales: 0,
          warehouseSales: 0,
          retailTransfers: 0,
          total: 0
        };
      }
      typeData[itemType].retailSales += row['RETAIL SALES'];
      typeData[itemType].warehouseSales += row['WAREHOUSE SALES'];
      typeData[itemType].retailTransfers += row['RETAIL TRANSFERS'];
      typeData[itemType].total += row['RETAIL SALES'] + row['WAREHOUSE SALES'] + row['RETAIL TRANSFERS'];
    });
    
    return Object.values(typeData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 item types
  }, [data]);

  return (
    <div className="chart-container">
      <h2>Sales by Item Type (Top 10)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="itemType" 
            angle={-45}
            textAnchor="end"
            height={100}
          />
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

