// // src/pages/customers/CheckoutContent.tsx
// import CustomerLayout from "@/layouts/customer-layout";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { router } from "@inertiajs/react";
// import { useCart } from "@/src/CartContext";
// import { useState } from "react";

// export default function CheckoutContent() {
//     const { cart, total } = useCart(); // ✅ Now it works because it’s inside CartProvider
//     const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

//     const placeOrder = () => {
//         if (!form.address.trim() || !form.phone.trim()) {
//             toast.error("Please fill address & phone");
//             return;
//         }

//         router.post("/checkout", { ...form, items: cart }, {
//             onSuccess: () => {
//                 localStorage.removeItem("cart");
//                 toast.success("Order placed!");
//                 window.location.href = "/";
//             },
//             onError: () => toast.error("Order failed"),
//         });
//     };

//     return (
//         <CustomerLayout>
//             <div className="max-w-4xl mx-auto pt-24">
//                 <div className="min-h-screen bg-gray-50 py-10">
//                     <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
//                         {/* Left: Checkout Form */}
//                         <div>
//                             <h2 className="text-2xl font-bold mb-4">Checkout</h2>
//                             <div className="space-y-4">
//                                 <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
//                                 <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
//                                 <Input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
//                                 <Textarea placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
//                                 <Button onClick={placeOrder} className="w-full bg-green-600 hover:bg-green-700">Place Order</Button>
//                             </div>
//                         </div>

//                         {/* Right: Order Summary */}
//                         <div className="bg-gray-50 p-6 rounded-lg">
//                             <h3 className="text-lg font-bold mb-4">Order Summary</h3>
//                             <ul className="divide-y divide-gray-200">
//                                 {cart.map(item => (
//                                     <li key={item.id} className="py-2 flex justify-between">
//                                         <span>{item.name} x {item.qty}</span>
//                                         <span>{item.qty * parseFloat(item.price.toString().replace(/[^\d.-]/g, ''))} MMK</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                             <div className="mt-4 flex justify-between font-bold text-lg">
//                                 <span>Total</span>
//                                 <span>{total} MMK</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </CustomerLayout>
//     );
// }
