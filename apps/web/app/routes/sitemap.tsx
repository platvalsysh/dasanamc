import { HOSPITAL, CENTERS } from "~/data/dasanone-content";

/** 정적 페이지 + 센터 상세를 나열하는 sitemap.xml 리소스 라우트 */
export function loader() {
  const staticPaths = [
    "/",
    "/about",
    "/about/doctors",
    "/about/facilities",
    "/about/equipment",
    "/centers",
    "/centers/checkup",
    "/cases",
    "/emergency",
    "/support",
    "/support/notice",
    "/support/faq",
    "/support/contact",
  ];
  const centerPaths = CENTERS.map((c) => `/centers/${c.id}`);

  const urls = [...staticPaths, ...centerPaths]
    .map(
      (p) =>
        `  <url><loc>${HOSPITAL.siteUrl}${p}</loc><changefreq>weekly</changefreq></url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
