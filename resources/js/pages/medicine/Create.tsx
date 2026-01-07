// resources/js/Pages/medicines/Create.tsx
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AuthLayout from '@/layouts/auth-layout';
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
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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

type MedicineForm = {
    name: string;
    category_id: string;
    description: string;
    selling_price: number;
    stock_limit: string;
    qty: string; // 👈 NEW
    medicine_barcode: string; // already adding this too
    purchase_price: number;
    image: File | null;
    status: string;
    mfd_date: string; // Manufacturing date
    exp_date: string; // Expiry date
};

export default function Create({ categories }: { categories: Category[] }) {
    const { data, setData, post, processing, errors, reset } = useForm<MedicineForm>({
        name: '',
        category_id: '',
        description: '',
        selling_price: 0,
        qty: '',
        stock_limit: '',// 👈 NEW
        medicine_barcode: '',
        purchase_price: 0,
        image: null,
        status: 'available',
        mfd_date: '',
        exp_date: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('medicines.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Medicine" />
            <div className="flex h-full w-3/4 mx-auto flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <form className="flex flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Medicine name"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            {data.image && <img src={URL.createObjectURL(data.image)} alt="Preview Image" className="w-32 mt-2 object-cover" />}
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
                                placeholder=""
                            />


                            <InputError message={errors.image} />
                        </div>
                        <div>
                            <Label htmlFor="category_id">Category</Label>
                            <Select
                                value={data.category_id}
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
                        <div>
                            <Label htmlFor="qty">Quantity in Stock</Label>
                            <Input
                                id="qty"
                                type="number"
                                value={data.qty}
                                onChange={(e) => setData('qty', e.target.value)}
                                placeholder="e.g., 100"
                            />
                            <InputError message={errors.qty} />
                        </div>
                        <div>
                            <Label htmlFor="qty">Stock Limit Qty</Label>
                            <Input
                                id="qty"
                                type="number"
                                value={data.stock_limit}
                                onChange={(e) => setData('stock_limit', e.target.value)}
                                placeholder="e.g., 100"
                            />
                            <InputError message={errors.stock_limit} />
                        </div>


                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Write something..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div>
                            <Label htmlFor="selling_price">Selling Price</Label>
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
                        <div>
                            <Label htmlFor="purchase_price">Purchase Price</Label>
                            <Input
                                id="purchase_price"
                                type="number"
                                step="1"
                                value={data.purchase_price}
                                onChange={(e) => setData('purchase_price', parseInt(e.target.value))}
                                placeholder="0.00"
                            />
                            <InputError message={errors.purchase_price} />
                        </div>
                        <div>
                            <Label htmlFor="mfd_date">MFD Date</Label>
                            <Input
                                id="mfd_date"
                                type="date"
                                step="1"
                                value={data.mfd_date}
                                onChange={(e) => setData('mfd_date', e.target.value)}

                            />
                            <InputError message={errors.mfd_date} />
                        </div>
                        <div>
                            <Label htmlFor="exp_date">Expired Date</Label>
                            <Input
                                id="exp_date"
                                type="date"
                                step="1"
                                value={data.exp_date}
                                onChange={(e) => setData('exp_date', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={errors.exp_date} />
                        </div>



                        <div className="flex items-center space-x-2">
                            <Switch
                                id="status"
                                checked={data.status === 'available'}
                                onCheckedChange={(checked) => setData('status', checked ? 'available' : 'not_available')}
                            />
                            <Label htmlFor="status">Available</Label>
                        </div>

                    </div>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving...' : 'Create Medicine'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
