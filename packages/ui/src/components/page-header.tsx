import { cn } from "../utils";
import * as React from "react";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title?: string | null
    description?: React.ReactNode;
    backgroundImage?: string;
    children?: React.ReactNode;
}

export function PageHeader({
    title,
    description,
    backgroundImage,
    className,
    children,
    ...props
}: PageHeaderProps) {
    if (backgroundImage) {
        return (
            <div
                className={cn(
                    "relative w-full py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden bg-gray-900",
                    className
                )}
                {...props}
            >
                {/* Background Image/Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
                <div className="absolute inset-0 z-10 bg-black/60" />

                {/* Content */}
                <div className="relative z-20 container mx-auto px-4 max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {title && <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight break-keep">
                        {title}
                    </h1>}
                    {description && (
                        <p className="text-lg md:text-xl text-gray-200 leading-relaxed break-keep max-w-2xl mx-auto">
                            {description}
                        </p>
                    )}
                    {children && (
                        <div className="pt-6">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full pt-10 md:pt-12 pb-6 flex flex-col items-center justify-center text-center bg-white border-b border-gray-100",
                className
            )}
            {...props}
        >
            <div className="container mx-auto px-4 max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {title && <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight break-keep">
                    {title}
                </h1>}
                {title && <div className="w-16 h-1 bg-gray-900 mx-auto" />}
                {description && (
                    <div className="text-base text-gray-500 leading-relaxed break-keep max-w-2xl mx-auto">
                        {description}
                    </div>
                )}
                {children && (
                    <div className="pt-2">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
