import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'POS',
        href: '/pos',
    },
];

type Medicine = {
    id: number;
    name: string;
    category: string;
    description: string;
    selling_price: number;
    qty: number;
    medicine_barcode: string;
};

type CartItem = Medicine & {
    quantity: number;
    available_qty: number; // <- new
};

export default function POS() {
    const [barcode, setBarcode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [notFound, setNotFound] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleScan = (err: any, result: any) => {
        if (result?.text) {
            setBarcode(result.text);
            addToCartByBarcode(result.text);
        }
    };
    const increaseQuantity = (id: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id === id) {
                    if (item.quantity + 1 > item.available_qty) {
                        toast.error(`Only ${item.available_qty} in stock`);
                        return item;
                    }
                    return { ...item, quantity: item.quantity + 1 };
                }
                return item;
            })
        );
    };
    const decreaseQuantity = (id: number) => {
        setCart(prev =>
            prev
                .map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: item.quantity - 1 };
                    }
                    return item;
                })
                .filter(item => item.quantity > 0)
        );
    };
    const handleManualQuantityChange = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setCart(prev =>
            prev.map(item => {
                if (item.id === id) {
                    if (newQuantity > item.available_qty) {
                        toast.error(`Only ${item.available_qty} available`);
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    // Remove item completely from cart
    const removeItem = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const addToCartByBarcode = async (barcode: string) => {
        try {
            const response = await fetch(`/pos/lookup/${barcode}`);
            if (!response.ok) throw new Error();

            const medicine: Medicine & { available_qty: number } = await response.json();

            setCart((prev) => {
                const existing = prev.find(item => item.id === medicine.id);

                if (existing) {
                    const newQty = existing.quantity + 1;

                    if (newQty > medicine.available_qty) {
                        toast.error(`Only ${medicine.available_qty} available`);
                        return prev; // Don't update if over stock
                    }

                    toast.success(`+1 ${medicine.name}`);
                    return prev.map(item =>
                        item.id === medicine.id ? { ...item, quantity: newQty } : item
                    );
                }

                if (medicine.available_qty < 1) {
                    toast.error(`${medicine.name} is out of stock`);
                    return prev;
                }

                toast.success(`${medicine.name} added to cart`);
                return [...prev, { ...medicine, quantity: 1 }];
            });
        } catch (error) {
            setNotFound(true);
            toast.error('Barcode not found');
        }
    };

    // 🧾 Print invoice
    // const handlePrint = (sale) => {
    //     const win = window.open('', '_blank');
    //     if (!win) return;

    //     win.document.write(`
    //         <html><head><title>Invoice</title></head><body>
    //         <h3>Invoice No: ${sale.invoice_no}</h3>
    //         <table border="1" style="width: 100%; text-align: left;">
    //             <thead>
    //                 <tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
    //             </thead>
    //             <tbody>
    //                 ${sale.items.map(item => `
    //                     <tr>
    //                         <td>${item.medicine.name}</td>
    //                         <td>${item.quantity}</td>
    //                         <td>${item.unit_price}</td>
    //                         <td>${item.subtotal}</td>
    //                     </tr>
    //                 `).join('')}
    //             </tbody>
    //         </table>
    //         <h4>Total: ${sale.total}</h4>
    //         <script>window.print(); window.close();</script>
    //         </body></html>
    //     `);
    //     win.document.close();
    // };
    const handlePrint = (sale) => {
        const win = window.open('', '_blank');
        if (!win) return;

        win.document.write(`
        <html><head><title>Invoice</title></head><body>
        <h3>Invoice No: ${sale.invoice_no}</h3>
        <table border="1" style="width: 100%; text-align: left;">
            <thead>
                <tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
                ${sale.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit_price.toFixed(2)}</td>
                        <td>${item.subtotal.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <h4>Total: ${sale.total.toFixed(2)}</h4>
        <script>window.print(); window.close();</script>
        </body></html>
    `);
        win.document.close();
    };

    // ✅ Complete Sale Function
    const completeSale = () => {
        if (cart.length === 0) {
            toast.warning('Cart is empty');
            return;
        }

        setProcessing(true);

        router.post(
            '/pos/complete-sale',
            { cart },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const saleId = page.props?.sale_id || page.props?.flash?.sale_id;
                    toast.success('Sale completed!');
                    setCart([]);
                    setBarcode("");

                    // 👇 Open invoice in new tab
                    if (saleId) {
                        window.open(`/pos/invoice/${saleId}`, '_blank');
                    }
                },
                onError: (errors) => {
                    toast.error('Sale failed!');
                    console.error(errors);
                },
                onFinish: () => setProcessing(false),
            }
        );
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="POS" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
                <div className="mb-4">
                    <Button onClick={() => setScanning(!scanning)} className="mb-2">
                        {scanning ? 'Stop Scanner' : 'Start Scanner'}
                    </Button>
                    {scanning && (
                        <div className="mb-4 border p-2">
                            <BarcodeScannerComponent
                                width={500}
                                height={100}
                                onUpdate={handleScan}
                            />
                        </div>
                    )}
                    <Input
                        placeholder="Scan barcode manually"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') addToCartByBarcode(barcode);
                        }}
                    />
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption>Cart Items</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" onClick={() => decreaseQuantity(item.id)}>-</Button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={item.available_qty}
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newQty = parseInt(e.target.value);
                                                        if (newQty > item.available_qty) {
                                                            toast.error(`Only ${item.available_qty} available`);
                                                            return;
                                                        }
                                                        setCart((prev) =>
                                                            prev.map((it) =>
                                                                it.id === item.id ? { ...it, quantity: newQty } : it
                                                            )
                                                        );
                                                    }}
                                                    className="w-16 border rounded px-1 py-0.5 text-center"
                                                />
                                                <Button size="sm" onClick={() => increaseQuantity(item.id)}>+</Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.selling_price}</TableCell>
                                        <TableCell>{(item.quantity * item.selling_price).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))

                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Cart is empty.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <div className="text-right mt-4">
                        <Button
                            disabled={cart.length === 0 || processing}
                            className="bg-green-600"
                            onClick={completeSale}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Complete Sale
                        </Button>
                    </div>
                </div>

                <Dialog open={notFound} onOpenChange={setNotFound}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Not Found</DialogTitle>
                            <DialogDescription>
                                The scanned barcode was not found in the system.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
