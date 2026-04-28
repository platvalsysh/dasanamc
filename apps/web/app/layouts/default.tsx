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
  const { menuItems } = useLoaderData<typeof loader>();
  return <DefaultLayoutErrorBoundary menuItems={menuItems} error={error} />;
}