import { useMemo, useState } from "react";
import type { Route } from "./+types/cases";
import { HOSPITAL, CENTERS } from "~/data/dasanone-content";
import {
  CASE_ARTICLES,
  blogPostUrl,
  type CaseKind,
  type CaseSpecies,
} from "~/data/case-archive";
import { StickyBgHero } from "~/components/site/StickyBgHero";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `치료 케이스 · 질환 정보 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "TPLO·FHNO·종양 절제·내시경 이물 제거 등 실제 치료 케이스와 분과별 질환 정보 아카이브.",
    },
  ];
}

const KIND_FILTERS: { key: CaseKind | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "case", label: "치료 케이스" },
  { key: "guide", label: "질환 정보" },
];

const SPECIES_FILTERS: { key: CaseSpecies | "all"; label: string }[] = [
  { key: "all", label: "모든 아이" },
  { key: "dog", label: "강아지" },
  { key: "cat", label: "고양이" },
];

const KIND_LABEL: Record<CaseKind, string> = {
  case: "치료 케이스",
  guide: "질환 정보",
};

const centerName = (id: string | null) =>
  id ? (CENTERS.find((c) => c.id === id)?.ko ?? null) : null;

export default function Cases() {
  const [kind, setKind] = useState<CaseKind | "all">("all");
  const [species, setSpecies] = useState<CaseSpecies | "all">("all");

  const filtered = useMemo(
    () =>
      CASE_ARTICLES.filter(
        (a) =>
          (kind === "all" || a.kind === kind) &&
          (species === "all" || a.species === "all" || a.species === species),
      ),
    [kind, species],
  );

  return (
    <>
      <StickyBgHero
        bgImage="/images/facility/operating-room.jpg"
        location={[{ label: "치료 케이스" }]}
        copy={"기록으로 증명하는 진료,\n다산원의 실제 치료 이야기입니다."}
        sub={`실제 치료 케이스 ${CASE_ARTICLES.filter((a) => a.kind === "case").length}건 · 질환 정보 ${CASE_ARTICLES.filter((a) => a.kind === "guide").length}편 — 네이버 블로그 원문으로 연결됩니다`}
        compact
      />

      <section className="max-w-[1280px] mx-auto px-8 py-20 md:py-24">
        {/* 필터 */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          {KIND_FILTERS.map((f) => {
            const active = kind === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setKind(f.key)}
                className="rounded-full px-5 py-2.5 text-[14px] font-bold transition-colors cursor-pointer"
                style={
                  active
                    ? { background: "#0d3a35", color: "#fff", border: "1px solid #0d3a35" }
                    : { background: "#fff", color: "var(--color-ds-text-sub)", border: "1px solid #d8e0dc" }
                }
              >
                {f.label}
              </button>
            );
          })}
          <span className="mx-2 h-5 w-px" style={{ background: "#dde5e1" }} />
          {SPECIES_FILTERS.map((f) => {
            const active = species === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setSpecies(f.key)}
                className="rounded-full px-5 py-2.5 text-[14px] font-bold transition-colors cursor-pointer"
                style={
                  active
                    ? { background: "var(--color-ds-teal)", color: "#fff", border: "1px solid var(--color-ds-teal)" }
                    : { background: "#fff", color: "var(--color-ds-text-sub)", border: "1px solid #d8e0dc" }
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p className="text-[13.5px] mb-10" style={{ color: "#8a948f" }}>
          {filtered.length}건 — 카드를 누르면 네이버 블로그 원문에서 전체 치료 과정을 볼 수 있습니다.
        </p>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <a
              key={a.logNo}
              href={blogPostUrl(a.logNo)}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-[20px] overflow-hidden transition-transform hover:-translate-y-1"
              style={{ background: "#f4f7f6" }}
            >
              {a.thumb && (
                <div className="overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={a.thumb}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[11.5px] font-extrabold rounded-md px-2.5 py-1"
                    style={
                      a.kind === "case"
                        ? { background: "#0d3a35", color: "#7be0d0" }
                        : { background: "#e2f4f1", color: "#0a7468" }
                    }
                  >
                    {KIND_LABEL[a.kind]}
                  </span>
                  {centerName(a.center) && (
                    <span
                      className="text-[11.5px] font-bold rounded-md px-2.5 py-1"
                      style={{ background: "#fff", color: "#6b7975" }}
                    >
                      {centerName(a.center)}
                    </span>
                  )}
                </div>
                <h3
                  className="text-[17px] font-extrabold mb-2.5"
                  style={{ color: "var(--color-ds-text)", lineHeight: 1.45 }}
                >
                  {a.title}
                </h3>
                <p
                  className="text-[13.5px] mb-5"
                  style={{
                    color: "var(--color-ds-text-sub)",
                    lineHeight: 1.7,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {a.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[12.5px]" style={{ color: "#9aa9a4" }}>{a.date}</span>
                  <span
                    className="text-[13px] font-bold transition-transform group-hover:translate-x-1"
                    style={{ color: "var(--color-ds-teal)" }}
                  >
                    원문 보기 →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
