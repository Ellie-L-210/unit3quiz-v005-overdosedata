import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesOverTime({ data }) {
    const chartData = useMemo(() => {
        const monthlyData = {};

        data.forEach(row => {
            const key = `${row.YEAR}-${String(row.MONTH).padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = {
                    date: key,
                    retailSales: 0,
                    warehouseSales: 0,
                    retailTransfers: 0,
                    totalSales: 0
                };
            }
            monthlyData[key].retailSales += row['RETAIL SALES'];
            monthlyData[key].warehouseSales += row['WAREHOUSE SALES'];
            monthlyData[key].retailTransfers += row['RETAIL TRANSFERS'];
            monthlyData[key].totalSales += row['RETAIL SALES'] + row['WAREHOUSE SALES'] + row['RETAIL TRANSFERS'];
        });

        return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);

    return (
        <div className="chart-container">
            <h2>Sales Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval="preserveStartEnd"
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="retailSales"
                        stroke="#8884d8"
                        name="Retail Sales"
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="warehouseSales"
                        stroke="#82ca9d"
                        name="Warehouse Sales"
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="retailTransfers"
                        stroke="#ffc658"
                        name="Retail Transfers"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

