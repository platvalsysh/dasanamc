import { PageHeader } from "@repo/ui";
import { BoardBreadcrumbs } from "../../BoardBreadcrumbs";
import type { BoardModule } from "../../../BoardService";

interface BoardLayoutProps {
  module: BoardModule;
  children: React.ReactNode;
}

export function BoardLayout({ module, children }: BoardLayoutProps) {
  return (
    <div className="w-full font-sans">
      <PageHeader
        title={module.browser_title}
      >
        <div className="flex justify-center mt-2">
          <BoardBreadcrumbs />
        </div>
      </PageHeader>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </div>
    </div>
  );
}
