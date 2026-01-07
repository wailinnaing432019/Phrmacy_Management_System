import { useEffect, useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { toast } from 'sonner';
import { LoaderCircle, ShoppingCart, Receipt, LayoutDashboard } from 'lucide-react';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { Home } from 'lucide-react';
import CashierMenu from '@/layouts/cashier-menu';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'POS', href: '/pos' }];

type Medicine = {
    id: number;
    name: string;
    category: string;
    description: string;
    selling_price: number;
    qty: number;
    medicine_barcode: string;
};

type CartItem = {
    id: number;
    name?: string;
    selling_price?: number;
    quantity: number;
    available_qty?: number;
    tempBarcode: string;
};



export default function POS() {
    const [cart, setCart] = useState<CartItem[]>([{ id: Date.now(), quantity: 0, tempBarcode: '' }]);
    const [scanning, setScanning] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const [receivedAmount, setReceivedAmount] = useState<number>(0.00);

    const totalAmount = cart.reduce((sum, item) => sum + (item.selling_price || 0) * (item.quantity || 0), 0);

    const refundAmount = receivedAmount > 0 ? receivedAmount - totalAmount : 0;

    const addToCartByBarcode = async (barcode: string) => {
        if (!barcode) return;
        try {
            const response = await fetch(`/cashier/pos/lookup/${barcode}`);
            if (!response.ok) throw new Error();
            const medicine: Medicine & { available_qty: number } = await response.json();

            setCart(prev => {
                let updated = [...prev];

                const existing = updated.find(item => item.id === medicine.id);
                if (existing) {
                    if ((existing.quantity || 0) + 1 > medicine.available_qty) {
                        toast.error(`Only ${medicine.available_qty} in stock`);
                        return updated;
                    }
                    toast.success(`+1 ${medicine.name}`);
                    return updated.map(item =>
                        item.id === medicine.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item
                    );
                }

                if (medicine.available_qty < 1) {
                    toast.error(`${medicine.name} is out of stock`);
                    return updated;
                }

                toast.success(`${medicine.name} added`);
                updated.push({ ...medicine, quantity: 1, tempBarcode: '' });

                const productRows = updated.filter(item => item.name);
                const emptyRow = updated.find(item => !item.name);
                // if (!emptyRow) {
                //     productRows.push({ id: Date.now(), quantity: 1, tempBarcode: '' });
                // } else {
                //     productRows.push(emptyRow);
                // }
                productRows.push({ id: Date.now(), quantity: 0, tempBarcode: '' });
                return productRows;
            });
        } catch (error) {
            toast.error('Barcode not found');
        }
    };

    const handleScan = (err: any, result: any, rowId: number) => {
        if (result?.text) {
            addToCartByBarcode(result.text, rowId);
            setScanning(null);
        }
    };

    const increaseQuantity = (id: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id === id && item.available_qty) {
                    if ((item.quantity || 0) + 1 > item.available_qty) {
                        toast.error(`Only ${item.available_qty} in stock`);
                        return item;
                    }
                    return { ...item, quantity: (item.quantity || 0) + 1 };
                }
                return item;
            })
        );
    };

    const decreaseQuantity = (id: number) => {
        setCart(prev => {
            // Decrease quantity for the target item
            const updated = prev.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max((item.quantity || 0) - 1, 0) }
                    : item
            );

            // Ensure at least one row exists
            if (updated.length === 0) {
                return [{ id: Date.now(), quantity: 0, tempBarcode: '' }];
            }

            // Keep all items with quantity > 0 OR no name (empty row)
            const filtered = updated.filter(item => item.quantity > 0 || !item.name);

            // Always ensure at least one row exists
            if (filtered.length === 0) {
                return [{ id: Date.now(), quantity: 0, tempBarcode: '' }];
            }

            return filtered;
        });
    };

    const handleManualQuantityChange = (id: number, newQuantity: number) => {

        if (newQuantity < 1) return;
        setCart(prev =>
            prev.map(item => {
                if (item.id === id && item.available_qty) {
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

    const removeItem = (id: number) => {
        setCart(prev => {
            if (prev.length === 1) {
                return [{ ...prev[0], quantity: 0, tempBarcode: '' }];
            }
            return prev.filter(item => item.id !== id);
        });
    };

    const completeSale = () => {
        const finalCart = cart.filter(item => item.name && item.quantity && item.quantity > 0);
        if (finalCart.length === 0) {
            toast.warning('Cart is empty');
            return;
        }

        if (receivedAmount < totalAmount) {
            toast.error('Received amount is less than total!');
            return;
        }

        setProcessing(true);
        router.post('/cashier/pos/complete-sale', {
            cart: finalCart,
            total: totalAmount,
            received: receivedAmount,
            refund: refundAmount,
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const saleId = page.props?.sale_id || page.props?.flash?.sale_id;
                toast.success('Sale completed!');
                setCart([{ id: Date.now(), quantity: 0, tempBarcode: '' }]);
                setReceivedAmount(0);

                if (saleId) {
                    window.open(`/cashier/pos/invoice/${saleId}`, '_blank');
                }
            },
            onError: (errors) => {
                const message = errors?.error || 'Sale failed!';
                toast.error(message);
                console.error(errors);
            },
            onFinish: () => setProcessing(false),
        });
    };



    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="POS" />
            <CashierMenu />
            <div className="p-4 container mx-auto">
                <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
                <div className="overflow-x-auto">
                    {scanning !== null && (
                        <div className="w-full flex justify-center mb-4">
                            <div className="border p-2 bg-white shadow rounded-md">
                                <BarcodeScannerComponent
                                    width={400}
                                    height={150}
                                    onUpdate={(err, result) => handleScan(err, result, scanning)}
                                />
                                <div className="flex justify-end mt-2">
                                    <Button size="sm" variant="destructive" onClick={() => setScanning(null)}>Close</Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <Table>
                        <TableCaption>Cart Items</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead> Medicine Code</TableHead>
                                <TableHead> Scan</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.map((item, idx) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2 relative">
                                            {/* New Row Button */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setCart(prev => [...prev, { id: Date.now(), quantity: 0, tempBarcode: '' }])}
                                            >
                                                ➕
                                            </Button>

                                            <Input
                                                placeholder="Med Code"
                                                value={item.name ? item.medicine_barcode || item.tempBarcode : item.tempBarcode}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setCart(prev => {
                                                        const updated = prev.map(r =>
                                                            r.id === item.id ? { ...r, tempBarcode: val } : r
                                                        );
                                                        if (idx === updated.length - 1 && val !== '') {
                                                            updated.push({ id: Date.now(), quantity: 0, tempBarcode: '' });
                                                        }
                                                        return updated;
                                                    });
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value;
                                                        if (val.length > 2) {
                                                            addToCartByBarcode(val);
                                                        }
                                                    }
                                                }}
                                                className="w-28"
                                            />
                                        </div>
                                    </TableCell>
                                    {/* <TableCell>
                                        <div className="flex items-center space-x-2 relative">
                                            <Input
                                                placeholder="Med Code"
                                                value={item.name ? item.medicine_barcode || item.tempBarcode : item.tempBarcode}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setCart(prev => {
                                                        const updated = prev.map(r =>
                                                            r.id === item.id ? { ...r, tempBarcode: val } : r
                                                        );
                                                        if (idx === updated.length - 1 && val !== '') {
                                                            updated.push({ id: Date.now(), quantity: 0, tempBarcode: '' });
                                                        }
                                                        return updated;
                                                    });
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value;
                                                        if (val.length > 2) {
                                                            addToCartByBarcode(val);
                                                        }
                                                    }
                                                }}
                                                className="w-32"
                                            />
                                        </div>
                                    </TableCell> */}
                                    <TableCell>
                                        <div className="flex items-center space-x-2 relative">
                                            <Input
                                                placeholder="Scan barcode"
                                                value={item.name ? item.medicine_barcode || item.tempBarcode : item.tempBarcode}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setCart(prev => {
                                                        const updated = prev.map(r =>
                                                            r.id === item.id ? { ...r, tempBarcode: val } : r
                                                        );
                                                        if (idx === updated.length - 1 && val !== '') {
                                                            updated.push({ id: Date.now(), quantity: 1, tempBarcode: '' });
                                                        }
                                                        return updated;
                                                    });
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value;
                                                        if (val.length > 2) {
                                                            addToCartByBarcode(val);
                                                        }
                                                    }
                                                }}
                                                className="w-32"
                                            />
                                            <Button size="sm" onClick={() => setScanning(item.id)}>📷</Button>
                                            {/* {scanning === item.id && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                                    <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center space-y-4">
                                                        <BarcodeScannerComponent
                                                            width={400}
                                                            height={200}
                                                            onUpdate={(err, result) => handleScan(err, result, item.id)}
                                                        />
                                                        <Button size="sm" variant="destructive" onClick={() => setScanning(null)}>Close</Button>
                                                    </div>
                                                </div>
                                            )} */}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.name || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button size="sm" onClick={() => decreaseQuantity(item.id)}>-</Button>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={item.quantity || 0}
                                                onChange={(e) => handleManualQuantityChange(item.id, parseInt(e.target.value))}
                                                className="w-16 text-center"
                                            />
                                            <Button size="sm" onClick={() => increaseQuantity(item.id)}>+</Button>
                                        </div>
                                    </TableCell>
                                    {/* <TableCell>{item.selling_price ?? '-'}</TableCell>
                                    <TableCell>{item.selling_price ? ((item.quantity || 0) * item.selling_price) : '-'}</TableCell> */}
                                    <TableCell>
                                        {item.selling_price !== undefined
                                            ? (item.selling_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            : '-'}
                                    </TableCell>

                                    <TableCell>
                                        {item.selling_price
                                            ? ((item.quantity || 0) * item.selling_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>Remove</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 border-t pt-4 space-y-4 flex flex-col items-end">
                        <div className="w-full max-w-sm grid grid-cols-2 gap-4 items-center">
                            <span className="font-bold">Total Amount:</span>
                            <span className="text-right">
                                {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="font-bold">Received Amount:</span>
                            <Input
                                type="number"
                                className="text-right"
                                value={receivedAmount}
                                onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                            />
                            <span className="font-bold">Refund Amount:</span>
                            <span className="text-right">
                                {refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="mt-4">
                            <Button
                                disabled={processing || refundAmount < 0 || receivedAmount <= 0}
                                className="bg-green-600"
                                onClick={completeSale}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Complete Sale
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}