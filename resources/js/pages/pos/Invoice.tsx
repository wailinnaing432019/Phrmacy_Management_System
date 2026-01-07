import { useEffect, useRef } from 'react';

export default function Invoice({ sale }: { sale: any }) {
    const printRef = useRef<HTMLDivElement>(null);
    const hasAutoPrinted = useRef(false);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - HelixPharma</title>
                    <style>
                        @media print {
                            @page { margin: 0; size: 72mm auto; }
                            body { margin: 0; font-family: monospace; font-size: 11px; }
                        }
                        body { font-family: monospace; font-size: 11px; width: 280px; padding: 10px; }
                        table {
                            width: 100%;
                            border-collapse: separate;
                            border-spacing: 12px 2px; /* Increased horizontal spacing for better readability */
                        }
                        th, td {
                            padding: 2px 0;
                            text-align: left;
                        }
                        .text-right { text-align: right; }
                        hr { border: none; border-top: 1px dashed #000; margin: 4px 0; }
                        .truncate { max-width: 220px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: top; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() { window.close(); }
                        }
                    </script>
                </body>
            </html>
        `);

        printWindow.document.close();
    };

    // useEffect(() => {
    //     if (!hasAutoPrinted.current) {
    //         hasAutoPrinted.current = true;
    //         handlePrint();
    //     }
    // }, []);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div ref={printRef} className="bg-white p-2 w-[350px] shadow text-[11px] font-mono">
                <div className="text-center mb-1">
                    <h1 className="text-[13px] font-bold uppercase">HelixPharma</h1>
                    <p>Invoice #: {sale.invoice_no}</p>
                    <p>{new Date(sale.created_at).toLocaleString()}</p>
                </div>

                <hr />

                <table className="text-[10px] w-full border-separate" style={{ borderSpacing: '12px 2px' }}>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Sub</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map((item: any) => (
                            <tr key={item.id}>
                                <td className="truncate">{item.medicine.name}</td>
                                <td className="text-right">{item.quantity ?? 0}</td>
                                <td className="text-right">{item.unit_price}</td>
                                <td className="text-right">{item.subtotal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr />

                <div className="text-right font-bold text-[11px]">
                    <p>Total: {sale.total}</p>
                    <p>Received: {sale.received_amount}</p>
                    <p>Refund: {sale.refund_amount}</p>
                </div>

                <div className="text-center mt-2 text-[10px]">
                    <p>Thank you for your purchase!</p>
                </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-4 py-2 text-sm rounded shadow"
                >
                    Print Invoice
                </button>
            </div>
        </div>
    );
}