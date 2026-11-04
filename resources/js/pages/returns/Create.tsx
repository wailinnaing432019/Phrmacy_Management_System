import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { route } from 'ziggy-js';

interface SaleItem {
    id: number;
    medicine_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    returned_qty: number;
    returnable_qty: number;
    can_restock: boolean;
}

interface Sale {
    id: number;
    invoice_no: string;
    total: number;
    refunded_total: number;
    sale_by: string;
    created_at: string;
    items: SaleItem[];
}

type RefundMethod = 'cash' | 'card' | 'transfer' | 'other';

interface ReturnForm {
    items: {
        sale_item_id: number;
        quantity: number;
        restock: boolean;
    }[];
    refund_method: RefundMethod;
    reason: string;
    notes: string;
}

const formatMoney = (amount: number) =>
    `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)} MMK`;

export default function Create({ sale }: { sale: Sale }) {
    const { data, setData, post, processing, errors } = useForm<ReturnForm>({
        items: sale.items.map((item) => ({
            sale_item_id: item.id,
            quantity: 0,
            restock: true,
        })),
        refund_method: 'cash',
        reason: '',
        notes: '',
    });

    const updateLine = (
        index: number,
        patch: Partial<ReturnForm['items'][number]>,
    ) => {
        setData(
            'items',
            data.items.map((line, i) =>
                i === index ? { ...line, ...patch } : line,
            ),
        );
    };

    const setQuantity = (index: number, raw: string, max: number) => {
        const parsed = Number.parseInt(raw, 10);
        const quantity = Number.isNaN(parsed)
            ? 0
            : Math.min(Math.max(parsed, 0), max);

        updateLine(index, { quantity });
    };

    const refundTotal = sale.items.reduce((sum, item, index) => {
        const quantity = data.items[index]?.quantity ?? 0;

        return sum + quantity * item.unit_price;
    }, 0);

    const remainingRefundable = Math.max(sale.total - sale.refunded_total, 0);
    const fullyReturned = sale.items.every((item) => item.returnable_qty === 0);
    const firstError = Object.values(errors)[0] as string | undefined;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('returns.store', sale.id), { preserveScroll: true });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sales', href: '/sales' },
                { title: 'Return items' },
            ]}
        >
            <Head title={`Return items - ${sale.invoice_no}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 py-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Return items
                        </h1>
                        <p className="text-sm text-gray-500">
                            Invoice{' '}
                            <span className="font-semibold text-gray-700">
                                {sale.invoice_no}
                            </span>{' '}
                            · Sold by {sale.sale_by} · {sale.created_at}
                        </p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={route('returns.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            All returns
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Original total
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatMoney(sale.total)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Already refunded
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatMoney(sale.refunded_total)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Still refundable
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatMoney(remainingRefundable)}
                        </p>
                    </div>
                </div>

                {firstError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{firstError}</span>
                    </div>
                )}

                {fullyReturned && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Every line on this invoice has already been returned.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="overflow-hidden rounded-lg border bg-white">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h2 className="font-semibold">Invoice items</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={fullyReturned}
                                onClick={() =>
                                    setData(
                                        'items',
                                        sale.items.map((item, index) => ({
                                            ...data.items[index],
                                            quantity: item.returnable_qty,
                                        })),
                                    )
                                }
                            >
                                Return all
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Medicine</th>
                                        <th className="px-4 py-3 text-right">
                                            Sold
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Returned
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Returnable
                                        </th>
                                        <th className="px-4 py-3">Return qty</th>
                                        <th className="px-4 py-3">Restock</th>
                                        <th className="px-4 py-3 text-right">
                                            Refund
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sale.items.map((item, index) => {
                                        const line = data.items[index];
                                        const disabled =
                                            item.returnable_qty === 0;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-t"
                                            >
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
                                                    {item.returnable_qty}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={item.returnable_qty}
                                                        value={line.quantity}
                                                        disabled={disabled}
                                                        onChange={(event) =>
                                                            setQuantity(
                                                                index,
                                                                event.target
                                                                    .value,
                                                                item.returnable_qty,
                                                            )
                                                        }
                                                        className="w-24"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={
                                                                line.restock &&
                                                                item.can_restock
                                                            }
                                                            disabled={
                                                                disabled ||
                                                                !item.can_restock
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                updateLine(
                                                                    index,
                                                                    {
                                                                        restock:
                                                                            Boolean(
                                                                                checked,
                                                                            ),
                                                                    },
                                                                )
                                                            }
                                                        />
                                                        {!item.can_restock && (
                                                            <span className="text-xs text-gray-500">
                                                                No batch
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatMoney(
                                                        line.quantity *
                                                            item.unit_price,
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4 rounded-lg border bg-white p-4">
                            <div className="space-y-2">
                                <Label htmlFor="refund_method">
                                    Refund method
                                </Label>
                                <select
                                    id="refund_method"
                                    value={data.refund_method}
                                    onChange={(event) =>
                                        setData(
                                            'refund_method',
                                            event.target
                                                .value as RefundMethod,
                                        )
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Bank transfer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Input
                                    id="reason"
                                    value={data.reason}
                                    onChange={(event) =>
                                        setData('reason', event.target.value)
                                    }
                                    placeholder="e.g. Customer changed their mind"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData('notes', event.target.value)
                                    }
                                    placeholder="Optional internal notes"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border bg-white p-4">
                            <h2 className="font-semibold">Refund summary</h2>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    Items selected
                                </span>
                                <span>
                                    {data.items.reduce(
                                        (sum, line) => sum + line.quantity,
                                        0,
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3">
                                <span className="text-base font-semibold">
                                    Refund now
                                </span>
                                <span className="text-xl font-bold text-green-600">
                                    {formatMoney(refundTotal)}
                                </span>
                            </div>

                            <p className="text-xs text-gray-500">
                                Refunds use the price recorded on the original
                                invoice. Restocked items go back into the exact
                                batch they were sold from.
                            </p>

                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    refundTotal <= 0 ||
                                    fullyReturned
                                }
                                className="w-full"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {processing
                                    ? 'Processing...'
                                    : 'Process return'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
