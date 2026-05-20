import { isRouteErrorResponse, Link, Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { Header } from "./components/header";
import { QuickBar } from "./components/quick-bar";
import { SiteFooter } from "./components/site-footer";
import type { SiteMenuConfigItem } from "@repo/core/types";
import { SiteMenuProvider } from "@repo/core/ui";
import type { PropsWithChildren } from "react";
import { useAuth } from "@repo/auth/ui";

interface DefaultLayoutProps {
    menuItems?: SiteMenuConfigItem[];
}

function Layout({ menuItems, children }: PropsWithChildren<DefaultLayoutProps>) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <SiteMenuProvider menuItems={menuItems || []}>
        <div className="flex min-h-screen flex-col">
          <Header menuItems={menuItems} />
          <div className="flex-1 flex flex-col md:pr-16">
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            {!isHomePage && <SiteFooter />}
          </div>
          <QuickBar />
        </div>
    </SiteMenuProvider>
  );
}

export default function DefaultLayout({ menuItems }: DefaultLayoutProps) {
  return (
    <Layout menuItems={menuItems}>
      <Outlet />
    </Layout>
  );
}

interface DefaultLayoutErrorBoundaryProps {
    menuItems?: SiteMenuConfigItem[];
    error: unknown
}

export function DefaultLayoutErrorBoundary({ menuItems, error }: DefaultLayoutErrorBoundaryProps) {
  let title = "오류가 발생했습니다";
  let message = "알 수 없는 오류가 발생했습니다.";
  let stack: string | undefined;
  let status: number | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    // `throw new Response("본문", {status})` 의 본문은 `error.data` 로 들어옴.
    // 라우트가 던진 친절한 한국어 메시지(429 rate limit / 403 권한 등)를 우선 표시.
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
    <Layout menuItems={menuItems}>
      <ErrorInfo title={title} message={message} stack={stack} status={status} />
    </Layout>
  );
}

function ErrorInfo({ title, message, stack, status }: { title: string; message: string; stack?: string; status?: number }) {
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

  if (shouldRedirectToLogin) {
    return null; // Redirecting...
  }

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
        <Link 
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
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