import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import {
  HOSPITAL,
  THREE_ONE,
  STRENGTHS_4,
  CENTERS,
  HERO_STATS,
  STAT_BIG,
  MARQUEE_ITEMS,
  SOLUTION_TABS,
  INFO_ROWS,
} from "~/data/dasanone-content";
import { BLOG_LATEST, CASE_ARTICLES, blogPostUrl } from "~/data/case-archive";
import { AssetSlot } from "~/components/AssetSlot";
import { SectionHead } from "~/components/site/SectionHead";
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
      {/* ============ HERO (다크, pin 220vh) ============ */}
      <section className="darkhero relative" style={{ background: "#06201c", color: "#f4efe6" }}>
        <div id="heropin" className="relative" style={{ height: "var(--pinH, 100vh)" }}>
          <div
            className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center"
            style={{ background: "linear-gradient(165deg,#0a2620 0%,#06201c 46%,#041815 100%)" }}
          >
            <img
              src="/images/hero-reception.jpg"
              alt="다산원동물의료센터 리셉션"
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: "cover", objectPosition: "center 38%" }}
            />
            {/* overlays */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,rgba(8,34,29,0.22) 0%,rgba(6,30,26,0.30) 45%,rgba(4,22,19,0.42) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 78% 12%,rgba(176,128,82,0.22),transparent 62%)" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(60% 70% at 16% 86%,rgba(14,157,140,0.20),transparent 64%)" }} />
            <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(125deg,rgba(255,255,255,0.02) 0 1px,transparent 1px 66px)" }} />

            <div className="relative w-full h-full max-w-[1360px] mx-auto px-11 flex items-center">
              {/* main hero content */}
              <div id="herocontent" className="relative z-[3] max-w-[820px]">
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
                  <span className="w-[7px] h-[7px] rounded-full animate-pulse-dot" style={{ background: "#6ed4c5" }} />
                  365일 24시간 연중무휴 응급진료
                </div>
                <h1
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
                  <span style={{ color: "#6ed4c5", WebkitTextFillColor: "#6ed4c5" }}>다산원동물의료센터</span>
                </h1>
                <div
                  className="mt-7"
                  style={{
                    fontSize: "clamp(18px, 2vw, 24px)",
                    lineHeight: 1.4,
                    letterSpacing: "-0.015em",
                    fontWeight: 700,
                    color: "#f4efe6",
                  }}
                >
                  <span id="heroswap" className="inline-block">수준 높은 의료 서비스</span>
                </div>
                <p className="text-[14.5px] mt-2" style={{ color: "#b3c2bc", letterSpacing: "0.01em" }}>
                  Comprehensive Care for Every Companion
                </p>
                <div className="flex gap-2.5 flex-wrap mt-7">
                  <a
                    href={`tel:${HOSPITAL.phone}`}
                    className="flex items-center gap-2 text-[15px] font-bold"
                    style={{ background: "#0e9d8c", color: "#fff", padding: "14px 24px", borderRadius: 11 }}
                  >
                    전화 예약·문의
                  </a>
                  <Link
                    to="/support#contactform"
                    className="flex items-center gap-2 text-[15px] font-bold"
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

              <div id="heroscroll" className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2">
                <span style={{ font: "600 10px/1 ui-monospace, monospace", letterSpacing: "0.25em", color: "#b9a78c" }}>SCROLL</span>
                <span className="w-px" style={{ height: 34, background: "linear-gradient(#6ed4c5,transparent)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* hero stats strip — 다크 */}
        <div className="relative" style={{ background: "#041815" }}>
          <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-4 statgrid">
            {HERO_STATS.map((s, i) => (
              <div
                key={i}
                className="py-7 px-2"
                style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(244,238,228,0.12)" }}
              >
                <div className="text-[28px] font-extrabold" style={{ color: "#6ed4c5", letterSpacing: "-0.02em" }}>{s.v}</div>
                <div className="text-[13.5px] mt-1" style={{ color: "#a7bcb5" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <section className="bg-white overflow-hidden py-[18px]">
        <div className="flex w-max gap-0 animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 px-7 text-[15px] font-semibold whitespace-nowrap"
              style={{ color: "#5c6b68" }}
            >
              {m}
              <span style={{ color: "#cfd8d3" }}>/</span>
            </span>
          ))}
        </div>
      </section>

      {/* ============ OUR PROMISE ============ */}
      <section className="max-w-[1060px] mx-auto px-8 pt-[120px] text-center">
        <div className="mb-7" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.24em", color: "var(--color-ds-teal)" }}>
          OUR PROMISE
        </div>
        <p
          data-reveal=""
          className="serif font-medium text-balance"
          style={{ fontSize: "clamp(25px, 3.6vw, 42px)", lineHeight: 1.55, letterSpacing: "-0.025em", color: "var(--color-ds-text)" }}
        >
          아픈 아이를 안고 병원 문을 들어서는 보호자님의<br />
          무거운 마음을 누구보다 잘 알기에,{" "}
          <span style={{ color: "var(--color-ds-teal)" }}>
            다산원동물의료센터는<br />세 가지 ‘ONE’
          </span>
          을 약속합니다.
        </p>
      </section>

      {/* ============ 3 ONE SYSTEM — bento ============ */}
      <section className="max-w-[1280px] mx-auto px-8 pt-20 pb-[104px]">
        <SectionHead
          eyebrow="3 ONE SYSTEM"
          title="세 가지 ‘ONE’, 다산원이 지키겠습니다"
          align="center"
        />
        <div data-stagger="" className="grid gap-5 grid-cols-1 md:grid-cols-3 three">
          {THREE_ONE.map((t, i) => (
            <div
              key={i}
              className="group relative rounded-[24px] p-9 md:p-10 min-h-[420px] flex flex-col overflow-hidden"
              style={{ background: "#06201c" }}
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
                style={{ background: "linear-gradient(180deg, rgba(4,24,21,0.30) 0%, rgba(4,24,21,0.55) 45%, rgba(4,24,21,0.88) 100%)" }}
              />
              <div
                className="relative"
                style={{
                  font: "800 clamp(40px, 4.5vw, 60px)/1 ui-monospace, monospace",
                  color: "#6ed4c5",
                  letterSpacing: "-0.03em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="relative mt-auto pt-10">
                <div className="mb-2" style={{ font: "800 14px/1 ui-monospace, monospace", color: "#56c8b8" }}>
                  {t.tag}
                </div>
                <div className="text-[24px] font-extrabold mb-3.5 text-white">{t.ko}</div>
                <p className="text-[15px]" style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75 }}>{t.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ WHY DASANONE — bento 2×2 ============ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <SectionHead
            eyebrow="WHY DASANONE"
            title="왜 다산원동물의료센터일까요?"
            desc="대학병원급 진단 인프라와 분과별 전공의 협진으로 한 곳에서 완결되는 진료를 제공합니다."
          />
          <div data-stagger="" className="grid grid-cols-1 md:grid-cols-2 gap-5 four">
            {STRENGTHS_4.map((s) => (
              <div
                key={s.n}
                className="group rounded-[24px] p-10 md:p-12 min-h-[230px] flex flex-col transition-colors duration-300 hover:bg-[#0d3a35]"
                style={{ background: "#f4f7f6" }}
              >
                <div
                  className="transition-colors group-hover:text-[#56c8b8]"
                  style={{
                    font: "800 clamp(34px, 4vw, 52px)/1 ui-monospace, monospace",
                    color: "var(--color-ds-teal)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {s.n}
                </div>
                <div className="mt-auto pt-10">
                  <div
                    className="text-[20px] font-extrabold mb-2.5 transition-colors group-hover:text-white"
                    style={{ color: "var(--color-ds-text)", lineHeight: 1.35 }}
                  >
                    {s.t}
                  </div>
                  <p
                    className="text-[15px] transition-colors group-hover:text-[#aec6bf]"
                    style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.7 }}
                  >
                    {s.d}
                  </p>
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
            <div className="mb-4" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal)" }}>
              ONE STOP CARE
            </div>
            <h2 className="text-[34px] font-extrabold mb-3.5" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
              진단부터 회복까지, 한 곳에서
            </h2>
            <p className="text-[16.5px]" style={{ color: "var(--color-ds-text-sub)" }}>
              정밀 진단 · 분과 협진 · 수술 · 24시 케어가 끊김 없이 이어지는 원스톱 시스템
            </p>
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
              <h3 className="text-[26px] font-extrabold mb-4" style={{ letterSpacing: "-0.02em", color: "var(--color-ds-text)" }}>
                {activeSol.title}
              </h3>
              <p className="text-base mb-6" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.75 }}>
                {activeSol.desc}
              </p>
              <ul className="list-none flex flex-col gap-[11px]">
                {activeSol.points.map((p) => (
                  <li key={p} className="flex gap-[11px] text-[15px] font-semibold" style={{ color: "#2a3b37" }}>
                    <span className="font-extrabold" style={{ color: "var(--color-ds-teal)" }}>✓</span>
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
      <section style={{ background: "#0d3a35", color: "#fff" }}>
        <div className="max-w-[1280px] mx-auto px-8 pt-[104px] pb-[18px] text-center">
          <div className="mb-4" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "#56c8b8" }}>
            SPECIALTY CENTERS
          </div>
          <h2 className="text-[40px] font-extrabold mb-3.5" style={{ letterSpacing: "-0.03em" }}>
            11개 특화진료센터
          </h2>
          <p className="text-[16.5px]" style={{ color: "#aec6bf" }}>
            분과별 전공의가 함께 진단부터 수술, 회복까지 책임지는 원스톱 시스템
          </p>
          <div className="mt-[22px]" style={{ font: "600 11px/1 ui-monospace, monospace", letterSpacing: "0.24em", color: "#5b7d76" }}>
            ← WHEEL · DRAG TO SCROLL →
          </div>
        </div>
        <div
          id="centertrack"
          className="centertrack flex gap-[22px] overflow-x-auto"
          style={{ padding: "14px max(32px, calc((100vw - 1280px)/2 + 32px)) 30px" }}
        >
          {CENTERS.map((c) => (
            <Link
              key={c.id}
              to={`/centers/${c.id}`}
              className="ctrcard text-left bg-white rounded-[20px] p-[40px_34px] cursor-pointer flex flex-col gap-3.5 transition-transform"
              style={{ flex: "0 0 360px", minHeight: 460, color: "#0d3a35" }}
            >
              <div className="flex items-center justify-between">
                <span style={{ font: "800 22px/1 ui-monospace, monospace", color: "var(--color-ds-teal)" }}>
                  {c.num}
                </span>
                <span style={{ color: "#cbd6d1", fontSize: 26 }}>→</span>
              </div>
              <div className="text-[28px] font-extrabold mt-2.5" style={{ color: "#0d3a35", lineHeight: 1.28 }}>
                {c.ko}
              </div>
              <div className="text-[13px] font-semibold" style={{ letterSpacing: "0.04em", color: "#9aa9a4" }}>
                {c.en}
              </div>
              <p className="text-[15px] mt-auto" style={{ color: "#5c6b68", lineHeight: 1.65 }}>
                {c.targets}
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center pt-[18px] pb-[104px] px-8">
          <Link
            to="/centers"
            className="inline-block text-[15px] font-bold"
            style={{ background: "#0e9d8c", color: "#fff", padding: "15px 30px", borderRadius: 999 }}
          >
            특화진료센터 전체 보기 →
          </Link>
        </div>
      </section>

      {/* ============ BY THE NUMBERS — 다크 + CT실 배경 ============ */}
      <section className="relative overflow-hidden" style={{ background: "#062b28", color: "#fff" }}>
        <img
          src="/images/facility/ct-room.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.16 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(6,43,40,0.55) 0%, rgba(6,43,40,0.92) 70%, #062b28 100%)" }}
        />
        <div className="relative max-w-[1280px] mx-auto px-8 py-[104px]">
          <div className="max-w-[720px] mb-14">
            <div className="mb-4" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "#56c8b8" }}>
              BY THE NUMBERS
            </div>
            <h2 className="text-[34px] font-extrabold" style={{ letterSpacing: "-0.03em", lineHeight: 1.35 }}>
              다산원동물의료센터의 새로운 기준
            </h2>
            <p className="text-base mt-4" style={{ color: "#aec6bf" }}>
              대학병원급 진단 인프라와 6명의 전문 의료진이 만드는 수준 높은 의료 서비스.
            </p>
          </div>
          <div
            data-stagger=""
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-[18px] overflow-hidden four"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {STAT_BIG.map((s, i) => (
              <div key={i} className="p-[38px_28px] backdrop-blur-[2px]" style={{ background: "rgba(6,43,40,0.78)" }}>
                <div className="text-[46px] font-extrabold" style={{ color: "#56c8b8", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.v}
                </div>
                <div className="text-base font-extrabold mt-4">{s.l}</div>
                <div className="text-[13px] mt-1.5" style={{ color: "#8ea29b", lineHeight: 1.5 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MEDIA / NOTICES + BLOG ============ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
            <div>
              <div className="mb-3.5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal)" }}>
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
                    className="text-[11.5px] font-extrabold shrink-0"
                    style={{ color: "var(--color-ds-teal)", background: "#e2f4f1", padding: "5px 11px", borderRadius: 6 }}
                  >
                    {p.kind === "case" ? "케이스" : "칼럼"}
                  </span>
                  <span className="text-[15.5px] font-semibold flex-1 line-clamp-1" style={{ color: "#2a3b37" }}>
                    {p.title}
                  </span>
                  <span className="text-[13px] shrink-0" style={{ color: "#8a948f" }}>{p.date}</span>
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
      <section className="relative overflow-hidden" style={{ background: "#041815", color: "#fff" }}>
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
              365일 24시간 수의사가 상주합니다. 이동 중 응급 대처법 안내부터 도착 즉시 처치까지.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={`tel:${HOSPITAL.phone}`}
              className="inline-flex items-center justify-center gap-3 font-extrabold transition-transform hover:scale-[1.02]"
              style={{ background: "#0e9d8c", color: "#fff", padding: "20px 36px", borderRadius: 16, fontSize: "clamp(20px, 2.4vw, 27px)" }}
            >
              ☎ {HOSPITAL.phone}
            </a>
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-2 text-[14.5px] font-bold"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(244,238,228,0.25)", color: "#f4efe6", padding: "13px 24px", borderRadius: 12 }}
            >
              응급 상황 대처 가이드 →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ VISIT US ============ */}
      <section style={{ background: "#0d3a35", color: "#fff" }}>
        <div className="max-w-[1280px] mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center loc">
          <div>
            <div className="mb-[18px]" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "#56c8b8" }}>
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
                    style={{ color: "#56c8b8", letterSpacing: "0.02em" }}
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
              className="inline-flex mt-8 items-center gap-2 text-[15px] font-bold"
              style={{ background: "#0e9d8c", color: "#fff", padding: "14px 24px", borderRadius: 11 }}
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
