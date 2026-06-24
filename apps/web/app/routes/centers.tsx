import type { Route } from "./+types/centers";
import { CENTERS } from "~/data/dasanone-content";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "특화진료센터 - 24시 다산 원동물의료센터" },
    {
      name: "description",
      content:
        "다산원동물의료센터의 11개 특화진료센터 — 분과별 전공의 협진 체계와 대학병원급 의료 장비로 진단부터 수술, 회복까지 한 곳에서.",
    },
  ];
}

export default function Centers() {
  return (
    <>
      {/* ============ HERO (다크) ============ */}
      <div className="text-white px-8 pt-20 pb-[70px]" style={{ background: "var(--color-ds-dark)" }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="font-mono font-bold text-[13px] mb-4.5 text-[color:var(--color-ds-teal-2)] tracking-[0.22em] leading-none">
            SPECIALTY CENTERS
          </div>
          <h1 className="text-[42px] font-extrabold leading-[1.3]" style={{ letterSpacing: "-0.03em" }}>
            특화진료센터
          </h1>
          <p className="text-[17px] mt-4 max-w-[640px]" style={{ color: "#aebdb8" }}>
            분과별 전공의들의 세밀한 협진 체계와 대학병원급 의료 장비로 진단부터 수술, 회복까지 한 곳에서.
          </p>
        </div>
      </div>

      {/* 본문: 좌측 sticky nav + 우측 센터 상세 */}
      <div className="max-w-[1280px] mx-auto px-8 py-14 pb-[100px] grid grid-cols-1 lg:grid-cols-[236px_1fr] gap-12 items-start">
        <aside className="hidden lg:block sticky top-[100px]">
          <div className="font-mono font-bold text-[12px] mb-3.5 pl-3.5 leading-none" style={{ letterSpacing: "0.16em", color: "#9aa9a4" }}>
            CENTERS
          </div>
          <nav className="flex flex-col gap-px">
            {CENTERS.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="text-left bg-transparent border-0 px-3.5 py-[9px] rounded-[9px] text-[14px] font-semibold flex gap-2.5 transition-colors hover:bg-[#eef3ef] hover:text-[color:var(--color-ds-teal)]"
                style={{ color: "#445" }}
              >
                <span className="font-mono font-bold text-[12px]" style={{ color: "#bcc7c2" }}>
                  {c.num}
                </span>
                {c.ko}
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col gap-7 min-w-0">
          {CENTERS.map((c) => (
            <section
              key={c.id}
              id={c.id}
              className="border-t border-[color:var(--color-ds-border)] pt-[38px] pb-2.5"
              style={{ scrollMarginTop: 100 }}
            >
              <div className="flex items-center gap-3.5 mb-[18px]">
                <span className="font-mono font-extrabold text-[14px] text-white bg-[color:var(--color-ds-teal)] px-2.5 py-1.5 rounded-lg leading-none">
                  {c.num}
                </span>
                <div>
                  <div className="text-[24px] font-extrabold text-[color:var(--color-ds-dark-2)] leading-[1.2]">
                    {c.ko}
                  </div>
                  <div className="font-semibold text-[12px] mt-0.5" style={{ letterSpacing: "0.05em", color: "#9aa9a4" }}>
                    {c.en}
                  </div>
                </div>
              </div>
              <div className="border-l-[3px] border-[color:var(--color-ds-teal)] pl-5 mb-[22px]">
                <p className="text-[15.5px] font-bold leading-[1.6]" style={{ color: "#0a7468" }}>
                  {c.slogan}
                </p>
              </div>
              <p className="text-[15.5px] leading-[1.8] mb-6" style={{ color: "#475450" }}>
                {c.overview}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-7">
                <div>
                  <div className="text-[12.5px] font-extrabold mb-3 text-[color:var(--color-ds-teal)]" style={{ letterSpacing: "0.04em" }}>
                    주요 진료 대상
                  </div>
                  <p className="text-[14.5px] leading-[1.75]" style={{ color: "var(--color-ds-text-sub)" }}>
                    {c.targets}
                  </p>
                </div>
                <div>
                  <div className="text-[12.5px] font-extrabold mb-3 text-[color:var(--color-ds-teal)]" style={{ letterSpacing: "0.04em" }}>
                    다산원의 강점
                  </div>
                  <ul className="list-none flex flex-col gap-[9px]">
                    {c.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-[14.5px] leading-[1.6]" style={{ color: "#3a4744" }}>
                        <span className="text-[color:var(--color-ds-teal)] font-extrabold flex-shrink-0">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
