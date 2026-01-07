import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BreadcrumbItem } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import EditPurchasedItemModal from './PurchasedItemUpdate';


export default function Show({ medicine, purchasedItems }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    function isExpired(expDate) {
        if (!expDate) return false; // no date means no expiration

        const today = new Date();
        const exp = new Date(expDate + "T23:59:59"); // ensures full day check

        return exp < today; // expired if date is before today
    }

    function openModal(batch) {
        setEditData({ ...batch }); // Clone batch data to avoid direct mutation
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
        setEditData(null);
    }

    function handleChange(e) {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        router.put(`/purchased-items/${editData.id}`, editData, {
            onSuccess: () => closeModal()
        });
    }

    return (
        <AppLayout breadcrumbs={[
            { title: 'Medicines', href: '/medicines' },
            { title: medicine.name }
        ]}>
            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left Column: Medicine Details */}
                    <div className="flex-1 bg-white rounded-lg shadow p-6">
                        <div className="flex flex-col items-center">
                            <img
                                src={medicine.image}
                                alt={medicine.name}
                                className="w-40 h-40 object-cover rounded-lg mb-4 border border-purple-200"
                            />
                            <h2 className="text-3xl font-bold text-purple-800 mb-2">{medicine.name}</h2>
                            <span className="inline-block bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm mb-4">
                                {medicine.category}
                            </span>
                        </div>
                        <div className="space-y-2 mt-4">
                            <p><span className="font-semibold text-gray-700">Barcode:</span> {medicine.medicine_barcode}</p>
                            <p><span className="font-semibold text-gray-700">Selling Price:</span> <span className="text-purple-700 font-bold">{medicine.selling_price}</span></p>
                            <p><span className="font-semibold text-gray-700">Stock Limit:</span> {medicine.stock_limit}</p>
                            <p><span className="font-semibold text-gray-700">Description:</span> {medicine.description}</p>
                            <p><span className="font-semibold text-gray-700">Created At:</span> {medicine.created_at}</p>
                            <p><span className="font-semibold text-gray-700">Updated At:</span> {medicine.updated_at}</p>
                        </div>
                    </div>

                    {/* Right Column: Purchased Batches Table */}
                    <div className="flex-1 bg-white rounded-lg shadow p-6">
                        <h3 className="text-2xl font-semibold text-purple-800 mb-4">Purchased Batches</h3>
                        <div className="overflow-x-auto">
                            <Table className="w-full text-left border border-purple-200 rounded-lg">
                                <TableHeader>
                                    <TableRow className="bg-purple-100 text-purple-800">
                                        <TableHead className="px-4 py-2">Purchased Qty</TableHead>
                                        <TableHead className="px-4 py-2">Sold Qty</TableHead>
                                        <TableHead className="px-4 py-2">Available Qty</TableHead>
                                        <TableHead className="px-4 py-2">Purchased Price</TableHead>
                                        <TableHead className="px-4 py-2">MFD Date</TableHead>
                                        <TableHead className="px-4 py-2">EXP Date</TableHead>
                                        <TableHead className="px-4 py-2">Status</TableHead>
                                        <TableHead className="px-4 py-2">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchasedItems.map(batch => {
                                        const expired = batch.qty !== 0 && isExpired(batch.exp_date);
                                        return (
                                            <TableRow
                                                key={batch.id}
                                                className={`border-b border-purple-100 hover:bg-purple-50 ${expired ? 'bg-red-100' : ''}`}
                                            >

                                                <TableCell className="px-4 py-2">{batch.qty}</TableCell>
                                                <TableCell className="px-4 py-2">{batch.sold_qty}</TableCell>
                                                <TableCell className="px-4 py-2 font-bold text-green-700">{batch.available_qty}</TableCell>
                                                <TableCell className="px-4 py-2">MMK - {batch.unit_price}</TableCell>
                                                <TableCell className="px-4 py-2">{batch.mfd_date}</TableCell>
                                                <TableCell className="px-4 py-2">{batch.exp_date}</TableCell>
                                                <TableCell className="px-4 py-2">
                                                    {batch.available_qty > 0 ? (
                                                        expired ? (
                                                            <span className="px-2 py-1 rounded bg-red-500 text-white text-xs">Expired</span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded bg-green-500 text-white text-xs">Valid</span>
                                                        )
                                                    ) : (
                                                        <span className="px-2 py-1 rounded bg-gray-400 text-white text-xs">Out of Stock</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-2">
                                                    <button
                                                        onClick={() => openModal(batch)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/medicines" className="inline-block px-6 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition">
                        ← Back to Medicines
                    </Link>
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
