// src/App.js
import { useState } from 'react';

export default function Index() {
    const navLinks = [{ name: 'detail', href: '#productDetail', id: 'detail' }];
    const items = [
        { id: 1, text: 'Item 1', color: 'bg-red-400', src: 'https://i.pinimg.com/1200x/5e/e3/dc/5ee3dc1e1d4b5b5b2d70f47809feaa04.jpg' },
        { id: 2, text: 'Item 2', color: 'bg-blue-400' },
        { id: 3, text: 'Item 3', color: 'bg-green-400' },
        { id: 4, text: 'Item 4', color: 'bg-yellow-400' },
        { id: 5, text: 'Item 5', color: 'bg-pink-400' },
    ];
    const [quantity, setQuantity] = useState(1);

    const increase = () => setQuantity((prev) => prev + 1);
    const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    return (
        <>
            <div className="h-1vh m-1 mt-[2px] bg-neutral-50 shadow-2xl">
                <div className="h-[800px] w-full shadow-2xl">
                    <div className="flex justify-center">
                        <div className="my-4 ml-3 flex h-[500px] shadow-lg">
                            <div className="h-[500px] w-[210px] items-center overflow-hidden bg-blue-50 shadow-lg">
                                <div className="flex h-[250px] w-[200px] items-center overflow-hidden border-b-1 border-b-gray-500 bg-blue-50 shadow-lg">
                                    <img src="https://i.pinimg.com/736x/ba/f7/4c/baf74c58f6caf87de89008a311a75e62.jpg" alt="" />
                                </div>
                                <div className="mt-1 flex h-[250px] w-[200px] items-center overflow-hidden border-t-1 border-t-gray-500 bg-blue-50 shadow-lg">
                                    <img src="https://i.pinimg.com/736x/ba/f7/4c/baf74c58f6caf87de89008a311a75e62.jpg" alt="" />
                                </div>
                            </div>
                            <div className="flex h-[500px] w-[400px] items-center overflow-hidden bg-blue-50 shadow-lg">
                                <img src="https://i.pinimg.com/736x/ba/f7/4c/baf74c58f6caf87de89008a311a75e62.jpg" alt="" />
                            </div>
                        </div>
                        <div className="my-4 h-[500px] w-[700px] bg-neutral-50 py-5 pr-3 shadow-2xl">
                            <div className="ms-5 mt-3">
                                <p>
                                    Viewer : <span className="fw-bold text-purple-900">3</span>
                                </p>
                                <p>
                                    Availability : <span className="fw-bold text-purple-900">In Stock</span>
                                </p>
                                <p>
                                    Category : <span className="fw-bold text-purple-900">Fever, Pain & Inflammation</span>
                                </p>
                                <p className="fw-bold mt-7 text-purple-950" style={{ fontSize: 25 }}>
                                    Oardiance -25mg
                                </p>
                                <p className="fw-bold mt-2" style={{ fontSize: 20 }}>
                                    Price - <span>3000</span>mmk
                                </p>
                                <p className="fw-bold mt-2 text-gray-500" style={{ fontSize: 14 }}>
                                    <span className="text-purple-900">Direction :</span>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Quisquam, voluptatibus!
                                </p>
                                <div className="mt-12 flex gap-7">
                                    <div className="">
                                        <p className="mb-1 text-[18px] font-medium">Quantity</p>
                                        <div className="w-[200px] rounded-xl bg-gray-200 px-2 py-1">
                                            <div className="flex space-x-8">
                                                {/* Decrease Button */}
                                                <button
                                                    onClick={decrease}
                                                    className="flex h-7 w-10 items-center justify-center rounded-md bg-gray-300 font-bold text-purple-900 transition hover:bg-gray-300"
                                                >
                                                    -
                                                </button>

                                                {/* Quantity Display */}
                                                <span className="mt-1 w-10 text-center font-medium">{quantity}</span>

                                                {/* Increase Button */}
                                                <button
                                                    onClick={increase}
                                                    className="flex h-7 w-10 items-center justify-center rounded-md bg-gray-300 font-bold text-purple-900 transition hover:bg-gray-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="">
                                        <p className="mb-1 text-[18px] font-medium">Total Amount</p>
                                        <div className="ms-1 mt-2 flex items-center space-x-2 font-bold text-purple-900">
                                            5000 <span className="ps-2">mmk</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-7 w-[400px] rounded-2xl bg-purple-400 px-2 py-1 text-center font-bold">
                                    <span>icon</span> Add Cart
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10">
                        <p className="text-center text-xl font-bold text-purple-950 drop-shadow-lg">You might also like</p>
                        <div className="ms-32 mt-5 mr-10">
                            <div className="">
                                <div
                                    className="flex animate-[scroll_linear_infinite]"
                                    style={{
                                        animation: 'scroll 20s linear infinite',
                                    }}
                                >
                                    {[...items, ...items].map((item) => (
                                        <div
                                            key={item.id + Math.random()}
                                            className={`m-2 h-40 w-40 justify-center rounded-lg bg-purple-300 font-bold text-white`}
                                        >
                                            <div className="h-full items-center px-2 pt-1">
                                                <div className="mr-1 space-y-1">
                                                    <p className="fw-medium text-black" style={{ fontSize: 10 }}>
                                                        Price-3000mmk
                                                    </p>
                                                    <p className="fw-bold text-center text-purple-950 drop-shadow-lg" style={{ fontSize: 15 }}>
                                                        Vitahome (120's)
                                                    </p>
                                                    <div className="">
                                                        <img src={item.src} alt="" className="h-[55px] w-full" />
                                                    </div>
                                                    <div className="">
                                                        {navLinks.map((link) => (
                                                            <a
                                                                key={link.id}
                                                                href={link.href}
                                                                data-id={link.id}
                                                                onClick={() => {}}
                                                                className="flex cursor-pointer items-center transition-colors hover:text-gray-700"
                                                            >
                                                                <div
                                                                    className="mt-1 flex h-[20px] w-[20px] items-center justify-center rounded-[20px] bg-gray-800 text-white"
                                                                    style={{ fontSize: 10 }}
                                                                >
                                                                    arr
                                                                </div>
                                                                <p className="ms-3 mt-2 text-gray-700 drop-shadow-lg" style={{ fontSize: 10 }}>
                                                                    View More
                                                                </p>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Inline keyframes without tailwind.config.js */}
                                <style>
                                    {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 1s linear infinite;
          }
        `}
                                </style>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
