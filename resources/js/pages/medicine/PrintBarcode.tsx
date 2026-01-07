import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";

export default function PrintBarcode({ medicineId, onClose }: { medicineId: number; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        qty: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.qty || Number(data.qty) < 1) return;

        // Open PDF preview in a new tab
        const url = route('medicines.printBarcodes', medicineId) + `?qty=${data.qty}`;
        window.open(url, '_blank');

        // Reset form and close modal
        setData('qty', '');
        onClose();
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="qty">Purchased Qty</Label>
                <Input
                    id="qty"
                    type="number"
                    min={3}
                    value={data.qty}
                    onChange={(e) => setData('qty', e.target.value)}
                    placeholder=" Enter the Amount you want to print barcode"
                />
                <InputError message={errors.qty} />
            </div>

            <Button type="submit" disabled={processing}>Print Barcode</Button>
        </form>
    );
}