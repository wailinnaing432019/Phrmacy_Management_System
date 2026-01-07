// src/Pages/Contact.jsx
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { LocateIcon, Phone } from 'lucide-react';
import { FaEnvelope } from 'react-icons/fa';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function Contact() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        subject: '',
        user_message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/customers/contact', {
            onSuccess: () => {
                toast.success("Message sent successfully!", {
                    description: "We have received your message and will get back to you soon."
                });
                reset();
            },
            onError: () => {
                toast.error("Failed to send message. Please try again later.");
            }
        });
    };

    return (
        <div className="mt-6 bg-neutral-50  mb-24 py-20 px-4 md:px-8 lg:px-16" id='contact'>
            <Toaster position="top-right" richColors />
            <div className="text-center">
                <p className="text-sm text-gray-600 drop-shadow-lg">Contact Us</p>
                <p className="pt-2 text-4xl font-bold text-purple-950">Let's Get In Touch</p>
            </div>

            {/* Contact Information Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="flex flex-col items-center p-6 bg-purple-100 rounded-xl shadow-2xl hover:scale-105">
                    <div className="p-3 bg-purple-300 text-white rounded-full">
                        <LocateIcon className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-lg font-bold text-purple-950">Location</p>
                    <p className="mt-1 text-center text-sm text-gray-700">Yangon, Myanmar</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-purple-300 text-white rounded-xl shadow-2xl hover:scale-105">
                    <div className="p-3 bg-purple-500 rounded-full">
                        <FaEnvelope className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-lg font-bold">Email</p>
                    <p className="mt-1 text-center text-sm">halipharma@gmail.com</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-purple-100 rounded-xl shadow-2xl hover:scale-105">
                    <div className="p-3 bg-purple-300 text-white rounded-full">
                        <Phone className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-lg font-bold text-purple-950">Phone</p>
                    <p className="mt-1 text-center text-sm text-gray-700">+959660785451</p>
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="mt-20 max-w-2xl mx-auto p-8 rounded-xl shadow-2xl bg-white">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>First Name</Label>
                            <Input
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <Input
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        <div>
                            <Label>Subject</Label>
                            <Input
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                            />
                            <InputError message={errors.subject} className="mt-2" />
                        </div>
                    </div>
                    <div className="mt-6">
                        <Label>Message</Label>
                        <Textarea
                            value={data.user_message}
                            onChange={(e) => setData('user_message', e.target.value)}
                            placeholder="Type your message here..."
                            className="min-h-[150px]"
                        />
                        <InputError message={errors.user_message} className="mt-2" />
                    </div>
                    <div className="mt-8 text-center">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg"
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Sending...
                                </div>
                            ) : "Send Message"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
