import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type NavItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Receipt,
    RotateCcw,
    ShoppingCart,
} from 'lucide-react';
import React from 'react';
import { Toaster } from 'sonner';

const cashierNavItems: NavItem[] = [
    {
        title: 'POS Terminal',
        href: '/cashier/pos',
        icon: Receipt,
    },
    {
        title: 'Sale Records',
        href: '/cashier/sale',
        icon: ShoppingCart,
    },
    {
        title: 'Returns',
        href: '/returns',
        icon: RotateCcw,
    },
    {
        title: 'Dashboard',
        href: '/cashier/dashboard',
        icon: LayoutDashboard,
    },
];

interface CashierAppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItemType[];
}

export default function CashierAppLayout({ children, breadcrumbs = [] }: CashierAppLayoutProps) {
    const { url } = usePage();
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const user = auth?.user || { name: 'Cashier', email: 'cashier@pharmacy.com' };
    const currentPath = typeof url === 'string' ? url : window.location.pathname;

    const isLinkActive = (href: string) => {
        if (href === '/cashier/dashboard') {
            return currentPath === href;
        }
        return currentPath === href || currentPath.startsWith(href + '/');
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Toaster position="top-right" richColors />

            {/* Top Navigation Bar Only (No Left Sidebar) */}
            <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md shadow-xs">
                <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-6">
                        <Link href="/cashier/pos" className="flex items-center gap-2.5">
                            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200/60 p-1">
                                <AppLogoIcon className="size-full" />
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <img src="/helixpharma-logo.png" alt="HelixPharma" className="h-6 w-auto object-contain dark:brightness-125" />
                                <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-teal-700 dark:text-teal-300">
                                    Cashier POS
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="flex items-center gap-1">
                            {cashierNavItems.map((item) => {
                                const Icon = item.icon;
                                const active = isLinkActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                                            active
                                                ? 'bg-teal-500/15 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 shadow-xs'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }`}
                                    >
                                        {Icon && (
                                            <Icon
                                                className={`size-4 ${
                                                    active
                                                        ? 'text-teal-600 dark:text-teal-400'
                                                        : 'text-muted-foreground/80'
                                                }`}
                                            />
                                        )}
                                        <span className="hidden md:inline">{item.title}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Tools: Status, Theme, Cashier Profile */}
                    <div className="flex items-center gap-2.5 sm:gap-4">
                        {/* Status Pill */}
                        <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                            </span>
                            <span>Register Active</span>
                        </div>

                        {/* Theme Toggle */}
                        <AppearanceToggleDropdown />

                        <div className="h-5 w-px bg-border" />

                        {/* Cashier User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 p-1.5 hover:bg-accent rounded-lg"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-lg border border-border">
                                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-semibold text-xs">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden sm:grid text-left text-xs leading-tight">
                                        <span className="truncate font-semibold text-foreground">{user.name}</span>
                                        <span className="text-[10px] text-muted-foreground">Cashier</span>
                                    </div>
                                    <ChevronDown className="size-3.5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                    <LogOut className="mr-2 size-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Breadcrumbs (if any) */}
            {breadcrumbs.length > 0 && (
                <div className="border-b border-border/50 bg-muted/30 px-4 py-2 sm:px-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            )}

            {/* Main Page Content */}
            <main className="flex-1 w-full p-4 sm:p-6 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
