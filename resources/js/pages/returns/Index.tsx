import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface ReturnRow {
    id: number;
    return_no: string;
    total: number;
    refund_method: string;
    created_at: string;
    sale: {
        id: number;
        invoice_no: string;
        total: number;
    } | null;
    processor: {
        id: number;
        name: string;
    } | null;
}

interface PaginatedReturns {
    data: ReturnRow[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
}

const formatMoney = (amount: number) =>
    `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)} MMK`;

export default function Index({
    returns,
    filters,
}: {
    returns: PaginatedReturns;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (event: React.FormEvent) => {
        event.preventDefault();

        router.get(
            route('returns.index'),
            { search },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sales', href: '/sales' },
                { title: 'Returns' },
            ]}
        >
            <Head title="Returns" />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 py-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Returns &amp; refunds
                        </h1>
                        <p className="text-sm text-gray-500">
                            Every refund issued against a shop sale, newest
                            first.
                        </p>
                    </div>

                    <form
                        onSubmit={submitSearch}
                        className="flex w-full max-w-sm items-center gap-2"
                    >
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Return no. or invoice no."
                                className="pl-8"
                            />
                        </div>
                        <Button type="submit" variant="outline">
                            Search
                        </Button>
                    </form>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-3">Return no.</th>
                                    <th className="px-4 py-3">Invoice</th>
                                    <th className="px-4 py-3 text-right">
                                        Refunded
                                    </th>
                                    <th className="px-4 py-3">Method</th>
                                    <th className="px-4 py-3">Processed by</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {returns.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            No returns recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    returns.data.map((saleReturn) => (
                                        <tr
                                            key={saleReturn.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {saleReturn.return_no}
                                            </td>
                                            <td className="px-4 py-3">
                                                {saleReturn.sale?.invoice_no ??
                                                    '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-green-600">
                                                {formatMoney(
                                                    saleReturn.total,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 capitalize">
                                                {saleReturn.refund_method}
                                            </td>
                                            <td className="px-4 py-3">
                                                {saleReturn.processor?.name ??
                                                    'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {saleReturn.created_at}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'returns.show',
                                                            saleReturn.id,
                                                        )}
                                                    >
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-sm text-gray-500">
                        <span>
                            {returns.total === 0
                                ? 'No results'
                                : `Showing ${returns.from}–${returns.to} of ${returns.total}`}
                        </span>

                        <div className="flex flex-wrap items-center gap-1">
                            {returns.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={`rounded-md border px-3 py-1 ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-white hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-md border px-3 py-1 opacity-40"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
