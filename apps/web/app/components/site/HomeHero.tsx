import { useRef } from "react";
import { Link } from "react-router";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { HOSPITAL, HERO_STATS, MARQUEE_ITEMS } from "~/data/dasanone-content";
import { HERO_IMAGES } from "~/data/stock-images";
import { CountUp } from "~/components/site/motion-bits";

/**
 * 홈 스크롤 스토리텔링 hero — 380vh 트랙, CSS sticky pin.
 *
 * 장면 구성 (스크롤 진행률):
 *  S1 0.00~0.30  "작은 신호, 그 하나도 놓치지 않겠습니다" — 스크롤 전부터 노출
 *  S2 0.30~0.60  "다산원은 24시간 깨어 있습니다"          — 사진 밝아짐 + 24 워터마크
 *  S3 0.60~1.00  브랜드 선언 + CTA                        — 정착 + hold
 *
 * 하단에는 통계 스트립·키워드 마퀴가 sticky 안에 함께 고정되어 첫 화면부터 보인다.
 * reduced-motion: S3 만 정적 표시.
 */

/**
 * 장면 등장→퇴장 구간을 opacity / y / blur 로 변환.
 * `enter` 가 null 이면 스크롤 0 지점부터 이미 보이는 상태 (첫 장면용).
 */
function useScene(
  progress: MotionValue<number>,
  enter: [number, number] | null,
  exit: [number, number] | null,
) {
  const enterKeys = enter ?? [-2, -1]; // 진입 구간을 트랙 밖으로 → 시작부터 노출
  const keys = exit
    ? [enterKeys[0], enterKeys[1], exit[0], exit[1]]
    : [enterKeys[0], enterKeys[1], 2, 3]; // exit 없음 = 끝까지 유지
  const opacity = useTransform(progress, keys, [0, 1, 1, 0]);
  const y = useTransform(progress, keys, [56, 0, 0, -64]);
  const blur = useTransform(progress, keys, [8, 0, 0, 8]);
  const filter = useTransform(blur, (b) => `blur(${b.toFixed(1)}px)`);
  return { opacity, y, filter };
}

export function HomeHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // 배경 사진 — 어둠 속에서 서서히 밝아지며 줌아웃 (S2 에서 병원이 "드러남")
  const bgScale = useTransform(progress, [0, 0.6], [1.18, 1]);
  const bgFilter = useTransform(progress, (v) => {
    const t = Math.min(Math.max(v / 0.55, 0), 1);
    const bright = 0.34 + 0.66 * t;
    return `saturate(0.82) brightness(${bright.toFixed(3)})`;
  });

  // 거대 "24" 워터마크 — S2 에서 떠올랐다 사라짐
  const wmOpacity = useTransform(progress, [0.26, 0.38, 0.52, 0.62], [0, 0.14, 0.14, 0]);
  const wmScale = useTransform(progress, [0.26, 0.62], [0.82, 1.28]);

  // 장면 텍스트 — S1 은 스크롤 전부터 노출 (로드 시 fade-in 은 내부 래퍼가 담당)
  const s1 = useScene(progress, null, [0.22, 0.3]);
  const s2 = useScene(progress, [0.3, 0.38], [0.52, 0.6]);
  const s3 = useScene(progress, [0.6, 0.7], null);

  // 스크롤 힌트 — 마지막 장면 정착 후 서서히 제거
  const hintOpacity = useTransform(progress, [0.82, 0.95], [1, 0]);

  if (reduced) {
    // 모션 최소화 — 최종 장면만 정적 렌더
    return (
      <div className="relative h-screen overflow-hidden flex flex-col">
        <HeroBackdrop staticBright />
        <div className="relative z-[3] flex-1 flex items-center">
          <div className="w-full max-w-[1360px] mx-auto px-11">
            <FinalScene />
          </div>
        </div>
        <StatsStrip />
        <MarqueeBar />
      </div>
    );
  }

  return (
    <div ref={trackRef} className="relative" style={{ height: "380vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* 배경 사진 + 오버레이 — 통계 스트립 뒤까지 덮음 */}
        <motion.img
          src={HERO_IMAGES.home}
          alt="보호자와 함께 산책하는 반려견"
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: "center 38%",
            scale: bgScale,
            filter: bgFilter,
            willChange: "transform, filter",
          }}
        />
        <HeroBackdrop />

        {/* 거대 24 워터마크 (S2) */}
        <motion.div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]"
          style={{ opacity: wmOpacity, scale: wmScale }}
        >
          <span
            style={{
              font: "800 clamp(280px, 46vw, 720px)/1 ui-monospace, monospace",
              letterSpacing: "-0.06em",
              color: "transparent",
              WebkitTextStroke: "2px rgba(110,212,197,0.55)",
            }}
          >
            24
          </span>
        </motion.div>

        {/* 장면 영역 — 통계 스트립을 뺀 나머지 높이 */}
        <div className="relative flex-1">

        {/* S1 — 문제 제기 (스크롤 전부터 노출, 로드 시 자체 fade-in) */}
        <motion.div
          className="absolute inset-0 z-[3] flex flex-col items-center justify-center text-center px-8 pointer-events-none"
          style={{ opacity: s1.opacity, y: s1.y, filter: s1.filter }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.2, 0.65, 0.25, 1] }}
          >
            <h1
              className="serif font-semibold"
              style={{
                fontSize: "clamp(32px, 5.2vw, 72px)",
                lineHeight: 1.3,
                letterSpacing: "-0.03em",
                color: "#f4efe6",
                textWrap: "balance",
              }}
            >
              말 못 하는 아이들의 작은 신호,
              <br />
              <span style={{ color: "#6ed4c5" }}>그 하나도 놓치지 않겠습니다.</span>
            </h1>
            <p className="mt-7 text-[17px] font-semibold" style={{ color: "#b3c2bc" }}>
              작은 변화를 읽어내는 것부터 진료는 시작됩니다
            </p>
          </motion.div>
        </motion.div>

        {/* S2 — 응답 */}
        <motion.div
          className="absolute inset-0 z-[3] flex flex-col items-center justify-center text-center px-8 pointer-events-none"
          style={{ opacity: s2.opacity, y: s2.y, filter: s2.filter }}
        >
          <h2
            className="serif font-semibold"
            style={{
              fontSize: "clamp(38px, 6.4vw, 88px)",
              lineHeight: 1.22,
              letterSpacing: "-0.03em",
              color: "#fbf7ee",
              textWrap: "balance",
            }}
          >
            다산원은
            <br />
            <span style={{ color: "#6ed4c5" }}>24시간 깨어 있습니다</span>
          </h2>
          <p className="mt-7 text-[17px] font-semibold" style={{ color: "#cfe0db" }}>
            말 못하는 아이의 신호는 예고 없이 찾아옵니다
          </p>
        </motion.div>

        {/* S3 — 브랜드 선언 + CTA (정착) */}
        <motion.div
          className="absolute inset-0 z-[3] flex items-center"
          style={{ opacity: s3.opacity, y: s3.y, filter: s3.filter }}
        >
          <div className="w-full max-w-[1360px] mx-auto px-11">
            <FinalScene />
          </div>
        </motion.div>

        {/* 스크롤 힌트 */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[4] flex flex-col items-center gap-2"
          style={{ opacity: hintOpacity }}
        >
          <span style={{ font: "600 11px/1 ui-monospace, monospace", letterSpacing: "0.25em", color: "#cbbfa4" }}>
            SCROLL
          </span>
          <span className="w-px" style={{ height: 28, background: "linear-gradient(#6ed4c5,transparent)" }} />
        </motion.div>
        </div>

        <StatsStrip />
        <MarqueeBar />
      </div>
    </div>
  );
}

/** hero 최하단 키워드 마퀴 — 첫 화면부터 노출 */
function MarqueeBar() {
  return (
    <div
      className="relative z-[4] shrink-0 bg-white overflow-hidden py-[18px]"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
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

/** hero 하단 통계 스트립 — 배경 사진 위 반투명 바 (첫 화면부터 노출) */
function StatsStrip() {
  return (
    <div
      className="relative z-[4] shrink-0"
      style={{
        background: "rgba(4,24,21,0.76)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
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

/** 공통 다크 오버레이 스택 */
function HeroBackdrop({ staticBright = false }: { staticBright?: boolean }) {
  return (
    <>
      {staticBright && (
        <img
          src={HERO_IMAGES.home}
          alt="보호자와 함께 산책하는 반려견"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover", objectPosition: "center 38%", filter: "saturate(0.82)" }}
        />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,rgba(8,34,29,0.30) 0%,rgba(6,30,26,0.38) 45%,rgba(4,22,19,0.52) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 78% 12%,rgba(176,128,82,0.20),transparent 62%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 70% at 16% 86%,rgba(14,157,140,0.18),transparent 64%)" }} />
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(125deg,rgba(255,255,255,0.02) 0 1px,transparent 1px 66px)" }} />
    </>
  );
}

/** 최종 장면 — 배지 + 브랜드 타이틀 + CTA */
function FinalScene() {
  return (
    <div className="max-w-[820px]">
      <div
        className="inline-flex items-center gap-2.5 mb-6"
        style={{
          border: "1px solid rgba(110,212,197,0.35)",
          background: "rgba(110,212,197,0.10)",
          padding: "7px 15px",
          borderRadius: 999,
          fontSize: "12.5px",
          fontWeight: 700,
          color: "#8fe0d2",
        }}
      >
        <span className="w-[7px] h-[7px] rounded-full animate-pulse-dot" style={{ background: "var(--color-ds-teal-3)" }} />
        365일 24시간 연중무휴 응급진료
      </div>
      <h2
        className="serif font-semibold"
        style={{
          fontSize: "clamp(38px, 5.8vw, 78px)",
          lineHeight: 1.2,
          letterSpacing: "-0.025em",
          background: "linear-gradient(178deg,#fbf7ee 30%,rgba(232,219,199,0.78))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        모두를 위한 동물 주치의,
        <br />
        <span style={{ color: "var(--color-ds-teal-3)", WebkitTextFillColor: "var(--color-ds-teal-3)" }}>
          다산원동물의료센터
        </span>
      </h2>
      <p className="text-[17px] mt-6 font-semibold" style={{ color: "#f4efe6" }}>
        정밀 진단부터 수술, 회복까지 — 11개 특화센터의 원스톱 케어
      </p>
      <p className="text-[15px] mt-2" style={{ color: "#b3c2bc", letterSpacing: "0.01em" }}>
        Comprehensive Care for Every Companion
      </p>
      <div className="flex gap-2.5 flex-wrap mt-8">
        <a
          href={`tel:${HOSPITAL.phone}`}
          className="flex items-center gap-2 text-[16px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
          style={{ background: "var(--color-ds-teal-deep)", color: "#fff", padding: "14px 24px", borderRadius: 11 }}
        >
          전화 예약·문의
        </a>
        <Link
          to="/support#contactform"
          className="flex items-center gap-2 text-[16px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(244,238,228,0.28)",
            color: "#f4efe6",
            padding: "14px 24px",
            borderRadius: 11,
          }}
        >
          온라인 문의
        </Link>
      </div>
    </div>
  );
}
