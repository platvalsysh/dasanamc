import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { type BoardWidgetItem } from "../../types/widget";
import { Link, useFetcher } from "react-router";
import { cn } from "@repo/ui/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
} from "@repo/ui";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";


interface LatestPostsWidgetProps {
  className?: string;
  mids: string[];
  limit?: number; // Kept for prop compatibility
  title?: string;
  description?: string;
  viewAllLink?: string;
  /**
   * SSR 시점에 부모 라우트 loader 가 미리 해석해 넘긴 데이터.
   * 있으면 클라이언트 fetch 생략 → FCP 단축 + SEO 확보.
   */
  initialItems?: BoardWidgetItem[];
}

export function LatestPostsWidget({
  className,
  mids,
  title = "최신 소식",
  description = "동창회의 새로운 소식을 전해드립니다.",
  viewAllLink,
  initialItems,
}: LatestPostsWidgetProps) {
  /* React Router Fetcher for Data Loading (SSR fallback). */
  const fetcher = useFetcher<{ items: BoardWidgetItem[] }>();

  // initialItems 가 주어지면 클라이언트 fetch 자체를 안 함.
  // 라우트가 위젯을 단독으로 띄울 때만 fetcher 가 데이터 가져옴.
  useEffect(() => {
    if (initialItems) return;
    if (fetcher.state === "idle" && !fetcher.data) {
      const params = new URLSearchParams();
      params.append("mids", mids.join(","));
      fetcher.load(`/api/board/widget/latest?${params.toString()}`);
    }
  }, [mids, fetcher, initialItems]);

  const loading =
    !initialItems && fetcher.state !== "idle" && !fetcher.data;
  const items = initialItems ?? fetcher.data?.items ?? [];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  /* Scroll Visibility State */
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false); // Initially false, will update on mount via checkScroll

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeft(scrollLeft > 0);
    // Tolerance of 1px for float issues
    setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items]); // Re-check when items change

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const hasItems = items.length > 0;

  return (
    <section
      className={cn(
        "w-full py-8 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900",
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row mb-12">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {title}
            </h2>
            {description && (
              <p className="text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Global View All optional */}
            {viewAllLink && (
              <Button asChild variant="ghost" className="group">
                <Link to={viewAllLink}>
                  전체보기{" "}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden pb-6 -mx-4 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[300px] md:min-w-[350px] space-y-3">
                <div className="h-[200px] w-full bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        ) : hasItems ? (
          <div className="relative group/container">
            {/* Overlay Navigation Controls */}
            {showLeft && (
              <Button
                variant="outline"
                size="icon"
                onClick={scrollLeft}
                className="hidden group-hover/container:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 border-gray-200"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </Button>
            )}

            {showRight && (
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                className="hidden group-hover/container:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 border-gray-200"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </Button>
            )}

            <div
              ref={scrollContainerRef}
              className={cn( // Add cursor styles
                "flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory relative",
                isDragging ? "cursor-grabbing snap-none" : "cursor-grab"
              )}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={checkScroll} // Listen to scroll
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              {items.map((item) => (
                <div key={item.mid} className="min-w-[300px] md:min-w-[350px] snap-center select-none"> {/* select-none prevents text selection while dragging */}
                  <Card className="flex flex-col h-full pointer-events-none md:pointer-events-auto border shadow-none">
                    <div className="h-full flex flex-col pointer-events-auto"> {/* Reset pointer events for children if container had none, but container has auto. check select-none */}
                      <CardHeader>
                        <div className="text-sm text-gray-500 font-medium mb-2">
                          {item.moduleTitle}
                        </div>
                        {item.document ? (
                          <>
                            <CardTitle className="line-clamp-1 text-lg">
                              {/* Wrap Link to prevent drag interference? Native links are draggable. */}
                              <Link to={`/board/${item.mid}/${item.document.id}`} className="hover:underline" draggable={false}>
                                {item.document.category && (
                                  <span className="text-primary mr-1">[{item.document.category}]</span>
                                )}
                                {item.document.title}
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              {item.document.date ? format(new Date(item.document.date), "yyyy-MM-dd") : ""}
                            </CardDescription>
                          </>
                        ) : (
                          <div className="h-20 flex items-center text-gray-400 italic">
                            등록된 게시물이 없습니다.
                          </div>
                        )}
                      </CardHeader>
                      {/* Make whole content area clickable? Or just the text? User said "click body content to move" */}
                      <CardContent className="flex-1">
                        {item.document && (
                          <Link to={`/board/${item.mid}/${item.document.id}`} className="block hover:opacity-80 transition-opacity hover:underline" draggable={false}>
                            <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm">
                              {item.document.summary}
                            </p>
                          </Link>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between pt-4"> {/* Removed border-t */}
                        {/* Individual View All for Module */}
                        <Button asChild variant="link" className="px-0">
                          <Link to={`/board/${item.mid}`} draggable={false}>
                            {item.moduleTitle} 전체보기 <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            등록된 소식이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}
