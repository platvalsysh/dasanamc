import unusedImports from "eslint-plugin-unused-imports";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/.react-router/**",
      "**/module-example/**",
      "**/layout-example/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImports,
      "react-hooks": reactHooks,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": "off",
      // ...reactHooks.configs.recommended.rules,
      // "react-hooks/rules-of-hooks": "warn",
    },
  },

  {
    files: ["packages/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/"],
              message: "상대경로(import ../)를 사용하세요.",
            },
          ],
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },

  // 모듈 패키지는 다른 모듈을 직접 import 하지 않는다.
  // 공통 코드는 @repo/core, @repo/auth, @repo/database 또는 새로운 @repo/shared-* 로 승격.
  // 기존 위반은 점진적으로 정리 예정 — 그 동안은 해당 모듈만 패턴에서 카브아웃.
  // 신규 모듈은 절대 다른 모듈을 import 하지 못함. 자세한 위반 목록은 docs/guidelines/monorepo.md.
  {
    files: ["packages/module-*/**/*.{ts,tsx}"],
    ignores: [
      "packages/module-board/**",
      "packages/module-bxmember/**",
      "packages/module-editor/**",
      "packages/module-newsletter/**",
      "packages/module-organization/**",
      "packages/module-sponsors/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@repo/module-*"],
              message:
                "모듈 간 직접 import 금지. 공통은 @repo/core 또는 @repo/shared-* 로 승격하세요.",
            },
          ],
        },
      ],
    },
  },
];
