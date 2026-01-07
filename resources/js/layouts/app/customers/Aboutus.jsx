import { Clock, ShieldCheck, Truck } from 'lucide-react';

const AboutUs = () => {
    const highlights = [
        {
            title: 'Fast & Reliable Delivery',
            description: 'Timely delivery of medicines with real-time tracking for smooth supply chain.',
            icon: Truck,
            bg: 'bg-blue-100 text-green-700',
        },
        {
            title: 'Safe & Trustworthy',
            description: 'Quality assurance and secure handling of all medical supplies.',
            icon: ShieldCheck,
            bg: 'bg-purple-200 text-blue-700',
        },
        {
            title: '24/7 Support',
            description: 'Our team is available around the clock to assist vendors and suppliers.',
            icon: Clock,
            bg: 'bg-purple-300 text-yellow-700',
        },
    ];

    return (
        <div className="bg-gray-50 px-4 py-10" id='aboutus'>
            <div className="mx-auto mb-12 max-w-5xl text-center">
                <h1 className="text-4xl font-bold text-purple-900">About Us</h1>
                <p className="mt-14 text-justify text-lg text-gray-700">
                    Welcome to <span className="font-medium text-purple-950">HelixPharma</span>, your trusted platform connecting suppliers and
                    vendors. <br />
                    <br />
                </p>
                <div className="mt-5 ml-5 flex w-[1000px] px-10 py-4 text-justify shadow-2xl rounded-2xl">
                    <p className="me-5 w-[400px]">
                        We simplify procurement and ensure timely, safe delivery of medicines. We provide a wide range of medicines and medical
                        supplies — all backed by secure transactions, real-time inventory tracking, and dedicated support. Whether you’re a pharmacy,
                        clinic, or healthcare provider, we’re here to make sure you get the products you need, exactly when you need them.
                    </p>
                    <p className="w-[550px]">
                        {' '}
                        At <span className="font-medium text-purple-950">HelixPharma</span>, we believe that managing medicine supply shouldn’t be
                        complicated. By combining modern technology with a deep understanding of healthcare needs, we deliver a seamless,
                        user-friendly experience that vendors and suppliers can trust. Thank you for choosing{' '}
                        <span className="font-medium text-purple-950">MediSupply Hub</span>. Together, we can make medicine distribution faster,
                        safer, and more efficient, helping healthcare providers focus on what matters most — caring for their patients.
                    </p>
                </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-12 md:flex-row">
                {highlights.map((item, idx) => (
                    <div key={idx} className={`h-60 w-60 rotate-45 transform ${item.bg} flex items-center justify-center rounded-xl shadow-lg `}>
                        <div className="-rotate-45 transform px-4 text-center">
                            <item.icon size={40} className="mx-auto mb-4" />
                            <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                            <p className="text-sm text-gray-700 p-2">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* <div className="mx-auto mt-16 max-w-2xl text-right">
                <p className="text-lg text-purple-500">Join us...........</p>
            </div> */}
        </div>
    );
};

export default AboutUs;
