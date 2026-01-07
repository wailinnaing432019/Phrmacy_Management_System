import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';

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
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

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

import { useState } from 'react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supplier',
        href: '/suppliers',
    },
];

type SupplierForm = {
    name: string;
    email: string;
    phone: string;
    address: string;
};

export default function Index({ suppliers }) {
    const [editingSupplier, setEditingSupplier] = useState<SupplierForm & { id: number } | null>(null);
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: updating,
        errors: editErrors,
        reset: resetEditForm
    } = useForm<SupplierForm>({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const openEditDialog = (supplier) => {
        setEditingSupplier(supplier);
        setEditData({
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address
        });
    };
    const updateSupplier: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingSupplier) return;
        put(route('suppliers.update', editingSupplier.id), {
            onSuccess: () => {
                resetEditForm();
                setEditingSupplier(null); // This will close the modal
            },
        });
    };


    const closeRef = useRef<HTMLButtonElement>(null);
    const { data, setData, post, processing, errors, reset } = useForm<Required<SupplierForm>>({
        name: '',
        email: '',
        address: '',
        phone: ''
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            onSuccess: () => {
                reset(); // Reset the form
                closeRef.current?.click(); // Close the dialog
            }
        });
    };

    const destoryHandle = (id: number, name: string) => {
        // if (confirm("Are you sure you want to delete " + id + "->" + name)) {
        router.delete(route('suppliers.destroy', id));
        // }

    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier" />
            <div className='text-right'>
                <Dialog>

                    <DialogTrigger asChild>
                        <Button className="m-2 p-2 bg-green-500 rounded hover:bg-green-900 hover:font-extrabold">Add Supplier</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={submit}>
                            <DialogHeader>
                                <DialogTitle>Add Supplier</DialogTitle>
                                <DialogDescription>
                                    Create your Supplier for your medicines
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        autoFocus
                                        tabIndex={2}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>
                            </div>
                            <DialogFooter className='m-3'>
                                <DialogClose asChild>
                                    <Button ref={closeRef} className="bg-red-500 hover:bg-red-800 p-2 rounded">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" className="p-1 bg-green-300 rounded" tabIndex={4} disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Create Supplier
                                </Button>

                            </DialogFooter>
                        </form>
                    </DialogContent>


                </Dialog>

            </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <Table>
                    <TableCaption>A list of your recent invoices.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.length > 0 ? (
                            suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell className="font-medium">{supplier.id}</TableCell>
                                    <TableCell>{supplier.name}</TableCell>
                                    <TableCell>{supplier.email}</TableCell>
                                    <TableCell>{supplier.phone}</TableCell>
                                    <TableCell>{supplier.address}</TableCell>
                                    <TableCell className="text-right space-x-1">

                                        <Button className='mt-4 bg-green-800 hover:bg-green-400' onClick={() => openEditDialog(supplier)}> Edit</Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" className='mt-4 bg-red-800 hover:bg-red-400'> Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader className='text-red-700'>
                                                    <AlertDialogTitle >Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your
                                                        supplier <span className='text-xl text-red-400 italic'>{supplier.name}</span> from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className='text-red-700 hover:bg-gray-900' onClick={() => destoryHandle(supplier.id, supplier.name)} >Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        {/* <Button onClick={() => destoryHandle(supplier.id, supplier.name)} className='mt-4 bg-red-800 hover:bg-red-4 00'> Delete</Button> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div>
                {editingSupplier && (
                    <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={updateSupplier}>
                                <DialogHeader>
                                    <DialogTitle>Edit Supplier</DialogTitle>
                                    <DialogDescription>
                                        Update your supplier details
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={editData.name}
                                            onChange={(e) => setEditData('name', e.target.value)}
                                        />
                                        <InputError message={editErrors.name} className="mt-2" />
                                    </div>

                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        autoFocus
                                        tabIndex={2}
                                        autoComplete="email"
                                        value={editData.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={editErrors.email} className="mt-2" />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="phone"
                                        value={editData.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={editErrors.phone} className="mt-2" />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="address"
                                        value={editData.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                    <InputError message={editErrors.address} className="mt-2" />
                                </div>
                                <DialogFooter className="mt-4">
                                    <DialogClose asChild>
                                        <Button type="button" className="bg-red-500" onClick={() => setEditingSupplier(null)}>Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" className="bg-green-600" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Supplier'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}

            </div>
        </AppLayout>
    );
}
