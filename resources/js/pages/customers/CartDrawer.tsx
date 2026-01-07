import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCartData, setCartData } from "@/utils/cart"
import { Link } from "@inertiajs/react"
import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"

export default function ShoppingCartDrawer() {
    useEffect(() => {
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1"
        script.type = "module"
        document.head.appendChild(script)

        return () => {
            document.head.removeChild(script)
        }
    }, [])
    const [cart, setCart] = useState<any[]>([]);

    // useEffect(() => {
    //     setCart(getCartData()); // Load cart when drawer opens
    // }, []);

    useEffect(() => {
        const loadCart = () => setCart(JSON.parse(localStorage.getItem("cart") || "[]"));

        // Initial load
        loadCart();

        // Listen for updates
        window.addEventListener("cartUpdated", loadCart);

        // Cleanup
        return () => window.removeEventListener("cartUpdated", loadCart);
    }, []);
    const updateCart = (newCart: any[]) => {
        setCart(newCart)
        setCartData(newCart) // Persist to localStorage
        window.dispatchEvent(new Event("cartUpdated"))
    }

    const increaseQty = (id: number) => {
        updateCart(
            cart.map(item => {
                if (item.id === id) {
                    if (item.qty < item.available_qty) {
                        return { ...item, qty: item.qty + 1 }
                    } else {
                        toast.error("Maximum stock reached")
                    }
                }
                return item
            })
        )
    }

    const decreaseQty = (id: number) => {
        updateCart(
            cart.map(item =>
                item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
            )
        )
    }


    const removeFromCart = (id: number) => {
        const newCart = cart.filter(item => item.id !== id);
        updateCart(newCart); // ✅ use updateCart instead of manually setting state & localStorage
    };
    const total = cart.reduce(
        (sum, item) =>
            sum + item.qty * parseFloat(item.price.toString().replace(/[^\d.-]/g, "")),
        0
    )
    return (
        <>
            {/* Open Drawer Button */}


            {/* Drawer */}
            <el-dialog>
                <dialog
                    id="drawer"
                    aria-labelledby="drawer-title"
                    className="fixed inset-0 size-auto max-h-none max-w-none overflow-hidden bg-transparent not-open:hidden backdrop:bg-transparent"
                >
                    <el-dialog-backdrop className="absolute inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"></el-dialog-backdrop>

                    <div tabIndex={0} className="absolute inset-0 pl-10 focus:outline-none sm:pl-16">
                        <el-dialog-panel className="ml-auto block size-full max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700">
                            <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                    <div className="flex items-start justify-between">
                                        <h2 id="drawer-title" className="text-lg font-medium text-gray-900">
                                            Shopping cart
                                        </h2>
                                        <div className="ml-3 flex h-7 items-center">
                                            <button
                                                type="button"
                                                command="close"
                                                commandfor="drawer"
                                                className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                            >
                                                <span className="absolute -inset-0.5"></span>
                                                <span className="sr-only">Close panel</span>
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    className="size-6"
                                                >
                                                    <path
                                                        d="M6 18 18 6M6 6l12 12"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cart Items */}
                                    <div className="mt-8">
                                        <div className="flow-root">
                                            <Toaster position="top-left" richColors />
                                            {cart.length === 0 ? (
                                                <h1>No Cart Data</h1>
                                            ) : (
                                                <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                    {cart.map(item => (
                                                        <li className="flex py-6" key={item.id}>
                                                            <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="size-full object-cover"
                                                                />
                                                            </div>

                                                            <div className="ml-4 flex flex-1 flex-col">
                                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                                    <h3>{item.name}</h3>
                                                                    <p className="ml-4">{item.price * item.qty}</p>
                                                                </div>

                                                                {/* Increase / Decrease Buttons */}
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <Button size="sm" onClick={() => decreaseQty(item.id)} disabled={item.qty <= 1}>-</Button>
                                                                    <Input value={item.qty.toString()} readOnly className="w-12 text-center" />
                                                                    <Button size="sm" onClick={() => increaseQty(item.id)}>+</Button>
                                                                </div>

                                                                <p className="mt-1 text-sm text-gray-500">{item.price}</p>

                                                                <div className="flex flex-1 items-end justify-between text-sm">
                                                                    <p className="text-gray-500">Qty {item.qty}</p>
                                                                    {/* 🔥 FIXED Remove Button */}
                                                                    <button
                                                                        onClick={() => removeFromCart(item.id)}
                                                                        className="font-medium text-red-600 hover:text-red-500"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                    )}

                                                </ul>)}
                                        </div>
                                    </div>
                                </div>

                                {/* Subtotal & Actions */}
                                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <p>Subtotal</p>
                                        <p>{total}</p>
                                    </div>
                                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                                    <div className="mt-6">
                                        <a
                                            href="/customers/checkout"
                                            className="flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700"
                                        >
                                            Checkout
                                        </a>
                                    </div>
                                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                        <p>
                                            or{" "}
                                            <button command="close" commandfor="drawer" className="font-medium text-indigo-600 hover:text-indigo-500">
                                                <Link href="/customers/products">Continue Shopping →</Link>
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </el-dialog-panel>
                    </div >
                </dialog >
            </el-dialog>
        </>
    )
}
