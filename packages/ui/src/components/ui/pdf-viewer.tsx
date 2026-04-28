"use client";

import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from "lucide-react";
import { cn } from "../../utils";

// Lazy load the actual PDF viewer to avoid SSR/Import-time evaluation of DOMMatrix (canvas)
const PdfViewerInternal = lazy(() => import('./pdf-viewer-internal'));

interface PdfViewerProps extends React.HTMLAttributes<HTMLDivElement> {
    url: string | null;
    title?: string;
}

export function PdfViewer({ url, title, className, ...props }: PdfViewerProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className={cn("flex items-center justify-center min-h-[400px] h-full bg-gray-50", className)} {...props}>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className={cn("flex items-center justify-center min-h-[400px] h-full bg-gray-50", className)} {...props}>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        }>
            <PdfViewerInternal url={url} title={title} className={className} {...props} />
        </Suspense>
    );
}
