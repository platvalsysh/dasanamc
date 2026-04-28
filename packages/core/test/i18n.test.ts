import { describe, it, expect, beforeEach } from "vitest";
import { t, setLang, getLang, registerDict } from "../src/ui/i18n";

describe("i18n", () => {
  beforeEach(() => {
    setLang("ko");
  });

  it("기본 한국어 키 조회", () => {
    expect(t("common.save")).toBe("저장");
    expect(t("common.cancel")).toBe("취소");
  });

  it("setLang(en) 후 영어로 전환", () => {
    setLang("en");
    expect(getLang()).toBe("en");
    expect(t("common.save")).toBe("Save");
  });

  it("명시적 lang 인자가 전역 current 보다 우선", () => {
    setLang("ko");
    expect(t("common.save", undefined, "en")).toBe("Save");
    expect(getLang()).toBe("ko");
  });

  it("누락 키는 key 자체 반환", () => {
    expect(t("non.existent.key")).toBe("non.existent.key");
  });

  it("변수 치환 {name} 패턴", () => {
    registerDict("ko", { "greeting": "안녕하세요, {name} 님" });
    expect(t("greeting", { name: "홍길동" })).toBe("안녕하세요, 홍길동 님");
  });

  it("registerDict 로 모듈 사전 병합", () => {
    registerDict("ko", { "blog.title": "블로그" });
    registerDict("en", { "blog.title": "Blog" });
    expect(t("blog.title")).toBe("블로그");
    expect(t("blog.title", undefined, "en")).toBe("Blog");
  });
});
