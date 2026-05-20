import { type LoaderFunctionArgs } from "react-router";
import type { BoardWidgetItem, BoardWidgetResponse } from "../types/widget";
import { resolveBoardWidgetItems } from "../.server/widget-service";

/**
 * 홈페이지 등에서 사용되는 LatestPostsWidget 의 데이터 API.
 *
 * SSR 경로(home loader)에서는 직접 `resolveBoardWidgetItems` 를 호출하는 것을
 * 권장. 이 endpoint 는 client-side 위젯이 별도 라우트에서 데이터를 가져올 때만
 * 사용 (예: 위젯이 home 외 페이지에서 단독으로 떠있을 때).
 */
export async function loader({ request }: LoaderFunctionArgs): Promise<BoardWidgetResponse> {
  const url = new URL(request.url);
  const midsParam = url.searchParams.get("mids");

  if (!midsParam) {
    return { items: [] };
  }

  const mids = midsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (mids.length === 0) {
    return { items: [] };
  }

  const items: BoardWidgetItem[] = await resolveBoardWidgetItems(mids);
  return { items };
}
