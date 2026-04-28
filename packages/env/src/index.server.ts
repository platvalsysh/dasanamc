import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log("process.cwd:", process.cwd());

let currentDir = __dirname;
let found = false;

while (true) {
  const envPath = path.join(currentDir, ".env");
  // console.log("envPath:", envPath);
  if (fs.existsSync(envPath)) {
    console.log("Found .env at:", envPath);
    dotenv.config({ path: envPath });
    found = true;
    break;
  }
  const parentDir = path.dirname(currentDir);
  if (parentDir === currentDir) {
    break;
  }
  currentDir = parentDir;
}

if (!found) {
  console.warn("Could not find .env file in parent directories");
}

export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;

export const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * 활성화할 기능 모듈 화이트리스트.
 *
 * - 미설정/빈 문자열 → 모든 모듈 활성 (개발 기본값).
 * - 콤마 구분 (예: "board,bxmember,sms") → 해당 모듈만 등록.
 * - `core`, `auth`, `admin` 은 화이트리스트와 무관하게 항상 활성 (필수 인프라).
 *
 * 외주 프로젝트에서 사용 안 하는 모듈을 빠르게 끄는 용도. 모듈 디렉토리를
 * 삭제하지 않고도 비활성화 가능. 라우트·메뉴·권한 모두 등록되지 않음.
 */
export const ENABLED_MODULES: string[] | null = (() => {
  const raw = process.env.ENABLED_MODULES?.trim();
  if (!raw) return null;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
})();
