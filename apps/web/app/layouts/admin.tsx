import AdminLayout from "@repo/layout-admin/layout";
import {
  type LoaderFunctionArgs,
  redirect,
  type RouterContextProvider,
  useLoaderData,
} from "react-router";
import { useAuthServerContext } from "@repo/auth/server";
import { getAdminMenu } from "@repo/core/server";

export async function loader({
  context,
}: LoaderFunctionArgs<RouterContextProvider>) {
  const auth = useAuthServerContext(context);
  const isLogged = auth.isLogged();
  if (!isLogged) {
    throw redirect("/auth/login");
  }

  const menuConfig = await getAdminMenu();

  return { menuConfig };
}

export default function Layout() {
  const { menuConfig } = useLoaderData<typeof loader>();

  return <AdminLayout menuItems={menuConfig} />;
}
