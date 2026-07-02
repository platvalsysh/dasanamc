import type { Route } from "./+types/doctors";
import {
  HOSPITAL,
  LEAD_DOCTORS,
  REST_DOCTORS,
  DOCTOR_DETAILS,
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

  return (
    <article
      id={`profile-${doctor.name}`}
      className="leadcard grid grid-cols-1 md:grid-cols-[0.38fr_0.62fr] rounded-[24px] overflow-hidden"
      style={{ background: "#f4f7f6", scrollMarginTop: 100 }}
    >
      {/* 사진 — 실촬영 프로필 배너, 없으면 실루엣 placeholder */}
      {DOCTOR_PHOTOS[doctor.name] ? (
        <img
          src={DOCTOR_PHOTOS[doctor.name]}
          alt={`${doctor.name} ${doctor.role}`}
          className="w-full h-full object-cover"
          style={{ minHeight: 320 }}
          loading="lazy"
        />
      ) : (
        <div
          role="img"
          aria-label={`${doctor.name} ${doctor.role} 프로필 사진 준비 중`}
          className="flex flex-col items-center justify-center gap-4"
          style={{ minHeight: 320, background: "#e9eeec" }}
        >
          <svg
            width="110"
            height="110"
            viewBox="0 0 24 24"
            fill="#c3cdc8"
            aria-hidden
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8v1H4v-1z" />
          </svg>
          <span
            style={{
              font: "600 11px ui-monospace, monospace",
              letterSpacing: "0.1em",
              color: "#9aa9a4",
            }}
          >
            {isChief ? "대표원장 사진" : "프로필 사진"}
          </span>
        </div>
      )}

      {/* 상세 */}
      <div className="px-8 py-9 md:px-10 md:py-10 flex flex-col">
        <span
          className="mb-3"
          style={{
            font: "700 12px/1 ui-monospace, monospace",
            letterSpacing: "0.18em",
            color: "var(--color-ds-teal)",
          }}
        >
          {isChief ? "CHIEF DIRECTOR" : "VETERINARIAN"}
        </span>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <span
            className="text-[30px] font-extrabold"
            style={{ color: "var(--color-ds-text)", letterSpacing: "-0.02em" }}
          >
            {doctor.name}
          </span>
          <span className="text-[14.5px] font-bold" style={{ color: "var(--color-ds-teal)" }}>
            {doctor.role}
          </span>
        </div>
        <p className="text-[13.5px] mb-5" style={{ color: "#6b7975", lineHeight: 1.6 }}>
          {doctor.cred}
        </p>

        {detail && (
          <>
            {/* 진료 철학 인용구 */}
            <blockquote
              className="serif mb-5"
              style={{
                fontSize: "clamp(17px, 1.8vw, 20px)",
                lineHeight: 1.5,
                color: "#0a7468",
                fontStyle: "italic",
                borderLeft: "3px solid var(--color-ds-teal)",
                paddingLeft: 16,
              }}
            >
              “{detail.quote}”
            </blockquote>

            {/* 인사말 */}
            <p
              className="text-[14.5px] mb-7"
              style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.85 }}
            >
              {detail.greeting}
            </p>

            {/* 전체 약력 */}
            <div className="mt-auto">
              <div
                className="mb-3.5"
                style={{
                  font: "700 12px/1 ui-monospace, monospace",
                  letterSpacing: "0.18em",
                  color: "var(--color-ds-teal)",
                }}
              >
                CAREER
              </div>
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1.5 list-none p-0 m-0">
                {detail.career.map((c) => (
                  <li
                    key={c}
                    className="flex gap-2.5 text-[13px]"
                    style={{ color: "#5a554c", lineHeight: 1.65 }}
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

      <section className="max-w-[1180px] mx-auto px-8 py-20">
        {/* 대표원장 */}
        <div className="mb-16">
          <SectionHead eyebrow="CHIEF DIRECTORS" title="대표원장" className="mb-10 md:mb-10" />
          <div className="flex flex-col gap-8">
            {LEAD_DOCTORS.map((d) => (
              <DoctorCard key={d.name} doctor={d} isChief />
            ))}
          </div>
        </div>

        {/* 진료의 */}
        <div>
          <SectionHead eyebrow="VETERINARIANS" title="진료의" className="mb-10 md:mb-10" />
          <div className="flex flex-col gap-8">
            {REST_DOCTORS.map((d) => (
              <DoctorCard key={d.name} doctor={d} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
