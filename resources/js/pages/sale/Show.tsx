import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { route } from 'ziggy-js';

interface SaleItem {
    id?: number;
    medicine_name: string;
    quantity: number;
    returned_qty?: number;
    unit_price: number;
    subtotal: number;
}

interface Sale {
    id: number;
    invoice_no: string;
    is_online?: boolean;
    sale_by: string;
    created_at: string;
    total: number;
    refunded_total?: number;
    received_amount?: number;
    refund_amount?: number;
    payment_method?: string;
    items: SaleItem[];
}

export default function Show({ sale }: { sale: Sale }) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'MMK',
        }).format(amount);

    const isOnline = sale.is_online ?? sale.invoice_no.startsWith('ORD');
    const refunded = Number(sale.refunded_total ?? 0);
    const canReturn =
        !isOnline &&
        sale.items.some(
            (item) => item.quantity > (item.returned_qty ?? 0),
        );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sales', href: '/sales' },
                { title: 'Detail View' },
            ]}
        >
            <Head title={`Sale #${sale.invoice_no}`} />
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                {isOnline ? 'Order Details' : 'Sale Details'}
                            </h1>
                            <p className="mt-1 text-gray-500">
                                Invoice No:{' '}
                                <span className="font-semibold text-gray-700">
                                    {sale.invoice_no}
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">
                                    Sale By:{' '}
                                    <span className="font-medium text-gray-700">
                                        {sale.sale_by}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-500">
                                    Date:{' '}
                                    <span className="font-medium text-gray-700">
                                        {sale.created_at}
                                    </span>
                                </p>
                                {refunded > 0 && (
                                    <p className="text-sm text-red-600">
                                        Refunded:{' '}
                                        <span className="font-medium">
                                            {formatCurrency(refunded)}
                                        </span>
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('sales.index')}>
                                        <ArrowLeft className="mr-1 h-4 w-4" />
                                        Back
                                    </Link>
                                </Button>

                                {canReturn && (
                                    <Button size="sm" asChild>
                                        <Link
                                            href={route(
                                                'returns.create',
                                                sale.id,
                                            )}
                                        >
                                            <RotateCcw className="mr-1 h-4 w-4" />
                                            Return items
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <h2 className="mb-4 text-xl font-bold text-gray-800">
                        Items
                    </h2>

                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Medicine
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right"
                                    >
                                        Quantity
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right"
                                    >
                                        Unit Price
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right"
                                    >
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items && sale.items.length > 0 ? (
                                    sale.items.map((item, idx) => (
                                        <tr
                                            key={item.id ?? idx}
                                            className="border-b bg-white hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900">
                                                {item.medicine_name}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.quantity}
                                                {(item.returned_qty ?? 0) >
                                                    0 && (
                                                    <span className="ml-1 text-xs text-red-500">
                                                        (
                                                        {item.returned_qty}{' '}
                                                        returned)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {formatCurrency(
                                                    item.unit_price,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="bg-white">
                                        <td
                                            colSpan={4}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            No items found for this{' '}
                                            {isOnline ? 'order' : 'sale'}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <div className="w-full max-w-xs space-y-1 text-right">
                            <p className="text-lg font-bold text-gray-900">
                                Total:{' '}
                                <span className="ml-2 text-green-600">
                                    {formatCurrency(sale.total)}
                                </span>
                            </p>
                            {refunded > 0 && (
                                <>
                                    <p className="text-sm text-red-600">
                                        Refunded:{' '}
                                        {formatCurrency(refunded)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Net:{' '}
                                        {formatCurrency(sale.total - refunded)}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
