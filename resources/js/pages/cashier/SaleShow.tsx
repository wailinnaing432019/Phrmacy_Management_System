import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { route } from 'ziggy-js';

interface SaleItem {
    id: number;
    medicine_name: string;
    quantity: number;
    returned_qty: number;
    unit_price: number;
    subtotal: number;
}

interface Sale {
    id: number;
    invoice_no: string;
    total: number;
    refunded_total: number;
    created_at: string;
    sale_by: string;
    items: SaleItem[];
}

const formatMoney = (amount: number) =>
    `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)} MMK`;

export default function SaleShow({ sale }: { sale: Sale }) {
    const canReturn = sale.items.some(
        (item) => item.quantity > item.returned_qty,
    );

    return (
        <AppLayout title="Sale Detail">
            <Head title={`Sale #${sale.invoice_no}`} />

            <div className="mx-auto w-full max-w-4xl space-y-4 p-4 py-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Sale {sale.invoice_no}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {sale.created_at} · Sold by {sale.sale_by}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('cashier.sale')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to sales
                            </Link>
                        </Button>

                        {canReturn && (
                            <Button asChild>
                                <Link
                                    href={route('returns.create', sale.id)}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Return items
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardContent className="space-y-2 pt-6">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <p>
                                <strong>Total:</strong>{' '}
                                {formatMoney(sale.total)}
                            </p>
                            <p>
                                <strong>Refunded:</strong>{' '}
                                {formatMoney(sale.refunded_total)}
                            </p>
                            <p>
                                <strong>Net:</strong>{' '}
                                {formatMoney(
                                    sale.total - sale.refunded_total,
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <h2 className="border-b px-4 py-3 text-lg font-semibold">
                        Items
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-3">Medicine</th>
                                    <th className="px-4 py-3 text-right">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Returned
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Unit price
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {item.medicine_name}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {item.returned_qty}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatMoney(item.unit_price)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatMoney(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
