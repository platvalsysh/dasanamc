import { Link, Form, useFetcher, useLocation } from "react-router";
import { BoardLayout } from "./layout";
import { format } from "date-fns";
import { Heart, Siren, Paperclip, ChevronUp, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useUser } from "@repo/auth/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button, Textarea } from "@repo/ui";
import { BoardExtraVars } from "../../../BoardExtraVars";
import type { BoardSkinReadProps } from "../../../public/read";
import type { BoardModule } from "../../../BoardService";
import type { documents } from "@repo/database";

type FetcherResult = { success?: boolean; error?: string };

// ... (DeleteCommentButton, ReplyForm, CommentForm stay same)

function DeleteCommentButton({ commentId }: { commentId: string }) {
  const fetcher = useFetcher();
  const [isOpen, setIsOpen] = useState(false);

  // Close dialog when fetcher completes a deletion
  React.useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && (fetcher.data as FetcherResult).success) {
      setIsOpen(false);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 px-2.5 text-[13px]"
        disabled={fetcher.state !== "idle"}
      >
        {fetcher.state !== "idle" ? "삭제 중" : "삭제"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 댓글을 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              취소
            </Button>
            <fetcher.Form method="post" onSubmit={() => setIsOpen(false)}>
              <input type="hidden" name="intent" value="delete_comment" />
              <input type="hidden" name="comment_id" value={commentId} />
              <Button
                type="submit"
                variant="destructive"
              >
                삭제
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReplyForm({ commentId, onClose }: { commentId: string, onClose: () => void }) {
  const fetcher = useFetcher();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && (fetcher.data as FetcherResult).success) {
      if (textareaRef.current) textareaRef.current.value = "";
      onClose(); // Close the form on success
    }
  }, [fetcher.state, fetcher.data, onClose]);

  return (
    <div className="mt-2 ml-4 p-2 bg-gray-50 border border-gray-200">
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="create_comment" />
        <input type="hidden" name="parent_id" value={commentId} />
        <Textarea
          ref={textareaRef}
          name="content"
          className="w-full h-[60px] mb-2 border-[#ddd] focus:border-[#aaa]"
          placeholder="답글을 입력하세요"
          required
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-[13px]">
            취소
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={fetcher.state !== "idle"}
            className="bg-[#4a4a4a] hover:bg-[#333] text-[13px]"
          >
            {fetcher.state !== "idle" ? "등록 중..." : "등록"}
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}

function CommentForm({ board, comment_status }: { board: BoardModule, comment_status: string | null }) {
  const currentUser = useUser();
  const fetcher = useFetcher();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const config = BoardExtraVars.fromJson(board?.extra_vars || board);

  React.useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && (fetcher.data as FetcherResult).success) {
      if (textareaRef.current) textareaRef.current.value = "";
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="mb-6 bg-[#f9f9f9] p-4 border border-[#eee]">
      {!currentUser ? (
        <div className="relative">
          <Textarea
            disabled
            className="w-full h-20 bg-gray-100 text-sm resize-none rounded-none shadow-none"
            placeholder="댓글을 작성하려면 로그인이 필요합니다."
          />
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <Button asChild className="font-bold">
              <Link to={`/auth/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`}>
                로그인하기
              </Link>
            </Button>
          </div>
        </div>
      ) : (config.use_comment && comment_status !== "DENY" ? (
        <fetcher.Form method="post" className="flex gap-2">
          <input type="hidden" name="intent" value="create_comment" />
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              name="content"
              className="w-full h-24 text-[15px] focus:border-[#aaa] bg-white resize-none"
              placeholder="댓글을 남겨주세요."
              required
            />
          </div>
          <Button
            type="submit"
            disabled={fetcher.state !== "idle"}
            className="w-24 h-24 bg-[#333] hover:bg-black font-bold"
          >
            등록
          </Button>
        </fetcher.Form>
      ) : (
        <div className="text-center py-4 text-[#888] text-sm bg-gray-100">
          댓글 작성 권한이 없습니다.
        </div>
      ))}
    </div>
  );
}

export function DefaultRead({ loaderData, actionData }: BoardSkinReadProps) {
  const { module: board, document: post, comments, commentPagination, hasLiked, hasBlamed, likedCommentIds = [], files, permissions } = loaderData;
  const fetcher = useFetcher();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const currentUser = useUser();
  // const isAdmin = useCheckPermissions(['board.admin.manage']); // Removed client-side check favor of server-passed permissions
  const isAuthor = currentUser?.id === post.author_id;

  const displayDate = post.created_at ? format(new Date(post.created_at), "yyyy.MM.dd HH:mm") : "-";
  const authorName = (post.users?.display_name || "Unknown");

  const config = BoardExtraVars.fromJson(board?.extra_vars || {});
  const { read_display } = config;
  const showAuthor = read_display.includes("author");
  const showDate = read_display.includes("created_at");
  const showView = read_display.includes("view_count");
  const showLike = read_display.includes("like_count");
  const showBlame = read_display.includes("blame");
  const showFiles = read_display.includes("file_list");

  return (
    <BoardLayout module={board}>

      <div className="bg-white border border-[#ddd] p-6 shadow-none">
        <div className="border-b border-[#ddd] pb-4 mb-6">
          <h1 className="text-[22px] md:text-[24px] font-bold text-[#111] mb-3 font-nanum leading-tight tracking-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center text-[14px] text-[#555] gap-x-4 gap-y-2">
            {showAuthor && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#333]">{authorName}</span>
                </div>
                <span className="text-[#eee] h-3 w-[1px] bg-gray-300"></span>
              </>
            )}
            {showDate && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#666]">{displayDate}</span>
                </div>
                <span className="text-[#eee] h-3 w-[1px] bg-gray-300"></span>
              </>
            )}
            {showView && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#666]">조회 <span className="font-bold text-[#ff4e50] ml-0.5">{post.view_count}</span></span>
                </div>
                <span className="text-[#eee] h-3 w-[1px] bg-gray-300"></span>
              </>
            )}
            {showLike && (
              <>
                <div className="flex items-center gap-1.5">
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="vote" />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      disabled={fetcher.state !== "idle"}
                      className={`h-auto p-1.5 flex items-center gap-1.5 transition-colors ${hasLiked ? "fill-[#ff4e50] text-[#ff4e50]" : "text-[#888]"}`}
                      title="추천하기"
                    >
                      <Heart
                        size={16}
                        className={`transition-colors ${hasLiked ? "fill-[#ff4e50] text-[#ff4e50]" : "text-[#888]"}`}
                      />
                      <span className={`font-bold transition-colors ${hasLiked ? "text-[#ff4e50]" : "text-[#777]"}`}>
                        {post.like_count}
                      </span>
                    </Button>
                  </fetcher.Form>
                </div>
                <span className="text-[#eee] h-3 w-[1px] bg-gray-300"></span>
              </>
            )}
            {showBlame && (
              <div className="flex items-center gap-1.5">
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="blame" />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={fetcher.state !== "idle"}
                    className="h-auto p-1.5 flex items-center gap-1.5 transition-colors"
                    title="신고하기"
                  >
                    <Siren
                      size={16}
                      className={`${hasBlamed ? "fill-gray-500 text-gray-500" : "text-[#888]"}`}
                    />
                    <span className="text-[#777] text-[13px] font-normal">신고</span>
                  </Button>
                </fetcher.Form>
              </div>
            )}
          </div>
        </div>



        <div className="min-h-[300px] text-[16px] md:text-[17px] leading-[1.75] text-[#111] tracking-normal break-all">
          <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        </div>

        {/* File Attachments (Moved Bottom) */}
        {showFiles && files && files.length > 0 && (
          <div className="mt-8 bg-[#f9f9f9] border border-[#eee] px-5 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsFilesOpen(!isFilesOpen)}
              className="w-full text-[14px] font-bold text-[#333] mb-2 flex items-center justify-between gap-2 h-auto p-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Paperclip size={16} />
                첨부파일 <span className="text-[#f60] text-[15px]">{files.length}</span>
              </div>
              {isFilesOpen ? <ChevronUp size={16} className="text-[#666]" /> : <ChevronDown size={16} className="text-[#666]" />}
            </Button>

            {isFilesOpen && (
              <ul className="space-y-2 mt-3 border-t border-gray-200 pt-3">
                {files.map((file) => (
                  <li key={file.id} className="text-[14px] flex items-center gap-2.5">
                    <Paperclip size={14} className="text-[#888]" />
                    <Button
                      variant="link"
                      className="text-[#333] h-auto p-0 hover:underline flex items-center gap-1"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const res = await fetch(`/api/file/${file.id}/download`);
                          const result = await res.json();
                          const downloadUrl = result.data?.downloadUrl || result.downloadUrl;
                          if (downloadUrl) {
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.setAttribute('download', file.name);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                          } else {
                            console.error("다운로드 주소를 가져올 수 없습니다.");
                          }
                        } catch (err) {
                          console.error("다운로드 중 오류가 발생했습니다.", err);
                        }
                      }}
                    >
                      {file.name}
                      <span className="text-[#888] text-[11px]">({(file.size / 1024).toFixed(1)} KB)</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions & Navigation */}
      <div className="mt-10 border-t border-[#ddd] pt-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-none shadow-none font-medium">
              <Link to={`/board/${board.mid}`}>목록</Link>
            </Button>
          </div>

          <div className="flex gap-2">
            {(isAuthor || permissions.manage) && (
              <>
                <Button asChild variant="outline" className="rounded-none shadow-none font-medium">
                  <Link to="edit">수정</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="rounded-none shadow-none font-medium"
                >
                  삭제
                </Button>
              </>
            )}
            {permissions.write && (
              <Button asChild className="rounded-none shadow-none font-bold bg-[#f5f5f5] text-[#111] hover:bg-[#eaeaea] border border-[#ddd]">
                <Link to={`/board/${board.mid}/write`}>쓰기</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div id="comment-list" className="bg-[#fcfcfc] border border-[#ddd] p-5 mb-8">
          <div className="font-bold text-[#222] text-[15px] mb-3">
            댓글 <span className="text-[#f60] font-bold">{post.comment_count || 0}</span>
          </div>

          {/* Root Comment Form */}
          {permissions.comment && <CommentForm board={board} comment_status={post.comment_status} />}

          {/* Comment List */}
          {comments.length > 0 && <ul className="mb-6 space-y-4">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="border-b border-gray-100 last:border-0 py-3"
                style={{ paddingLeft: `${(comment.depth || 0) * 24}px` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-[#222] mb-1.5 flex items-center gap-2">
                      {comment.users?.display_name || "Anonymous"}
                      <span className="text-[13px] font-normal text-gray-400">
                        {comment.created_at ? format(new Date(comment.created_at), "yyyy.MM.dd HH:mm") : ""}
                      </span>
                    </div>
                    <div className="text-[15px] text-[#333] leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#888] text-[13px] mt-1 ml-4 min-w-fit">

                    {permissions.comment && <fetcher.Form method="post" className="inline-flex">
                      <input type="hidden" name="intent" value="comment_vote" />
                      <input type="hidden" name="comment_id" value={comment.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 flex items-center gap-1 hover:text-red-500 transition-colors"
                        title="추천"
                      >
                        <Heart
                          size={13}
                          className={likedCommentIds.includes(comment.id) ? "fill-red-500 text-red-500" : ""}
                        />
                        <span>{comment.like_count || 0}</span>
                      </Button>
                    </fetcher.Form>}

                    {permissions.comment && <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="h-auto p-0 text-[#888] hover:text-[#333] transition-colors"
                    >
                      답글
                    </Button>}
                    {(permissions.manage || (currentUser && currentUser.id === comment.author_id)) && (
                      <DeleteCommentButton commentId={comment.id} />
                    )}
                  </div>
                </div>

                {/* Reply Form */}
                {replyTo === comment.id && (
                  <ReplyForm
                    commentId={comment.id}
                    onClose={() => setReplyTo(null)}
                  />
                )}
              </li>
            ))}
          </ul>}

          {/* Comment Pagination */}
          {commentPagination && commentPagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 text-[11px] mt-4">
              <Link
                to={`?cpage=1#comment-list`}
                className="px-2 py-[2px] border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white"
              >
                &lt;&lt;
              </Link>
              <Link
                to={`?cpage=${Math.max(1, commentPagination.page - 1)}#comment-list`}
                className="px-2 py-[2px] border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white mr-2"
              >
                &lt;
              </Link>

              {Array.from(
                { length: Math.min(10, commentPagination.totalPages) },
                (_, i) => {
                  let start = Math.max(1, commentPagination.page - 4);
                  if (start + 9 > commentPagination.totalPages) {
                    start = Math.max(1, commentPagination.totalPages - 9);
                  }
                  const pageNum = Math.max(1, start) + i;
                  if (pageNum > commentPagination.totalPages) return null;

                  const isActive = pageNum === commentPagination.page;

                  return (
                    <Link
                      key={pageNum}
                      to={`?cpage=${pageNum}#comment-list`}
                      className={`px-2 py-px min-w-[20px] text-center no-underline ${isActive
                          ? "text-black font-bold border border-[#444]"
                          : "text-[#666] hover:underline"
                        }`}
                    >
                      {pageNum}
                    </Link>
                  );
                }
              )}

              <Link
                to={`?cpage=${Math.min(commentPagination.totalPages, commentPagination.page + 1)}#comment-list`}
                className="px-2 py-[2px] border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white ml-2"
              >
                &gt;
              </Link>
              <Link
                to={`?cpage=${commentPagination.totalPages}#comment-list`}
                className="px-2 py-[2px] border border-[#ddd] bg-[#f9f9f9] text-[#555] hover:bg-white"
              >
                &gt;&gt;
              </Link>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시물 삭제</DialogTitle>
            <DialogDescription>
              정말 이 게시물을 삭제하시겠습니까? 삭제된 게시물은 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Form method="post" action="delete">
              <Button
                type="submit"
                variant="destructive"
              >
                삭제
              </Button>
            </Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BoardLayout>
  );
}
