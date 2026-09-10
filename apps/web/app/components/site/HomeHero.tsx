import { useReducedMotion } from "motion/react";
import { HERO_STATS, MARQUEE_ITEMS } from "~/data/dasanone-content";
import { CountUp } from "~/components/site/motion-bits";

/**
 * 홈 hero — 브랜드 필름을 그대로 재생 (텍스트 타이틀·오버레이·스크롤 pin 없음).
 *
 * - PC(md+): 영상이 첫 화면(100vh)을 단독으로 채우고, 통계 스트립·마퀴는 다음 스크롤에 등장
 * - 모바일: 영상은 가로폭 기준 16:9 비율 유지(세로 crop 없음), 바로 아래 통계·마퀴
 *
 * 원본(4K 54s 265MB)은 `assets-master/` 에 보관, 웹용은 1080p H.264 무음으로
 * 재인코딩한 파일. poster 는 첫 프레임 JPEG (LCP + 모션 최소화용).
 * reduced-motion: 영상 대신 포스터 정적 표시.
 */
const HERO_VIDEO = {
  src: "/hero_movie.mp4",
  poster: "/hero_movie_poster.jpg",
  alt: "다산원동물의료센터 브랜드 필름",
} as const;

export function HomeHero() {
  const reduced = useReducedMotion();

  return (
    <div className="relative overflow-hidden flex flex-col">
      <h1 className="sr-only">24시 다산 원동물의료센터</h1>

      {/* 영상 영역 — 모바일: 16:9 비율 유지 (세로 crop 없음) / PC: 첫 화면 전체(100vh) 영상만 */}
      <div className="relative w-full aspect-video md:aspect-auto md:h-screen">
        {reduced ? (
          <img
            src={HERO_VIDEO.poster}
            alt={HERO_VIDEO.alt}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ) : (
          <video
            className="absolute inset-0 w-full h-full"
            src={HERO_VIDEO.src}
            poster={HERO_VIDEO.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={HERO_VIDEO.alt}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        )}
      </div>

      <StatsStrip />
      <MarqueeBar />
    </div>
  );
}

/** hero 최하단 키워드 마퀴 — 첫 화면부터 노출 */
function MarqueeBar() {
  return (
    <div className="relative z-[4] shrink-0 bg-white overflow-hidden py-[18px]">
      <div className="flex w-max gap-0 animate-marquee">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-7 text-[16px] font-semibold whitespace-nowrap"
            style={{ color: "#5c6b68" }}
          >
            {m}
            <span style={{ color: "#cfd8d3" }}>/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** hero 하단 통계 스트립 — 영상 아래 다크 바 (첫 화면부터 노출) */
function StatsStrip() {
  return (
    <div
      className="relative z-[4] shrink-0"
      style={{
        background: "rgba(4,24,21,0.96)",
        borderTop: "1px solid rgba(244,238,228,0.12)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-4 statgrid">
        {HERO_STATS.map((s, i) => (
          <div
            key={i}
            className="py-4 md:py-6 px-2"
            style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(244,238,228,0.12)" }}
          >
            <div
              className="text-[22px] md:text-[28px] font-extrabold"
              style={{ color: "var(--color-ds-teal-3)", letterSpacing: "-0.02em" }}
            >
              <CountUp value={s.v} />
            </div>
            <div className="text-[12px] md:text-[13.5px] mt-1" style={{ color: "#a7bcb5" }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
