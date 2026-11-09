import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface InvoiceItem {
    id: number;
    medicine: {
        name: string;
    };
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface SaleData {
    id: number;
    invoice_no: string;
    total: number;
    received_amount: number;
    refund_amount: number;
    payment_method?: string;
    cashier_name?: string;
    created_at: string;
    items: InvoiceItem[];
}

export default function Invoice({ sale }: { sale: SaleData }) {
    const hasAutoPrinted = useRef(false);

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        // Auto-print after 350ms once fonts & layout are rendered
        if (!hasAutoPrinted.current) {
            hasAutoPrinted.current = true;
            const timer = setTimeout(() => {
                window.print();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, []);

    const formattedDate = new Date(sale.created_at).toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 flex flex-col items-center">
            <Head title={`POS Receipt #${sale.invoice_no}`} />

            {/* Embedded Print Stylesheet strictly specifying 80mm roll paper */}
            <style>{`
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0mm !important;
                    }
                    html, body {
                        width: 80mm !important;
                        max-width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        font-family: 'Courier New', Courier, monospace, ui-monospace !important;
                        font-size: 11px !important;
                        line-height: 1.25 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .pos-slip-wrapper {
                        min-height: auto !important;
                        background: transparent !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    .pos-thermal-receipt {
                        width: 76mm !important;
                        max-width: 76mm !important;
                        margin: 0 auto !important;
                        padding: 4mm 2mm 8mm 2mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        background: #ffffff !important;
                    }
                }
            `}</style>

            {/* Top Toolbar (Hidden during print) */}
            <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 w-full max-w-[340px]">
                <Link
                    href="/cashier/pos"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    <span>Back to POS</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-xs transition-all"
                    >
                        <Printer className="size-3.5" />
                        <span>Print (80mm)</span>
                    </button>

                    <button
                        onClick={() => window.close()}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Close window"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Authentic 80mm Small POS Thermal Receipt Slip */}
            <div className="pos-slip-wrapper">
                <div
                    className="pos-thermal-receipt bg-white text-black p-4 w-[320px] rounded-lg shadow-lg border border-slate-200 font-mono text-[11px] leading-tight"
                >
                    {/* Receipt Header */}
                    <div className="text-center space-y-0.5">
                        <h1 className="text-base font-black tracking-wider uppercase">HELIXPHARMA</h1>
                        <p className="text-[10px] text-slate-600 font-sans font-medium">Pharmacy & Healthcare Supplies</p>
                        <p className="text-[10px]">No. 124 Healthcare Rd, Yangon</p>
                        <p className="text-[10px]">Hotline: +95 9 123 456 789</p>
                    </div>

                    <div className="my-2 border-t border-dashed border-black/80" />

                    {/* Transaction Details */}
                    <div className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between">
                            <span>INVOICE:</span>
                            <span className="font-bold">{sale.invoice_no}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>DATE:</span>
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>CASHIER:</span>
                            <span>{sale.cashier_name || 'Staff'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>PAYMENT:</span>
                            <span className="font-bold">{sale.payment_method?.toUpperCase() || 'CASH'}</span>
                        </div>
                    </div>

                    <div className="my-2 border-t border-dashed border-black/80" />

                    {/* Line Items */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold border-b border-black/30 pb-0.5">
                            <span>ITEM DESCRIPTION</span>
                            <span>TOTAL</span>
                        </div>

                        {sale.items.map((item, index) => (
                            <div key={item.id || index} className="space-y-0.5">
                                <div className="font-bold text-[11px] leading-tight">
                                    {item.medicine.name}
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-700">
                                    <span>
                                        {item.quantity} x {Number(item.unit_price).toLocaleString()}
                                    </span>
                                    <span className="font-semibold text-black">
                                        {Number(item.subtotal).toLocaleString()} MMK
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="my-2 border-t-2 border-dashed border-black" />

                    {/* Summary Totals */}
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-black text-[13px] pt-0.5">
                            <span>TOTAL:</span>
                            <span>{Number(sale.total).toLocaleString()} MMK</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span>CASH TENDERED:</span>
                            <span>{Number(sale.received_amount).toLocaleString()} MMK</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                            <span>CHANGE:</span>
                            <span>{Number(sale.refund_amount).toLocaleString()} MMK</span>
                        </div>
                    </div>

                    <div className="my-2 border-t border-dashed border-black/80" />

                    {/* Invoice Barcode */}
                    <div className="text-center pt-1 space-y-1">
                        <img
                            src={`/barcode/${sale.invoice_no}`}
                            alt={sale.invoice_no}
                            className="h-8 max-w-[160px] mx-auto"
                        />
                        <span className="text-[9px] font-bold tracking-widest">{sale.invoice_no}</span>
                    </div>

                    {/* Receipt Footer */}
                    <div className="text-center mt-3 pt-2 border-t border-dotted border-black/60 space-y-0.5 text-[9px] text-slate-700">
                        <p className="font-bold uppercase text-[10px] text-black">Thank you for your purchase!</p>
                        <p>Goods sold are returnable within 7 days</p>
                        <p>accompanied by this original receipt slip.</p>
                        <p className="pt-1 text-[8px] text-slate-500">*** CUSTOMER RECEIPT ***</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
