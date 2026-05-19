# 데이터베이스 마이그레이션 가이드

## ⚠️ 중요: Prisma 스키마 직접 수정 금지

> **이 프로젝트는 Prisma 마이그레이션을 사용하지 않습니다!**

### ❌ 절대 하지 말아야 할 것

- `schema.prisma` 파일을 직접 수정하지 마세요
- `prisma migrate` 명령어를 사용하지 마세요
- Prisma 스키마에 필드를 추가한 후 마이그레이션하지 마세요

### ✅ 올바른 데이터베이스 변경 프로세스

데이터베이스 스키마를 변경하려면 **반드시** 다음 순서를 따르세요:

1. **SQL 마이그레이션 파일 작성** → `packages/{패키지}/migrate/` 디렉토리에 `.sql` 파일 생성
2. **`pnpm db:migrate`** → SQL 마이그레이션 + `db:pull` + `db:gen` 일괄 실행 (`packages/database` 의 `db:migrate` 스크립트가 셋을 묶음)

```bash
# 올바른 순서
pnpm db:migrate
```

> 마이그레이션만 적용하고 Prisma 재생성은 스킵하려면
> `pnpm --filter @repo/database exec tsx scripts/migrate.ts` 를 사용한다.

## 개요

이 프로젝트는 패키지별로 독립적인 **SQL 마이그레이션 시스템**을 사용합니다. Prisma는 타입 안전성과 쿼리 빌더로만 사용되며, 스키마 마이그레이션은 순수 SQL로 관리됩니다. 각 패키지는 자체 `migrate/` 디렉토리에 마이그레이션 파일을 관리하며, 중앙화된 마이그레이션 스크립트가 모든 패키지의 마이그레이션을 실행합니다.

## 디렉토리 구조

```
packages/
├── core/
│   └── migrate/
│       ├── 000_init.sql                        # 스키마 + 베이스 테이블 부트스트랩 (idempotent)
│       ├── 009_add_browser_title_to_modules.sql
│       └── ...
└── module-board/
    └── migrate/
        ├── 001_init.sql                        # 모듈 베이스 테이블 (modules.documents/comments)
        ├── 003_add_thumbnail_to_documents.sql
        └── ...
```

## 마이그레이션 파일 명명 규칙

- **형식**: `{순번}_{설명}.sql`
- **순번**: 3자리 숫자 (000, 001, 002, ...)
- **각 패키지의 첫 번째 파일은 `000_init.sql` (또는 의존 순서가 필요하면 `001_init.sql`)** — 스키마/베이스 테이블을 idempotent하게 생성하는 부트스트랩
- 예시:
  - `000_init.sql` — 패키지의 스키마 + 모든 베이스 테이블 일괄 생성
  - `009_add_browser_title_to_modules.sql` — 기존 테이블에 컬럼 추가
  - `010_board_templates.sql` — 새 테이블 추가

> **basename 동률 주의**: 마이그레이션 실행 순서는 basename 알파벳 순. 두 패키지에서 같은 basename 을 쓰면 path 알파벳 순으로 동률 해결 (`core/000_init.sql` < `module-board/000_init.sql`). 단, 의존 관계가 있으면 모호하지 않게 다른 순번을 쓸 것 (예: module-board는 `001_init.sql`).

## 마이그레이션 실행

### 모든 마이그레이션 실행

```bash
pnpm db:migrate
```

### 마이그레이션 상태 확인

마이그레이션 히스토리는 `migrate.history` 테이블에 저장됩니다:

```sql
SELECT * FROM migrate.history ORDER BY run_at DESC;
```

## 마이그레이션 히스토리 테이블

```sql
CREATE TABLE migrate.history (
  id TEXT PRIMARY KEY,           -- 형식: {package}-{filename}
  package TEXT NOT NULL,         -- 패키지 이름 (예: core, module-board)
  name TEXT NOT NULL,            -- 파일명 (예: 001_admin_permissions.sql)
  run_at TIMESTAMP DEFAULT NOW() -- 실행 시간
);
```

### ID 형식 예시

- `core-000_init.sql`
- `module-board-001_init.sql`

## 새 마이그레이션 파일 생성

### 1. 수동으로 생성

1. 해당 패키지의 `migrate/` 디렉토리에 새 SQL 파일 생성
2. 순번을 기존 파일보다 높게 설정
3. SQL DDL 작성
4. `pnpm db:migrate` 실행 (`db:pull` + `db:gen` 자동 포함)

#### 예시 1: 새 테이블 생성

```sql
-- packages/core/migrate/009_new_table.sql
CREATE TABLE core.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 예시 2: 기존 테이블에 컬럼 추가

```sql
-- packages/core/migrate/010_add_column_to_modules.sql
-- Add browser_title column to core.modules table

ALTER TABLE core.modules
  ADD COLUMN browser_title VARCHAR(250);
```

#### 예시 3: 인덱스 추가

```sql
-- packages/core/migrate/011_add_index_to_modules.sql
-- Add index on browser_title for faster searches

CREATE INDEX modules_browser_title_idx
  ON core.modules USING btree (browser_title);
```

#### 실행 순서 (다시 한번 강조)

```bash
# SQL 파일 생성 후
pnpm db:migrate     # SQL 마이그레이션 + db:pull + db:gen 일괄
```

### 2. 기존 DB 스키마로부터 새 부트스트랩 만들기

새 모듈을 추가하면서 베이스 테이블을 idempotent하게 정의하려면 `pg_dump --schema-only --no-owner --no-acl --table=schema.table` 출력을 참고로 `CREATE TABLE IF NOT EXISTS ...` 형태로 재작성한다. FK는 `DO $$ ... pg_constraint 체크 ... END $$` 패턴으로 감싸 멱등 보장. `packages/core/migrate/000_init.sql` 이 참고 모델.

## 마이그레이션 작성 가이드라인

### 1. 트랜잭션 안전성

각 마이그레이션 파일은 자동으로 트랜잭션 내에서 실행됩니다:

- 성공 시: 자동 커밋
- 실패 시: 자동 롤백

### 2. 멱등성 (Idempotency)

가능한 경우 멱등성을 유지하세요:

```sql
-- 좋은 예
CREATE TABLE IF NOT EXISTS core.my_table (...);

-- 나쁜 예
CREATE TABLE core.my_table (...);
```

### 3. 스키마 명시

항상 스키마를 명시적으로 지정하세요:

```sql
-- 좋은 예
CREATE TABLE core.admin_permissions (...);
CREATE INDEX ON core.admin_permissions (name);

-- 나쁜 예
CREATE TABLE admin_permissions (...);
```

### 4. 외래 키 제약조건

다른 스키마의 테이블을 참조할 때는 전체 경로를 사용하세요:

```sql
ALTER TABLE ONLY core.admin_user_roles
  ADD CONSTRAINT admin_user_roles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
```

### 5. 인덱스 명명

인덱스 이름은 명확하고 설명적이어야 합니다:

```sql
CREATE INDEX configs_scope_idx ON core.configs USING btree (scope);
CREATE INDEX documents_author_id_idx ON modules.documents USING btree (author_id);
```

## 마이그레이션 실행 순서

마이그레이션은 **파일 basename 기준 알파벳 순서**로 실행됩니다 (basename 동률시 full path tiebreaker).

```
000_create_storage_buckets.sql   (module-file)  # Supabase storage.buckets INSERT
000_init.sql                     (core)         # core/modules 스키마 + core.* 베이스 테이블
001_files.sql                    (module-file)  # modules.files (core.modules FK 필요)
001_init.sql                     (module-board) # modules.documents/comments
003_add_thumbnail_to_documents.sql (module-board)
...
```

> **주의**: 패키지 간 cross-FK 의존성이 있으면 의존 받는 쪽이 더 이른 순번을 쓰도록 명시적 번호 지정. 같은 basename 사용 가급적 회피.

## 롤백

현재 자동 롤백 기능은 없습니다. 롤백이 필요한 경우:

1. 새로운 마이그레이션 파일을 생성하여 변경사항을 되돌림
2. 또는 수동으로 SQL을 실행하여 롤백

```sql
-- 예: 테이블 삭제 롤백
-- 새 파일: 999_rollback_my_table.sql
DROP TABLE IF EXISTS core.my_table;
```

## 베스트 프랙티스

### ✅ 권장사항

- 각 마이그레이션 파일은 하나의 논리적 변경사항만 포함
- 테이블 생성, 인덱스, 제약조건을 모두 포함
- 주석을 사용하여 마이그레이션 목적 설명
- 프로덕션 배포 전 개발 환경에서 테스트

### ❌ 피해야 할 사항

- 이미 실행된 마이그레이션 파일 수정
- 순번 건너뛰기 (001, 002, 005 ❌)
- 데이터 마이그레이션과 스키마 변경을 같은 파일에 포함
- 스키마 이름 생략

## 문제 해결

### 마이그레이션 실패 시

1. 에러 메시지 확인
2. 실패한 마이그레이션 파일 수정
3. `migrate.history` 테이블에서 실패한 레코드 삭제 (필요시)
4. 다시 실행

```sql
-- 실패한 마이그레이션 레코드 삭제
DELETE FROM migrate.history WHERE id = 'core-001_admin_permissions.sql';
```

### 마이그레이션 히스토리 초기화

```sql
-- 주의: 개발 환경에서만 사용
DROP SCHEMA migrate CASCADE;
```

## Supabase Auth JWT Hook (수동 1회)

`packages/core/migrate/100_access_token_hook.sql` 은 JWT claims 에
`roles`/`display_name`/`profile_image` 를 주입하는 `custom_access_token_hook`
함수를 멱등으로 생성한다. 그러나 **함수 생성만으로는 동작하지 않는다** —
Supabase Cloud 의 프로젝트 설정에서 hook 을 등록해야 한다.

신규 외주 프로젝트 셋업 시 1회만:

1. Supabase Dashboard → **Authentication → Hooks**
2. **Customize Access Token (JWT) Claims** 행
3. Hook type: **Postgres**, schema `public`, function `custom_access_token_hook`
4. Enable hook → Save
5. 기존 세션은 구 JWT 사용 중이므로 **로그아웃 → 재로그인**

이 단계 없이는 `/admin` 권한 체크가 통과되지 않는다 (AuthServerContext 가
JWT claims 의 `roles` 를 읽기 때문). 자세히 [CLAUDE.md](../../CLAUDE.md) §외주 시작 절차.

## 관련 파일

- **마이그레이션 스크립트**: `packages/database/scripts/migrate.ts`
- **부트스트랩 모델**: `packages/core/migrate/000_init.sql` (멱등 패턴 참고)
- **JWT hook**: `packages/core/migrate/100_access_token_hook.sql`
- **Prisma 스키마**: `packages/database/prisma/schema.prisma`
