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
    <div className="border border-[color:var(--color-ds-border)] rounded-xl px-6 py-[26px] overflow-x-auto bg-transparent">
      <div className="text-[19px] font-extrabold text-[color:var(--color-ds-text)] mb-1">
        {emoji} {title}
      </div>
      <div className="text-[12.5px] text-[color:var(--color-ds-text-mute)] mb-[18px]">
        {subtitle}
      </div>
      <table className="hcheck w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th className="text-left px-1.5 py-2 border-b-2 border-[color:var(--color-ds-text)] text-[#445] font-bold">
              검진 항목
            </th>
            {["Basic", "Standard", "Premium"].map((p) => (
              <th
                key={p}
                className="px-1 py-2 border-b-2 border-[color:var(--color-ds-text)] text-[#445] font-bold"
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={
                "border-b border-[#f0f2ee] " +
                (r.head ? "bg-[#f6f9f7]" : r.sep ? "border-t border-t-[#0d3a35]" : "")
              }
            >
              <td className="text-left px-1.5 py-1.5 text-[#3a4744]">
                {r.item}
              </td>
              <td className="text-center px-1 py-1.5 text-[color:var(--color-ds-teal)] font-bold">
                {r.b}
              </td>
              <td className="text-center px-1 py-1.5 text-[color:var(--color-ds-teal)] font-bold">
                {r.s}
              </td>
              <td className="text-center px-1 py-1.5 text-[color:var(--color-ds-teal)] font-bold">
                {r.p}
              </td>
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
            SPECIALTY CENTERS
          </div>
          <h1 className="text-[42px] font-extrabold tracking-[-0.03em] leading-[1.3]">
            특화진료센터
          </h1>
          <p className="text-[17px] text-[color:var(--color-ds-text-sub)] mt-4 max-w-[640px]">
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
              className="bg-transparent border-t border-[color:var(--color-ds-border)] pt-[38px] pb-2.5"
              style={{ scrollMarginTop: "100px" }}
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
            className="bg-[#f6f9f7] text-[color:var(--color-ds-text)] rounded-[20px] p-11 border border-[color:var(--color-ds-border)]"
            style={{ scrollMarginTop: "100px" }}
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
                  className="bg-white border border-[color:var(--color-ds-border)] rounded-[13px] px-[18px] py-5"
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
          <p className="text-[13px] text-[color:var(--color-ds-text-mute)] pl-1">
            ※ 표시된 검진 비용은 예시값이며 확정 후 업데이트됩니다. 검진 항목은
            연령·품종·증상에 따라 조정될 수 있어요.
          </p>
        </div>
      </div>
    </>
  );
}
