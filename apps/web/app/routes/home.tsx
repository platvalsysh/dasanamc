import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import {
  HOSPITAL,
  THREE_ONE,
  STRENGTHS_4,
  CENTERS,
  HERO_STATS,
  STAT_BIG,
  MARQUEE_ITEMS,
  SOLUTION_TABS,
  INFO_ROWS,
  NOTICES_FALLBACK,
} from "~/data/dasanone-content";
import { AssetSlot } from "~/components/AssetSlot";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "경기 남양주 24시 동물병원. 11개 특화진료센터, 대학병원급 CT, 365일 24시간 연중무휴 응급진료.",
    },
  ];
}

export default function Home() {
  const [solTab, setSolTab] = useState(0);
  const activeSol = SOLUTION_TABS[solTab];

  return (
    <>
      {/* ============ HERO (라이트, pin 220vh) ============ */}
      <section className="relative bg-white text-[color:var(--color-ds-text)]">
        <div id="heropin" className="relative" style={{ height: "var(--pinH, 100vh)" }}>
          <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
            {/* radial glow */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 80% 0%, rgba(14,157,140,0.10), transparent 60%)",
              }}
            />
            {/* diagonal hairlines */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(125deg, rgba(13,58,53,0.03) 0 1px, transparent 1px 64px)",
              }}
            />
            <div className="relative w-full h-full max-w-[1360px] mx-auto px-11">
              {/* center hero asset (영상/이미지) */}
              <div
                className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 z-[1]"
                style={{ width: "min(44vw, 520px)", aspectRatio: "1" }}
              >
                <div
                  className="w-full h-full rounded-full overflow-hidden flex flex-col items-center justify-center gap-3.5"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 36%, rgba(86,200,184,0.16), rgba(14,157,140,0.05) 52%, transparent 72%)",
                    border: "1px solid rgba(14,157,140,0.16)",
                  }}
                >
                  <span
                    className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-[22px]"
                    style={{
                      borderColor: "rgba(14,157,140,0.45)",
                      color: "var(--color-ds-teal)",
                    }}
                  >
                    ▶
                  </span>
                  <span
                    className="text-center"
                    style={{
                      font: "600 11px ui-monospace, monospace",
                      letterSpacing: "0.12em",
                      color: "#9aa9a4",
                    }}
                  >
                    HERO 영상 / 대표 이미지
                  </span>
                </div>
              </div>

              {/* big split type — Animal */}
              <div
                aria-hidden
                className="absolute left-11 top-[13%] z-[2] pointer-events-none"
              >
                <div className="text-sm font-bold text-[color:var(--color-ds-teal)] mb-2 pl-2">
                  모두를 위한 동물 주치의
                </div>
                <div
                  className="font-extrabold leading-[0.84]"
                  style={{
                    fontSize: "clamp(68px, 12.5vw, 206px)",
                    letterSpacing: "-0.045em",
                    background:
                      "linear-gradient(178deg, #0d3a35 35%, rgba(13,58,53,0.55))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Animal
                </div>
              </div>
              {/* big split type — Care. */}
              <div
                aria-hidden
                className="absolute right-11 bottom-[15%] z-[2] text-right pointer-events-none"
              >
                <div
                  className="font-extrabold leading-[0.84]"
                  style={{
                    fontSize: "clamp(68px, 12.5vw, 206px)",
                    letterSpacing: "-0.045em",
                    background:
                      "linear-gradient(178deg, #0d3a35 35%, rgba(13,58,53,0.55))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Care
                  <span
                    style={{
                      color: "var(--color-ds-teal)",
                      WebkitTextFillColor: "var(--color-ds-teal)",
                    }}
                  >
                    .
                  </span>
                </div>
                <div className="text-sm font-bold text-[color:var(--color-ds-teal)] mt-2 pr-2">
                  다산원동물의료센터
                </div>
              </div>

              {/* rotating subtitle + CTAs */}
              <div
                id="herocontent"
                className="absolute left-11 bottom-[11%] z-[3] max-w-[540px]"
              >
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[12.5px] font-bold mb-4"
                  style={{
                    border: "1px solid rgba(14,157,140,0.3)",
                    background: "rgba(14,157,140,0.06)",
                    color: "#0a7468",
                  }}
                >
                  <span className="w-[7px] h-[7px] rounded-full bg-[color:var(--color-ds-teal-2)] animate-pulse-dot" />
                  365일 24시간 연중무휴 응급진료
                </div>
                <h1
                  className="font-extrabold leading-[1.3]"
                  style={{
                    fontSize: "clamp(20px, 2.4vw, 32px)",
                    letterSpacing: "-0.02em",
                    color: "var(--color-ds-text)",
                  }}
                >
                  <span id="heroswap" className="inline-block">
                    수준 높은 의료 서비스
                  </span>
                </h1>
                <p className="text-[14.5px] text-[color:var(--color-ds-text-sub)] mt-2">
                  Comprehensive Care for Every Companion
                </p>
                <div className="flex gap-2.5 flex-wrap mt-5">
                  <a
                    href={`tel:${HOSPITAL.phone}`}
                    className="flex items-center gap-2 bg-[color:var(--color-ds-teal)] text-white px-6 py-3.5 rounded-[11px] text-[15px] font-bold"
                  >
                    전화 예약·문의
                  </a>
                  <Link
                    to="/support#contactform"
                    className="flex items-center gap-2 bg-white border border-[color:var(--color-ds-border-2)] text-[color:var(--color-ds-text)] px-6 py-3.5 rounded-[11px] text-[15px] font-bold"
                  >
                    온라인 문의
                  </Link>
                </div>
              </div>

              {/* scroll indicator */}
              <div
                id="heroscroll"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2"
              >
                <span
                  style={{
                    font: "600 10px/1 ui-monospace, monospace",
                    letterSpacing: "0.25em",
                    color: "#9aa9a4",
                  }}
                >
                  SCROLL
                </span>
                <span
                  className="w-px h-[34px]"
                  style={{
                    background:
                      "linear-gradient(var(--color-ds-teal-2), transparent)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* hero stats — hero 바로 아래 4분할 */}
        <div className="relative border-t border-[color:var(--color-ds-border)]">
          <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-4 statgrid">
            {HERO_STATS.map((s, i) => (
              <div
                key={i}
                className="py-6 px-2 border-l border-[color:var(--color-ds-border)] first:border-l-0"
              >
                <div className="text-[28px] font-extrabold text-[color:var(--color-ds-teal)] tracking-[-0.02em]">
                  {s.v}
                </div>
                <div className="text-[13.5px] text-[color:var(--color-ds-text-sub)] mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <section className="bg-white overflow-hidden py-[18px] border-t border-b border-[color:var(--color-ds-border)]">
        <div className="flex w-max gap-0 animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 px-7 text-[15px] font-semibold text-[color:var(--color-ds-text-sub)] whitespace-nowrap"
            >
              {m}
              <span className="text-[#cfd8d3]">/</span>
            </span>
          ))}
        </div>
      </section>

      {/* ============ OUR PROMISE (manifesto) ============ */}
      <section className="max-w-[1060px] mx-auto px-8 pt-[120px] text-center">
        <div
          className="mb-7"
          style={{
            font: "700 13px/1 ui-monospace, monospace",
            letterSpacing: "0.24em",
            color: "var(--color-ds-teal)",
          }}
        >
          OUR PROMISE
        </div>
        <p
          data-reveal=""
          className="font-extrabold leading-[1.5] text-[color:var(--color-ds-text)] text-balance"
          style={{
            fontSize: "clamp(23px, 3.3vw, 38px)",
            letterSpacing: "-0.03em",
          }}
        >
          아픈 아이를 안고 병원 문을 들어서는 보호자님의<br />
          무거운 마음을 누구보다 잘 알기에,{" "}
          <span className="text-[color:var(--color-ds-teal)]">
            다산원동물의료센터는
            <br />세 가지 ‘ONE’
          </span>
          을 약속합니다.
        </p>
      </section>

      {/* ============ 3 ONE SYSTEM ============ */}
      <section className="max-w-[1280px] mx-auto px-8 pt-16 pb-[104px]">
        <div className="text-center max-w-[760px] mx-auto mb-[52px]">
          <div
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
            className="mb-4"
          >
            3 ONE SYSTEM
          </div>
          <h2 className="text-[34px] font-extrabold tracking-[-0.03em] leading-[1.35] text-[color:var(--color-ds-text)]">
            세 가지 ‘ONE’, 다산원이 지키겠습니다
          </h2>
        </div>
        <div
          data-stagger=""
          className="grid gap-6 grid-cols-1 md:grid-cols-3 three"
        >
          {THREE_ONE.map((t, i) => (
            <div
              key={i}
              className="border-t-2 border-[color:var(--color-ds-text)] pt-[34px] px-1"
            >
              <div
                className="mb-2"
                style={{
                  font: "800 16px/1 ui-monospace, monospace",
                  color: "var(--color-ds-teal)",
                  letterSpacing: "-0.01em",
                }}
              >
                {t.tag}
              </div>
              <div className="text-[22px] font-extrabold text-[color:var(--color-ds-text)] mb-4">
                {t.ko}
              </div>
              <p className="text-[15.5px] text-[color:var(--color-ds-text-sub)] leading-[1.7]">
                {t.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ WHY DASANONE — 4 strengths ============ */}
      <section className="border-t border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-end justify-between gap-6 mb-[52px] flex-wrap">
            <div>
              <div
                className="mb-4"
                style={{
                  font: "700 13px/1 ui-monospace, monospace",
                  letterSpacing: "0.22em",
                  color: "var(--color-ds-teal)",
                }}
              >
                WHY DASANONE
              </div>
              <h2 className="text-[34px] font-extrabold tracking-[-0.03em] text-[color:var(--color-ds-text)]">
                왜 다산원동물의료센터일까요?
              </h2>
            </div>
            <p className="text-base text-[color:var(--color-ds-text-sub)] max-w-[380px]">
              대학병원급 진단 인프라와 분과별 전공의 협진으로 한 곳에서 완결되는 진료를 제공합니다.
            </p>
          </div>
          <div
            data-stagger=""
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 four"
          >
            {STRENGTHS_4.map((s, i) => (
              <div
                key={i}
                className="border-t border-[#d7ddd5] pt-[26px] px-1"
              >
                <div
                  className="mb-[22px]"
                  style={{
                    font: "800 14px/1 ui-monospace, monospace",
                    color: "#bcc7c2",
                  }}
                >
                  {s.n}
                </div>
                <div className="text-[18.5px] font-extrabold text-[color:var(--color-ds-text)] leading-[1.4] mb-3">
                  {s.t}
                </div>
                <p className="text-[14.5px] text-[color:var(--color-ds-text-sub)] leading-[1.65]">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ONE STOP CARE — 탭 ============ */}
      <section className="border-t border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto px-8 py-[104px]">
          <div className="text-center mb-11">
            <div
              className="mb-4"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.22em",
                color: "var(--color-ds-teal)",
              }}
            >
              ONE STOP CARE
            </div>
            <h2 className="text-[34px] font-extrabold tracking-[-0.03em] text-[color:var(--color-ds-text)] mb-3.5">
              진단부터 회복까지, 한 곳에서
            </h2>
            <p className="text-[16.5px] text-[color:var(--color-ds-text-sub)]">
              정밀 진단 · 분과 협진 · 수술 · 24시 케어가 끊김 없이 이어지는 원스톱 시스템
            </p>
          </div>
          <div className="flex justify-center gap-14 flex-wrap mb-12 border-b border-[#e3e6ee] soltabs">
            {SOLUTION_TABS.map((t, i) => {
              const active = i === solTab;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setSolTab(i)}
                  className={
                    "py-3.5 -mb-px text-[15px] font-bold border-b-2 transition-colors " +
                    (active
                      ? "text-[color:var(--color-ds-text)] border-[color:var(--color-ds-teal)]"
                      : "text-[color:var(--color-ds-text-sub)] border-transparent hover:text-[color:var(--color-ds-text)]")
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-2 solpanel">
            <div>
              <h3 className="text-[26px] font-extrabold tracking-[-0.02em] text-[color:var(--color-ds-text)] mb-4">
                {activeSol.title}
              </h3>
              <p className="text-base text-[color:var(--color-ds-text-sub)] leading-[1.75] mb-6">
                {activeSol.desc}
              </p>
              <ul className="list-none flex flex-col gap-[11px]">
                {activeSol.points.map((p) => (
                  <li
                    key={p}
                    className="flex gap-[11px] text-[15px] font-semibold text-[#2a3b37]"
                  >
                    <span className="text-[color:var(--color-ds-teal)] font-extrabold">
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <AssetSlot
              className="rounded-2xl overflow-hidden"
              style={{ aspectRatio: "4/3" }}
              label="진료 현장 사진 영역"
            />
          </div>
        </div>
      </section>

      {/* ============ SPECIALTY CENTERS — 11 grid ============ */}
      <section className="max-w-[1280px] mx-auto px-8 py-[104px]">
        <div className="text-center mb-14">
          <div
            className="mb-4"
            style={{
              font: "700 13px/1 ui-monospace, monospace",
              letterSpacing: "0.22em",
              color: "var(--color-ds-teal)",
            }}
          >
            SPECIALTY CENTERS
          </div>
          <h2 className="text-[36px] font-extrabold tracking-[-0.03em] text-[color:var(--color-ds-text)] mb-3.5">
            11개 특화진료센터
          </h2>
          <p className="text-[16.5px] text-[color:var(--color-ds-text-sub)]">
            분과별 전공의가 함께 진단부터 수술, 회복까지 책임지는 원스톱 시스템
          </p>
        </div>
        <div
          data-stagger=""
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 centergrid"
        >
          {CENTERS.map((c) => (
            <Link
              key={c.id}
              to={`/centers#${c.id}`}
              className="text-left bg-transparent border border-[color:var(--color-ds-border)] rounded-xl px-6 py-6 flex flex-col gap-3 transition-colors hover:border-[color:var(--color-ds-teal)] hover:bg-[rgba(14,157,140,0.035)]"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    font: "800 13px/1 ui-monospace, monospace",
                    color: "var(--color-ds-teal)",
                  }}
                >
                  {c.num}
                </span>
                <span className="text-[#cfd8d3] text-lg">→</span>
              </div>
              <div className="text-[19px] font-extrabold text-[color:var(--color-ds-text)] leading-[1.35]">
                {c.ko}
              </div>
              <div className="text-xs font-semibold tracking-[0.04em] text-[color:var(--color-ds-text-mute)]">
                {c.en}
              </div>
              <p className="text-[13.5px] text-[#6b7975] leading-[1.6] mt-0.5">
                {c.targets}
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-11">
          <Link
            to="/centers"
            className="inline-block bg-[color:var(--color-ds-text)] text-white px-[30px] py-[15px] rounded-full text-[15px] font-bold"
          >
            특화진료센터 전체 보기 →
          </Link>
        </div>
      </section>

      {/* ============ BY THE NUMBERS ============ */}
      <section className="bg-white border-t border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto px-8 py-[104px]">
          <div className="max-w-[720px] mb-14">
            <div
              className="mb-4"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.22em",
                color: "var(--color-ds-teal)",
              }}
            >
              BY THE NUMBERS
            </div>
            <h2 className="text-[34px] font-extrabold tracking-[-0.03em] leading-[1.35] text-[color:var(--color-ds-text)]">
              다산원동물의료센터의 새로운 기준
            </h2>
            <p className="text-base text-[color:var(--color-ds-text-sub)] mt-4">
              대학병원급 진단 인프라와 6명의 전문 의료진이 만드는 수준 높은 의료 서비스.
            </p>
          </div>
          <div
            data-stagger=""
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--color-ds-border)] border border-[color:var(--color-ds-border)] rounded-[18px] overflow-hidden four"
          >
            {STAT_BIG.map((s, i) => (
              <div key={i} className="bg-white p-9">
                <div className="text-[46px] font-extrabold text-[color:var(--color-ds-teal)] tracking-[-0.03em] leading-none">
                  {s.v}
                </div>
                <div className="text-base font-extrabold text-[color:var(--color-ds-text)] mt-4">
                  {s.l}
                </div>
                <div className="text-[13px] text-[#6b7975] mt-1.5 leading-[1.5]">
                  {s.s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MEDIA / NOTICES + BLOG ============ */}
      <section className="border-t border-[color:var(--color-ds-border)]">
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
            <div>
              <div
                className="mb-3.5"
                style={{
                  font: "700 13px/1 ui-monospace, monospace",
                  letterSpacing: "0.22em",
                  color: "var(--color-ds-teal)",
                }}
              >
                MEDIA
              </div>
              <h2 className="text-[32px] font-extrabold tracking-[-0.03em] text-[color:var(--color-ds-text)]">
                다산원 소식 · 진료 케이스
              </h2>
            </div>
            <a
              href={HOSPITAL.blog}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white border border-[color:var(--color-ds-border-2)] text-[color:var(--color-ds-text)] px-[22px] py-3 rounded-full text-sm font-bold"
            >
              네이버 블로그 →
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 loc">
            <div className="flex flex-col gap-px bg-[#e3e8e3] border border-[#e3e8e3] rounded-2xl overflow-hidden">
              {NOTICES_FALLBACK.map((n, i) => (
                <div
                  key={i}
                  className="bg-white px-6 py-5 flex items-center gap-[18px]"
                >
                  <span className="text-[11.5px] font-extrabold text-[color:var(--color-ds-teal)] bg-[#e2f4f1] px-2.5 py-[5px] rounded-md shrink-0">
                    {n.tag}
                  </span>
                  <span className="text-[15.5px] text-[#2a3b37] font-semibold flex-1">
                    {n.t}
                  </span>
                  <span className="text-[13px] text-[color:var(--color-ds-text-mute)] shrink-0">
                    {n.date}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={HOSPITAL.blog}
              target="_blank"
              rel="noreferrer"
              className="relative rounded-2xl overflow-hidden border border-[#e3e8e3] min-h-[180px] flex flex-col justify-end p-6"
              style={{
                background:
                  "repeating-linear-gradient(45deg,#e8ece9,#e8ece9 11px,#eef2ef 11px,#eef2ef 22px)",
              }}
            >
              <span
                className="absolute top-4 left-6"
                style={{
                  font: "600 11px ui-monospace, monospace",
                  color: "#9aa9a4",
                }}
              >
                블로그 썸네일
              </span>
              <span className="text-[17px] font-extrabold text-[color:var(--color-ds-text)]">
                진료 케이스 보러가기
              </span>
              <span className="text-[13.5px] text-[color:var(--color-ds-text-sub)] mt-1">
                blog.naver.com/dasanoneamc
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ VISIT US ============ */}
      <section className="bg-white">
        <div className="max-w-[1280px] mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center loc">
          <div>
            <div
              className="mb-[18px]"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.22em",
                color: "var(--color-ds-teal)",
              }}
            >
              VISIT US
            </div>
            <h2 className="text-[32px] font-extrabold tracking-[-0.03em] text-[color:var(--color-ds-text)] mb-7">
              오시는 길 · 진료 안내
            </h2>
            <div className="flex flex-col gap-px bg-[color:var(--color-ds-border)] rounded-2xl overflow-hidden border border-[color:var(--color-ds-border)]">
              {INFO_ROWS.map((r) => (
                <div
                  key={r.k}
                  className="grid grid-cols-[120px_1fr] gap-3 px-5 py-4"
                  style={{ background: "#f6f9f7" }}
                >
                  <span className="text-sm text-[#0a7468] font-bold">
                    {r.k}
                  </span>
                  <span className="text-[14.5px] text-[#3a4744]">{r.v}</span>
                </div>
              ))}
            </div>
            <a
              href={HOSPITAL.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-[22px] items-center gap-2 bg-[color:var(--color-ds-teal)] text-white px-6 py-3.5 rounded-[11px] text-[15px] font-bold"
            >
              네이버 지도로 길찾기 →
            </a>
          </div>
          <AssetSlot
            className="rounded-2xl overflow-hidden border border-[color:var(--color-ds-border)]"
            style={{ aspectRatio: "16/11" }}
            label={`네이버 지도 API 영역 — ${HOSPITAL.address}`}
          />
        </div>
      </section>
    </>
  );
}
