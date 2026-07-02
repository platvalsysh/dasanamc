import type { Route } from "./+types/checkup";
import {
  HOSPITAL,
  PROCESS_STEPS,
  DOG_ROWS,
  CAT_ROWS,
  CHECKUP_GUIDE,
  type CheckRow,
} from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";
import { HERO_IMAGES } from "~/data/stock-images";

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
      <StickyBgHero
        bgImage={HERO_IMAGES.checkup}
        location={[{ label: "특화진료센터", to: "/centers" }, { label: "건강검진 프로그램" }]}
        copy={"질병의 근본은 조기 발견 —\n연령과 상태에 맞춘 체계적인 검진"}
        sub="Basic · Standard · Premium 맞춤 프로그램"
      />

      {/* 5단계 프로세스 — 대형 번호 bento */}
      <section className="max-w-[1280px] mx-auto px-8 py-24 md:py-28">
        <SectionHead
          eyebrow="PROCESS"
          title="5단계 검진 프로세스"
          desc="결과는 보호자와 충분히 상담하여 생활습관·연령·질환 이력에 맞춘 맞춤형 건강관리 계획으로 이어집니다."
        />
        <div data-stagger="" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 proc">
          {PROCESS_STEPS.map((p) => (
            <div
              key={p.n}
              className="rounded-[20px] px-7 py-8 flex flex-col min-h-[240px]"
              style={{ background: "#f4f7f6" }}
            >
              <div
                style={{
                  font: "800 clamp(30px, 3vw, 40px)/1 ui-monospace, monospace",
                  color: "var(--color-ds-teal)",
                  letterSpacing: "-0.02em",
                }}
              >
                {p.n}
              </div>
              <div className="mt-auto pt-8">
                <div className="text-[16.5px] font-extrabold mb-2" style={{ color: "var(--color-ds-text)" }}>{p.t}</div>
                <p className="text-[13px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.6 }}>{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 프로그램 선택 가이드 — 다크 하이라이트 카드 */}
      <section
        className="darkhero py-24 md:py-28"
        data-bg-full="1"
        style={{ background: "#0d3a35" }}
      >
        <div className="max-w-[1280px] mx-auto px-8">
          <SectionHead
            eyebrow="WHICH PROGRAM?"
            title="우리 아이에게 맞는 프로그램은?"
            onDark
          />
          <div data-stagger="" className="grid grid-cols-1 md:grid-cols-3 gap-5 three">
            {CHECKUP_GUIDE.map((g) => (
              <div
                key={g.level}
                className="rounded-[24px] p-9 md:p-10 min-h-[280px] flex flex-col"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <div
                  style={{
                    font: "800 clamp(30px, 3.2vw, 42px)/1.1 ui-monospace, monospace",
                    color: "#56c8b8",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {g.level}
                </div>
                <div className="mt-auto pt-10">
                  <div className="text-[18px] font-extrabold mb-3 text-white">
                    {g.target}
                  </div>
                  <p className="text-[14.5px]" style={{ color: "#aec6bf", lineHeight: 1.75 }}>
                    {g.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-8 py-24">
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
