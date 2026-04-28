import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({
  children,
  className = "",
}: HorizontalScrollProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [children]); // Re-check when children change

  // Auto-scroll active item into view
  useEffect(() => {
    if (navRef.current) {
      const activeElement = navRef.current.querySelector(
        '[data-active="true"]',
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [children]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!navRef.current) return;
    isDragging.current = false;
    startX.current = e.pageX - navRef.current.offsetLeft;
    scrollLeft.current = navRef.current.scrollLeft;
    navRef.current.style.cursor = "grabbing";
    navRef.current.style.userSelect = "none";
  };

  const handleMouseLeave = () => {
    if (!navRef.current) return;
    isDragging.current = false;
    navRef.current.style.cursor = "grab";
    navRef.current.style.removeProperty("user-select");
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!navRef.current) return;

    // Slight delay to ensure click events on children can check isDragging status if needed
    // But mostly we rely on the capture phase in the child or checking movement distance
    setTimeout(() => {
      isDragging.current = false;
    }, 0);

    navRef.current.style.cursor = "grab";
    navRef.current.style.removeProperty("user-select");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!navRef.current) return;
    if (e.buttons !== 1) return;

    e.preventDefault();
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = (x - startX.current) * 1;

    if (Math.abs(walk) > 5) {
      isDragging.current = true;
    }

    navRef.current.scrollLeft = scrollLeft.current - walk;
    checkScroll();
  };

  // We need to capture clicks in the capture phase to prevent them if dragged
  const handleCaptureClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const uniqueScroll = (direction: "left" | "right") => {
    if (navRef.current) {
      const amount = direction === "left" ? -200 : 200;
      navRef.current.scrollBy({ left: amount, behavior: "smooth" });
      // Check scroll after animation timeframe roughly, or rely on onScroll event
      // But smooth scroll fires onScroll events properly.
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Left Gradient & Button */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 flex items-center transition-opacity duration-300 ${canScrollLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <button
          onClick={() => uniqueScroll("left")}
          className="ml-1 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Scroll Container */}
      <div
        ref={navRef}
        className="flex items-center gap-1 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden cursor-grab w-full"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties
        }
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={checkScroll}
        onClickCapture={handleCaptureClick}
      >
        {children}
      </div>

      {/* Right Gradient & Button */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 flex items-center justify-end transition-opacity duration-300 ${canScrollRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <button
          onClick={() => uniqueScroll("right")}
          className="mr-1 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
