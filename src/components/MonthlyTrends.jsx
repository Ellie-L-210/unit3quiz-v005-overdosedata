import { useMemo, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MonthlyTrends({ data }) {
    const chartData = useMemo(() => {
        const monthlyData = {};

        data.forEach(row => {
            const month = row.MONTH;
            const monthName = new Date(2020, month - 1).toLocaleString('default', { month: 'short' });

            if (!monthlyData[month]) {
                monthlyData[month] = {
                    month: monthName,
                    monthNum: month,
                    retailSales: 0,
                    warehouseSales: 0,
                    retailTransfers: 0
                };
            }
            monthlyData[month].retailSales += row['RETAIL SALES'];
            monthlyData[month].warehouseSales += row['WAREHOUSE SALES'];
            monthlyData[month].retailTransfers += row['RETAIL TRANSFERS'];
        });

        return Object.values(monthlyData).sort((a, b) => a.monthNum - b.monthNum);
    }, [data]);

    return (
        <div className="chart-container">
            <h2>Average Monthly Sales Trends</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="retailSales"
                        stroke="#7C3AED"
                        name="Retail Sales"
                        strokeWidth={4}
                        dot={{ fill: '#7C3AED', r: 4 }}
                        activeDot={{ r: 6 }}
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

export default memo(MonthlyTrends);

