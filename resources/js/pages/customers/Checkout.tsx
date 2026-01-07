import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { router, usePage } from "@inertiajs/react";
import CustomerLayout from "@/layouts/customer-layout";

export default function CheckoutPage() {
    const [cart, setCart] = useState<any[]>([]);
    const { auth } = usePage().props;
    const [form, setForm] = useState({
        name: auth?.user.name || "",
        email: auth?.user.email || "",
        phone: "",
        address: "",
        payment_method: "",
        transaction_id: "",
    });

    useEffect(() => {
        const loadCart = () => setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
        loadCart();
        window.addEventListener("cartUpdated", loadCart);
        return () => window.removeEventListener("cartUpdated", loadCart);
    }, []);

    const total = cart.reduce(
        (sum, item) =>
            sum + item.qty * parseFloat(item.price.toString().replace(/[^\d.-]/g, "")),
        0
    );

    const placeOrder = () => {
        if (!form.address.trim() || !form.phone.trim()) {
            toast.error("Please fill address & phone");
            return;
        }
        if (!form.payment_method) {
            toast.error("Please choose a payment method");
            return;
        }

        router.post(
            "/checkout",
            { ...form, items: cart },
            {
                onSuccess: () => {
                    localStorage.removeItem("cart");
                    toast.success("Order placed!");
                    window.location.href = "/customers/products";
                },
                onError: () => toast.error("Order failed")
            }
        );
    };

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left: Checkout Form */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
                        <div className="space-y-4">
                            <Input
                                placeholder="Name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                            <Input
                                placeholder="Email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                            <Input
                                placeholder="Phone"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                            />
                            <Textarea
                                placeholder="Address"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                        {/* Right: Order Summary */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                            {cart.length === 0 ? (
                                <p className="text-gray-600">Your cart is empty.</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {cart.map(item => (
                                        <li key={item.id} className="py-2 flex justify-between">
                                            <span>{item.name} x {item.qty}</span>
                                            <span>{item.qty * parseFloat(item.price.toString().replace(/[^\d.-]/g, ""))} MMK</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{total} MMK</span>
                            </div>
                        </div>

                    </div>

                    <div>
                        {/* Payment Method */}
                        <div>
                            <h3 className="font-semibold mb-2">Payment Method</h3>
                            <div className="flex gap-4">
                                {/* Kpay */}
                                <div className="relative group flex-1">
                                    <button
                                        type="button"
                                        className={`w-full h-full border rounded-lg p-4 text-center ${form.payment_method === "kpay"
                                            ? "border-green-600 bg-green-50"
                                            : "border-gray-300"
                                            }`}
                                        onClick={() =>
                                            setForm({ ...form, payment_method: "kpay", transaction_id: "" })
                                        }
                                    >
                                        <img src="/kpy_logo.webp" alt="Kpay" className="mx-auto h-15" />
                                        <div>Kpay</div>
                                    </button>
                                </div>

                                {/* CB Pay */}
                                <div className="relative group flex-1">
                                    <button
                                        type="button"
                                        className={`w-full h-full border rounded-lg p-4 text-center ${form.payment_method === "cbpay"
                                            ? "border-green-600 bg-green-50"
                                            : "border-gray-300"
                                            }`}
                                        onClick={() =>
                                            setForm({ ...form, payment_method: "cbpay", transaction_id: "" })
                                        }
                                    >
                                        <img src="/cblogo.jpg" alt="CB Pay" className="mx-auto h-15" />
                                        <div>CB Pay</div>
                                    </button>
                                </div>

                                {/* Cash on Delivery */}
                                <div className="relative group flex-1">
                                    <button
                                        type="button"
                                        className={`w-full h-full border rounded-lg p-4 text-center ${form.payment_method === "cod"
                                            ? "border-green-600 bg-green-50"
                                            : "border-gray-300"
                                            } ${total > 50000 ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() =>
                                            total <= 50000 &&
                                            setForm({ ...form, payment_method: "cod", transaction_id: null })
                                        }
                                        disabled={total > 50000}
                                    >
                                        <div className="text-xl font-bold">💵</div>
                                        <div>Cash on Delivery</div>
                                    </button>

                                    {/* Tooltip on hover */}
                                    {total > 50000 && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-red-500 text-xs px-2 py-1 rounded">
                                            Not available for orders above 50,000 MMK
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full border-8 border-transparent border-t-black"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Show QR + Transaction ID if payment selected */}
                        {form.payment_method === "kpay" && (
                            <div className="mt-4 text-center space-y-3">
                                <h4 className="font-semibold mb-2">Scan Kpay QR</h4>
                                <img src="/kpya.jpg" alt="Kpay QR" className="mx-auto h-48" />
                                <Input
                                    placeholder="Enter Kpay Transaction ID"
                                    value={form.transaction_id || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, transaction_id: e.target.value })
                                    }
                                />
                            </div>
                        )}

                        {form.payment_method === "cbpay" && (
                            <div className="mt-4 text-center space-y-3">
                                <h4 className="font-semibold mb-2">Scan CB Pay QR</h4>
                                <img src="/cb-pay.jpg" alt="CB Pay QR" className="mx-auto h-48" />
                                <Input
                                    placeholder="Enter CB Pay Transaction ID"
                                    value={form.transaction_id || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, transaction_id: e.target.value })
                                    }
                                />
                            </div>
                        )}

                        {/* Place Order Button */}
                        <Button
                            onClick={placeOrder}
                            className="w-full bg-green-600 hover:bg-green-700 mt-2"
                            disabled={
                                !form.payment_method || // No method chosen
                                ((form.payment_method === "kpay" || form.payment_method === "cbpay") &&
                                    !form.transaction_id?.trim()) // Transaction ID missing
                            }
                        >
                            Place Order
                        </Button>
                    </div>

                </div>
            </div>
        </CustomerLayout>
    );
}
