import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Package,
    Search,
    Calendar,
    RotateCcw,
    Eye,
    FileText,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Banknote,
    MapPin,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    Pill,
    Receipt,
    User as UserIcon,
    AlertCircle,
    TrendingUp,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Medicine {
    id?: number;
    name?: string;
}

interface OrderItem {
    id: number;
    medicine?: Medicine;
    qty: number;
    price: number;
}

interface Order {
    id: number;
    order_no: string;
    name: string;
    email: string;
    phone: string;
    total: number;
    status: string;
    address: string;
    payment_method: string;
    transaction_id?: string | null;
    created_at: string;
    reservation_expires_at?: string | null;
    cancellation_reason?: string | null;
    items?: OrderItem[];
}

interface OrderPagination {
    data: Order[];
    current_page: number;
    last_page: number;
    total?: number;
    from?: number;
    to?: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customer Orders', href: '/orders' },
];

export default function Index() {
    const { orders, filters, flash, errors } = usePage().props as {
        orders: OrderPagination;
        filters: { search?: string; status?: string; date?: string };
        flash?: { success?: string; error?: string };
        errors?: Record<string, string>;
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [date, setDate] = useState(filters?.date || '');

    // Order detail modal state
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const applyFilters = (newSearch = search, newStatus = status, newDate = date) => {
        const query: Record<string, string> = {};
        if (newSearch && newSearch.trim()) query.search = newSearch.trim();
        if (newStatus && newStatus !== 'all') query.status = newStatus;
        if (newDate) query.date = newDate;

        router.get(route('orders.index'), query, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setDate('');
        router.get(route('orders.index'), {}, { preserveState: true, replace: true });
    };

    const handleStatusChange = (orderId: number, newStatus: string) => {
        setUpdatingStatus(true);
        router.put(
            route('orders.update', orderId),
            { status: newStatus },
            {
                preserveState: true,
                onSuccess: () => {
                    setUpdatingStatus(false);
                    // update selected order status in dialog if open
                    if (selectedOrder && selectedOrder.id === orderId) {
                        setSelectedOrder({ ...selectedOrder, status: newStatus });
                    }
                },
                onError: () => {
                    setUpdatingStatus(false);
                },
            }
        );
    };

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

    const renderPaymentBadge = (method?: string, transactionId?: string | null) => {
        const normalized = (method || 'cash').toLowerCase();
        let badge;
        if (normalized.includes('kpay') || normalized.includes('kbz')) {
            badge = (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                    <CreditCard className="size-3" />
                    KBZPay
                </span>
            );
        } else if (normalized.includes('wave')) {
            badge = (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                    <CreditCard className="size-3" />
                    WavePay
                </span>
            );
        } else {
            badge = (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Banknote className="size-3" />
                    Cash
                </span>
            );
        }

        return (
            <div className="flex flex-col gap-0.5">
                <div>{badge}</div>
                {transactionId && (
                    <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[130px]">
                        Ref: {transactionId}
                    </span>
                )}
            </div>
        );
    };

    const renderStatusBadge = (order: Order) => {
        const status = order.status?.toLowerCase();
        if (status === 'completed') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="size-3" />
                    Completed
                </span>
            );
        }
        if (status === 'pending') {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 w-fit">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                        </span>
                        Pending
                    </span>
                    {order.reservation_expires_at && (
                        <span className="text-[10px] text-muted-foreground">
                            Held until {formatTime(order.reservation_expires_at)}
                        </span>
                    )}
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 w-fit">
                    <XCircle className="size-3" />
                    Cancelled
                </span>
                {order.cancellation_reason === 'expired' && (
                    <span className="text-[10px] text-rose-500 font-medium">Reservation expired</span>
                )}
            </div>
        );
    };

    const hasActiveFilters = Boolean(search || (status && status !== 'all') || date);

    // Calculate count breakdown for metric indicators
    const totalOrderCount = orders.total ?? (orders.data ? orders.data.length : 0);
    const pendingOrdersCount = (orders.data || []).filter(
        (o) => o.status?.toLowerCase() === 'pending'
    ).length;
    const completedOrdersCount = (orders.data || []).filter(
        (o) => o.status?.toLowerCase() === 'completed'
    ).length;
    const currentSum = (orders.data || []).reduce(
        (sum, o) => sum + (Number(o.total) || 0),
        0
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Orders Management" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Alert Notifications */}
                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {(flash?.error || errors?.error) && (
                    <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2 shadow-xs">
                        <AlertCircle className="size-4 text-rose-600 shrink-0" />
                        <span>{flash?.error || errors?.error}</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Customer Storefront Orders
                            </h1>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                {totalOrderCount} Total Orders
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Review web customer orders, inspect medicine cart items, verify digital payment slips, and manage fulfillment.
                        </p>
                    </div>
                </div>

                {/* KPI Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Total Orders */}
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Orders
                            </span>
                            <div className="font-bold text-xl text-foreground font-mono">
                                {totalOrderCount}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Package className="size-5" />
                        </div>
                    </div>

                    {/* Pending Fulfillment */}
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                                Pending Action
                            </span>
                            <div className="font-bold text-xl text-amber-700 font-mono">
                                {pendingOrdersCount}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <Clock className="size-5" />
                        </div>
                    </div>

                    {/* Completed Orders */}
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                Dispensed Orders
                            </span>
                            <div className="font-bold text-xl text-emerald-700 font-mono">
                                {completedOrdersCount}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="size-5" />
                        </div>
                    </div>

                    {/* Current Page Value */}
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Batch Value
                            </span>
                            <div className="font-bold text-base text-primary font-mono">
                                {formatMMK(currentSum)}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TrendingUp className="size-5" />
                        </div>
                    </div>
                </div>

                {/* Filter Toolbar Card */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                            <Input
                                placeholder="Search by customer name, order #, phone, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        applyFilters(search, status, date);
                                    }
                                }}
                                className="pl-9 h-10 rounded-xl bg-background"
                            />
                        </div>

                        {/* Status Select */}
                        <Select
                            value={status}
                            onValueChange={(val) => {
                                setStatus(val);
                                applyFilters(search, val, date);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl bg-background text-xs font-medium">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-md">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-amber-500" />
                                        <span>Pending Review</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-emerald-500" />
                                        <span>Completed</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-rose-500" />
                                        <span>Cancelled</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Picker */}
                        <div className="w-full sm:w-44">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    applyFilters(search, status, e.target.value);
                                }}
                                className="h-10 rounded-xl bg-background text-xs font-medium"
                                title="Filter by order date"
                            />
                        </div>

                        {/* Apply Button */}
                        <Button
                            onClick={() => applyFilters(search, status, date)}
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

                {/* Orders Table Card */}
                <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-12 text-center text-xs font-bold text-muted-foreground">
                                        #
                                    </TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground">
                                        Order No
                                    </TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground">
                                        Customer Details
                                    </TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground">
                                        Delivery Address
                                    </TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground">
                                        Payment Info
                                    </TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground">
                                        Order Date
                                    </TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold text-muted-foreground">
                                        Total Amount
                                    </TableHead>
                                    <TableHead className="text-right pr-6 text-xs font-bold text-muted-foreground">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-border/60">
                                {orders.data && orders.data.length > 0 ? (
                                    orders.data.map((order, index) => {
                                        const initials = (order.name || 'C')
                                            .split(' ')
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase();

                                        const rowNumber =
                                            orders.from !== undefined ? orders.from + index : index + 1;

                                        const itemCount = order.items?.length || 0;

                                        return (
                                            <TableRow
                                                key={order.id}
                                                className="hover:bg-muted/30 transition-colors"
                                            >
                                                {/* Index */}
                                                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                    {rowNumber}
                                                </TableCell>

                                                {/* Order Identifier */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <Receipt className="size-4" />
                                                        </div>
                                                        <div>
                                                            <span className="font-mono font-bold text-xs sm:text-sm text-foreground">
                                                                #{order.order_no}
                                                            </span>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Customer Details */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="size-8 border border-border">
                                                            <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                                                                {initials || <UserIcon className="size-3" />}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col max-w-[160px]">
                                                            <span className="font-semibold text-xs text-foreground truncate">
                                                                {order.name}
                                                            </span>
                                                            {order.phone && (
                                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                                                    <Phone className="size-2.5" />
                                                                    {order.phone}
                                                                </span>
                                                            )}
                                                            {order.email && (
                                                                <span className="text-[10px] text-muted-foreground/80 truncate">
                                                                    {order.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Delivery Address */}
                                                <TableCell>
                                                    <div className="flex items-start gap-1.5 max-w-[200px] text-xs text-slate-700 dark:text-slate-300">
                                                        <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2 leading-tight" title={order.address}>
                                                            {order.address || '—'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Payment */}
                                                <TableCell>
                                                    {renderPaymentBadge(order.payment_method, order.transaction_id)}
                                                </TableCell>

                                                {/* Order Date */}
                                                <TableCell>
                                                    <div className="flex flex-col text-xs leading-tight">
                                                        <span className="font-medium text-foreground">
                                                            {formatDate(order.created_at)}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                                                            <Clock className="size-2.5" />
                                                            {formatTime(order.created_at)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    {renderStatusBadge(order)}
                                                </TableCell>

                                                {/* Total */}
                                                <TableCell className="text-right">
                                                    <span className="font-mono font-bold text-sm text-foreground">
                                                        {formatMMK(order.total)}
                                                    </span>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Inspect & Manage Order Button */}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="h-8 gap-1 rounded-lg text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
                                                        >
                                                            <Eye className="size-3.5" />
                                                            <span>Manage</span>
                                                        </Button>

                                                        {/* Quick Invoice Link */}
                                                        <a
                                                            href={route('invoice.preview', order.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Preview Invoice PDF"
                                                        >
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                                            >
                                                                <FileText className="size-3.5" />
                                                            </Button>
                                                        </a>

                                                        <a
                                                            href={route('invoice.download', order.id)}
                                                            title="Download Invoice PDF"
                                                        >
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Download className="size-3.5" />
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                                                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
                                                    <Package className="size-7" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-foreground">
                                                        No customer orders found
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        There are no online storefront orders matching your current filter criteria or status.
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
                            {orders.total !== undefined ? (
                                <>
                                    Showing{' '}
                                    <span className="font-semibold text-foreground">
                                        {orders.from || 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-semibold text-foreground">
                                        {orders.to || 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-semibold text-foreground">
                                        {orders.total}
                                    </span>{' '}
                                    orders
                                </>
                            ) : (
                                `Page ${orders.current_page || 1} of ${orders.last_page || 1}`
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!orders.prev_page_url}
                                onClick={() =>
                                    orders.prev_page_url &&
                                    router.get(orders.prev_page_url, filters, {
                                        preserveState: true,
                                        replace: true,
                                    })
                                }
                                className="h-8 gap-1 rounded-xl text-xs font-medium"
                            >
                                <ChevronLeft className="size-3.5" />
                                <span>Previous</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!orders.next_page_url}
                                onClick={() =>
                                    orders.next_page_url &&
                                    router.get(orders.next_page_url, filters, {
                                        preserveState: true,
                                        replace: true,
                                    })
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

            {/* ORDER DETAIL & FULFILLMENT MODAL */}
            {selectedOrder && (
                <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                    <DialogContent className="max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="pb-3 border-b border-border">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <DialogTitle className="text-lg font-bold tracking-tight">
                                            Order #{selectedOrder.order_no}
                                        </DialogTitle>
                                        {renderStatusBadge(selectedOrder)}
                                    </div>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                        Placed on {formatDate(selectedOrder.created_at)} at {formatTime(selectedOrder.created_at)}
                                    </DialogDescription>
                                </div>

                                {/* Status Control Selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Fulfillment:</span>
                                    <Select
                                        value={selectedOrder.status}
                                        onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}
                                        disabled={updatingStatus}
                                    >
                                        <SelectTrigger className="w-36 h-9 rounded-xl text-xs font-bold border-primary/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg">
                                            <SelectItem value="pending" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-amber-500" />
                                                    <span>Pending</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="completed" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-emerald-500" />
                                                    <span>Completed</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="cancelled" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-rose-500" />
                                                    <span>Cancelled</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Customer & Delivery Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs">
                            {/* Customer Profile */}
                            <div className="rounded-xl border border-border/70 p-3 bg-muted/20 space-y-1.5">
                                <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                                    Customer Information
                                </span>
                                <div className="space-y-1">
                                    <p className="font-semibold text-foreground text-sm">{selectedOrder.name}</p>
                                    {selectedOrder.phone && (
                                        <p className="text-muted-foreground flex items-center gap-1 font-mono">
                                            <Phone className="size-3 text-primary" />
                                            {selectedOrder.phone}
                                        </p>
                                    )}
                                    {selectedOrder.email && (
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            <Mail className="size-3 text-primary" />
                                            {selectedOrder.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Delivery & Payment */}
                            <div className="rounded-xl border border-border/70 p-3 bg-muted/20 space-y-1.5">
                                <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                                    Delivery & Payment Method
                                </span>
                                <div className="space-y-1">
                                    <p className="text-foreground flex items-start gap-1 leading-snug">
                                        <MapPin className="size-3 text-primary shrink-0 mt-0.5" />
                                        <span>{selectedOrder.address || 'Standard Store Pickup'}</span>
                                    </p>
                                    <div className="pt-1 flex items-center gap-2">
                                        {renderPaymentBadge(selectedOrder.payment_method, selectedOrder.transaction_id)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Itemized Medicines Table */}
                        <div className="space-y-2">
                            <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                                Prescribed Medicines & Items ({selectedOrder.items?.length || 0})
                            </span>
                            <div className="rounded-xl border border-border/80 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="text-xs font-bold">Medicine</TableHead>
                                            <TableHead className="text-center text-xs font-bold w-16">Qty</TableHead>
                                            <TableHead className="text-right text-xs font-bold w-28">Unit Price</TableHead>
                                            <TableHead className="text-right text-xs font-bold w-28">Line Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-border/60">
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item, idx) => {
                                                const unitPrice = Number(item.price) || 0;
                                                const subtotal = (Number(item.qty) || 0) * unitPrice;
                                                return (
                                                    <TableRow key={item.id || idx} className="hover:bg-muted/20">
                                                        <TableCell className="text-xs font-semibold text-foreground">
                                                            <div className="flex items-center gap-1.5">
                                                                <Pill className="size-3.5 text-primary" />
                                                                <span>{item.medicine?.name || `Medicine #${item.id}`}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center font-mono text-xs">
                                                            {item.qty}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                                            {formatMMK(unitPrice)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                                                            {formatMMK(subtotal)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                                                    No items recorded in this order.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Total Due Banner */}
                        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Total Amount Due
                            </span>
                            <span className="text-xl font-bold font-mono text-primary">
                                {formatMMK(selectedOrder.total)}
                            </span>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <a
                                    href={route('invoice.preview', selectedOrder.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-none"
                                >
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-9 gap-1.5 rounded-xl text-xs font-semibold w-full sm:w-auto"
                                    >
                                        <FileText className="size-3.5 text-primary" />
                                        <span>Preview Invoice</span>
                                    </Button>
                                </a>

                                <a
                                    href={route('invoice.download', selectedOrder.id)}
                                    className="flex-1 sm:flex-none"
                                >
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-9 gap-1.5 rounded-xl text-xs font-semibold w-full sm:w-auto"
                                    >
                                        <Download className="size-3.5 text-primary" />
                                        <span>Download PDF</span>
                                    </Button>
                                </a>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-xl h-9 px-4 text-xs font-semibold w-full sm:w-auto"
                            >
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
