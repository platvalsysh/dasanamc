import type { Route } from "./+types/doctors";
import {
  HOSPITAL,
  LEAD_DOCTORS,
  REST_DOCTORS,
} from "~/data/dasanone-content";
import { DarkPageHero } from "~/components/site/DarkPageHero";
import { AssetSlot } from "~/components/AssetSlot";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `의료진 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "경북대 3 · 건국대 2 · 충남대 1 — 6명 전원 석사 이상의 전문 의료진이 진료합니다.",
    },
  ];
}

export default function AboutDoctors() {
  return (
    <>
      <DarkPageHero
        tag="MEDICAL TEAM"
        title="의료진 소개"
        subtitle="경북대 3 · 건국대 2 · 충남대 1 — 6명 전원 석사 이상의 전문 의료진이 함께합니다."
      />

      <section className="max-w-[1280px] mx-auto px-8 py-20">
        {/* 대표원장 2명 — 큰 카드 */}
        <div className="mb-12">
          <div
            className="mb-7"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            CHIEF DIRECTORS
          </div>
          <h2 className="text-[28px] font-extrabold mb-10" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
            대표원장
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[26px] leadgrid">
            {LEAD_DOCTORS.map((d) => (
              <div
                key={d.name}
                className="leadcard grid grid-cols-[0.9fr_1.1fr] rounded-[20px] overflow-hidden"
                style={{ border: "1px solid #e9dfca", background: "#fff" }}
              >
                <AssetSlot style={{ minHeight: 300 }} label="대표원장 사진" />
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
        </div>

        {/* 나머지 진료의 — 4명 */}
        <div>
          <div
            className="mb-7"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            VETERINARIANS
          </div>
          <h2 className="text-[28px] font-extrabold mb-10" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
            진료의
          </h2>
          <div data-stagger="" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 docgrid">
            {REST_DOCTORS.map((d) => (
              <div key={d.name} className="rounded-xl overflow-hidden" style={{ border: "1px solid #e9dfca" }}>
                <AssetSlot style={{ aspectRatio: "4 / 3.4" }} label="프로필 사진" />
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
        </div>
      </section>
    </>
  );
}
