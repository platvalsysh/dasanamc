import { prisma } from "@repo/database";
import { convert } from "html-to-text";
import type { BoardWidgetItem } from "../types/widget";

/**
 * 홈페이지 LatestPostsWidget 에 사용할 항목들을 한 묶음으로 해석.
 *
 * 이전엔 mid 마다 modules.findFirst + documents.findFirst 두 번 호출해
 * mids 4개 = 8 쿼리 N+1. 이제 두 쿼리만:
 *   1) modules where mid IN (...)
 *   2) documents where (module_id, created_at desc) — 모듈마다 첫 행만
 *
 * Postgres 의 DISTINCT ON 으로 "모듈별 최신 1건" 을 한 번에 가져오고,
 * html→text 변환을 위해 content 만 가져온 뒤 500자만 잘라 summary 로.
 *
 * `mid` 비교는 case-insensitive 유지를 위해 `lower(mid) IN (...)`. 인덱스
 * 없으면 seq scan 일 수 있으나 modules 테이블 규모가 작아 무시 가능.
 */
export async function resolveBoardWidgetItems(
  mids: string[],
): Promise<BoardWidgetItem[]> {
  if (mids.length === 0) return [];

  const lowerMids = mids.map((m) => m.toLowerCase());

  // 1) 모듈 메타 조회
  const modules = await prisma.modules.findMany({
    where: {
      module: "board",
      mid: { in: mids, mode: "insensitive" },
    },
    select: { id: true, mid: true, browser_title: true },
  });

  if (modules.length === 0) return [];

  const moduleIds = modules.map((m) => m.id);

  // 2) 각 모듈의 최신 PUBLIC 문서 1건을 DISTINCT ON 으로 일괄 조회
  //    Prisma 가 DISTINCT ON 지원이 약해 raw 사용. summary 만 필요하므로
  //    LEFT 6000 자만 가져와 변환 비용 cap (긴 문서도 500자 요약이라 충분).
  const latest = await prisma.$queryRaw<
    Array<{
      id: string;
      module_id: string;
      title: string;
      created_at: Date;
      content_snippet: string | null;
      category_name: string | null;
    }>
  >`
    SELECT DISTINCT ON (d.module_id)
      d.id,
      d.module_id,
      d.title,
      d.created_at,
      LEFT(d.content, 6000) AS content_snippet,
      dc.name AS category_name
    FROM modules.documents d
    LEFT JOIN modules.document_categories dc ON dc.id = d.category_id
    WHERE d.module_id = ANY(${moduleIds}::uuid[])
      AND d.status = 'PUBLIC'
    ORDER BY d.module_id, d.created_at DESC
  `;

  const byModuleId = new Map(latest.map((row) => [row.module_id, row]));

  const items: BoardWidgetItem[] = modules.map((module) => {
    const row = byModuleId.get(module.id);
    const document = row
      ? {
          id: row.id,
          title: row.title,
          date: row.created_at.toISOString(),
          summary: row.content_snippet
            ? convert(row.content_snippet, {
                wordwrap: false,
                selectors: [
                  { selector: "img", format: "skip" },
                  { selector: "a", options: { ignoreHref: true } },
                ],
              }).substring(0, 500)
            : "",
          category: row.category_name ?? undefined,
        }
      : undefined;
    return {
      mid: module.mid,
      moduleTitle: module.browser_title ?? module.mid,
      document,
    };
  });

  // 최신 문서가 있는 모듈을 위로, 없는 모듈은 뒤로. 요청 mids 순서 유지.
  const requestOrder = new Map(
    lowerMids.map((m, i) => [m, i] as const),
  );
  items.sort((a, b) => {
    const oa = requestOrder.get(a.mid.toLowerCase()) ?? 999;
    const ob = requestOrder.get(b.mid.toLowerCase()) ?? 999;
    return oa - ob;
  });

  return items;
}
