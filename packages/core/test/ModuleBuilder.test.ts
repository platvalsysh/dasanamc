import { describe, it, expect } from "vitest";
import { createModule } from "../src/.server/module-builder";

describe("ModuleBuilder", () => {
  it("이름만으로 모듈 생성", () => {
    const m = createModule("blog").build();
    expect(m.name).toBe("blog");
  });

  it("permissions / roles / routes 체이닝", () => {
    const m = createModule("blog")
      .permissions([
        { name: "blog.list", display_name: "목록 조회" },
        { name: "blog.delete", display_name: "삭제", is_dangerous: true },
      ])
      .roles([
        { name: "ROLE_BLOG_EDITOR", display_name: "Editor", permission_names: ["blog.list"] },
      ])
      .routes({
        public: [{ id: "blog/index", path: "/blog", file: "blog/index.tsx" } as any],
        admin: [],
        api: [],
      })
      .build();

    expect(m.permissions).toHaveLength(2);
    expect(m.permissions?.[1].is_dangerous).toBe(true);
    expect(m.roles?.[0].permission_names).toEqual(["blog.list"]);
    expect(m.routes?.public).toHaveLength(1);
    expect(m.routes?.admin).toHaveLength(0);
  });

  it("권한 이름은 모듈 prefix 강제 (타입 레벨, 런타임 통과)", () => {
    const m = createModule("shop")
      .permissions([{ name: "shop.read", display_name: "조회" }])
      .build();
    expect(m.permissions?.[0].name.startsWith("shop.")).toBe(true);
  });
});
