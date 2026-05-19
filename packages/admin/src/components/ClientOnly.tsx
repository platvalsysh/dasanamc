import { useState, useEffect, type ReactNode } from "react";

/**
 * 자식을 클라이언트 hydration 후에만 렌더한다. SSR 단계에서는 `fallback` 사용.
 *
 * 사용 케이스: `@dnd-kit/core` 처럼 자체 ID 카운터를 쓰는 라이브러리 — 서버와
 * 클라이언트의 카운터가 어긋나 hydration mismatch (`aria-describedby="DndDescribedBy-N"`)
 * 가 발생, 이벤트 핸들러가 broken state. ClientOnly 로 감싸면 서버에선 정적
 * fallback 만, 마운트 후 dnd 활성화돼 클릭/드래그가 정상 동작.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}
