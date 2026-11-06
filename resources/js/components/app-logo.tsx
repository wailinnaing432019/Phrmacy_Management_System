import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5 overflow-hidden py-1">
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm shadow-teal-600/25">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base tracking-tight text-foreground">HelixPharma</span>
                    <span className="inline-flex items-center rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                        v2.0
                    </span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">Pharmacy Management</span>
            </div>
        </div>
    );
}
