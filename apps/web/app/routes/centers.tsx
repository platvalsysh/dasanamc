import { Link } from "react-router";
import type { Route } from "./+types/centers";
import { HOSPITAL, CENTERS } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";
import { HERO_IMAGES } from "~/data/stock-images";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `특화진료센터 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "11개 특화진료센터 — 분과별 전공의가 함께 진단부터 수술, 회복까지 책임지는 원스톱 시스템.",
    },
  ];
}

export default function CentersIndex() {
  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.centers}
        location={[{ label: "특화진료센터" }]}
        copy={"분과별 전공의들의 협진으로 완성되는\n11개 특화진료센터"}
        sub="진단부터 수술, 회복까지 — 끊김 없이 이어지는 원스톱 시스템"
      />

      <section className="max-w-[1280px] mx-auto px-8 py-24 md:py-28">
        <SectionHead
          eyebrow="SPECIALTY CENTERS"
          title="아이의 증상에 맞는 센터를 찾아보세요"
          desc="각 분과 전공의가 진단부터 수술, 회복까지 책임집니다."
        />
        <div
          data-stagger=""
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 centergrid"
        >
          {CENTERS.map((c) => (
            <Link
              key={c.id}
              to={`/centers/${c.id}`}
              className="group flex flex-col rounded-[24px] p-9 min-h-[280px] transition-colors hover:bg-[#0d3a35]"
              style={{ background: "#f4f7f6", color: "var(--color-ds-text)" }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="transition-colors group-hover:text-[#56c8b8]"
                  style={{
                    font: "800 clamp(30px, 3.4vw, 44px)/1 ui-monospace, monospace",
                    color: "var(--color-ds-teal)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {c.num}
                </span>
                <span
                  className="transition-all group-hover:translate-x-1 group-hover:text-[#6ed4c5]"
                  style={{ color: "#c2ccc8", fontSize: 24 }}
                >
                  →
                </span>
              </div>
              <div className="mt-auto pt-10">
                <div
                  className="text-[22px] font-extrabold mb-1 transition-colors group-hover:text-white"
                  style={{ color: "var(--color-ds-text)", lineHeight: 1.3 }}
                >
                  {c.ko}
                </div>
                <div
                  className="text-[12px] font-semibold mb-4 transition-colors group-hover:text-[#7d968f]"
                  style={{ letterSpacing: "0.05em", color: "#7d8a85" }}
                >
                  {c.en}
                </div>
                <p
                  className="text-[14px] transition-colors group-hover:text-[#aec6bf]"
                  style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.65 }}
                >
                  {c.targets}
                </p>
              </div>
            </Link>
          ))}

          {/* 12번째 칸 — 건강검진 프로그램 CTA 카드 */}
          <Link
            to="/centers/checkup"
            className="group flex flex-col rounded-[24px] p-9 min-h-[280px] transition-colors hover:bg-[#0a7468]"
            style={{ background: "#0e9d8c", color: "#fff" }}
          >
            <div className="flex items-start justify-between">
              <span
                style={{
                  font: "800 clamp(30px, 3.4vw, 44px)/1 ui-monospace, monospace",
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "-0.03em",
                }}
              >
                ＋
              </span>
              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: "rgba(255,255,255,0.7)", fontSize: 24 }}
              >
                →
              </span>
            </div>
            <div className="mt-auto pt-10">
              <div className="text-[22px] font-extrabold mb-1 text-white" style={{ lineHeight: 1.3 }}>
                건강검진 프로그램
              </div>
              <div className="text-[12px] font-semibold mb-4" style={{ letterSpacing: "0.05em", color: "rgba(255,255,255,0.65)" }}>
                Health Checkup Program
              </div>
              <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.65 }}>
                Basic · Standard · Premium — 연령과 상태에 맞춘 맞춤 검진
              </p>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
