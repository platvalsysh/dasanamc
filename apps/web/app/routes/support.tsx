import { Link } from "react-router";
import type { Route } from "./+types/support";
import { HOSPITAL } from "~/data/dasanone-content";
import { DarkPageHero } from "~/components/site/DarkPageHero";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `고객센터 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "진료 예약·문의는 전화 또는 온라인으로, 진료 케이스와 건강 정보는 블로그에서.",
    },
  ];
}

export default function Support() {
  return (
    <>
      <DarkPageHero
        tag="CUSTOMER CENTER"
        title="고객센터"
        subtitle="진료 예약·문의는 전화 또는 온라인으로, 진료 케이스와 건강 정보는 블로그에서 만나보세요."
      />

      {/* 3 contact cards */}
      <section className="max-w-[1280px] mx-auto px-8 pt-[72px] pb-12">
        <div data-stagger="" className="grid grid-cols-1 md:grid-cols-3 gap-5 three">
          <a
            href={`tel:${HOSPITAL.phone}`}
            className="rounded-2xl p-9 flex flex-col gap-2"
            style={{ background: "#0e9d8c", color: "#fff" }}
          >
            <span className="text-[13px] font-bold" style={{ color: "#bfe8e1" }}>24시간 전화 상담</span>
            <span className="text-[26px] font-extrabold" style={{ letterSpacing: "-0.01em" }}>{HOSPITAL.phone}</span>
            <span className="text-sm" style={{ color: "#c8ebe4" }}>{HOSPITAL.phone2}</span>
          </a>
          <Link
            to="/support/contact"
            className="text-left rounded-xl p-9 flex flex-col gap-2"
            style={{ border: "1px solid #e9dfca", background: "#fff" }}
          >
            <span className="text-[13px] font-bold" style={{ color: "var(--color-ds-teal)" }}>온라인 문의·예약</span>
            <span className="text-[22px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>문의 남기기 →</span>
            <span className="text-sm" style={{ color: "#6b7975" }}>진료 예약과 일반 문의를 접수합니다</span>
          </Link>
          <a
            href={HOSPITAL.blog}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl p-9 flex flex-col gap-2"
            style={{ border: "1px solid #e9dfca", background: "#fff" }}
          >
            <span className="text-[13px] font-bold" style={{ color: "var(--color-ds-teal)" }}>진료 케이스 · 블로그</span>
            <span className="text-[22px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>네이버 블로그 →</span>
            <span className="text-sm" style={{ color: "#6b7975" }}>blog.naver.com/dasanoneamc</span>
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
              className="block rounded-xl p-7 transition-colors hover:bg-[rgba(14,157,140,0.04)]"
              style={{ border: "1px solid #e9dfca" }}
            >
              <div className="text-[19px] font-extrabold mb-2" style={{ color: "var(--color-ds-text)" }}>
                {card.label} →
              </div>
              <p className="text-[14px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.65 }}>{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
