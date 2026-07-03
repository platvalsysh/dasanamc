import { Link } from "react-router";
import type { Route } from "./+types/doctors";
import {
  HOSPITAL,
  LEAD_DOCTORS,
  REST_DOCTORS,
  DOCTOR_DETAILS,
  DOCTOR_CENTERS,
  CENTERS,
  type DoctorDetail,
} from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";
import { HERO_IMAGES } from "~/data/stock-images";

/** 실제 프로필 배너 (블로그 의료진 소개 포스트). 이선아는 촬영본 미공개 → 실루엣 */
const DOCTOR_PHOTOS: Record<string, string> = {
  이현우: "/images/doctors/lee-hyunwoo.jpg",
  조항빈: "/images/doctors/cho-hangbin.jpg",
  임동환: "/images/doctors/lim-donghwan.jpg",
  정지윤: "/images/doctors/jung-jiyoon.jpg",
  박병준: "/images/doctors/park-byungjoon.jpg",
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: `의료진 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "경북대 3 · 건국대 2 · 충남대 1 — 6명 전원 석사 이상의 전문 의료진이 진료합니다.",
    },
  ];
}

/** 통합 프로필 카드 — 사진 + 이름/직책/약력 요약 + 철학 인용구 + 인사말 + 전체 약력 */
function DoctorCard({
  doctor,
  isChief,
}: {
  doctor: { name: string; role: string; cred: string };
  isChief?: boolean;
}) {
  const detail: DoctorDetail | undefined = DOCTOR_DETAILS.find(
    (d) => d.name === doctor.name,
  );
  const centers = (DOCTOR_CENTERS[doctor.name] ?? [])
    .map((id) => CENTERS.find((c) => c.id === id))
    .filter((c) => c != null);

  return (
    <article
      id={`profile-${doctor.name}`}
      className="leadcard grid grid-cols-1 md:grid-cols-[0.4fr_0.6fr] rounded-[28px] overflow-hidden"
      style={{ background: "#f4f7f6", scrollMarginTop: 100 }}
    >
      {/* 사진 — 실촬영 프로필 배너, 없으면 실루엣 placeholder */}
      {DOCTOR_PHOTOS[doctor.name] ? (
        <img
          src={DOCTOR_PHOTOS[doctor.name]}
          alt={`${doctor.name} ${doctor.role}`}
          className="w-full h-full object-cover"
          style={{ minHeight: 420 }}
          loading="lazy"
        />
      ) : (
        <div
          role="img"
          aria-label={`${doctor.name} ${doctor.role} 프로필 사진 준비 중`}
          className="flex flex-col items-center justify-center gap-4"
          style={{ minHeight: 420, background: "#e9eeec" }}
        >
          <svg
            width="130"
            height="130"
            viewBox="0 0 24 24"
            fill="#c3cdc8"
            aria-hidden
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8v1H4v-1z" />
          </svg>
          <span
            style={{
              font: "600 12px ui-monospace, monospace",
              letterSpacing: "0.1em",
              color: "#9aa9a4",
            }}
          >
            {isChief ? "대표원장 사진" : "프로필 사진"}
          </span>
        </div>
      )}

      {/* 상세 */}
      <div className="px-8 py-10 md:px-14 md:py-14 flex flex-col">
        <span
          className="mb-4"
          style={{
            font: "700 13px/1 ui-monospace, monospace",
            letterSpacing: "0.2em",
            color: "var(--color-ds-teal)",
          }}
        >
          {isChief ? "CHIEF DIRECTOR" : "VETERINARIAN"}
        </span>
        <div className="flex items-baseline gap-4 flex-wrap mb-3">
          <span
            className="font-extrabold"
            style={{
              fontSize: "clamp(32px, 3.4vw, 42px)",
              color: "var(--color-ds-text)",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            {doctor.name}
          </span>
          <span className="text-[17px] font-bold" style={{ color: "var(--color-ds-teal)" }}>
            {doctor.role}
          </span>
        </div>
        <p className="text-[15px] mb-5" style={{ color: "#6b7975", lineHeight: 1.65 }}>
          {doctor.cred}
        </p>

        {/* 담당 센터 배지 — 센터 상세로 크로스 링크 */}
        {centers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {centers.map((c) => (
              <Link
                key={c.id}
                to={`/centers/${c.id}`}
                className="text-[12.5px] font-bold rounded-full px-3.5 py-1.5 transition-colors hover:bg-[#0d3a35] hover:text-white"
                style={{ background: "#e2f4f1", color: "#0a7468" }}
              >
                {c.ko}
              </Link>
            ))}
          </div>
        )}

        {detail && (
          <>
            {/* 진료 철학 인용구 */}
            <blockquote
              className="serif mb-7"
              style={{
                fontSize: "clamp(20px, 2.2vw, 26px)",
                lineHeight: 1.5,
                color: "#0a7468",
                fontStyle: "italic",
                borderLeft: "3px solid var(--color-ds-teal)",
                paddingLeft: 20,
              }}
            >
              “{detail.quote}”
            </blockquote>

            {/* 인사말 */}
            <p
              className="text-[16.5px] mb-10"
              style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.9, maxWidth: "62ch" }}
            >
              {detail.greeting}
            </p>

            {/* 전체 약력 */}
            <div className="mt-auto">
              <div
                className="mb-4"
                style={{
                  font: "700 13px/1 ui-monospace, monospace",
                  letterSpacing: "0.2em",
                  color: "var(--color-ds-teal)",
                }}
              >
                CAREER
              </div>
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2.5 list-none p-0 m-0">
                {detail.career.map((c) => (
                  <li
                    key={c}
                    className="flex gap-3 text-[14.5px]"
                    style={{ color: "#5a554c", lineHeight: 1.7 }}
                  >
                    <span className="shrink-0 font-extrabold" style={{ color: "var(--color-ds-teal)" }}>
                      ·
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export default function AboutDoctors() {
  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.doctors}
        location={[{ label: "병원소개", to: "/about" }, { label: "의료진 소개" }]}
        copy={"아이의 눈높이에서 한 번 더 생각하는\n여섯 명의 전문 의료진이 함께합니다."}
        sub="경북대 3 · 건국대 2 · 충남대 1 — 전원 석사 이상의 전문 의료진"
      />

      <section className="max-w-[1320px] mx-auto px-8 py-24 md:py-28">
        {/* 대표원장 */}
        <div className="mb-24">
          <SectionHead eyebrow="CHIEF DIRECTORS" title="대표원장" className="mb-12 md:mb-12" />
          <div className="flex flex-col gap-12">
            {LEAD_DOCTORS.map((d) => (
              <DoctorCard key={d.name} doctor={d} isChief />
            ))}
          </div>
        </div>

        {/* 진료의 */}
        <div>
          <SectionHead eyebrow="VETERINARIANS" title="진료의" className="mb-12 md:mb-12" />
          <div className="flex flex-col gap-12">
            {REST_DOCTORS.map((d) => (
              <DoctorCard key={d.name} doctor={d} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
