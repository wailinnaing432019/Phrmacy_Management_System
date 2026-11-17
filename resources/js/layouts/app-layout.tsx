import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import CashierAppLayout from '@/layouts/cashier-app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode, useEffect } from 'react';
import { Toaster, toast } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    [key: string]: unknown;
}

export default function AppLayout({ children, breadcrumbs = [], ...props }: AppLayoutProps) {
    const pageProps = usePage<SharedData>().props as {
        flash?: {
            success?: string;
            error?: string;
            sale_id?: string;
        };
        auth?: {
            user?: {
                role?: string;
                [key: string]: unknown;
            };
        };
    };

    const flash = pageProps.flash;
    const isCashier = pageProps.auth?.user?.role === 'cashier';

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Cashier portal: Top Navigation only, no left sidebar
    if (isCashier) {
        return (
            <CashierAppLayout breadcrumbs={breadcrumbs} {...props}>
                <Toaster position="top-right" richColors />
                {children}
            </CashierAppLayout>
        );
    }

    // Admin portal: Left Sidebar navigation
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <Toaster position="top-right" richColors />
            {children}
        </AppLayoutTemplate>
    );
}
