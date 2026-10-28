import { useState } from 'react';
import CustomerLayout from '@/layouts/customer-layout';

export default function Home({ medicines }) {
    const [cart, setCart] = useState<number[]>([]);

    const addToCart = (productId: number) => {
        if (!cart.includes(productId)) {
            setCart([...cart, productId]);
        }
    };
    return (
        <CustomerLayout>
            <div className="bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-bold mb-4 text-blue-700">Welcome to the Medicine Shop</h1>
                <p className="mb-6 text-gray-700">Browse and order your medicines easily.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {medicines.data.map(product => (
                        <div key={product.id} className="border p-4 rounded shadow hover:shadow-lg transition bg-gray-50 flex flex-col items-center">
                            {product.image && (
                                <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded mb-4" />
                            )}
                            <h2 className="font-semibold text-lg text-gray-800">{product.name}</h2>
                            <p className="text-gray-600 mb-2">{product.description}</p>
                            <span className="text-blue-600 font-bold mb-2">₹{product.selling_price}</span>
                            <span className={`mb-2 px-2 py-1 rounded text-xs ${product.qty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.qty > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <button
                                className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                disabled={product.qty === 0 || cart.includes(product.id)}
                                onClick={() => addToCart(product.id)}
                            >
                                {cart.includes(product.id) ? 'Added' : 'Add to Cart'}
                            </button>
                        </div>
                    ))}
                </div>
                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                    {medicines.links && medicines.links.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url || '#'}
                            className={`px-3 py-1 mx-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </CustomerLayout>
    );
}