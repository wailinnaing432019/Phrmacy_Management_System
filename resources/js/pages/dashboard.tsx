import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertOctagon,
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Package,
    Pill,
    Plus,
    Receipt,
    ShieldCheck,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import React, { useMemo } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface TopMedicine {
    name: string;
    sales: number;
}

interface MedicineAlert {
    medicine_id: number;
    name: string;
    stock: number;
    status: 'Expired' | 'Near Expiry' | 'Low Stock' | string;
}

interface DashboardProps {
    total_sales_today: number;
    total_purchases_today: number;
    total_revenue: number;
    total_cost: number;
    daily_sales: { date: string; total: number }[];
    top_medicines: TopMedicine[];
    medicine_alerts: MedicineAlert[];
}

export default function Dashboard({
    total_sales_today = 0,
    total_purchases_today = 0,
    total_revenue = 0,
    total_cost = 0,
    daily_sales = [],
    top_medicines = [],
    medicine_alerts = [],
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const userName = auth?.user?.name || 'Administrator';

    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }, []);

    const kpiCards = [
        {
            title: "Today's Sales",
            value: total_sales_today,
            unit: 'MMK',
            subtitle: 'Recorded sales today',
            icon: DollarSign,
            colorScheme: {
                iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                topBorder: 'border-t-emerald-500',
                valueColor: 'text-emerald-700 dark:text-emerald-400',
            },
        },
        {
            title: "Today's Purchases",
            value: total_purchases_today,
            unit: 'MMK',
            subtitle: 'Procurement expenses today',
            icon: ShoppingBag,
            colorScheme: {
                iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                topBorder: 'border-t-sky-500',
                valueColor: 'text-sky-700 dark:text-sky-400',
            },
        },
        {
            title: 'Total Revenue',
            value: total_revenue,
            unit: 'MMK',
            subtitle: 'Cumulative lifetime sales',
            icon: TrendingUp,
            colorScheme: {
                iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
                topBorder: 'border-t-teal-500',
                valueColor: 'text-teal-700 dark:text-teal-400',
            },
        },
        {
            title: 'Total Inventory Cost',
            value: total_cost,
            unit: 'MMK',
            subtitle: 'Cumulative acquisition cost',
            icon: CreditCard,
            colorScheme: {
                iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                topBorder: 'border-t-indigo-500',
                valueColor: 'text-indigo-700 dark:text-indigo-400',
            },
        },
    ];

    const renderAlertBadge = (status: string) => {
        switch (status) {
            case 'Expired':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
                        <AlertOctagon className="size-3.5" />
                        Expired
                    </span>
                );
            case 'Near Expiry':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
                        <Clock className="size-3.5" />
                        Near Expiry
                    </span>
                );
            case 'Low Stock':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400">
                        <TrendingDown className="size-3.5" />
                        Low Stock
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Pharmacy Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 md:gap-8">
                {/* Hero Header Section */}
                <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/15 px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:text-teal-300">
                                    <Activity className="size-3 text-teal-600 dark:text-teal-400" />
                                    Live Telemetry
                                </span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="size-3.5" />
                                    <span>{formattedDate}</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Welcome back, {userName}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Monitor real-time sales metrics, inventory movements, and stock alerts.
                            </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                href="/cashier/pos"
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-600/30 transition-all hover:bg-teal-700 hover:shadow-md"
                            >
                                <Receipt className="size-4" />
                                <span>POS Terminal</span>
                            </Link>

                            <Link
                                href="/medicines/create"
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-accent hover:text-accent-foreground"
                            >
                                <Plus className="size-4 text-teal-600 dark:text-teal-400" />
                                <span>Add Medicine</span>
                            </Link>

                            <Link
                                href="/orders"
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-accent hover:text-accent-foreground"
                            >
                                <Package className="size-4 text-teal-600 dark:text-teal-400" />
                                <span>Orders</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className={`group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-t-3 ${card.colorScheme.topBorder}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {card.title}
                                        </p>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className={`text-2xl font-extrabold tracking-tight ${card.colorScheme.valueColor}`}>
                                                {Number(card.value).toLocaleString()}
                                            </span>
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {card.unit}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground/80">{card.subtitle}</p>
                                    </div>
                                    <div
                                        className={`flex size-11 items-center justify-center rounded-xl border shadow-xs ${card.colorScheme.iconBg}`}
                                    >
                                        <Icon className="size-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Sales Velocity Chart */}
                    <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                            <div>
                                <h2 className="text-base font-bold text-foreground">Sales Velocity</h2>
                                <p className="text-xs text-muted-foreground">Daily aggregated revenue performance</p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                                <TrendingUp className="size-3" />
                                Daily Total
                            </span>
                        </div>

                        <div className="h-[320px] w-full pt-2">
                            {daily_sales.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={daily_sales}
                                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.6 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                                        />
                                        <YAxis
                                            tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.6 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                                            tickFormatter={(val) => `${Number(val) / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: '0.75rem',
                                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                                boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
                                                padding: '8px 12px',
                                            }}
                                            labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}
                                            itemStyle={{ color: '#0d9488', fontWeight: 600 }}
                                            formatter={(value: number) => [`${Number(value).toLocaleString()} MMK`, 'Sales']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#0d9488"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#salesGradient)"
                                            activeDot={{ r: 6, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                                    <ShoppingBag className="size-8 stroke-[1.5] text-muted-foreground/40 mb-2" />
                                    <span>No daily sales recorded yet.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top 5 Medicines Chart */}
                    <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                            <div>
                                <h2 className="text-base font-bold text-foreground">Top 5 Best-Selling Medicines</h2>
                                <p className="text-xs text-muted-foreground">Ranked by accumulated sales value</p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-400">
                                <Pill className="size-3" />
                                Top Movers
                            </span>
                        </div>

                        <div className="h-[320px] w-full pt-2">
                            {top_medicines.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={top_medicines}
                                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.6 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                                        />
                                        <YAxis
                                            tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.6 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                                            tickFormatter={(val) => `${Number(val) / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: '0.75rem',
                                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                                boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
                                                padding: '8px 12px',
                                            }}
                                            labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}
                                            itemStyle={{ color: '#0284c7', fontWeight: 600 }}
                                            formatter={(value: number) => [`${Number(value).toLocaleString()} MMK`, 'Sales']}
                                        />
                                        <Bar
                                            dataKey="sales"
                                            fill="#0284c7"
                                            radius={[6, 6, 0, 0]}
                                            name="Sales"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                                    <Pill className="size-8 stroke-[1.5] text-muted-foreground/40 mb-2" />
                                    <span>No top medicine data available.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Medicine Alerts Table */}
                <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <AlertTriangle className="size-4.5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-foreground">
                                    Inventory Alerts & Expiry Watchlist
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Medicines requiring urgent restock, batch rotation, or disposal
                                </p>
                            </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-foreground">
                            <span>{medicine_alerts.length}</span>
                            <span className="text-muted-foreground">Alerts</span>
                        </span>
                    </div>

                    {medicine_alerts.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-border/70">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/50 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                    <tr>
                                        <th scope="col" className="px-5 py-3.5 text-left">
                                            Medicine
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-left">
                                            Current Stock
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-left">
                                            Alert Status
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 bg-card">
                                    {medicine_alerts.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-3.5 font-medium text-foreground">
                                                <Link
                                                    href={route('medicines.show', item.medicine_id)}
                                                    className="inline-flex items-center gap-2 hover:text-teal-600 dark:hover:text-teal-400 font-semibold"
                                                >
                                                    <Pill className="size-3.5 text-teal-600 dark:text-teal-400" />
                                                    <span>{item.name}</span>
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                                                    {item.stock} units
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {renderAlertBadge(item.status)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <Link
                                                    href={route('medicines.show', item.medicine_id)}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40"
                                                >
                                                    <span>Inspect</span>
                                                    <ArrowRight className="size-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-500/20">
                                <ShieldCheck className="size-6" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">All Inventory Healthy</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                There are currently no expired items, near-expiry batches, or low-stock medicines in the system.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
