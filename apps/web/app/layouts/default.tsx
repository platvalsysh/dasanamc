import { isRouteErrorResponse, Link, Outlet, useLoaderData, useLocation, useNavigate } from "react-router"; // useLocation 은 ErrorInfo 가 사용
import { useEffect, type PropsWithChildren } from "react";
import { getSiteMenu } from "@repo/core/server";
import { SiteMenuProvider } from "@repo/core/ui";
import { useAuth } from "@repo/auth/ui";
import type { SiteMenuConfigItem } from "@repo/core/types";
import type { Route } from "./+types/default";
import { Header } from "~/components/site/Header";
import { SiteFooter } from "~/components/site/SiteFooter";
import { QuickBar } from "~/components/site/QuickBar";
import { MobileBar } from "~/components/site/MobileBar";
import { ScrollEffects } from "~/components/site/ScrollEffects";

export async function loader() {
  const menuItems = await getSiteMenu("header");
  return { menuItems };
}

interface ShellProps {
  menuItems?: SiteMenuConfigItem[];
}

/**
 * 다산원 공개 사이트 레이아웃. 라이트 헤더가 항상 sticky.
 */
function Shell({ menuItems, children }: PropsWithChildren<ShellProps>) {
  return (
    <SiteMenuProvider menuItems={menuItems || []}>
      <div className="flex min-h-screen flex-col bg-[color:var(--color-ds-bg)]">
        <ScrollEffects />
        <Header menuItems={menuItems} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
        </div>
        <QuickBar />
        <MobileBar />
      </div>
    </SiteMenuProvider>
  );
}

export default function Layout() {
  const { menuItems } = useLoaderData<typeof loader>();
  return (
    <Shell menuItems={menuItems}>
      <Outlet />
    </Shell>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // 자식 라우트의 action 이 Response 를 throw 한 경우 (예: rate limit 429),
  // 이 부모 layout 의 loader 는 실행되지 않아 loaderData 가 undefined.
  // 안전하게 빈 메뉴로 fallback.
  const data = useLoaderData<typeof loader>() as { menuItems?: SiteMenuConfigItem[] } | undefined;

  let title = "오류가 발생했습니다";
  let message = "알 수 없는 오류가 발생했습니다.";
  let stack: string | undefined;
  let status: number | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    const dataMessage =
      typeof error.data === "string" && error.data.trim() ? error.data : null;

    if (error.status === 404) {
      title = "페이지를 찾을 수 없습니다.";
      message = "주소가 잘못되었거나 페이지가 이동되었습니다.";
    } else if (error.status === 403) {
      title = "접근할 수 없습니다.";
      message = dataMessage ?? "이 페이지를 볼 수 있는 권한이 없습니다.";
    } else if (error.status === 401) {
      title = "로그인이 필요합니다.";
      message = "로그인 후 이용해주세요.";
    } else if (error.status === 429) {
      title = "요청이 너무 많습니다";
      message = dataMessage ?? "잠시 후 다시 시도해 주세요.";
    } else {
      title = `${error.status} 오류`;
      message = dataMessage ?? error.statusText ?? message;
    }
  } else if (import.meta.env.DEV) {
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    }
  }

  return (
    <Shell menuItems={data?.menuItems ?? []}>
      <ErrorInfo title={title} message={message} stack={stack} status={status} />
    </Shell>
  );
}

function ErrorInfo({
  title,
  message,
  stack,
  status,
}: {
  title: string;
  message: string;
  stack?: string;
  status?: number;
}) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const shouldRedirectToLogin = !user && (status === 401 || status === 403);

  useEffect(() => {
    if (shouldRedirectToLogin) {
      const redirectTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth/login?redirectTo=${redirectTo}`, { replace: true });
    }
  }, [shouldRedirectToLogin, navigate, location]);

  if (shouldRedirectToLogin) return null;

  return (
    <>
      <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            뒤로가기
          </button>
          <Link to="/" className="px-4 py-2 bg-[color:var(--color-ds-dark-2)] text-white rounded hover:opacity-90 transition-opacity">
            홈으로
          </Link>
        </div>
      </div>

      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </>
  );
}
