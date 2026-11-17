import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/icon.png"
            alt="HelixPharma Icon"
            className={`object-contain ${className || 'size-full'}`}
            {...props}
        />
    );
}
