import { HOSPITAL } from "~/data/dasanone-content";

/**
 * 페이지 공통 meta 빌더 — title/description + Open Graph (카카오톡·네이버 공유 미리보기).
 * 홈은 JSON-LD 가 추가로 필요해 home.tsx 에서 직접 구성.
 */
export function ogMeta(title: string, description: string, path = "") {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    {
      property: "og:image",
      content: `${HOSPITAL.siteUrl}/images/hero-reception.jpg`,
    },
    { property: "og:url", content: `${HOSPITAL.siteUrl}${path}` },
  ];
}
