import { Link } from '@inertiajs/react';
import { NavItem } from '@/types';
import { LayoutDashboard, ShoppingCart, Receipt } from 'lucide-react';

const cashierNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/cashier/dashboard', icon: LayoutDashboard },
    { title: 'Sale', href: '/cashier/sale', icon: ShoppingCart },
    { title: 'POS', href: '/cashier/pos', icon: Receipt },
];

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: { title: string; href: string }[];
}

export default function CashierAppLayout({ children, breadcrumbs }: AppLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Top Navbar */}
            <nav className="bg-white shadow px-6 py-3 flex items-center justify-between">
                <div className="text-lg font-bold uppercase">HelixPharma</div>

                <ul className="flex space-x-6">
                    {cashierNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="bg-gray-50 px-6 py-2 text-sm text-gray-500">
                    {breadcrumbs.map((bc, idx) => (
                        <span key={bc.href}>
                            <Link href={bc.href} className="hover:underline">{bc.title}</Link>
                            {idx < breadcrumbs.length - 1 && ' / '}
                        </span>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 px-6 py-4">
                {children}
            </main>
        </div>
    );
}
