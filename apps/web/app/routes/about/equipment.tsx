import type { Route } from "./+types/equipment";
import { HOSPITAL, EQUIPMENT, EQUIPMENT_GROUPS } from "~/data/dasanone-content";
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

      {/* 대표 장비 6종 (기존) */}
      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <div className="mb-10">
          <div
            className="mb-3.5"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            KEY EQUIPMENT
          </div>
          <h2 className="text-[28px] font-extrabold" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
            핵심 장비
          </h2>
        </div>
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

      {/* ===== 분과별 전체 장비 — 블로그 장비소개 기반 ===== */}
      <section className="py-20" style={{ background: "#f7f3ec" }}>
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="mb-12">
            <div
              className="mb-3.5"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.22em",
                color: "var(--color-ds-teal)",
              }}
            >
              ALL EQUIPMENT
            </div>
            <h2 className="text-[28px] font-extrabold mb-3" style={{ letterSpacing: "-0.03em", color: "var(--color-ds-text)" }}>
              분과별 전체 장비
            </h2>
            <p className="text-[15px] max-w-[680px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.75 }}>
              다양한 진료 분야에 맞춘 최신 의료장비를 도입하여
              더 정밀하고 신속한 진료 서비스를 제공하고 있습니다.
            </p>
          </div>

          <div className="flex flex-col gap-14">
            {EQUIPMENT_GROUPS.map((g) => (
              <div key={g.key}>
                <div className="mb-6 pb-4" style={{ borderBottom: "2px solid var(--color-ds-teal)" }}>
                  <h3 className="text-[21px] font-extrabold mb-1.5" style={{ color: "var(--color-ds-text)" }}>
                    {g.title}
                  </h3>
                  <p className="text-[14px]" style={{ color: "var(--color-ds-text-sub)" }}>{g.intro}</p>
                </div>
                <div
                  data-stagger=""
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 three"
                >
                  {g.items.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-xl bg-white p-6"
                      style={{ border: "1px solid #e9dfca" }}
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
