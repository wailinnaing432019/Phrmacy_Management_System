// src/layouts/app/customers/Navbar.tsx
import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ShoppingCart, User2, Search, X } from "lucide-react"; // Import X icon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ShoppingCartDrawer from "@/pages/customers/CartDrawer";

export default function Navbar() {
    const [active, setActive] = useState("");
    const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [search, setSearch] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false); // New state for search box visibility
    const navRef = useRef<HTMLDivElement>(null);
    const { auth, lastCategories } = usePage().props;

    useEffect(() => setIsLoggedIn(!!auth?.user), [auth]);

    // ✅ Handle Active Link including dropdowns
    useEffect(() => {
        const path = window.location.pathname;
        const hash = window.location.hash;
        const params = new URLSearchParams(window.location.search);

        let newActive = "";

        if (path.includes("/customers/products")) {
            if (params.has("sort")) {
                const sortVal = params.get("sort");
                if (sortVal?.includes("price")) newActive = "prices";
                else if (sortVal === "trending") newActive = "categories";
                else newActive = "topSale";
            } else if (params.has("category_id")) {
                newActive = "categories";
            } else {
                newActive = "product";
            }
        } else if (path.includes("/customers")) {
            newActive = "home";
        }

        if (hash === "#aboutus") newActive = "about";
        else if (hash === "#contact") newActive = "contact";
        else if (path.includes("/customers/cart")) newActive = "cart";

        setActive(newActive);
    }, [window.location.pathname, window.location.search, window.location.hash]);

    // ✅ Underline bar update
    useEffect(() => {
        const activeLink = navRef.current?.querySelector(`[data-id="${active}"]`) as HTMLElement;
        if (activeLink) {
            setLineStyle({ left: activeLink.offsetLeft, width: activeLink.offsetWidth });
        }
    }, [active]);

    // ✅ Set search query from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const searchQuery = params.get("search") || "";
        setSearch(searchQuery);
        // If a search query exists, show the search box
        if (searchQuery) {
            setIsSearchVisible(true);
        }
    }, [window.location.search]);

    const handleLogout = () => {
        setIsLoggedIn(false);
        router.post("/logout");
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route("customers.products"), { search });
    };

    const navLinks = [
        { name: "Home", href: "/customers", id: "home" },
        { name: "Products", href: "/customers/products", id: "product" },
        { name: "Top Sales", href: "/customers/products?sort=top-selling", id: "topSale" },
        { name: "Prices", href: "/customers/products?sort=price-low-high", id: "prices" },
        { name: "Top Trending", href: "/customers/products?sort=trending", id: "categories" },
        { name: "About", href: "/customers#aboutus", id: "about" },
        { name: "Contact", href: "/customers#contact", id: "contact" }
    ];

    return (
        <header className="fixed z-50 w-full bg-white pr-1 shadow-2xl">
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo */}
                <h1 className="flex text-2xl font-bold text-purple-900">
                    <img src="/icon.png" alt="Logo" className="h-[40px] w-15 " />
                    <img src="/helixpharma-logo.png" alt="Logo" className="h-[35px] w-52" />
                </h1>

                {/* Nav Links */}
                <nav className="relative flex p-2 font-medium text-gray-900 drop-shadow-xl space-x-8" ref={navRef}>
                    {navLinks.map(link => {
                        if (["topSale", "prices", "categories"].includes(link.id)) {
                            // Dropdown Items
                            return (
                                <div key={link.id} className="relative group">
                                    <span
                                        data-id={link.id}
                                        className={`relative mb-2 py-0.5 cursor-pointer transition-colors hover:text-purple-700
    ${active === link.id ? "text-purple-900 font-bold" : ""}
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:bg-purple-900
    after:rounded-full after:transition-all after:duration-300
    ${active === link.id ? "after:w-full" : "after:w-0 hover:after:w-full"}`}
                                    >
                                        {link.name}
                                    </span>
                                    <div className="absolute left-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible hover:opacity-100 hover:visible transition-all duration-200 z-50">
                                        {link.id === "topSale" && (
                                            <>
                                                <Link href="/customers/products?sort=top-selling" data-id="topSale" onClick={() => setActive("topSale")} className="block px-4 py-2 hover:bg-purple-50">Top Selling</Link>
                                                <Link href="/customers/products?sort=new-arrivals" data-id="topSale" onClick={() => setActive("topSale")} className="block px-4 py-2 hover:bg-purple-50">New Arrivals</Link>
                                            </>
                                        )}
                                        {link.id === "categories" && lastCategories.map((cat: any) => (
                                            <Link key={cat.id} href={`/customers/products?category_id=${cat.id}`} data-id="categories" onClick={() => setActive("categories")} className="block px-4 py-2 hover:bg-purple-50">{cat.name}</Link>
                                        ))}
                                        {link.id === "prices" && ['price-low-high', 'price-high-low'].map(sort => {
                                            const params = new URLSearchParams(window.location.search);
                                            params.set('sort', sort);
                                            const href = `/customers/products?${params.toString()}`;
                                            const label = sort === 'price-low-high' ? 'Low to High' : 'High to Low';
                                            return <Link key={sort} href={href} data-id="prices" onClick={() => setActive("prices")} className="block px-4 py-2 hover:bg-purple-50">{label}</Link>;
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        // Normal Links
                        return (
                            <Link
                                key={link.id}
                                href={link.href}
                                data-id={link.id}
                                onClick={() => setActive(link.id)}
                                className={`relative mb-2  cursor-pointer transition-colors hover:text-purple-700
    ${active === link.id ? "text-purple-900 font-bold" : ""}
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:bg-purple-900
    after:rounded-full after:transition-all after:duration-300
    ${active === link.id ? "after:w-full" : "after:w-0 hover:after:w-full"}`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Search Box */}
                <form onSubmit={handleSearch} className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${isSearchVisible ? 'w-48 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full border-gray-300"
                    />
                </form>

                <div className="flex items-center gap-2">
                    {/* Search Button */}
                    <Button type="button" size="icon" onClick={() => setIsSearchVisible(!isSearchVisible)}>
                        {isSearchVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                    </Button>

                    {/* Cart Section */}
                    <button command="show-modal" commandfor="drawer" className="p-2 text-gray-400 hover:text-gray-500">
                        <ShoppingCart className="h-6 w-6" />
                    </button>

                    {/* Login/User Section */}
                    <div className="mr-1 flex gap-2">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <span className="flex cursor-pointer items-center gap-2 px-5 py-1 text-purple-900">
                                            <span>Hi, {auth.user?.name}</span>
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200">
                                                <User2 className="h-5 w-5 text-purple-900" />
                                            </span>
                                        </span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild><Link href="/my-orders">My Orders</Link></DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-700">Logout</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <>
                                <Button><Link href={route('login')}>Login</Link></Button>
                                <Button><Link href={route('register')}>Register</Link></Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <ShoppingCartDrawer />
        </header>
    );
}