import type { Route } from "./+types/faq";
import { HOSPITAL, FAQS } from "~/data/dasanone-content";
import { DarkPageHero } from "~/components/site/DarkPageHero";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `자주 묻는 질문 — ${HOSPITAL.name}` },
    {
      name: "description",
      content: "예약·진료비·주차·야간 응급 등 보호자가 자주 묻는 질문 모음.",
    },
  ];
}

export default function SupportFaq() {
  return (
    <>
      <DarkPageHero
        tag="FAQ"
        title="자주 묻는 질문"
        subtitle="보호자님들이 가장 많이 물으시는 질문에 미리 답해두었습니다."
      />

      <section className="max-w-[920px] mx-auto px-8 py-16">
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <div key={i} className="px-1 py-7" style={{ borderTop: "1px solid #e9dfca" }}>
              <div className="flex gap-3 items-start mb-3">
                <span className="text-[17px] font-extrabold shrink-0" style={{ color: "var(--color-ds-teal)" }}>Q</span>
                <span className="text-[17px] font-extrabold" style={{ color: "var(--color-ds-text)", lineHeight: 1.5 }}>{f.q}</span>
              </div>
              <div className="flex gap-3 items-start pl-px">
                <span className="text-[17px] font-extrabold shrink-0" style={{ color: "#c9bda3" }}>A</span>
                <p className="text-[15px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.75 }}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
