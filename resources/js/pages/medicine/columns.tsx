import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Eye, Plus, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { router } from "@inertiajs/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AddStockForm from "./AddStockForm"
export type Medicine = {
    id: number
    name: string
    category: string
    description: string
    selling_price: string
    qty: number
    stock_limit: number
    medicine_barcode: string
    created_at: string
    updated_at: string
}

export const columns = () => {
    const [openDialogId, setOpenDialogId] = useState<number | null>(null);
    return [

        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <span className="truncate max-w-[150px]">{row.getValue("name")}</span>
            ),
        },
        {
            accessorKey: "category",
            header: "Category",
        },
        {
            accessorKey: "medicine_barcode",
            header: "Barcode",
            cell: ({ row }) => {
                const medicine = row.original
                const code = medicine.medicine_barcode

                return (
                    <div className="text-center">
                        {code ? (
                            <img
                                src={`/barcode/${code}`}
                                alt={`Barcode for ${medicine.name}`}
                                className="h-10 mx-auto"
                                style={{ maxWidth: "120px" }}
                            />
                        ) : (
                            <span className="text-gray-400 italic">No barcode</span>
                        )}

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="block max-w-[120px] truncate">{code}</span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">{code}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )
            },
        },
        {
            accessorKey: "qty",
            header: "Qty",
            cell: ({ row }) => {
                const qty = row.getValue("qty") as number
                const stockLimit = row.original.stock_limit
                return (
                    <div>
                        {qty}
                        {stockLimit > qty && (
                            <sup className="bg-red-700 rounded-xl px-1 ml-2 text-white text-xs">
                                Low Stock
                            </sup>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "selling_price",
            header: "Unit Price",
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <span className="truncate max-w-[200px]">{row.getValue("description")}</span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Created At",
        },
        {
            accessorKey: "updated_at",
            header: "Updated At",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const medicine = row.original
                const [openDialog, setOpenDialog] = useState(false)

                return (
                    <>
                        <Dialog
                            open={openDialogId === medicine.id}
                            onOpenChange={(open) =>
                                setOpenDialogId(open ? medicine.id : null)
                            }
                        >
                            <DialogTrigger asChild>
                                <Button size="sm">Add Stock</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Add Stock for {medicine.name}
                                    </DialogTitle>
                                </DialogHeader>

                                <AddStockForm
                                    medicineId={medicine.id}
                                    onClose={() => setOpenDialogId(null)}
                                />
                            </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {/* Add Stock (Dialog inside dropdown) */}
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()} // keep dropdown open while clicking
                                >
                                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start"
                                                onClick={() => setOpenDialog(true)}
                                            >
                                                <Plus className="-ml-3 h-4 w-4" /> Add Stock
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Add Quantity for{" "}
                                                    <span className="text-green-700">{medicine.name}</span>
                                                </DialogTitle>
                                            </DialogHeader>
                                            <AddStockForm
                                                medicineId={medicine.id}
                                                onClose={() => setOpenDialog(false)}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </DropdownMenuItem>

                                {/* Edit */}
                                <DropdownMenuItem
                                    onClick={() => router.visit(route("medicines.edit", medicine.id))}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>

                                {/* View */}
                                <DropdownMenuItem
                                    onClick={() => router.visit(route("medicines.show", medicine.id))}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </DropdownMenuItem>

                                {/* Delete */}
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()} // keep dropdown open
                                >
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-red-600"
                                            >
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you absolutely sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete{" "}
                                                    <span className="font-bold">{medicine.name}</span>.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        router.delete(route("medicines.destroy", medicine.id))
                                                    }
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )
            },
        },
    ]
}