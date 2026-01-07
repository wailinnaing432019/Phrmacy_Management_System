import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';

interface MedicineData {
    medicine_id: number;
    total_qty: number;
    medicine: {
        id: number;
        name: string;
    };
}

export default function TopMedicinesChart({ data }: { data: MedicineData[] }) {
    // Map data to format recharts expects
    const chartData = data.map(item => ({
        name: item.medicine.name,
        qty: item.total_qty
    }));

    return (
        <div className="w-full h-[300px]">
            <h2 className="text-xl font-semibold mb-4">Top 5 Best-Selling Medicines</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="qty" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
