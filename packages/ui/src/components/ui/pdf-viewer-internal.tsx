"use client";

import { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from "../../utils";
import { Button } from "./button";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, BookOpen, MoveHorizontal, Maximize } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Setup worker
// Use local worker file copied to public folder to avoid CDN issues and ensure version match.
// Using .mjs as per pdfjs-dist v5 build structure.
if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PdfViewerProps extends React.HTMLAttributes<HTMLDivElement> {
    url: string | null;
    title?: string;
}

export default function PdfViewerInternal({ url, title, className, ...props }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isDoublePage, setIsDoublePage] = useState(false);
    const [zoomMode, setZoomMode] = useState<'manual' | 'fit-width' | 'fit-height'>('fit-height');
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef) return;

        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setContainerSize({
                    width: entries[0].contentRect.width,
                    height: entries[0].contentRect.height,
                });
            }
        });

        observer.observe(containerRef);
        return () => observer.disconnect();
    }, [containerRef]);

    // Calculate scale or fixed dimensions based on zoomMode
    // Using 48px as padding buffer (24px each side)
    const padding = 48;
    const gap = 16;
    
    // Determine number of pages to show
    const showDouble = isDoublePage && (numPages || 0) > 1;

    const renderProps = useMemo(() => {
        if (zoomMode === 'manual') return { scale };
        
        const availableWidth = containerSize.width - padding;
        const availableHeight = containerSize.height - padding;

        if (zoomMode === 'fit-width') {
            const width = showDouble ? (availableWidth - gap) / 2 : availableWidth;
            return { width: Math.max(width, 200) };
        }
        
        if (zoomMode === 'fit-height') {
            return { height: Math.max(availableHeight, 200) };
        }

        return { scale };
    }, [zoomMode, scale, containerSize, showDouble]);

    // NOTE: isClient check is technically redundant if this component is lazy loaded, but strict mode might mount it twice.

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const options = useMemo(() => ({
        cMapUrl: '/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/standard_fonts/',
        wasmUrl: '/',
    }), []);

    function changePage(offset: number) {
        const step = showDouble ? 2 : 1;
        setPageNumber(prevPageNumber => {
            const next = prevPageNumber + (offset * step);
            return Math.min(Math.max(1, next), numPages || 1);
        });
    }

    const toggleDoublePage = () => {
        setIsDoublePage(prev => !prev);
        // Reset to manual if we were in a fit mode to avoid weird jumps or just keep it?
        // Let's keep zoomMode, the useMemo handles the recalculation
    };

    if (!url) {
        return (
            <div className={cn("flex items-center justify-center min-h-[400px] bg-gray-100 rounded-md border border-dashed", className)} {...props}>
                <p className="text-gray-500 text-sm">PDF 파일이 선택되지 않았습니다.</p>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col bg-gray-50 h-full", className)} {...props}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 bg-white border-b shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium hidden sm:inline-block w-20 truncate" title={title || "PDF"}>
                        {title || "PDF"}
                    </span>
                    <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs w-16 text-center tabular-nums">
                            {pageNumber} / {numPages || '-'}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => changePage(1)}
                            disabled={showDouble ? (pageNumber + 1 >= (numPages || 1)) : (pageNumber >= (numPages || 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => { setZoomMode('manual'); setScale(1.0); }}
                            title="원본 비율(100%)"
                        >
                            <span className="text-[10px] font-bold">1:1</span>
                        </Button>
                        <Button 
                            variant={zoomMode === 'fit-width' ? "secondary" : "ghost"} 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => setZoomMode('fit-width')}
                            title="너비 맞춤"
                        >
                            <MoveHorizontal className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={zoomMode === 'fit-height' ? "secondary" : "ghost"} 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => setZoomMode('fit-height')}
                            title="높이 맞춤"
                        >
                            <Maximize className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={isDoublePage ? "secondary" : "ghost"} 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={toggleDoublePage}
                            title="2페이지 보기"
                        >
                            <BookOpen className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setZoomMode('manual'); setScale(s => Math.max(0.2, s - 0.1)); }}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs w-12 text-center tabular-nums">{Math.round(scale * 100)}%</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setZoomMode('manual'); setScale(s => Math.min(3.0, s + 0.1)); }}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>

                    <a
                        href={url}
                        download
                        className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium hover:bg-gray-100 text-gray-700"
                        title="다운로드"
                    >
                        <Download className="h-4 w-4" />
                    </a>
                </div>
            </div>

            {/* Document Area */}
            <div 
                ref={setContainerRef}
                className="flex-1 overflow-auto flex justify-center p-4 min-h-0 bg-gray-100/50"
            >
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(err) => console.error("PDF Load Error:", err)}
                    loading={
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <p className="text-red-500 font-medium mb-2">문서를 불러오는데 실패했습니다.</p>
                            <a href={url} download className="text-blue-600 hover:underline text-sm">파일 직접 다운로드</a>
                        </div>
                    }
                    className={cn("bg-transparent flex gap-4 items-start", showDouble ? "justify-start" : "justify-center")}
                    options={options}
                >
                    <div className={cn("flex gap-4 items-start", showDouble ? "flex-row" : "flex-col")}>
                        <Page
                            pageNumber={pageNumber}
                            {...renderProps}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="bg-white shadow-lg"
                        />
                        {showDouble && pageNumber + 1 <= (numPages || 0) && (
                            <Page
                                pageNumber={pageNumber + 1}
                                {...renderProps}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="bg-white shadow-lg"
                            />
                        )}
                    </div>
                </Document>
            </div>
        </div>
    )
}
