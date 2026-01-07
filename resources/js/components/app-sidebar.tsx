import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutDashboard, LayoutGrid, SaladIcon, Sandwich, Receipt } from 'lucide-react';
import {
    Syringe,
    Tag,
    ShoppingCart,
    Package,
    Users,
    BarChart,
} from 'lucide-react';
import AppLogo from './app-logo';
import { Sankey } from 'recharts';
const cashierNavItems: NavItem[] = [
    {
        title: 'Cashboard Dashboard',
        href: '/cashier/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'Sale',
        href: '/cashier/sale',
        icon: ShoppingCart, // Changed from SaladIcon
    },
    {
        title: 'POS',
        href: '/cashier/pos',
        icon: Receipt, // Changed from Sandwich
    }
]
const adminNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard, // Changed from LayoutGrid
    },
    {
        title: 'Category',
        href: '/categories',
        icon: Tag, // Changed from LayoutGrid
    },
    {
        title: 'Medicine',
        href: '/medicines',
        icon: Syringe, // Changed from LayoutGrid
    },

    {
        title: 'Orders',
        href: '/orders',
        icon: Package, // Changed from LayoutGrid
    },

    {
        title: 'Sales',
        href: '/sales',
        icon: ShoppingCart, // Changed from LayoutGrid
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users, // Changed from LayoutGrid
    },
    // {
    //     title: 'Reports',
    //     href: '/reports', // Changed href to a more descriptive path
    //     icon: BarChart, // Changed from LayoutGrid
    // }
];


const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role || 'user';

    let roleBasedNavItems: NavItem[] = [];

    if (userRole == "admin") {
        roleBasedNavItems = adminNavItems;
    }
    if (userRole == "cashier") {
        roleBasedNavItems = cashierNavItems;
    }
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={roleBasedNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
