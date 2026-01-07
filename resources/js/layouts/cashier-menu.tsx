import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { router, usePage } from "@inertiajs/react";
import { Home, LayoutDashboard, Receipt, ShoppingCart, CircleUserRound, LogOut } from "lucide-react";
import { Toaster } from "sonner";

const cashierNavItems = [
    { title: 'Dashboard', href: '/cashier/dashboard', icon: LayoutDashboard },
    { title: 'Sale', href: '/cashier/sale', icon: ShoppingCart },
    { title: 'POS', href: '/cashier/pos', icon: Receipt },
];

export default function CashierMenu() {
    const { url, props } = usePage();
    const userName = props.auth.user.name;

    const currentPath = typeof url === 'string' ? url : window.location.pathname;

    return (
        <Menubar className="w-full flex justify-between items-center px-4 py-4 border-b bg-white shadow">
            {/* Home */}

            <MenubarMenu>
                <a href="/cashier/dashboard">
                    <MenubarTrigger
                        className={`flex items-center space-x-2 px-2 py-1 rounded  
                            }`}
                    >
                        {/* <Home className="h-5 w-5" /> */}
                        <img src="/icon.png" className="h-6 w-6" />
                        <span><img src="/helixpharma-logo.png" alt="" className="w-[80px] h-[25px]" /></span>
                    </MenubarTrigger>
                </a>
            </MenubarMenu>

            {/* Nav Items */}
            <div className="flex items-center space-x-4">
                <Toaster position="top-right" richColors />
                {cashierNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');

                    return (
                        <MenubarMenu key={item.href}>
                            <a href={item.href}>
                                <MenubarTrigger
                                    className={`flex items-center space-x-2 px-2 py-1 rounded ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </MenubarTrigger>
                            </a>
                        </MenubarMenu>
                    );
                })}

                {/* User Menu */}
                <MenubarMenu>
                    <MenubarTrigger className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100">
                        <CircleUserRound className="h-5 w-5" />
                        <span>{userName}</span>
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={() => router.post('/logout')}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </div>
        </Menubar>
    );
}
