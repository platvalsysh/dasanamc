import { Link } from "react-router";
import type { Route } from "./+types/emergency";
import { ogMeta } from "~/lib/og";
import { HOSPITAL } from "~/data/dasanone-content";
import { CASE_ARTICLES, blogPostUrl } from "~/data/case-archive";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";

export function meta({}: Route.MetaArgs) {
  return ogMeta(`24시 응급진료 — ${HOSPITAL.name}`, "365일 24시간 연중무휴 응급진료. 야간·심야 응급 상황 대처 가이드와 내원 절차 안내.", "/emergency");
}

/** 즉시 내원이 필요한 응급 신호 — 일반적 보호자 안내 수준 */
const EMERGENCY_SIGNS = [
  {
    t: "호흡곤란 · 청색증",
    d: "입을 벌리고 숨을 쉬거나 혀·잇몸이 파랗게 변했다면 산소 공급이 시급한 상태입니다.",
  },
  {
    t: "반복 구토 · 혈변 · 혈뇨",
    d: "하루 수차례 반복되는 구토, 검붉은 변, 혈뇨는 급성 췌장염·장염·중독 등의 신호일 수 있습니다.",
  },
  {
    t: "발작 · 의식 저하",
    d: "경련이 5분 이상 지속되거나 반복되면 뇌압·저혈당 등 원인 감별이 즉시 필요합니다.",
  },
  {
    t: "이물 섭취 · 중독 의심",
    d: "장난감·실·뼈·약물·양파·포도 등을 삼켰다면 증상이 없어도 바로 연락 주세요. 시간이 예후를 좌우합니다.",
  },
  {
    t: "배뇨 불가 · 복부 팽만",
    d: "소변을 못 보고 힘들어하거나 배가 급격히 부풀면 요도 폐색·위확장염전(GDV) 가능성이 있습니다.",
  },
  {
    t: "낙상 · 교통사고 · 외상",
    d: "겉으로 멀쩡해 보여도 내부 출혈·기흉이 진행될 수 있습니다. 반드시 영상 검사로 확인해야 합니다.",
  },
] as const;

const VISIT_STEPS = [
  {
    n: "01",
    t: "전화 먼저 주세요",
    d: "이동 전 아이 상태를 알려주시면 도착 즉시 처치가 시작되도록 응급팀이 준비합니다. 상황별 응급 대처법도 안내해 드립니다.",
  },
  {
    n: "02",
    t: "안전하게 이동",
    d: "호흡이 불편한 아이는 케이지를 세워 안정 자세를 유지하고, 외상 환자는 몸을 최대한 고정한 채 이동해 주세요.",
  },
  {
    n: "03",
    t: "도착 즉시 응급 처치",
    d: "야간에도 수의사가 상주합니다. 산소방·ICU·수술실이 상시 가동 상태로 골든타임 안에 처치를 시작합니다.",
  },
] as const;

const ER_INFRA = [
  { v: "24H", l: "수의사 야간 상주", s: "365일 연중무휴" },
  { v: "ICU", l: "중환자 집중 케어", s: "산소·온도·모니터링" },
  { v: "CT", l: "야간 정밀 영상", s: "응급 CT 촬영 가능" },
  { v: "OR", l: "응급 수술 대응", s: "수술팀 상시 대기" },
] as const;

export default function Emergency() {
  const erCases = CASE_ARTICLES.filter((a) => a.center === "er");

  return (
    <>
      <StickyBgHero
        bgImage="/images/facility/treatment-ward.jpg"
        location={[{ label: "24시 응급진료" }]}
        copy={"가장 어두운 밤에도,\n다산원의 불은 꺼지지 않습니다."}
        sub="365일 24시간 연중무휴 — 야간·심야·공휴일 응급진료"
      />

      {/* 대형 전화 CTA */}
      <section style={{ background: "var(--color-ds-dark-warm)", color: "#fff" }}>
        <div className="max-w-[1280px] mx-auto px-8 py-14 flex flex-wrap items-center justify-between gap-8">
          <div>
            <div className="mb-2.5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-2)" }}>
              EMERGENCY HOTLINE
            </div>
            <div className="text-[17px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
              응급 상황이라면 지금 바로 전화 주세요. 이동 중 대처법부터 안내해 드립니다.
            </div>
          </div>
          <a
            href={`tel:${HOSPITAL.phone}`}
            className="inline-flex items-center gap-3 font-extrabold transition-transform hover:scale-[1.02]"
            style={{
              background: "var(--color-ds-teal-deep)",
              color: "#fff",
              padding: "20px 34px",
              borderRadius: 16,
              fontSize: "clamp(22px, 2.6vw, 30px)",
              letterSpacing: "-0.01em",
            }}
          >
            ☎ {HOSPITAL.phone}
          </a>
        </div>
      </section>

      {/* 응급 신호 */}
      <section className="max-w-[1280px] mx-auto px-8 py-24">
        <SectionHead
          eyebrow="EMERGENCY SIGNS"
          title="이런 증상이면 지체 없이 내원하세요"
          desc="아래 신호는 골든타임이 예후를 좌우하는 대표적인 응급 상황입니다. 판단이 어려울 땐 전화로 먼저 상담하세요."
        />
        <div data-stagger="" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {EMERGENCY_SIGNS.map((s, i) => (
            <div
              key={s.t}
              className="rounded-[20px] p-8 flex flex-col gap-3"
              style={{ background: "var(--color-ds-bento)" }}
            >
              <div style={{ font: "800 15px/1 ui-monospace, monospace", color: "#c2504a" }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="text-[19px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>
                {s.t}
              </div>
              <p className="text-[15px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.75 }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 내원 절차 + 인프라 */}
      <section style={{ background: "var(--color-ds-dark-2)", color: "#fff" }}>
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <div className="mb-4" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-2)" }}>
            HOW TO VISIT
          </div>
          <h2 className="text-[32px] font-extrabold mb-12" style={{ letterSpacing: "-0.03em" }}>
            응급 내원 3단계
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {VISIT_STEPS.map((st) => (
              <div key={st.n} className="rounded-[20px] p-9" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ font: "800 34px/1 ui-monospace, monospace", color: "var(--color-ds-teal-2)", letterSpacing: "-0.03em" }}>
                  {st.n}
                </div>
                <div className="text-[20px] font-extrabold mt-8 mb-3">{st.t}</div>
                <p className="text-[15px]" style={{ color: "#aec6bf", lineHeight: 1.75 }}>{st.d}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-[20px] overflow-hidden" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {ER_INFRA.map((s) => (
              <div key={s.v} className="p-[32px_26px]" style={{ background: "var(--color-ds-dark-2)" }}>
                <div className="text-[38px] font-extrabold" style={{ color: "var(--color-ds-teal-2)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.v}
                </div>
                <div className="text-[16px] font-extrabold mt-3.5">{s.l}</div>
                <div className="text-[12.5px] mt-1" style={{ color: "#8ea29b" }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 응급 치료 케이스 */}
      {erCases.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-8 py-24">
          <SectionHead
            eyebrow="ER CASES"
            title="응급중환자센터 치료 기록"
            desc="실제 응급 케이스의 진단과 치료 과정을 블로그에서 확인할 수 있습니다."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {erCases.map((a) => (
              <a
                key={a.logNo}
                href={blogPostUrl(a.logNo)}
                target="_blank"
                rel="noreferrer"
                className="group flex gap-5 rounded-[20px] p-5 transition-transform hover:-translate-y-1"
                style={{ background: "var(--color-ds-bento)" }}
              >
                {a.thumb && (
                  <img
                    src={a.thumb}
                    alt={a.title}
                    loading="lazy"
                    className="w-[120px] h-[120px] object-cover rounded-[14px] shrink-0"
                  />
                )}
                <div className="flex flex-col py-1">
                  <div className="text-[16.5px] font-extrabold mb-1.5" style={{ color: "var(--color-ds-text)", lineHeight: 1.4 }}>
                    {a.title}
                  </div>
                  <span className="text-[12.5px]" style={{ color: "var(--color-ds-text-sub)" }}>{a.date}</span>
                  <span className="mt-auto text-[13px] font-bold transition-transform group-hover:translate-x-1" style={{ color: "var(--color-ds-teal-deep)" }}>
                    원문 보기 →
                  </span>
                </div>
              </a>
            ))}
          </div>
          <Link
            to="/cases"
            className="inline-block text-[16px] font-bold"
            style={{ background: "var(--color-ds-dark-warm)", color: "#fff", padding: "15px 30px", borderRadius: 999 }}
          >
            전체 치료 케이스 보기 →
          </Link>
        </section>
      )}
    </>
  );
}
