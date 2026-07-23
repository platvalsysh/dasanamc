import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { THREE_ONE, STRENGTHS_4, SOLUTION_TABS, CENTERS } from "~/data/dasanone-content";
import { CONTENT_IMAGES } from "~/data/stock-images";

/**
 * 홈 본문 — 스크롤 연동 시네마틱 섹션 모음.
 *
 * 데스크탑: sticky pin + scrollYProgress 스크럽으로 장면이 전개된다.
 * 모바일(≤900px): pin 을 쓰지 않고 순차 리빌로 대체 — 좁은 화면에서 pin 은
 * 콘텐츠가 잘리거나 스크롤이 갇히는 문제가 커서 레이아웃 자체를 분기한다.
 * reduced-motion: 모든 장면을 정적 레이아웃으로 렌더.
 */

const SCENE_IMAGES = [
  "/images/facility/exam-hall.jpg",
  "/images/facility/operating-room.jpg",
  "/images/facility/reception.jpg",
];

/** ≤900px 여부 — pin 대신 순차 리빌로 분기 */
function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return compact;
}

/** 섹션 진행률 + 스크럽 관성 */
function useSceneProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });
}

const EYEBROW: React.CSSProperties = {
  font: "700 13px/1 ui-monospace, monospace",
  letterSpacing: "0.24em",
  color: "var(--color-ds-teal-deep)",
};

/* ═══════════════════════ 1. OUR PROMISE + 3 ONE ═══════════════════════ */

export function PromiseScene() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const compact = useCompact();
  const p = useSceneProgress(ref);

  // 선언문 — 등장 후 사라지지 않고 한 화면에 남아, 카드가 들어올 때 살짝 물러난다
  const stOpacity = useTransform(p, [0, 0.12], [0, 1]);
  const stY = useTransform(p, [0, 0.12, 0.55], [70, 0, -18]);
  const stScale = useTransform(p, [0, 0.12, 0.55], [0.94, 1, 0.93]);

  if (reduced || compact) return <PromiseFallback />;

  return (
    <section ref={ref} className="relative bg-white" style={{ height: "300vh" }}>
      <div
        className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center px-8"
        style={{ gap: "clamp(24px, 4.5vh, 56px)" }}
      >
        {/* 선언문 — 카드와 같은 화면에 계속 머무름 */}
        <motion.div
          className="text-center shrink-0"
          style={{ opacity: stOpacity, y: stY, scale: stScale }}
        >
          <div className="mb-6" style={EYEBROW}>
            OUR PROMISE
          </div>
          <p
            className="serif font-medium max-w-[1000px]"
            style={{
              fontSize: "clamp(24px, 3.4vw, 46px)",
              lineHeight: 1.38,
              letterSpacing: "-0.03em",
              color: "var(--color-ds-text)",
            }}
          >
            아픈 아이를 안고 들어서는 그 마음을 알기에,
            <br />
            다산원은 <span style={{ color: "var(--color-ds-teal-deep)" }}>세 가지 ‘ONE’</span>을 약속합니다.
          </p>
        </motion.div>

        {/* 카드 — 선언문 아래에서 한 장씩 딜링되듯 들어옴 */}
        <div className="w-full max-w-[1280px] grid grid-cols-3 gap-5">
          {THREE_ONE.map((t, i) => (
            <DealCard key={t.tag} p={p} index={i} tag={t.tag} ko={t.ko} img={SCENE_IMAGES[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DealCard({
  p,
  index,
  tag,
  ko,
  img,
}: {
  p: MotionValue<number>;
  index: number;
  tag: string;
  ko: string;
  img: string;
}) {
  const start = 0.26 + index * 0.14;
  const end = start + 0.22;
  const opacity = useTransform(p, [start, end], [0, 1]);
  const y = useTransform(p, [start, end], [150, 0]);
  const scale = useTransform(p, [start, end], [0.86, 1]);
  const rotate = useTransform(p, [start, end], [index === 0 ? -7 : index === 2 ? 7 : 0, 0]);

  return (
    <motion.div
      className="group relative rounded-[26px] overflow-hidden flex flex-col p-10"
      style={{
        opacity,
        y,
        scale,
        rotate,
        minHeight: "clamp(290px, 40vh, 420px)",
        background: "var(--color-ds-dark)",
      }}
    >
      <img
        src={img}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.08]"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(4,24,21,0.24) 0%, rgba(4,24,21,0.5) 45%, rgba(4,24,21,0.88) 100%)" }}
      />
      <div
        className="relative"
        style={{
          font: "800 clamp(56px, 6vw, 92px)/1 ui-monospace, monospace",
          color: "var(--color-ds-teal-3)",
          letterSpacing: "-0.04em",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="relative mt-auto">
        <div className="mb-3" style={{ font: "800 14px/1 ui-monospace, monospace", letterSpacing: "0.06em", color: "var(--color-ds-teal-2)" }}>
          {tag}
        </div>
        <div
          className="font-extrabold text-white"
          style={{ fontSize: "clamp(24px, 2.2vw, 32px)", lineHeight: 1.26, letterSpacing: "-0.02em" }}
        >
          {ko}
        </div>
      </div>
    </motion.div>
  );
}

/** 모바일·reduced-motion 대체 — 순차 리빌 */
function PromiseFallback() {
  return (
    <section className="bg-white px-8 py-24">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-7" style={EYEBROW}>
            OUR PROMISE
          </div>
          <p
            className="serif font-medium"
            style={{ fontSize: "clamp(26px, 5.4vw, 40px)", lineHeight: 1.42, letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}
          >
            아픈 아이를 안고 들어서는 그 마음을 알기에,
            <br />
            다산원은 <span style={{ color: "var(--color-ds-teal-deep)" }}>세 가지 ‘ONE’</span>을 약속합니다.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-5">
          {THREE_ONE.map((t, i) => (
            <motion.div
              key={t.tag}
              className="relative rounded-[24px] overflow-hidden flex flex-col p-9 min-h-[260px]"
              style={{ background: "var(--color-ds-dark)" }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            >
              <img src={SCENE_IMAGES[i]} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,24,21,0.28) 0%, rgba(4,24,21,0.86) 100%)" }} />
              <div className="relative" style={{ font: "800 48px/1 ui-monospace, monospace", color: "var(--color-ds-teal-3)" }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="relative mt-auto">
                <div className="mb-2.5" style={{ font: "800 13px/1 ui-monospace, monospace", color: "var(--color-ds-teal-2)" }}>
                  {t.tag}
                </div>
                <div className="text-[23px] font-extrabold text-white">{t.ko}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ 2. WHY — 가로 패럴랙스 밴드 ═══════════════════════ */

export function StrengthsScene() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 26, restDelta: 0.001 });
  // 섹션이 지나가는 동안 카드 열이 왼쪽으로 흐른다 (비-pin 패럴랙스)
  const x = useTransform(p, [0, 1], ["6%", "-16%"]);

  return (
    <section ref={ref} className="overflow-hidden py-[110px]" style={{ background: "var(--color-ds-bento)" }}>
      <div className="max-w-[1280px] mx-auto px-8 flex items-end justify-between gap-6 flex-wrap mb-14">
        <div>
          <div className="mb-4" style={EYEBROW}>
            WHY DASANONE
          </div>
          <h2
            className="font-extrabold"
            style={{ fontSize: "clamp(30px, 4.4vw, 56px)", letterSpacing: "-0.04em", lineHeight: 1.16, color: "var(--color-ds-text)" }}
          >
            왜 다산원동물의료센터일까요?
          </h2>
        </div>
        <Link
          to="/about"
          className="group inline-flex items-center gap-2 text-[16px] font-bold"
          style={{ color: "var(--color-ds-teal-deep)" }}
        >
          병원소개에서 자세히 보기
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <motion.div
        className="flex gap-6 px-8 will-change-transform"
        style={reduced ? undefined : { x }}
      >
        {STRENGTHS_4.map((s) => (
          <div
            key={s.n}
            className="group relative shrink-0 rounded-[22px] bg-white p-10 flex flex-col gap-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_26px_54px_rgba(13,58,53,0.16)]"
            style={{ width: "clamp(260px, 26vw, 360px)" }}
          >
            <span
              aria-hidden
              className="absolute top-0 left-0 h-[4px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
              style={{ background: "var(--color-ds-teal-2)" }}
            />
            <div
              style={{
                font: "800 clamp(48px, 4.6vw, 68px)/1 ui-monospace, monospace",
                color: "var(--color-ds-teal-deep)",
                letterSpacing: "-0.05em",
              }}
            >
              {s.n}
            </div>
            <div
              className="font-extrabold"
              style={{ fontSize: "clamp(19px, 1.7vw, 23px)", color: "var(--color-ds-text)", lineHeight: 1.36, letterSpacing: "-0.02em" }}
            >
              {s.t}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ═══════════════════════ 3. ONE STOP CARE — 스크롤 단계 진행 ═══════════════════════ */

export function OneStopScene() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const compact = useCompact();
  const p = useSceneProgress(ref);
  const [step, setStep] = useState(0);
  const last = SOLUTION_TABS.length - 1;
  // 훅은 조기 반환보다 위에서 모두 호출 (호출 순서 고정)
  const railScaleY = useTransform(p, [0.1, 0.9], [0, 1]);

  useMotionValueEvent(p, "change", (v) => {
    // 앞뒤 10% 는 여백 — 그 사이를 단계 수로 등분
    const t = Math.min(Math.max((v - 0.1) / 0.8, 0), 0.9999);
    setStep(Math.min(last, Math.floor(t * SOLUTION_TABS.length)));
  });

  if (reduced || compact) return <OneStopFallback />;

  return (
    <section ref={ref} className="relative bg-white" style={{ height: "340vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="w-full max-w-[1280px] mx-auto px-8 grid grid-cols-[0.95fr_1.05fr] gap-16 items-center">
          {/* 좌: 단계 목록 + 진행 레일 */}
          <div>
            <div className="mb-4" style={EYEBROW}>
              ONE STOP CARE
            </div>
            <h2
              className="font-extrabold mb-12"
              style={{ fontSize: "clamp(30px, 4vw, 52px)", letterSpacing: "-0.04em", lineHeight: 1.16, color: "var(--color-ds-text)" }}
            >
              진단부터 회복까지,
              <br />한 곳에서
            </h2>
            <div className="relative pl-8">
              {/* 레일 */}
              <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[2px]" style={{ background: "#e2e8e4" }} />
              <motion.span
                aria-hidden
                className="absolute left-0 top-1 w-[2px] origin-top"
                style={{
                  bottom: 4,
                  background: "var(--color-ds-teal-deep)",
                  scaleY: railScaleY,
                }}
              />
              <ul className="flex flex-col gap-6 list-none m-0 p-0">
                {SOLUTION_TABS.map((t, i) => {
                  const active = i === step;
                  return (
                    <li key={t.label} className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-8 top-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                        style={{
                          width: active ? 14 : 8,
                          height: active ? 14 : 8,
                          marginLeft: active ? -6 : -3,
                          background: i <= step ? "var(--color-ds-teal-deep)" : "#cdd7d3",
                        }}
                      />
                      <div
                        className="font-extrabold transition-all duration-300"
                        style={{
                          fontSize: active ? "clamp(22px, 2vw, 28px)" : "clamp(18px, 1.5vw, 21px)",
                          color: active ? "var(--color-ds-text)" : "#9aa9a4",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {t.label}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* 우: 활성 단계 상세 — 사진 + 체크리스트 */}
          <div className="relative">
            <div className="rounded-[24px] overflow-hidden mb-8" style={{ aspectRatio: "16/10" }}>
              <img src={CONTENT_IMAGES.oneStopCare} alt="진료 현장" className="w-full h-full object-cover" />
            </div>
            <motion.div key={step} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.2, 0.65, 0.25, 1] }}>
              <h3
                className="font-extrabold mb-6"
                style={{ fontSize: "clamp(24px, 2.4vw, 32px)", letterSpacing: "-0.025em", lineHeight: 1.3, color: "var(--color-ds-text)" }}
              >
                {SOLUTION_TABS[step].title}
              </h3>
              <ul className="list-none flex flex-col gap-3.5 m-0 p-0">
                {SOLUTION_TABS[step].points.map((pt) => (
                  <li key={pt} className="flex gap-3 text-[17px] font-semibold" style={{ color: "#2a3b37" }}>
                    <span className="font-extrabold" style={{ color: "var(--color-ds-teal-deep)" }}>✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OneStopFallback() {
  return (
    <section className="bg-white px-8 py-24">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-4" style={EYEBROW}>
          ONE STOP CARE
        </div>
        <h2
          className="font-extrabold mb-12"
          style={{ fontSize: "clamp(28px, 6vw, 40px)", letterSpacing: "-0.035em", lineHeight: 1.2, color: "var(--color-ds-text)" }}
        >
          진단부터 회복까지, 한 곳에서
        </h2>
        <div className="flex flex-col gap-10">
          {SOLUTION_TABS.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              className="border-t pt-7"
              style={{ borderColor: "#e2e8e4" }}
            >
              <div className="flex items-baseline gap-3 mb-4">
                <span style={{ font: "800 15px/1 ui-monospace, monospace", color: "var(--color-ds-teal-deep)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[22px] font-extrabold" style={{ color: "var(--color-ds-text)", letterSpacing: "-0.02em" }}>
                  {t.title}
                </h3>
              </div>
              <ul className="list-none flex flex-col gap-2.5 m-0 p-0">
                {t.points.map((pt) => (
                  <li key={pt} className="flex gap-2.5 text-[16px] font-semibold" style={{ color: "#2a3b37" }}>
                    <span className="font-extrabold" style={{ color: "var(--color-ds-teal-deep)" }}>✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ 4. SPECIALTY CENTERS — 가로 스크롤 pin ═══════════════════════ */

export function CentersScene() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const compact = useCompact();
  const p = useSceneProgress(ref);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      setDistance(Math.max(0, el.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [compact, reduced]);

  const x = useTransform(p, [0.06, 0.96], [0, -distance]);

  if (reduced || compact) return <CentersFallback />;

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: `calc(100vh + ${distance}px)`, background: "var(--color-ds-dark-warm)", color: "#fff" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="max-w-[1280px] w-full mx-auto px-8 mb-10">
          <div className="mb-4" style={{ ...EYEBROW, color: "var(--color-ds-teal-2)" }}>
            SPECIALTY CENTERS
          </div>
          <h2
            className="font-extrabold"
            style={{ fontSize: "clamp(34px, 5vw, 64px)", letterSpacing: "-0.045em", lineHeight: 1.12 }}
          >
            <span style={{ color: "var(--color-ds-teal-2)" }}>11개</span> 특화진료센터
          </h2>
          <p className="text-[17px] mt-4" style={{ color: "#aec6bf" }}>
            분과별 전공의가 한 명의 환자를 함께 봅니다
          </p>
        </div>

        <motion.div ref={trackRef} className="flex gap-6 px-8 will-change-transform" style={{ x }}>
          {CENTERS.map((c) => (
            <Link
              key={c.id}
              to={`/centers/${c.id}`}
              className="group shrink-0 bg-white rounded-[22px] p-9 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-2"
              style={{ width: 330, minHeight: 330, color: "var(--color-ds-dark-warm)" }}
            >
              <div className="flex items-center justify-between">
                <span style={{ font: "800 24px/1 ui-monospace, monospace", color: "var(--color-ds-teal-deep)" }}>{c.num}</span>
                <span className="transition-transform group-hover:translate-x-1" style={{ color: "#cbd6d1", fontSize: 26 }}>
                  →
                </span>
              </div>
              <div className="text-[27px] font-extrabold mt-2" style={{ lineHeight: 1.26, letterSpacing: "-0.025em" }}>
                {c.ko}
              </div>
              <div className="text-[13px] font-semibold" style={{ letterSpacing: "0.04em", color: "var(--color-ds-text-sub)" }}>
                {c.en}
              </div>
              <p
                className="text-[15px] mt-auto"
                style={{
                  color: "#5c6b68",
                  lineHeight: 1.6,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {c.targets}
              </p>
            </Link>
          ))}
          {/* 마지막 CTA 카드 */}
          <Link
            to="/centers"
            className="group shrink-0 rounded-[22px] p-9 flex flex-col justify-center items-start gap-4"
            style={{ width: 330, minHeight: 330, background: "var(--color-ds-teal-deep)", color: "#fff" }}
          >
            <span className="text-[24px] font-extrabold" style={{ lineHeight: 1.3 }}>
              전체 센터
              <br />
              둘러보기
            </span>
            <span className="text-[30px] transition-transform group-hover:translate-x-2">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CentersFallback() {
  return (
    <section className="py-24" style={{ background: "var(--color-ds-dark-warm)", color: "#fff" }}>
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="mb-4" style={{ ...EYEBROW, color: "var(--color-ds-teal-2)" }}>
          SPECIALTY CENTERS
        </div>
        <h2 className="font-extrabold mb-3" style={{ fontSize: "clamp(30px, 7vw, 44px)", letterSpacing: "-0.04em", lineHeight: 1.15 }}>
          <span style={{ color: "var(--color-ds-teal-2)" }}>11개</span> 특화진료센터
        </h2>
        <p className="text-[16px] mb-10" style={{ color: "#aec6bf" }}>
          분과별 전공의가 한 명의 환자를 함께 봅니다
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CENTERS.map((c) => (
            <Link
              key={c.id}
              to={`/centers/${c.id}`}
              className="bg-white rounded-[20px] p-7 flex flex-col gap-2"
              style={{ color: "var(--color-ds-dark-warm)" }}
            >
              <span style={{ font: "800 20px/1 ui-monospace, monospace", color: "var(--color-ds-teal-deep)" }}>{c.num}</span>
              <div className="text-[21px] font-extrabold mt-1" style={{ lineHeight: 1.3 }}>
                {c.ko}
              </div>
              <p
                className="text-[14.5px]"
                style={{
                  color: "#5c6b68",
                  lineHeight: 1.55,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {c.targets}
              </p>
            </Link>
          ))}
        </div>
        <Link
          to="/centers"
          className="inline-block mt-10 text-[16px] font-bold"
          style={{ background: "var(--color-ds-teal-deep)", color: "#fff", padding: "15px 30px", borderRadius: 999 }}
        >
          전체 센터 둘러보기 →
        </Link>
      </div>
    </section>
  );
}
