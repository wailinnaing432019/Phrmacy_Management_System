// resources/js/Pages/Orders/Index.tsx
import { Head, router, usePage } from "@inertiajs/react"
import { useState } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { BookAIcon, BookCheck, CarrotIcon, ChevronLeft, ChevronRight, Link } from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import { DialogDescription } from "@radix-ui/react-dialog"
import { title } from "process"

interface Medicine {
    id: number
    name: string
}

interface OrderItem {
    id: number
    medicine: Medicine
    qty: number
    price: number
}

interface Order {
    id: number
    order_no: string
    name: string
    email: string
    phone: string
    total: number
    status: string
    address: string
    payment_method: string
    transaction_id: string
    created_at: string
    items: OrderItem[]
}

export default function Index() {
    const { orders, filters } = usePage().props as any
    const { flash, errors } = usePage().props;

    {
        flash.success && (
            <div className="text-green-600 mb-2">{flash.success}</div>
        )
    }
    {
        errors.error && (
            <div className="text-red-600 mb-2">{errors.error}</div>
        )
    }
    const [sorting, setSorting] = useState<SortingState>([])

    // Define columns
    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "order_no",
            header: "Order No",
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "name",
            header: "Customer",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-xs text-gray-500">{row.original.email}</p>
                    <p className="text-xs text-gray-500">{row.original.phone}</p>
                </div>
            ),
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => {
                const total = Number(row.original.total) // ensure numeric
                return `Ks${total.toFixed(2)}`
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${row.original.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : row.original.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {row.original.status}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const order = row.original

                const handleStatusChange = (newStatus: string) => {
                    router.put(route("orders.update", order.id), { status: newStatus }, {
                        preserveState: true,
                    })
                }

                return (
                    <>
                        <div className="flex gap-2 mb-2">
                            <Button
                                asChild
                                size="sm"
                                variant="default"
                            >
                                <a href={route("invoice.preview", order.id)} target="_blank">
                                    Preview Invoice
                                </a>
                            </Button>

                            <Button
                                asChild
                                size="sm"
                                variant="default"
                            >
                                <a href={route("invoice.download", order.id)}>
                                    Download Invoice
                                </a>
                            </Button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        View Items
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="max-w-2xl p-6 rounded-lg shadow-lg">
                                    <DialogHeader className="flex items-center gap-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <span className="text-blue-500">
                                                {/* Placeholder for an icon, e.g., a shopping cart */}
                                                <BookCheck />
                                            </span>
                                            Order #{order.order_no}
                                        </h2>
                                        <div className="text-sm text-gray-500 flex flex-col gap-1">
                                            <p>Address: {order.address}</p>
                                            <p>Payment: {order.payment_method || '-'}</p>
                                            <p>Transaction: {order.transaction_id || '-'}</p>
                                        </div>
                                    </DialogHeader>

                                    <Table className="mt-6 border-collapse">
                                        <TableHeader className="bg-gray-100">
                                            <TableRow>
                                                <TableHead className="font-semibold text-gray-700 rounded-tl-lg">Medicine</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Qty</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Price</TableHead>
                                                <TableHead className="font-semibold text-gray-700 rounded-tr-lg">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.items?.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <TableCell className="border-b border-gray-200">{item.medicine?.name}</TableCell>
                                                    <TableCell className="border-b border-gray-200">{item.qty}</TableCell>
                                                    <TableCell className="border-b border-gray-200">Ks{Number(item.price).toFixed(2)}</TableCell>
                                                    <TableCell className="border-b border-gray-200">
                                                        Ks{(Number(item.qty) * Number(item.price)).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <div className="flex justify-between items-center mt-6">
                                        <p className="text-xl font-extrabold text-blue-600">
                                            Total: Ks{Number(order.total).toFixed(2)}
                                        </p>

                                        <Select value={order.status} onValueChange={handleStatusChange}>
                                            <SelectTrigger className="w-40 border-2 border-gray-300 rounded-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg shadow-md">
                                                <SelectItem value="pending" className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-orange-400"></span> Pending
                                                </SelectItem>
                                                <SelectItem value="completed" className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Completed
                                                </SelectItem>
                                                <SelectItem value="cancelled" className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-gray-500"></span> Cancelled
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </DialogContent>
                            </Dialog>

                        </div >
                    </>
                )

            },
        }
    ]

    // DataTable setup
    const table = useReactTable({
        data: orders.data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    // Filter handler
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value }
        router.get(route("orders.index"), newFilters, { preserveState: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Orders', href: '/orders' }]}>
            <Head title="Orders" />

            {/* Filters */}
            <div className="flex items-center justify-between mb-4 gap-2 p-4">
                <Input
                    placeholder="Search by customer..."
                    defaultValue={filters.search}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleFilterChange("search", (e.target as HTMLInputElement).value)
                        }
                    }}
                    className="max-w-xs"
                />
                <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                        handleFilterChange("status", value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    className="w-40"
                />
            </div>

            {/* Table */}
            <div className="rounded-md border p-4 shadow-2xl m-3">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-2 p-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        router.get(orders.prev_page_url!, filters, {
                            preserveState: true,
                            replace: true,
                        })
                    }
                    disabled={!orders.prev_page_url}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>

                <span>
                    Page {orders.current_page} of {orders.last_page}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        router.get(orders.next_page_url!, filters, {
                            preserveState: true,
                            replace: true,
                        })
                    }
                    disabled={!orders.next_page_url}
                >
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </AppLayout>
    )
}
