import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Image as ImageIcon,
    LoaderCircle,
    Package,
    Pill,
    Save,
    UploadCloud,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Medicines', href: '/medicines' },
    { title: 'Create Medicine', href: '/medicines/create' },
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
    qty: string;
    medicine_barcode: string;
    purchase_price: number;
    image: File | null;
    status: string;
    mfd_date: string;
    exp_date: string;
};

export default function Create({ categories = [] }: { categories: Category[] }) {
    const { data, setData, post, processing, errors } = useForm<MedicineForm>({
        name: '',
        category_id: '',
        description: '',
        selling_price: 0,
        qty: '',
        stock_limit: '',
        medicine_barcode: '',
        purchase_price: 0,
        image: null,
        status: 'available',
        mfd_date: '',
        exp_date: '',
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (file: File | null) => {
        setData('image', file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('medicines.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Medicine" />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('medicines.index')}>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-9 rounded-xl text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Add New Medicine
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Register pharmaceutical inventory, pricing, batch dates, and thresholds.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('medicines.index')}>
                            <Button variant="outline" className="rounded-xl px-4 text-xs font-medium">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            onClick={submit}
                            disabled={processing}
                            className="rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary/90"
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 size-4" />
                                    Save Medicine
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6 md:grid-cols-3">
                    {/* Left Column (2 Cols) */}
                    <div className="space-y-6 md:col-span-2">
                        {/* Basic Info Card */}
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <Pill className="size-4 text-primary" />
                                    <CardTitle className="text-base font-bold">General Information</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Basic pharmaceutical identifiers and classification.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-semibold">
                                        Medicine Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Paracetamol 500mg, Amoxicillin Syrup"
                                        className="rounded-xl"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="category_id" className="text-xs font-semibold">
                                        Category <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) => setData('category_id', value)}
                                    >
                                        <SelectTrigger id="category_id" className="w-full rounded-xl">
                                            <SelectValue placeholder="Select medicine category" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-md">
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

                                <div className="space-y-1.5">
                                    <Label htmlFor="description" className="text-xs font-semibold">
                                        Clinical Description / Usage Instructions
                                    </Label>
                                    <Textarea
                                        id="description"
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Dosage, contraindications, packaging type..."
                                        className="rounded-xl resize-none"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing & Stock Card */}
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <CardTitle className="text-base font-bold">Pricing & Stock</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Unit costs, customer retail prices, and inventory safety margins.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2 pt-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="selling_price" className="text-xs font-semibold">
                                        Retail Selling Price (MMK) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="selling_price"
                                        type="number"
                                        step="0.01"
                                        value={data.selling_price || ''}
                                        onChange={(e) => setData('selling_price', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        className="rounded-xl font-mono"
                                        required
                                    />
                                    <InputError message={errors.selling_price} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="purchase_price" className="text-xs font-semibold">
                                        Unit Purchase Cost (MMK)
                                    </Label>
                                    <Input
                                        id="purchase_price"
                                        type="number"
                                        step="1"
                                        value={data.purchase_price || ''}
                                        onChange={(e) => setData('purchase_price', parseInt(e.target.value, 10) || 0)}
                                        placeholder="0.00"
                                        className="rounded-xl font-mono"
                                    />
                                    <InputError message={errors.purchase_price} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="qty" className="text-xs font-semibold">
                                        Opening Stock Quantity <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        value={data.qty}
                                        onChange={(e) => setData('qty', e.target.value)}
                                        placeholder="e.g. 100"
                                        className="rounded-xl font-mono"
                                        required
                                    />
                                    <InputError message={errors.qty} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="stock_limit" className="text-xs font-semibold">
                                        Low-Stock Alert Threshold <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="stock_limit"
                                        type="number"
                                        value={data.stock_limit}
                                        onChange={(e) => setData('stock_limit', e.target.value)}
                                        placeholder="e.g. 15"
                                        className="rounded-xl font-mono"
                                        required
                                    />
                                    <InputError message={errors.stock_limit} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1 Col) */}
                    <div className="space-y-6">
                        {/* Image Upload Card */}
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="size-4 text-sky-600 dark:text-sky-400" />
                                    <CardTitle className="text-base font-bold">Product Media</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Packaging or pill image thumbnail.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 p-4 bg-muted/20 text-center">
                                    {previewUrl ? (
                                        <div className="space-y-3">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="size-36 rounded-xl object-cover mx-auto border border-border shadow-xs"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleImageChange(null)}
                                                className="rounded-lg text-xs"
                                            >
                                                Remove Image
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 py-4">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                                                <UploadCloud className="size-6" />
                                            </div>
                                            <p className="text-xs font-medium text-foreground">
                                                Select image file
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                PNG, JPG, or WebP up to 2MB
                                            </p>
                                        </div>
                                    )}

                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                                        disabled={processing}
                                        className="mt-3 text-xs rounded-xl"
                                    />
                                </div>
                                <InputError message={errors.image} />
                            </CardContent>
                        </Card>

                        {/* Batch Dates & Status Card */}
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4 text-amber-600 dark:text-amber-400" />
                                    <CardTitle className="text-base font-bold">Dates & Status</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Manufacturing, expiry, and sale availability.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="mfd_date" className="text-xs font-semibold">
                                        Manufacturing Date (MFD)
                                    </Label>
                                    <Input
                                        id="mfd_date"
                                        type="date"
                                        value={data.mfd_date}
                                        onChange={(e) => setData('mfd_date', e.target.value)}
                                        className="rounded-xl"
                                    />
                                    <InputError message={errors.mfd_date} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="exp_date" className="text-xs font-semibold">
                                        Expiry Date (EXP)
                                    </Label>
                                    <Input
                                        id="exp_date"
                                        type="date"
                                        value={data.exp_date}
                                        onChange={(e) => setData('exp_date', e.target.value)}
                                        className="rounded-xl"
                                    />
                                    <InputError message={errors.exp_date} />
                                </div>

                                <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/20">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="status" className="text-xs font-semibold cursor-pointer">
                                            Available for Sale
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Allow cashiers and customers to purchase this item.
                                        </p>
                                    </div>
                                    <Switch
                                        id="status"
                                        checked={data.status === 'available'}
                                        onCheckedChange={(checked) =>
                                            setData('status', checked ? 'available' : 'not_available')
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
