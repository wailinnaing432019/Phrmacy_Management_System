import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Receipt,
    Calendar,
    Search,
    RotateCcw,
    FileText,
    FileSpreadsheet,
    Store,
    Globe,
    CreditCard,
    Banknote,
    Eye,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Clock,
    User as UserIcon,
    ArrowUpDown,
    CheckCircle2,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface SaleItem {
    id: number | string;
    invoice_no?: string;
    order_no?: string;
    total: number;
    payment_method?: string;
    sale_by?: string | number;
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
    created_at: string;
    user?: {
        name?: string;
    };
    customer?: {
        name?: string;
    };
}

interface SalePagination {
    data: SaleItem[];
    current_page?: number;
    last_page?: number;
    total?: number;
    from?: number;
    to?: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
}

interface IndexProps {
    sales: SalePagination;
    filters: {
        search?: string;
        month?: string | number;
        year?: string | number;
        start_date?: string;
        end_date?: string;
        source?: 'shop' | 'online';
        col?: string;
        dir?: 'asc' | 'desc' | '';
    };
    source?: 'shop' | 'online';
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sales History', href: '/sales' },
];

export default function Index({ sales, filters }: IndexProps) {
    const currentSource = (filters?.source || 'shop') as 'shop' | 'online';
    const isOnline = currentSource === 'online';

    // Filter states
    const [search, setSearch] = useState(filters?.search || '');

    const today = new Date();
    const defaultMonthValue =
        filters?.year && filters?.month
            ? `${filters.year}-${String(filters.month).padStart(2, '0')}`
            : '';
    const [monthYear, setMonthYear] = useState(defaultMonthValue);

    const applyFilters = (newSource = currentSource, newMonthYear = monthYear, newSearch = search) => {
        const query: Record<string, any> = {
            source: newSource,
        };

        if (newSearch && newSearch.trim()) {
            query.search = newSearch.trim();
        }

        if (newMonthYear) {
            const [year, month] = newMonthYear.split('-').map(Number);
            if (year && month) {
                query.year = year;
                query.month = month;
            }
        }

        if (filters?.col) query.col = filters.col;
        if (filters?.dir) query.dir = filters.dir;

        router.get(route('sales.index'), query, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleSourceChange = (targetSource: 'shop' | 'online') => {
        if (targetSource === currentSource) return;
        applyFilters(targetSource, monthYear, search);
    };

    const handleReset = () => {
        setSearch('');
        setMonthYear('');
        router.get(
            route('sales.index'),
            { source: currentSource },
            { preserveState: true, replace: true }
        );
    };

    const handleSort = (colKey: string) => {
        let dir = filters?.dir ?? '';
        dir = dir === 'asc' ? 'desc' : dir === 'desc' ? '' : 'asc';

        const query: Record<string, any> = {
            source: currentSource,
            col: colKey,
            dir,
        };

        if (search) query.search = search;
        if (monthYear) {
            const [year, month] = monthYear.split('-').map(Number);
            if (year && month) {
                query.year = year;
                query.month = month;
            }
        }

        router.get(route('sales.index'), query, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleExport = (format: 'pdf' | 'csv') => {
        const queryParams = new URLSearchParams();

        if (filters?.month) queryParams.append('month', String(filters.month));
        if (filters?.year) queryParams.append('year', String(filters.year));
        if (filters?.start_date) queryParams.append('start_date', filters.start_date);
        if (filters?.end_date) queryParams.append('end_date', filters.end_date);
        if (search) queryParams.append('search', search);
        queryParams.append('source', currentSource);

        const url = `${route('sales.export', format)}?${queryParams.toString()}`;
        window.open(url, '_blank');
    };

    // Calculate sum of currently displayed records
    const displayedSum = (sales.data || []).reduce(
        (sum, item) => sum + (Number(item.total) || 0),
        0
    );

    const formatMMK = (amount: number | string) => {
        const num = Number(amount) || 0;
        return `${num.toLocaleString()} MMK`;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime())
                ? dateStr
                : d.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                  });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime())
                ? ''
                : d.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                  });
        } catch {
            return '';
        }
    };

    const renderPaymentBadge = (method?: string) => {
        const normalized = (method || 'cash').toLowerCase();
        if (normalized.includes('kpay') || normalized.includes('kbz')) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
                    <CreditCard className="size-3" />
                    KBZPay
                </span>
            );
        }
        if (normalized.includes('wave')) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                    <CreditCard className="size-3" />
                    WavePay
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                <Banknote className="size-3" />
                Cash
            </span>
        );
    };

    const renderStatusBadge = (status?: string) => {
        if (!status) return null;
        const norm = status.toLowerCase();
        if (norm === 'completed') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="size-3" />
                    Completed
                </span>
            );
        }
        if (norm === 'pending') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                    <Clock className="size-3" />
                    Pending
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
                <XCircle className="size-3" />
                {status}
            </span>
        );
    };

    const hasActiveFilters = Boolean(search || monthYear);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isOnline ? 'Online Orders History' : 'POS Sales History'} />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header & Page Title */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Sales & Fiscal History
                            </h1>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                {sales.total !== undefined ? `${sales.total} Total Records` : 'Transactions'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Browse recorded transactions, review receipts, audit POS cashier settlements, and export fiscal statements.
                        </p>
                    </div>

                    {/* Export Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => handleExport('pdf')}
                            className="h-9 gap-1.5 rounded-xl border-border text-xs font-semibold hover:bg-accent"
                            title="Download PDF statement"
                        >
                            <FileText className="size-3.5 text-primary" />
                            <span>Export PDF</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport('csv')}
                            className="h-9 gap-1.5 rounded-xl border-border text-xs font-semibold hover:bg-accent"
                            title="Download CSV spreadsheet"
                        >
                            <FileSpreadsheet className="size-3.5 text-emerald-600" />
                            <span>Export CSV</span>
                        </Button>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Active Channel Card */}
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Active Channel
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-base text-foreground">
                                    {isOnline ? 'Online Storefront' : 'Physical POS Registers'}
                                </span>
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            {isOnline ? <Globe className="size-5" /> : <Store className="size-5" />}
                        </div>
                    </div>

                    {/* Cumulative Sum for Batch */}
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Current Page Revenue
                            </span>
                            <div className="font-bold font-mono text-base text-primary">
                                {formatMMK(displayedSum)}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TrendingUp className="size-5" />
                        </div>
                    </div>

                    {/* Filter Period / Batch Count */}
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Filtered Period
                            </span>
                            <div className="font-bold text-sm text-foreground">
                                {monthYear
                                    ? new Date(`${monthYear}-01`).toLocaleDateString('en-US', {
                                          month: 'long',
                                          year: 'numeric',
                                      })
                                    : 'All Available Periods'}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Calendar className="size-5" />
                        </div>
                    </div>
                </div>

                {/* Filter Toolbar Card */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Segmented Channel Tabs */}
                        <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/70 w-fit">
                            <button
                                type="button"
                                onClick={() => handleSourceChange('shop')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    !isOnline
                                        ? 'bg-background text-primary shadow-xs border border-border/60'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Store className="size-4" />
                                <span>Shop POS Sales</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSourceChange('online')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    isOnline
                                        ? 'bg-background text-primary shadow-xs border border-border/60'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Globe className="size-4" />
                                <span>Online Storefront Orders</span>
                            </button>
                        </div>

                        {/* Search & Month Filter Inputs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-xl justify-end">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                                <Input
                                    placeholder={
                                        isOnline
                                            ? 'Search by order #, customer, phone...'
                                            : 'Search by invoice #, cashier...'
                                    }
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilters(currentSource, monthYear, search);
                                        }
                                    }}
                                    className="pl-9 h-10 rounded-xl bg-background"
                                />
                            </div>

                            {/* Month Picker */}
                            <div className="w-full sm:w-44">
                                <Input
                                    type="month"
                                    value={monthYear}
                                    onChange={(e) => {
                                        setMonthYear(e.target.value);
                                        applyFilters(currentSource, e.target.value, search);
                                    }}
                                    className="h-10 rounded-xl bg-background text-xs font-medium"
                                    title="Filter by month"
                                />
                            </div>

                            {/* Apply Button */}
                            <Button
                                onClick={() => applyFilters(currentSource, monthYear, search)}
                                className="h-10 rounded-xl px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Apply
                            </Button>

                            {/* Clear Reset Button */}
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="h-10 rounded-xl px-3 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="size-3.5" />
                                    <span className="hidden sm:inline">Reset</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sales Records Table Card */}
                <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-12 text-center text-xs font-bold text-muted-foreground">
                                        #
                                    </TableHead>

                                    {/* Invoice / Order No */}
                                    <TableHead>
                                        <button
                                            type="button"
                                            onClick={() => handleSort(isOnline ? 'order_no' : 'invoice_no')}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <span>{isOnline ? 'Order No' : 'Invoice No'}</span>
                                            <ArrowUpDown className="size-3 opacity-60" />
                                        </button>
                                    </TableHead>

                                    {/* Channel */}
                                    <TableHead className="text-xs font-bold text-muted-foreground">
                                        Channel
                                    </TableHead>

                                    {/* Sale By / Customer */}
                                    <TableHead>
                                        <button
                                            type="button"
                                            onClick={() => handleSort(isOnline ? 'user_id' : 'sale_by')}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <span>{isOnline ? 'Customer Name' : 'Cashier / Staff'}</span>
                                            <ArrowUpDown className="size-3 opacity-60" />
                                        </button>
                                    </TableHead>

                                    {/* Sale Date */}
                                    <TableHead>
                                        <button
                                            type="button"
                                            onClick={() => handleSort('created_at')}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <span>Transaction Date</span>
                                            <ArrowUpDown className="size-3 opacity-60" />
                                        </button>
                                    </TableHead>

                                    {/* Payment Method */}
                                    <TableHead className="text-xs font-bold text-muted-foreground">
                                        Payment Method
                                    </TableHead>

                                    {/* Status (Online Only) */}
                                    {isOnline && (
                                        <TableHead className="text-xs font-bold text-muted-foreground">
                                            Status
                                        </TableHead>
                                    )}

                                    {/* Total Amount */}
                                    <TableHead className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('total')}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                                        >
                                            <span>Total Amount</span>
                                            <ArrowUpDown className="size-3 opacity-60" />
                                        </button>
                                    </TableHead>

                                    {/* Actions */}
                                    <TableHead className="text-right pr-6 text-xs font-bold text-muted-foreground">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-border/60">
                                {sales.data && sales.data.length > 0 ? (
                                    sales.data.map((sale, index) => {
                                        const invoiceNumber = isOnline
                                            ? sale.order_no || `ORD-${sale.id}`
                                            : sale.invoice_no || `INV-${sale.id}`;

                                        const personName = isOnline
                                            ? sale.customer?.name || sale.user?.name || sale.name || 'Storefront Guest'
                                            : sale.user?.name || `Staff #${sale.sale_by || sale.id}`;

                                        const initials = personName
                                            .split(' ')
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase();

                                        const rowNumber =
                                            sales.from !== undefined ? sales.from + index : index + 1;

                                        return (
                                            <TableRow
                                                key={sale.id}
                                                className="hover:bg-muted/30 transition-colors"
                                            >
                                                {/* Row Index */}
                                                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                    {rowNumber}
                                                </TableCell>

                                                {/* Invoice / Order Identifier */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <Receipt className="size-4" />
                                                        </div>
                                                        <div>
                                                            <span className="font-mono font-bold text-xs sm:text-sm text-foreground">
                                                                #{invoiceNumber}
                                                            </span>
                                                            {isOnline && sale.phone && (
                                                                <p className="text-[11px] text-muted-foreground font-mono">
                                                                    {sale.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Sales Channel */}
                                                <TableCell>
                                                    {isOnline ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50/80 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300">
                                                            <Globe className="size-3" />
                                                            Online Order
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                                                            <Store className="size-3" />
                                                            POS Register
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* Person Info (Cashier or Customer) */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="size-7 border border-border">
                                                            <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                                                                {initials || <UserIcon className="size-3" />}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-xs text-foreground leading-tight">
                                                                {personName}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {isOnline ? 'Online Shopper' : 'Register Operator'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Transaction Date & Time */}
                                                <TableCell>
                                                    <div className="flex flex-col text-xs leading-tight">
                                                        <span className="font-medium text-foreground">
                                                            {formatDate(sale.created_at)}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                                                            <Clock className="size-2.5" />
                                                            {formatTime(sale.created_at)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Payment Method */}
                                                <TableCell>
                                                    {renderPaymentBadge(sale.payment_method)}
                                                </TableCell>

                                                {/* Status (Online only) */}
                                                {isOnline && (
                                                    <TableCell>
                                                        {renderStatusBadge(sale.status)}
                                                    </TableCell>
                                                )}

                                                {/* Total Amount */}
                                                <TableCell className="text-right">
                                                    <span className="font-mono font-bold text-sm text-foreground">
                                                        {formatMMK(sale.total)}
                                                    </span>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right pr-6">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            router.visit(
                                                                route('sales.show', {
                                                                    id: sale.id,
                                                                    source: currentSource,
                                                                })
                                                            )
                                                        }
                                                        className="h-8 gap-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        <span>Inspect</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isOnline ? 9 : 8}
                                            className="py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                                                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
                                                    <Receipt className="size-7" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-foreground">
                                                        No sales records found
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        There are no transaction records matching your current filter criteria or selected sales channel.
                                                    </p>
                                                </div>
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleReset}
                                                        className="rounded-xl text-xs"
                                                    >
                                                        Reset All Filters
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 sm:px-6">
                        <div className="text-xs text-muted-foreground">
                            {sales.total !== undefined ? (
                                <>
                                    Showing{' '}
                                    <span className="font-semibold text-foreground">
                                        {sales.from || 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-semibold text-foreground">
                                        {sales.to || 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-semibold text-foreground">
                                        {sales.total}
                                    </span>{' '}
                                    records
                                </>
                            ) : (
                                `Page ${sales.current_page || 1}`
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!sales.prev_page_url}
                                onClick={() =>
                                    sales.prev_page_url &&
                                    router.get(sales.prev_page_url, {}, { preserveScroll: true })
                                }
                                className="h-8 gap-1 rounded-xl text-xs font-medium"
                            >
                                <ChevronLeft className="size-3.5" />
                                <span>Previous</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!sales.next_page_url}
                                onClick={() =>
                                    sales.next_page_url &&
                                    router.get(sales.next_page_url, {}, { preserveScroll: true })
                                }
                                className="h-8 gap-1 rounded-xl text-xs font-medium"
                            >
                                <span>Next</span>
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
