# AI 협업 가이드

AI 에이전트에게 일을 시키는 **사람** 쪽의 가이드. 에이전트 진입점과 운영
규칙은 [CLAUDE.md](../../CLAUDE.md) 가 단일 소스.

## 인간이 AI에게 일을 시킬 때

### 좋은 프롬프트 패턴

| 패턴 | 예 |
|---|---|
| **파일 + 의도** | "packages/module-board/src/api/list.ts 에 페이징 파라미터(`page`, `pageSize`) 추가해줘" |
| **에러 + 컨텍스트** | "/admin/board 에서 500. 로그는 ... — 원인 찾고 수정" |
| **모델 + 표준** | "[form-handling.md](form-handling.md) 패턴대로 회원가입 폼 검증 통일" |

### 피해야 할 프롬프트

- "코드 좋게 만들어줘" — 평가 기준 없음
- "전체 리팩토링 해줘" — blast radius 폭발
- "이거 안 돼" — 무엇이 안 되는지 / 무엇이 기대인지 불명

## 권장 작업 모드

| 모드 | 언제 |
|---|---|
| **plan-then-do** | 라우트 추가, 새 모듈, 신규 폼, DB 스키마 변경 |
| **direct edit** | 타입 에러, 단일 함수 시그니처 변경, 텍스트 수정 |
| **research-only** | 아키텍처 조사, "왜 이렇게 짰지" 같은 의문 |

## 자주 일어나는 AI 사고 + 예방

| 사고 | 예방 |
|---|---|
| `schema.prisma` 직접 수정 | [CLAUDE.md](../../CLAUDE.md) 명시. SQL 마이그레이션 강제 |
| 새 의존성을 `devDependencies` 로 (Vercel 빌드 깨짐) | [monorepo.md](monorepo.md) 명시 |
| 모듈 간 직접 import | (계획) syncpack 룰로 차단 |
| 시크릿을 클라이언트 state 로 | [state-management.md](state-management.md) |
| 영문 placeholder 코드 그대로 | UI 텍스트는 한국어 (i18n 도입 후 `t()`) |
| `&&` 명령 체이닝 | Windows 환경. `;` 또는 별도 호출 |

## 신규 모듈 추가 시 AI에게 줄 한 줄 프롬프트

> "`pnpm new:module <name>` 실행 후 [docs/guidelines/module-development.md](module-development.md) 따라 라우트/권한/메뉴를 도메인 용어로 채우고, [apps/web/app/modules.server.ts](../../apps/web/app/modules.server.ts) 에 등록해. example 의 placeholder 텍스트는 모두 교체."

## "AI 친화 코드" 의 실용적 정의

이 저장소에서 _AI 친화_ 의 의미:

1. **각 패키지에 README** — 패키지 진입 시 grep 없이 책임범위/공개 API 파악
2. **각 공개 클래스/함수에 JSDoc** — IDE 호버에 표시. 핵심: `@example`
3. **명명 일관성** — 모듈은 `module-*`, 권한은 `{모듈}.{소문자}`, 파일명은 kebab-case
4. **표준 진입점** — `pnpm new:module`, `pnpm db:migrate` 같은 단일 커맨드
5. **금지 사항을 코드 주변에 명시** — 위에서 본 "절대 하지 말 것" 표

## 라이선스/저작권 의심 시

이 템플릿에서 파생된 외주 결과물의 라이선스/저작권은 회사 정책에 따른다. AI가 외부 코드를 그대로 가져온 경우 출처 표기/검토 필수.
