import type { Route } from "./+types/facilities";
import { HOSPITAL, FACILITIES } from "~/data/dasanone-content";
import { DarkPageHero } from "~/components/site/DarkPageHero";
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
      <DarkPageHero
        tag="FACILITIES"
        title="병원 둘러보기"
        subtitle="진료실부터 ICU 중환자실, 고양이 전용 공간까지 — 환자 동선에 맞춰 설계된 12개 공간."
      />

      <section className="max-w-[1280px] mx-auto px-8 py-20">
        <div
          data-stagger=""
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 facgrid"
        >
          {FACILITIES.map((f) => (
            <div
              key={f}
              className="rounded-[10px] overflow-hidden"
              style={{ border: "1px solid #e9dfca" }}
            >
              <AssetSlot style={{ aspectRatio: "4/3" }} label="사진 영역" />
              <div
                className="px-3.5 py-3 text-[13.5px] font-bold"
                style={{ color: "#2a3b37" }}
              >
                {f}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
