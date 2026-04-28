import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { cn } from "@repo/ui/utils";
import { Button } from "@repo/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    image:
      "https://pcqrknclbcgrllqoyvzq.supabase.co/storage/v1/object/public/public-images/hero/hero1.webp",
    title: "서울대학교 화학생물공학부 동창회",
    subtitle:
      "동문 여러분의 소중한 인연을 이어갑니다. 함께 성장하고 나누는 동창회에 오신 것을 환영합니다.",
    primaryAction: { label: "회원가입", href: "/auth/sign-up" },
    secondaryAction: { label: "동창회 소개", href: "/about/greeting" },
  },
  {
    id: 2,
    image:
      "/images/greeting.jpg", // Graduation/Alumni vibe
    title: "자랑스러운 동문 네트워크",
    subtitle:
      "세계 각지에서 활약하는 동문들의 소식을 전하고 서로의 성장을 응원합니다.",
    primaryAction: { label: "동문 소식 보기", href: "/board/AlumniNews" },
    secondaryAction: { label: "동문 검색", href: "/search/alumni" },
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop", // Lab/Science vibe
    title: "미래를 선도하는 화학생물공학",
    subtitle:
      "학문적 성취와 산업 발전을 이끄는 모교의 발전을 함께 후원해주세요.",
    primaryAction: { label: "후원하기", href: "/membership" },
    secondaryAction: { label: "멘토링", href: "/activities/mentoring" },
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
