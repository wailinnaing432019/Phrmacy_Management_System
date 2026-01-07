import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function EditPurchasedItemModal({ isOpen, setIsOpen, editData, setEditData }) {

    function handleChange(e) {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        router.put(`/purchased-items/${editData.id}`, editData, {
            onSuccess: () => setIsOpen(false),
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Purchased Item</DialogTitle>
                </DialogHeader>

                {editData && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchased Qty</label>
                            <input
                                type="number"
                                name="qty"
                                value={editData.qty || ""}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                                placeholder="Purchased Qty"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sold Qty</label>
                            <input
                                type="number"
                                disabled
                                name="sold_qty"
                                value={editData.sold_qty || 0}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                                placeholder="Sold Qty"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Available Qty</label>
                            <input
                                type="number"
                                name="available_qty"
                                disabled
                                value={editData.available_qty || ""}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                                placeholder="Available Qty"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchased Price</label>
                            <input
                                type="number"
                                name="unit_price"
                                value={editData.unit_price || ""}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                                placeholder="Purchased Price"
                                step="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">MFD Date</label>
                            <input
                                type="date"
                                name="mfd_date"
                                value={editData.mfd_date || ""}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">EXP Date</label>
                            <input
                                type="date"
                                name="exp_date"
                                value={editData.exp_date || ""}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                            />
                        </div>

                        <DialogFooter className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
                            >
                                Update
                            </button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
