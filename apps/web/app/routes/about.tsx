import type { Route } from "./+types/about";
import {
  HOSPITAL,
  THREE_ONE,
  STRENGTHS_4,
  DOCTORS,
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

export default function About() {
  return (
    <>
      {/* hero */}
      <div className="bg-white text-[color:var(--color-ds-text)] px-8 pt-20 pb-[70px] border-b border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="mb-[18px]"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            ABOUT
          </div>
          <h1 className="text-[42px] font-extrabold tracking-[-0.03em] leading-[1.3]">
            병원소개
          </h1>
          <p className="text-[17px] text-[color:var(--color-ds-text-sub)] mt-4 max-w-[620px]">
            반려동물과 건강한 동행이 되도록, 다산원동물의료센터가 함께 하겠습니다.
          </p>
        </div>
      </div>

      {/* 3 ONE */}
      <section className="max-w-[1280px] mx-auto px-8 pt-[88px] pb-6">
        <div
          data-stagger=""
          className="grid grid-cols-1 md:grid-cols-3 gap-6 three"
        >
          {THREE_ONE.map((t, i) => (
            <div
              key={i}
              className="border-t-2 border-[color:var(--color-ds-text)] pt-[30px] px-1"
            >
              <div
                className="mb-2"
                style={{
                  font: "800 16px/1 ui-monospace, monospace",
                  color: "var(--color-ds-teal)",
                }}
              >
                {t.tag}
              </div>
              <div className="text-[21px] font-extrabold text-[color:var(--color-ds-text)] mb-3.5">
                {t.ko}
              </div>
              <p className="text-[15px] text-[color:var(--color-ds-text-sub)] leading-[1.7]">
                {t.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 strengths */}
      <section className="max-w-[1280px] mx-auto px-8 pt-12 pb-6">
        <div
          data-stagger=""
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 four"
        >
          {STRENGTHS_4.map((s, i) => (
            <div key={i} className="border-t border-[#d7ddd5] pt-[26px] px-1">
              <div
                className="mb-[18px]"
                style={{
                  font: "800 14px/1 ui-monospace, monospace",
                  color: "#bcc7c2",
                }}
              >
                {s.n}
              </div>
              <div className="text-[17px] font-extrabold text-[color:var(--color-ds-text)] leading-[1.4] mb-2.5">
                {s.t}
              </div>
              <p className="text-sm text-[color:var(--color-ds-text-sub)] leading-[1.6]">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MEDICAL TEAM */}
      <section className="max-w-[1280px] mx-auto px-8 py-16">
        <div className="mb-10">
          <div
            className="mb-3.5"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            MEDICAL TEAM
          </div>
          <h2 className="text-[32px] font-extrabold tracking-[-0.03em] text-[color:var(--color-ds-text)] mb-2.5">
            의료진 소개
          </h2>
          <p className="text-[15.5px] text-[color:var(--color-ds-text-sub)]">
            경북대 3 · 건국대 2 · 충남대 1 — 6명 전원 석사 이상의 전문 의료진
          </p>
        </div>
        <div
          data-stagger=""
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px] docgrid"
        >
          {DOCTORS.map((d) => (
            <div
              key={d.name}
              className="bg-transparent border border-[color:var(--color-ds-border)] rounded-xl overflow-hidden"
            >
              <AssetSlot
                style={{ aspectRatio: "4 / 3.4" }}
                label="프로필 사진"
              />
              <div className="p-6">
                <div className="flex items-baseline gap-2.5 mb-1.5">
                  <span className="text-[21px] font-extrabold text-[color:var(--color-ds-text)]">
                    {d.name}
                  </span>
                  <span className="text-[13px] font-bold text-[color:var(--color-ds-teal)]">
                    {d.role}
                  </span>
                </div>
                <p className="text-[13.5px] text-[#6b7975] leading-[1.6]">
                  {d.cred}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FACILITIES */}
      <section className="border-t border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto px-8 py-20">
          <div className="mb-9">
            <div
              className="mb-3.5"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.22em",
                color: "var(--color-ds-teal)",
              }}
            >
              FACILITIES
            </div>
            <h2 className="text-[32px] font-extrabold tracking-[-0.03em] text-[color:var(--color-ds-text)]">
              병원 둘러보기
            </h2>
          </div>
          <div
            data-stagger=""
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 facgrid"
          >
            {FACILITIES.map((f) => (
              <div
                key={f}
                className="rounded-[10px] overflow-hidden border border-[color:var(--color-ds-border)] bg-transparent"
              >
                <AssetSlot
                  style={{ aspectRatio: "4/3" }}
                  label="사진 영역"
                />
                <div className="px-3.5 py-3 text-[13.5px] font-bold text-[#2a3b37]">
                  {f}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPMENT */}
      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <div className="mb-9">
          <div
            className="mb-3.5"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            EQUIPMENT
          </div>
          <h2 className="text-[32px] font-extrabold tracking-[-0.03em] text-[color:var(--color-ds-text)]">
            장비 소개
          </h2>
        </div>
        <div
          data-stagger=""
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] three"
        >
          {EQUIPMENT.map((e) => (
            <div
              key={e.t}
              className="border-t-2 border-[color:var(--color-ds-text)] pt-[26px] px-1"
            >
              <div className="text-[19px] font-extrabold text-[color:var(--color-ds-text)] mb-2.5">
                {e.t}
              </div>
              <p className="text-[14.5px] text-[color:var(--color-ds-text-sub)] leading-[1.65]">
                {e.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
