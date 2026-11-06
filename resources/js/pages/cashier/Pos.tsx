import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CashierMenu from '@/layouts/cashier-menu';
import { Head, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { toast } from 'sonner';

type Medicine = {
    id: number;
    name: string;
    category: string;
    description: string;
    selling_price: number;
    qty: number;
    medicine_barcode: string;
    available_qty: number;
};

type CartItem = {
    id: number;
    name?: string;
    selling_price?: number;
    quantity: number;
    qty?: number;
    available_qty?: number;
    medicine_barcode?: string;
    tempBarcode: string;
};

type QuantityInputProps = {
    value: number;
    max: number;
    disabled?: boolean;
    onCommit: (quantity: number) => number;
};

function QuantityInput({ value, max, disabled, onCommit }: QuantityInputProps) {
    const [draft, setDraft] = useState(String(value));

    useEffect(() => {
        setDraft(String(value));
    }, [value]);

    const commit = () => {
        const parsed = Number.parseInt(draft, 10);

        if (!Number.isFinite(parsed)) {
            setDraft(String(value));
            return;
        }

        setDraft(String(onCommit(parsed)));
    };

    return (
        <Input
            type="number"
            min={1}
            max={max > 0 ? max : undefined}
            value={draft}
            disabled={disabled}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.currentTarget.blur();
                }
            }}
            className="w-16 text-center"
        />
    );
}

export default function POS() {
    const tempId = useRef(0);

    const createBlankRow = (): CartItem => ({
        id: --tempId.current,
        quantity: 0,
        tempBarcode: '',
    });

    const [cart, setCart] = useState<CartItem[]>(() => [createBlankRow()]);
    const cartRef = useRef(cart);
    const [scanning, setScanning] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const [receivedAmount, setReceivedAmount] = useState<number>(0);

    const commitCart = (next: CartItem[]) => {
        cartRef.current = next;
        setCart(next);
    };

    const withBlankRow = (items: CartItem[]): CartItem[] => {
        const products = items.filter((item) => item.name);
        const blank = items.find((item) => !item.name) ?? createBlankRow();

        return [...products, blank];
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.selling_price || 0) * (item.quantity || 0), 0);

    const refundAmount = receivedAmount > 0 ? receivedAmount - totalAmount : 0;

    const addToCartByBarcode = async (barcode: string) => {
        const code = barcode.trim();

        if (!code) return;

        try {
            const response = await fetch(`/cashier/pos/lookup/${encodeURIComponent(code)}`);

            if (!response.ok) throw new Error();

            const medicine = (await response.json()) as Medicine;
            const available = Math.max(0, Number(medicine.available_qty ?? medicine.qty ?? 0));
            const current = cartRef.current;
            const existing = current.find((item) => item.name && item.id === medicine.id);

            if (existing) {
                if (existing.quantity >= available) {
                    if (available < 1) {
                        commitCart(withBlankRow(current.filter((item) => item.id !== medicine.id)));
                        toast.error(`${medicine.name} is out of stock`);
                        return;
                    }

                    commitCart(current.map((item) => (item.id === medicine.id ? { ...item, quantity: available, available_qty: available } : item)));
                    toast.error(`Only ${available} in stock`);
                    return;
                }

                commitCart(
                    current.map((item) => (item.id === medicine.id ? { ...item, quantity: item.quantity + 1, available_qty: available } : item)),
                );
                toast.success(`+1 ${medicine.name}`);
                return;
            }

            if (available < 1) {
                toast.error(`${medicine.name} is out of stock`);
                return;
            }

            const productRows = current.filter((item) => item.name);

            commitCart([
                ...productRows,
                {
                    ...medicine,
                    available_qty: available,
                    qty: available,
                    quantity: 1,
                    tempBarcode: '',
                },
                createBlankRow(),
            ]);
            toast.success(`${medicine.name} added`);
        } catch {
            toast.error('Barcode not found');
        }
    };

    const handleScan = (_err: unknown, result?: { getText: () => string }) => {
        const text = result?.getText();

        if (text) {
            void addToCartByBarcode(text);
            setScanning(null);
        }
    };

    const updateTempBarcode = (id: number, value: string) => {
        const current = cartRef.current;
        const rowIndex = current.findIndex((row) => row.id === id);
        const updated = current.map((row) => (row.id === id ? { ...row, tempBarcode: value } : row));

        if (rowIndex === current.length - 1 && value !== '') {
            updated.push(createBlankRow());
        }

        commitCart(updated);
    };

    const setQuantity = (id: number, requested: number): number => {
        const current = cartRef.current;
        const item = current.find((row) => row.id === id);

        if (!item?.name || !Number.isFinite(requested)) {
            return item?.quantity ?? 0;
        }

        const max = Math.max(1, Number(item.available_qty) || 1);
        const quantity = Math.min(Math.max(Math.trunc(requested), 1), max);

        if (requested > max) {
            toast.error(`Only ${max} in stock`);
        }

        commitCart(current.map((row) => (row.id === id ? { ...row, quantity } : row)));

        return quantity;
    };

    const increaseQuantity = (id: number) => {
        const item = cartRef.current.find((row) => row.id === id);

        if (!item?.name) return;

        setQuantity(id, item.quantity + 1);
    };

    const decreaseQuantity = (id: number) => {
        const current = cartRef.current;
        const item = current.find((row) => row.id === id);

        if (!item?.name) return;

        if (item.quantity <= 1) {
            commitCart(withBlankRow(current.filter((row) => row.id !== id)));
            return;
        }

        setQuantity(id, item.quantity - 1);
    };

    const removeItem = (id: number) => {
        commitCart(withBlankRow(cartRef.current.filter((row) => row.id !== id)));
    };

    const completeSale = () => {
        const currentCart = cartRef.current;
        const finalCart = currentCart.filter((item) => item.name && Number.isFinite(item.quantity) && item.quantity > 0);
        const currentTotal = currentCart.reduce((sum, item) => sum + (item.selling_price || 0) * (item.quantity || 0), 0);

        if (finalCart.length === 0) {
            toast.warning('Cart is empty');
            return;
        }

        if (receivedAmount < currentTotal) {
            toast.error('Received amount is less than total!');
            return;
        }

        setProcessing(true);

        router.post(
            '/cashier/pos/complete-sale',
            {
                cart: finalCart.map((item) => ({ id: item.id, quantity: item.quantity })),
                total: currentTotal,
                received: receivedAmount,
                refund: receivedAmount - currentTotal,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const props = page.props as {
                        sale_id?: number;
                        flash?: { sale_id?: number };
                    };
                    const saleId = props.sale_id ?? props.flash?.sale_id;

                    toast.success('Sale completed!');
                    commitCart([createBlankRow()]);
                    setReceivedAmount(0);

                    if (saleId) {
                        window.open(`/cashier/pos/invoice/${saleId}`, '_blank');
                    }
                },
                onError: (errors) => {
                    const message = Object.values(errors as Record<string, string>).find(Boolean) ?? 'Sale failed!';
                    toast.error(message);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title="POS Terminal" />
            <CashierMenu />
            <div className="container mx-auto p-4 sm:p-6 flex-1">
                <h1 className="mb-4 text-2xl font-bold">Point of Sale</h1>
                <div className="overflow-x-auto">
                    {scanning !== null && (
                        <div className="mb-4 flex w-full justify-center">
                            <div className="rounded-md border bg-white p-2 shadow">
                                <BarcodeScannerComponent width={400} height={150} onUpdate={(err, result) => handleScan(err, result)} />
                                <div className="mt-2 flex justify-end">
                                    <Button size="sm" variant="destructive" onClick={() => setScanning(null)}>
                                        Close
                                    </Button>
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
                            {cart.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="relative flex items-center space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => commitCart([...cartRef.current, createBlankRow()])}>
                                                ➕
                                            </Button>

                                            <Input
                                                placeholder="Med Code"
                                                value={item.name ? item.medicine_barcode || item.tempBarcode : item.tempBarcode}
                                                onChange={(event) => updateTempBarcode(item.id, event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        const value = event.currentTarget.value;

                                                        if (value.length > 2) {
                                                            void addToCartByBarcode(value);
                                                        }
                                                    }
                                                }}
                                                className="w-28"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative flex items-center space-x-2">
                                            <Input
                                                placeholder="Scan barcode"
                                                value={item.name ? item.medicine_barcode || item.tempBarcode : item.tempBarcode}
                                                onChange={(event) => updateTempBarcode(item.id, event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        const value = event.currentTarget.value;

                                                        if (value.length > 2) {
                                                            void addToCartByBarcode(value);
                                                        }
                                                    }
                                                }}
                                                className="w-32"
                                            />
                                            <Button size="sm" onClick={() => setScanning(item.id)}>
                                                📷
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{item.name || '-'}</div>
                                        {item.name && <div className="text-xs text-muted-foreground">Available: {item.available_qty ?? 0}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button size="sm" onClick={() => decreaseQuantity(item.id)} disabled={!item.name}>
                                                -
                                            </Button>
                                            <QuantityInput
                                                value={item.quantity || 0}
                                                max={item.available_qty ?? 0}
                                                disabled={!item.name}
                                                onCommit={(quantity) => setQuantity(item.id, quantity)}
                                            />
                                            <Button size="sm" onClick={() => increaseQuantity(item.id)} disabled={!item.name}>
                                                +
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.selling_price !== undefined
                                            ? item.selling_price.toLocaleString(undefined, {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                              })
                                            : '-'}
                                    </TableCell>

                                    <TableCell>
                                        {item.selling_price
                                            ? ((item.quantity || 0) * item.selling_price).toLocaleString(undefined, {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                              })
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>
                                            Remove
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex flex-col items-end space-y-4 border-t pt-4">
                        <div className="grid w-full max-w-sm grid-cols-2 items-center gap-4">
                            <span className="font-bold">Total Amount:</span>
                            <span className="text-right">
                                {totalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                            <span className="font-bold">Received Amount:</span>
                            <Input
                                type="number"
                                className="text-right"
                                value={receivedAmount}
                                onChange={(event) => setReceivedAmount(parseFloat(event.target.value) || 0)}
                            />
                            <span className="font-bold">Refund Amount:</span>
                            <span className="text-right">
                                {refundAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className="mt-4">
                            <Button disabled={processing || refundAmount < 0 || receivedAmount <= 0} className="bg-green-600" onClick={completeSale}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Sale
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
