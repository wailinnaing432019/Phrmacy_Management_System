import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { ExternalLink, Receipt, Store } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 md:px-6">
            {/* Left: Sidebar toggle + Breadcrumbs */}
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                <div className="hidden h-4 w-px bg-border sm:block" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right: Quick actions, Status, Theme switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* System Status Pill */}
                <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span>System Online</span>
                </div>

                {/* Quick Link: POS Terminal */}
                <Link href="/cashier/pos">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 border-teal-500/30 bg-teal-50/50 text-xs font-semibold text-teal-800 hover:bg-teal-100 hover:text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
                    >
                        <Receipt className="size-3.5 text-teal-600 dark:text-teal-400" />
                        <span className="hidden sm:inline">POS Terminal</span>
                    </Button>
                </Link>

                {/* Quick Link: Customer Storefront */}
                <a
                    href="/customers"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open Customer Storefront in new tab"
                >
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Store className="size-3.5" />
                        <span className="hidden md:inline">Storefront</span>
                        <ExternalLink className="size-3 opacity-60" />
                    </Button>
                </a>

                <div className="h-4 w-px bg-border" />

                {/* Appearance Switcher */}
                <AppearanceToggleDropdown />
            </div>
        </header>
    );
}
