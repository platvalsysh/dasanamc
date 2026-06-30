import type { Route } from "./+types/about";
import {
  HOSPITAL,
  THREE_ONE,
  STRENGTHS_4,
  LEAD_DOCTORS,
  REST_DOCTORS,
  FACILITIES,
  EQUIPMENT,
} from "~/data/dasanone-content";
import { AssetSlot } from "~/components/AssetSlot";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `병원소개 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "다산원동물의료센터의 진심, 의료진, 시설, 장비를 한눈에. 경북대·건국대·충남대 출신 6명 전원 석사 이상 전문 의료진.",
    },
  ];
}

const DARK_HERO_OVERLAYS = (
  <>
    <div className="absolute inset-0" style={{ background: "linear-gradient(150deg,#0a2620 0%,#06201c 55%,#041815 100%)" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(70% 80% at 86% 6%,rgba(176,128,82,0.20),transparent 60%)" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(58% 72% at 8% 94%,rgba(14,157,140,0.16),transparent 62%)" }} />
    <div
      className="absolute right-0 top-0 bottom-0 herobg flex items-center justify-center"
      style={{
        width: "46%",
        background: "repeating-linear-gradient(45deg,rgba(176,128,82,0.10),rgba(176,128,82,0.10) 12px,transparent 12px,transparent 24px)",
      }}
    >
      <span style={{ font: "600 12px ui-monospace, monospace", letterSpacing: "0.14em", color: "#b9a78c" }}>
        배경 이미지 영역
      </span>
    </div>
  </>
);

export default function About() {
  return (
    <>
      {/* dark hero */}
      <div className="darkhero relative overflow-hidden" style={{ background: "#06201c", color: "#f4efe6" }}>
        {DARK_HERO_OVERLAYS}
        <div className="relative max-w-[1280px] mx-auto" style={{ padding: "130px clamp(24px,4vw,64px) 104px" }}>
          <div className="mb-5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "#6ed4c5" }}>
            ABOUT
          </div>
          <h1
            className="font-extrabold"
            style={{ fontSize: "clamp(44px, 6.5vw, 80px)", letterSpacing: "-0.035em", lineHeight: 1.02, color: "#f4efe6" }}
          >
            병원소개
          </h1>
          <p className="text-[17px] mt-[22px] max-w-[540px]" style={{ color: "#c2d0ca", lineHeight: 1.7 }}>
            반려동물과 건강한 동행이 되도록, 다산원동물의료센터가 함께 하겠습니다.
          </p>
        </div>
      </div>

      {/* 3 ONE */}
      <section className="max-w-[1280px] mx-auto px-8 pt-[88px] pb-6">
        <div data-stagger="" className="grid grid-cols-1 md:grid-cols-3 gap-6 three">
          {THREE_ONE.map((t, i) => (
            <div key={i} className="pt-[30px] px-1" style={{ borderTop: "2px solid #0d3a35" }}>
              <div className="mb-2" style={{ font: "800 16px/1 ui-monospace, monospace", color: "var(--color-ds-teal)" }}>{t.tag}</div>
              <div className="text-[21px] font-extrabold mb-3.5" style={{ color: "var(--color-ds-text)" }}>{t.ko}</div>
              <p className="text-[15px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.7 }}>{t.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 strengths */}
      <section className="max-w-[1280px] mx-auto px-8 pt-12 pb-6">
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

      {/* MEDICAL TEAM */}
      <section id="doctors" className="max-w-[1280px] mx-auto px-8 py-16" style={{ scrollMarginTop: 90 }}>
        <div className="mb-10">
          <div className="mb-3.5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal)" }}>
            MEDICAL TEAM
          </div>
          <h2 className="text-[32px] font-extrabold mb-2.5" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
            의료진 소개
          </h2>
          <p className="text-[15.5px]" style={{ color: "var(--color-ds-text-sub)" }}>
            경북대 3 · 건국대 2 · 충남대 1 — 6명 전원 석사 이상의 전문 의료진
          </p>
        </div>

        {/* 대표원장 2명 — 큰 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[26px] mb-[30px] leadgrid">
          {LEAD_DOCTORS.map((d) => (
            <div key={d.name} className="leadcard grid grid-cols-[0.9fr_1.1fr] rounded-[20px] overflow-hidden" style={{ border: "1px solid #e9dfca", background: "#fff" }}>
              <AssetSlot
                style={{ minHeight: 300 }}
                label="대표원장 사진"
              />
              <div className="px-8 py-[34px] flex flex-col justify-center">
                <span className="mb-3.5" style={{ font: "700 12px/1 ui-monospace, monospace", letterSpacing: "0.18em", color: "var(--color-ds-teal)" }}>
                  CHIEF DIRECTOR
                </span>
                <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                  <span className="text-[36px] font-extrabold" style={{ color: "var(--color-ds-text)", letterSpacing: "-0.02em" }}>{d.name}</span>
                  <span className="text-[15px] font-bold" style={{ color: "var(--color-ds-teal)" }}>{d.role}</span>
                </div>
                <p className="text-[14.5px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.75 }}>{d.cred}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 나머지 4명 — 작은 카드 */}
        <div data-stagger="" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 docgrid">
          {REST_DOCTORS.map((d) => (
            <div key={d.name} className="rounded-xl overflow-hidden" style={{ border: "1px solid #e9dfca" }}>
              <AssetSlot
                style={{ aspectRatio: "4 / 3.4" }}
                label="프로필 사진"
              />
              <div className="p-[22px]">
                <div className="flex items-baseline gap-2.5 mb-1.5">
                  <span className="text-[19px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>{d.name}</span>
                  <span className="text-[12.5px] font-bold" style={{ color: "var(--color-ds-teal)" }}>{d.role}</span>
                </div>
                <p className="text-[13px]" style={{ color: "#6b7975", lineHeight: 1.6 }}>{d.cred}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FACILITIES */}
      <section id="facilities" style={{ scrollMarginTop: 90 }}>
        <div className="max-w-[1280px] mx-auto px-8 py-20">
          <div className="mb-9">
            <div className="mb-3.5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal)" }}>
              FACILITIES
            </div>
            <h2 className="text-[32px] font-extrabold" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
              병원 둘러보기
            </h2>
          </div>
          <div data-stagger="" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 facgrid">
            {FACILITIES.map((f) => (
              <div key={f} className="rounded-[10px] overflow-hidden" style={{ border: "1px solid #e9dfca" }}>
                <AssetSlot style={{ aspectRatio: "4/3" }} label="사진 영역" />
                <div className="px-3.5 py-3 text-[13.5px] font-bold" style={{ color: "#2a3b37" }}>{f}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <div className="mb-9">
          <div className="mb-3.5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal)" }}>
            EQUIPMENT
          </div>
          <h2 className="text-[32px] font-extrabold" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
            장비 소개
          </h2>
        </div>
        <div data-stagger="" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] three">
          {EQUIPMENT.map((e) => (
            <div key={e.t} className="pt-[26px] px-1" style={{ borderTop: "2px solid #0d3a35" }}>
              <div className="text-[19px] font-extrabold mb-2.5" style={{ color: "var(--color-ds-text)" }}>{e.t}</div>
              <p className="text-[14.5px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.65 }}>{e.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
