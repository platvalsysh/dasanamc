import { Link } from "react-router";
import type { Route } from "./+types/support";
import { ogMeta } from "~/lib/og";
import { HOSPITAL } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { SectionHead } from "~/components/site/SectionHead";
import { HERO_IMAGES } from "~/data/stock-images";

export function meta({}: Route.MetaArgs) {
  return ogMeta(`고객센터 — ${HOSPITAL.name}`, "진료 예약·문의는 전화 또는 온라인으로, 진료 케이스와 건강 정보는 블로그에서.", "/support");
}

export default function Support() {
  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.support}
        location={[{ label: "고객센터" }]}
        copy={"궁금한 것은 언제든지,\n가장 가까운 곳에서 답하겠습니다."}
        sub="진료 예약·문의는 전화 또는 온라인으로, 진료 케이스는 블로그에서"
      />

      {/* 3 contact cards — 대형 bento */}
      <section className="max-w-[1280px] mx-auto px-8 pt-24 pb-12">
        <div data-stagger="" className="grid grid-cols-1 md:grid-cols-3 gap-5 three">
          <a
            href={`tel:${HOSPITAL.phone}`}
            className="rounded-[24px] p-10 flex flex-col min-h-[280px]"
            style={{ background: "var(--color-ds-teal-deep)", color: "#fff" }}
          >
            <span className="text-[13.5px] font-bold" style={{ color: "#bfe8e1" }}>24시간 전화 상담</span>
            <div className="mt-auto pt-12">
              <div
                className="font-extrabold"
                style={{ fontSize: "clamp(26px, 2.6vw, 34px)", letterSpacing: "-0.02em", lineHeight: 1.2 }}
              >
                {HOSPITAL.phone}
              </div>
              <div className="text-[16px] mt-2" style={{ color: "#c8ebe4" }}>{HOSPITAL.phone2}</div>
            </div>
          </a>
          <Link
            to="/support/contact"
            className="group text-left rounded-[24px] p-10 flex flex-col min-h-[280px] transition-colors hover:bg-[color:var(--color-ds-dark-warm)]"
            style={{ background: "var(--color-ds-bento)" }}
          >
            <span className="text-[13.5px] font-bold" style={{ color: "var(--color-ds-teal-deep)" }}>온라인 문의·예약</span>
            <div className="mt-auto pt-12">
              <div
                className="font-extrabold transition-colors group-hover:text-white"
                style={{ fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--color-ds-text)", letterSpacing: "-0.02em" }}
              >
                문의 남기기 →
              </div>
              <div className="text-[15px] mt-2 transition-colors group-hover:text-[#aec6bf]" style={{ color: "#6b7975" }}>
                진료 예약과 일반 문의를 접수합니다
              </div>
            </div>
          </Link>
          <a
            href={HOSPITAL.blog}
            target="_blank"
            rel="noreferrer"
            className="group rounded-[24px] p-10 flex flex-col min-h-[280px] transition-colors hover:bg-[color:var(--color-ds-dark-warm)]"
            style={{ background: "var(--color-ds-bento)" }}
          >
            <span className="text-[13.5px] font-bold" style={{ color: "var(--color-ds-teal-deep)" }}>진료 케이스 · 블로그</span>
            <div className="mt-auto pt-12">
              <div
                className="font-extrabold transition-colors group-hover:text-white"
                style={{ fontSize: "clamp(24px, 2.4vw, 30px)", color: "var(--color-ds-text)", letterSpacing: "-0.02em" }}
              >
                네이버 블로그 →
              </div>
              <div className="text-[15px] mt-2 transition-colors group-hover:text-[#aec6bf]" style={{ color: "#6b7975" }}>
                blog.naver.com/dasanoneamc
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* 서브 라우트 단축 링크 */}
      <section className="max-w-[1280px] mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { to: "/support/notice", label: "공지사항", desc: "병원 운영 안내, 휴진/연휴 일정, 신규 장비·서비스 소식." },
            { to: "/support/faq", label: "자주 묻는 질문", desc: "예약·진료비·주차·야간 응급 등 보호자가 자주 묻는 질문 모음." },
            { to: "/support/contact", label: "온라인 문의", desc: "진료 상담·예약·CT/외과 협진 의뢰를 폼으로 보내주세요." },
          ].map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group block rounded-[20px] p-8 transition-colors hover:bg-[color:var(--color-ds-dark-warm)]"
              style={{ background: "var(--color-ds-bento)" }}
            >
              <div className="text-[19px] font-extrabold mb-2 transition-colors group-hover:text-white" style={{ color: "var(--color-ds-text)" }}>
                {card.label} →
              </div>
              <p className="text-[14px] transition-colors group-hover:text-[#aec6bf]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.65 }}>{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
