import type { Route } from "./+types/about";
import {
  HOSPITAL,
  THREE_ONE,
  STRENGTHS_4,
} from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `병원소개 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "다산원동물의료센터의 진심 — 세 가지 ‘ONE’ 약속과 네 가지 강점을 소개합니다.",
    },
  ];
}

export default function About() {
  return (
    <>
      <StickyBgHero
        bgImage="/images/hero-reception.jpg"
        subtitle="반려동물과 건강한 동행,
다산원동물의료센터가 함께 하겠습니다."
      />

      {/* 인사말 placeholder — 추후 본문 보강 */}
      <section className="max-w-[920px] mx-auto px-8 pt-[88px] pb-12 text-center">
        <div
          className="mb-7"
          style={{
            font: "700 13px/1 ui-monospace, monospace",
            letterSpacing: "0.24em",
            color: "var(--color-ds-orange)",
          }}
        >
          GREETING
        </div>
        <p
          data-reveal=""
          className="font-extrabold text-balance"
          style={{
            fontSize: "clamp(22px, 3vw, 34px)",
            lineHeight: 1.55,
            letterSpacing: "-0.025em",
            color: "var(--color-ds-text)",
          }}
        >
          말 못 하는 아이들의 작은 신호 하나까지<br />
          놓치지 않는 진료, 다산원동물의료센터가 약속합니다.
        </p>
        <p className="mt-7 text-[16px] max-w-[640px] mx-auto" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.85 }}>
          365일 24시간 연중무휴로 운영되는 응급·중환자 시스템과 11개 분과별
          특화센터, 6명의 전공의가 한 명의 환자를 함께 보는 협진 체계로
          내 아이의 가장 가까운 주치의가 되겠습니다.
        </p>
      </section>

      {/* 3 ONE — 홈의 SPECIALTY CENTERS 와 통일된 다크 teal 섹션 */}
      <section
        className="darkhero py-20 md:py-24"
        data-bg-full="1"
        style={{ background: "#0d3a35", color: "#fff" }}
      >
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center max-w-[760px] mx-auto mb-12">
            <div
              className="mb-4"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.22em",
                color: "#56c8b8",
              }}
            >
              3 ONE SYSTEM
            </div>
            <h2 className="text-[32px] font-extrabold" style={{ letterSpacing: "-0.03em", lineHeight: 1.35, color: "#fff" }}>
              세 가지 ‘ONE’, 다산원이 지키겠습니다
            </h2>
          </div>
          <div data-stagger="" className="grid grid-cols-1 md:grid-cols-3 gap-6 three">
            {THREE_ONE.map((t, i) => (
              <div key={i} className="pt-[30px] px-1" style={{ borderTop: "2px solid #6ed4c5" }}>
                <div className="mb-2" style={{ font: "800 16px/1 ui-monospace, monospace", color: "#6ed4c5" }}>{t.tag}</div>
                <div className="text-[21px] font-extrabold mb-3.5" style={{ color: "#fff" }}>{t.ko}</div>
                <p className="text-[15px]" style={{ color: "#aec6bf", lineHeight: 1.7 }}>{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 strengths */}
      <section className="max-w-[1280px] mx-auto px-8 pt-12 pb-24">
        <div className="text-center max-w-[760px] mx-auto mb-12">
          <div
            className="mb-4"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            WHY DASANONE
          </div>
          <h2 className="text-[32px] font-extrabold" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
            왜 다산원동물의료센터일까요?
          </h2>
        </div>
        <div data-stagger="" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 four">
          {STRENGTHS_4.map((s, i) => (
            <div key={i} className="pt-[26px] px-1" style={{ borderTop: "1px solid #ddd0b8" }}>
              <div className="mb-[18px]" style={{ font: "800 14px/1 ui-monospace, monospace", color: "#c9bda3" }}>{s.n}</div>
              <div className="text-[17px] font-extrabold mb-2.5" style={{ color: "var(--color-ds-text)", lineHeight: 1.4 }}>{s.t}</div>
              <p className="text-sm" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
