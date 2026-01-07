// src/App.js

export default function Footer() {
    return (
        <footer className="h-[140px]   w-full border-t border-gray-200 bg-gray-400 pt-2">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-1 text-gray-600 md:grid-cols-4">
                {/* Brand Info */}
                <div>
                    <h2 className="text-lg font-bold text-purple-900">HelixPharma</h2>
                    <p className="text-xs text-black">Your trusted partner in delivering quality medicines and healthcare supplies.</p>
                </div>

                {/* Navigation */}
                <div>
                    <h2 className="text-lg font-semibold text-purple-900">Quick Links</h2>
                    <ul className="space-y-0.5 text-xs text-black">
                        <li>
                            <a href="/customers" className="transition hover:text-blue-600">
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="/customers/products" className="transition hover:text-blue-600">
                                Product
                            </a>
                        </li>
                        <li>
                            <a href="/customers#about" className="transition hover:text-blue-600">
                                About Us
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Customer Support */}
                <div>
                    <h2 className="text-lg font-semibold text-purple-900">Customer Support</h2>
                    <ul className="space-y-0.5 text-xs text-black">
                        <li>
                            <a href="/customers/products" className="transition hover:text-blue-600">
                                Shipping & Returns
                            </a>
                        </li>
                        <li>
                            <a href="/my-orders" className="transition hover:text-blue-600">
                                Order Tracking
                            </a>
                        </li>
                        <li>
                            <a href="#" className="transition hover:text-blue-600">
                                Privacy Policy
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h2 className="mb-1 text-lg font-semibold text-purple-900">Stay Updated</h2>
                    <form className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 rounded-lg border border-gray-300 bg-gray-200 py-1 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button className="rounded-lg bg-purple-500 px-4 py-2 text-sm text-white transition hover:bg-purple-300">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="py-2 text-center text-sm text-gray-500">&copy; {new Date().getFullYear()} MediSupply. All rights reserved.</div>
        </footer>
    );
}
