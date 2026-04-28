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

export class JsonResponse {
  static ok<T>(dataContent: T, status: number = 200, init?: ResponseInit) {
    const responseBody: ApiResponse<T> = {
      error: false,
      message: null,
      data: dataContent,
    };

    return data(responseBody, { ...init, status });
  }

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

  static error(message: string, status: number = 500, init?: ResponseInit) {
    const responseBody: ApiErrorResponse<null> = {
      error: true,
      message: message,
      data: null,
    };

    return data(responseBody, { ...init, status });
  }
}
