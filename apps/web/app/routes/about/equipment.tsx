import type { Route } from "./+types/equipment";
import { HOSPITAL, EQUIPMENT } from "~/data/dasanone-content";
import { DarkPageHero } from "~/components/site/DarkPageHero";

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
      <DarkPageHero
        tag="EQUIPMENT"
        title="장비 소개"
        subtitle="대학병원급 진단 인프라 — 진료부터 수술, 회복까지 빈틈없이 책임지는 핵심 의료 장비."
      />

      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <div
          data-stagger=""
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 three"
        >
          {EQUIPMENT.map((e) => (
            <div
              key={e.t}
              className="pt-[28px] px-1"
              style={{ borderTop: "2px solid #0d3a35" }}
            >
              <div
                className="text-[21px] font-extrabold mb-3"
                style={{ color: "var(--color-ds-text)" }}
              >
                {e.t}
              </div>
              <p
                className="text-[14.5px]"
                style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.75 }}
              >
                {e.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
