import TextLink from '@/components/text-link';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CustomerLayout from '@/layouts/customer-layout';
import CashierMenu from '@/layouts/cashier-menu';

function ForbiddenContent() {
    const { auth } = usePage().props;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
            <h1 className="text-6xl font-bold text-red-600">403</h1>
            <p className="text-xl">You do not have permission to access this page.</p>

            {auth?.user?.role === "admin" && (
                <TextLink href={route('dashboard')} className="btn bg-red-500 p-2 rounded-xl">
                    Go Back
                </TextLink>
            )}

            {auth?.user?.role === "cashier" && (
                <TextLink href={route('cashier.pos')} className="btn bg-red-500 p-2 rounded-xl">
                    Go Back
                </TextLink>
            )}

            {auth?.user?.role === "user" && (
                <TextLink href={route('customers.index')} className="btn bg-red-500 p-2 rounded-xl">
                    Go Back
                </TextLink>
            )}
        </div>
    );
}

export default function Forbidden() {
    const { auth } = usePage().props;

    if (auth?.user?.role === 'admin') {
        return (
            <AppLayout>
                <Head title="403 Forbidden" />
                <ForbiddenContent />
            </AppLayout>
        );
    }

    if (auth?.user?.role === 'cashier') {
        return (
            <div className="min-h-screen bg-gray-100">
                <Head title="403 Forbidden" />
                <CashierMenu />
                <ForbiddenContent />
            </div>
        );
    }

    if (auth?.user?.role === 'user') {
        return (
            <CustomerLayout>
                <Head title="403 Forbidden" />
                <ForbiddenContent />
            </CustomerLayout>
        );
    }

    // fallback (no auth or unknown role)
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Head title="403 Forbidden" />
            <ForbiddenContent />
        </div>
    );
}
