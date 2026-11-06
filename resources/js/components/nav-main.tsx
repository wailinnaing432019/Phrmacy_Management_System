import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavMainProps {
    items?: NavItem[];
    groups?: NavGroup[];
}

export function NavMain({ items = [], groups }: NavMainProps) {
    const page = usePage();

    const isItemActive = (href: string) => {
        if (!href) return false;
        if (href === '/dashboard' || href === '/cashier/dashboard') {
            return page.url === href;
        }
        return page.url.startsWith(href);
    };

    // If groups are provided, render structured sections
    if (groups && groups.length > 0) {
        return (
            <div className="flex flex-col gap-2">
                {groups.map((group) => (
                    <SidebarGroup key={group.title} className="px-2 py-1">
                        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 mb-1">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarMenu className="gap-1">
                            {group.items.map((item) => {
                                const active = isItemActive(item.href);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={{ children: item.title }}
                                            className={
                                                active
                                                    ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold border-l-2 border-teal-600 rounded-l-none pl-2.5 transition-all'
                                                    : 'text-muted-foreground hover:text-foreground transition-colors'
                                            }
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && (
                                                    <item.icon
                                                        className={`size-4 ${
                                                            active
                                                                ? 'text-teal-600 dark:text-teal-400'
                                                                : 'text-muted-foreground/80'
                                                        }`}
                                                    />
                                                )}
                                                <span className="text-sm">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </div>
        );
    }

    // Fallback flat item rendering
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Menu
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={
                                    active
                                        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold border-l-2 border-teal-600 rounded-l-none pl-2.5'
                                        : 'text-muted-foreground hover:text-foreground'
                                }
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && (
                                        <item.icon
                                            className={`size-4 ${
                                                active ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground/80'
                                            }`}
                                        />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
