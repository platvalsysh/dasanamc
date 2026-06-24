import type { Route } from "./+types/checkup";
import { PROCESS_STEPS } from "~/data/dasanone-content";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "건강검진 - 24시 다산 원동물의료센터" },
    {
      name: "description",
      content:
        "연령·품종·증상별 맞춤형 건강검진 프로그램. 강아지/고양이 Basic·Standard·Premium 패키지 비교.",
    },
  ];
}

interface CheckupRow {
  item: string;
  b: string;
  s: string;
  p: string;
  isGroupStart?: boolean;
}

const DOG_ROWS: CheckupRow[] = [
  { item: "신체검사", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "혈압측정", b: "✓", s: "✓", p: "✓" },
  { item: "검이경 검사", b: "✓", s: "✓", p: "✓" },
  { item: "피부검사", b: "✓", s: "✓", p: "✓" },
  { item: "치과 직접검안", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "안압(토노펜) 검사", b: "·", s: "·", p: "✓", isGroupStart: true },
  { item: "심장초음파 검사", b: "·", s: "✓", p: "✓", isGroupStart: true },
  { item: "심전도 검사", b: "·", s: "·", p: "✓" },
  { item: "혈구검사(CBC)", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "간·신장·혈당·전해질", b: "화학 10종", s: "화학 17종", p: "화학 17종" },
  { item: "혈액가스(정맥혈)", b: "·", s: "✓", p: "✓" },
  { item: "조기신장기능(SDMA)", b: "·", s: "✓", p: "✓" },
  { item: "갑상선 호르몬(T4)", b: "·", s: "·", p: "✓" },
  { item: "요검사(노스틱)", b: "·", s: "·", p: "✓", isGroupStart: true },
  { item: "흉·복부 방사선", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "복부 초음파", b: "·", s: "✓", p: "✓" },
  { item: "정형외과 검사", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "전지·후지 방사선", b: "·", s: "·", p: "✓" },
  { item: "검진 비용 (예시)", b: "15만원", s: "29만원", p: "45만원", isGroupStart: true },
];

const CAT_ROWS: CheckupRow[] = [
  { item: "신체검사", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "혈압측정", b: "✓", s: "✓", p: "✓" },
  { item: "검이경 검사", b: "✓", s: "✓", p: "✓" },
  { item: "피부검사", b: "✓", s: "✓", p: "✓" },
  { item: "치과 직접검안", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "심장초음파 검사", b: "·", s: "✓", p: "✓", isGroupStart: true },
  { item: "혈구검사(CBC)", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "일반 화학 검사", b: "혈액 6종", s: "화학 17종", p: "화학 17종" },
  { item: "혈액가스(정맥혈)", b: "·", s: "✓", p: "✓" },
  { item: "심장바이오마커(BNP)", b: "·", s: "✓", p: "✓" },
  { item: "조기신장기능(SDMA)", b: "·", s: "✓", p: "✓" },
  { item: "갑상선 호르몬(T4)", b: "·", s: "·", p: "✓" },
  { item: "요검사(노스틱)", b: "·", s: "·", p: "✓", isGroupStart: true },
  { item: "흉·복부 방사선", b: "✓", s: "✓", p: "✓", isGroupStart: true },
  { item: "복부 초음파", b: "·", s: "✓", p: "✓" },
  { item: "검진 비용 (예시)", b: "14만원", s: "27만원", p: "42만원", isGroupStart: true },
];

function CheckupTable({ title, rows }: { title: string; rows: CheckupRow[] }) {
  return (
    <div className="border border-[color:var(--color-ds-border)] rounded-xl px-6 py-[26px] overflow-x-auto bg-white">
      <div className="text-[19px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-1">
        {title}
      </div>
      <div className="text-[12.5px] mb-[18px]" style={{ color: "#9aa9a4" }}>
        {title.startsWith("🐶") ? "Dog Health Check" : "Cat Health Check"}
      </div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th
              className="text-left p-2 font-bold"
              style={{ borderBottom: "2px solid var(--color-ds-dark-2)", color: "#445" }}
            >
              검진 항목
            </th>
            {["Basic", "Standard", "Premium"].map((h) => (
              <th
                key={h}
                className="p-2 font-bold"
                style={{ borderBottom: "2px solid var(--color-ds-dark-2)", color: "#445" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isFirstRow = i === 0;
            return (
              <tr key={i} style={{ borderBottom: "1px solid #f0f2ee" }}>
                <td
                  className="text-left p-[7px_6px]"
                  style={{
                    color: "#3a4744",
                    fontWeight: r.isGroupStart ? 700 : 500,
                    borderTop: r.isGroupStart && !isFirstRow ? "1px solid #e3e8e3" : "none",
                  }}
                >
                  {r.item}
                </td>
                <td className="text-center p-[7px_4px] text-[color:var(--color-ds-teal)] font-bold">{r.b}</td>
                <td className="text-center p-[7px_4px] text-[color:var(--color-ds-teal)] font-bold">{r.s}</td>
                <td className="text-center p-[7px_4px] text-[color:var(--color-ds-teal)] font-bold">{r.p}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Checkup() {
  return (
    <>
      {/* HERO (다크) */}
      <div className="text-white px-8 pt-20 pb-[70px]" style={{ background: "var(--color-ds-dark)" }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="font-mono font-bold text-[13px] mb-4.5 text-[color:var(--color-ds-teal-2)] tracking-[0.22em] leading-none">
            HEALTH CHECKUP
          </div>
          <h1 className="text-[42px] font-extrabold leading-[1.3]" style={{ letterSpacing: "-0.03em" }}>
            건강검진
          </h1>
          <p className="text-[17px] mt-4 max-w-[760px]" style={{ color: "#aebdb8" }}>
            연령·품종·증상별 맞춤형 검진 프로그램으로 질병을 조기에 발견하고 예방하여
            행복한 삶을 오래 누리도록 돕습니다.
          </p>
        </div>
      </div>

      {/* 검진 절차 */}
      <section className="max-w-[1280px] mx-auto px-8 py-[72px]">
        <div className="text-[28px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-3.5" style={{ letterSpacing: "-0.02em" }}>
          검진 절차
        </div>
        <p className="text-[15px] mb-9" style={{ color: "var(--color-ds-text-sub)" }}>
          5단계 절차로 진행되며, 결과는 담당 수의사와 충분히 상담합니다.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PROCESS_STEPS.map((p) => (
            <div
              key={p.n}
              className="rounded-[13px] p-[20px_18px] text-white"
              style={{
                background: "var(--color-ds-dark)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="font-mono font-extrabold text-[15px] text-[color:var(--color-ds-teal-3)] mb-3 leading-none">
                {p.n}
              </div>
              <div className="text-[15px] font-extrabold mb-2">{p.t}</div>
              <p className="text-[12.5px] leading-[1.55]" style={{ color: "#9fb0aa" }}>
                {p.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 검진 패키지 비교 */}
      <section className="max-w-[1280px] mx-auto px-8 pb-[100px]">
        <div className="text-[28px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-3.5" style={{ letterSpacing: "-0.02em" }}>
          검진 패키지 비교
        </div>
        <p className="text-[15px] mb-9" style={{ color: "var(--color-ds-text-sub)" }}>
          Basic · Standard · Premium 세 가지 단계로 선택 가능합니다.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CheckupTable title="🐶 강아지 건강검진" rows={DOG_ROWS} />
          <CheckupTable title="🐱 고양이 건강검진" rows={CAT_ROWS} />
        </div>
        <p className="text-[13px] mt-4 pl-1" style={{ color: "#9aa9a4" }}>
          ※ 표시된 검진 비용은 예시값이며 확정 후 업데이트됩니다. 검진 항목은 연령·품종·증상에 따라 조정될 수 있어요.
        </p>
      </section>
    </>
  );
}
