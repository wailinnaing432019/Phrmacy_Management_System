import CustomerLayout from '@/layouts/customer-layout';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Link } from '@inertiajs/react';
import Navbar from '@/layouts/app/customers/Navbar';
import { Toaster } from 'sonner';

export default function MyOrders({ orders }) {
    return (
        <CustomerLayout>
            <div className='pt-24 px-4   md:px-8 lg:px-16'>
                <Toaster position="top-right" richColors />

                <div className="max-w-3xl mx-auto p-8 m-4   rounded shadow">
                    <h1 className="text-2xl font-bold mb-6 text-purple-700">My Orders</h1>
                    {orders.length === 0 ? (
                        <p className="text-gray-600">You have no orders yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-purple-100 text-purple-800">
                                    <TableHead className="px-4 py-2">Order No</TableHead>
                                    <TableHead className="px-4 py-2">Total</TableHead>
                                    <TableHead className="px-4 py-2">Status</TableHead>
                                    <TableHead className="px-4 py-2">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id} className="border-b hover:bg-purple-50">
                                        <TableCell className="px-4 py-2 font-mono"><Link href={route('customers.myorderitems', order.id)}> {order.order_no} </Link></TableCell>
                                        <TableCell className="px-4 py-2">{order.total} MMK</TableCell>
                                        <TableCell className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : order.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-2">{order.created_at}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}