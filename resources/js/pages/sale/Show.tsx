import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function Show({ sale }) {
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "MMK" }).format(amount);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Sales', href: '/sales' },
            { title: 'Detail View' }
        ]}>
            <Head title={`Sale #${sale.invoice_no}`} />
            <div className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                {sale.invoice_no.startsWith('ORD') ? 'Order Details' : 'Sale Details'}
                            </h1>
                            <p className="text-gray-500 mt-1">Invoice No: <span className="font-semibold text-gray-700">{sale.invoice_no}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Sale By: <span className="font-medium text-gray-700">{sale.sale_by}</span></p>
                            <p className="text-sm text-gray-500">Date: <span className="font-medium text-gray-700">{sale.created_at}</span></p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-4">Items</h2>

                    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Medicine</th>
                                    <th scope="col" className="px-6 py-3 text-right">Quantity</th>
                                    <th scope="col" className="px-6 py-3 text-right">Unit Price</th>
                                    <th scope="col" className="px-6 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items && sale.items.length > 0 ? sale.items.map((item, idx) => (
                                    <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.medicine_name}</td>
                                        <td className="px-6 py-4 text-right">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(item.unit_price)}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(item.subtotal)}</td>
                                    </tr>
                                )) : (
                                    <tr className="bg-white">
                                        <td colSpan={4} className="text-center py-8 text-gray-500">No items found for this {sale.invoice_no.startsWith('ORD') ? 'order' : 'sale'}.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8">
                        <div className="flex justify-end items-center">
                            <p className="text-2xl font-bold text-gray-900">Total: <span className="text-green-600 ml-2">{formatCurrency(sale.total)}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}