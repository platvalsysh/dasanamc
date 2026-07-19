import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Route } from "./+types/faq";
import { ogMeta } from "~/lib/og";
import { HOSPITAL, FAQS, FAQ_CATEGORIES } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { HERO_IMAGES } from "~/data/stock-images";

export function meta({}: Route.MetaArgs) {
  return ogMeta(`자주 묻는 질문 — ${HOSPITAL.name}`, "예약·진료비·주차·야간 응급 등 보호자가 자주 묻는 질문 모음.", "/support/faq");
}

export default function SupportFaq() {
  const [category, setCategory] = useState<string>("전체");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filtered = FAQS.filter(
    (f) => category === "전체" || f.cat === category,
  );

  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.faq}
        location={[{ label: "고객센터", to: "/support" }, { label: "자주 묻는 질문" }]}
        compact
        copy={"보호자님들이 가장 많이 물으시는 질문,\n미리 답해두었습니다."}
      />

      <section className="max-w-[920px] mx-auto px-8 py-24">
        {/* 카테고리 칩 */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {FAQ_CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setOpenIdx(0);
                }}
                className="rounded-full px-5 py-2.5 text-[14px] font-bold transition-colors cursor-pointer"
                style={
                  active
                    ? { background: "var(--color-ds-dark-warm)", color: "#fff", border: "1px solid #0d3a35" }
                    : { background: "#fff", color: "var(--color-ds-text-sub)", border: "1px solid #d8e0dc" }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 아코디언 */}
        <div className="flex flex-col gap-3">
          {filtered.map((f, i) => {
            const open = openIdx === i;
            return (
              <div
                key={f.q}
                className="rounded-[20px] overflow-hidden"
                style={{ background: "var(--color-ds-bento)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center gap-4 px-7 py-6 text-left cursor-pointer"
                >
                  <span
                    className="text-[16px] font-extrabold shrink-0"
                    style={{ color: "var(--color-ds-teal-deep)" }}
                  >
                    Q
                  </span>
                  <span
                    className="flex-1 text-[16px] font-extrabold"
                    style={{ color: "var(--color-ds-text)", lineHeight: 1.5 }}
                  >
                    {f.q}
                  </span>
                  <span
                    className="shrink-0 text-[11px] font-bold rounded-full px-3 py-1 hidden sm:inline-block"
                    style={{ background: "#fff", color: "var(--color-ds-text-sub)" }}
                  >
                    {f.cat}
                  </span>
                  <ChevronDown
                    size={18}
                    strokeWidth={2.2}
                    className="shrink-0 transition-transform"
                    style={{
                      color: "var(--color-ds-teal-deep)",
                      transform: open ? "rotate(180deg)" : "none",
                    }}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="flex gap-4 px-7 pb-7 pt-1">
                      <span
                        className="text-[16px] font-extrabold shrink-0"
                        style={{ color: "#b8c4bf" }}
                      >
                        A
                      </span>
                      <p
                        className="text-[16px]"
                        style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.8 }}
                      >
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
