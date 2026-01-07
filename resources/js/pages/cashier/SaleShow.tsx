import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from "@/components/ui/card";

export default function SaleShow() {
    const { sale } = usePage().props as {
        sale: {
            id: number;
            invoice_no: string;
            total: number;
            created_at: string;
            sale_items: {
                id: number;
                quantity: number;
                unit_price: number;
                subtotal: number;
                medicine: {
                    name: string;
                };
            }[];
            user?: {
                name: string;
            };
        };
    };

    return (
        <AppLayout title="Sale Detail">
            <Head title={`Sale #${sale.id}`} />

            <h1 className="text-2xl font-bold mb-4">Sale Detail #{sale.id}</h1>

            <Card className="mb-4">
                <CardContent className="space-y-2">
                    <p><strong>Total Price:</strong> {sale.total} MMK</p>
                    <p><strong>Date:</strong> {sale.created_at}</p>
                    <p><strong>Sale By:</strong> {sale.user.name}</p>

                </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mb-2">Items</h2>
            <div className="border rounded p-4">
                {sale.sale_items.map(item => (
                    <div key={item.id} className="mb-2 border-b pb-2">
                        <p><strong>Medicine:</strong> {item.medicine.name}</p>
                        <p><strong>Quantity:</strong> {item.quantity}</p>
                        <p><strong>Unit Price:</strong> {item.unit_price} MMK</p>
                        <p><strong>Subtotal:</strong> {item.quantity * item.unit_price} MMK</p>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
