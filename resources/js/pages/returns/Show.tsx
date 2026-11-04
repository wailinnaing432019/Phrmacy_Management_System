import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Printer, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';

interface ReturnItem {
    id: number;
    medicine_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    restocked: boolean;
}

interface SaleReturn {
    id: number;
    return_no: string;
    total: number;
    refund_method: string;
    reason: string | null;
    notes: string | null;
    created_at: string;
    processed_by: string;
    sale: {
        id: number;
        invoice_no: string;
        total: number;
        refunded_total: number;
    };
    items: ReturnItem[];
}

const formatMoney = (amount: number) =>
    `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)} MMK`;

export default function Show({ saleReturn }: { saleReturn: SaleReturn }) {
    const { auth } = usePage().props as {
        auth: { user: { role: string } };
    };

    const saleUrl =
        auth.user.role === 'cashier'
            ? route('cashier.sale.show', saleReturn.sale.id)
            : route('sales.show', saleReturn.sale.id);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Returns', href: '/returns' },
                { title: saleReturn.return_no },
            ]}
        >
            <Head title={`Return ${saleReturn.return_no}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 py-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Credit note
                        </h1>
                        <p className="text-sm text-gray-500">
                            {saleReturn.return_no} · {saleReturn.created_at}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={saleUrl}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to sale
                            </Link>
                        </Button>
                        <Button
                            onClick={() =>
                                window.open(
                                    route('returns.pdf', saleReturn.id),
                                    '_blank',
                                )
                            }
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print credit note
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <div className="grid gap-4 border-b bg-gray-50 p-4 sm:grid-cols-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Original invoice
                            </p>
                            <p className="font-semibold">
                                {saleReturn.sale.invoice_no}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Processed by
                            </p>
                            <p className="font-semibold">
                                {saleReturn.processed_by}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Refund method
                            </p>
                            <p className="font-semibold capitalize">
                                {saleReturn.refund_method}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Refunded now
                            </p>
                            <p className="text-lg font-bold text-green-600">
                                {formatMoney(saleReturn.total)}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-3">Medicine</th>
                                    <th className="px-4 py-3 text-right">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Unit price
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Refund
                                    </th>
                                    <th className="px-4 py-3">Restocked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saleReturn.items.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {item.medicine_name}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatMoney(item.unit_price)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatMoney(item.subtotal)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.restocked ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                                                    <XCircle className="h-4 w-4" />
                                                    No
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col items-end gap-1 border-t p-4 text-sm">
                        <div className="flex w-full max-w-xs justify-between">
                            <span className="text-gray-500">
                                Original sale total
                            </span>
                            <span>
                                {formatMoney(saleReturn.sale.total)}
                            </span>
                        </div>
                        <div className="flex w-full max-w-xs justify-between">
                            <span className="text-gray-500">
                                Total refunded on this sale
                            </span>
                            <span>
                                {formatMoney(saleReturn.sale.refunded_total)}
                            </span>
                        </div>
                        <div className="flex w-full max-w-xs justify-between border-t pt-2 text-base font-bold">
                            <span>This return</span>
                            <span className="text-green-600">
                                {formatMoney(saleReturn.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {(saleReturn.reason || saleReturn.notes) && (
                    <div className="space-y-2 rounded-lg border bg-white p-4 text-sm">
                        {saleReturn.reason && (
                            <p>
                                <span className="font-semibold">Reason:</span>{' '}
                                {saleReturn.reason}
                            </p>
                        )}
                        {saleReturn.notes && (
                            <p>
                                <span className="font-semibold">Notes:</span>{' '}
                                {saleReturn.notes}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
