import { Button } from '@/components/ui/button';
import Navbar from '@/layouts/app/customers/Navbar';
import CustomerLayout from '@/layouts/customer-layout';
import { FilterIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Show({ medicine, categories, filters }) {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const addToCart = (product) => {
        setCart((prev) => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                // Check if adding more exceeds the available quantity
                if (exists.qty + 1 > product.qty) {
                    toast.error(`Cannot add more. Only ${product.qty} in stock.`);
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + 1 }
                        : item
                );
            } else {
                return [...prev, {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.selling_price,
                    qty: 1,
                    available_qty: product.qty
                }];
            }
        });
        toast.success(`${product.name} added to cart!`);
    };

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const filterByCategory = (categoryId) => {
        const url = route("customers.products", { category_id: categoryId });
        window.location.href = url;
    };

    if (!medicine) {
        return <CustomerLayout><div className="text-center py-10">Product not found.</div></CustomerLayout>;
    }

    return (
        <>
            <Navbar />
            <div className='pt-24 px-4 md:px-8 lg:px-16'>
                <Toaster position="top-right" richColors />

                {/* Filter button for mobile view */}
                <div className="md:hidden flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-purple-900">Product Detail</h2>
                    <Button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className="flex items-center gap-2">
                        <FilterIcon className="h-4 w-4" />
                        Categories
                    </Button>
                </div>

                <div className="mt-10 mb-16 flex flex-col md:flex-row">
                    {/* Left-side filter panel */}
                    <div className={`w-full md:w-1/4 pr-8 md:block ${isFilterPanelOpen ? 'block' : 'hidden'}`}>
                        <h3 className="text-xl font-bold text-purple-900 mb-4 mt-4 md:mt-0">Categories</h3>
                        <ul className="space-y-2">
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

                    {/* Right-side single product view */}
                    <div className="flex-1 mt-8 md:mt-0">
                        {/* Title for desktop view */}
                        <h2 className="hidden md:block text-3xl text-purple-900 font-bold text-left mb-8">Product Detail</h2>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="md:w-1/3">
                                <img
                                    src={medicine.image ?? "https://i.pinimg.com/736x/28/36/33/283633bff172c375c784194149f41139.jpg"}
                                    alt={medicine.name}
                                    className="w-full h-auto object-cover rounded-lg shadow-xl"
                                />
                            </div>
                            <div className="md:w-2/3 space-y-4">
                                <h1 className="text-4xl font-extrabold text-purple-950">{medicine.name}</h1>
                                <p className="text-2xl font-semibold text-gray-700">Price: {medicine.selling_price} MMK</p>
                                <p className="text-gray-500">Code: {medicine.medicine_barcode}</p>
                                <div className="space-y-2">
                                    <p className="text-lg text-gray-800 font-medium">Description:</p>
                                    <p className="text-gray-600 leading-relaxed">{medicine.description}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg text-gray-800 font-medium">Available Stock:</p>
                                    <p className={`text-gray-600 ${medicine.qty <= medicine.stock_limit ? 'text-red-600 font-bold' : ''}`}>
                                        {medicine.qty}
                                    </p>
                                </div>
                                <Button onClick={() => addToCart(medicine)} className="w-full md:w-auto">
                                    {cart.some(item => item.id === medicine.id) ? 'Added' : 'Add to Cart'}
                                </Button>
                                {/* Added a back button for navigation */}
                                <Button onClick={() => window.history.back()} variant="outline" className="w-full md:w-auto mt-2">
                                    Back to Products
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}