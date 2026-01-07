import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { BreadcrumbItem } from '@/types';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Medicine Suppliers',
        href: '/medicine-suppliers',
    },
];

type Supplier = {
    id: number;
    name: string;
};

type Medicine = {
    id: number;
    name: string;
};

type Link = {
    id: number;
    medicine_id: number;
    supplier_id: number;
    supplier_price: string;
    is_preferred: boolean;
};
type ExistingLink = {
    id: number;
    medicine_id: number;
    supplier_id: number;
};

export default function Edit({
    link,
    medicines,
    suppliers,
    existingLinks, // 👈 all existing medicine-supplier pairs
}: {
    link: Link;
    medicines: Medicine[];
    suppliers: Supplier[];
    existingLinks: ExistingLink[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        medicine_id: String(link.medicine_id),
        supplier_id: String(link.supplier_id),
        supplier_price: link.supplier_price,
        is_preferred: link.is_preferred ? '1' : '0',
    });

    // Filter suppliers to prevent duplicate for the selected medicine_id,
    // but allow the currently selected one (link.supplier_id)
    const availableSuppliers = suppliers.filter((supplier) => {
        return (
            // Either it's the currently selected supplier (to show it)
            supplier.id === Number(link.supplier_id) ||
            // OR this supplier has NOT been used with this medicine_id
            !existingLinks.some(
                (l) =>
                    l.medicine_id === Number(data.medicine_id) &&
                    l.supplier_id === supplier.id &&
                    l.id !== link.id // ignore the current link being edited
            )
        );
    });
    const submit: FormEventHandler = (e) => {
        // alert(link.id);
        e.preventDefault();
        put(route('medicine-supply.update', link.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Medicine Supplier Link" />
            <div className="flex h-full w-3/4 mx-auto flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <form className="flex flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="medicine_id">Medicine</Label>
                            <Select
                                value={data.medicine_id}
                                onValueChange={(value) => setData('medicine_id', value)}
                            >
                                <SelectTrigger id="medicine_id" className="w-full">
                                    <SelectValue placeholder="Select medicine" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {medicines.map((medicine) => (
                                            <SelectItem key={medicine.id} value={String(medicine.id)}>
                                                {medicine.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.medicine_id} />
                        </div>

                        <div>
                            <Label htmlFor="supplier_id">Supplier</Label>
                            <Select
                                value={data.supplier_id}
                                onValueChange={(value) => setData('supplier_id', value)}
                            >
                                <SelectTrigger id="supplier_id" className="w-full">
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {availableSuppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.supplier_id} />
                        </div>

                        <div>
                            <Label htmlFor="supplier_price">Supplier Price</Label>
                            <Input
                                id="supplier_price"
                                type="number"
                                step="0.01"
                                value={data.supplier_price}
                                onChange={(e) => setData('supplier_price', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={errors.supplier_price} />
                        </div>

                        <div>
                            <Label htmlFor="is_preferred">Preferred</Label>
                            <Select
                                value={data.is_preferred}
                                onValueChange={(value) => setData('is_preferred', value)}
                            >
                                <SelectTrigger id="is_preferred" className="w-full">
                                    <SelectValue placeholder="Is preferred?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="1">Yes</SelectItem>
                                        <SelectItem value="0">No</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.is_preferred} />
                        </div>
                    </div>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Updating...' : 'Update Link'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
