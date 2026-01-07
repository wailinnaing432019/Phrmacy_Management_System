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

            <div className="flex flex-col gap-6 p-6">
                {/* Filters & Source Selector */}
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                    {/* Left-aligned filters */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <FilterBar
                            currentMonth={filters?.month}
                            currentYear={filters?.year}
                            startDate={filters?.start_date}
                            endDate={filters?.end_date}
                        />
                        <div>
                            <label htmlFor="source-select" className="block text-sm font-medium text-gray-700 mb-1">
                                Source
                            </label>
                            <select
                                id="source-select"
                                value={data.source}
                                onChange={(e) => {
                                    const source = e.target.value;
                                    setData('source', source);
                                    router.visit(route('sales.index', { ...filters, source }), { preserveScroll: true });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-gray-700"
                            >
                                <option value="shop">Shop Sale</option>
                                <option value="online">Online Sale</option>
                            </select>
                        </div>
                    </div>

                    {/* Right-aligned export buttons */}
                    <div className="flex flex-col sm:flex-row sm:justify-end items-stretch gap-3 lg:gap-4 mt-4 lg:mt-0">
                        <Button
                            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all duration-150"
                            onClick={() => handleExport('pdf')}
                        >
                            <span className="flex items-center gap-2 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2h-8a2 2 0 01-2-2V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Export PDF
                            </span>
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all duration-150"
                            onClick={() => handleExport('csv')}
                        >
                            <span className="flex items-center gap-2 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.5 9A1.5 1.5 0 018 7.5h4A1.5 1.5 0 0113.5 9v2A1.5 1.5 0 0112 12.5H8A1.5 1.5 0 016.5 11V9z" />
                                </svg>
                                Export CSV
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
