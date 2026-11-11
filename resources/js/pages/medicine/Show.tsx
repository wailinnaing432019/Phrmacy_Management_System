import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, DollarSign, Package, Pencil, Pill, Tag } from 'lucide-react';
import EditPurchasedItemModal from './PurchasedItemUpdate';

export default function Show({ medicine, purchasedItems = [] }: { medicine: any; purchasedItems: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    function isExpired(expDate: string) {
        if (!expDate) return false;
        const today = new Date();
        const exp = new Date(expDate + 'T23:59:59');
        return exp < today;
    }

    function openModal(batch: any) {
        setEditData({ ...batch });
        setIsOpen(true);
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Medicines', href: '/medicines' },
                { title: medicine.name, href: route('medicines.show', medicine.uuid || medicine.id) },
            ]}
        >
            <Head title={`${medicine.name} — Details`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
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
                                    {medicine.name}
                                </h1>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                    {medicine.category}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Detailed pharmaceutical profile, inventory movements, and batch records.
                            </p>
                        </div>
                    </div>

                    <Link href={route('medicines.edit', medicine.uuid || medicine.id)}>
                        <Button className="rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary/90">
                            <Pencil className="mr-1.5 size-3.5" />
                            Edit Specifications
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column: Medicine Profile */}
                    <Card className="rounded-2xl border-border/80 shadow-xs lg:col-span-1">
                        <CardHeader className="pb-3 border-b border-border/60 text-center">
                            <div className="mx-auto size-32 overflow-hidden rounded-2xl border border-border shadow-xs bg-muted/30">
                                {medicine.image ? (
                                    <img
                                        src={medicine.image.startsWith('http') ? medicine.image : `/storage/${medicine.image}`}
                                        alt={medicine.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/60">
                                        <Pill className="size-12" />
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-lg font-bold text-foreground mt-3">
                                {medicine.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Category: {medicine.category || 'General'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                                <span className="font-medium text-muted-foreground">Barcode</span>
                                <span className="font-mono font-bold text-foreground">{medicine.medicine_barcode || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                                <span className="font-medium text-muted-foreground">Retail Selling Price</span>
                                <span className="font-bold text-primary font-mono">
                                    {Number(medicine.selling_price).toLocaleString()} MMK
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                                <span className="font-medium text-muted-foreground">Sellable Stock</span>
                                <span className="font-bold text-foreground font-mono">{medicine.sellable_qty} units</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                                <span className="font-medium text-muted-foreground">Low Stock Threshold</span>
                                <span className="font-mono text-muted-foreground">{medicine.stock_limit} units</span>
                            </div>
                            {medicine.description && (
                                <div className="pt-2">
                                    <span className="font-medium text-muted-foreground block mb-1">Description</span>
                                    <p className="text-foreground leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-border/60">
                                        {medicine.description}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Purchased Batches Table */}
                    <Card className="rounded-2xl border-border/80 shadow-xs lg:col-span-2">
                        <CardHeader className="pb-3 border-b border-border/60">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold text-foreground">
                                        Purchased Inventory Batches
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Batch acquisition dates, expiry checks, and current availability.
                                    </CardDescription>
                                </div>
                                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                    {purchasedItems.length} batches
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Purchased</TableHead>
                                            <TableHead>Sold</TableHead>
                                            <TableHead>Available</TableHead>
                                            <TableHead>Cost Price</TableHead>
                                            <TableHead>EXP Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right pr-4">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-border/60">
                                        {purchasedItems.length > 0 ? (
                                            purchasedItems.map((batch) => {
                                                const expired = batch.qty !== 0 && isExpired(batch.exp_date);

                                                return (
                                                    <TableRow key={batch.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="font-mono text-xs">{batch.qty}</TableCell>
                                                        <TableCell className="font-mono text-xs text-muted-foreground">{batch.sold_qty}</TableCell>
                                                        <TableCell className="font-mono text-xs font-bold text-primary">
                                                            {batch.available_qty}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs">
                                                            {Number(batch.unit_price).toLocaleString()} MMK
                                                        </TableCell>
                                                        <TableCell className="text-xs">{batch.exp_date || '—'}</TableCell>
                                                        <TableCell>
                                                            {batch.available_qty > 0 ? (
                                                                expired ? (
                                                                    <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400">
                                                                        Expired
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                                        Valid
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                                    Out of Stock
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right pr-4">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => openModal(batch)}
                                                                className="h-7 text-xs rounded-lg"
                                                            >
                                                                Edit Batch
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                                                    No purchased batches recorded for this medicine.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <EditPurchasedItemModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                editData={editData}
                setEditData={setEditData}
            />
        </AppLayout>
    );
}
