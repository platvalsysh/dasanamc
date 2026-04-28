import { describe, it, expect } from "vitest";
import { JsonResponse } from "../src/.server/JsonResponse";

describe("JsonResponse", () => {
  it("ok: { error: false, message: null, data } 형태로 반환", () => {
    const result = JsonResponse.ok({ id: 1, name: "test" }) as any;
    const body = result.data;
    expect(body.error).toBe(false);
    expect(body.message).toBeNull();
    expect(body.data).toEqual({ id: 1, name: "test" });
  });

  it("error: { error: true, message, data: null } 형태로 반환", () => {
    const result = JsonResponse.error("권한이 없습니다", 403) as any;
    const body = result.data;
    expect(body.error).toBe(true);
    expect(body.message).toBe("권한이 없습니다");
    expect(body.data).toBeNull();
    expect(result.init.status).toBe(403);
  });

  it("paging: totalCounts/totalPages 포함", () => {
    const result = JsonResponse.paging({
      data: [1, 2, 3],
      totalCounts: 100,
      totalPages: 10,
    }) as any;
    const body = result.data;
    expect(body.error).toBe(false);
    expect(body.data).toEqual([1, 2, 3]);
    expect(body.totalCounts).toBe(100);
    expect(body.totalPages).toBe(10);
  });
});
