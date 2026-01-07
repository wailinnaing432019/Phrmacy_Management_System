import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

interface MonthlySale {
    month: string;
    total: number;
}

interface TopMedicine {
    name: string;
    sales: number;
}

interface LowStockMedicine {
    name: string;
    medicine_id: number;
    stock: number;
}

interface DashboardProps {
    total_sales_today: number;
    total_purchases_today: number;
    total_revenue: number;
    total_cost: number;
    daily_sales: any[];
    top_medicines: TopMedicine[];
    medicine_alerts: any[];
    // low_stock_medicines: LowStockMedicine[];
    // expired_medicines: LowStockMedicine[];
    // nearExpiryMedicines: LowStockMedicine[];
}

const Dashboard: React.FC<DashboardProps> = ({
    total_sales_today,
    total_purchases_today,
    total_revenue,
    total_cost,
    daily_sales,
    top_medicines,
    // low_stock_medicines,
    // expired_medicines,
    // nearExpiryMedicines,
    medicine_alerts,
}) => {
    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard" }]}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6  overflow-auto">
                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: "Sales Today", value: total_sales_today, unit: "MMK", color: "text-green-600" },
                        { title: "Purchases Today", value: total_purchases_today, unit: "MMK", color: "text-blue-600" },
                        { title: "Total Revenue", value: total_revenue, unit: "MMK", color: "text-purple-600" },
                        { title: "Total Cost", value: total_cost, unit: "MMK", color: "text-red-600" },
                    ].map((card, index) => (
                        <div
                            key={index}
                            className="relative   shadow-lg rounded-xl p-5 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="text-gray-500 text-sm mb-1">{card.title}</div>
                            <div className={`text-2xl font-extrabold ${card.color}`}>
                                {Number(card.value).toLocaleString()} {card.unit}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Monthly Sales Chart */}
                    <div className="  p-6 rounded-xl shadow border border-gray-200 h-[400px]">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Sales</h2>
                        {daily_sales.length > 0 ? (
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={daily_sales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="date" tick={{ fill: '#555' }} />
                                    <YAxis tick={{ fill: '#555' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ color: '#333', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#666' }}
                                        formatter={(value: number) => `${value} MMK`}
                                    />
                                    <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} name="Daily Sales" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No monthly sales data available.
                            </div>
                        )}
                    </div>

                    {/* Top Medicines Chart */}
                    <div className="  p-6 rounded-xl shadow border border-gray-200 h-[400px]">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Top 5 Medicines</h2>
                        {top_medicines.length > 0 ? (
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={top_medicines} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="name" tick={{ fill: '#990efc' }} />
                                    <YAxis tick={{ fill: '#990efc' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ color: '#333', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#666' }}
                                        formatter={(value: number) => `${value} MMK`}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="sales" fill="#990efc" name="Sales" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No top medicines data available.
                            </div>
                        )}
                    </div>
                </div>



                <div className=" p-6 rounded-xl shadow md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Medicine Alerts</h2>
                    {medicine_alerts.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Medicine Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Current Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="  divide-y divide-gray-200">
                                    {medicine_alerts.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium hover:underline text-blue-600">
                                                <Link href={route('medicines.show', item.medicine_id)}>
                                                    {item.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                                {item.stock}
                                            </td>
                                            <td
                                                className={`px-6 py-4 whitespace-nowrap text-sm font-semibold
                  ${item.status === 'Expired' ? 'text-red-600' : ''}
                  ${item.status === 'Near Expiry' ? 'text-orange-500' : ''}
                  ${item.status === 'Low Stock' ? 'text-yellow-600' : ''}
                `}
                                            >
                                                {item.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-24 text-gray-500">
                            No medicine alerts to display.
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
};
export default Dashboard;