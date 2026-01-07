
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { DataTable } from './data-table';
import { columns, Sale } from './columns';
import { useState } from 'react';
import { Button, Input } from '@headlessui/react';
import FilterBar from './FilterBar';
import CashierMenu from '@/layouts/cashier-menu';



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sale',
        href: '/sales',
    },
];

interface SalePagination {
    data: Sale[],
    prevpageurl?: string | null | undefined,
    nextpageurl?: string | null | undefined,
}
export default function Index({ sales, filters }: { Sale: SalePagination[] }) {
    const { data, setData, get } = useForm({
        date: '',
        month: '',
    });

    const handleFilter = () => {
        get(route('sales.index'), {
            preserveScroll: true,
        });
    };

    const handleExport = (format: 'pdf' | 'csv') => {
        const queryParams = new URLSearchParams();

        if (filters?.month) queryParams.append('month', filters.month);
        if (filters?.year) queryParams.append('year', filters.year);
        if (filters?.start_date) queryParams.append('start_date', filters.start_date);
        if (filters?.end_date) queryParams.append('end_date', filters.end_date);

        const url = route('sales.export', format) + '?' + queryParams.toString();
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="POS" />
            <CashierMenu />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="container mx-auto py-10">
                    {/* <FilterBar
                        currentMonth={filters?.month}
                        currentYear={filters?.year}
                        startDate={filters?.start_date}
                        endDate={filters?.end_date}
                    /> */}


                    {/* <div className="mb-4 flex items-center gap-4">
                        <div>
                            <Input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                placeholder="Filter by date"
                            />
                        </div>
                        <div>
                            <Input
                                type="month"
                                value={data.month}
                                onChange={(e) => setData('month', e.target.value)}
                                placeholder="Filter by month"
                            />
                        </div>
                        <Button onClick={handleFilter}>Filter</Button>
                    </div> */}
                    <DataTable columns={columns} nextpageurl={sales.next_page_url} prevpageurl={sales.prev_page_url} data={sales.data} />
                </div>
            </div>
        </div>
    );
}
