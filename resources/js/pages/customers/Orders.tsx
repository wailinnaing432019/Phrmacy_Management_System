import CustomerLayout from '@/layouts/customer-layout';

const orders = [
    { id: 1, medicine_name: 'Paracetamol', status: 'Delivered', date: '2025-08-10' },
    { id: 2, medicine_name: 'Ibuprofen', status: 'Processing', date: '2025-08-15' },
];

export default function Orders() {
    return (
        <CustomerLayout>
            <div className="bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-bold mb-4 text-blue-700">Your Orders</h1>
                {orders.length === 0 ? (
                    <p className="text-gray-700">You have no orders yet.</p>
                ) : (
                    <ul>
                        {orders.map(order => (
                            <li key={order.id} className="mb-4 border-b pb-2">
                                <span className="font-semibold">{order.medicine_name}</span> -
                                <span className={`ml-2 px-2 py-1 rounded ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.status}
                                </span>
                                <span className="ml-4 text-gray-500">{order.date}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </CustomerLayout>
    );
}