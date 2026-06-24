import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { cn } from "@repo/ui/utils";
import { Button } from "@repo/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

// TODO(template): 슬라이드 이미지를 다산원 실제 사진으로 교체. 현재는 임시 unsplash.
const SLIDES = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=2070&auto=format&fit=crop",
    title: "365일 24시간, 다산원동물의료센터",
    subtitle:
      "말 못 하는 아이의 작은 신호 하나도 놓치지 않겠습니다. 연중무휴 24시간 응급진료.",
    primaryAction: { label: "전화 예약·문의", href: "tel:0507-1330-5958" },
    secondaryAction: { label: "병원 소개", href: "/about/greeting" },
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2070&auto=format&fit=crop",
    title: "11개 특화진료센터, 한 곳에서",
    subtitle:
      "분과별 전공의 협진과 대학병원급 CT로 진단부터 수술·회복까지 원스톱.",
    primaryAction: { label: "특화진료센터", href: "/centers" },
    secondaryAction: { label: "건강검진", href: "/checkup" },
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?q=80&w=2070&auto=format&fit=crop",
    title: "수준 높은 의료 서비스",
    subtitle:
      "외과 전공 대표원장 직접 집도, 6명의 석사 이상 전문 의료진.",
    primaryAction: { label: "의료진 소개", href: "/about/greeting" },
    secondaryAction: { label: "네이버 블로그", href: "https://blog.naver.com/dasanoneamc" },
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative w-full h-[500px] lg:h-full overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
          )}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />{" "}
            {/* Dark overlay for text readability */}
          </div>

          {/* Content */}
          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
            <div className="w-full flex flex-col h-full justify-center items-center pb-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[calc(50%-50px)] w-full max-w-3xl text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight break-keep whitespace-normal">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto break-keep whitespace-normal mt-4 mb-4">
                  {slide.subtitle}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center absolute left-1/2 transform -translate-x-1/2 top-[calc(50%+60px)]">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white border-none">
                  <Link to={slide.primaryAction.href}>{slide.primaryAction.label}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white/20 hover:text-white bg-transparent">
                  <Link to={slide.secondaryAction.href}>{slide.secondaryAction.label}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 bottom-4 z-30 p-2 text-white/70 hover:text-white transition-colors hidden md:block"
        aria-label="Previous slide"
      >
          <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 bottom-4 z-30 p-2 text-white/70 hover:text-white transition-colors hidden md:block"
        aria-label="Next slide"
      >
          <ChevronRight className="w-8 h-8" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/80",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
