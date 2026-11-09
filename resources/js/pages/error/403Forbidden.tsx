import TextLink from '@/components/text-link';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CashierMenu from '@/layouts/cashier-menu';

function ForbiddenContent() {
    const { auth } = usePage().props;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-6">
            <h1 className="text-6xl font-bold text-rose-600">403</h1>
            <p className="text-xl font-semibold text-slate-800">Access Denied</p>
            <p className="text-sm text-slate-500 max-w-sm">You do not have permission to access this resource or page.</p>

            {auth?.user?.role === "admin" && (
                <TextLink href={route('dashboard')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90">
                    Back to Dashboard
                </TextLink>
            )}

            {auth?.user?.role === "cashier" && (
                <TextLink href={route('cashier.pos')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90">
                    Back to POS Terminal
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
            <div className="min-h-screen bg-slate-50">
                <Head title="403 Forbidden" />
                <CashierMenu />
                <ForbiddenContent />
            </div>
        );
    }

    // fallback
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Head title="403 Forbidden" />
            <ForbiddenContent />
        </div>
    );
}
