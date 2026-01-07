import { Button } from '@/components/ui/button';
import Navbar from '@/layouts/app/customers/Navbar';
import CustomerLayout from '@/layouts/customer-layout';
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Link, router } from '@inertiajs/react';
import { Input } from '@headlessui/react';

export default function Product({ medicines, categories, filters }) {

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const addToCart = (product) => {
        setCart((prev) => {
            const exists = prev.find(item => item.id === product.id);
            let newCart;
            if (exists) {
                if (exists.qty + 1 > product.qty) {
                    toast.error(`Cannot add more. Only ${product.qty} in stock.`);
                    return prev;
                }
                newCart = prev.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            } else {
                newCart = [...prev, {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.selling_price,
                    qty: 1,
                    available_qty: product.qty || 10
                }];
            }

            localStorage.setItem('cart', JSON.stringify(newCart));
            window.dispatchEvent(new Event("cartUpdated")); // 🔥 dispatch event here
            return newCart;
        });

        toast.success(`${product.name} added to cart!`);
    };

    useEffect(() => {
        const handleCartUpdate = () => {
            const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCart(updatedCart);
        }

        window.addEventListener('cartUpdated', handleCartUpdate);

        // Cleanup
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);


    // Handle category click to filter products
    const filterByCategory = (categoryId) => {
        // If categoryId is null, it means we are clearing the filter
        const params = categoryId ? { category_id: categoryId } : {};
        const url = route("customers.products", params);
        window.location.href = url;
    };

    // Map of sort keys to titles
    const sortTitles: Record<string, string> = {
        // 'price-low-high': 'Price: Low to High',
        // 'price-high-low': 'Price: High to Low',
        'top-selling': 'Top Selling Medicines',
        'new-arrivals': 'New Arrivals',
        // add more if needed
    };

    // Determine title
    const pageTitle = filters.sort && sortTitles[filters.sort] ? sortTitles[filters.sort] : 'Our Products';


    // Map of sort keys to titles
    const sortDescription: Record<string, string> = {
        'price-low-high': 'Filter By Price: Low to High',
        'price-high-low': 'Filter By Price: High to Low',
        'top-selling': 'Check out the best selling medicines',
        'new-arrivals': 'Discover a wide range of medicines',
        // add more if needed
    };

    // Determine title
    const pageDescription = filters.sort && sortDescription[filters.sort] ? sortDescription[filters.sort] : '';

    return (
        <CustomerLayout>
            <div className='pt-24 px-4 md:px-8 lg:px-16'>
                <Toaster position="top-right" richColors />

                {/* Filter button for mobile view */}
                <div className="md:hidden flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-purple-900">
                        {filters.sort === 'top-selling'
                            ? 'Top Selling Medicines'
                            : filters.sort === 'new-arrivals'
                                ? 'New Arrivals'
                                : 'Our Products'}
                    </h2>
                    <Button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className="flex items-center gap-2">
                        <FilterIcon className="h-4 w-4" />
                        Filters
                    </Button>
                </div>

                <div className="mt-10 mb-16 flex flex-col md:flex-row">
                    {/* Left-side filter panel */}
                    <div className={`w-full shadow-lg drop-shadow-xl p-2 mr-1 md:w-1/4 pr-8 md:block ${isFilterPanelOpen ? 'block' : 'hidden'}`}>
                        <h3 className="text-xl font-bold text-purple-900 mb-4 mt-4 md:mt-0">Categories</h3>
                        <ul className="space-y-2">
                            {/* ✅ New "Show All" button */}
                            <li>
                                <button
                                    onClick={() => filterByCategory(null)}
                                    className={`text-left w-full px-4 py-2 rounded-md transition-colors duration-200
                                        ${!filters.category_id ? "bg-purple-200 text-purple-800 font-bold" : "text-gray-600 hover:bg-purple-50"}
                                    `}
                                >
                                    Show All
                                </button>
                            </li>
                            {categories?.map((cat) => (
                                <li key={cat.id}>
                                    <button
                                        onClick={() => filterByCategory(cat.id)}
                                        className={`text-left w-full px-4 py-2 rounded-md transition-colors duration-200
                                            ${filters.category_id == cat.id ? "bg-purple-200 text-purple-800 font-bold" : "text-gray-600 hover:bg-purple-50"}
                                        `}
                                    >
                                        {cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right-side product grid */}
                    <div className="flex-1 mt-8 md:mt-0 ">
                        {/* Title for desktop view */}
                        <h2 className="hidden md:block text-3xl text-purple-900 font-bold text-left">
                            {pageTitle}
                        </h2>
                        <p className="hidden md:block text-gray-400 drop-shadow-xl text-left mb-8">
                            {pageDescription}
                        </p>

                        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                             
                            {medicines?.data?.map(product => (
                                <div key={product.id} className="flex flex-col h-[230px] w-full p-4 rounded-md bg-purple-200 shadow-2xl transition hover:scale-[1.02]">
                                    <div className="flex flex-grow items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <p className="text-xs text-gray-700">Price - {product.selling_price} MMK</p>
                                            <p className="text-lg font-bold text-purple-950">{product.name}</p>
                                            <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
                                        </div>
                                        <div>
                                            <img
                                                src={product.image || "https://i.pinimg.com/736x/28/36/33/283633bff172c375c784194149f41139.jpg"}
                                                alt={product.name}
                                                className="h-28 w-28 object-cover rounded"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2 justify-end">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('customers.product', { medicine: product.id })}>
                                                View More
                                            </Link>
                                        </Button>
                                        <Button onClick={() => addToCart(product)}>
                                            {cart.some(item => item.id === product.id) ? 'Added' : 'Add to Cart'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div> */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {medicines?.data?.length > 0 ? (
                                medicines.data.filter(product => product.qty > 0) // ✅ only show products with qty > 0
                                    .map(product => (

                                        <div key={product.id} className="flex flex-col h-[230px] w-full p-4 rounded-md bg-purple-200 shadow-2xl transition hover:scale-[1.02]">
                                            <div className="flex flex-grow items-start gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <p className="text-xs text-gray-700">Price - {product.selling_price} MMK</p>
                                                    <p className="text-lg font-bold text-purple-950">{product.name}</p>
                                                    <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
                                                </div>
                                                <div>
                                                    <img
                                                        src={product.image || "https://i.pinimg.com/736x/28/36/33/283633bff172c375c784194149f41139.jpg"}
                                                        alt={product.name}
                                                        className="h-28 w-28 object-cover rounded"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-2 justify-end">
                                                <Button variant="outline" asChild>
                                                    <Link href={route('customers.product', { medicine: product.id })}>
                                                        View More
                                                    </Link>
                                                </Button>
                                                <Button onClick={() => addToCart(product)}>
                                                    {cart.some(item => item.id === product.id) ? 'Added' : 'Add to Cart'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                            ) : (

                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center items-center h-48">
                                    <p className="text-2xl font-bold text-gray-500">
                                        {new URLSearchParams(window.location.search).get("search") ? (
                                            <>
                                                <span className="text-red-300">
                                                    {new URLSearchParams(window.location.search).get("search")}
                                                </span>{" "}
                                                is not found for your search.
                                            </>
                                        ) : (
                                            "No products found."
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* ✅ Pagination component with category_id */}
                        <div className="mt-12  flex justify-center items-center space-x-2 pb-5">
                            {medicines.links.map((link, index) => {
                                // Create a new URLSearchParams object from the existing URL
                                const params = new URLSearchParams(link.url ? new URL(link.url).search : '');
                                // Add the category_id from filters if it exists
                                if (filters.category_id) {
                                    params.set('category_id', filters.category_id);
                                }
                                // Construct the new href
                                const newHref = link.url ? `${new URL(link.url).origin}${new URL(link.url).pathname}?${params.toString()}` : null;

                                return (
                                    <Link
                                        key={index}
                                        href={newHref}
                                        preserveScroll
                                        className={`
                                            px-4 py-2 rounded-lg text-sm font-medium
                                            ${link.active
                                                ? 'bg-purple-700 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }
                                            ${!link.url ? 'cursor-not-allowed opacity-50' : ''}
                                        `}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}