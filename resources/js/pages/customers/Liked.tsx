import CustomerLayout from '../../Layouts/CustomerLayout';

// For demo, use same products as Home
const likedProducts = [
    { id: 3, name: 'Cetirizine', price: '₹60', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
    { id: 5, name: 'Vitamin C', price: '₹40', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
];

export default function Liked() {
    return (
        <CustomerLayout>
            <div className="bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-bold mb-4 text-blue-700">Liked Products</h1>
                {likedProducts.length === 0 ? (
                    <p className="text-gray-700">You have not liked any products yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {likedProducts.map(product => (
                            <div key={product.id} className="border p-4 rounded shadow bg-gray-50 flex flex-col items-center">
                                <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded mb-4" />
                                <h2 className="font-semibold text-lg text-gray-800">{product.name}</h2>
                                <span className="text-blue-600 font-bold mb-2">{product.price}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}