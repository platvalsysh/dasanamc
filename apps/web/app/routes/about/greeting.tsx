import type { Route } from "./+types/greeting";
import {
  THREE_ONE,
  STRENGTHS_4,
  DOCTORS,
  FACILITIES,
  EQUIPMENT,
} from "~/data/dasanone-content";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "병원소개 - 24시 다산 원동물의료센터" },
    {
      name: "description",
      content:
        "24시 다산 원동물의료센터 — 대표원장 인사말, 세 가지 ONE 약속, 의료진, 시설과 장비 소개.",
    },
  ];
}

export default function Greeting() {
  return (
    <>
      {/* HERO (다크) */}
      <div className="text-white px-8 pt-20 pb-[70px]" style={{ background: "var(--color-ds-dark)" }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="font-mono font-bold text-[13px] mb-4.5 text-[color:var(--color-ds-teal-2)] tracking-[0.22em] leading-none">
            ABOUT
          </div>
          <h1 className="text-[42px] font-extrabold leading-[1.3]" style={{ letterSpacing: "-0.03em" }}>
            병원소개
          </h1>
          <p className="text-[17px] mt-4 max-w-[620px]" style={{ color: "#aebdb8" }}>
            반려동물과 건강한 동행이 되도록, 다산원동물의료센터가 함께 하겠습니다.
          </p>
        </div>
      </div>

      {/* 3 ONE */}
      <section className="max-w-[1280px] mx-auto px-8 py-[88px_24px] pt-[88px] pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {THREE_ONE.map((t, i) => (
            <div key={i} className="border-t-2 border-[color:var(--color-ds-dark-2)] pt-[30px] px-1">
              <div className="font-mono font-extrabold text-[16px] text-[color:var(--color-ds-teal)] mb-2 leading-none">
                {t.tag}
              </div>
              <div className="text-[21px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-3.5">
                {t.ko}
              </div>
              <p className="text-[15px] leading-[1.7]" style={{ color: "var(--color-ds-text-sub)" }}>
                {t.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 strengths */}
      <section className="max-w-[1280px] mx-auto px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STRENGTHS_4.map((s, i) => (
            <div key={i} className="border-t border-[#d7ddd5] pt-[26px] px-1">
              <div className="font-mono font-extrabold text-[14px] mb-[18px] leading-none" style={{ color: "#bcc7c2" }}>
                {s.n}
              </div>
              <div className="text-[17px] font-extrabold text-[color:var(--color-ds-dark-2)] leading-[1.4] mb-2.5">
                {s.t}
              </div>
              <p className="text-[14px] leading-[1.6]" style={{ color: "var(--color-ds-text-sub)" }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 대표원장 인사말 */}
      <section className="max-w-[1280px] mx-auto px-8 py-16">
        <div className="mb-10">
          <div className="font-mono font-bold text-[13px] mb-3.5 text-[color:var(--color-ds-teal)] tracking-[0.22em] leading-none">
            GREETING
          </div>
          <h2 className="text-[32px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-2.5" style={{ letterSpacing: "-0.03em" }}>
            대표원장 인사말
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10">
          {/* TODO(template): 대표원장 실제 사진으로 교체 */}
          <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-[color:var(--color-ds-border)] flex items-center justify-center"
               style={{ background: "repeating-linear-gradient(45deg, #e8ece9, #e8ece9 11px, #eef2ef 11px, #eef2ef 22px)" }}
          >
            <span className="font-mono font-semibold text-[11px]" style={{ letterSpacing: "0.08em", color: "#9aa9a4" }}>
              대표원장 프로필 사진
            </span>
          </div>
          <div className="space-y-6 leading-[1.8] text-[16px]" style={{ color: "#475450" }}>
            <p>안녕하세요. 24시 다산 원동물의료센터 대표원장 이현우입니다.</p>
            <p>
              아픈 아이를 안고 병원 문을 들어서는 보호자님의 무거운 마음을 저희는 매일 마주합니다.
              짧게 끝나는 진료가 아니라, 진단부터 수술과 회복까지 한 곳에서 끝까지 책임지는
              동물병원이 되겠다는 마음으로 다산원을 열었습니다.
            </p>
            <p>
              저희는 세 가지 ONE 을 약속합니다 — <strong>The ONE &amp; Only</strong> 단 하나의 진심,{" "}
              <strong>All-in-ONE</strong> 원스톱 진료 시스템, <strong>Number ONE</strong> 다산을 대표하는
              으뜸 병원이 되겠다는 다짐입니다. 외과 전공의 대표원장이 직접 집도하고, 6명의 석사
              이상 의료진이 한 케이스를 함께 보는 협진 체계가 그 약속의 형태입니다.
            </p>
            <p>
              의료의 본질은 결과만이 아니라 과정에 대한 신뢰라고 생각합니다. 저희가 환자의 상태를
              어떻게 판단했는지, 왜 이 치료를 선택했는지 보호자님께 가능한 한 명확하게 설명드리는
              것을 원칙으로 합니다. 작은 신호도 놓치지 않겠다는 약속, 저희 팀이 매일 지키겠습니다.
            </p>
            <div className="pt-6 text-right">
              <p className="font-bold text-[18px] text-[color:var(--color-ds-dark-2)]">
                24시 다산 원동물의료센터 대표원장
              </p>
              <p className="text-[26px] font-serif mt-2 text-[color:var(--color-ds-dark-2)]">이 현 우</p>
            </div>
          </div>
        </div>
      </section>

      {/* 의료진 */}
      <section className="max-w-[1280px] mx-auto px-8 py-16">
        <div className="mb-10">
          <div className="font-mono font-bold text-[13px] mb-3.5 text-[color:var(--color-ds-teal)] tracking-[0.22em] leading-none">
            MEDICAL TEAM
          </div>
          <h2 className="text-[32px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-2.5" style={{ letterSpacing: "-0.03em" }}>
            의료진 소개
          </h2>
          <p className="text-[15.5px]" style={{ color: "var(--color-ds-text-sub)" }}>
            경북대 3 · 건국대 2 · 충남대 1 — 6명 전원 석사 이상의 전문 의료진
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5">
          {DOCTORS.map((d) => (
            <div key={d.name} className="border border-[color:var(--color-ds-border)] rounded-xl overflow-hidden bg-white">
              <div
                className="aspect-[4/3.4] flex items-center justify-center"
                style={{ background: "repeating-linear-gradient(45deg, #e8ece9, #e8ece9 11px, #eef2ef 11px, #eef2ef 22px)" }}
              >
                <span className="font-mono font-semibold text-[11px]" style={{ letterSpacing: "0.08em", color: "#9aa9a4" }}>
                  프로필 사진
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-2.5 mb-1.5">
                  <span className="text-[21px] font-extrabold text-[color:var(--color-ds-dark-2)]">{d.name}</span>
                  <span className="text-[13px] font-bold text-[color:var(--color-ds-teal)]">{d.role}</span>
                </div>
                <p className="text-[13.5px] leading-[1.6]" style={{ color: "#6b7975" }}>
                  {d.cred}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 시설 */}
      <section className="border-t border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto px-8 py-20">
          <div className="mb-9">
            <div className="font-mono font-bold text-[13px] mb-3.5 text-[color:var(--color-ds-teal)] tracking-[0.22em] leading-none">
              FACILITIES
            </div>
            <h2 className="text-[32px] font-extrabold text-[color:var(--color-ds-dark-2)]" style={{ letterSpacing: "-0.03em" }}>
              병원 둘러보기
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {FACILITIES.map((f) => (
              <div key={f} className="border border-[color:var(--color-ds-border)] rounded-[10px] overflow-hidden bg-white">
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ background: "repeating-linear-gradient(45deg, #e8ece9, #e8ece9 10px, #eef2ef 10px, #eef2ef 20px)" }}
                >
                  <span className="font-mono font-semibold text-[10px]" style={{ color: "#9aa9a4" }}>
                    사진 영역
                  </span>
                </div>
                <div className="px-3.5 py-3.5 text-[13.5px] font-bold" style={{ color: "#2a3b37" }}>
                  {f}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 장비 */}
      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <div className="mb-9">
          <div className="font-mono font-bold text-[13px] mb-3.5 text-[color:var(--color-ds-teal)] tracking-[0.22em] leading-none">
            EQUIPMENT
          </div>
          <h2 className="text-[32px] font-extrabold text-[color:var(--color-ds-dark-2)]" style={{ letterSpacing: "-0.03em" }}>
            장비 소개
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
          {EQUIPMENT.map((e) => (
            <div key={e.t} className="border-t-2 border-[color:var(--color-ds-dark-2)] pt-[26px] px-1">
              <div className="text-[19px] font-extrabold text-[color:var(--color-ds-dark-2)] mb-2.5">
                {e.t}
              </div>
              <p className="text-[14.5px] leading-[1.65]" style={{ color: "var(--color-ds-text-sub)" }}>
                {e.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
