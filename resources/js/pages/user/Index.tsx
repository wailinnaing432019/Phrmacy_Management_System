import { useState, useTransition } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import {
    Users,
    UserPlus,
    ShieldCheck,
    CreditCard,
    Search,
    RotateCcw,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Mail,
    User as UserIcon,
    AlertCircle,
    CheckCircle2,
    Lock,
    KeyRound,
    ChevronLeft,
    ChevronRight,
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
    DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import InputError from '@/components/input-error';
import { toast } from 'sonner';

export interface StaffUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'cashier' | string;
    is_super_admin?: boolean;
    created_at?: string;
}

interface UserPagination {
    data: StaffUser[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface IndexProps {
    users: UserPagination;
    filters: {
        search?: string;
        role?: string;
    };
    counts?: {
        total: number;
        admin: number;
        cashier: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff & Users', href: '/users' },
];

export default function Index({ users, filters, counts }: IndexProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth?.user?.id;

    // Filter states
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || 'all');
    const [isSearching, startSearchTransition] = useTransition();

    // Dialog state for "Add New User"
    const [addOpen, setAddOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Inertia form for adding new user
    const {
        data: addData,
        setData: setAddData,
        post: submitAddUser,
        processing: addProcessing,
        errors: addErrors,
        reset: resetAddForm,
        clearErrors: clearAddErrors,
    } = useForm({
        name: '',
        email: '',
        role: 'cashier' as 'admin' | 'cashier',
        password: '',
        password_confirmation: '',
    });

    // Handle filter application
    const applyFilters = (newSearch?: string, newRole?: string) => {
        const querySearch = newSearch !== undefined ? newSearch : search;
        const queryRole = newRole !== undefined ? newRole : roleFilter;

        const params: Record<string, string> = {};
        if (querySearch.trim()) params.search = querySearch.trim();
        if (queryRole && queryRole !== 'all') params.role = queryRole;

        startSearchTransition(() => {
            router.get(route('users.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(search, roleFilter);
    };

    const handleResetFilters = () => {
        setSearch('');
        setRoleFilter('all');
        startSearchTransition(() => {
            router.get(route('users.index'), {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        });
    };

    // Open/Close Add Modal
    const handleOpenAddModal = () => {
        resetAddForm();
        clearAddErrors();
        setShowPassword(false);
        setShowConfirmPassword(false);
        setAddOpen(true);
    };

    const handleCloseAddModal = () => {
        setAddOpen(false);
        resetAddForm();
        clearAddErrors();
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        submitAddUser(route('users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setAddOpen(false);
                resetAddForm();
                toast.success('Staff account created successfully!');
            },
        });
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const totalCount = counts?.total ?? users.total ?? 0;
    const adminCount = counts?.admin ?? 0;
    const cashierCount = counts?.cashier ?? 0;
    const hasActiveFilters = Boolean(filters?.search || (filters?.role && filters.role !== 'all'));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff & Users" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Staff & User Accounts
                            </h1>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                {totalCount} Staff
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Manage pharmacy administrators and cashier accounts with role-based system access.
                        </p>
                    </div>

                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto"
                    >
                        <UserPlus className="size-4" />
                        <span>Add New User</span>
                    </Button>
                </div>

                {/* KPI Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Total Staff Accounts */}
                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Staff
                            </span>
                            <div className="font-bold text-2xl text-foreground font-mono">
                                {totalCount}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Users className="size-5" />
                        </div>
                    </div>

                    {/* Administrators */}
                    <div className="rounded-2xl border border-purple-200/80 bg-purple-50/40 dark:bg-purple-950/20 dark:border-purple-800/60 p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                                Administrators
                            </span>
                            <div className="font-bold text-2xl text-purple-700 dark:text-purple-300 font-mono">
                                {adminCount}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                            <ShieldCheck className="size-5" />
                        </div>
                    </div>

                    {/* Cashiers */}
                    <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-800/60 p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                                Cashiers
                            </span>
                            <div className="font-bold text-2xl text-indigo-700 dark:text-indigo-300 font-mono">
                                {cashierCount}
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            <CreditCard className="size-5" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Search Input */}
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search staff by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 text-xs h-9"
                                />
                            </div>

                            {/* Role Filter */}
                            <div className="w-full sm:w-44">
                                <Select
                                    value={roleFilter}
                                    onValueChange={(val) => {
                                        setRoleFilter(val);
                                        applyFilters(search, val);
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Administrators</SelectItem>
                                        <SelectItem value="cashier">Cashiers</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                size="sm"
                                variant="secondary"
                                disabled={isSearching}
                                className="h-9 text-xs"
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </Button>
                        </div>

                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-9 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 self-end sm:self-auto"
                            >
                                <RotateCcw className="size-3.5" />
                                <span>Reset Filters</span>
                            </Button>
                        )}
                    </form>
                </div>

                {/* Users Listing Table */}
                <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="py-3.5 pl-6 font-semibold text-xs text-foreground uppercase tracking-wider">
                                    Staff Member
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                                    Assigned Role
                                </TableHead>
                                <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                                    Joined Date
                                </TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-xs text-foreground uppercase tracking-wider">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(() => {
                                const displayUsers = users.data
                                    ? users.data.filter(
                                        (u) =>
                                            !u.is_super_admin &&
                                            u.email !== 'admin@gmail.com' &&
                                            u.name !== 'Super Admin'
                                    )
                                    : [];

                                return displayUsers.length > 0 ? (
                                    displayUsers.map((user) => {
                                        const isSelf = user.id === currentUserId;
                                        const isAdmin = user.role === 'admin';
                                        const isCashier = user.role === 'cashier';

                                        return (
                                            <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                                {/* Staff Member Info */}
                                                <TableCell className="py-3.5 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-9 border border-border/60">
                                                            <AvatarFallback
                                                                className={`font-semibold text-xs ${isAdmin
                                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                                                    }`}
                                                            >
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-sm text-foreground">
                                                                    {user.name}
                                                                </span>
                                                                {isSelf && (
                                                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                <Mail className="size-3 text-muted-foreground/70" />
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Assigned Role */}
                                                <TableCell>
                                                    {isAdmin ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                            <ShieldCheck className="size-3.5" />
                                                            Administrator
                                                        </span>
                                                    ) : isCashier ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                            <CreditCard className="size-3.5" />
                                                            Cashier
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                            <UserIcon className="size-3.5" />
                                                            {user.role}
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* Joined Date */}
                                                <TableCell>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {user.created_at || '—'}
                                                    </span>
                                                </TableCell>

                                                {/* Action Buttons */}
                                                <TableCell className="text-right pr-6">
                                                    <UserRowActions user={user} isSelf={isSelf} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-44 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="size-8 text-muted-foreground/50" />
                                                <p className="text-sm font-semibold text-foreground">
                                                    No staff members found
                                                </p>
                                                <p className="text-xs text-muted-foreground max-w-sm">
                                                    {hasActiveFilters
                                                        ? 'Try adjusting your search criteria or role filters.'
                                                        : 'Get started by creating your first cashier or administrator account.'}
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleResetFilters}
                                                        className="mt-2 text-xs"
                                                    >
                                                        Clear Filters
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })()}
                        </TableBody>
                    </Table>

                    {/* Pagination Bar */}
                    {users.total > 0 && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-border/80 bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{users.from ?? 0}</span> to{' '}
                                <span className="font-semibold text-foreground">{users.to ?? 0}</span> of{' '}
                                <span className="font-semibold text-foreground">{users.total}</span> staff accounts
                            </span>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        users.prev_page_url &&
                                        router.get(users.prev_page_url, {}, { preserveState: true, preserveScroll: true })
                                    }
                                    disabled={!users.prev_page_url}
                                    className="h-8 text-xs flex items-center gap-1"
                                >
                                    <ChevronLeft className="size-3.5" />
                                    <span>Previous</span>
                                </Button>

                                <span className="text-xs font-semibold px-2">
                                    Page {users.current_page} of {users.last_page}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        users.next_page_url &&
                                        router.get(users.next_page_url, {}, { preserveState: true, preserveScroll: true })
                                    }
                                    disabled={!users.next_page_url}
                                    className="h-8 text-xs flex items-center gap-1"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================
                ADD NEW USER MODAL DIALOG
               ========================================= */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-2xl">
                    <DialogHeader className="p-6 pb-4 border-b border-border/80 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UserPlus className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-foreground">
                                    Add New Staff Member
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Register a new administrator or cashier account for pharmacy operations.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <UserIcon className="size-3.5 text-muted-foreground" />
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g. Alexander Vance"
                                value={addData.name}
                                onChange={(e) => setAddData('name', e.target.value)}
                                className="h-9 text-xs"
                                required
                            />
                            <InputError message={addErrors.name} />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Mail className="size-3.5 text-muted-foreground" />
                                Email Address <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="email"
                                placeholder="e.g. alexander@helixpharma.com"
                                value={addData.email}
                                onChange={(e) => setAddData('email', e.target.value)}
                                className="h-9 text-xs"
                                required
                            />
                            <InputError message={addErrors.email} />
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-muted-foreground" />
                                System Role <span className="text-rose-500">*</span>
                            </label>

                            <div className="grid grid-cols-2 gap-3 pt-0.5">
                                {/* Cashier Option */}
                                <button
                                    type="button"
                                    onClick={() => setAddData('role', 'cashier')}
                                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${addData.role === 'cashier'
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                                        : 'border-border/80 hover:border-border hover:bg-muted/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className={`size-4 ${addData.role === 'cashier' ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`} />
                                            <span className="text-xs font-bold text-foreground">Cashier</span>
                                        </div>
                                        {addData.role === 'cashier' && (
                                            <CheckCircle2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                                        POS sales terminal, scan barcodes & issue receipts.
                                    </span>
                                </button>

                                {/* Admin Option */}
                                <button
                                    type="button"
                                    onClick={() => setAddData('role', 'admin')}
                                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${addData.role === 'admin'
                                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                                        : 'border-border/80 hover:border-border hover:bg-muted/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className={`size-4 ${addData.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`} />
                                            <span className="text-xs font-bold text-foreground">Administrator</span>
                                        </div>
                                        {addData.role === 'admin' && (
                                            <CheckCircle2 className="size-3.5 text-purple-600 dark:text-purple-400" />
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                                        Full management of medicines, sales, content & users.
                                    </span>
                                </button>
                            </div>
                            <InputError message={addErrors.role} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Lock className="size-3.5 text-muted-foreground" />
                                    Password <span className="text-rose-500">*</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground">Min. 8 characters</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter a secure password"
                                    value={addData.password}
                                    onChange={(e) => setAddData('password', e.target.value)}
                                    className="h-9 text-xs pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            <InputError message={addErrors.password} />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <KeyRound className="size-3.5 text-muted-foreground" />
                                Confirm Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Re-enter password to confirm"
                                    value={addData.password_confirmation}
                                    onChange={(e) => setAddData('password_confirmation', e.target.value)}
                                    className="h-9 text-xs pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            <InputError message={addErrors.password_confirmation} />
                        </div>

                        {/* Modal Action Buttons */}
                        <DialogFooter className="pt-4 border-t border-border/80 flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseAddModal}
                                disabled={addProcessing}
                                className="h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={addProcessing}
                                className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5"
                            >
                                {addProcessing ? (
                                    <>
                                        <span className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="size-4" />
                                        <span>Create User Account</span>
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

/**
 * Row Actions: Edit and Delete dialogs for each user
 */
function UserRowActions({ user, isSelf }: { user: StaffUser; isSelf: boolean }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [editName, setEditName] = useState(user.name);
    const [editEmail, setEditEmail] = useState(user.email);
    const [editRole, setEditRole] = useState(user.role);
    const [editPassword, setEditPassword] = useState('');
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const openEdit = () => {
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRole(user.role);
        setEditPassword('');
        setShowEditPassword(false);
        setErrors({});
        setEditOpen(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(
            route('users.update', user.id),
            {
                name: editName,
                email: editEmail,
                role: editRole,
                password: editPassword || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onSuccess: () => {
                    setProcessing(false);
                    setEditOpen(false);
                    toast.success('Staff details updated successfully!');
                },
            }
        );
    };

    const submitDelete = () => {
        setProcessing(true);
        router.delete(route('users.destroy', user.id), {
            preserveScroll: true,
            preserveState: true,
            onError: () => setProcessing(false),
            onSuccess: () => {
                setProcessing(false);
                setDeleteOpen(false);
                toast.success('Staff account deleted successfully.');
            },
        });
    };

    return (
        <div className="flex items-center justify-end gap-1.5">
            {/* Edit Button (Icon Only) */}
            <Button
                size="sm"
                variant="outline"
                onClick={openEdit}
                title="Edit Staff Member"
                className="h-8 w-8 p-0 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
            >
                <Edit className="size-3.5" />
            </Button>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-2xl">
                    <DialogHeader className="p-6 pb-4 border-b border-border/80 bg-muted/20">
                        <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Edit className="size-4 text-primary" />
                            Edit Staff Member
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Update profile details, assign permissions, or reset credentials.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Name</label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-9 text-xs"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Email Address</label>
                            <Input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="h-9 text-xs"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Role</label>
                            <Select value={editRole} onValueChange={setEditRole}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                <span>Password</span>
                                <span className="text-[10px] text-muted-foreground">Leave blank to keep current</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showEditPassword ? 'text' : 'password'}
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder="Enter new password (optional)"
                                    className="h-9 text-xs pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showEditPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/80 flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                                disabled={processing}
                                className="h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Button & Dialog */}
            {!isSelf && (
                <>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteOpen(true)}
                        title="Delete Staff Account"
                        className="h-8 w-8 p-0 flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>

                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogContent className="max-w-md p-6 sm:rounded-2xl">
                            <DialogHeader>
                                <div className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 mb-2">
                                    <AlertCircle className="size-5" />
                                </div>
                                <DialogTitle className="text-lg font-bold text-foreground">
                                    Delete Staff Account
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-1">
                                    Are you sure you want to delete <strong className="text-foreground">{user.name}</strong> ({user.email})? This action will revoke their access to the pharmacy system.
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteOpen(false)}
                                    disabled={processing}
                                    className="h-9 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={submitDelete}
                                    disabled={processing}
                                    className="h-9 text-xs bg-rose-600 hover:bg-rose-700 font-semibold"
                                >
                                    {processing ? 'Deleting...' : 'Delete Account'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}
