import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    AlertTriangle,
    Eye,
    Pencil,
    Pill,
    Plus,
    Printer,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AddStockForm from './AddStockForm';
import PrintBarcode from './PrintBarcode';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Medicines', href: '/medicines' },
];

type Medicine = {
    id: number;
    uuid?: string;
    name: string;
    category: string;
    description: string;
    selling_price: string;
    qty: number;
    sellable_qty: number;
    stock_limit: number;
    medicine_barcode: string;
    created_at: string;
    updated_at: string;
    image: string;
    status: string;
    links: any[];
};

export default function Index({
    medicines,
    filters,
    categories,
}: {
    medicines: {
        data: Medicine[];
        links: any[];
        current_page: number;
        per_page: number;
        total?: number;
    };
    filters: any;
    categories: string[];
}) {
    const [activeDialogId, setActiveDialogId] = useState<number | null>(null);
    const [barcodeDialogId, setBarcodeDialogId] = useState<number | null>(null);

    const destroyHandle = (id: number) => router.delete(route('medicines.destroy', id));

    const { props } = usePage<{ flash: any }>();

    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');

    const handleFilter = () => {
        router.get(
            route('medicines.index'),
            { search, category: category === 'all' ? '' : category },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setCategory('');
        router.get(route('medicines.index'), {}, { preserveState: true, replace: true });
    };

    useEffect(() => {
        if (props.flash?.print_barcode) {
            const { id, qty } = props.flash.print_barcode;
            const url = route('medicines.printBarcodes', id) + `?qty=${qty}`;
            window.open(url, '_blank');
        }
    }, [props.flash]);

    const renderStatusBadge = (status: string) => {
        const isAvailable = status === 'available' || status === 'Available';
        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                }`}
            >
                <span className={`size-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {isAvailable ? 'Available' : 'Unavailable'}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medicine Catalog" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Medicine Inventory
                            </h1>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                {medicines.total !== undefined ? `${medicines.total} items` : 'Catalog'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage pharmaceutical stock, thresholds, pricing, and barcodes.
                        </p>
                    </div>

                    <Link href={route('medicines.create')}>
                        <Button className="h-10 gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary/90 transition-all">
                            <Plus className="size-4" />
                            <span>Add New Medicine</span>
                        </Button>
                    </Link>
                </div>

                {/* Filters Bar Card */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                            <Input
                                placeholder="Search medicine name, barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="pl-9 h-10 rounded-xl"
                            />
                        </div>

                        {/* Category Select */}
                        <Select value={category || 'all'} onValueChange={setCategory}>
                            <SelectTrigger className="w-full sm:w-52 h-10 rounded-xl">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-md">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat, idx) => (
                                    <SelectItem key={idx} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleFilter}
                                className="h-10 rounded-xl px-4 font-medium"
                            >
                                Apply
                            </Button>
                            {(search || (category && category !== 'all')) && (
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="h-10 rounded-xl px-3 gap-1.5 text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="size-3.5" />
                                    <span>Reset</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Medicines Table Card */}
                <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-12 text-center">#</TableHead>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-center">Barcode</TableHead>
                                    <TableHead>Stock Level</TableHead>
                                    <TableHead>Selling Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border/60">
                                {medicines.data.length > 0 ? (
                                    medicines.data.map((medicine, index) => {
                                        const isLowStock = medicine.stock_limit >= medicine.sellable_qty;

                                        return (
                                            <TableRow key={medicine.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="text-center text-xs font-semibold text-muted-foreground">
                                                    {(medicines.current_page - 1) * medicines.per_page + index + 1}
                                                </TableCell>

                                                {/* Medicine Info */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted/40">
                                                            {medicine.image ? (
                                                                <img
                                                                    src={`/storage/${medicine.image}`}
                                                                    alt={medicine.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-muted-foreground/60">
                                                                    <Pill className="size-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-0.5 max-w-[200px]">
                                                            <Link
                                                                href={route('medicines.show', medicine.uuid || medicine.id)}
                                                                className="font-bold text-sm text-foreground hover:text-primary truncate block transition-colors"
                                                            >
                                                                {medicine.name}
                                                            </Link>
                                                            {medicine.description && (
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {medicine.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Category */}
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                                                        {medicine.category || 'General'}
                                                    </span>
                                                </TableCell>

                                                {/* Barcode */}
                                                <TableCell className="text-center">
                                                    {medicine.medicine_barcode ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <img
                                                                src={`/barcode/${medicine.medicine_barcode}`}
                                                                alt={medicine.medicine_barcode}
                                                                className="h-8 max-w-[110px]"
                                                            />
                                                            <span className="text-[10px] font-mono font-medium text-muted-foreground">
                                                                {medicine.medicine_barcode}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">None</span>
                                                    )}
                                                </TableCell>

                                                {/* Stock Level */}
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-baseline gap-1 text-sm font-bold text-foreground">
                                                            <span>{medicine.sellable_qty}</span>
                                                            <span className="text-xs font-normal text-muted-foreground">
                                                                / {medicine.qty}
                                                            </span>
                                                        </div>
                                                        {isLowStock && (
                                                            <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.2 text-[10px] font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
                                                                <AlertTriangle className="size-2.5" />
                                                                Low Stock
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Unit Price */}
                                                <TableCell className="font-semibold text-sm text-foreground">
                                                    {Number(medicine.selling_price).toLocaleString()} MMK
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>{renderStatusBadge(medicine.status)}</TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right pr-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Add Stock Dialog */}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Dialog
                                                                        open={activeDialogId === medicine.id}
                                                                        onOpenChange={(open) => setActiveDialogId(open ? medicine.id : null)}
                                                                    >
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="size-8 rounded-lg text-primary hover:bg-primary/10"
                                                                            >
                                                                                <Plus className="size-4" />
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="rounded-2xl">
                                                                            <DialogHeader>
                                                                                <DialogTitle>
                                                                                    Add Stock for <span className="text-primary">{medicine.name}</span>
                                                                                </DialogTitle>
                                                                            </DialogHeader>
                                                                            <AddStockForm
                                                                                medicineId={medicine.id}
                                                                                onClose={() => setActiveDialogId(null)}
                                                                            />
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Restock Quantity</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {/* Edit Button */}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={route('medicines.edit', medicine.uuid || medicine.id)}>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="size-8 rounded-lg text-foreground hover:bg-accent"
                                                                        >
                                                                            <Pencil className="size-3.5" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Edit Medicine</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {/* View Details */}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={route('medicines.show', medicine.uuid || medicine.id)}>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="size-8 rounded-lg text-foreground hover:bg-accent"
                                                                        >
                                                                            <Eye className="size-3.5" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>View Details</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {/* Print Barcode */}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Dialog
                                                                        open={barcodeDialogId === medicine.id}
                                                                        onOpenChange={(open) => setBarcodeDialogId(open ? medicine.id : null)}
                                                                    >
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="size-8 rounded-lg text-foreground hover:bg-accent"
                                                                            >
                                                                                <Printer className="size-3.5" />
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="rounded-2xl">
                                                                            <DialogHeader>
                                                                                <DialogTitle>
                                                                                    Print Barcode for <span className="text-primary">{medicine.name}</span>
                                                                                </DialogTitle>
                                                                            </DialogHeader>
                                                                            <PrintBarcode
                                                                                medicineId={medicine.id}
                                                                                onClose={() => setBarcodeDialogId(null)}
                                                                            />
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Print Barcodes</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {/* Delete AlertDialog */}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
                                                                            >
                                                                                <Trash2 className="size-3.5" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent className="rounded-2xl">
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle className="text-destructive">
                                                                                    Delete Medicine?
                                                                                </AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Are you sure you want to soft-delete{' '}
                                                                                    <strong className="text-foreground">{medicine.name}</strong>?
                                                                                    Historical transactions and sale invoices will remain intact.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => destroyHandle(medicine.id)}
                                                                                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                >
                                                                                    Confirm Delete
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Delete Medicine</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Pill className="size-8 text-muted-foreground/40 mb-2" />
                                                <span className="font-semibold text-sm text-foreground">No medicines found</span>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Try adjusting your search query or category filter.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {medicines.links && medicines.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3 sm:px-6">
                            <span className="text-xs text-muted-foreground">
                                Page {medicines.current_page}
                            </span>
                            <div className="flex items-center gap-1.5">
                                {medicines.links.map((link: any, idx: number) => (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url &&
                                            router.visit(link.url, {
                                                preserveScroll: true,
                                                data: {
                                                    search,
                                                    category: category === 'all' ? '' : category,
                                                },
                                            })
                                        }
                                        className="h-8 rounded-lg text-xs"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
