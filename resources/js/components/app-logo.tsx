import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5 overflow-hidden py-1">
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200/60 p-1">
                <AppLogoIcon className="size-full" />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-base tracking-tight text-foreground">
                    Helix<span className="text-primary font-extrabold">Pharma</span>
                </span>
                <span className="truncate text-[11px] font-medium text-muted-foreground">Pharmacy Management</span>
            </div>
        </div>
    );
}
