import { LatestPostsWidget, type BoardWidgetItem } from "@repo/module-board";

/**
 * 홈페이지 최신 소식 섹션. mids 는 home loader 와 공유 (`NEWS_SECTION_MIDS`)
 * 해서 SSR 시점에 데이터까지 함께 가져오도록 함.
 */
export const NEWS_SECTION_MIDS = [
  "Notice",
  "AlumniNews",
  "Chemengnews",
  "Newsletter",
];

interface NewsSectionProps {
  className?: string;
  /** home loader 가 SSR 시점에 미리 해석해 전달. */
  initialItems?: BoardWidgetItem[];
}

export function NewsSection({ className, initialItems }: NewsSectionProps) {
  return (
    <LatestPostsWidget
      mids={NEWS_SECTION_MIDS}
      title="최신 소식"
      description="동창회의 새로운 소식을 전해드립니다."
      className={className}
      initialItems={initialItems}
    />
  );
}
