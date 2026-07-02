import type { Route } from "./+types/facilities";
import { HOSPITAL, FACILITIES } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { HERO_IMAGES, FACILITY_STOCK } from "~/data/stock-images";
import { AssetSlot } from "~/components/AssetSlot";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `시설 안내 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "안내데스크부터 ICU 중환자실, 고양이 전용 공간까지 — 다산원동물의료센터의 12개 핵심 공간을 둘러보세요.",
    },
  ];
}

export default function AboutFacilities() {
  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.facilities}
        location={[{ label: "병원소개", to: "/about" }, { label: "병원 둘러보기" }]}
        copy={"아이들은 편안하게, 보호자님은 안심하도록\n세심하게 설계된 공간입니다."}
        sub="진료실부터 ICU 중환자실, 고양이 전용 공간까지 — 12개 핵심 공간"
      />

      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <div
          data-stagger=""
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 facgrid"
        >
          {FACILITIES.map((f, i) => (
            <div
              key={f.name}
              className="rounded-[10px] overflow-hidden bg-white"
              style={{ border: "1px solid #e9dfca" }}
            >
              <AssetSlot
                src={FACILITY_STOCK[i]}
                alt={f.name}
                className="w-full object-cover"
                style={{ aspectRatio: "4/3" }}
                label="사진 영역"
              />
              <div className="px-3.5 pt-3 pb-4">
                <div
                  className="text-[13.5px] font-bold mb-1.5"
                  style={{ color: "#2a3b37" }}
                >
                  {f.name}
                </div>
                <p
                  className="text-[12.5px]"
                  style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.6 }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
