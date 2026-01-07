export default function LowStockTable({ data }: { data: any[] }) {
    if (data.length === 0) return null;

    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">⚠️ Low Stock Medicines</h2>
            <table className="w-full text-sm border border-gray-200 rounded">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Medicine</th>
                        <th className="p-2 text-right">Stock</th>
                        <th className="p-2 text-right">Limit</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((med) => (
                        <tr key={med.id} className="border-t">
                            <td className="p-2">{med.name}</td>
                            <td className="p-2 text-right text-red-600 font-bold">{med.qty}</td>
                            <td className="p-2 text-right">{med.stock_limit}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}