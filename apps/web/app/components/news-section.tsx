import { LatestPostsWidget } from "@repo/module-board";


interface NewsSectionProps {
  className?: string;
  items?: any[]; // Legacy prop support, but ignored for widget
}

export function NewsSection({ className }: NewsSectionProps) {
  return (
    <LatestPostsWidget
      mids={["Notice", "AlumniNews", "Chemengnews", "Newsletter"]}
      title="최신 소식"
      description="동창회의 새로운 소식을 전해드립니다."
      className={className}
    />
  );
}
