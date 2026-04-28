# @repo/database

Prisma 클라이언트 + SQL 마이그레이션 + 모든 모듈에서 공유하는 DB 타입.

## 사용

```ts
import { prisma, type Prisma } from "@repo/database";

const users = await prisma.users.findMany({ where: { ... } });
```

`Prisma.InputJsonValue` 등 namespace 타입도 그대로 re-export.

## 마이그레이션 (중요)

> **`schema.prisma` 직접 수정 금지.** SQL 마이그레이션 워크플로 사용.

```bash
# 1. 모듈 디렉토리에 SQL 파일 작성
# packages/{모듈}/migrate/2026-04-29_add_foo.sql

# 2. 적용 + 스키마 pull + 클라이언트 재생성
pnpm db:migrate   # SQL 파일 실행
pnpm db:pull      # Postgres → schema.prisma 역인출
pnpm db:gen       # schema.prisma → src/generated/* 클라이언트 생성
```

자세한 절차: [docs/guidelines/database-migration.md](../../docs/guidelines/database-migration.md)

## 디렉토리

```
src/
  client.server.ts     # PrismaClient 싱글톤 인스턴스
  index.server.ts      # 공개 export
  generated/           # Prisma 자동 생성 (절대 손대지 말 것)
```

## 의존성

- `@prisma/client` (catalog)
- `@prisma/adapter-pg`, `pg` — pg adapter (Prisma 7)
- `@repo/env` — `DATABASE_URL`, `DIRECT_URL`

## Postgres 어떤 걸 쓰나

- 운영: Supabase
- 마이그레이션 시: `DIRECT_URL` (Direct 연결, 6543 → 5432)
- 일반 쿼리: `DATABASE_URL` (Pooler, 6543, pgbouncer)
