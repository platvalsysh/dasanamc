import { data } from "react-router";

interface ApiResponse<T> {
  error: boolean;
  message: string | null;
  data: T;
}

interface ListApiResponse<T> extends ApiResponse<T[]> {
  totalCounts: number;
  totalPages: number;
}

interface ApiErrorResponse<T> {
  error: boolean;
  message: string | null;
  data?: T | null;
}

/**
 * 모든 `api/*.ts` 액션/로더의 표준 JSON 응답 헬퍼.
 *
 * 응답 스키마: `{ error: boolean, message: string | null, data: T }`.
 * 페이징 시 `totalCounts`, `totalPages` 추가.
 *
 * @example
 * return JsonResponse.ok({ items });
 * return JsonResponse.paging({ data: items, totalCounts: 100, totalPages: 5 });
 * return JsonResponse.error("권한이 없습니다", 403);
 */
export class JsonResponse {
  /** 성공 응답. 기본 200. */
  static ok<T>(dataContent: T, status: number = 200, init?: ResponseInit) {
    const responseBody: ApiResponse<T> = {
      error: false,
      message: null,
      data: dataContent,
    };

    return data(responseBody, { ...init, status });
  }

  /** 페이징된 목록 응답. `totalCounts`/`totalPages` 포함. */
  static paging<T = any>(
    {
      data: listData,
      totalCounts,
      totalPages,
    }: { data: T[]; totalCounts: number; totalPages: number },
    status: number = 200,
    init?: ResponseInit,
  ) {
    const responseBody: ListApiResponse<T> = {
      error: false,
      message: null,
      data: listData,
      totalCounts: totalCounts,
      totalPages: totalPages,
    };
    return data(responseBody, { ...init, status });
  }

  /**
   * 에러 응답. 4xx 는 사용자 입력/권한, 5xx 는 시스템.
   * 사용자 노출 메시지는 한국어 + 내부 디테일 노출 금지.
   */
  static error(message: string, status: number = 500, init?: ResponseInit) {
    const responseBody: ApiErrorResponse<null> = {
      error: true,
      message: message,
      data: null,
    };

    return data(responseBody, { ...init, status });
  }
}
