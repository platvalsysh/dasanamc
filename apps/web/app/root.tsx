import React, { useEffect } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useLocation,
  useRouteLoaderData,
} from "react-router";
import { useAuth } from "@repo/auth/ui";

import type { Route } from "./+types/root";
//global scss
import "@repo/module-editor/index.scss";
import "./app.css";

import {
  Auth,
  setAuthServerContext,
  createSupabaseSSR,
  setSupabaseServerContext,
  useAuthServerContext,
} from "@repo/auth/server";
import { AuthReactContext, SupabaseBrowserProvider } from "@repo/auth/ui";
import { FullPageLoader } from "@repo/ui";
import { removeTrailingSlashMiddleware, clientIPAddressMiddleware } from "@repo/core/server";


export const links: Route.LinksFunction = () => [
  // 파비콘 — dasanico.png 원본을 사이즈별로 리사이즈만 한 것 (변조 없음)
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "alternate icon", type: "image/x-icon", href: "/favicon.ico" },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200..900&display=swap",
  }
];

export const meta: Route.MetaFunction = () => [
  { title: "24시 다산 원동물의료센터" },
  { name: "description", content: "24시 다산 원동물의료센터 — 365일 24시간 연중무휴, 11개 특화진료센터." },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "theme-color", content: "#0e9d8c" },
  { charset: "utf-8" },
];

export function ViteBeforeReloadListener() {
  useEffect(() => {
    if (!import.meta.hot) return

    const handler = (payload: any) => {
      const router = (window as any).__reactRouterDataRouter;
      if (!router) {
        return;
      }
      const navigation = router?.state?.navigation;
      console.log('🔥 before full reload', payload, navigation)
      if (navigation && navigation.location && navigation.state === "loading") {
        window.location.href = `${navigation.location.pathname}${navigation.location.search}${navigation.location.hash}`;
        router.dispose?.();
        throw new Error('🔥 reload blocked');
      }
    }

    import.meta.hot.on('vite:beforeFullReload', handler)

    return () => {
      import.meta.hot?.off('vite:beforeFullReload', handler)
    }
  }, [])
  return null // UI 없음
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <SupabaseBrowserProvider>
          <AuthReactProviders>
            {children}
          </AuthReactProviders>
        </SupabaseBrowserProvider>
        <ScrollRestoration />
        <Scripts />
        <ViteBeforeReloadListener />
      </body>
    </html>
  );
}

function AuthReactProviders({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData("root") as { authReactContextData: any } | undefined;

  const authReactContextData = loaderData?.authReactContextData || {
    user: null,
    permissions: [],
    roles: [],
  };

  return (
    <AuthReactContext.Provider value={authReactContextData}>
      {children}
    </AuthReactContext.Provider>
  );
}

export function HydrateFallback() {
  return <FullPageLoader />;
}


const frontEndMiddleware: Route.MiddlewareFunction = async (
  { request, context },
  next,
) => {
  // const requesturl = new URL(request.url);
  // if (
  //   requesturl.pathname == "/api" ||
  //   requesturl.pathname.startsWith("/api/")
  // ) {
  //   return next();
  // }
  const { headers, supabase } = createSupabaseSSR(request);
  setSupabaseServerContext(context, supabase);

  const auth = await Auth.makeBySupabase(request, supabase);
  setAuthServerContext(context, auth);

  const response = await next();

  // Supabase가 갱신한 쿠키를 응답에 반영
  headers.forEach((value, key) => response.headers.append(key, value));

  return response;
};



export const middleware: Route.MiddlewareFunction[] = [
  removeTrailingSlashMiddleware,
  clientIPAddressMiddleware("x-app-client-ip"),
  frontEndMiddleware,
];

export async function loader({ context }: Route.LoaderArgs) {
  const auth = useAuthServerContext(context);
  const authReactContextData = auth.getAuthReactContextData();
  return { authReactContextData };
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "오류가 발생했습니다";
  let message = "알 수 없는 오류가 발생했습니다.";
  let stack: string | undefined;
  let status: number | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = "페이지를 찾을 수 없습니다.";
      message = "주소가 잘못되었거나 페이지가 이동되었습니다.";
    } else if (error.status === 403) {
      title = "접근할 수 없습니다.";
      message = "이 페이지를 볼 수 있는 권한이 없습니다.";
    } else if (error.status === 401) {
      title = "로그인이 필요합니다.";
      message = "로그인 후 이용해주세요.";
    } else {
      title = `${error.status} 오류`;
      message = error.statusText || message;
    }
  } else if (import.meta.env.DEV) {
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    }
  }

  return (
    <ErrorInfo title={title} message={message} stack={stack} status={status} />
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
    return null;
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