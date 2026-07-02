import type { Route } from "./+types/notice";
import { HOSPITAL, NOTICES_FALLBACK } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { HERO_IMAGES } from "~/data/stock-images";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `공지사항 — ${HOSPITAL.name}` },
    {
      name: "description",
      content: "다산원동물의료센터 공지사항 — 진료 안내, 운영 변경, 새 장비/서비스 소식.",
    },
  ];
}

export default function SupportNotice() {
  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.notice}
        location={[{ label: "고객센터", to: "/support" }, { label: "공지사항" }]}
        copy={"다산원의 새로운 소식을\n가장 먼저 전해드립니다."}
      />

      <section className="max-w-[1080px] mx-auto px-8 py-16">
        <div className="flex flex-col gap-px rounded-2xl overflow-hidden" style={{ background: "#e8ddc6", border: "1px solid #e8ddc6" }}>
          {NOTICES_FALLBACK.map((n, i) => (
            <div key={i} className="bg-white px-6 py-5 flex items-center gap-[18px]">
              <span
                className="text-[11.5px] font-extrabold shrink-0"
                style={{ color: "var(--color-ds-teal)", background: "#e2f4f1", padding: "5px 11px", borderRadius: 6 }}
              >
                {n.tag}
              </span>
              <span className="text-[15px] font-semibold flex-1" style={{ color: "#2a3b37" }}>{n.t}</span>
              <span className="text-[13px] shrink-0" style={{ color: "#a59a82" }}>{n.date}</span>
            </div>
          ))}
        </div>
        <p className="text-[13px] mt-5" style={{ color: "#a59a82" }}>
          ※ 추가 공지는 네이버 블로그({HOSPITAL.blog})에서도 확인하실 수 있습니다.
        </p>
      </section>
    </>
  );
}
