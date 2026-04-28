# 프로젝트 지침서

이 프로젝트의 지침은 `docs/guidelines/` 디렉토리에서 주제별로 관리됩니다.

> **AI 에이전트는 [CLAUDE.md](./CLAUDE.md) 를 먼저 읽으세요.** 30초 오리엔테이션 + 작업별 진입점 표.

## ⚠️ 중요 공지

### 언어

모든 과정과 답변, 문서는 한글로 제공한다

### 데이터베이스 스키마 변경 시 주의사항

**Prisma 스키마(`schema.prisma`)를 직접 수정하지 마세요!** 이 프로젝트는 SQL 기반 마이그레이션을 사용합니다.

올바른 프로세스:

1. SQL 마이그레이션 파일 작성 (`packages/{패키지}/migrate/*.sql`)
2. `npm run db:migrate` → `npm run db:pull` → `npm run db:gen` 순차 실행

자세한 내용은 [데이터베이스 마이그레이션 가이드](./docs/guidelines/database-migration.md)를 참조하세요.

### 💻 터미널 명령 도구 사용 주의사항 (Windows 환경)

- **PowerShell 호환성**: 이 프로젝트는 Windows(PowerShell) 환경에서 작업되므로, **명령줄 통합(`&&`)을 절대 사용하지 마십시오.** 
- **여러 명령 실행 시**: 명령을 하나씩 순차적으로 실행하거나, PowerShell의 문 구분 기호인 `;`를 사용하십시오. (예: `cmd1; cmd2`)
- **경로 지정**: Windows 경로 구분자인 `\`를 고려하며, 가급적 도구(git, npm 등)에서 제공하는 표준 형식을 따릅니다.


## 주제별 가이드라인

- [기술 스택 (Technology Stack)](./docs/guidelines/tech-stack.md)
- [React 가이드 (React Guide)](./docs/guidelines/react.md)
- [디자인 시스템 (Design System)](./docs/guidelines/design-system.md)
- [프로젝트 구조 (Project Structure)](./docs/guidelines/project-structure.md)
- [코딩 컨벤션 (Coding Conventions)](./docs/guidelines/coding-convention.md)
- [Git 워크플로우 (Git Workflow)](./docs/guidelines/git-workflow.md)
- [표준 폼 핸들링 (Standard Form Handling)](./docs/guidelines/form-handling.md)
- [데이터베이스 마이그레이션 (Database Migration)](./docs/guidelines/database-migration.md) ⚠️ **필독**
- [모노레포 및 의존성 관리 가이드 (Monorepo & Dependency Management)](./docs/guidelines/monorepo.md)
- [모듈 개발 (Module Development)](./docs/guidelines/module-development.md)
- [에러 핸들링 (Error Handling)](./docs/guidelines/error-handling.md)
- [상태 관리 (State Management)](./docs/guidelines/state-management.md)
- [국제화 (i18n)](./docs/guidelines/i18n.md)
- [테스팅 (Testing)](./docs/guidelines/testing.md)
- [AI 협업 (AI Collaboration)](./docs/guidelines/ai-collaboration.md)

## 패키지 인덱스

새 작업 시작 전 [packages/INDEX.md](./packages/INDEX.md) 로 패키지 매트릭스 확인.

## 📦 의존성 관리 규칙

**프로덕션 빌드에 포함되어야 하는 패키지는 절대 `devDependencies`에 넣지 마세요!**

Vercel 등 외부 배포 환경에서 `pnpm install --prod` 시 `devDependencies`는 건너뛸 수 있습니다. 빌드 시 필요한 도구나 런타임 라이브러리는 반드시 `dependencies`에 명시되어야 합니다.

- **대상 예시**: `typescript`, `turbo`, `vite`, Tailwind 관련 플러그인 등 빌드 과정에서 실행되는 모든 도구
- **방침**: `pnpm-workspace.yaml`의 `catalog:`를 사용하되, 설치 위치가 `dependencies`인지를 항상 확인하십시오.
