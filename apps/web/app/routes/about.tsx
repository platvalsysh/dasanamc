import { Link } from "react-router";
import type { Route } from "./+types/about";
import { ogMeta } from "~/lib/og";
import {
  HOSPITAL,
  THREE_ONE,
  STRENGTHS_4,
  STAT_BIG,
} from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";
import { Rise, CountUp } from "~/components/site/motion-bits";
import { GoldBadge } from "~/components/site/home-scroll";

export function meta({}: Route.MetaArgs) {
  return ogMeta(`병원소개 — ${HOSPITAL.name}`, "다산원동물의료센터의 진심 — 세 가지 ‘ONE’ 약속과 네 가지 강점을 소개합니다.", "/about");
}

/** WHY DASANONE bento 카드용 강조 지표 */
const STRENGTH_FIGURES = ["협진", "직접 집도", "CT", "ISFM GOLD"] as const;

/** 3 ONE 카드 hover 시 드러나는 실촬영 사진 */
const THREE_ONE_PHOTOS = [
  "/images/facility/exam-hall.jpg",
  "/images/facility/operating-room.jpg",
  "/images/facility/reception.jpg",
] as const;

/** 하위 페이지 CTA 썸네일 */
const SUB_PAGES = [
  { to: "/about/doctors", label: "의료진 소개", desc: "6명 전원 석사 이상의 전문 의료진", thumb: "/images/doctors/lee-hyunwoo.jpg" },
  { to: "/about/facilities", label: "병원 둘러보기", desc: "환자 동선에 맞춰 설계된 12개 공간", thumb: "/images/facility/reception.jpg" },
  { to: "/about/equipment", label: "장비 소개", desc: "분과별 최신 의료 장비 25종", thumb: "/images/facility/ct-room.jpg" },
] as const;

export default function About() {
  return (
    <>
      <StickyBgHero
        bgImage="/images/hero-reception.jpg"
        location={[{ label: "병원소개" }]}
        copy={"반려동물과 건강한 동행,\n다산원동물의료센터가 함께 하겠습니다."}
      />

      {/* GREETING — 대형 serif statement */}
      <section className="max-w-[1080px] mx-auto px-8 pt-28 pb-24 text-center">
        <div
          className="mb-8"
          style={{
            font: "700 13px/1 ui-monospace, monospace",
            letterSpacing: "0.24em",
            color: "var(--color-ds-teal-deep)",
          }}
        >
          GREETING
        </div>
        <Rise blur y={30}>
          <p
            className="serif font-medium text-balance"
            style={{
              fontSize: "clamp(26px, 3.4vw, 44px)",
              lineHeight: 1.5,
              letterSpacing: "-0.02em",
              color: "var(--color-ds-text)",
            }}
          >
            말 못 하는 아이들의 작은 신호 하나까지
            <br />
            놓치지 않는 진료를 약속합니다.
          </p>
        </Rise>
        <Rise delay={0.15} y={20}>
          <p
            className="mt-9 text-[16.5px] max-w-[680px] mx-auto"
            style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.9 }}
          >
            365일 24시간 연중무휴로 운영되는 응급·중환자 시스템과 11개 분과별
            특화센터, 6명의 전공의가 한 명의 환자를 함께 보는 협진 체계로
            내 아이의 가장 가까운 주치의가 되겠습니다.
          </p>
        </Rise>
      </section>

      {/* BY THE NUMBERS — bento 대형 숫자 카드 */}
      <section className="max-w-[1280px] mx-auto px-8 pb-28">
        <div
          data-stagger=""
          className="grid grid-cols-1 md:grid-cols-2 gap-5 four"
        >
          {STAT_BIG.map((s, i) => (
            <div
              key={i}
              className="group rounded-[24px] p-10 md:p-12 flex flex-col justify-between min-h-[240px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(13,58,53,0.12)]"
              style={{ background: "var(--color-ds-bento)" }}
            >
              <div
                className="font-extrabold transition-colors duration-300 group-hover:text-[color:var(--color-ds-teal-deep)]"
                style={{
                  fontSize: "clamp(56px, 7vw, 96px)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  color: "var(--color-ds-text)",
                }}
              >
                <CountUp value={s.v} duration={1.3} />
              </div>
              <div className="mt-8">
                <div className="text-[19px] font-extrabold mb-1.5" style={{ color: "var(--color-ds-text)" }}>
                  {s.l}
                </div>
                <p className="text-[15px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.6 }}>
                  {s.s}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 ONE — 다크 teal statement 섹션 */}
      <section
        className="darkhero py-24 md:py-32"
        data-bg-full="1"
        style={{ background: "var(--color-ds-dark-warm)", color: "#fff" }}
      >
        <div className="max-w-[1280px] mx-auto px-8">
          <SectionHead
            eyebrow="3 ONE SYSTEM"
            title="세 가지 ‘ONE’, 다산원이 지키겠습니다"
            align="center"
            onDark
          />
          <div data-stagger="" className="grid grid-cols-1 md:grid-cols-3 gap-5 three">
            {THREE_ONE.map((t, i) => (
              <div
                key={i}
                className="group relative rounded-[24px] p-9 md:p-10 min-h-[300px] flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                {/* hover 시 실촬영 사진이 은은하게 드러남 */}
                <img
                  src={THREE_ONE_PHOTOS[i]}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-25 group-hover:scale-[1.05]"
                />
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "linear-gradient(180deg, rgba(13,58,53,0.2) 0%, rgba(13,58,53,0.85) 100%)" }}
                />
                <div
                  className="relative font-extrabold mb-auto transition-colors duration-300 group-hover:text-[color:var(--color-ds-teal-3)]"
                  style={{
                    font: "800 clamp(40px, 4.5vw, 60px)/1 ui-monospace, monospace",
                    color: "var(--color-ds-teal-2)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="relative mt-10">
                  <div className="mb-2" style={{ font: "800 14px/1 ui-monospace, monospace", color: "var(--color-ds-teal-3)" }}>
                    {t.tag}
                  </div>
                  <div className="text-[22px] font-extrabold mb-3.5" style={{ color: "#fff" }}>{t.ko}</div>
                  <p className="text-[16px] transition-colors duration-300 group-hover:text-[#d5e6e0]" style={{ color: "#aec6bf", lineHeight: 1.75 }}>{t.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY DASANONE — bento 그리드 */}
      <section className="max-w-[1280px] mx-auto px-8 py-24 md:py-32">
        <SectionHead
          eyebrow="WHY DASANONE"
          title="왜 다산원동물의료센터일까요?"
          desc="대학병원급 진단 인프라와 분과별 전공의 협진으로 한 곳에서 완결되는 진료를 제공합니다."
        />
        <div data-stagger="" className="grid grid-cols-1 md:grid-cols-2 gap-5 four">
          {STRENGTHS_4.map((s, i) => (
            <div
              key={i}
              className="group rounded-[24px] p-10 md:p-12 min-h-[230px] flex flex-col transition-colors duration-300 hover:bg-[color:var(--color-ds-dark-warm)]"
              style={{ background: "var(--color-ds-bento)" }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="transition-colors group-hover:text-[color:var(--color-ds-teal-2)]"
                  style={{
                    font: "800 clamp(34px, 4vw, 52px)/1 ui-monospace, monospace",
                    color: "var(--color-ds-teal-deep)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {s.n}
                </div>
                <div
                  className="font-extrabold text-right transition-colors group-hover:text-[#5d827b]"
                  style={{
                    fontSize: "clamp(17px, 1.8vw, 22px)",
                    color: "#c2ccc8",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {STRENGTH_FIGURES[i]}
                </div>
              </div>
              <div className="mt-auto pt-10">
                <div className="text-[20px] font-extrabold mb-2.5 transition-colors group-hover:text-white" style={{ color: "var(--color-ds-text)", lineHeight: 1.35 }}>
                  {s.t}
                </div>
                <p className="text-[16px] transition-colors group-hover:text-[#aec6bf]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.7 }}>
                  {s.d}
                </p>
                {s.badge && <GoldBadge label={s.badge} />}
              </div>
            </div>
          ))}
        </div>

        {/* 하위 페이지 안내 CTA — 실사진 썸네일 + hover 반전 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUB_PAGES.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex items-center gap-5 rounded-[20px] px-6 py-6 transition-colors hover:bg-[color:var(--color-ds-dark-warm)]"
              style={{ background: "var(--color-ds-bento)" }}
            >
              <div className="w-[64px] h-[64px] rounded-[14px] overflow-hidden shrink-0">
                <img
                  src={card.thumb}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex-1">
                <div
                  className="text-[18px] font-extrabold mb-1 transition-colors group-hover:text-white"
                  style={{ color: "var(--color-ds-text)" }}
                >
                  {card.label}
                </div>
                <p
                  className="text-[13.5px] transition-colors group-hover:text-[#aec6bf]"
                  style={{ color: "var(--color-ds-text-sub)" }}
                >
                  {card.desc}
                </p>
              </div>
              <span
                className="text-[22px] transition-all group-hover:translate-x-1 group-hover:text-[#6ed4c5]"
                style={{ color: "#c2ccc8" }}
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
