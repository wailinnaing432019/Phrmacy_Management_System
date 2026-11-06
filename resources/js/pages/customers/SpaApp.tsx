import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { toast, Toaster } from 'sonner';
import {
    ShoppingCart,
    User2,
    Search,
    Package,
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    LogOut,
    Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    api,
    CustomerUser,
    ApiCategory,
    ApiMedicine,
    ApiOrder,
} from '@/lib/api';

type TabView = 'home' | 'catalog' | 'product-detail' | 'cart' | 'checkout' | 'orders' | 'login' | 'register';

interface CartItem {
    id: number;
    name: string;
    selling_price: number;
    image_url?: string;
    qty: number;
    available_qty: number;
}

export default function SpaApp() {
    const [view, setView] = useState<TabView>('home');
    const [selectedProduct, setSelectedProduct] = useState<ApiMedicine | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);

    // Auth state
    const [user, setUser] = useState<CustomerUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Catalog state
    const [products, setProducts] = useState<ApiMedicine[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Orders state
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('spa_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Forms state
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', password_confirmation: '', phone: '' });
    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        payment_method: 'cash',
        transaction_id: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // Save cart
    useEffect(() => {
        localStorage.setItem('spa_cart', JSON.stringify(cart));
    }, [cart]);

    // Check auth on mount
    useEffect(() => {
        api.auth.me()
            .then(res => {
                setUser(res.customer);
                setCheckoutForm(prev => ({
                    ...prev,
                    name: res.customer.name,
                    email: res.customer.email,
                    phone: res.customer.phone || '',
                }));
            })
            .catch(() => setUser(null))
            .finally(() => setAuthLoading(false));

        // Load categories
        api.catalog.getCategories()
            .then(res => setCategories(res.data))
            .catch(() => {});
    }, []);

    // Load products when catalog filters change
    useEffect(() => {
        if (view === 'home' || view === 'catalog') {
            loadProducts();
        }
    }, [view, selectedCategory, sortOption, currentPage]);

    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await api.catalog.getProducts({
                page: currentPage,
                per_page: view === 'home' ? 8 : 12,
                category_id: selectedCategory || undefined,
                search: searchQuery || undefined,
                sort: sortOption || undefined,
            });
            setProducts(res.data);
            setTotalPages(res.meta?.last_page || 1);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setView('catalog');
        loadProducts();
    };

    // Load orders
    const loadOrders = async () => {
        if (!user) {
            setView('login');
            return;
        }
        setLoadingOrders(true);
        try {
            const res = await api.orders.getOrders();
            setOrders(res.data);
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoadingOrders(false);
        }
    };

    // Add to cart
    const addToCart = (product: ApiMedicine, qty = 1) => {
        if (product.available_qty < 1) {
            toast.error(`${product.name} is currently out of stock`);
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                const newQty = existing.qty + qty;
                if (newQty > product.available_qty) {
                    toast.error(`Only ${product.available_qty} items available in stock`);
                    return prev;
                }
                return prev.map(item => item.id === product.id ? { ...item, qty: newQty } : item);
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                selling_price: product.selling_price,
                image_url: product.image_url,
                qty,
                available_qty: product.available_qty,
            }];
        });
        toast.success(`${product.name} added to cart`);
    };

    const updateCartQty = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const nextQty = item.qty + delta;
                if (nextQty <= 0) return item;
                if (nextQty > item.available_qty) {
                    toast.error(`Only ${item.available_qty} available in stock`);
                    return item;
                }
                return { ...item, qty: nextQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
        toast.info('Item removed from cart');
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.qty * item.selling_price), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // Auth handlers
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.auth.login(loginForm);
            setUser(res.customer);
            toast.success(`Welcome back, ${res.customer.name}!`);
            setView('home');
        } catch (err: any) {
            toast.error(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.auth.register(registerForm);
            setUser(res.customer);
            toast.success(`Account created! Welcome, ${res.customer.name}!`);
            setView('home');
        } catch (err: any) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.auth.logout();
            setUser(null);
            toast.info('Logged out successfully');
            setView('home');
        } catch {
            toast.error('Logout failed');
        }
    };

    // Checkout handler
    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please log in to place an order');
            setView('login');
            return;
        }

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.orders.placeOrder({
                items: cart.map(item => ({ id: item.id, qty: item.qty })),
                name: checkoutForm.name,
                email: checkoutForm.email,
                phone: checkoutForm.phone,
                address: checkoutForm.address,
                payment_method: checkoutForm.payment_method,
                transaction_id: checkoutForm.transaction_id || undefined,
            });

            toast.success(`Order #${res.data.order_no} placed successfully!`);
            setCart([]);
            setView('orders');
            loadOrders();
        } catch (err: any) {
            toast.error(err.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <Head title="MediStock SPA Store" />
            <Toaster position="top-right" richColors />

            {/* Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-purple-100 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
                        <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center text-white font-black text-xl shadow-md">
                            M
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight text-purple-950">MediStock</span>
                            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">SPA</span>
                        </div>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center flex-1 max-w-md relative">
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search medicines, categories..."
                            className="pr-10 rounded-full border-purple-200 focus-visible:ring-purple-600"
                        />
                        <button type="submit" className="absolute right-3 text-purple-600 hover:text-purple-800">
                            <Search className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Nav Links & Actions */}
                    <nav className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant={view === 'catalog' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => { setView('catalog'); setCurrentPage(1); }}
                        >
                            Products
                        </Button>

                        {/* Cart Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="relative border-purple-200 hover:bg-purple-50"
                            onClick={() => setView('cart')}
                        >
                            <ShoppingCart className="w-4 h-4 text-purple-700" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-purple-700 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Button>

                        {/* Auth actions */}
                        {user ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={view === 'orders' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => { setView('orders'); loadOrders(); }}
                                >
                                    My Orders
                                </Button>
                                <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 text-xs text-purple-900 font-medium">
                                    <User2 className="w-3.5 h-3.5 text-purple-700" />
                                    <span>{user.name.split(' ')[0]}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                                    <LogOut className="w-4 h-4 text-red-600" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setView('login')}>
                                    Login
                                </Button>
                                <Button size="sm" className="bg-purple-700 hover:bg-purple-800" onClick={() => setView('register')}>
                                    Register
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content Body */}
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* ─── HOME VIEW ────────────────────────────────────────────── */}
                {view === 'home' && (
                    <div className="space-y-12">
                        {/* Hero Banner */}
                        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-4 max-w-xl">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm text-purple-200">
                                    Trusted Online Pharmacy
                                </span>
                                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                                    Your Health, Delivered With Care.
                                </h1>
                                <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                                    Browse genuine verified medicines, check real-time stock availability, and place orders directly with fast processing.
                                </p>
                                <div className="pt-2 flex flex-wrap gap-3">
                                    <Button
                                        size="lg"
                                        className="bg-white text-purple-950 font-bold hover:bg-purple-50 rounded-xl"
                                        onClick={() => { setView('catalog'); setCurrentPage(1); }}
                                    >
                                        Explore All Products
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white/30 text-white hover:bg-white/10 rounded-xl"
                                        onClick={() => setView('cart')}
                                    >
                                        View Cart ({cartCount})
                                    </Button>
                                </div>
                            </div>
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                                <Package className="w-16 h-16 text-purple-300" />
                            </div>
                        </div>

                        {/* Categories Quick Filter */}
                        {categories.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-800">Shop By Category</h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={selectedCategory === null ? 'default' : 'outline'}
                                        size="sm"
                                        className={selectedCategory === null ? 'bg-purple-700' : ''}
                                        onClick={() => { setSelectedCategory(null); setView('catalog'); }}
                                    >
                                        All
                                    </Button>
                                    {categories.map(cat => (
                                        <Button
                                            key={cat.id}
                                            variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                            size="sm"
                                            className={selectedCategory === cat.id ? 'bg-purple-700' : ''}
                                            onClick={() => { setSelectedCategory(cat.id); setView('catalog'); }}
                                        >
                                            {cat.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Featured Medicines Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Featured Medicines</h2>
                                    <p className="text-sm text-slate-500">Available for online reservation and order</p>
                                </div>
                                <Button variant="link" className="text-purple-700" onClick={() => setView('catalog')}>
                                    See all &rarr;
                                </Button>
                            </div>

                            {loadingProducts ? (
                                <div className="py-16 text-center text-slate-400">Loading products...</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {products.map(med => (
                                        <Card key={med.id} className="overflow-hidden hover:shadow-lg transition-all border-slate-200 flex flex-col justify-between">
                                            <div>
                                                <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                                                     onClick={() => { setSelectedProduct(med); setView('product-detail'); }}>
                                                    {med.image_url ? (
                                                        <img src={med.image_url} alt={med.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-12 h-12 text-slate-300" />
                                                    )}
                                                </div>
                                                <CardContent className="p-4 space-y-2">
                                                    <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">
                                                        {med.category_name || 'General'}
                                                    </span>
                                                    <h3
                                                        className="font-bold text-base text-slate-900 cursor-pointer hover:text-purple-700 line-clamp-1"
                                                        onClick={() => { setSelectedProduct(med); setView('product-detail'); }}
                                                    >
                                                        {med.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 line-clamp-2">{med.description}</p>
                                                    <div className="pt-2 flex items-baseline justify-between">
                                                        <span className="text-lg font-black text-purple-950">
                                                            {med.selling_price.toLocaleString()} <span className="text-xs font-normal text-slate-500">MMK</span>
                                                        </span>
                                                        <span className={`text-xs font-medium ${med.available_qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {med.available_qty > 0 ? `${med.available_qty} in stock` : 'Out of stock'}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </div>
                                            <div className="p-4 pt-0">
                                                <Button
                                                    className="w-full bg-purple-700 hover:bg-purple-800 rounded-lg"
                                                    disabled={med.available_qty < 1}
                                                    onClick={() => addToCart(med)}
                                                >
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── CATALOG VIEW ─────────────────────────────────────────── */}
                {view === 'catalog' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Medicines Catalog</h1>
                                <p className="text-sm text-slate-500">Browse verified pharmaceutical inventory</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Sort Filter */}
                                <select
                                    value={sortOption}
                                    onChange={e => { setSortOption(e.target.value); setCurrentPage(1); }}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                                >
                                    <option value="">Default (Newest)</option>
                                    <option value="price-low-high">Price: Low to High</option>
                                    <option value="price-high-low">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant={selectedCategory === null ? 'default' : 'outline'}
                                className={selectedCategory === null ? 'bg-purple-700' : ''}
                                onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                            >
                                All Categories
                            </Button>
                            {categories.map(cat => (
                                <Button
                                    key={cat.id}
                                    size="sm"
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    className={selectedCategory === cat.id ? 'bg-purple-700' : ''}
                                    onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>

                        {/* Products Grid */}
                        {loadingProducts ? (
                            <div className="py-20 text-center text-slate-400">Loading catalog...</div>
                        ) : products.length === 0 ? (
                            <div className="py-20 text-center space-y-3">
                                <p className="text-lg font-semibold text-slate-600">No medicines found</p>
                                <Button variant="outline" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
                                    Clear filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map(med => (
                                    <Card key={med.id} className="overflow-hidden hover:shadow-lg transition-all border-slate-200 flex flex-col justify-between">
                                        <div>
                                            <div
                                                className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                                                onClick={() => { setSelectedProduct(med); setView('product-detail'); }}
                                            >
                                                {med.image_url ? (
                                                    <img src={med.image_url} alt={med.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-12 h-12 text-slate-300" />
                                                )}
                                            </div>
                                            <CardContent className="p-4 space-y-2">
                                                <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">
                                                    {med.category_name || 'General'}
                                                </span>
                                                <h3
                                                    className="font-bold text-base text-slate-900 cursor-pointer hover:text-purple-700 line-clamp-1"
                                                    onClick={() => { setSelectedProduct(med); setView('product-detail'); }}
                                                >
                                                    {med.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 line-clamp-2">{med.description}</p>
                                                <div className="pt-2 flex items-baseline justify-between">
                                                    <span className="text-lg font-black text-purple-950">
                                                        {med.selling_price.toLocaleString()} <span className="text-xs font-normal text-slate-500">MMK</span>
                                                    </span>
                                                    <span className={`text-xs font-medium ${med.available_qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {med.available_qty > 0 ? `${med.available_qty} in stock` : 'Out of stock'}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </div>
                                        <div className="p-4 pt-0">
                                            <Button
                                                className="w-full bg-purple-700 hover:bg-purple-800 rounded-lg"
                                                disabled={med.available_qty < 1}
                                                onClick={() => addToCart(med)}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <span className="text-xs font-medium text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── PRODUCT DETAIL VIEW ──────────────────────────────────── */}
                {view === 'product-detail' && selectedProduct && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Button variant="ghost" size="sm" onClick={() => setView('catalog')} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to catalog
                        </Button>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                            <div className="h-80 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                                {selectedProduct.image_url ? (
                                    <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-20 h-20 text-slate-300" />
                                )}
                            </div>

                            <div className="space-y-5 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-full">
                                        {selectedProduct.category_name || 'General'}
                                    </span>
                                    <h1 className="text-3xl font-extrabold text-slate-900">{selectedProduct.name}</h1>
                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                                    {selectedProduct.medicine_barcode && (
                                        <p className="text-xs text-slate-400 font-mono">Barcode: {selectedProduct.medicine_barcode}</p>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-3xl font-black text-purple-950">
                                            {selectedProduct.selling_price.toLocaleString()} <span className="text-sm font-normal text-slate-500">MMK</span>
                                        </span>
                                        <span className={`text-sm font-semibold ${selectedProduct.available_qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {selectedProduct.available_qty > 0 ? `${selectedProduct.available_qty} items in stock` : 'Out of stock'}
                                        </span>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full bg-purple-700 hover:bg-purple-800 rounded-xl text-base font-bold shadow-md"
                                        disabled={selectedProduct.available_qty < 1}
                                        onClick={() => addToCart(selectedProduct)}
                                    >
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── CART VIEW ────────────────────────────────────────────── */}
                {view === 'cart' && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
                            <span className="text-sm text-slate-500">{cartCount} items</span>
                        </div>

                        {cart.length === 0 ? (
                            <Card className="text-center py-12 space-y-4">
                                <CardContent className="space-y-3">
                                    <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                                    <p className="text-slate-600 font-medium">Your cart is currently empty</p>
                                    <Button onClick={() => setView('catalog')} className="bg-purple-700 hover:bg-purple-800">
                                        Start Shopping
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="p-0 divide-y">
                                        {cart.map(item => (
                                            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                                        <p className="text-xs text-purple-700 font-semibold">{item.selling_price.toLocaleString()} MMK</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                                        <button
                                                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                                                            onClick={() => updateCartQty(item.id, -1)}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-3 text-sm font-semibold">{item.qty}</span>
                                                        <button
                                                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                                                            onClick={() => updateCartQty(item.id, 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <span className="font-bold text-sm w-24 text-right">
                                                        {(item.qty * item.selling_price).toLocaleString()} MMK
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                                    <div className="flex items-baseline justify-between text-lg font-black">
                                        <span>Total</span>
                                        <span className="text-2xl text-purple-900">{cartTotal.toLocaleString()} MMK</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={() => setView('catalog')}>
                                            Continue Shopping
                                        </Button>
                                        <Button
                                            className="flex-1 bg-purple-700 hover:bg-purple-800 font-bold"
                                            onClick={() => setView('checkout')}
                                        >
                                            Proceed to Checkout
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── CHECKOUT VIEW ────────────────────────────────────────── */}
                {view === 'checkout' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Button variant="ghost" size="sm" onClick={() => setView('cart')} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to cart
                        </Button>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900">Checkout & Delivery Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Full Name</label>
                                        <Input
                                            required
                                            value={checkoutForm.name}
                                            onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                                            placeholder="Enter recipient name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700">Email Address</label>
                                            <Input
                                                required
                                                type="email"
                                                value={checkoutForm.email}
                                                onChange={e => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                                            <Input
                                                required
                                                value={checkoutForm.phone}
                                                onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                                                placeholder="09..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Delivery Address</label>
                                        <Input
                                            required
                                            value={checkoutForm.address}
                                            onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                                            placeholder="Building, street, township, city"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700">Payment Method</label>
                                            <select
                                                value={checkoutForm.payment_method}
                                                onChange={e => setCheckoutForm({ ...checkoutForm, payment_method: e.target.value })}
                                                className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-sm"
                                            >
                                                <option value="cash">Cash on Delivery (COD)</option>
                                                <option value="kpay">KBZPay</option>
                                                <option value="wave">WavePay</option>
                                                <option value="cb">CB Pay</option>
                                            </select>
                                        </div>
                                        {checkoutForm.payment_method !== 'cash' && (
                                            <div>
                                                <label className="text-xs font-semibold text-slate-700">Transaction ID</label>
                                                <Input
                                                    value={checkoutForm.transaction_id}
                                                    onChange={e => setCheckoutForm({ ...checkoutForm, transaction_id: e.target.value })}
                                                    placeholder="Enter transaction reference"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-purple-50 rounded-xl space-y-2 text-sm text-purple-950">
                                        <div className="flex justify-between">
                                            <span>Subtotal ({cartCount} items)</span>
                                            <span className="font-semibold">{cartTotal.toLocaleString()} MMK</span>
                                        </div>
                                        <div className="flex justify-between text-base font-bold border-t border-purple-200 pt-2">
                                            <span>Total Due</span>
                                            <span>{cartTotal.toLocaleString()} MMK</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={submitting}
                                        className="w-full bg-purple-700 hover:bg-purple-800 font-bold"
                                    >
                                        {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ─── ORDERS VIEW ──────────────────────────────────────────── */}
                {view === 'orders' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-slate-900">Your Order History</h1>
                            <Button variant="outline" size="sm" onClick={loadOrders}>
                                Refresh
                            </Button>
                        </div>

                        {loadingOrders ? (
                            <div className="py-20 text-center text-slate-400">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <Card className="text-center py-12">
                                <CardContent className="space-y-3">
                                    <Package className="w-12 h-12 text-slate-300 mx-auto" />
                                    <p className="text-slate-600 font-medium">You haven't placed any orders yet</p>
                                    <Button onClick={() => setView('catalog')} className="bg-purple-700 hover:bg-purple-800">
                                        Browse Medicines
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-purple-50">
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono font-bold text-purple-900">{order.order_no}</TableCell>
                                                <TableCell className="text-xs text-slate-500">
                                                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell className="font-bold">{order.total.toLocaleString()} MMK</TableCell>
                                                <TableCell>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-purple-700 text-xs font-semibold"
                                                        onClick={() => setSelectedOrder(order)}
                                                    >
                                                        Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}

                        {/* Order Detail Modal / Box */}
                        {selectedOrder && (
                            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <h3 className="font-bold text-lg text-slate-900">Order #{selectedOrder.order_no}</h3>
                                        <button className="text-slate-400 hover:text-slate-600 font-bold" onClick={() => setSelectedOrder(null)}>
                                            ✕
                                        </button>
                                    </div>
                                    <div className="text-xs space-y-1.5 text-slate-600">
                                        <p><span className="font-semibold text-slate-800">Status:</span> {selectedOrder.status}</p>
                                        <p><span className="font-semibold text-slate-800">Payment:</span> {selectedOrder.payment_method}</p>
                                        <p><span className="font-semibold text-slate-800">Recipient:</span> {selectedOrder.name} ({selectedOrder.phone})</p>
                                        <p><span className="font-semibold text-slate-800">Address:</span> {selectedOrder.address}</p>
                                    </div>

                                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50 text-slate-700">
                                                    <tr>
                                                        <th className="p-2 text-left">Medicine</th>
                                                        <th className="p-2 text-center">Qty</th>
                                                        <th className="p-2 text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {selectedOrder.items.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="p-2 font-medium">{item.medicine_name || `Medicine #${item.medicine_id}`}</td>
                                                            <td className="p-2 text-center">{item.qty}</td>
                                                            <td className="p-2 text-right">{item.subtotal.toLocaleString()} MMK</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t font-bold">
                                        <span>Total</span>
                                        <span className="text-lg text-purple-900">{selectedOrder.total.toLocaleString()} MMK</span>
                                    </div>
                                    <Button className="w-full bg-purple-700 hover:bg-purple-800" onClick={() => setSelectedOrder(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── LOGIN VIEW ───────────────────────────────────────────── */}
                {view === 'login' && (
                    <div className="max-w-md mx-auto space-y-6 pt-6">
                        <Card>
                            <CardHeader className="text-center space-y-1">
                                <CardTitle className="text-2xl font-bold text-purple-950">Customer Login</CardTitle>
                                <p className="text-xs text-slate-500">Sign in to your customer account</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Email Address</label>
                                        <Input
                                            required
                                            type="email"
                                            value={loginForm.email}
                                            onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                                            placeholder="customer@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Password</label>
                                        <Input
                                            required
                                            type="password"
                                            value={loginForm.password}
                                            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-purple-700 hover:bg-purple-800 font-bold"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                    <p className="text-center text-xs text-slate-600 pt-2">
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            className="text-purple-700 font-semibold hover:underline"
                                            onClick={() => setView('register')}
                                        >
                                            Register here
                                        </button>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ─── REGISTER VIEW ────────────────────────────────────────── */}
                {view === 'register' && (
                    <div className="max-w-md mx-auto space-y-6 pt-6">
                        <Card>
                            <CardHeader className="text-center space-y-1">
                                <CardTitle className="text-2xl font-bold text-purple-950">Customer Registration</CardTitle>
                                <p className="text-xs text-slate-500">Create a customer account to place orders</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Full Name</label>
                                        <Input
                                            required
                                            value={registerForm.name}
                                            onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Email Address</label>
                                        <Input
                                            required
                                            type="email"
                                            value={registerForm.email}
                                            onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                                            placeholder="customer@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Phone (optional)</label>
                                        <Input
                                            value={registerForm.phone}
                                            onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                                            placeholder="09..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Password</label>
                                        <Input
                                            required
                                            type="password"
                                            value={registerForm.password}
                                            onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                                        <Input
                                            required
                                            type="password"
                                            value={registerForm.password_confirmation}
                                            onChange={e => setRegisterForm({ ...registerForm, password_confirmation: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-purple-700 hover:bg-purple-800 font-bold"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Creating account...' : 'Create Account'}
                                    </Button>
                                    <p className="text-center text-xs text-slate-600 pt-2">
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            className="text-purple-700 font-semibold hover:underline"
                                            onClick={() => setView('login')}
                                        >
                                            Login here
                                        </button>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-purple-100 py-6 text-center text-xs text-slate-400">
                <div className="container mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} MediStock Pharmacy. Customer SPA powered by MediStock API v1.</p>
                </div>
            </footer>
        </div>
    );
}

