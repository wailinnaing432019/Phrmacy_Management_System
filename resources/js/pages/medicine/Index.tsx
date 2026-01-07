import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import TextLink from '@/components/text-link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EyeIcon, Pencil, Plus, Trash, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddStockForm from './AddStockForm';
import PrintBarcode from './PrintBarcode';

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { StatusColorMap, StatusTextMap } from '@/utils/medicineStatus';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Medicines', href: '/medicines' },
];

type Medicine = {
    id: number;
    name: string;
    category: string;
    description: string;
    selling_price: string;
    qty: number;
    stock_limit: number;
    medicine_barcode: string;
    created_at: string;
    updated_at: string;
    image: string;
    status: string;
    links: any[];
};

export default function Index({ medicines, filters, categories }: { medicines: { data: Medicine[]; links: any[]; current_page: number; per_page: number; }, filters: any, categories: string[] }) {
    const [activeDialogId, setActiveDialogId] = useState<number | null>(null);
    const [barcodeDialogId, setBarcodeDialogId] = useState<number | null>(null);
    const [barcodeQty, setBarcodeQty] = useState<{ [key: number]: number }>({});

    const destoryHandle = (id: number) => router.delete(route('medicines.destroy', id));

    const { props } = usePage<{ flash: any }>();



    const [search, setSearch] = useState(filters.search || "");
    const [category, setCategory] = useState(filters.category || "");
    // 🔎 Handle filters
    const handleFilter = () => {
        router.get(
            route("medicines.index"),
            { search, category: category === "all" ? "" : category },
            { preserveState: true, replace: true }
        );
    };
    useEffect(() => {

        if (props.flash?.print_barcode) {
            const { id, qty } = props.flash.print_barcode;
            const url = route("medicines.printBarcodes", id) + `?qty=${qty}`;
            window.open(url, "_blank");
        }
    }, [props.flash]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medicines" />
            <div className="flex justify-between items-center mb-4 p-3">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search medicines..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                        className="w-64"
                    />
                    <Select value={category || "all"} onValueChange={setCategory}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat, idx) => (
                                <SelectItem key={idx} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleFilter}>Apply</Button>
                </div>

                <TextLink href={route('medicines.create')}>
                    <Button className="rounded">Add New Medicine</Button>
                </TextLink>
            </div>

            {/* <div className="text-right">
                <TextLink href={route('medicines.create')}>
                    <Button className="bg-green-500 hover:bg-green-800 rounded m-2 hover:text-gray-100">
                        Add New Medicine
                    </Button>
                </TextLink>
            </div> */}

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto p-3">
                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption>A list of your medicines.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NO</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Barcode</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                {/* <TableHead>Created At</TableHead>
                                <TableHead>Updated At</TableHead> */}
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medicines.data.length > 0 ? medicines.data.map((medicine, index) => (
                                <TableRow key={medicine.id}>
                                    <TableCell>{(medicines.current_page - 1) * medicines.per_page + index + 1}</TableCell>
                                    <TableCell className="max-w-[150px] truncate">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild><span>{medicine.name}</span></TooltipTrigger>
                                                <TooltipContent className="max-w-xs">{medicine.name}</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell><img src={`/storage/${medicine.image}`} alt={medicine.name} className="w-[100px] h-[70px] rounded-lg object-cover shadow" /></TableCell>
                                    <TableCell className="max-w-[120px] truncate">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild><span>{medicine.category}</span></TooltipTrigger>
                                                <TooltipContent className="max-w-xs">{medicine.category}</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>

                                    <TableCell className='text-center'>
                                        {medicine.medicine_barcode ? (
                                            <>
                                                <img
                                                    src={`/barcode/${medicine.medicine_barcode}`}
                                                    alt={`Barcode for ${medicine.name}`}
                                                    className="h-10 mx-auto"
                                                    style={{ maxWidth: '120px' }}
                                                />
                                                <span className="">{medicine.medicine_barcode}</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic">No barcode</span>
                                        )}

                                    </TableCell>

                                    <TableCell>
                                        {medicine.qty}
                                        {medicine.stock_limit > medicine.qty && (
                                            <sup className='bg-red-700 rounded-xl p-0.5 m-2'>Low Stock</sup>
                                        )}
                                    </TableCell>

                                    <TableCell>{medicine.selling_price}</TableCell>
                                    <TableCell className="max-w-[180px] truncate">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>{medicine.description}</span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    {medicine.description}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className={StatusColorMap[medicine.status]}>
                                        {StatusTextMap[medicine.status] || "Unknown"}
                                    </TableCell>
                                    {/* <TableCell>{medicine.created_at}</TableCell>
                                    <TableCell>{medicine.updated_at}</TableCell> */}

                                    <TableCell className="text-right space-x-1">
                                        {/* Add Stock */}

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <Dialog
                                                            open={activeDialogId === medicine.id}
                                                            onOpenChange={(open) => setActiveDialogId(open ? medicine.id : null)}
                                                        >
                                                            <DialogTrigger asChild>

                                                                <Button className="mt-4 bg-blue-800 hover:bg-blue-400">
                                                                    <Plus />
                                                                </Button>

                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        Add Quantity for <span className="text-green-700">{medicine.name}</span>
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                <AddStockForm medicineId={medicine.id} onClose={() => setActiveDialogId(null)} />
                                                            </DialogContent>
                                                        </Dialog>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">Add Stock</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        {/* Edit */}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <TextLink href={route('medicines.edit', medicine.id)}>
                                                            <Button className="mt-4 bg-green-500 hover:bg-green-400">
                                                                <Pencil />
                                                            </Button>
                                                        </TextLink>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">Edit</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        {/* View */}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <TextLink href={route('medicines.show', medicine.id)}>
                                                            <Button>
                                                                <EyeIcon />
                                                            </Button>
                                                        </TextLink>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">View</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        {/* Delete */}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" className="mt-4 bg-red-800 hover:bg-red-400">
                                                                    <Trash />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader className="text-red-700">
                                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete your medicine{' '}
                                                                        <span className="text-xl text-red-400 italic">{medicine.name}</span> from
                                                                        our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="text-red-700 hover:bg-gray-900"
                                                                        onClick={() => destoryHandle(medicine.id)}
                                                                    >
                                                                        Continue
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">Delete</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        {/* Print Barcode via backend */}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <Dialog
                                                            open={barcodeDialogId === medicine.id}
                                                            onOpenChange={(open) => setBarcodeDialogId(open ? medicine.id : null)}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button className="mt-4 bg-purple-800 hover:bg-purple-400">
                                                                    <Printer />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        Print Barcode for <span className="text-green-700">{medicine.name}</span>
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                <PrintBarcode medicineId={medicine.id} onClose={() => setActiveDialogId(null)} />
                                                            </DialogContent>
                                                        </Dialog>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">Print Barcode</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center text-muted-foreground">No Medicine found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex gap-2 mx-auto">
                    {medicines.links.map((link: any, idx: number) => (
                        <Button
                            key={idx}
                            size="sm"
                            variant={link.active ? "default" : "outline"}
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                router.visit(link.url, {
                                    preserveScroll: true,
                                    data: {
                                        search,
                                        category: category === "all" ? "" : category,
                                    },
                                })
                            }
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
