import { useEffect, useState, useRef } from "react";
import { Link, useFetcher } from "react-router";
import { cn } from "@repo/ui/utils";
import { Button } from "@repo/ui";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface NewsletterItem {
    id: string;
    title: string;
    issue_number: number;
    created_at: string;
    thumbUrl?: string;
}

interface LatestNewslettersWidgetProps {
    className?: string;
    title?: string;
    description?: string;
    limit?: number;
}

export function LatestNewslettersWidget({
    className,
    title = "동창회보",
    description = "동창회 소식과 활동을 매거진 형태로 전해드립니다.",
    limit = 12,
}: LatestNewslettersWidgetProps) {
    const fetcher = useFetcher<{ items: NewsletterItem[] }>();

    useEffect(() => {
        if (fetcher.state === "idle" && !fetcher.data) {
            fetcher.load(`/api/newsletter/widget/latest?limit=${limit}`);
        }
    }, [limit, fetcher]);

    const loading = fetcher.state !== "idle" && !fetcher.data;
    const items = fetcher.data?.items || [];

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeft(scrollLeft > 0);
        // Tolerance
        setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [items]);

    const scrollLeft = () => {
        scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
    };
    const scrollRight = () => {
        scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
    };

    return (
        <section className={cn("w-full py-8 md:py-16 lg:py-20 bg-white", className)}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row mb-12">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h2>
                        {description && <p className="text-gray-500">{description}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" className="group">
                            <Link to="/newsletters">
                                전체보기 <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="relative group/container px-4 md:px-12">
                    {/* Navigation Buttons (Hidden by default, show on hover) */}
                    {showLeft && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={scrollLeft}
                            className="hidden group-hover/container:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-white hover:bg-gray-100 border-gray-200"
                        >
                            <ChevronLeft className="h-4 w-4 text-gray-600" />
                        </Button>
                    )}
                    {showRight && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={scrollRight}
                            className="hidden group-hover/container:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-white hover:bg-gray-100 border-gray-200"
                        >
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                        </Button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        onScroll={checkScroll}
                        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="min-w-[120px] md:min-w-[160px] w-[120px] md:w-[160px] flex-none space-y-3">
                                    <div className="aspect-[1/1.4] w-full rounded-lg bg-gray-200 animate-pulse" />
                                </div>
                            ))
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/newsletters/${item.id}/view`}
                                    className="min-w-[120px] md:min-w-[160px] w-[120px] md:w-[160px] flex-none snap-center group block"
                                    draggable={false}
                                >
                                    <div className="aspect-[1/1.4] bg-gray-100 rounded-lg shadow-sm mb-4 overflow-hidden border border-gray-200 group-hover:shadow-md transition-shadow relative">
                                        {item.thumbUrl ? (
                                            <img
                                                src={item.thumbUrl}
                                                alt={item.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded mb-2">
                                            제{item.issue_number}호
                                        </span>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(item.created_at).getFullYear()}년
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="w-full text-center py-12 text-gray-500">등록된 동창회보가 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
