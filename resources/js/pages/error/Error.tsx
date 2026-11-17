import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    AlertTriangle,
    ArrowLeft,
    FileQuestion,
    Home,
    RotateCcw,
    ServerCrash,
    ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    status?: number;
    message?: string;
}

export default function ErrorPage({ status = 500, message }: ErrorProps) {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role;

    const errorDetails: Record<number, { title: string; description: string; icon: any; color: string }> = {
        403: {
            title: 'Access Forbidden',
            description: message || 'You do not have administrative permission to access this page or resource.',
            icon: ShieldAlert,
            color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
        },
        404: {
            title: 'Page Not Found',
            description: message || 'The page or resource you are looking for does not exist or may have been relocated.',
            icon: FileQuestion,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50',
        },
        500: {
            title: 'Internal Server Error',
            description: message || 'An unexpected error occurred while processing your request. Our system has logged this incident.',
            icon: ServerCrash,
            color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
        },
        503: {
            title: 'Service Temporarily Unavailable',
            description: message || 'The pharmacy system is currently undergoing maintenance or is temporarily overloaded. Please check back shortly.',
            icon: AlertTriangle,
            color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50',
        },
    };

    const currentError = errorDetails[status] || errorDetails[500];
    const IconComponent = currentError.icon;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-foreground">
            <Head title={`${status} — ${currentError.title}`} />

            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 text-center flex flex-col items-center">
                {/* Icon Badge */}
                <div className={`size-16 rounded-2xl border flex items-center justify-center mb-6 shadow-xs ${currentError.color}`}>
                    <IconComponent className="size-8" />
                </div>

                {/* Status Code */}
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 mb-3">
                    Error {status}
                </span>

                {/* Title */}
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl mb-2">
                    {currentError.title}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm">
                    {currentError.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                    {userRole === 'admin' && (
                        <Link href={route('dashboard')} className="w-full sm:flex-1">
                            <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2">
                                <Home className="size-4" />
                                <span>Admin Dashboard</span>
                            </Button>
                        </Link>
                    )}

                    {userRole === 'cashier' && (
                        <Link href={route('cashier.pos')} className="w-full sm:flex-1">
                            <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2">
                                <Home className="size-4" />
                                <span>POS Terminal</span>
                            </Button>
                        </Link>
                    )}

                    {!userRole && (
                        <Link href={route('login')} className="w-full sm:flex-1">
                            <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2">
                                <ArrowLeft className="size-4" />
                                <span>Back to Login</span>
                            </Button>
                        </Link>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto h-10 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                        <RotateCcw className="size-3.5" />
                        <span>Retry</span>
                    </Button>
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-6 text-center">
                HelixPharma Pharmacy Management System &bull; Secure Healthcare Platform
            </p>
        </div>
    );
}
