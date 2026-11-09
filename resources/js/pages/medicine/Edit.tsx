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
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    DollarSign,
    Image as ImageIcon,
    LoaderCircle,
    Package,
    Pill,
    Save,
    UploadCloud,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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
    image: string | null;
    stock_limit: number;
    status: string;
};

export default function Edit({
    medicine,
    categories = [],
}: {
    medicine: Medicine;
    categories: Category[];
}) {
    const { data, setData, processing, errors } = useForm({
        name: medicine.name,
        category_id: String(medicine.category_id),
        description: medicine.description || '',
        selling_price: medicine.selling_price,
        qty: medicine.qty,
        medicine_barcode: medicine.medicine_barcode || '',
        image: null as File | null,
        stock_limit: medicine.stock_limit,
        status: medicine.status,
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
        router.post(route('medicines.update', medicine.id), {
            _method: 'put',
            ...data,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Medicines', href: '/medicines' },
        { title: `Edit ${medicine.name}`, href: route('medicines.edit', medicine.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${medicine.name}`} />

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
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    Edit {medicine.name}
                                </h1>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                    ID #{medicine.id}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Update pharmaceutical specifications, retail pricing, and safety stock limits.
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
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 size-4" />
                                    Update Medicine
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6 md:grid-cols-3">
                    {/* Left Column (2 Cols) */}
                    <div className="space-y-6 md:col-span-2">
                        {/* General Information */}
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <Pill className="size-4 text-primary" />
                                    <CardTitle className="text-base font-bold">General Information</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Clinical identifiers and therapeutic classification.
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
                                        placeholder="e.g. Paracetamol 500mg"
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
                                        value={String(data.category_id)}
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
                                        Description & Instructions
                                    </Label>
                                    <Textarea
                                        id="description"
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Dosage, packaging details, administration..."
                                        className="rounded-xl resize-none"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing & Stock */}
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <CardTitle className="text-base font-bold">Pricing & Stock Thresholds</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Unit retail price and automated restock warnings.
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
                                        value={data.selling_price}
                                        onChange={(e) => setData('selling_price', parseFloat(e.target.value) || 0)}
                                        className="rounded-xl font-mono"
                                        required
                                    />
                                    <InputError message={errors.selling_price} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="stock_limit" className="text-xs font-semibold">
                                        Low Stock Threshold <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="stock_limit"
                                        type="number"
                                        value={data.stock_limit}
                                        onChange={(e) => setData('stock_limit', parseInt(e.target.value, 10) || 0)}
                                        className="rounded-xl font-mono"
                                        required
                                    />
                                    <InputError message={errors.stock_limit} />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="qty" className="text-xs font-semibold text-muted-foreground">
                                        Current Total Stock (Read-only)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="qty"
                                            disabled
                                            value={`${data.qty} units`}
                                            className="rounded-xl bg-muted/50 font-mono text-muted-foreground"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            (Use <em>Restock</em> in the medicine table to add batches)
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1 Col) */}
                    <div className="space-y-6">
                        {/* Media Upload */}
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="size-4 text-sky-600 dark:text-sky-400" />
                                    <CardTitle className="text-base font-bold">Product Media</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Packaging image or thumbnail.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 p-4 bg-muted/20 text-center">
                                    {previewUrl ? (
                                        <div className="space-y-3">
                                            <img
                                                src={previewUrl}
                                                alt="New Preview"
                                                className="size-36 rounded-xl object-cover mx-auto border border-border shadow-xs"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleImageChange(null)}
                                                className="rounded-lg text-xs"
                                            >
                                                Revert Change
                                            </Button>
                                        </div>
                                    ) : medicine.image ? (
                                        <div className="space-y-2">
                                            <img
                                                src={`/storage/${medicine.image}`}
                                                alt={medicine.name}
                                                className="size-36 rounded-xl object-cover mx-auto border border-border shadow-xs"
                                            />
                                            <p className="text-[11px] text-muted-foreground">Current Image</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 py-4">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                                                <UploadCloud className="size-6" />
                                            </div>
                                            <p className="text-xs font-medium text-foreground">
                                                No image uploaded
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

                        {/* Barcode & Availability */}
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <Package className="size-4 text-purple-600 dark:text-purple-400" />
                                    <CardTitle className="text-base font-bold">Barcode & Status</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    System barcode and customer visibility.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {/* Barcode display */}
                                {medicine.medicine_barcode ? (
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 p-3 bg-muted/20 text-center">
                                        <img
                                            src={`/barcode/${medicine.medicine_barcode}`}
                                            alt={medicine.medicine_barcode}
                                            className="h-10 max-w-full"
                                        />
                                        <span className="mt-1 text-xs font-mono font-bold text-foreground">
                                            {medicine.medicine_barcode}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-border/70 p-3 bg-muted/20 text-center text-xs text-muted-foreground italic">
                                        No barcode generated yet
                                    </div>
                                )}

                                {/* Available toggle */}
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
