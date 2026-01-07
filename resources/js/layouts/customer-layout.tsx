import { CardContent } from "@/components/ui/card";
import AboutUs from "./app/customers/Aboutus";
import Ads from "./app/customers/Ads";
import Contact from "./app/customers/Contact";
import Footer from "./app/customers/Footer";
import Navbar from "./app/customers/Navbar";
import { Toaster } from "sonner";



export default function CustomerLayout({ children }) {
    return (
        <div className="m-1   shadow-xl min-h-screen flex flex-col">
            <main className="flex-1">
                <Toaster position="top-right" richColors />
                <Navbar />
                {children}
            </main>
            <Footer />
        </div>
    );
}