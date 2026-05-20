import { defineConfig } from "vitest/config";

// AUTH_SECRET 은 phone-verify 가 module-load 시점에 throw 하므로 dotenv
// 로딩 전이라도 vitest 가 환경변수를 갖도록 여기서 fallback 주입.
// 실제 .env 의 AUTH_SECRET 이 있으면 그대로 사용.
if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "test-secret-only-for-vitest-do-not-use-in-prod";
}

export default defineConfig({
  test: {
    include: ["packages/*/test/**/*.test.ts"],
    environment: "node",
    globals: false,
  },
});
