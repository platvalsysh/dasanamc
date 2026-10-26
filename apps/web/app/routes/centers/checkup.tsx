import { useState } from "react";
import type { Route } from "./+types/checkup";
import { ogMeta } from "~/lib/og";
import {
  HOSPITAL,
  PROCESS_STEPS,
  CHECKUP_PROGRAMS,
  CHECKUP_NOTES,
  type CheckMark,
  type CheckupPlan,
  type CheckupProgram,
} from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";
import { HERO_IMAGES } from "~/data/stock-images";

export function meta({}: Route.MetaArgs) {
  return ogMeta(`건강검진 프로그램 — ${HOSPITAL.name}`, "최신 의료 가이드라인 기반의 5단계 검진 프로세스 — 강아지/고양이별 Basic·Standard·Premium 패키지로 운영.", "/centers/checkup");
}

const ICON = "/images/checkup";
/** 비교표 Standard 열 하이라이트 */
const FEATURED_COL_BG = "rgba(110,212,197,0.1)";

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
              style={{ background: "var(--color-ds-bento)" }}
            >
              <div
                style={{
                  font: "800 clamp(30px, 3vw, 40px)/1 ui-monospace, monospace",
                  color: "var(--color-ds-teal-deep)",
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

      <CheckupPrograms />
    </>
  );
}

/** 강아지/고양이 탭 → 3단계 카드 → 전체 비교표 → 안내 노트 → 예약 CTA */
function CheckupPrograms() {
  const [activeId, setActiveId] = useState<CheckupProgram["id"]>("dog");
  const program = CHECKUP_PROGRAMS.find((p) => p.id === activeId) ?? CHECKUP_PROGRAMS[0];

  return (
    <section className="max-w-[1144px] mx-auto px-5 md:px-8 pt-8 pb-24 md:pb-28">
      <SectionHead
        align="center"
        eyebrow="HEALTH CHECK PROGRAM"
        title="나이에 맞춰 고르는 3단계 건강검진"
        desc="아이의 나이와 건강 상태에 맞춰 Basic · Standard · Premium 중 선택하세요. 단계가 올라갈수록 이전 단계 검사는 모두 포함되고, 검사가 더해집니다."
        className="!mb-7"
      />

      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="검진 대상"
          className="inline-flex p-[5px] rounded-full bg-white"
          style={{ border: "1px solid #dfe6e2" }}
        >
          {CHECKUP_PROGRAMS.map((p) => {
            const active = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`checkup-tab-${p.id}`}
                aria-selected={active}
                aria-controls="checkup-panel"
                onClick={() => setActiveId(p.id)}
                className="inline-flex items-center gap-1.5 px-[18px] md:px-7 py-3 rounded-full cursor-pointer transition-colors"
                style={{ background: active ? "var(--color-ds-dark-warm)" : "transparent" }}
              >
                <span className="text-[15px] font-bold tracking-[-0.01em]" style={{ color: active ? "#fff" : "var(--color-ds-text-sub)" }}>
                  {p.emoji} {p.label}
                </span>
                <span className="hidden md:inline text-[12px]" style={{ color: active ? "#aec6bf" : "#63716d" }}>
                  {p.en}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="checkup-panel" role="tabpanel" aria-labelledby={`checkup-tab-${program.id}`} className="mt-9 md:mt-12">
        <div data-stagger="" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {program.plans.map((plan, i) => (
            <PlanCard key={plan.tier} plan={plan} prev={i > 0 ? program.plans[i - 1].tier : undefined} species={program.label} />
          ))}
        </div>

        <div className="flex justify-center gap-5 pt-[22px] text-[13px]" style={{ color: "var(--color-ds-text-sub)" }}>
          <span className="inline-flex items-center gap-1.5">
            <img src={`${ICON}/legend-added.svg`} alt="" width={7} height={7} />이 단계에서 추가되는 검사
          </span>
          <span className="inline-flex items-center gap-1.5">
            <img src={`${ICON}/legend-base.svg`} alt="" width={7} height={7} />기본 포함 검사
          </span>
        </div>

        <CompareTable program={program} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
        {CHECKUP_NOTES.map((n) => (
          <div key={n.t} className="rounded-2xl p-6" style={{ background: "var(--color-ds-bento)" }}>
            <div className="text-[15px] font-extrabold mb-2" style={{ color: "var(--color-ds-text)" }}>{n.t}</div>
            <p className="text-[14px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.65 }}>{n.d}</p>
          </div>
        ))}
      </div>

      <p className="mt-7 text-[13px] text-center" style={{ color: "#63716d", lineHeight: 1.7 }}>
        ※ 검진 비용은 아이의 상태에 따라 달라질 수 있어 전화로 안내해 드려요. 검진 항목은 연령·품종·증상에 따라 수의사 판단으로 조정될 수 있어요.
      </p>

      <div className="mt-9 flex flex-col md:flex-row items-center justify-center gap-3">
        <a
          href={`tel:${HOSPITAL.phone.replace(/-/g, "")}`}
          className="inline-flex px-[26px] py-[15px] rounded-full text-[15px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--color-ds-dark-warm)" }}
        >
          전화로 검진 예약 {HOSPITAL.phone}
        </a>
        <a
          href={HOSPITAL.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex px-[26px] py-[15px] rounded-full text-[15px] font-bold transition-colors hover:bg-[#f4f7f6]"
          style={{ color: "var(--color-ds-text)", border: "1px solid #dfe6e2" }}
        >
          네이버 예약하기 →
        </a>
      </div>
    </section>
  );
}

function PlanCard({ plan, prev, species }: { plan: CheckupPlan; prev?: string; species: string }) {
  const dark = !!plan.featured;
  const added = !!prev;
  return (
    <article
      className="flex flex-col rounded-[20px] overflow-hidden bg-white"
      aria-label={`${species} ${plan.tier} ${plan.ko}`}
      style={{
        border: `1px solid ${dark ? "var(--color-ds-dark-warm)" : "#dfe6e2"}`,
        boxShadow: dark ? "0 18px 40px -24px rgba(13,58,53,0.22)" : undefined,
      }}
    >
      <div
        className="px-[22px] md:px-7 pt-7 pb-[26px]"
        style={dark ? { background: "var(--color-ds-dark-warm)" } : { borderBottom: "1px solid var(--color-ds-border)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif font-black text-[28px]" style={{ color: dark ? "#fff" : "var(--color-ds-text)" }}>
            {plan.tier}
          </h3>
          {plan.featured && (
            <span
              className="px-2.5 py-[5px] rounded-full text-[11px] font-bold"
              style={{ background: "var(--color-ds-teal-3)", color: "var(--color-ds-dark-warm)" }}
            >
              가장 많이 선택
            </span>
          )}
        </div>
        <div className="text-[14px] font-bold" style={{ color: dark ? "#aec6bf" : "var(--color-ds-text-sub)" }}>
          {plan.ko}
        </div>
        <span
          className="inline-block mt-[18px] px-3 py-[7px] rounded-full text-[13px] font-bold"
          style={dark ? { background: "rgba(255,255,255,0.1)", color: "var(--color-ds-teal-3)" } : { background: "#e6f3f0", color: "var(--color-ds-teal-deep)" }}
        >
          추천 · {plan.age}
        </span>
        <p className="mt-4 text-[14.5px]" style={{ color: dark ? "#cfe0db" : "#3a4744", lineHeight: 1.65 }}>
          {plan.desc}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-[18px] px-[22px] md:px-7 pt-[22px] pb-7">
        {prev && (
          <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl" style={{ background: "var(--color-ds-bento)" }}>
            <img src={`${ICON}/check-teal.svg`} alt="" width={16} height={16} />
            <span className="text-[13.5px] font-bold" style={{ color: "#2a3b37" }}>{prev} 검진 항목 모두 포함</span>
          </div>
        )}
        {plan.groups.map((g) => (
          <div key={g.name} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-bold whitespace-nowrap" style={{ color: "#63716d" }}>{g.name}</span>
              <span className="flex-1 h-px" style={{ background: "var(--color-ds-border)" }} />
            </div>
            <ul className="flex flex-col gap-2">
              {g.items.map((item) => (
                <li key={item} className="flex items-center gap-2.5 py-1">
                  <img src={`${ICON}/${added ? "dot-added" : "dot-base"}.svg`} alt="" width={6} height={6} className="shrink-0" />
                  <span
                    className={"flex-1 text-[14.5px] " + (added ? "font-bold" : "")}
                    style={{ color: added ? "var(--color-ds-text)" : "#3a4744", lineHeight: 1.5 }}
                  >
                    {item}
                  </span>
                  {added && (
                    <span className="shrink-0 px-[7px] py-0.5 rounded-md text-[11px] font-bold" style={{ background: "#e6f3f0", color: "var(--color-ds-teal-deep)" }}>
                      추가
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

function CompareTable({ program }: { program: CheckupProgram }) {
  const [open, setOpen] = useState(true);
  const featuredIdx = program.plans.findIndex((p) => p.featured);

  return (
    <div className="mt-16 md:mt-[72px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="checkup-compare"
        className="w-full flex items-center justify-between px-1 py-[22px] cursor-pointer text-left"
        style={{ borderTop: "2px solid var(--color-ds-dark-warm)" }}
      >
        <span className="flex items-baseline gap-2.5">
          <span className="text-[16px] md:text-[18px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>전체 검사 항목 한눈에 비교</span>
          <span className="text-[13px]" style={{ color: "var(--color-ds-text-sub)" }}>{program.label}</span>
        </span>
        <img
          src={`${ICON}/chevron-up.svg`}
          alt=""
          width={20}
          height={20}
          className="transition-transform duration-300"
          style={{ transform: open ? "none" : "rotate(180deg)" }}
        />
      </button>

      {open && (
        <div id="checkup-compare" className="max-w-[920px] mx-auto pt-3 md:pt-6">
          <table className="w-full table-fixed border-collapse">
            <caption className="sr-only">{program.label} 건강검진 단계별 검사 항목 비교</caption>
            <colgroup>
              <col className="w-[34%] md:w-[40%]" />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-ds-dark-warm)" }}>
                <th scope="col" className="h-[52px] md:h-[72px] pl-2 md:pl-3 pr-2 text-left text-[13px] font-bold" style={{ color: "var(--color-ds-text-sub)" }}>
                  검진 항목
                </th>
                {program.plans.map((p, i) => (
                  <th
                    key={p.tier}
                    scope="col"
                    className="h-[52px] md:h-[72px] text-center rounded-t-xl"
                    style={i === featuredIdx ? { background: "#eef8f6" } : undefined}
                  >
                    <span
                      className="block font-serif font-black whitespace-nowrap text-[15px] md:text-[20px]"
                      style={{ color: i === featuredIdx ? "var(--color-ds-teal-deep)" : "var(--color-ds-text)" }}
                    >
                      {p.tier}
                    </span>
                    <span className="hidden md:block mt-0.5 text-[12px] font-bold" style={{ color: "var(--color-ds-text-sub)" }}>
                      {p.age}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            {program.compare.map((cat) => (
              <tbody key={cat.name}>
                <tr style={{ background: "var(--color-ds-bento)" }}>
                  <th scope="colgroup" colSpan={4} className="px-2 md:px-3.5 py-[11px] text-left text-[13px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>
                    {cat.name}
                  </th>
                </tr>
                {cat.rows.map((r) => (
                  <tr key={r.item} style={{ borderBottom: "1px solid var(--color-ds-border)" }}>
                    <th scope="row" className="h-12 md:h-[50px] pl-2 md:pl-3 pr-2 text-left text-[14px] md:text-[15px] font-medium" style={{ color: "#2a3b37", lineHeight: 1.4 }}>
                      {r.item}
                    </th>
                    {r.v.map((v, i) => (
                      <td key={i} className="text-center" style={i === featuredIdx ? { background: FEATURED_COL_BG } : undefined}>
                        <Mark v={v} base={r.v[0]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>

          <div className="flex justify-end items-center gap-[18px] pt-4 text-[13px]" style={{ color: "var(--color-ds-text-sub)" }}>
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center size-5 rounded-full" style={{ background: "var(--color-ds-teal-deep)" }}>
                <img src={`${ICON}/check-white-sm.svg`} alt="" width={10.77} height={10.77} />
              </span>
              포함
            </span>
            <span className="inline-flex items-center gap-1">
              <Dash />
              미포함
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** 비교표 셀 — 포함(체크) / 미포함(대시) / 수치 배지 (Basic 대비 늘어나면 진한 배지) */
function Mark({ v, base }: { v: CheckMark; base: CheckMark }) {
  if (v === true) {
    return (
      <span className="inline-flex items-center justify-center size-[26px] rounded-full align-middle" style={{ background: "var(--color-ds-teal-deep)" }}>
        <img src={`${ICON}/check-white.svg`} alt="포함" width={14} height={14} />
      </span>
    );
  }
  if (v === false) return <Dash label="미포함" />;
  const extended = v !== base;
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-[13px] font-bold align-middle"
      style={extended ? { background: "var(--color-ds-teal-deep)", color: "#fff" } : { background: "#e6f3f0", color: "var(--color-ds-teal-deep)" }}
    >
      {v}
    </span>
  );
}

function Dash({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center justify-center size-[26px] align-middle" role={label ? "img" : undefined} aria-label={label}>
      <span className="w-2.5 h-0.5 rounded-[1px]" style={{ background: "#d3dbd8" }} />
    </span>
  );
}
