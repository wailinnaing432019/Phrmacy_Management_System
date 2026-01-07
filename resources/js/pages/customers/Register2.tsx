import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaHospital, FaUserMd } from "react-icons/fa";
import { Player } from "@lottiefiles/react-lottie-player";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const RegistrationForm = () => {
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: "",
        pharmacy: "",
        insurance: ""
    });

    const [errors, setErrors] = useState({});
    const [animationState, setAnimationState] = useState("idle");

    const validateForm = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    newErrors.email = "Please enter a valid email address";
                    setAnimationState("confused");
                } else {
                    delete newErrors.email;
                    setAnimationState("thumbsUp");
                }
                break;

            case "password":
                const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
                if (!passwordRegex.test(value)) {
                    newErrors.password = "Password must be at least 8 characters with letters and numbers";
                    setAnimationState("concerned");
                } else {
                    delete newErrors.password;
                    setAnimationState("impressed");
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateForm(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Object.keys(errors).length === 0) {
            setAnimationState("celebrate");
            console.log("Form submitted:", formData);
        } else {
            setAnimationState("sympathy");
        }
    };

    return (
        <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg shadow-lg p-8"
                >
                    <div className="flex items-center justify-center mb-8">
                        <img
                            src="https://api.logo.com/api/v2/images?design=lg_g2I8I6vfS4uoshqtWb&u=a5bfc8b4cc130aaa56385ffbed2abff6692d63122e516c89fa7a00f072e68bb8&width=1600&height=900&margins=300&fit=contain&format=webp&quality=60&tightBounds=true"
                            alt=""
                            className="h-[80px] w-52"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="order-2 md:order-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1   gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground">First Name</label>
                                        <div className="mt-1 relative">
                                            <input
                                                type="text"
                                                name="firstName"
                                                required
                                                className="w-full px-4 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                                onChange={handleChange}
                                                value={formData.firstName}
                                            />
                                            <FaUser className="absolute right-3 top-3 text-muted-foreground" />
                                        </div>
                                    </div>


                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground">Email Address</label>
                                    <div className="mt-1 relative">
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${errors.email ? "border-destructive" : "border-input"}`}
                                            onChange={handleChange}
                                            value={formData.email}
                                        />
                                        <FaEnvelope className="absolute right-3 top-3 text-muted-foreground" />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground">Password</label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            className={`w-full px-4 py-2 border rounded-md focus:border-transparent ${errors.password ? "border-destructive" : "border-input"}`}
                                            onChange={handleChange}
                                            value={formData.password}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        >
                                            {!showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                                    <div className="mt-1 relative">
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
                                            {!showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
                                </div>



                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    Register
                                </button>
                            </form>
                        </div>

                        <div className="order-1 md:order-2 flex items-center justify-center">
                            <Player
                                autoplay
                                loop
                                src="https://assets9.lottiefiles.com/packages/lf20_zw0djhar.json"
                                style={{ height: "300px", width: "300px" }}
                                className="pointer-events-none"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegistrationForm;