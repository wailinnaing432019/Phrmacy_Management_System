import React, { useState, useEffect } from 'react';
import Navbar from '@/layouts/app/customers/Navbar';
import CustomerLayout from '@/layouts/customer-layout';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast, Toaster } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const getInitialCart = () => {
    const saved = localStorage.getItem('cart');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(item => ({
        ...item,
        qty: item.qty || 1,
        available_qty: item.available_qty || 10
    }));
};

export default function Cart() {
    const { auth } = usePage().props;
    const [cart, setCart] = useState(getInitialCart);
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState(auth.user?.name || 'No name');
    const [email, setEmail] = useState(auth.user?.email || '');

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const removeFromCart = (id: number) => setCart(cart.filter(item => item.id !== id));

    const increaseQty = (id: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                if (item.qty < item.available_qty) {
                    return { ...item, qty: item.qty + 1 };
                } else {
                    toast('Maximum stock reached'); // <-- toast notification
                    return item;
                }
            }
            return item;
        }));
    };

    const decreaseQty = (id: number) => {
        setCart(cart.map(item => item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item));
    };

    const total = cart.reduce((sum, item) => sum + item.qty * parseFloat(item.price.toString().replace(/[^\d.-]/g, '')), 0);

    const placeOrder = () => {
        if (!cart.length) return;
        if (!address.trim() || !phone.trim()) {
            toast.error('Please enter your address and phone number!');
            return;
        }
        router.post('/checkout', { items: cart, address, phone, name, email }, {
            onSuccess: () => { setCart([]); localStorage.removeItem('cart'); toast.success('Order placed!'); setAddress(''); setPhone(''); },
            onError: (errors) => { console.error(errors); toast.error('Failed to place order!'); }
        });
    };

    return (
        <>
            <div>
                <Navbar />
            </div>
            <div className=' '>
                <Toaster position="top-right" richColors />

                <div className=" max-w-4xl mx-auto   pt-24">
                    <Card className='p-4'>
                        <CardHeader>
                            <CardTitle className="text-2xl text-blue-700">Your Cart</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {cart.length === 0 ? (
                                <p className="text-gray-600">Your cart is empty.</p>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => {
                                        const priceNum = parseFloat(item.price.toString().replace(/[^\d.-]/g, ''));
                                        return (
                                            <div key={item.id} className="flex items-center gap-4 border-b pb-2">
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                                <div className="flex-1">
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-gray-600">{item.price} each</p>
                                                </div>
                                                <div className='flex-1'>
                                                    <p className="text-gray-700 font-bold">Subtotal: {item.qty * priceNum} MMK</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" onClick={() => decreaseQty(item.id)} disabled={item.qty <= 1}>-</Button>
                                                    <Input value={item.qty.toString()} readOnly className="w-12 text-center" />
                                                    <Button size="sm" onClick={() => increaseQty(item.id)}>+</Button>
                                                </div>
                                                <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>Remove</Button>
                                            </div>
                                        );
                                    })}
                                    <div className="grid grid-flow-row grid-cols-2  gap-4 mt-6">
                                        <Input
                                            placeholder="Name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className=""
                                        />
                                        <Input
                                            placeholder="Email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className=""
                                        />

                                        <Input
                                            placeholder="Phone Number"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className=""
                                        />
                                        <Textarea
                                            placeholder="Delivery Address"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            className=""
                                        >
                                        </Textarea>
                                    </div>
                                    <div className="flex justify-between mt-4 border-t pt-4">
                                        <span className="text-lg font-bold">Total:</span>
                                        <span className="text-lg font-bold text-green-700">{total} MMK</span>
                                    </div>

                                    <div className="mt-4 text-right">
                                        <Button onClick={placeOrder} className="bg-green-600 hover:bg-green-700">Place Order</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
