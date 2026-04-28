# 모노레포 관리 가이드 (Turborepo & Syncpack)

이 문서는 프로젝트에 적용된 Turborepo와 Syncpack의 설정 내용, 작업 결과 및 사용 방법을 설명합니다.

## 1. 개요

프로젝트의 규모가 커짐에 따라 효율적인 빌드 시스템과 일관된 의존성 관리가 필요해졌습니다. 이를 위해 다음 두 가지 도구를 도입하였습니다.

- **Turborepo**: 빌드 및 테스트 태스크 실행을 최적화하고 캐싱을 통해 중복 작업을 방지합니다.
- **Syncpack**: 여러 패키지 간의 의존성 버전을 정렬하고 일관성을 유지합니다.

---

## 2. Turborepo 설정 및 사용법

### 주요 설정 (`turbo.json`)
현재 프로젝트의 `turbo.json`은 다음과 같이 태스크 간의 의존성을 정의하고 있습니다.

- **build**: 하위 패키지의 `build`가 완료된 후 실행되며, `dist`, `.next`, `build` 등의 출력을 캐싱합니다.
- **typecheck**: TypeScript 타입 검사를 병렬로 실행합니다.
- **lint**: 코드 스타일 및 오류 검사를 실행합니다.
- **db:gen**: Prisma 클라이언트 생성을 관리합니다.

### 사용 방법
루트 경로에서 다음 명령어를 사용하여 전체 프로젝트 혹은 특정 패키지의 작업을 수행할 수 있습니다.

```bash
# 전체 프로젝트 빌드
pnpm build

# 개발 서버 실행
pnpm dev

# 전체 프로젝트 타입 체크
pnpm typecheck
```

*Vercel 배포 시에도 `pnpm build` 명령어가 실행되며, 자동으로 Turborepo가 빌드 프로세스를 최적화합니다.*

---

## 3. Syncpack 설정 및 의존성 관리

### 설정 내용 (`.syncpackrc`)
모든 패키지에서 공통된 의존성 버전을 사용하도록 강제하며, 특히 `pnpm-workspace.yaml`의 `catalog:` 기능을 보완하도록 설정되었습니다.

- **외부 의존성**: 공식적으로 `catalog:`에 정의된 버전을 따릅니다.
- **내부 의존성**: 모든 내부 패키지(@repo/**)는 `workspace:*` 형식을 사용합니다. (오타 주의: `workspace:^`은 사용하지 않습니다.)
- **PeerDependencies**: 라이브러리 중복 설치와 Hook 오류 방지를 위해 React, React Router 등은 PeerDependency로 관리됩니다.
- **빌드 및 운영 필수 패키지**: Vercel 등 배포 환경에서 빌드 시 필요한 패키지나 런타임에 필요한 패키지는 **절대 `devDependencies`에 넣지 말고 `dependencies`에 명시**해야 합니다. `pnpm-workspace.yaml`의 `catalog:` 기능을 활용하여 버전을 관리하되, 설치 위치가 `dependencies`인지를 반드시 확인하십시오. (예: `typescript`, `turbo`, `vite`, Tailwind 플러그인 등)

### 주요 명령어
의존성 불일치를 해결하거나 파일 포맷을 관리할 때 사용합니다.

```bash
# 의존성 불일치 자동 수정
pnpm syncpack:fix

# package.json 파일 정렬 및 포맷팅
pnpm syncpack:format

# 의존성 일관성 검사 (CI/CD 권장)
pnpm syncpack:check
```

---

## 4. 작업 리포트 및 주의사항

### 작업 결과
1. **의존성 규격화**: 모든 `package.json`의 버전 형식을 통일하여 중복 설치를 방지하고 번들 크기를 최적화했습니다.
2. **빌드 속도 개선**: Turborepo 도입으로 로컬 환경에서의 재빌드 속도가 비약적으로 향상되었습니다.
3. **Vercel 빌드 안정화**:
    - **환경 변수 안전장치**: 서버 코드(`SupabaseStorage.ts` 등) 최상단에서 환경 변수 누락 시 `throw` 하던 로직을 제거하고, 빌드 타임에는 경고만 출력하도록 개선했습니다.
    - **카탈로그 매핑**: `pnpm`의 `catalog:` 프로토콜이 Vercel 환경에서 발생시킬 수 있는 이슈를 해결하기 위해 `pnpm install`을 통한 락파일 최적화를 완료했습니다.

### 주의사항
- **의존성 설치 위치 (중요)**: 프로덕션 빌드 과정에 포함되는 모든 패키지는 **반드시 `dependencies`에 포함**되어야 합니다. `devDependencies`에 있는 경우 Vercel 빌드 서버에서 설치되지 않아 빌드 오류가 발생할 수 있습니다.
- 신규 의존성을 추가할 때는 가급적 `pnpm-workspace.yaml`의 `catalog` 섹션에 먼저 등록한 후 사용하십시오.
- 패키지 간 의존성 관계가 복잡해질 경우 `pnpm syncpack:fix`를 실행하여 버전을 정렬하십시오.

---

궁금한 점이 있거나 추가 기능이 필요하시면 언제든 말씀해 주세요!
