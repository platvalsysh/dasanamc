import { Link, redirect } from "react-router";
import type { Route } from "./+types/$id";
import { HOSPITAL, CENTERS, CENTER_CASES } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { HERO_IMAGES } from "~/data/stock-images";

export function loader({ params }: Route.LoaderArgs) {
  const id = params.id;
  // checkup-c 는 건강검진센터(11번 센터), checkup 은 별도 페이지에서 처리
  if (id === "checkup") {
    return redirect("/centers/checkup", 301);
  }
  const center = CENTERS.find((c) => c.id === id);
  if (!center) {
    throw new Response("센터를 찾을 수 없습니다.", { status: 404 });
  }
  return { center };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: `특화진료센터 — ${HOSPITAL.name}` }];
  return [
    { title: `${data.center.ko} — ${HOSPITAL.name}` },
    { name: "description", content: data.center.slogan },
  ];
}

export default function CenterDetail({ loaderData }: Route.ComponentProps) {
  const { center: c } = loaderData;

  // 이전/다음 센터 (CENTERS 순서 기준)
  const idx = CENTERS.findIndex((x) => x.id === c.id);
  const prev = idx > 0 ? CENTERS[idx - 1] : null;
  const next = idx >= 0 && idx < CENTERS.length - 1 ? CENTERS[idx + 1] : null;

  // 이 센터와 관련된 블로그 진료 케이스
  const cases = CENTER_CASES[c.id] ?? [];

  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.centerDetail}
        location={[{ label: "특화진료센터", to: "/centers" }, { label: c.ko }]}
        copy={c.slogan}
        sub={c.en}
      />

      <article className="max-w-[920px] mx-auto px-8 py-16">
        <div className="mb-2 text-[13px] font-semibold" style={{ letterSpacing: "0.06em", color: "#a59a82" }}>
          {c.en}
        </div>

        <p className="text-[16px] mb-12" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.85 }}>
          {c.overview}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div>
            <div className="text-[12.5px] font-extrabold mb-3" style={{ letterSpacing: "0.04em", color: "var(--color-ds-teal)" }}>
              주요 진료 대상
            </div>
            <p className="text-[15px]" style={{ color: "var(--color-ds-text-sub)", lineHeight: 1.8 }}>
              {c.targets}
            </p>
          </div>
          <div>
            <div className="text-[12.5px] font-extrabold mb-3" style={{ letterSpacing: "0.04em", color: "var(--color-ds-teal)" }}>
              다산원의 강점
            </div>
            <ul className="list-none flex flex-col gap-2.5">
              {c.strengths.map((s) => (
                <li key={s} className="flex gap-3 text-[15px]" style={{ color: "#3a4744", lineHeight: 1.65 }}>
                  <span className="font-extrabold shrink-0" style={{ color: "var(--color-ds-teal)" }}>✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 관련 진료 케이스 — 네이버 블로그 실제 포스트 */}
        {cases.length > 0 && (
          <div className="mb-16">
            <div
              className="mb-3.5"
              style={{
                font: "700 13px/1 ui-monospace, monospace",
                letterSpacing: "0.22em",
                color: "var(--color-ds-teal)",
              }}
            >
              CASES
            </div>
            <h2 className="text-[22px] font-extrabold mb-6" style={{ letterSpacing: "-0.02em", color: "var(--color-ds-text)" }}>
              관련 진료 케이스
            </h2>
            <div className="flex flex-col gap-px rounded-2xl overflow-hidden" style={{ background: "#e8ddc6", border: "1px solid #e8ddc6" }}>
              {cases.map((cs) => (
                <a
                  key={cs.url}
                  href={cs.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white px-6 py-4 flex items-center gap-4 transition-colors hover:bg-[rgba(14,157,140,0.04)]"
                >
                  <span
                    className="text-[11px] font-extrabold shrink-0"
                    style={{ color: "var(--color-ds-teal)", background: "#e2f4f1", padding: "4px 10px", borderRadius: 6 }}
                  >
                    블로그
                  </span>
                  <span className="text-[14.5px] font-semibold flex-1" style={{ color: "#2a3b37" }}>
                    {cs.title}
                  </span>
                  <span className="shrink-0 text-[15px]" style={{ color: "#cbd6d1" }}>→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* prev / next nav */}
        <div className="grid grid-cols-2 gap-4 pt-10" style={{ borderTop: "1px solid #e9dfca" }}>
          {prev ? (
            <Link
              to={`/centers/${prev.id}`}
              className="block px-6 py-5 rounded-xl transition-colors hover:bg-[rgba(14,157,140,0.04)]"
              style={{ border: "1px solid #e9dfca" }}
            >
              <div className="text-[11.5px] font-semibold mb-1" style={{ letterSpacing: "0.08em", color: "#a59a82" }}>
                ← PREV
              </div>
              <div className="text-[15px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>
                {prev.num}. {prev.ko}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={`/centers/${next.id}`}
              className="block px-6 py-5 rounded-xl text-right transition-colors hover:bg-[rgba(14,157,140,0.04)]"
              style={{ border: "1px solid #e9dfca" }}
            >
              <div className="text-[11.5px] font-semibold mb-1" style={{ letterSpacing: "0.08em", color: "#a59a82" }}>
                NEXT →
              </div>
              <div className="text-[15px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>
                {next.num}. {next.ko}
              </div>
            </Link>
          ) : (
            <Link
              to="/centers/checkup"
              className="block px-6 py-5 rounded-xl text-right transition-colors hover:bg-[rgba(14,157,140,0.04)]"
              style={{ border: "1px solid #e9dfca" }}
            >
              <div className="text-[11.5px] font-semibold mb-1" style={{ letterSpacing: "0.08em", color: "#a59a82" }}>
                NEXT →
              </div>
              <div className="text-[15px] font-extrabold" style={{ color: "var(--color-ds-text)" }}>
                건강검진 프로그램
              </div>
            </Link>
          )}
        </div>

        <div className="text-center mt-10">
          <Link to="/centers" className="text-[14px] font-semibold" style={{ color: "var(--color-ds-teal)" }}>
            ← 특화진료센터 전체 보기
          </Link>
        </div>
      </article>
    </>
  );
}
