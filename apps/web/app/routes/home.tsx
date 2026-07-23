import { Link } from "react-router";
import type { Route } from "./+types/home";
import { HOSPITAL, INFO_ROWS } from "~/data/dasanone-content";
import { BLOG_LATEST, CASE_ARTICLES, blogPostUrl } from "~/data/case-archive";
import { HomeHero } from "~/components/site/HomeHero";
import {
  PromiseScene,
  StrengthsScene,
  OneStopScene,
  CentersScene,
} from "~/components/site/home-scroll";

const DESCRIPTION =
  "경기 남양주 24시 동물병원. 11개 특화진료센터, 대학병원급 CT, 365일 24시간 연중무휴 응급진료.";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${HOSPITAL.name}` },
    { name: "description", content: DESCRIPTION },
    // Open Graph — 카카오톡/네이버 공유 미리보기
    { property: "og:type", content: "website" },
    { property: "og:title", content: HOSPITAL.name },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:image", content: `${HOSPITAL.siteUrl}/images/hero-reception.jpg` },
    { property: "og:url", content: HOSPITAL.siteUrl },
    // 지역 검색용 구조화 데이터 (VeterinaryCare)
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "VeterinaryCare",
        name: HOSPITAL.name,
        url: HOSPITAL.siteUrl,
        telephone: HOSPITAL.phone,
        email: HOSPITAL.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "다산중앙로 15, 3층",
          addressLocality: "남양주시",
          addressRegion: "경기도",
          addressCountry: "KR",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
        ],
        image: `${HOSPITAL.siteUrl}/images/hero-reception.jpg`,
        sameAs: [HOSPITAL.blog],
      },
    },
  ];
}

export default function Home() {
  return (
    <>
      {/* ============ HERO — 스크롤 스토리텔링 (380vh, 3장면) ============ */}
      <section className="darkhero relative" style={{ background: "var(--color-ds-dark)", color: "#f4efe6" }}>
        {/* 통계 스트립은 HomeHero 안(첫 화면)으로 이동 */}
        <HomeHero />
      </section>

      {/* MARQUEE 는 HomeHero 안(첫 화면)으로 이동 */}

      {/* ===== 본문 스크롤 시네마틱 — components/site/home-scroll.tsx ===== */}
      <PromiseScene />
      <StrengthsScene />
      <OneStopScene />
      <CentersScene />

      {/* ============ MEDIA / NOTICES + BLOG ============ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
            <div>
              <div className="mb-3.5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-deep)" }}>
                MEDIA
              </div>
              <h2
                className="font-extrabold"
                style={{ fontSize: "clamp(30px, 4vw, 48px)", letterSpacing: "-0.035em", lineHeight: 1.2, color: "var(--color-ds-text)" }}
              >
                다산원 소식 · 진료 케이스
              </h2>
            </div>
            <a
              href={HOSPITAL.blog}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold"
              style={{ background: "#fff", border: "1px solid #dbe3df", color: "var(--color-ds-text)", padding: "12px 22px", borderRadius: 999 }}
            >
              네이버 블로그 →
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 loc">
            {/* 최신 블로그 포스트 — case-archive 자동 생성 데이터 */}
            <div className="flex flex-col gap-px rounded-2xl overflow-hidden" style={{ background: "#e7ece8", border: "1px solid #e7ece8" }}>
              {BLOG_LATEST.map((p) => (
                <a
                  key={p.logNo}
                  href={blogPostUrl(p.logNo)}
                  target="_blank"
                  rel="noreferrer"
                  className="group px-6 py-[18px] flex items-center gap-[18px] transition-colors hover:bg-[#f7faf9]"
                  style={{ background: "#fff" }}
                >
                  {p.thumb && (
                    <img
                      src={p.thumb}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="w-[54px] h-[54px] rounded-[10px] object-cover shrink-0"
                    />
                  )}
                  <span
                    className="text-[12px] font-extrabold shrink-0"
                    style={{ color: "var(--color-ds-teal-deep)", background: "#e2f4f1", padding: "5px 11px", borderRadius: 6 }}
                  >
                    {p.kind === "case" ? "케이스" : "칼럼"}
                  </span>
                  <span className="text-[15.5px] font-semibold flex-1 line-clamp-1" style={{ color: "#2a3b37" }}>
                    {p.title}
                  </span>
                  <span className="text-[13px] shrink-0" style={{ color: "var(--color-ds-text-sub)" }}>{p.date}</span>
                </a>
              ))}
            </div>
            <Link
              to="/cases"
              className="group relative rounded-2xl overflow-hidden flex flex-col justify-end p-6"
              style={{
                minHeight: 180,
                border: "1px solid #e7ece8",
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(4,24,21,0.78) 100%), url(/images/facility/operating-room.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="text-[17px] font-extrabold text-white">
                치료 케이스 아카이브
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </span>
              <span className="text-[13.5px] mt-1" style={{ color: "rgba(255,255,255,0.78)" }}>
                실제 치료 기록 {CASE_ARTICLES.length}건 — 수술·응급·질환 정보
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 24H EMERGENCY BAND ============ */}
      <section className="relative overflow-hidden" style={{ background: "var(--color-ds-dark-3)", color: "#fff" }}>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 90% at 82% 20%, rgba(194,80,74,0.22), transparent 60%)" }}
        />
        <div className="relative max-w-[1280px] mx-auto px-8 py-20 flex flex-wrap items-center justify-between gap-10">
          <div className="max-w-[680px]">
            <div className="inline-flex items-center gap-2.5 mb-5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "#ff9d97" }}>
              <span className="w-[7px] h-[7px] rounded-full animate-pulse-dot" style={{ background: "#ff6b63" }} />
              24H EMERGENCY
            </div>
            <h2 className="serif font-medium" style={{ fontSize: "clamp(26px, 3.4vw, 40px)", lineHeight: 1.4, letterSpacing: "-0.02em" }}>
              한밤중 아이가 이상하다면,
              <br />
              망설이지 말고 전화 주세요.
            </h2>
            <p className="text-[15.5px] mt-4" style={{ color: "#a7bcb5", lineHeight: 1.7 }}>
              365일 24시간 수의사 상주 — 이동 중 대처법부터 안내해 드립니다.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={`tel:${HOSPITAL.phone}`}
              className="inline-flex items-center justify-center gap-3 font-extrabold transition-transform hover:scale-[1.02]"
              style={{ background: "var(--color-ds-teal-deep)", color: "#fff", padding: "20px 36px", borderRadius: 16, fontSize: "clamp(20px, 2.4vw, 27px)" }}
            >
              ☎ {HOSPITAL.phone}
            </a>
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-2 text-[15px] font-bold"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(244,238,228,0.25)", color: "#f4efe6", padding: "13px 24px", borderRadius: 12 }}
            >
              응급 상황 대처 가이드 →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ VISIT US ============ */}
      <section style={{ background: "var(--color-ds-dark-warm)", color: "#fff" }}>
        <div className="max-w-[1280px] mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center loc">
          <div>
            <div className="mb-[18px]" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "var(--color-ds-teal-2)" }}>
              VISIT US
            </div>
            <h2
              className="font-extrabold mb-8 text-white"
              style={{ fontSize: "clamp(30px, 4vw, 48px)", letterSpacing: "-0.035em", lineHeight: 1.2 }}
            >
              오시는 길 · 진료 안내
            </h2>
            {/* 진료 안내 rows — 테두리 없는 flat 리스트, 라벨 작게 + 값 크게 */}
            <div className="flex flex-col">
              {INFO_ROWS.map((r) => (
                <div
                  key={r.k}
                  className="grid grid-cols-[104px_1fr] items-baseline gap-4 py-[15px]"
                >
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: "var(--color-ds-teal-2)", letterSpacing: "0.02em" }}
                  >
                    {r.k}
                  </span>
                  <span
                    className="text-[17px] font-semibold"
                    style={{ color: "rgba(255,255,255,0.92)", letterSpacing: "-0.015em", lineHeight: 1.5 }}
                  >
                    {r.v}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={HOSPITAL.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-8 items-center gap-2 text-[16px] font-bold"
              style={{ background: "var(--color-ds-teal-deep)", color: "#fff", padding: "14px 24px", borderRadius: 11 }}
            >
              네이버 지도로 길찾기 →
            </a>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ aspectRatio: "16/11", border: "1px solid rgba(255,255,255,0.14)", background: "#0a2e29" }}
          >
            <iframe
              title={`오시는 길 지도 — ${HOSPITAL.address}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(HOSPITAL.address)}&z=16&output=embed&hl=ko`}
              className="w-full h-full"
              style={{ border: 0, filter: "saturate(0.92)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}
