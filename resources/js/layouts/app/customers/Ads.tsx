import { Link } from "@inertiajs/react";

export default function Ads() {
    return (
        <section className="relative h-[650px]">
            {/* Background image with overlay */}
            <div className="overflow-hidden">
                <img
                    src="/home.png" // Replace with your hero image
                    alt="People working"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="via-light absolute inset-0 bg-gradient-to-r from-blue-800"></div>
            </div>

            {/* Content */}
            <div className="relative container mx-auto flex flex-col items-center px-4 py-24 md:flex-row md:py-32">
                <div className="z-10 ms-20 mt-16 text-white md:w-1/2">
                    <h1 className="text-4xl leading-tight font-bold md:text-5xl">
                        Pharmacy Management System <br /> <span className=""></span>
                    </h1>
                    <p className="mt-4 text-lg opacity-90">
                        We try to provide all your essential medicines at your door within 1 hour after placing orders
                    </p>
                    <div className="mt-24 space-x-4">
                        {/* <button className="rounded-lg bg-white px-6 py-3 font-semibold text-purple-700 hover:bg-gray-100">Explore Services</button> */}
                        <button className="rounded-lg border border-white px-6 py-3 font-semibold hover:bg-white hover:text-blue-700">
                            <Link href="/customers#contact">Contact Us</Link>
                        </button>
                    </div>
                </div>
            </div>

            {/* Wave Shape at Bottom */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="h-20 w-full md:h-28">
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82-16.57,168-17.49,250-0.39,54,11.34,106,30,160,36.73,59,7.37,117-1.27,176-8.43,30-3.67,59-7.74,88-12.38V120H0V16.81C107.7,49.19,214,67.85,321.39,56.44Z"
                        fill="#fafafa"
                    />
                </svg>
            </div>
        </section>
    );
}
