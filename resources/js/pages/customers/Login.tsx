import { Eye, EyeClosed, Loader } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
// import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const emailRef = useRef(null);

    const emailDomains = ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com"];

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "email" && !value.includes("@")) {
            const newSuggestions = emailDomains.map(domain => value + domain);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }

        // Real-time validation
        if (name === "email") {
            if (!validateEmail(value)) {
                setErrors(prev => ({ ...prev, email: "Invalid email format" }));
            } else {
                setErrors(prev => ({ ...prev, email: undefined }));
            }
        }

        if (name === "password") {
            if (value.length < 8) {
                setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }));
            } else {
                setErrors(prev => ({ ...prev, password: undefined }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!errors.email && !errors.password) {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({ ...prev, email: suggestion }));
        setSuggestions([]);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:scale-[1.01]">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome Back</h2>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="relative">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <input
                            ref={emailRef}
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter your email"
                            aria-invalid={errors.email ? "true" : "false"}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            autoComplete="email"
                        />
                        {errors.email && (
                            <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                                {errors.email}
                            </p>
                        )}
                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Enter your password"
                                aria-invalid={errors.password ? "true" : "false"}
                                aria-describedby={errors.password ? "password-error" : undefined}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeClosed /> : <Eye />}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" className="mt-1 text-sm text-red-500" role="alert">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || Object.keys(errors).length > 0}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all transform active:scale-[0.98] ${isLoading || Object.keys(errors).length > 0 ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <Loader className="animate-spin mr-2" />
                                Logging in...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;