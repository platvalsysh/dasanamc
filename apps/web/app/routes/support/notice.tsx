import type { Route } from "./+types/notice";
import { ogMeta } from "~/lib/og";
import { HOSPITAL, NOTICES_FALLBACK } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { HERO_IMAGES } from "~/data/stock-images";

export function meta({}: Route.MetaArgs) {
  return ogMeta(`공지사항 — ${HOSPITAL.name}`, "다산원동물의료센터 공지사항 — 진료 안내, 운영 변경, 새 장비/서비스 소식.", "/support/notice");
}

export default function SupportNotice() {
  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.notice}
        location={[{ label: "고객센터", to: "/support" }, { label: "공지사항" }]}
        compact
        copy={"다산원의 새로운 소식을\n가장 먼저 전해드립니다."}
      />

      <section className="max-w-[1080px] mx-auto px-8 py-24">
        <div className="flex flex-col gap-3">
          {NOTICES_FALLBACK.map((n, i) => (
            <div
              key={i}
              className="rounded-[20px] px-8 py-6 flex items-center gap-5"
              style={{ background: "var(--color-ds-bento)" }}
            >
              <span
                className="text-[11.5px] font-extrabold shrink-0"
                style={{ color: "var(--color-ds-teal-deep)", background: "#ffffff", padding: "6px 12px", borderRadius: 8 }}
              >
                {n.tag}
              </span>
              <span className="text-[15.5px] font-semibold flex-1" style={{ color: "var(--color-ds-text)" }}>{n.t}</span>
              <span className="text-[13px] shrink-0" style={{ color: "var(--color-ds-text-sub)" }}>{n.date}</span>
            </div>
          ))}
        </div>
        <p className="text-[13px] mt-6" style={{ color: "var(--color-ds-text-sub)" }}>
          ※ 추가 공지는 네이버 블로그({HOSPITAL.blog})에서도 확인하실 수 있습니다.
        </p>
      </section>
    </>
  );
}
