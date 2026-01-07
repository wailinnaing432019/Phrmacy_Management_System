// src/CartContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CartItem = {
    id: number;
    name: string;
    price: number | string;
    qty: number;
    available_qty?: number;
    image?: string;
};

type CartContextType = {
    cart: CartItem[];
    setCart: (cart: CartItem[]) => void;
    increaseQty: (id: number) => void;
    decreaseQty: (id: number) => void;
    removeFromCart: (id: number) => void;
    total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(data);
    }, []);

    // Sync cart with localStorage
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const increaseQty = (id: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                if ((item.qty || 1) < (item.available_qty || 10)) {
                    return { ...item, qty: (item.qty || 1) + 1 };
                }
            }
            return item;
        }));
    };

    const decreaseQty = (id: number) => {
        setCart(cart.map(item => item.id === id && item.qty! > 1 ? { ...item, qty: item.qty! - 1 } : item));
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + item.qty! * parseFloat(item.price.toString().replace(/[^\d.-]/g, '')), 0);

    return (
        <CartContext.Provider value={{ cart, setCart, increaseQty, decreaseQty, removeFromCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
