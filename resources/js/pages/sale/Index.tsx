"use client"
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { DataTable } from './data-table';
import FilterBar from './FilterBar';

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { route } from 'ziggy-js';

export type Sale = {
    id: string
    invoice_no: string
    sale_by: string
    total: number
    created_at: string
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sales', href: '/sales' }
];

interface SalePagination {
    data: Sale[],
    prev_page_url?: string | null,
    next_page_url?: string | null,
}

export default function Index({ sales, filters }: { sales: SalePagination, filters: any }) {
    const { data, setData } = useForm({
        source: filters?.source || 'shop',
        date: '',
        month: '',
    });

    const handleExport = (format: 'pdf' | 'csv') => {
        const queryParams = new URLSearchParams();

        if (filters?.month) queryParams.append('month', filters.month);
        if (filters?.year) queryParams.append('year', filters.year);
        if (filters?.start_date) queryParams.append('start_date', filters.start_date);
        if (filters?.end_date) queryParams.append('end_date', filters.end_date);
        if (data.source) queryParams.append('source', data.source);

        const url = route('sales.export', format) + '?' + queryParams.toString();
        window.open(url, '_blank');
    };

    // Columns dynamically handle shop or online invoice label
    const columns: ColumnDef<Sale>[] = [
        { accessorKey: "id", header: "Id" },
        {
            id: "invoice_no",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        const page = route().params?.page ?? '';
                        const col = data.source === 'online' ? 'order_no' : 'invoice_no';
                        const search = route().params?.search ?? '';
                        const month = route().params?.month ?? '';
                        const year = route().params?.year ?? '';

                        let dir = route().params.dir ?? '';
                        dir = dir === "asc" ? "desc" : dir === "desc" ? "" : "asc";

                        const url = route('sales.index', { page, col, dir, search, month, year, source: data.source });
                        router.visit(url);
                    }}
                >
                    {data.source === 'online' ? 'Order No' : 'Invoice No'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            accessorFn: (row: any) => {
                return data.source === 'online' ? row.order_no : row.invoice_no;
            }
        },
        {
            id: "sale_by",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        const page = route().params?.page ?? '';
                        const col = data.source === 'online' ? 'user_id' : 'sale_by'; // backend still sorts by sale_by or user_id
                        let dir = route().params.dir ?? '';
                        dir = dir === "asc" ? "desc" : dir === "desc" ? "" : "asc";

                        const url = route('sales.index', { page, col, dir, source: data.source });
                        router.visit(url);
                    }}
                >
                    {data.source === 'online' ? 'Customer' : 'Sale By'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            accessorFn: (row: any) => {
                // use user.name if it exists, else fallback to row.name (for online guest customers)
                if (data.source === 'online') {
                    return row.user?.name || row.name;
                } else {
                    return row.user?.name || 'N/A';
                }
            },
        },
        { accessorKey: "created_at", header: "Sale Date" },
        {
            accessorKey: "total",
            header: () => <div className="text-right">Total</div>,
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total"));
                return <div className="text-right font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "MMK" }).format(amount)}</div>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => router.visit(
                                route('sales.show', { id: row.original.id, source: data.source })
                            )}
                        >
                            View Details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={data.source === 'online' ? 'Online Orders' : 'Shop Sales'} />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {data.source === 'online' ? 'Online Sales Records' : 'Shop Sales Records'}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Browse transaction records, inspect receipts, and export fiscal reports.
                    </p>
                </div>

                {/* Filters & Source Selector */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left-aligned filters */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <FilterBar
                            currentMonth={filters?.month}
                            currentYear={filters?.year}
                            startDate={filters?.start_date}
                            endDate={filters?.end_date}
                        />
                        <div>
                            <label htmlFor="source-select" className="block text-xs font-semibold text-foreground mb-1">
                                Sales Channel
                            </label>
                            <select
                                id="source-select"
                                value={data.source}
                                onChange={(e) => {
                                    const source = e.target.value;
                                    setData('source', source);
                                    router.visit(route('sales.index', { ...filters, source }), { preserveScroll: true });
                                }}
                                className="w-full sm:w-44 px-3 py-2 border border-border bg-background rounded-xl shadow-xs text-xs font-medium text-foreground focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="shop">Shop (POS)</option>
                                <option value="online">Online (Storefront)</option>
                            </select>
                        </div>
                    </div>

                    {/* Right-aligned export buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="rounded-xl border-border px-3.5 py-2 text-xs font-semibold hover:bg-accent"
                            onClick={() => handleExport('pdf')}
                        >
                            Export PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl border-border px-3.5 py-2 text-xs font-semibold hover:bg-accent"
                            onClick={() => handleExport('csv')}
                        >
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                    <DataTable
                        columns={columns}
                        nextpageurl={sales.next_page_url}
                        prevpageurl={sales.prev_page_url}
                        data={sales.data}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
