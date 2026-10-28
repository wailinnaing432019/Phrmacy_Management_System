"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Eye, MoreHorizontal, Printer } from "lucide-react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Sale = {
    id: string
    invoice_no: string
    sale_by: string
    total: number
}


export const columns: ColumnDef<Sale>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "invoice_no",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={function (): void {
                        // return column.toggleSorting(column.getIsSorted() === "asc");

                        const page = route().params?.page ?? '';

                        const col = 'invoice_no';
                        const search = route().params?.search ?? '';

                        // filter month & year
                        const month = route().params?.month ?? '';
                        const year = route().params?.year ?? '';
                        const start_date = route().params?.start_date ?? '';
                        const end_date = route().params?.end_date ?? '';


                        let dir = route().params.dir ?? '';
                        if (dir == "asc") {
                            dir = "desc";
                        } else if (dir == "desc") {
                            dir = "";
                        } else {
                            dir = "asc";
                        }
                        // const url=route('users.index').current()+'?page='+page+'&col='+col+'&dir='+dir;
                        const url = route('cashier.sale', {
                            page: page,
                            col: col,
                            dir: dir,
                            search: search,
                        });
                        router.visit(url);
                    }}
                >
                    Invoice No
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "user.name", // 👈 use nested path
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={function (): void {
                    const page = route().params?.page ?? '';
                    const search = route().params?.search ?? '';
                    const col = 'sale_by'; // still use sale_by for backend sorting
                    let dir = route().params.dir ?? '';
                    if (dir === "asc") {
                        dir = "desc";
                    } else if (dir === "desc") {
                        dir = "";
                    } else {
                        dir = "asc";
                    }

                    const url = route('sales.index', {
                        page,
                        col,
                        dir,
                        search,
                    });
                    router.visit(url);
                }}
            >
                Sale By
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )

    },

    {
        accessorKey: "total",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "MMK",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },

    },
    {
        id: "actions",
        cell: ({ row }) => {
            const sale = row.original

            const handlePrint = () => {
                // Call your print logic here
                window.open(`/cashier/sale/print/${sale.id}`, "_blank");
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        {/* <DropdownMenuItem onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </DropdownMenuItem> */}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <a href={route('cashier.sale.show', sale.id)} target="_blank" className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" /> See Detail & Print
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
