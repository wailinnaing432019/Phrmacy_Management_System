import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";

export default function AddStockForm({ medicineId, onClose }: { medicineId: number; onClose: () => void }) {
    const { data, setData, patch, processing, errors } = useForm({
        qty: '',
        unit_price: '',
        description: '',
        mfd_date: '',
        exp_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('medicines.addQty', medicineId), {
            onSuccess: () => {
                onClose();            // 👈 Close modal
                setData('qty', '');
                setData('unit_price', '');
                setData('description', '');
                setData('mfd_date', '');
                setData('exp_date', '');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="qty">Purchased Qty</Label>
                <Input
                    id="qty"
                    type="number"
                    value={data.qty}
                    onChange={(e) => setData('qty', e.target.value)}
                    placeholder="Medicine qty"
                />
                <InputError message={errors.qty} />
            </div>
            <div>
                <Label htmlFor="unit_price">Purchased Price</Label>
                <Input
                    id="unit_price"
                    type="number"
                    value={data.unit_price}
                    onChange={(e) => setData('unit_price', e.target.value)}
                    placeholder="Medicine unit_price"
                />
                <InputError message={errors.unit_price} />
            </div>
            <div>
                <Label htmlFor="mfd_date">MFD Date</Label>
                <Input
                    id="mfd_date"
                    type="date"
                    step="1"
                    value={data.mfd_date}
                    onChange={(e) => setData('mfd_date', e.target.value)}

                />
                <InputError message={errors.mfd_date} />
            </div>
            <div>
                <Label htmlFor="exp_date">Expired Date</Label>
                <Input
                    id="exp_date"
                    type="date"
                    step="1"
                    value={data.exp_date}
                    onChange={(e) => setData('exp_date', e.target.value)}
                    placeholder="0.00"
                />
                <InputError message={errors.exp_date} />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Medicine description"
                />
                <InputError message={errors.description} />
            </div>
            <Button type="submit" disabled={processing}>Update Quantity</Button>
        </form>
    );
}