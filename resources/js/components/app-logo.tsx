import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md   text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5   " />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <img
                    src="\helixpharma-logo.png"
                    alt="Logo"
                    className="w-60 h-8 mx-auto  mb-4"
                />
            </div>
        </>
    );
}
