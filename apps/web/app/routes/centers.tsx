import type { Route } from "./+types/centers";
import {
  HOSPITAL,
  CENTERS,
  PROCESS_STEPS,
  DOG_ROWS,
  CAT_ROWS,
  type CheckRow,
} from "~/data/dasanone-content";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `특화진료센터 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "11개 특화진료센터 — 간담낭췌장 · 종양항암 · 심장 · 내시경 · CT영상 · 골관절 · 신경외과 · 일반외과 · 고양이전문 · 응급중환자 · 건강검진. 분과별 전공의 협진.",
    },
  ];
}

function CheckTable({
  title,
  emoji,
  subtitle,
  rows,
}: {
  title: string;
  emoji: string;
  subtitle: string;
  rows: readonly CheckRow[];
}) {
  return (
    <div className="rounded-xl px-6 py-[26px] overflow-x-auto" style={{ border: "1px solid #e9dfca", background: "transparent" }}>
      <div className="text-[19px] font-extrabold mb-1" style={{ color: "var(--color-ds-text)" }}>
        {emoji} {title}
      </div>
      <div className="text-[12.5px] mb-[18px]" style={{ color: "#a59a82" }}>{subtitle}</div>
      <table className="hcheck w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th className="text-left px-1.5 py-2 font-bold" style={{ borderBottom: "2px solid #0d3a35", color: "#445" }}>
              검진 항목
            </th>
            {["Basic", "Standard", "Premium"].map((p) => (
              <th key={p} className="px-1 py-2 font-bold" style={{ borderBottom: "2px solid #0d3a35", color: "#445" }}>
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f0f2ee" }}>
              <td
                data-head={r.head ? "1" : undefined}
                data-sep={r.sep ? "1" : undefined}
                className="text-left px-1.5 py-1.5"
                style={{ color: "#3a4744" }}
              >
                {r.item}
              </td>
              <td className="text-center px-1 py-1.5 font-bold" style={{ color: "var(--color-ds-teal)" }}>{r.b}</td>
              <td className="text-center px-1 py-1.5 font-bold" style={{ color: "var(--color-ds-teal)" }}>{r.s}</td>
              <td className="text-center px-1 py-1.5 font-bold" style={{ color: "var(--color-ds-teal)" }}>{r.p}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Centers() {
  return (
    <>
      {/* dark hero */}
      <div className="darkhero relative overflow-hidden" style={{ background: "#06201c", color: "#f4efe6" }}>
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
        <div className="relative max-w-[1280px] mx-auto" style={{ padding: "130px clamp(24px,4vw,64px) 104px" }}>
          <div className="mb-5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "#6ed4c5" }}>
            SPECIALTY CENTERS
          </div>
          <h1
            className="font-extrabold"
            style={{ fontSize: "clamp(44px, 6.5vw, 80px)", letterSpacing: "-0.035em", lineHeight: 1.02, color: "#f4efe6" }}
          >
            특화진료센터
          </h1>
          <p className="text-[17px] mt-[22px] max-w-[560px]" style={{ color: "#c2d0ca", lineHeight: 1.7 }}>
            분과별 전공의들의 세밀한 협진 체계와 대학병원급 의료 장비로
            진단부터 수술, 회복까지 한 곳에서.
          </p>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-8 pt-14 pb-[100px] ctrwrap">
        <div className="flex flex-col gap-7 min-w-0">
          {CENTERS.map((c) => (
            <section
              key={c.id}
              id={c.id}
              className="pt-[38px] pb-2.5"
              style={{ scrollMarginTop: "100px", background: "transparent", borderTop: "1px solid #e9dfca" }}
            >
              <div className="flex items-center gap-3.5 mb-[18px]">
                <span
                  className="text-white bg-[color:var(--color-ds-teal)] px-2.5 py-[7px] rounded-lg"
                  style={{
                    font: "800 14px/1 ui-monospace, monospace",
                  }}
                >
                  {c.num}
                </span>
                <div>
                  <div className="text-2xl font-extrabold text-[color:var(--color-ds-text)] leading-[1.2]">
                    {c.ko}
                  </div>
                  <div className="text-xs font-semibold tracking-[0.05em] text-[color:var(--color-ds-text-mute)] mt-[3px]">
                    {c.en}
                  </div>
                </div>
              </div>
              <div className="border-l-[3px] border-[color:var(--color-ds-teal)] pl-5 py-0.5 mb-[22px]">
                <p className="text-[15.5px] font-bold text-[#0a7468] leading-[1.6]">
                  {c.slogan}
                </p>
              </div>
              <p className="text-[15.5px] text-[#475450] leading-[1.8] mb-6">
                {c.overview}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-7 ctrbody">
                <div>
                  <div className="text-[12.5px] font-extrabold tracking-[0.04em] text-[color:var(--color-ds-teal)] mb-3">
                    주요 진료 대상
                  </div>
                  <p className="text-[14.5px] text-[color:var(--color-ds-text-sub)] leading-[1.75]">
                    {c.targets}
                  </p>
                </div>
                <div>
                  <div className="text-[12.5px] font-extrabold tracking-[0.04em] text-[color:var(--color-ds-teal)] mb-3">
                    다산원의 강점
                  </div>
                  <ul className="list-none flex flex-col gap-2.5">
                    {c.strengths.map((s) => (
                      <li
                        key={s}
                        className="flex gap-2.5 text-[14.5px] text-[#3a4744] leading-[1.6]"
                      >
                        <span className="text-[color:var(--color-ds-teal)] font-extrabold shrink-0">
                          ✓
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}

          {/* 건강검진 패키지 */}
          <section
            id="checkup"
            className="rounded-[20px] p-11"
            style={{
              scrollMarginTop: "100px",
              background: "#f4f7f5",
              color: "var(--color-ds-text)",
              border: "1px solid #e7ece8",
            }}
          >
            <div
              className="mb-3"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.18em",
                color: "var(--color-ds-teal)",
              }}
            >
              HEALTH CHECKUP
            </div>
            <h2 className="text-[28px] font-extrabold tracking-[-0.02em] mb-3.5">
              건강검진 프로그램
            </h2>
            <p className="text-[15px] text-[color:var(--color-ds-text-sub)] leading-[1.7] max-w-[760px] mb-9">
              최신 의료 가이드라인을 반영한 검진 프로그램을 운영하며, 결과는
              보호자와 충분히 상담하여 생활습관·연령·질환 이력에 맞춘 맞춤형
              건강관리 계획으로 이어집니다.
            </p>
            <div
              data-stagger=""
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 proc"
            >
              {PROCESS_STEPS.map((p) => (
                <div
                  key={p.n}
                  className="bg-white rounded-[13px] px-[18px] py-5"
                  style={{ border: "1px solid #e7ece8" }}
                >
                  <div
                    className="mb-3"
                    style={{
                      font: "800 15px/1 ui-monospace, monospace",
                      color: "var(--color-ds-teal)",
                    }}
                  >
                    {p.n}
                  </div>
                  <div className="text-[15px] font-extrabold mb-2">{p.t}</div>
                  <p className="text-[12.5px] text-[color:var(--color-ds-text-sub)] leading-[1.55]">
                    {p.d}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 tablewrap">
            <CheckTable
              title="강아지 건강검진"
              emoji="🐶"
              subtitle="Dog Health Check"
              rows={DOG_ROWS}
            />
            <CheckTable
              title="고양이 건강검진"
              emoji="🐱"
              subtitle="Cat Health Check"
              rows={CAT_ROWS}
            />
          </div>
          <p className="text-[13px] pl-1" style={{ color: "#a59a82" }}>
            ※ 표시된 검진 비용은 예시값이며 확정 후 업데이트됩니다. 검진 항목은
            연령·품종·증상에 따라 조정될 수 있어요.
          </p>
        </div>
      </div>
    </>
  );
}
