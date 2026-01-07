import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        dob: ""
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateField = (name, value) => {
        switch (name) {
            case "email":
                return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : "";
            case "password":
                return value.length < 8 ? "Password must be at least 8 characters" : "";
            case "confirmPassword":
                return value !== formData.password ? "Passwords do not match" : "";
            case "phone":
                return value && !/^\d{10}$/.test(value) ? "Invalid phone number" : "";
            default:
                return value.trim() === "" ? "This field is required" : "";
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            // API call simulation
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log("Form submitted:", formData);
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid md:grid-cols-2 bg-card rounded-lg shadow-lg overflow-hidden">
                <div className="hidden md:block bg-primary p-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80" />
                    <img
                        src="https://images.unsplash.com/photo-1512486130939-2c4f79935e4f"
                        alt="Registration"
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>

                <div className="p-8 lg:p-12">
                    <h1 className="text-heading font-heading text-foreground mb-6">Create Account</h1>
                    <p className="text-muted-foreground mb-8">Join our community and start your journey</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.firstName ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-2 focus:ring-ring`}
                                />
                                {errors.firstName && <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.lastName ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-2 focus:ring-ring`}
                                />
                                {errors.lastName && <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-2 focus:ring-ring`}
                            />
                            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-2 focus:ring-ring`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-2 focus:ring-ring`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Phone (Optional)</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 rounded-lg border ${errors.phone ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-2 focus:ring-ring`}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Date of Birth (Optional)</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className="rounded border-input text-primary focus:ring-ring"
                            />
                            <label htmlFor="terms" className="text-sm text-muted-foreground">
                                I agree to the <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-input"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <button
                                type="button"
                                className="flex items-center justify-center py-2 px-4 border border-input rounded-lg hover:bg-muted transition-colors"
                            >
                                <FcGoogle size={24} />
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center py-2 px-4 border border-input rounded-lg hover:bg-muted transition-colors"
                            >
                                <FaApple size={24} />
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center py-2 px-4 border border-input rounded-lg hover:bg-muted transition-colors"
                            >
                                <FaFacebook size={24} className="text-blue-600" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;