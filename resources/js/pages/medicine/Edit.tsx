// resources/js/Pages/medicines/Edit.tsx
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Medicines',
        href: '/medicines',
    },
];

type Category = {
    id: number;
    name: string;
};

type Medicine = {
    id: number;
    name: string;
    category_id: number;
    description: string;
    selling_price: number;
    qty: number;
    medicine_barcode: string;
    image: File | null;
    stock_limit: number;
    status: string;
};

export default function Edit({
    medicine,
    categories,
}: {
    medicine: Medicine;
    categories: Category[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: medicine.name,
        category_id: String(medicine.category_id),
        description: medicine.description,
        selling_price: medicine.selling_price,
        qty: medicine.qty,
        medicine_barcode: medicine.medicine_barcode || '',
        image: null,
        stock_limit: medicine.stock_limit,
        status: medicine.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('medicines.update', medicine.id), {
            _method: 'put',
            ...data,
        });
    };

    return (
        <AppLayout breadcrumbs={[
            {
                title: 'Medicines',
                href: '/medicines',
            },
            {
                title: "Edit " + medicine.name
            }
        ]}>
            <Head title="Edit Medicine" />
            <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-md">
                <div className="space-y-6">
                    {/* Product Details Header Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b pb-6">
                        <div className="flex-shrink-0">
                            <img src={`/storage/${medicine.image}`} alt={medicine.name} className="w-[150px] h-[150px] rounded-lg object-cover shadow" />
                        </div>
                        <div className="flex-1 flex flex-col gap-2 w-full text-center md:text-left">
                            <h1 className="text-2xl font-bold">{medicine.name}</h1>
                            <p className="text-gray-500">Category: {categories.find(c => c.id === medicine.category_id)?.name}</p>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mt-2">
                                <div className="text-left flex flex-col items-center">
                                    {medicine.medicine_barcode ? (
                                        <img
                                            src={`/barcode/${medicine.medicine_barcode}`}
                                            alt={`Barcode for ${medicine.name}`}
                                            className="h-10 max-w-full"
                                        />
                                    ) : (
                                        <span className="text-gray-400 italic">No barcode</span>
                                    )}
                                    <span className="text-sm text-gray-600">{medicine.medicine_barcode}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="status"
                                        checked={data.status == 'available'}
                                        onCheckedChange={(checked) => setData('status', checked ? 'available' : 'not_available')}
                                    />
                                    <Label htmlFor="status" className="text-gray-700">Available</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* --- */}
                    {/* Edit Form */}
                    <form onSubmit={submit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Medicine name"
                                />
                                <InputError message={errors.name} />
                            </div>
                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <Select
                                    value={String(data.category_id)}
                                    onValueChange={(value) => setData('category_id', value)}
                                >
                                    <SelectTrigger id="category_id" className="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category_id} />
                            </div>
                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label htmlFor="qty">Quantity in Stock</Label>
                                <Input
                                    id="qty"
                                    disabled
                                    type="number"
                                    value={data.qty}
                                    placeholder="e.g., 100"
                                />
                                <InputError message={errors.qty} />
                            </div>
                            {/* Stock Limit */}
                            <div className="space-y-2">
                                <Label htmlFor="stock_limit">Stock Limit</Label>
                                <Input
                                    id="stock_limit"
                                    type="number"
                                    value={data.stock_limit}
                                    onChange={(e) => setData('stock_limit', parseInt(e.target.value))}
                                    placeholder="e.g., 100"
                                />
                                <InputError message={errors.stock_limit} />
                            </div>
                            {/* Unit Price */}
                            <div className="space-y-2">
                                <Label htmlFor="selling_price">Unit Price</Label>
                                <Input
                                    id="selling_price"
                                    type="number"
                                    step="0.01"
                                    value={data.selling_price}
                                    onChange={(e) => setData('selling_price', parseFloat(e.target.value))}
                                    placeholder="0.00"
                                />
                                <InputError message={errors.selling_price} />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Write something..."
                            />
                            <InputError message={errors.description} />
                        </div>
                        {/* Image Upload */}
                        <div className="space-y-2">
                            {data.image && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Preview Image</label>
                                    <img src={URL.createObjectURL(data.image)} alt="Preview Image" className="w-32 h-32 object-cover rounded shadow" />
                                </div>
                            )}
                            <Label htmlFor="image">Image</Label>
                            <Input
                                id="image"
                                type="file"
                                tabIndex={3}
                                autoComplete="image"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setData('image', file);
                                    }
                                }}
                                disabled={processing}
                            />
                            <InputError message={errors.image} />
                        </div>
                        {/* Update Button */}
                        <Button type="submit" disabled={processing} className="w-full mt-4">
                            {processing ? 'Saving...' : 'Update Medicine'}
                        </Button>
                    </form>
                </div>
            </div >
        </AppLayout >
    );
}