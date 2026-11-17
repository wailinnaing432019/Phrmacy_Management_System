import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import CashierMenu from '@/layouts/cashier-menu';
import { Head, router } from '@inertiajs/react';
import {
    Barcode,
    Camera,
    Check,
    LoaderCircle,
    Minus,
    Pill,
    Plus,
    Receipt,
    RotateCcw,
    ScanLine,
    Trash2,
    X,
} from 'lucide-react';
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
            className="h-8 w-14 text-center font-mono font-bold text-xs rounded-lg"
        />
    );
}

export default function POS() {
    const tempId = useRef(0);
    const fastScanInputRef = useRef<HTMLInputElement>(null);

    const createBlankRow = (): CartItem => ({
        id: --tempId.current,
        quantity: 0,
        tempBarcode: '',
    });

    const [cart, setCart] = useState<CartItem[]>(() => [createBlankRow()]);
    const cartRef = useRef(cart);
    const [fastScanCode, setFastScanCode] = useState('');
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
            toast.error(`Barcode "${code}" not found`);
        }
    };

    const handleScan = (_err: unknown, result?: { getText: () => string }) => {
        const text = result?.getText();

        if (text) {
            void addToCartByBarcode(text);
            setScanning(null);
            fastScanInputRef.current?.focus();
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

    const clearCart = () => {
        commitCart([createBlankRow()]);
        setReceivedAmount(0);
        fastScanInputRef.current?.focus();
    };

    const setExactAmount = () => {
        setReceivedAmount(totalAmount);
    };

    const completeSale = () => {
        const currentCart = cartRef.current;
        const finalCart = currentCart.filter((item) => item.name && Number.isFinite(item.quantity) && item.quantity > 0);
        const currentTotal = currentCart.reduce((sum, item) => sum + (item.selling_price || 0) * (item.quantity || 0), 0);

        if (finalCart.length === 0) {
            toast.warning('Cart is empty. Please scan or enter medicines.');
            return;
        }

        if (receivedAmount < currentTotal) {
            toast.error('Received amount is less than total amount!');
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

                    toast.success('Sale completed successfully!');
                    commitCart([createBlankRow()]);
                    setReceivedAmount(0);

                    if (saleId) {
                        window.open(`/cashier/pos/invoice/${saleId}`, '_blank');
                    }

                    fastScanInputRef.current?.focus();
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
            <Head title="Cashier POS Terminal" />
            <CashierMenu />

            <div className="flex-1 w-full p-4 sm:p-6 space-y-4">
                {/* Fast Scan Bar (Master Input for physical gun and manual typing) */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 sm:p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                            <ScanLine className="size-5" />
                        </div>

                        <div className="relative flex-1 w-full">
                            <Input
                                ref={fastScanInputRef}
                                placeholder="⚡ Scan barcode with scanner gun or type medicine code (Press Enter)..."
                                value={fastScanCode}
                                onChange={(e) => setFastScanCode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const code = fastScanCode.trim();
                                        if (code.length > 0) {
                                            e.preventDefault();
                                            void addToCartByBarcode(code);
                                            setFastScanCode('');
                                        }
                                    }
                                }}
                                className="h-11 w-full text-sm font-mono pl-3 pr-28 rounded-xl border-primary/30 bg-background focus-visible:ring-primary"
                                autoFocus
                            />
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setScanning(-1)}
                                    className="h-8 gap-1 text-xs text-primary hover:bg-primary/10"
                                    title="Scan barcode with camera"
                                >
                                    <Camera className="size-4" />
                                    <span className="hidden sm:inline">Camera</span>
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => commitCart([...cartRef.current, createBlankRow()])}
                                className="h-11 rounded-xl gap-1 text-xs font-semibold"
                            >
                                <Plus className="size-4" />
                                <span>Add Row</span>
                            </Button>

                            {cart.some((item) => item.name) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={clearCart}
                                    className="h-11 rounded-xl text-xs text-muted-foreground hover:text-destructive"
                                >
                                    Clear Cart
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Camera Scanner View Modal */}
                {scanning !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Camera className="size-5 text-primary" />
                                    <h3 className="font-bold text-sm">Camera Barcode Scanner</h3>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setScanning(null)}
                                    className="size-8 rounded-lg"
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                            <div className="py-4">
                                <div className="overflow-hidden rounded-xl border border-border bg-black">
                                    <BarcodeScannerComponent
                                        width="100%"
                                        height={260}
                                        onUpdate={(err, result) => handleScan(err, result)}
                                    />
                                </div>
                                <p className="text-center text-xs text-muted-foreground mt-2">
                                    Hold pharmaceutical barcode or QR code in front of camera lens.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main POS Grid: Left Table, Right Summary Checkout */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Cart Items Table (2 Columns) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent">
                                            {/* ONE COMBINED BARCODE INPUT COLUMN */}
                                            <TableHead className="w-[240px]">
                                                Barcode / Medicine Code
                                            </TableHead>
                                            <TableHead>Medicine Name</TableHead>
                                            <TableHead className="w-32 text-center">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead className="w-14 text-center"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-border/60">
                                        {cart.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                                {/* Single Combined Barcode Input */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <Input
                                                            placeholder="Scan / type code..."
                                                            value={item.name ? item.medicine_barcode || item.tempBarcode : item.tempBarcode}
                                                            onChange={(event) => updateTempBarcode(item.id, event.target.value)}
                                                            onKeyDown={(event) => {
                                                                if (event.key === 'Enter') {
                                                                    const value = event.currentTarget.value.trim();
                                                                    if (value.length > 0) {
                                                                        void addToCartByBarcode(value);
                                                                    }
                                                                }
                                                            }}
                                                            className="h-9 font-mono text-xs rounded-xl"
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            type="button"
                                                            onClick={() => setScanning(item.id)}
                                                            title="Scan barcode with camera"
                                                            className="size-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Camera className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>

                                                {/* Medicine Name & Stock */}
                                                <TableCell>
                                                    {item.name ? (
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-sm text-foreground">{item.name}</p>
                                                            <span className="text-xs text-muted-foreground">
                                                                Available: {item.available_qty ?? 0}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">— Empty row —</span>
                                                    )}
                                                </TableCell>

                                                {/* Quantity Controls */}
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            type="button"
                                                            onClick={() => decreaseQuantity(item.id)}
                                                            disabled={!item.name}
                                                            className="size-7 rounded-lg"
                                                        >
                                                            <Minus className="size-3" />
                                                        </Button>
                                                        <QuantityInput
                                                            value={item.quantity || 0}
                                                            max={item.available_qty ?? 0}
                                                            disabled={!item.name}
                                                            onCommit={(quantity) => setQuantity(item.id, quantity)}
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            type="button"
                                                            onClick={() => increaseQuantity(item.id)}
                                                            disabled={!item.name}
                                                            className="size-7 rounded-lg"
                                                        >
                                                            <Plus className="size-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>

                                                {/* Unit Price */}
                                                <TableCell className="text-right font-mono text-sm">
                                                    {item.selling_price !== undefined
                                                        ? `${Number(item.selling_price).toLocaleString()} MMK`
                                                        : '—'}
                                                </TableCell>

                                                {/* Subtotal */}
                                                <TableCell className="text-right font-mono font-bold text-sm text-primary">
                                                    {item.selling_price
                                                        ? `${((item.quantity || 0) * item.selling_price).toLocaleString()} MMK`
                                                        : '—'}
                                                </TableCell>

                                                {/* Remove Row */}
                                                <TableCell className="text-center">
                                                    {item.name ? (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            type="button"
                                                            onClick={() => removeItem(item.id)}
                                                            className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Right Checkout / Payment Drawer (1 Column) */}
                    <div className="space-y-4">
                        <Card className="rounded-2xl border-border/80 shadow-xs">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <Receipt className="size-4 text-primary" />
                                    <CardTitle className="text-base font-bold">Payment Summary</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {/* Total Amount */}
                                <div className="rounded-xl border border-border/70 p-4 bg-muted/20 space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Total Amount
                                    </span>
                                    <div className="flex items-baseline gap-1 text-2xl font-black text-primary">
                                        <span>{totalAmount.toLocaleString()}</span>
                                        <span className="text-xs font-semibold text-muted-foreground">MMK</span>
                                    </div>
                                </div>

                                {/* Received Amount Input */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="received-amount" className="text-xs font-bold text-foreground">
                                            Cash Received (MMK)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={setExactAmount}
                                            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                                        >
                                            Exact Amount
                                        </button>
                                    </div>
                                    <Input
                                        id="received-amount"
                                        type="number"
                                        value={receivedAmount || ''}
                                        onChange={(event) => setReceivedAmount(parseFloat(event.target.value) || 0)}
                                        placeholder="0.00"
                                        className="h-11 rounded-xl text-lg font-mono font-bold text-right"
                                    />
                                </div>

                                {/* Change / Refund */}
                                <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/20">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Change / Refund
                                    </span>
                                    <span
                                        className={`font-mono text-base font-bold ${
                                            refundAmount >= 0 ? 'text-primary' : 'text-destructive'
                                        }`}
                                    >
                                        {refundAmount.toLocaleString()} MMK
                                    </span>
                                </div>

                                {/* Complete Sale Button */}
                                <Button
                                    type="button"
                                    disabled={processing || refundAmount < 0 || receivedAmount <= 0 || totalAmount <= 0}
                                    onClick={completeSale}
                                    className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="mr-2 size-4 animate-spin" />
                                            Processing Sale...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 size-5" />
                                            Complete Sale & Print Slip
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
