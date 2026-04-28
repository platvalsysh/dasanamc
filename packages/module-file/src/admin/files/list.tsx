import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData, useNavigation, useSubmit, useActionData, Form } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";
import { FileService } from "../../.server/FileService";
import { Button, Input, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@repo/ui-admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui-admin/components/ui/select";
import { format } from "date-fns";
import { Trash2, Search, FileIcon, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileThumbnail } from "../../FileThumbnail";

import { getErrorMessage } from "@repo/core/utils";
export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["file.admin.read"])) {
      throw redirect("/admin"); 
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const module = url.searchParams.get("module") || "all";
  const mimeType = url.searchParams.get("mimeType") || "all";
  const isPublish = url.searchParams.get("isPublish") || "all";
  const status = url.searchParams.get("status") || "all";

  const { items, total, totalPages } = await FileService.getAdminFilesList({
    page,
    limit,
    search,
    module,
    mimeType,
    isPublish,
    status
  });

  const newItmes = items.map((item) => ({
    ...item,
    thumbnail: FileThumbnail.resolve(item),
  }));
  return {
    items: newItmes,
    total,
    totalPages,
    page,
    limit,
    search,
    module,
    mimeType,
    isPublish,
    status
  };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["file.admin.delete"])) {
     return { error: "Unauthorized" }; 
  }
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const fileId = formData.get("fileId") as string;
    if (!fileId) return { error: "File ID is required" };

    try {
      await FileService.deleteFile(fileId);
      return { success: true, message: "File deleted successfully" };
    } catch (error) {
       console.error("Failed to delete file:", error);
       return { error: getErrorMessage(error) || "Failed to delete file" };
    }
  }

  return null;
};

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function AdminFilesList() {
  const { items, total, totalPages, page, search, module, mimeType, isPublish, status } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (navigation.state === "submitting" || navigation.state === "loading") {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [navigation.state]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit(formData, { replace: true });
  };

  const handleFilterChange = (key: string, value: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, value);
    searchParams.set("page", "1"); // Reset to page 1
    submit(searchParams, { replace: true });
  };


  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold tracking-tight">File Management</h1>
            <p className="text-muted-foreground">
              Manage all uploaded files across modules.
            </p>
         </div>
        <Badge variant="outline">{total} Files</Badge>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Form className="relative w-full max-w-sm" onSubmit={handleSearch}>
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
          <Input
            type="search"
            name="search"
            placeholder="Search files or module ID..."
            className="pl-8"
            defaultValue={search}
            disabled={isSearching}
          />
        </Form>
        <div className="flex gap-2">
           <Select
            value={status}
            onValueChange={(val: string) => handleFilterChange("status", val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="U">Uploaded</SelectItem>
              <SelectItem value="P">Pending</SelectItem>
              <SelectItem value="F">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={isPublish}
            onValueChange={(val: string) => handleFilterChange("isPublish", val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Published" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Draft</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={module}
            onValueChange={(val: string) => handleFilterChange("module", val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="board">Board</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              {/* Add more modules dynamically if needed */}
            </SelectContent>
          </Select>

          <Select
            value={mimeType}
            onValueChange={(val: string) => handleFilterChange("mimeType", val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="application/pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Preview</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead className="min-w-[200px]">Storage Info</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-center">Downloads</TableHead>
              <TableHead className="text-center">Published</TableHead>
                <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Module (MID)</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((file) => {
              const thumbnail = file.thumbnail;
              const mid = file.modules?.mid;

              const imgSrc = thumbnail?.src;
              let srcSetString: string | undefined;
              if (thumbnail?.srcSet) {
                srcSetString = Object.values(thumbnail.srcSet)
                  .filter(v => v && v.url && v.width)
                  .map(v => `${v!.url} ${v!.width}w`)
                  .join(", ");
              }

              return (
              <TableRow key={file.id}>
                <TableCell>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      srcSet={srcSetString}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      alt={file.original_name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <FileIcon className="text-muted-foreground h-8 w-8" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="max-w-[200px] truncate" title={file.original_name}>
                    {file.original_name}
                  </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col gap-1 text-xs break-all whitespace-normal min-w-[200px]">
                       {file.local_path && <div><span className="font-semibold">Local:</span> {file.local_path}</div>}
                       {file.s3_bucket && <div><span className="font-semibold">Bucket:</span> {file.s3_bucket}</div>}
                       {file.s3_key && <div><span className="font-semibold">Key:</span> {file.s3_key}</div>}
                       {(file as any).s3_region && <div><span className="font-semibold">Region:</span> {(file as any).s3_region}</div>}
                    </div>
                </TableCell>
                <TableCell>{formatBytes(Number(file.file_size))}</TableCell>
                <TableCell className="text-center">{Number(file.download_count).toLocaleString()}</TableCell>
                <TableCell className="text-center">
                    {file.is_publish ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Published</Badge>
                    ) : (
                        <Badge variant="outline" className="text-gray-500">Draft</Badge>
                    )}
                </TableCell>
                <TableCell>
                    <Badge variant="secondary" className="text-xs">
                        {file.mime_type?.split("/")[1]?.toUpperCase() || "FILE"}
                    </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={file.status === "U" ? "default" : file.status === "P" ? "secondary" : "destructive"}>
                    {file.status === "U" ? "Uploaded" : file.status === "P" ? "Pending" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell>
                   <div className="flex flex-col">
                      <Badge variant="outline" className="w-fit">{file.module}</Badge>
                      {mid && <span className="text-xs text-muted-foreground mt-1">{mid}</span>}
                   </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{file.users?.profiles?.display_name || "Unknown"}</span>
                    <span className="text-muted-foreground text-xs">{file.users?.email}</span>
                  </div>
                </TableCell>
                <TableCell>{file.created_at ? format(new Date(file.created_at), "yyyy-MM-dd") : "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async (e) => {
                           e.preventDefault();
                           try {
                               const res = await fetch(`/api/file/${file.id}/download`);
                               const result = await res.json();
                               const downloadUrl = result.data?.downloadUrl || result.downloadUrl; 
                               if (downloadUrl) {
                                   const link = document.createElement('a');
                                   link.href = downloadUrl;
                                   link.setAttribute('download', file.original_name);
                                   document.body.appendChild(link);
                                   link.click();
                                   link.remove();
                               } else {
                                   console.error("다운로드 주소를 가져올 수 없습니다.");
                                   toast.error("다운로드 주소를 가져올 수 없습니다.");
                               }
                           } catch (err) {
                               console.error("다운로드 중 오류가 발생했습니다.", err);
                               toast.error("다운로드 중 오류가 발생했습니다.");
                           }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>파일 삭제</DialogTitle>
                          <DialogDescription>
                            정말로 <b>{file.original_name}</b> 파일을 삭제하시겠습니까?<br/>
                            이 작업은 되돌릴 수 없습니다.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">취소</Button>
                          </DialogClose>
                          <Button 
                            variant="destructive" 
                            type="submit" 
                            form={`delete-form-${file.id}`}
                          >
                            삭제
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Form method="post" id={`delete-form-${file.id}`} style={{ display: 'none' }}>
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="fileId" value={file.id} />
                    </Form>
                  </div>
                </TableCell>
              </TableRow>
            )})}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set("page", String(page - 1));
                submit(searchParams, { replace: true });
            }}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set("page", String(page + 1));
                submit(searchParams, { replace: true });
            }}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
