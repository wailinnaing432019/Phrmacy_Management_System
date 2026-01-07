import { useState } from "react";

export default function Drawer() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Button to open drawer */}
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10"
            >
                Open drawer
            </button>

            {/* Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Drawer Panel */}
            <div
                className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="p-4 flex-1 overflow-y-auto">
                        <ul className="divide-y divide-gray-200">
                            <li className="flex py-4">
                                <img
                                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-01.jpg"
                                    alt="Bag"
                                    className="w-20 h-20 object-cover rounded-md border"
                                />
                                <div className="ml-4 flex flex-col flex-1">
                                    <div className="flex justify-between font-medium">
                                        <h3>Throwback Hip Bag</h3>
                                        <p>$90.00</p>
                                    </div>
                                    <p className="text-sm text-gray-500">Qty 1</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <div className="flex justify-between font-medium">
                            <p>Subtotal</p>
                            <p>$90.00</p>
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
