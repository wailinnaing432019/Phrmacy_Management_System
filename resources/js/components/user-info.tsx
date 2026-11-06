import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();
    const role = (user as any)?.role || 'staff';

    return (
        <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 font-semibold text-white text-xs">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight">
                <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-foreground text-sm">{user.name}</span>
                    <span className="rounded bg-teal-500/10 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                        {role}
                    </span>
                </div>
                {showEmail ? (
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                ) : (
                    <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
                )}
            </div>
        </div>
    );
}
