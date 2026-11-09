import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5 overflow-hidden py-1">
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200/60 p-1">
                <AppLogoIcon className="size-full" />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <img
                    src="/helixpharma-logo.png"
                    alt="HelixPharma"
                    className="h-6 w-auto object-contain dark:brightness-125"
                />
            </div>
        </div>
    );
}
