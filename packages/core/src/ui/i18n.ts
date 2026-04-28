import ko from "./locales/ko.json";
import en from "./locales/en.json";

/**
 * 단순 i18n 래퍼 (의존성 0).
 *
 * - 모듈은 `registerDict()` 로 자체 사전을 등록한다.
 * - `t(key, vars?)` 로 현재 언어의 번역을 가져온다. 누락 시 key 자체를 반환.
 * - 클라이언트는 `setLang(lang)` 로 전역 변경. 서버 라우트가 사용자 언어를 바꾸려면
 *   `t(key, vars, lang)` 의 명시적 lang 인자로 전달하라 (전역 변수는 요청 간 공유되어 위험).
 */

type Dict = Record<string, string>;
type DictMap = Record<Lang, Dict>;

export type Lang = "ko" | "en";

const dicts: DictMap = {
  ko: { ...ko },
  en: { ...en },
};

let current: Lang = "ko";

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  current = lang;
}

export function registerDict(lang: Lang, dict: Dict): void {
  dicts[lang] = { ...dicts[lang], ...dict };
}

export function t(
  key: string,
  vars?: Record<string, string | number>,
  lang: Lang = current,
): string {
  const raw = dicts[lang]?.[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) =>
    String(vars[k] ?? `{${k}}`),
  );
}
