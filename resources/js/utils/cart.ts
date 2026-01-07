export const getCartData = () => {
    if (typeof window === "undefined") return [];

    const saved = localStorage.getItem("cart");
    const parsed = saved ? JSON.parse(saved) : [];

    // Ensure qty and available_qty have sensible defaults
    return parsed.map((item: any) => ({
        ...item,
        qty: item.qty ?? 1,                // use ?? so 0 is preserved
        available_qty: item.available_qty ?? 10,
    }));
};

export const setCartData = (cart: any[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(cart));
};
