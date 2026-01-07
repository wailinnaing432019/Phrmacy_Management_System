import CustomerLayout from '@/layouts/customer-layout';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Toaster } from 'sonner';
import Navbar from '@/layouts/app/customers/Navbar';

export default function MyOrderItems({ order, items }) {
    return (
        <CustomerLayout>

            <div className=''>
                <Toaster position="top-right" richColors />

                <div className=" max-w-4xl py-8 mx-auto  pt-24">
                    <div className="max-w-3xl mx-auto p-8   rounded shadow">
                        <h1 className="text-2xl font-bold mb-6 text-purple-700">Order #{order.order_no}</h1>
                        <div className="mb-4 text-gray-700">
                            <span className="font-semibold">Status:</span> {order.status}
                            <span className="ml-6 font-semibold">Total:</span> {order.total} MMK
                            <span className="ml-6 font-semibold">Date:</span> {order.created_at}
                        </div>
                        {items.length === 0 ? (
                            <p className="text-gray-600">No items in this order.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-purple-100 text-purple-800">
                                        <TableHead className="px-4 py-2">Medicine</TableHead>
                                        <TableHead className="px-4 py-2">Qty</TableHead>
                                        <TableHead className="px-4 py-2">Unit Price</TableHead>
                                        <TableHead className="px-4 py-2">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map(item => (
                                        <TableRow key={item.id} className="border-b hover:bg-purple-50">
                                            <TableCell className="px-4 py-2">{item.medicine_name}</TableCell>
                                            <TableCell className="px-4 py-2">{item.qty}</TableCell>
                                            <TableCell className="px-4 py-2">{item.price} MMK</TableCell>
                                            <TableCell className="px-4 py-2">{item.qty * item.price} MMK</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}