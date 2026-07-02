import type { Route } from "./+types/equipment";
import { HOSPITAL, EQUIPMENT, EQUIPMENT_GROUPS } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";
import { HERO_IMAGES } from "~/data/stock-images";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `장비 안내 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "대학병원급 CT, 고사양 초음파, 동물용 HFNC, C-arm, 내시경, ICU — 정확한 진단과 안전한 수술을 위한 의료 장비.",
    },
  ];
}

export default function AboutEquipment() {
  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.equipment}
        location={[{ label: "병원소개", to: "/about" }, { label: "장비 소개" }]}
        copy={"정확한 진단과 안전한 치료,\n대학병원급 의료 장비가 뒷받침합니다."}
        sub="외과 · 영상 · 내과 · 안과 — 분과별 최신 장비 25종"
      />

      {/* 대표 장비 6종 (기존) */}
      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <SectionHead
          eyebrow="KEY EQUIPMENT"
          title="핵심 장비"
          desc="진료의 기준을 바꾸는 대학병원급 핵심 장비 6종."
        />
        <div
          data-stagger=""
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 three"
        >
          {EQUIPMENT.map((e, i) => (
            <div
              key={e.t}
              className="rounded-[24px] p-9 min-h-[260px] flex flex-col"
              style={{ background: "#f4f7f6" }}
            >
              <div
                style={{
                  font: "800 clamp(28px, 3vw, 38px)/1 ui-monospace, monospace",
                  color: "var(--color-ds-teal)",
                  letterSpacing: "-0.02em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-auto pt-9">
                <div
                  className="text-[19px] font-extrabold mb-2.5"
                  style={{ color: "var(--color-ds-text)" }}
                >
                  {e.t}
                </div>
                <p
                  className="text-[14px]"
                  style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.7 }}
                >
                  {e.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 분과별 전체 장비 — 블로그 장비소개 기반 ===== */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-8">
          <SectionHead
            eyebrow="ALL EQUIPMENT"
            title="분과별 전체 장비"
            desc="다양한 진료 분야에 맞춘 최신 의료장비를 도입하여 더 정밀하고 신속한 진료 서비스를 제공하고 있습니다."
          />

          <div className="flex flex-col gap-14">
            {EQUIPMENT_GROUPS.map((g) => (
              <div key={g.key}>
                <div className="mb-7 pb-5 flex items-end gap-5" style={{ borderBottom: "2px solid var(--color-ds-text)" }}>
                  <h3
                    className="font-extrabold"
                    style={{ fontSize: "clamp(24px, 2.4vw, 32px)", letterSpacing: "-0.02em", color: "var(--color-ds-text)" }}
                  >
                    {g.title}
                  </h3>
                  <p className="text-[14px] pb-1" style={{ color: "var(--color-ds-text-sub)" }}>{g.intro}</p>
                </div>
                <div
                  data-stagger=""
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 three"
                >
                  {g.items.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-[18px] p-7"
                      style={{ background: "#f4f7f6" }}
                    >
                      <div className="text-[15.5px] font-extrabold mb-2" style={{ color: "var(--color-ds-text)" }}>
                        {item.name}
                      </div>
                      <p className="text-[13.5px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.7 }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
