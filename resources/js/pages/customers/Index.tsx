import { Button } from '@/components/ui/button';
import AboutUs from '@/layouts/app/customers/Aboutus';
import Ads from '@/layouts/app/customers/Ads';
import Contact from '@/layouts/app/customers/Contact';
import Footer from '@/layouts/app/customers/Footer';
import CustomerLayout from '@/layouts/customer-layout';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Product({ medicines }) {
    const scrollRef = useRef(null);

    const categories = [
        { name: 'Adult', img: 'https://i.pinimg.com/1200x/f0/03/dd/f003dd7a10530560c3beef365628594e.jpg' },
        { name: 'Baby', img: 'https://i.pinimg.com/1200x/51/2e/dc/512edc04da5afe9d8261af0795408e87.jpg' },
    ];

    const scroll = (direction) => {
        if (direction === 'left') scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        else scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    };

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

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

    return (
        <CustomerLayout>
            <Ads />
            <div className="mt-10 text-center">
                <h2 className="text-3xl text-purple-900 font-bold">New Medicines</h2>
                <p className="text-blue-400 drop-shadow-xl"><Link href={route('customers.products')}>Shop More</Link></p>
            </div>

            {/* <div className="relative mx-20 mt-10 flex">
                <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md">
                    <ChevronLeftIcon className="h-6 w-6 text-purple-700" />
                </button>

                <div ref={scrollRef} className="mx-10 flex gap-16 overflow-x-auto scrollbar-hide">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="text-center">
                            <div className="h-[80px] w-[80px] rounded-full overflow-hidden bg-purple-400 shadow-xl">
                                <img src={cat.img} alt={cat.name} className="object-cover h-full w-full" />
                            </div>
                            <p className="mt-3 font-bold">{cat.name}</p>
                        </div>
                    ))}
                </div>

                <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md">
                    <ChevronRightIcon className="h-6 w-6 text-purple-700" />
                </button>
            </div> */}

            <div className="mt-12 mb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 md:px-16">
                {medicines.map(product => (
                    <div key={product.id} className="flex flex-col h-[230px] w-full p-4 rounded-md bg-purple-200 shadow-2xl transition hover:scale-[1.02]">
                        {/* Product info section - grows to fill space */}
                        <div className="flex flex-grow items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <p className="text-xs text-gray-700">Price - {product.selling_price} MMK</p>
                                <p className="text-lg font-bold text-purple-950">{product.name}</p>
                                {/* ✅ Description is now truncated to 2 lines */}
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
                        {/* Action buttons section - stays at the bottom */}
                        <div className="mt-4 flex gap-2 justify-end">
                            <Button variant="outline"  >
                                <a href={`/customers/product/${product.id}`}>View More</a>
                            </Button>
                            <Button onClick={() => addToCart(product)}>
                                {cart.some(item => item.id === product.id) ? 'Added' : 'Add to Cart'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <AboutUs />
            <Contact />
        </CustomerLayout>
    );
}
