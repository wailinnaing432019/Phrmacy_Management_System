import { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Player } from "@lottiefiles/react-lottie-player";
import { FcGoogle } from "react-icons/fc";

const LoginComponent = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/login"); // Laravel login route
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* LEFT SIDE – Login Card */}
                <div className="w-full bg-card rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <img
                            src="/icon.png"
                            alt="Logo"
                            className="w-36 h-20 mx-auto  mb-4"
                        />
                        <h2 className="text-2xl font-heading text-foreground mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to continue</p>
                    </div>

                    <a href={route('google.redirect')} className="w-full flex items-center justify-center gap-3 bg-white border border-border rounded-lg py-3 px-4 text-foreground hover:bg-secondary transition-all duration-300 ease-in-out transform hover:scale-[1.02] mb-6">
                        <FcGoogle className="text-xl" />
                        <span>Continue with Google</span>
                    </a>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <div className="relative">
                                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    placeholder="Enter your email"
                                    className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-destructive' : 'border-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-secondary transition-all duration-300`}
                                />
                            </div>
                            {errors.email && <p className="mt-2 text-sm text-destructive">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative">
                                <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    placeholder="Enter your password"
                                    className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-destructive' : 'border-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-secondary transition-all duration-300`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-destructive">{errors.password}</p>}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData("remember", e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-ring"
                                />
                                <span className="text-sm text-foreground">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                <Link href={route('password.request')}>
                                    Forgot password?</Link>
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?
                        <button className="ml-1 text-primary hover:text-primary/80 transition-colors">
                            <Link href={route('register')}>Sign up</Link>
                        </button>
                    </p>
                </div>

                {/* RIGHT SIDE – Animation */}
                <div className="hidden md:flex items-center justify-center">
                    <Player
                        autoplay
                        loop
                        src="https://assets9.lottiefiles.com/packages/lf20_3rwasyjy.json"
                        style={{ height: "320px", width: "320px" }}
                        className="pointer-events-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginComponent;
