import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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
} from "@/components/ui/alert-dialog"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Medicine-Supplier',
        href: '/medicine-supply',
    },
];

type MedicineSupplier = {
    id: number;
    medicine: {
        id: number;
        name: string;
    };
    supplier: {
        id: number;
        name: string;
    };
    supplier_price: string;
    is_preferred: boolean;
    created_at: string;
    updated_at: string;
};

export default function Index() {
    const { medicineSuppliers }: { medicineSuppliers: MedicineSupplier[] } = usePage().props;

    const destroyHandle = (id: number) => {
        router.delete(route('medicine-supply.destroy', id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medicine Suppliers" />
            <div className='text-right'>
                <TextLink href={route('medicine-supply.create')}>
                    <Button className='bg-green-500 hover:bg-green-800 rounded m-2 hover:text-white'>
                        Add New Link
                    </Button>
                </TextLink>
            </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <Table>
                    <TableCaption>A list of medicine-supplier links.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Supplier Price</TableHead>
                            <TableHead>Preferred</TableHead>
                            {/* <TableHead>Created At</TableHead>
                            <TableHead>Updated At</TableHead> */}
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {medicineSuppliers.length > 0 ? (
                            medicineSuppliers.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.medicine.name}</TableCell>
                                    <TableCell>{item.supplier.name}</TableCell>
                                    <TableCell>{item.supplier_price}</TableCell>
                                    <TableCell>{item.is_preferred ? 'Yes' : 'No'}</TableCell>
                                    {/* <TableCell>{item.created_at}</TableCell>
                                    <TableCell>{item.updated_at}</TableCell> */}
                                    <TableCell className="text-right space-x-1">
                                        <TextLink href={route('medicine-supply.edit', item.id)}>
                                            <Button className='bg-blue-700 hover:bg-blue-500 mt-4'>Edit</Button>
                                        </TextLink>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" className='bg-red-700 hover:bg-red-500 text-white mt-4'>Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader className='text-red-700'>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently remove the link between <span className="text-red-400">{item.medicine.name}</span> and <span className="text-red-400">{item.supplier.name}</span>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className='text-red-700 hover:bg-gray-900' onClick={() => destroyHandle(item.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                    No links found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
