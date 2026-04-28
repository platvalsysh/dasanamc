import { useRef, useState, useEffect } from "react";
import { Link, Form } from "react-router";
import { 
  Button, 
  Input, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Checkbox
} from "@repo/ui";

import { format, isToday } from "date-fns";
import { Lock, Image as ImageIcon, Video as VideoIcon, Paperclip } from "lucide-react";
import type { BoardSkinListProps } from "../../../public/list";
import type { Category } from "../types";
import { BoardLayout } from "./layout";

export function DefaultList({ loaderData, actionData }: BoardSkinListProps) {
  const { module, documents, pagination, categories, currentCategoryId, permissions } = loaderData;
  const config = module.extra_vars;
  const { list_display } = config;

  const showId = list_display.includes("id");
  const showTitle = list_display.includes("title");
  const showUser = list_display.includes("user");
  const showDate = list_display.includes("created_at");
  const showView = list_display.includes("view_count");
  const showLike = list_display.includes("like_count");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
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

  const getCategoryName = (id: string | null) => {
    if (!id || !categories) return null;
    const cat = categories.find((c: Category) => c.id === id);
    return cat ? cat.name : null;
  };

  return (
    <BoardLayout module={module}>

      {/* Info Section */}
      <div className="mb-6 space-y-2">

        {module.extra_vars?.description && (
          <p className="text-[14px] text-[#666]">{module.extra_vars.description}</p>
        )}


      </div>



      <div className="flex flex-wrap md:flex-nowrap justify-between items-end mb-2 gap-y-2">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-[14px] font-normal text-[#666]">
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
                <SelectTrigger className="w-full md:w-auto h-9">
                  <SelectValue placeholder="카테고리 선택" />
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
        </div>
        <div className="ml-auto md:ml-0">
          {permissions.write && (
            <Button asChild variant="default" className="bg-[#333] hover:bg-black font-bold h-9">
              <Link to="write">쓰기</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-[#e0e0e0]">
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-[14px] text-left border-collapse table-fixed">
            <thead className="hidden md:table-header-group bg-[#f7f7f7] border-t border-[#333]">
              <tr>
                {showId && <th className="px-2 py-3.5 w-[50px] md:w-16 text-center text-[#222] font-medium text-[15px] border-b border-[#ddd] whitespace-nowrap overflow-hidden text-ellipsis">번호</th>}
                {showTitle && <th className="px-3 py-3.5 text-center text-[#222] font-medium text-[15px] border-b border-[#ddd] whitespace-nowrap overflow-hidden text-ellipsis">제목</th>}
                {showUser && <th className="px-3 py-3.5 w-24 md:w-32 text-center text-[#222] font-medium text-[15px] border-b border-[#ddd] whitespace-nowrap overflow-hidden text-ellipsis">글쓴이</th>}
                {showDate && <th className="px-3 py-3.5 w-20 md:w-24 text-center text-[#444] font-medium text-[15px] border-b border-[#ddd] whitespace-nowrap overflow-hidden text-ellipsis">날짜</th>}
                {showView && <th className="px-2 py-3.5 w-16 md:w-20 text-center text-[#444] font-medium text-[15px] border-b border-[#ddd] whitespace-nowrap overflow-hidden text-ellipsis">조회</th>}
                {showLike && <th className="px-2 py-3.5 w-16 md:w-20 text-center text-[#444] font-medium text-[15px] border-b border-[#ddd] whitespace-nowrap overflow-hidden text-ellipsis">추천</th>}
                {permissions.manage && (
                  <th className="px-2 py-3.5 w-10 text-center border-b border-[#ddd]">
                    <Checkbox className="mx-auto" />
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={list_display.length + (permissions.manage ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-400 border-b border-[#e5e5e5]"
                  >
                    게시물이 없습니다.
                  </td>
                </tr>
              ) : (
                documents.map((post, index) => {
                  const categoryName = getCategoryName(post.category_id);
                  return (
                    <tr
                      key={post.id}
                      className={`transition-colors block md:table-row border-b border-[#ddd] p-4 md:p-0 ${post.is_notice ? "bg-[#f9f9f9]" : "hover:bg-[#fcfcfc]"}`}
                    >
                      {showId && (
                        <td className="hidden md:table-cell px-3 py-4 text-center text-[#555] text-[15px] border-b border-[#e0e0e0]">
                          {post.is_notice ? (
                            <span className="inline-block px-2 py-0.5 text-[12px] bg-[#333] text-white font-medium">
                              공지
                            </span>
                          ) : (
                            pagination.total -
                            (pagination.page - 1) * pagination.limit -
                            index
                          )}
                        </td>
                      )}
                      {showTitle && (
                        <td className="block md:table-cell px-0 md:px-3 py-1 md:py-4 border-none md:border-b border-[#ddd]">
                          {categoryName && (
                            <div className="md:hidden text-[13px] text-blue-600 mb-0.5 ml-0.5">
                              {categoryName}
                            </div>
                          )}
                          <Link
                            to={`${post.id}`}
                            className="text-[#111] font-medium text-[16px] hover:underline hover:text-blue-700 flex truncate items-center gap-1.5"
                          >
                            {categoryName && (
                              <span className="hidden md:inline text-[13px] text-blue-600 mr-0.5">
                                [{categoryName}]
                              </span>
                            )}
                            {post.is_secret && <Lock size={14} className="text-gray-400" />}

                            {post.title}
                            {(post.comment_count || 0) > 0 && <span className="text-[#f60] text-[14px] font-bold">[{post.comment_count}]</span>}

                            {post.extra_vars?.has_image && <ImageIcon size={14} className="text-blue-500" />}
                            {post.extra_vars?.has_video && <VideoIcon size={14} className="text-purple-500" />}
                            {post.extra_vars?.has_file && <Paperclip size={14} className="text-gray-500" />}

                          </Link>
                          {/* Mobile Meta Info */}
                          <div className="md:hidden mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[#888]">
                            {showUser && (
                              <>
                                <span>{post.users?.profiles?.display_name || "Unknown"}</span>
                                <span className="text-[#eee] mx-0.5">|</span>
                              </>
                            )}
                            {showDate && (
                              <>
                                <span>
                                  {(() => {
                                      if (!post.created_at) return "-";
                                      const date = new Date(post.created_at);
                                      return isToday(date) ? format(date, "HH:mm") : format(date, "yy.MM.dd");
                                  })()}
                                </span>
                                <span className="text-[#eee] mx-0.5">|</span>
                              </>
                            )}
                            {showView && <span>조회 {post.view_count}</span>}
                            {showLike && (
                              <>
                                <span className="text-[#eee] mx-0.5">|</span>
                                <span>추천 {post.like_count}</span>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                      {showUser && (
                        <td className="hidden md:table-cell px-3 py-4 text-center text-[#333] text-[15px] truncate border-b border-[#e0e0e0]">
                          {post.users?.profiles?.display_name || "Unknown"}
                        </td>
                      )}
                      {showDate && (
                        <td className="hidden md:table-cell px-3 py-4 text-center text-[#666] text-[14px] border-b border-[#e0e0e0] overflow-hidden text-ellipsis whitespace-nowrap">
                          {(() => {
                            if (!post.created_at) return "-";
                            const date = new Date(post.created_at);
                            return isToday(date)
                              ? format(date, "HH:mm")
                              : format(date, "yy.MM.dd");
                          })()}
                        </td>
                      )}
                      {showView && (
                        <td className="hidden md:table-cell px-3 py-4 text-center text-[#666] text-[14px] border-b border-[#e0e0e0]">
                          {post.view_count}
                        </td>
                      )}
                      {showLike && (
                        <td className="hidden md:table-cell px-3 py-4 text-center text-[#666] text-[14px] border-b border-[#e0e0e0]">
                          {post.like_count}
                        </td>
                      )}
                      {permissions.manage && (
                        <td className="hidden md:table-cell px-3 py-4 text-center border-b border-[#e0e0e0]">
                          <Checkbox className="mx-auto" />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions & Pagination */}
      <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-between items-center mt-8 gap-y-4">
        <div className="hidden md:block"></div>

        {/* Pagination in the center */}
        {pagination.totalPages > 0 && (
          <div className="w-full md:w-auto flex justify-center items-center gap-1 text-[13px] order-1 md:order-0">
            {/* First Page */}
            <Link
              to={`?page=1`}
              className="hidden md:inline-block px-2.5 py-1 border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white"
            >
              &lt;&lt;
            </Link>

            {/* Prev Page */}
            <Link
              to={`?page=${Math.max(1, pagination.page - 1)}`}
              className="px-2.5 py-1 border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white mr-2"
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
                      className={`px-0 py-1 min-w-[32px] h-[32px] flex items-center justify-center text-[15px] no-underline whitespace-nowrap shrink-0 transition-all ${isActive
                        ? "text-black font-extrabold border border-[#333] shadow-none bg-white"
                        : "text-[#666] hover:text-[#333] hover:bg-gray-100"
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
              className="px-2.5 py-1 border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white ml-2"
            >
              &gt;
            </Link>

            {/* Last Page */}
            <Link
              to={`?page=${pagination.totalPages}`}
              className="hidden md:inline-block px-2.5 py-1 border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white"
            >
              &gt;&gt;
            </Link>
          </div>
        )}

        {permissions.write && (
          <Button asChild variant="outline" size="sm" className="font-bold">
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
