import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { HeroCarousel } from "~/components/hero-carousel";
import { NewsSection, NEWS_SECTION_MIDS } from "~/components/news-section";
import { FeatureSection } from "~/components/feature-section";
import { SiteFooter } from "~/components/site-footer";
import { resolveBoardWidgetItems } from "@repo/module-board/server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "24시 다산 원동물의료센터" },
    {
      name: "description",
      content:
        "경기 남양주 24시 동물병원. 11개 특화진료센터, 대학병원급 CT, 365일 24시간 연중무휴 응급진료.",
    },
  ];
}

// 홈페이지 최신 소식을 SSR 단계에서 한 번에 해석. 이전엔 클라이언트 마운트
// 후 useEffect → fetcher 라 빈 스켈레톤 → 데이터 도착 두 단계로 보였음.
// 추가로 widget-service 는 N+1 제거된 DISTINCT ON 단일 쿼리.
export async function loader() {
  const newsItems = await resolveBoardWidgetItems(NEWS_SECTION_MIDS);
  return { newsItems };
}

export default function Home() {
  const { newsItems } = useLoaderData<typeof loader>();
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
          <NewsSection initialItems={newsItems} />
          <FeatureSection />
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
