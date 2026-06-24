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
  HERO_ROTATING_PHRASES,
  SOLUTION_TABS,
  INFO_ROWS,
} from "~/data/dasanone-content";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "경기 남양주 24시 동물병원. 11개 특화진료센터, 대학병원급 CT, 365일 24시간 연중무휴 응급진료.",
    },
  ];
}

export default function Home() {
  // ONE STOP CARE 탭
  const [solTab, setSolTab] = useState(0);
  const activeSol = SOLUTION_TABS[solTab];

  return (
    <>
      {/* ============ HERO (다크, pin) ============ */}
      <section className="relative bg-[color:var(--color-ds-dark)] text-white overflow-hidden">
        {/* pin 영역: ScrollEffects 가 --pinH 를 220vh 로 설정 (모션 허용 시) */}
        <div id="heropin" className="relative" style={{ height: "var(--pinH, 100vh)" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
          {/* radial glow */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 80% 0%, rgba(14,157,140,0.35), transparent 60%)",
            }}
          />
          {/* diagonal stripes */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(125deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 64px)",
            }}
          />
          <div className="relative w-full max-w-[1360px] mx-auto px-11 h-full min-h-[100vh] flex flex-col justify-center">
            {/* 중앙 원형 hero placeholder */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square z-[1]"
              style={{ width: "min(44vw, 520px)" }}
            >
              <div
                className="w-full h-full rounded-full flex flex-col items-center justify-center gap-3.5 border"
                style={{
                  background:
                    "radial-gradient(circle at 50% 36%, rgba(86,200,184,0.30), rgba(14,157,140,0.12) 52%, transparent 72%)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="w-16 h-16 rounded-full flex items-center justify-center text-[color:var(--color-ds-teal-3)] text-[22px]"
                  style={{ border: "2px solid rgba(110,212,197,0.6)" }}
                >
                  ▶
                </span>
                <span
                  className="font-mono text-[11px] font-semibold text-center"
                  style={{ letterSpacing: "0.12em", color: "#7aaaa1" }}
                >
                  HERO 영상 / 대표 이미지
                </span>
              </div>
            </div>

            {/* big split type — top left */}
            <div
              aria-hidden
              className="absolute left-11 top-[13%] z-[2] pointer-events-none"
            >
              <div className="text-sm font-bold text-[color:var(--color-ds-teal-3)] mb-2 pl-2">
                모두를 위한 동물 주치의
              </div>
              <div
                className="font-extrabold leading-[0.84]"
                style={{
                  fontSize: "clamp(68px, 12.5vw, 206px)",
                  letterSpacing: "-0.045em",
                  background:
                    "linear-gradient(178deg, #ffffff 35%, rgba(255,255,255,0.5))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Animal
              </div>
            </div>

            {/* big split type — bottom right */}
            <div
              aria-hidden
              className="absolute right-11 bottom-[15%] z-[2] text-right pointer-events-none"
            >
              <div
                className="font-extrabold leading-[0.84]"
                style={{
                  fontSize: "clamp(68px, 12.5vw, 206px)",
                  letterSpacing: "-0.045em",
                  background:
                    "linear-gradient(178deg, #ffffff 35%, rgba(255,255,255,0.5))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Care
                <span style={{ color: "#0e9d8c", WebkitTextFillColor: "#0e9d8c" }}>.</span>
              </div>
              <div className="text-sm font-bold text-[color:var(--color-ds-teal-3)] mt-2 pr-2">
                다산원동물의료센터
              </div>
            </div>

            {/* hero content (bottom left): chip + rotating title + CTAs */}
            <div id="herocontent" className="absolute left-11 bottom-[11%] z-[3] max-w-[540px]">
              <div className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full text-[12.5px] font-bold border bg-[rgba(86,200,184,0.08)] text-[color:var(--color-ds-teal-3)] mb-4 border-[rgba(86,200,184,0.4)]">
                <span className="w-[7px] h-[7px] rounded-full bg-[color:var(--color-ds-teal-2)] animate-pulse-dot" />
                365일 24시간 연중무휴 응급진료
              </div>
              <h1
                className="font-extrabold text-white"
                style={{
                  fontSize: "clamp(20px, 2.4vw, 32px)",
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                }}
              >
                {/* ScrollEffects 가 스크롤 진행도에 따라 textContent 를 swap */}
                <span id="heroswap" className="inline-block">
                  {HERO_ROTATING_PHRASES[0]}
                </span>
              </h1>
              <p
                className="text-[14.5px] mt-2"
                style={{ color: "#8fbcb4", letterSpacing: "0.01em" }}
              >
                Comprehensive Care for Every Companion
              </p>
              <div className="flex gap-2.5 flex-wrap mt-[22px]">
                <a
                  href={`tel:${HOSPITAL.phone}`}
                  className="flex items-center gap-2 bg-[color:var(--color-ds-teal)] text-white px-6 py-3.5 rounded-[11px] text-[15px] font-bold"
                >
                  전화 예약·문의
                </a>
                <a
                  href="/board/Notice"
                  className="flex items-center gap-2 bg-white/[0.08] border border-white/[0.18] text-white px-6 py-3.5 rounded-[11px] text-[15px] font-bold"
                >
                  온라인 문의
                </a>
              </div>
            </div>

            {/* scroll indicator */}
            <div className="absolute bottom-[22px] left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2">
              <span
                className="font-mono text-[10px] font-semibold"
                style={{ letterSpacing: "0.25em", color: "#74a89f", lineHeight: 1 }}
              >
                SCROLL
              </span>
              <span
                className="w-px h-[34px]"
                style={{
                  background: "linear-gradient(#56c8b8, transparent)",
                }}
              />
            </div>
          </div>
        </div>
        </div>
        {/* pin 종료 */}

        {/* hero stats row */}
        <div className="relative border-t border-white/[0.08]">
          <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4">
            {HERO_STATS.map((s, i) => (
              <div
                key={i}
                className="py-[26px] px-2 border-l border-white/[0.07] first:border-l-0"
              >
                <div
                  className="font-extrabold text-[color:var(--color-ds-teal-2)]"
                  style={{ fontSize: 28, letterSpacing: "-0.02em" }}
                >
                  {s.v}
                </div>
                <div className="text-[13.5px] mt-1" style={{ color: "#9fb0aa" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ marquee ============ */}
      <section
        className="overflow-hidden py-[18px] border-b text-white"
        style={{
          background: "var(--color-ds-dark-2)",
          borderBottomColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex w-max animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-[18px] px-7 text-[15px] font-semibold whitespace-nowrap"
              style={{ color: "#bfcdc8" }}
            >
              {m}
              <span style={{ color: "#2e5249" }}>/</span>
            </span>
          ))}
        </div>
      </section>

      {/* ============ manifesto ============ */}
      <section className="max-w-[1060px] mx-auto px-8 pt-[120px] text-center">
        <div className="font-mono font-bold text-[13px] mb-7 text-[color:var(--color-ds-teal)] tracking-[0.24em] leading-none">
          OUR PROMISE
        </div>
        <p
          data-reveal
          className="font-extrabold text-[color:var(--color-ds-dark-2)]"
          style={{
            fontSize: "clamp(23px, 3.3vw, 38px)",
            lineHeight: 1.5,
            letterSpacing: "-0.03em",
            textWrap: "balance" as any,
          }}
        >
          아픈 아이를 안고 병원 문을 들어서는 보호자님의<br />
          무거운 마음을 누구보다 잘 알기에,{" "}
          <span className="text-[color:var(--color-ds-teal)]">
            다산원동물의료센터는<br />세 가지 'ONE'
          </span>
          을 약속합니다.
        </p>
      </section>

      {/* ============ 3 ONE ============ */}
      <section className="max-w-[1280px] mx-auto px-8 py-[64px_104px] pt-16 pb-[104px]">
        <div className="text-center max-w-[760px] mx-auto mb-[52px]">
          <div className="font-mono font-bold text-[13px] mb-4 text-[color:var(--color-ds-teal)] tracking-[0.22em] leading-none">
            3 ONE SYSTEM
          </div>
          <h2 className="text-[34px] font-extrabold text-[color:var(--color-ds-dark-2)] leading-[1.35]" style={{ letterSpacing: "-0.03em" }}>
            세 가지 'ONE', 다산원이 지키겠습니다
          </h2>
        </div>
        <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {THREE_ONE.map((t, i) => (
            <div key={i} className="border-t-2 border-[color:var(--color-ds-dark-2)] pt-[34px] px-1">
              <div className="font-mono font-extrabold text-[16px] text-[color:var(--color-ds-teal)] mb-2 leading-none">
                {t.tag}
              </div>
              <div className="text-[22px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-4">
                {t.ko}
              </div>
              <p className="text-[15.5px] leading-[1.7]" style={{ color: "var(--color-ds-text-sub)" }}>
                {t.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 4 strengths ============ */}
      <section className="border-t border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-end justify-between gap-6 mb-[52px] flex-wrap">
            <div>
              <div className="font-mono font-bold text-[13px] mb-4 text-[color:var(--color-ds-teal)] tracking-[0.22em] leading-none">
                WHY DASANONE
              </div>
              <h2 className="text-[34px] font-extrabold text-[color:var(--color-ds-dark-2)]" style={{ letterSpacing: "-0.03em" }}>
                왜 다산원동물의료센터일까요?
              </h2>
            </div>
            <p className="text-[16px] max-w-[380px]" style={{ color: "var(--color-ds-text-sub)" }}>
              대학병원급 진단 인프라와 분과별 전공의 협진으로 한 곳에서 완결되는 진료를 제공합니다.
            </p>
          </div>
          <div data-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STRENGTHS_4.map((s, i) => (
              <div key={i} className="border-t border-[#d7ddd5] pt-[26px] px-1">
                <div className="font-mono font-extrabold text-[14px] mb-[22px] leading-none" style={{ color: "#bcc7c2" }}>
                  {s.n}
                </div>
                <div className="text-[18.5px] font-extrabold text-[color:var(--color-ds-dark-2)] leading-[1.4] mb-3">
                  {s.t}
                </div>
                <p className="text-[14.5px] leading-[1.65]" style={{ color: "var(--color-ds-text-sub)" }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ONE STOP CARE (tabs) ============ */}
      <section className="border-t border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto px-8 py-[104px]">
          <div className="text-center mb-11">
            <div className="font-mono font-bold text-[13px] mb-4 text-[color:var(--color-ds-teal)] tracking-[0.22em] leading-none">
              ONE STOP CARE
            </div>
            <h2 className="text-[34px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-3.5" style={{ letterSpacing: "-0.03em" }}>
              진단부터 회복까지, 한 곳에서
            </h2>
            <p className="text-[16.5px]" style={{ color: "var(--color-ds-text-sub)" }}>
              정밀 진단 · 분과 협진 · 수술 · 24시 케어가 끊김 없이 이어지는 원스톱 시스템
            </p>
          </div>
          <div className="flex justify-center gap-14 flex-wrap mb-12 border-b border-[#e3e6ee]">
            {SOLUTION_TABS.map((t, i) => (
              <button
                key={i}
                onClick={() => setSolTab(i)}
                className={
                  "pb-4 px-1 text-[17px] cursor-pointer whitespace-nowrap border-0 border-b-2 -mb-px transition-colors " +
                  (i === solTab
                    ? "font-extrabold text-[color:var(--color-ds-teal)] border-[color:var(--color-ds-teal)]"
                    : "font-semibold text-[#92a39d] border-transparent")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-2">
            <div>
              <h3 className="text-[26px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-4" style={{ letterSpacing: "-0.02em" }}>
                {activeSol.title}
              </h3>
              <p className="text-[16px] leading-[1.75] mb-6" style={{ color: "var(--color-ds-text-sub)" }}>
                {activeSol.desc}
              </p>
              <ul className="list-none flex flex-col gap-[11px]">
                {activeSol.points.map((p, i) => (
                  <li key={i} className="flex gap-[11px] text-[15px] font-semibold" style={{ color: "#2a3b37" }}>
                    <span className="text-[color:var(--color-ds-teal)] font-extrabold">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #e8ece9, #e8ece9 11px, #eef2ef 11px, #eef2ef 22px)",
              }}
            >
              <span className="font-mono font-semibold text-[11px]" style={{ letterSpacing: "0.08em", color: "#9aa9a4" }}>
                진료 현장 사진 영역
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ centers grid ============ */}
      <section className="max-w-[1280px] mx-auto px-8 py-[104px]">
        <div className="text-center mb-14">
          <div className="font-mono font-bold text-[13px] mb-4 text-[color:var(--color-ds-teal)] tracking-[0.22em] leading-none">
            SPECIALTY CENTERS
          </div>
          <h2 className="text-[36px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-3.5" style={{ letterSpacing: "-0.03em" }}>
            11개 특화진료센터
          </h2>
          <p className="text-[16.5px]" style={{ color: "var(--color-ds-text-sub)" }}>
            분과별 전공의가 함께 진단부터 수술, 회복까지 책임지는 원스톱 시스템
          </p>
        </div>
        <div data-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CENTERS.map((c) => (
            <Link
              key={c.id}
              to={`/centers#${c.id}`}
              className="text-left bg-transparent border border-[color:var(--color-ds-border)] rounded-xl px-6 py-[26px] flex flex-col gap-3 transition-colors hover:border-[color:var(--color-ds-teal)] hover:bg-[color:var(--color-ds-teal)]/[0.035]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-[13px] text-[color:var(--color-ds-teal)] leading-none">
                  {c.num}
                </span>
                <span className="text-[18px]" style={{ color: "#cfd8d3" }}>
                  →
                </span>
              </div>
              <div className="text-[19px] font-extrabold text-[color:var(--color-ds-dark-2)] leading-[1.35]">
                {c.ko}
              </div>
              <div className="font-semibold text-[12px]" style={{ letterSpacing: "0.04em", color: "#9aa9a4" }}>
                {c.en}
              </div>
              <p className="text-[13.5px] leading-[1.6] mt-0.5" style={{ color: "#6b7975" }}>
                {c.targets}
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-11">
          <Link
            to="/centers"
            className="inline-block bg-[color:var(--color-ds-dark-2)] text-white px-[30px] py-[15px] rounded-full text-[15px] font-bold"
          >
            특화진료센터 전체 보기 →
          </Link>
        </div>
      </section>

      {/* ============ big stats (dark) ============ */}
      <section
        className="text-white border-t"
        style={{
          background: "var(--color-ds-dark)",
          borderTopColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-8 py-[104px]">
          <div className="max-w-[720px] mb-14">
            <div className="font-mono font-bold text-[13px] mb-4 text-[color:var(--color-ds-teal-2)] tracking-[0.22em] leading-none">
              BY THE NUMBERS
            </div>
            <h2 className="text-[34px] font-extrabold leading-[1.35]" style={{ letterSpacing: "-0.03em" }}>
              다산원동물의료센터의 새로운 기준
            </h2>
            <p className="text-[16px] mt-4" style={{ color: "#aebdb8" }}>
              대학병원급 진단 인프라와 6명의 전문 의료진이 만드는 수준 높은 의료 서비스.
            </p>
          </div>
          <div
            data-stagger
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-[18px] border"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            {STAT_BIG.map((s, i) => (
              <div
                key={i}
                className="px-7 py-[38px]"
                style={{ background: "var(--color-ds-dark)" }}
              >
                <div className="text-[46px] font-extrabold text-[color:var(--color-ds-teal-2)] leading-none" style={{ letterSpacing: "-0.03em" }}>
                  {s.v}
                </div>
                <div className="text-[16px] font-extrabold text-white mt-4">
                  {s.l}
                </div>
                <div className="text-[13px] mt-1.5 leading-[1.5]" style={{ color: "#8ea29b" }}>
                  {s.s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ visit / hours / location (dark) ============ */}
      <section className="text-white" style={{ background: "var(--color-ds-dark)" }}>
        <div className="max-w-[1280px] mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
          <div>
            <div className="font-mono font-bold text-[13px] mb-4.5 text-[color:var(--color-ds-teal-2)] tracking-[0.22em] leading-none">
              VISIT US
            </div>
            <h2 className="text-[32px] font-extrabold mb-7" style={{ letterSpacing: "-0.03em" }}>
              오시는 길 · 진료 안내
            </h2>
            <div
              className="flex flex-col gap-px rounded-[14px] overflow-hidden border"
              style={{
                background: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              {INFO_ROWS.map((r) => (
                <div
                  key={r.k}
                  className="grid grid-cols-[120px_1fr] gap-3 px-5 py-4"
                  style={{ background: "#0a3a35" }}
                >
                  <span className="text-[14px] font-bold" style={{ color: "#6ed4c5" }}>
                    {r.k}
                  </span>
                  <span className="text-[14.5px]" style={{ color: "#dfe8e4" }}>
                    {r.v}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={HOSPITAL.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-5 bg-[color:var(--color-ds-teal)] text-white px-6 py-3.5 rounded-[11px] text-[15px] font-bold"
            >
              네이버 지도로 길찾기 →
            </a>
          </div>
          <div
            className="rounded-[18px] overflow-hidden aspect-[16/11] border flex items-center justify-center"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              background:
                "repeating-linear-gradient(45deg, #0a322e, #0a322e 12px, #0e3a35 12px, #0e3a35 24px)",
            }}
          >
            <span className="font-mono font-semibold text-[12px]" style={{ letterSpacing: "0.1em", color: "#6f8b83" }}>
              네이버 지도 API 영역 — 경기 남양주시 다산중앙로 15
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
