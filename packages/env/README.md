# @repo/env

`process.env` 타입 안전 접근 + `.env` 자동 로드.

## 사용

```ts
import {
  DATABASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  ENABLED_MODULES,
} from "@repo/env/server";
```

## 동작

1. import 시 부모 디렉토리들을 거슬러 올라가며 `.env` 를 찾고 dotenv 로 로드
2. 찾지 못해도 throw 하지 않음 (Vercel 빌드 스캔 호환)
3. 환경 변수를 typed export 로 노출

## 주요 export

| 변수 | 설명 |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Postgres 연결 (Supabase Pooler / Direct) |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase 자격증명 |
| `NODE_ENV`, `PORT` | 런타임 |
| **`ENABLED_MODULES`** | `string[] \| null` — 콤마 구분 화이트리스트. 미설정 → 모든 모듈 활성. `core`/`auth`/`admin` 은 항상 활성 (`apps/web/app/modules.server.ts` 가 강제) |

## 신규 환경 변수 추가 절차

1. `.env.example` 에 항목 + 한국어 설명 주석 추가
2. `src/index.server.ts` 에 typed export 추가 — 가능하면 파싱/기본값까지
3. 사용처에서 `@repo/env/server` 를 import (직접 `process.env` 접근 금지)
