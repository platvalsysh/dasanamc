import type { MiddlewareFunction } from "react-router";
import { getClientIPAddress } from "../../utils";

export function clientIPAddressMiddleware(
  headerName: string
): MiddlewareFunction<Response> {
  return async ({ request }) => {
    const ipAddress = getClientIPAddress(request);
    if (ipAddress) {
      request.headers.set(headerName, ipAddress);
    }
    // return 없음 → 자동 next()
  };
}