import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    Pill,
    Receipt,
    RotateCcw,
    ShoppingCart,
    Tag,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const adminNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Pharmacy Catalog',
        items: [
            {
                title: 'Medicines',
                href: '/medicines',
                icon: Pill,
            },
            {
                title: 'Categories',
                href: '/categories',
                icon: Tag,
            },
        ],
    },
    {
        title: 'Sales & Operations',
        items: [
            {
                title: 'Sales History',
                href: '/sales',
                icon: ShoppingCart,
            },
            {
                title: 'Customer Orders',
                href: '/orders',
                icon: Package,
            },
            {
                title: 'Sales Returns',
                href: '/returns',
                icon: RotateCcw,
            },
        ],
    },
    {
        title: 'Administration',
        items: [
            {
                title: 'Staff & Users',
                href: '/users',
                icon: Users,
            },
        ],
    },
];

const cashierNavGroups: NavGroup[] = [
    {
        title: 'Operations',
        items: [
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
        ],
    },
    {
        title: 'Overview',
        items: [
            {
                title: 'Cashier Dashboard',
                href: '/cashier/dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as { auth?: { user?: { role?: string } } };
    const userRole = auth?.user?.role || 'user';

    const navGroups = userRole === 'cashier' ? cashierNavGroups : adminNavGroups;

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border/80 bg-sidebar">
            <SidebarHeader className="border-b border-sidebar-border/60 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-2">
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 pt-2">
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
