import { type MiddlewareFunction, redirect } from "react-router";

const SAFE_METHODS = ["GET", "HEAD"];
export const removeTrailingSlashMiddleware: MiddlewareFunction<Response> = async (
  { request }
) => {
  if (!SAFE_METHODS.includes(request.method)) {
    return;
  }
  const url = new URL(request.url);
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    throw redirect(request.url.slice(0, -1), {
      status: 308,
    });
  }
}