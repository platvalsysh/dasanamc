import { Link } from "react-router";
import type { Route } from "./+types/centers";
import { HOSPITAL, CENTERS } from "~/data/dasanone-content";
import { DarkPageHero } from "~/components/site/DarkPageHero";

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
      <DarkPageHero
        tag="SPECIALTY CENTERS"
        title="특화진료센터"
        subtitle="분과별 전공의들의 세밀한 협진 체계와 대학병원급 의료 장비로 진단부터 수술, 회복까지 한 곳에서."
      />

      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <div
          data-stagger=""
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 centergrid"
        >
          {CENTERS.map((c) => (
            <Link
              key={c.id}
              to={`/centers/${c.id}`}
              className="block rounded-2xl p-7 transition-all hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(0,0,0,0.08)]"
              style={{
                border: "1px solid #e9dfca",
                background: "#fff",
                color: "var(--color-ds-text)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span style={{ font: "800 18px/1 ui-monospace, monospace", color: "var(--color-ds-teal)" }}>{c.num}</span>
                <span style={{ color: "#cbd6d1", fontSize: 22 }}>→</span>
              </div>
              <div className="text-[22px] font-extrabold mb-1" style={{ color: "var(--color-ds-text)", lineHeight: 1.3 }}>
                {c.ko}
              </div>
              <div className="text-[12.5px] font-semibold mb-4" style={{ letterSpacing: "0.04em", color: "#a59a82" }}>
                {c.en}
              </div>
              <p className="text-[14px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.6 }}>{c.targets}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/centers/checkup"
            className="inline-flex items-center gap-2 text-[15px] font-bold"
            style={{
              background: "#0e9d8c",
              color: "#fff",
              padding: "15px 30px",
              borderRadius: 999,
            }}
          >
            건강검진 프로그램 보기 →
          </Link>
        </div>
      </section>
    </>
  );
}
