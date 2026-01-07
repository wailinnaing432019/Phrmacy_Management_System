// resources/js/Pages/medicine-suppliers/Create.tsx
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
    SelectLabel,
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

type MedicineSupplyForm = {
    medicine_id: number | string;
    supplier_id: number | string;
    supplier_price: string;
    is_preferred: string;
};

export default function Create({ medicines, suppliers }: { medicines: Medicine[], suppliers: Supplier[] }) {
    const { data, setData, post, processing, errors, reset } = useForm<MedicineSupplyForm>({
        medicine_id: '',
        supplier_id: '',
        supplier_price: '',
        is_preferred: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('medicine-supply.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Link Medicine to Supplier" />
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
                                        {suppliers.map((supplier) => (
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
                        {processing ? 'Saving...' : 'Link Medicine & Supplier'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
