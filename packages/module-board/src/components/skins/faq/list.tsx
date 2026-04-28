import { useState, useRef, useEffect } from "react";
import { Link, Form } from "react-router";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@repo/ui";
import { BoardLayout } from "../default/layout";
import { LucideChevronDown, LucideChevronUp } from "lucide-react";
import type { BoardSkinListProps } from "../../../public/list";
import type { Category } from "../types";

export function FaqList({ loaderData }: BoardSkinListProps) {
  const { module, documents: posts, pagination, categories, currentCategoryId, permissions } = loaderData;
  const config = module.extra_vars;
  const [openId, setOpenId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeElement) {
        const container = scrollContainerRef.current;
        const activeRect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollLeft = container.scrollLeft + (activeRect.left - containerRect.left) - (container.clientWidth / 2) + (activeElement.clientWidth / 2);

        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [pagination.page]);

  const limit = isMobile ? (config.page_count_mobile || 5) : (config.page_count_pc || 9);
  const half = Math.floor(limit / 2);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <BoardLayout module={module}>
      <div className="mb-6 space-y-2">
        {module.extra_vars?.description && (
          <p className="text-[12px] text-[#666]">{module.extra_vars.description}</p>
        )}
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-between items-end mb-2 gap-y-2">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-[11px] font-normal text-[#888]">
            글 수 <span className="text-[#f60] font-bold">{pagination.total}</span>
          </div>
          {/* Category Type Filter */}
          {categories && categories.length > 0 && (
            <div className="flex-1 md:flex-none">
              <Select
                value={currentCategoryId || "all"}
                onValueChange={(val) => {
                  const search = new URLSearchParams(window.location.search);
                  if (val && val !== "all") search.set("category_id", val);
                  else search.delete("category_id");
                  search.set("page", "1");
                  window.location.search = search.toString();
                }}
              >
                <SelectTrigger className="w-full md:w-auto h-8 text-[12px]">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 ({pagination.total})</SelectItem>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.depth > 0 && "\u00A0".repeat(cat.depth * 2) + "└ "}
                      {cat.name} ({cat.document_count || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="ml-auto md:ml-0">
            {permissions.write && (
              <Button asChild variant="outline" size="sm" className="h-8 text-[11px] font-bold">
                <Link to="write">쓰기</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-px border-t border-gray-200">
        {posts.length === 0 ? (
          <div className="py-20 text-center text-gray-400 bg-gray-50 border-b border-gray-200">
            게시물이 없습니다.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full border-b border-gray-200">
            {posts.map((post) => (
              <AccordionItem key={post.id} value={post.id} className="border-b last:border-b-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors text-left hover:no-underline">
                  <span className="font-medium text-gray-900">Q. {post.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6 bg-gray-50 prose max-w-none text-sm text-gray-600">
                  <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
      {/* Footer Actions & Pagination */}
      <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-between items-center mt-6 gap-y-4">
        <div className="hidden md:block"></div>

        {/* Pagination in the center */}
        {pagination.totalPages > 0 && (
          <div className="w-full md:w-auto flex justify-center items-center gap-1 text-[11px] order-1 md:order-0">
            {/* First Page */}
            <Link
              to={`?page=1`}
              className="hidden md:inline-block px-2 py-[2px] border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white"
            >
              &lt;&lt;
            </Link>

            {/* Prev Page */}
            <Link
              to={`?page=${Math.max(1, pagination.page - 1)}`}
              className="px-2 py-[2px] border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white mr-2"
            >
              &lt;
            </Link>

            <div
              ref={scrollContainerRef}
              className="flex items-center gap-1 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {Array.from(
                { length: Math.min(limit, pagination.totalPages) },
                (_, i) => {
                  let start = Math.max(1, pagination.page - half);
                  if (start + (limit - 1) > pagination.totalPages) {
                    start = Math.max(1, pagination.totalPages - (limit - 1));
                  }
                  const pageNum = Math.max(1, start) + i;
                  if (pageNum > pagination.totalPages) return null;

                  const isActive = pageNum === pagination.page;

                  return (
                    <Link
                      key={pageNum}
                      to={`?page=${pageNum}`}
                      data-active={isActive}
                      className={`px-2 py-px min-w-[20px] text-center no-underline whitespace-nowrap shrink-0 ${isActive
                          ? "text-black font-bold border border-[#444]"
                          : "text-[#666] hover:underline"
                        }`}
                    >
                      {pageNum}
                    </Link>
                  );
                },
              )}
            </div>

            {/* Next Page */}
            <Link
              to={`?page=${Math.min(pagination.totalPages, pagination.page + 1)}`}
              className="px-2 py-[2px] border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white ml-2"
            >
              &gt;
            </Link>

            {/* Last Page */}
            <Link
              to={`?page=${pagination.totalPages}`}
              className="hidden md:inline-block px-2 py-[2px] border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white"
            >
              &gt;&gt;
            </Link>
          </div>
        )}

        {permissions.write && (
          <Button asChild variant="outline" size="sm" className="h-8 text-[11px] font-bold">
            <Link to="write">쓰기</Link>
          </Button>
        )}
      </div>

      {/* Search Form */}
      <div className="mt-6 flex justify-center">
        <Form className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto px-4 md:px-0">
          <Select name="search_target" defaultValue="title_content">
            <SelectTrigger size="lg" className="w-full md:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title_content">제목+내용</SelectItem>
              <SelectItem value="title">제목</SelectItem>
              <SelectItem value="content">내용</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            name="search_keyword"
            className="w-full md:w-56 h-10 px-4"
            placeholder="검색어를 입력하세요"
          />
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto px-8 bg-[#333] hover:bg-black transition-colors"
          >
            검색
          </Button>
        </Form>
      </div>
    </BoardLayout>
  );
}
