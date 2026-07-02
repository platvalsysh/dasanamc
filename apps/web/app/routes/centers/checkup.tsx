import type { Route } from "./+types/checkup";
import {
  HOSPITAL,
  PROCESS_STEPS,
  DOG_ROWS,
  CAT_ROWS,
  CHECKUP_GUIDE,
  type CheckRow,
} from "~/data/dasanone-content";
import { DarkPageHero } from "~/components/site/DarkPageHero";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `건강검진 프로그램 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "최신 의료 가이드라인 기반의 5단계 검진 프로세스 — 강아지/고양이별 Basic·Standard·Premium 패키지로 운영.",
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
            <th className="text-left px-1.5 py-2 font-bold" style={{ borderBottom: "2px solid #0d3a35", color: "#445" }}>검진 항목</th>
            {["Basic", "Standard", "Premium"].map((p) => (
              <th key={p} className="px-1 py-2 font-bold" style={{ borderBottom: "2px solid #0d3a35", color: "#445" }}>{p}</th>
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

export default function CentersCheckup() {
  return (
    <>
      <DarkPageHero
        tag="HEALTH CHECKUP"
        title="건강검진 프로그램"
        subtitle="최신 의료 가이드라인을 반영한 검진 프로그램 — 생활습관·연령·질환 이력에 맞춘 맞춤형 건강관리 계획."
      />

      <section className="max-w-[1280px] mx-auto px-8 py-16">
        <div className="rounded-[20px] p-11" style={{ background: "#f4f7f5", border: "1px solid #e7ece8" }}>
          <div className="mb-3" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.18em", color: "var(--color-ds-teal)" }}>
            PROCESS
          </div>
          <h2 className="text-[26px] font-extrabold mb-3.5" style={{ letterSpacing: "-0.02em", color: "var(--color-ds-text)" }}>
            5단계 검진 프로세스
          </h2>
          <p className="text-[15px] max-w-[760px] mb-9" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.7 }}>
            결과는 보호자와 충분히 상담하여 생활습관·연령·질환 이력에 맞춘
            맞춤형 건강관리 계획으로 이어집니다.
          </p>
          <div data-stagger="" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 proc">
            {PROCESS_STEPS.map((p) => (
              <div key={p.n} className="bg-white rounded-[13px] px-[18px] py-5" style={{ border: "1px solid #e7ece8" }}>
                <div className="mb-3" style={{ font: "800 15px/1 ui-monospace, monospace", color: "var(--color-ds-teal)" }}>
                  {p.n}
                </div>
                <div className="text-[15px] font-extrabold mb-2">{p.t}</div>
                <p className="text-[12.5px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.55 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 프로그램 선택 가이드 — 연령별 권장 */}
      <section className="max-w-[1280px] mx-auto px-8 pb-14">
        <div className="mb-8">
          <div
            className="mb-3.5"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            WHICH PROGRAM?
          </div>
          <h2 className="text-[26px] font-extrabold" style={{ letterSpacing: "-0.02em", color: "var(--color-ds-text)" }}>
            우리 아이에게 맞는 프로그램은?
          </h2>
        </div>
        <div data-stagger="" className="grid grid-cols-1 md:grid-cols-3 gap-4 three">
          {CHECKUP_GUIDE.map((g) => (
            <div
              key={g.level}
              className="rounded-2xl bg-white p-7"
              style={{ border: "1px solid #e9dfca" }}
            >
              <div
                className="mb-1"
                style={{ font: "800 20px/1.2 ui-monospace, monospace", color: "var(--color-ds-teal)" }}
              >
                {g.level}
              </div>
              <div className="text-[15px] font-extrabold mb-3" style={{ color: "var(--color-ds-text)" }}>
                {g.target}
              </div>
              <p className="text-[13.5px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.7 }}>
                {g.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 tablewrap">
          <CheckTable title="강아지 건강검진" emoji="🐶" subtitle="Dog Health Check" rows={DOG_ROWS} />
          <CheckTable title="고양이 건강검진" emoji="🐱" subtitle="Cat Health Check" rows={CAT_ROWS} />
        </div>
        <p className="text-[13px] pl-1 mt-4" style={{ color: "#a59a82" }}>
          ※ 표시된 검진 비용은 예시값이며 확정 후 업데이트됩니다. 검진 항목은
          연령·품종·증상에 따라 조정될 수 있어요.
        </p>
      </section>
    </>
  );
}
