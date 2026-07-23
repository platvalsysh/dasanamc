import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import {
  HOSPITAL,
  THREE_ONE,
  STRENGTHS_4,
  CENTERS,
  HERO_STATS,
  MARQUEE_ITEMS,
  SOLUTION_TABS,
  INFO_ROWS,
} from "~/data/dasanone-content";
import { BLOG_LATEST, CASE_ARTICLES, blogPostUrl } from "~/data/case-archive";
import { AssetSlot } from "~/components/AssetSlot";
import { Rise, CountUp } from "~/components/site/motion-bits";
import { HomeHero } from "~/components/site/HomeHero";
import { CONTENT_IMAGES } from "~/data/stock-images";

/** 3 ONE SYSTEM 카드 배경 — 실촬영본 */
const THREE_ONE_IMAGES = [
  "/images/facility/exam-hall.jpg",
  "/images/facility/operating-room.jpg",
  "/images/facility/reception.jpg",
];

const DESCRIPTION =
  "경기 남양주 24시 동물병원. 11개 특화진료센터, 대학병원급 CT, 365일 24시간 연중무휴 응급진료.";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${HOSPITAL.name}` },
    { name: "description", content: DESCRIPTION },
    // Open Graph — 카카오톡/네이버 공유 미리보기
    { property: "og:type", content: "website" },
    { property: "og:title", content: HOSPITAL.name },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:image", content: `${HOSPITAL.siteUrl}/images/hero-reception.jpg` },
    { property: "og:url", content: HOSPITAL.siteUrl },
    // 지역 검색용 구조화 데이터 (VeterinaryCare)
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "VeterinaryCare",
        name: HOSPITAL.name,
        url: HOSPITAL.siteUrl,
        telephone: HOSPITAL.phone,
        email: HOSPITAL.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "다산중앙로 15, 3층",
          addressLocality: "남양주시",
          addressRegion: "경기도",
          addressCountry: "KR",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
        ],
        image: `${HOSPITAL.siteUrl}/images/hero-reception.jpg`,
        sameAs: [HOSPITAL.blog],
      },
    },
  ];
}

export default function Home() {
  const [solTab, setSolTab] = useState(0);
  const activeSol = SOLUTION_TABS[solTab];

  return (
    <>
      {/* ============ HERO — 스크롤 스토리텔링 (380vh, 3장면) ============ */}
      <section className="darkhero relative" style={{ background: "var(--color-ds-dark)", color: "#f4efe6" }}>
        <HomeHero />

        {/* hero stats strip — 다크 */}
        <div className="relative" style={{ background: "var(--color-ds-dark-3)" }}>
          <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-4 statgrid">
            {HERO_STATS.map((s, i) => (
              <div
                key={i}
                className="py-7 px-2"
                style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(244,238,228,0.12)" }}
              >
                <div className="text-[28px] font-extrabold" style={{ color: "var(--color-ds-teal-3)", letterSpacing: "-0.02em" }}>
                  <CountUp value={s.v} />
                </div>
                <div className="text-[13.5px] mt-1" style={{ color: "#a7bcb5" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <section
        className="bg-white overflow-hidden py-[18px]"
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
      </section>

      {/* ============ OUR PROMISE + 3 ONE — 약속 선언 후 카드 3장 ============ */}
      <section className="max-w-[1280px] mx-auto px-8 pt-[110px] pb-[100px]">
        <div className="text-center max-w-[860px] mx-auto mb-14">
          <div className="mb-7" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.24em", color: "var(--color-ds-teal-deep)" }}>
            OUR PROMISE
          </div>
          <Rise blur y={30}>
            <p
              className="serif font-medium text-balance"
              style={{ fontSize: "clamp(25px, 3.6vw, 42px)", lineHeight: 1.5, letterSpacing: "-0.025em", color: "var(--color-ds-text)" }}
            >
              아픈 아이를 안고 들어서는 그 마음을 알기에,
              <br />
              다산원은 <span style={{ color: "var(--color-ds-teal-deep)" }}>세 가지 ‘ONE’</span>을 약속합니다.
            </p>
          </Rise>
        </div>

        {/* 카드 — 태그 + 한 줄 요약만, 상세 설명은 /about */}
        <div data-stagger="" className="grid gap-5 grid-cols-1 md:grid-cols-3 three">
          {THREE_ONE.map((t, i) => (
            <div
              key={i}
              className="group relative rounded-[24px] p-9 md:p-10 min-h-[300px] flex flex-col overflow-hidden"
              style={{ background: "var(--color-ds-dark)" }}
            >
              {/* 실촬영 배경 + 다크 그라데이션 */}
              <img
                src={THREE_ONE_IMAGES[i]}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(4,24,21,0.28) 0%, rgba(4,24,21,0.52) 45%, rgba(4,24,21,0.86) 100%)" }}
              />
              <div
                className="relative"
                style={{
                  font: "800 clamp(40px, 4.5vw, 60px)/1 ui-monospace, monospace",
                  color: "var(--color-ds-teal-3)",
                  letterSpacing: "-0.03em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="relative mt-auto pt-10">
                <div className="mb-2.5" style={{ font: "800 14px/1 ui-monospace, monospace", color: "var(--color-ds-teal-2)" }}>
                  {t.tag}
                </div>
                <div className="text-[24px] font-extrabold text-white" style={{ lineHeight: 1.3 }}>
                  {t.ko}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ WHY DASANONE — 4열 압축 스트립 ============ */}
      <section style={{ background: "var(--color-ds-bento)" }}>
        <div className="max-w-[1280px] mx-auto px-8 py-[88px]">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-11">
            <div>
              <div className="mb-3.5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-deep)" }}>
                WHY DASANONE
              </div>
              <h2 className="text-[32px] font-extrabold" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
                왜 다산원동물의료센터일까요?
              </h2>
            </div>
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 text-[15px] font-bold"
              style={{ color: "var(--color-ds-teal-deep)" }}
            >
              병원소개에서 자세히 보기
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div data-stagger="" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 four">
            {STRENGTHS_4.map((s) => (
              <div
                key={s.n}
                className="group rounded-[20px] p-8 bg-white flex flex-col gap-6 transition-colors duration-300 hover:bg-[color:var(--color-ds-dark-warm)]"
              >
                <div
                  className="transition-colors group-hover:text-[color:var(--color-ds-teal-2)]"
                  style={{
                    font: "800 30px/1 ui-monospace, monospace",
                    color: "var(--color-ds-teal-deep)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {s.n}
                </div>
                <div
                  className="text-[18px] font-extrabold transition-colors group-hover:text-white"
                  style={{ color: "var(--color-ds-text)", lineHeight: 1.4 }}
                >
                  {s.t}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ONE STOP CARE — 탭 ============ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-8 py-[104px]">
          <div className="text-center mb-11">
            <div className="mb-4" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-deep)" }}>
              ONE STOP CARE
            </div>
            <h2 className="text-[34px] font-extrabold" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
              진단부터 회복까지, 한 곳에서
            </h2>
          </div>
          <div className="soltabs flex justify-center gap-14 flex-wrap mb-12" style={{ borderBottom: "1px solid #e3d4b4" }}>
            {SOLUTION_TABS.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setSolTab(i)}
                data-active={i === solTab ? "1" : ""}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="solpanel grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-2">
            <div>
              <h3 className="text-[26px] font-extrabold mb-6" style={{ letterSpacing: "-0.02em", color: "var(--color-ds-text)" }}>
                {activeSol.title}
              </h3>
              <ul className="list-none flex flex-col gap-[11px]">
                {activeSol.points.map((p) => (
                  <li key={p} className="flex gap-[11px] text-[16px] font-semibold" style={{ color: "#2a3b37" }}>
                    <span className="font-extrabold" style={{ color: "var(--color-ds-teal-deep)" }}>✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <AssetSlot
              src={CONTENT_IMAGES.oneStopCare}
              alt="진료 현장"
              className="rounded-2xl overflow-hidden w-full object-cover"
              style={{ aspectRatio: "4/3" }}
              label="진료 현장 사진 영역"
            />
          </div>
        </div>
      </section>

      {/* ============ SPECIALTY CENTERS — 다크 + 가로 스크롤 ============ */}
      <section style={{ background: "var(--color-ds-dark-warm)", color: "#fff" }}>
        <div className="max-w-[1280px] mx-auto px-8 pt-[104px] pb-[18px] text-center">
          <div className="mb-4" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-2)" }}>
            SPECIALTY CENTERS
          </div>
          <h2 className="text-[40px] font-extrabold mb-3.5" style={{ letterSpacing: "-0.03em" }}>
            11개 특화진료센터
          </h2>
          <p className="text-[16.5px]" style={{ color: "#aec6bf" }}>
            분과별 전공의가 한 명의 환자를 함께 봅니다
          </p>
          <div className="mt-[22px]" style={{ font: "600 12px/1 ui-monospace, monospace", letterSpacing: "0.24em", color: "#8fb5ac" }}>
            ← WHEEL · DRAG TO SCROLL →
          </div>
        </div>
        {/* 가로 트랙 — 좌우 edge fade 로 "더 있음" 시각 힌트 */}
        <div className="relative">
          <div
            aria-hidden
            className="hidden md:block absolute inset-y-0 left-0 w-[72px] z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, var(--color-ds-dark-warm), transparent)" }}
          />
          <div
            aria-hidden
            className="hidden md:block absolute inset-y-0 right-0 w-[72px] z-10 pointer-events-none"
            style={{ background: "linear-gradient(270deg, var(--color-ds-dark-warm), transparent)" }}
          />
        <div
          id="centertrack"
          className="centertrack flex gap-[22px] overflow-x-auto"
          style={{ padding: "14px max(32px, calc((100vw - 1280px)/2 + 32px)) 30px" }}
        >
          {CENTERS.map((c) => (
            <Link
              key={c.id}
              to={`/centers/${c.id}`}
              className="ctrcard text-left bg-white rounded-[20px] p-[34px_30px] cursor-pointer flex flex-col gap-3 transition-transform"
              style={{ flex: "0 0 320px", minHeight: 340, color: "var(--color-ds-dark-warm)" }}
            >
              <div className="flex items-center justify-between">
                <span style={{ font: "800 22px/1 ui-monospace, monospace", color: "var(--color-ds-teal-deep)" }}>
                  {c.num}
                </span>
                <span style={{ color: "#cbd6d1", fontSize: 26 }}>→</span>
              </div>
              <div className="text-[26px] font-extrabold mt-2" style={{ color: "var(--color-ds-dark-warm)", lineHeight: 1.28 }}>
                {c.ko}
              </div>
              <div className="text-[13px] font-semibold" style={{ letterSpacing: "0.04em", color: "var(--color-ds-text-sub)" }}>
                {c.en}
              </div>
              {/* 진료 대상 — 2줄까지만, 전체는 센터 상세에서 */}
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
        </div>
        </div>
        <div className="text-center pt-[18px] pb-[104px] px-8">
          <Link
            to="/centers"
            className="inline-block text-[16px] font-bold"
            style={{ background: "var(--color-ds-teal-deep)", color: "#fff", padding: "15px 30px", borderRadius: 999 }}
          >
            특화진료센터 전체 보기 →
          </Link>
        </div>
      </section>

      {/* BY THE NUMBERS 는 hero 통계 스트립·병원소개 페이지와 중복이라 제거 */}

      {/* ============ MEDIA / NOTICES + BLOG ============ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
            <div>
              <div className="mb-3.5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-deep)" }}>
                MEDIA
              </div>
              <h2 className="text-[32px] font-extrabold" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
                다산원 소식 · 진료 케이스
              </h2>
            </div>
            <a
              href={HOSPITAL.blog}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold"
              style={{ background: "#fff", border: "1px solid #dbe3df", color: "var(--color-ds-text)", padding: "12px 22px", borderRadius: 999 }}
            >
              네이버 블로그 →
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 loc">
            {/* 최신 블로그 포스트 — case-archive 자동 생성 데이터 */}
            <div className="flex flex-col gap-px rounded-2xl overflow-hidden" style={{ background: "#e7ece8", border: "1px solid #e7ece8" }}>
              {BLOG_LATEST.map((p) => (
                <a
                  key={p.logNo}
                  href={blogPostUrl(p.logNo)}
                  target="_blank"
                  rel="noreferrer"
                  className="group px-6 py-[18px] flex items-center gap-[18px] transition-colors hover:bg-[#f7faf9]"
                  style={{ background: "#fff" }}
                >
                  {p.thumb && (
                    <img
                      src={p.thumb}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="w-[54px] h-[54px] rounded-[10px] object-cover shrink-0"
                    />
                  )}
                  <span
                    className="text-[12px] font-extrabold shrink-0"
                    style={{ color: "var(--color-ds-teal-deep)", background: "#e2f4f1", padding: "5px 11px", borderRadius: 6 }}
                  >
                    {p.kind === "case" ? "케이스" : "칼럼"}
                  </span>
                  <span className="text-[15.5px] font-semibold flex-1 line-clamp-1" style={{ color: "#2a3b37" }}>
                    {p.title}
                  </span>
                  <span className="text-[13px] shrink-0" style={{ color: "var(--color-ds-text-sub)" }}>{p.date}</span>
                </a>
              ))}
            </div>
            <Link
              to="/cases"
              className="group relative rounded-2xl overflow-hidden flex flex-col justify-end p-6"
              style={{
                minHeight: 180,
                border: "1px solid #e7ece8",
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(4,24,21,0.78) 100%), url(/images/facility/operating-room.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="text-[17px] font-extrabold text-white">
                치료 케이스 아카이브
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </span>
              <span className="text-[13.5px] mt-1" style={{ color: "rgba(255,255,255,0.78)" }}>
                실제 치료 기록 {CASE_ARTICLES.length}건 — 수술·응급·질환 정보
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 24H EMERGENCY BAND ============ */}
      <section className="relative overflow-hidden" style={{ background: "var(--color-ds-dark-3)", color: "#fff" }}>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 90% at 82% 20%, rgba(194,80,74,0.22), transparent 60%)" }}
        />
        <div className="relative max-w-[1280px] mx-auto px-8 py-20 flex flex-wrap items-center justify-between gap-10">
          <div className="max-w-[680px]">
            <div className="inline-flex items-center gap-2.5 mb-5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "#ff9d97" }}>
              <span className="w-[7px] h-[7px] rounded-full animate-pulse-dot" style={{ background: "#ff6b63" }} />
              24H EMERGENCY
            </div>
            <h2 className="serif font-medium" style={{ fontSize: "clamp(26px, 3.4vw, 40px)", lineHeight: 1.4, letterSpacing: "-0.02em" }}>
              한밤중 아이가 이상하다면,
              <br />
              망설이지 말고 전화 주세요.
            </h2>
            <p className="text-[15.5px] mt-4" style={{ color: "#a7bcb5", lineHeight: 1.7 }}>
              365일 24시간 수의사 상주 — 이동 중 대처법부터 안내해 드립니다.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={`tel:${HOSPITAL.phone}`}
              className="inline-flex items-center justify-center gap-3 font-extrabold transition-transform hover:scale-[1.02]"
              style={{ background: "var(--color-ds-teal-deep)", color: "#fff", padding: "20px 36px", borderRadius: 16, fontSize: "clamp(20px, 2.4vw, 27px)" }}
            >
              ☎ {HOSPITAL.phone}
            </a>
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-2 text-[15px] font-bold"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(244,238,228,0.25)", color: "#f4efe6", padding: "13px 24px", borderRadius: 12 }}
            >
              응급 상황 대처 가이드 →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ VISIT US ============ */}
      <section style={{ background: "var(--color-ds-dark-warm)", color: "#fff" }}>
        <div className="max-w-[1280px] mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center loc">
          <div>
            <div className="mb-[18px]" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-2)" }}>
              VISIT US
            </div>
            <h2 className="text-[32px] font-extrabold mb-7 text-white" style={{ letterSpacing: "-0.03em" }}>
              오시는 길 · 진료 안내
            </h2>
            {/* 진료 안내 rows — 테두리 없는 flat 리스트, 라벨 작게 + 값 크게 */}
            <div className="flex flex-col">
              {INFO_ROWS.map((r) => (
                <div
                  key={r.k}
                  className="grid grid-cols-[104px_1fr] items-baseline gap-4 py-[15px]"
                >
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: "var(--color-ds-teal-2)", letterSpacing: "0.02em" }}
                  >
                    {r.k}
                  </span>
                  <span
                    className="text-[17px] font-semibold"
                    style={{ color: "rgba(255,255,255,0.92)", letterSpacing: "-0.015em", lineHeight: 1.5 }}
                  >
                    {r.v}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={HOSPITAL.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-8 items-center gap-2 text-[16px] font-bold"
              style={{ background: "var(--color-ds-teal-deep)", color: "#fff", padding: "14px 24px", borderRadius: 11 }}
            >
              네이버 지도로 길찾기 →
            </a>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ aspectRatio: "16/11", border: "1px solid rgba(255,255,255,0.14)", background: "#0a2e29" }}
          >
            <iframe
              title={`오시는 길 지도 — ${HOSPITAL.address}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(HOSPITAL.address)}&z=16&output=embed&hl=ko`}
              className="w-full h-full"
              style={{ border: 0, filter: "saturate(0.92)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}
