import { Link } from "react-router";
import type { Route } from "./+types/doctors";
import { ogMeta } from "~/lib/og";
import { HOSPITAL, CENTERS } from "~/data/dasanone-content";
import { DoctorsService, type DoctorView } from "@repo/module-doctors/server";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";
import { HERO_IMAGES } from "~/data/stock-images";

/**
 * 의료진 소개 — 데이터는 admin(/admin/doctors) 에서 관리하는 modules.doctors 테이블.
 * 대표원장(is_chief) 과 진료의를 나눠 노출.
 */
export async function loader({}: Route.LoaderArgs) {
  const doctors = await DoctorsService.listActive();
  return {
    chiefs: doctors.filter((d) => d.isChief),
    rest: doctors.filter((d) => !d.isChief),
    total: doctors.length,
  };
}

export function meta({ data }: Route.MetaArgs) {
  const count = data?.total ?? 0;
  return ogMeta(
    `의료진 — ${HOSPITAL.name}`,
    `${count > 0 ? `${count}명의 ` : ""}전문 의료진이 함께합니다. 경북대 · 건국대 · 충남대 출신 석사 이상의 수의사가 진료합니다.`,
    "/about/doctors",
  );
}

/** 통합 프로필 카드 — 사진 + 이름/직책/약력 요약 + 철학 인용구 + 인사말 + 전체 약력 */
function DoctorCard({ doctor, isChief }: { doctor: DoctorView; isChief?: boolean }) {
  const centers = doctor.centers
    .map((id) => CENTERS.find((c) => c.id === id))
    .filter((c) => c != null);

  return (
    <article
      id={`profile-${doctor.name}`}
      className="leadcard grid grid-cols-1 md:grid-cols-[0.4fr_0.6fr] rounded-[24px] overflow-hidden"
      style={{ background: "var(--color-ds-bento)", scrollMarginTop: 100 }}
    >
      {/* 사진 — 배경 제거된 인물 컷아웃(투명 PNG). 연한 teal 배경 위에 하단 정렬 */}
      {doctor.photoUrl ? (
        <div
          className="relative overflow-hidden"
          style={{
            minHeight: 420,
            background:
              "radial-gradient(120% 90% at 50% 12%, #eef4f2 0%, #e2ece9 55%, #d6e5e0 100%)",
          }}
        >
          {/* 인물 컷아웃 — 칸을 채우되 머리 기준(top) 정렬로 얼굴이 잘리지 않게 */}
          <img
            src={doctor.photoUrl}
            alt={`${doctor.name} ${doctor.title}`}
            className="absolute inset-0 w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          role="img"
          aria-label={`${doctor.name} ${doctor.title} 프로필 사진 준비 중`}
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
              color: "var(--color-ds-text-sub)",
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
            color: "var(--color-ds-teal-deep)",
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
          <span className="text-[17px] font-bold" style={{ color: "var(--color-ds-teal-deep)" }}>
            {doctor.title}
          </span>
        </div>
        {doctor.cred && (
          <p className="text-[16px] mb-5" style={{ color: "#6b7975", lineHeight: 1.65 }}>
            {doctor.cred}
          </p>
        )}

        {/* 담당 센터 배지 — 센터 상세로 크로스 링크 */}
        {centers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {centers.map((c) => (
              <Link
                key={c.id}
                to={`/centers/${c.id}`}
                className="text-[12.5px] font-bold rounded-full px-3.5 py-1.5 transition-colors hover:bg-[color:var(--color-ds-dark-warm)] hover:text-white"
                style={{ background: "#e2f4f1", color: "#0a7468" }}
              >
                {c.ko}
              </Link>
            ))}
          </div>
        )}

        {/* 진료 철학 인용구 */}
        {doctor.quote && (
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
            “{doctor.quote}”
          </blockquote>
        )}

        {/* 인사말 */}
        {doctor.greeting && (
          <p
            className="text-[16.5px] mb-10"
            style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.9, maxWidth: "62ch" }}
          >
            {doctor.greeting}
          </p>
        )}

        {/* 전체 약력 */}
        {doctor.career.length > 0 && (
          <div className="mt-auto">
            <div
              className="mb-4"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.2em",
                color: "var(--color-ds-teal-deep)",
              }}
            >
              CAREER
            </div>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2.5 list-none p-0 m-0">
              {doctor.career.map((c, i) => (
                <li
                  key={`${i}-${c}`}
                  className="flex gap-3 text-[15px]"
                  style={{ color: "#5a554c", lineHeight: 1.7 }}
                >
                  <span className="shrink-0 font-extrabold" style={{ color: "var(--color-ds-teal-deep)" }}>
                    ·
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export default function AboutDoctors({ loaderData }: Route.ComponentProps) {
  const { chiefs, rest, total } = loaderData;

  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.doctors}
        location={[{ label: "병원소개", to: "/about" }, { label: "의료진 소개" }]}
        copy={
          total > 0
            ? `아이의 눈높이에서 한 번 더 생각하는\n${total}명의 전문 의료진이 함께합니다.`
            : "아이의 눈높이에서 한 번 더 생각하는\n전문 의료진이 함께합니다."
        }
        sub="경북대 · 건국대 · 충남대 — 전원 석사 이상의 전문 의료진"
      />

      <section className="max-w-[1320px] mx-auto px-8 py-24 md:py-28">
        {/* 대표원장 */}
        {chiefs.length > 0 && (
          <div className="mb-24">
            <SectionHead eyebrow="CHIEF DIRECTORS" title="대표원장" className="mb-12 md:mb-12" />
            <div className="flex flex-col gap-12">
              {chiefs.map((d) => (
                <DoctorCard key={d.id} doctor={d} isChief />
              ))}
            </div>
          </div>
        )}

        {/* 진료의 */}
        {rest.length > 0 && (
          <div>
            <SectionHead eyebrow="VETERINARIANS" title="진료의" className="mb-12 md:mb-12" />
            <div className="flex flex-col gap-12">
              {rest.map((d) => (
                <DoctorCard key={d.id} doctor={d} />
              ))}
            </div>
          </div>
        )}

        {total === 0 && (
          <p className="text-center text-[16px]" style={{ color: "var(--color-ds-text-sub)" }}>
            의료진 정보를 준비 중입니다.
          </p>
        )}
      </section>
    </>
  );
}
