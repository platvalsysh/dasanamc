import { useLoaderData } from "react-router";
import DefaultLayout, { DefaultLayoutErrorBoundary } from "@repo/layout-default/layout";
import { getSiteMenu } from "@repo/core/server";
import type { Route } from "./+types/default";

export async function loader() {
  const menuItems = await getSiteMenu("header");
  return { menuItems };
}

export default function Layout() {
  const { menuItems } = useLoaderData<typeof loader>();
  return <DefaultLayout menuItems={menuItems} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // 자식 라우트의 action 이 Response 를 throw 한 경우 (예: rate limit 429),
  // 이 부모 layout 의 loader 는 실행되지 않아 loaderData 가 undefined.
  // 안전하게 빈 메뉴로 fallback.
  const data = useLoaderData<typeof loader>() as { menuItems?: any } | undefined;
  return (
    <DefaultLayoutErrorBoundary menuItems={data?.menuItems ?? []} error={error} />
  );
}