// resources/js/Pages/Users/Index.tsx
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
import AppLayout from "@/layouts/app-layout"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"
import { RiLockPasswordLine } from "react-icons/ri"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import InputError from "@/components/input-error"
import { roleTextMap } from "@/utils/userRole"

interface User {
    id: number
    name: string
    email: string
    role: string
}

export default function Index() {
    const { users, filters } = usePage().props as any
    const { flash, errors } = usePage().props

    const [sorting, setSorting] = useState<SortingState>([])
    const [deletingUser, setDeletingUser] = useState<User | null>(null)


    // Columns definition
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: (row) => row.getValue(),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: (row) => {
                const roleValue = row.getValue<string>();
                const roleInfo = roleTextMap[roleValue] || { label: roleValue, color: "text-black" };
                return <span className={roleInfo.color}>{roleInfo.label}</span>;
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const user = row.original
                const [editingUser, setEditingUser] = useState<User | null>(null)

                const [editName, setEditName] = useState("")
                const [editEmail, setEditEmail] = useState("")
                const [editRole, setEditRole] = useState("user")
                const [editPassword, setPassword] = useState("")
                const [showPassword, setShowPassword] = useState(false)
                return (
                    <div className="flex gap-2">
                        {/* Edit Dialog */}
                        <Dialog
                            open={editingUser?.id === user.id}
                            onOpenChange={(open) => {
                                if (!open) setEditingUser(null)
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingUser(user)
                                        setEditName(user.name)
                                        setEditEmail(user.email)
                                        setEditRole(user.role)
                                    }}
                                >
                                    Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Name
                                        </label>
                                        <Input
                                            value={editName}
                                            onChange={(e) =>
                                                setEditName(e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={errors.name}
                                            className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Email
                                        </label>
                                        <Input
                                            value={editEmail}
                                            onChange={(e) =>
                                                setEditEmail(e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="mt-2" />
                                    </div>
                                    {/* <div>
                                        <div className="relative">
                                            <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={editPassword}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-destructive' : 'border-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-secondary transition-all duration-300`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-2 text-sm text-destructive">{errors.password}</p>}
                                    </div> */}

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Role
                                        </label>
                                        <Select
                                            value={editRole}
                                            onValueChange={setEditRole}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">Customers</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="cashier">Cashier</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.role}
                                            className="mt-2" />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button
                                            onClick={() => setEditingUser(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                router.put(
                                                    route("users.update", user.id),
                                                    {
                                                        name: editName,
                                                        email: editEmail,
                                                        role: editRole,
                                                        password: editPassword,
                                                    },
                                                    { preserveState: true }
                                                )
                                                setEditingUser(null)
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Delete Dialog */}
                        {!row.original.role || row.original.role == 'user' && (
                            <Dialog
                                open={deletingUser?.id === user.id}
                                onOpenChange={(open) => {
                                    if (!open) setDeletingUser(null)
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setDeletingUser(user)}
                                    >
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>Delete User</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete{" "}
                                            <strong>{user.name}</strong>?
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button onClick={() => setDeletingUser(null)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                router.delete(
                                                    route("users.destroy", user.id),
                                                    { preserveState: true }
                                                )
                                                setDeletingUser(null)
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: users.data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value }
        router.get(route("users.index"), newFilters, { preserveState: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Users" }]}>
            <Head title="Users" />

            {/* Filters */}
            <div className="flex items-center justify-between mb-4 gap-2 p-3 m-3">
                <Input
                    placeholder="Search by name or email..."
                    defaultValue={filters.search}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleFilterChange(
                                "search",
                                (e.target as HTMLInputElement).value
                            )
                        }
                    }}
                    className="max-w-xs"
                />
                <Select
                    value={filters.role || "all"}
                    onValueChange={(value) =>
                        handleFilterChange("role", value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                        <SelectItem value="user">Customer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border p-3 m-3">
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
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 p-3 m-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        router.get(users.prev_page_url!, filters, {
                            preserveState: true,
                            replace: true,
                        })
                    }
                    disabled={!users.prev_page_url}
                >
                    Previous
                </Button>

                <span>
                    Page {users.current_page} of {users.last_page}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        router.get(users.next_page_url!, filters, {
                            preserveState: true,
                            replace: true,
                        })
                    }
                    disabled={!users.next_page_url}
                >
                    Next
                </Button>
            </div>
        </AppLayout>
    )
}
