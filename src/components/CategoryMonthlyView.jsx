import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CategoryMonthlyView({ data }) {
    const [selectedCategory, setSelectedCategory] = useState('');

    // Get all unique categories
    const categories = useMemo(() => {
        const categorySet = new Set();
        data.forEach(row => {
            const category = row['ITEM TYPE'];
            if (category) {
                categorySet.add(category);
            }
        });
        return Array.from(categorySet).sort();
    }, [data]);

    // Set default category to first one if not selected
    const activeCategory = selectedCategory || categories[0] || '';

    // Process data for selected category by month
    const chartData = useMemo(() => {
        if (!activeCategory) return [];

        const monthlyData = {};

        data.forEach(row => {
            if (row['ITEM TYPE'] === activeCategory) {
                const key = `${row.YEAR}-${String(row.MONTH).padStart(2, '0')}`;
                const monthName = new Date(row.YEAR, row.MONTH - 1).toLocaleString('default', { month: 'short', year: 'numeric' });

                if (!monthlyData[key]) {
                    monthlyData[key] = {
                        date: key,
                        monthLabel: monthName,
                        retailSales: 0,
                        warehouseSales: 0,
                        retailTransfers: 0,
                        totalSales: 0
                    };
                }
                monthlyData[key].retailSales += row['RETAIL SALES'] || 0;
                monthlyData[key].warehouseSales += row['WAREHOUSE SALES'] || 0;
                monthlyData[key].retailTransfers += row['RETAIL TRANSFERS'] || 0;
                monthlyData[key].totalSales += (row['RETAIL SALES'] || 0) + (row['WAREHOUSE SALES'] || 0) + (row['RETAIL TRANSFERS'] || 0);
            }
        });

        return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
    }, [data, activeCategory]);

    return (
        <div className="chart-container">
            <div className="category-selector">
                <h2>Monthly Sales by Category</h2>
                <div className="select-wrapper">
                    <label htmlFor="category-select">Select Category:</label>
                    <select
                        id="category-select"
                        value={activeCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="monthLabel"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="retailSales"
                            stroke="#7C3AED"
                            name="Retail Sales"
                            strokeWidth={3}
                            dot={{ fill: '#7C3AED', r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="warehouseSales"
                            stroke="#82ca9d"
                            name="Warehouse Sales"
                            strokeWidth={3}
                            dot={{ fill: '#82ca9d', r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="retailTransfers"
                            stroke="#ffc658"
                            name="Retail Transfers"
                            strokeWidth={3}
                            dot={{ fill: '#ffc658', r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="no-data-message">
                    <p>No data available for the selected category.</p>
                </div>
            )}
        </div>
    );
}

