import type { Route } from "./+types/home";
import { HeroCarousel } from "~/components/hero-carousel";
import { NewsSection } from "~/components/news-section";
import { NewsletterSection } from "~/components/newsletter-section";
import { FeatureSection } from "~/components/feature-section";
import { SiteFooter } from "~/components/site-footer";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "서울대학교 화학생물공학부 동창회" },
    {
      name: "description",
      content: "서울대학교 화학생물공학부 동창회 공식 홈페이지입니다.",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="lg:grid lg:grid-cols-[40%_60%]">
        {/* Left Column - Sticky Hero */}
        <div className="relative lg:h-[calc(100vh-88px)] lg:sticky lg:top-[88px] overflow-hidden">
          <div className="h-full">
            <HeroCarousel />
          </div>
        </div>

        {/* Right Column - Scrollable Content */}
        <div className="flex flex-col bg-white">
          <NewsSection />
          <NewsletterSection />
          <FeatureSection />
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
