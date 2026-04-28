"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type {
  Editor} from "@tiptap/react";
import {
  EditorContent,
  EditorContext,
  useEditor,
} from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
// import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { FontSize } from "./toolbars/font-size/extension";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "../../components/tiptap-ui-primitive/button";
import { Spacer } from "../../components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../../components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "../../components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "../../components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "../../components/tiptap-node/blockquote-node/blockquote-node.scss";
import "../../components/tiptap-node/code-block-node/code-block-node.scss";
import "../../components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "../../components/tiptap-node/list-node/list-node.scss";
import "../../components/tiptap-node/image-node/image-node.scss";
import "../../components/tiptap-node/heading-node/heading-node.scss";
import "../../components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "../../components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "../../components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "../../components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "../../components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "../../components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "../../components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "../../components/tiptap-ui/link-popover";
import { MarkButton } from "../../components/tiptap-ui/mark-button";
import { TextAlignButton } from "../../components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "../../components/tiptap-ui/undo-redo-button";
import { TableExtension } from "./toolbars/table/extension";
import { TableToolbar } from "./toolbars/table/table";
import { TextColorExtension } from "./toolbars/text-color/extension";
import { TextColorToolbar } from "./toolbars/text-color/text-color";
import { FontFamilyToolbar } from "./toolbars/font-family/FontFamilyToolbar";
import { FontSizeToolbar } from "./toolbars/font-size/FontSizeToolbar";
import { YoutubeExtension } from "./toolbars/youtube/extension";
import { YoutubeToolbar } from "./toolbars/youtube/youtube";
import { ResizableImageExtension } from "../../components/tiptap-node/resizable-image-node/extension";

// --- Icons ---
import { ArrowLeftIcon } from "../../components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "../../components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "../../components/tiptap-icons/link-icon";
import { Eraser, Ban } from "lucide-react";

// --- Hooks ---
import { useIsBreakpoint } from "../../hooks/use-is-breakpoint";

// --- Components ---

// --- Styles ---
import "./simple-editor.scss";

// --- Custom ---

import { Placeholder } from "@tiptap/extension-placeholder";

// --- Uppy ---
import Uppy, { type UppyOptions } from "@uppy/core";
import { UppyContextProvider } from "@uppy/react";
import XHR from "@uppy/xhr-upload";
import "@uppy/core/css/style.min.css";

// --- Custom File Upload UI ---
import { Dropzone } from "./file-upload/Dropzone";
import { FilesGrid, type ExistingFile } from "./file-upload/FilesGrid";
import { UploadingFilesList } from "./file-upload/UploadingFilesList";

// --- Auth ---
import { useSupabase } from "@repo/auth/ui";

class LocalEventEmitter {
  private events: Record<string, ((data: any) => void)[]> = {};

  on(event: string, listener: (data: any) => void) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  off(event: string, listener: (data: any) => void) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event: string, data: any) {
    this.events[event]?.forEach((listener) => listener(data));
  }
}

const MainToolbarContent = ({
  editor,
  onHighlighterClick,
  onLinkClick,
  isMobile,
  uppy,
}: {
  editor: Editor | null;
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  uppy?: Uppy<any, any>;
}) => {
  if (!editor) {
    return null;
  }

  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />

        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        <TextColorToolbar editor={editor} />
        <FontFamilyToolbar editor={editor} isMarkdownMode={false} />
        <FontSizeToolbar editor={editor} />
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
        
        <Button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          data-style="ghost"
          tooltip="Clear Marks"
        >
          <Eraser className="tiptap-button-icon" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().clearNodes().run()}
          data-style="ghost"
          tooltip="Clear Nodes"
        >
          <Ban className="tiptap-button-icon" />
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TableToolbar editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <YoutubeToolbar editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

import { type EditorProps, type Meta, type Body } from "./Editor";

export function SimpleEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  editable = true,
  module,
  moduleId,
  targetId,
  bucket,
  showFileUploader = true,
  uppyOption,
  initialFiles,
  onSetMainThumbnail,
  onSetGalleryThumbnails, // Callback for multiple thumbnails
  mainThumbnailId,
  editorRef,
}: EditorProps) {
  const isMobile = useIsBreakpoint();
  const mainThumbnailIdRef = useRef(mainThumbnailId);

  useEffect(() => {
    mainThumbnailIdRef.current = mainThumbnailId;
  }, [mainThumbnailId]);
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main",
  );

  const supabase = useSupabase(); // Restored for existing file deletion

  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>(
    initialFiles ?? [],
  );

  const defaultUppyOption: UppyOptions<Meta, Body> = {
    autoProceed: true,
    restrictions: {
      maxFileSize: 20 * 1024 * 1024, // 20MB default
      minFileSize: null,
      maxTotalFileSize: null,
      maxNumberOfFiles: null,
      minNumberOfFiles: null,
      allowedFileTypes: null,
      requiredMetaFields: [],
    },
  };

  const mergedUppyOption = {
    ...defaultUppyOption,
    ...uppyOption,
    restrictions: {
      ...defaultUppyOption.restrictions,
      ...uppyOption?.restrictions,
    },
  };

  const eventEmitter = useRef(new LocalEventEmitter()).current;

  const deleteFileFromServer = async (fileId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      await fetch("/api/file/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ fileId }),
      });
    } catch (e) {
      console.error("Failed to delete file:", e);
    }
  };

  const handleCancelUpload = async (uppyFileId: string) => {
    const file = uppy.getFile(uppyFileId);
    if (!file) return;

    // If file has been uploaded (or signed url created with fileId), delete it from server
    const serverFileId = file.meta?.fileId as string;
    if (serverFileId) {
      await deleteFileFromServer(serverFileId);
    }

    uppy.removeFile(uppyFileId);
  };

  const handleSetMainThumbnail = useCallback(async (id: string) => {
      onSetMainThumbnail?.(id);
      if (id) {
          try {
              fetch(`/api/file/${id}/thumbnail`, { method: "POST" });
          } catch (e) {
              console.error(e);
          }
      }
  }, [onSetMainThumbnail]);

  const handleSetMainThumbnailRef = useRef(handleSetMainThumbnail);
  useEffect(() => {
    handleSetMainThumbnailRef.current = handleSetMainThumbnail;
  }, [handleSetMainThumbnail]);

  const [uppy] = useState(() =>
    new Uppy<Meta, Body>(mergedUppyOption)
      .use(XHR, {
        bundle: false,
        method: "PUT",
        endpoint: async (fileOrBundle) => {
          console.log("endpoint:", fileOrBundle);
          if (Array.isArray(fileOrBundle)) {
            throw new Error("Multiple files are not supported");
          }
          const file = fileOrBundle;

          const response = await fetch("/api/file/upload-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              module,
              moduleId,
              targetId,
              filename: file.name,
              mimeType: file.type || "application/octet-stream",
              fileSize: file.size,
              bucket,
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to get upload URL");
          }
          const { data } = await response.json();
          const { signedUrl, path, token, fileId } = data;

          uppy.setFileMeta(file.id, {
            signedUrl,
            path,
            token,
            fileId,
          });
          return signedUrl;
        },
        headers: (file) => {
          // For Supabase Storage signed URLs, we don't need authorization header
          // The signed URL already contains the authentication
          return {
            "x-signature": file.meta?.token as string,
          };
        },
      })
      .on("upload-error", (file, error) => {
        if (file) {
          eventEmitter.emit("file-upload-failed", { fileId: file.id, error });
        }
      })
      .on("upload-success", async (file, response) => {
        console.log("upload-success:", file, response);
        try {
          // Mark file as uploaded in database and get public URL
          const fileId = file?.meta?.fileId;

          if (fileId) {
            const response = await fetch("/api/file/mark-uploaded", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ fileId }),
            });

            if (response.ok) {
              const result = await response.json();
              // Check for JsonResponse wrapper structure
              const data = result.data || result;

              if (data) {
                const publicUrl: string | null = data.publicUrl;
                // Emit custom event for node handlers
                eventEmitter.emit("file-url-generated", {
                  fileId: file.id,
                  publicUrl,
                });
                // Update file meta
                uppy.setFileMeta(file.id, { publicUrl });
                
                // Requirement 2: Call generate-thumbnail API if no mainThumbnail exists and this is an image
                if (!mainThumbnailIdRef.current && file.type?.startsWith('image/')) {
                    handleSetMainThumbnailRef.current(fileId);
                }

                // Add to existingFiles to show in FilesGrid
                const newFile: ExistingFile = {
                  id: fileId,
                  url: publicUrl,
                  name: file.name ?? "Untitled",
                  size: file.size ?? 0,
                };

                setExistingFiles((prev) => [...prev, newFile]);

                // Remove from Uppy so it moves from UploadingFilesList to FilesGrid
                uppy.removeFile(file.id);
              } else {
                console.error("Mark uploaded success false:", result);
                eventEmitter.emit("file-upload-failed", {
                  fileId: file.id,
                  error: new Error(
                    result.message || "Failed to get public URL",
                  ),
                });
              }
            } else {
              console.error("Mark uploaded response not ok:", response.status);
              console.error("Mark uploaded response not ok:", response.status);
              eventEmitter.emit("file-upload-failed", {
                fileId: file.id,
                error: new Error(`API Error: ${response.statusText}`),
              });
            }
          }
        } catch (error) {
          console.error("Error marking file as uploaded:", error);
          console.error("Error marking file as uploaded:", error);
          eventEmitter.emit("file-upload-failed", {
            fileId: file?.id,
            error,
          });
        }
      }),
  );

  const handleImageNodeUpload = useCallback(
    (
      file: File,
      onProgress?: (event: { progress: number }) => void,
      abortSignal?: AbortSignal,
    ) => {
      if (!uppy) {
        return Promise.reject(new Error("Uploader not initialized"));
      }

      return new Promise<string>((resolve, reject) => {
        try {
          const fileId = uppy.addFile({
            source: "image-upload-node",
            name: file.name,
            type: file.type,
            data: file,
          });

          // Handle abort signal
          if (abortSignal) {
            abortSignal.onabort = () => {
              handleCancelUpload(fileId);
              cleanup();
              reject(new Error("Upload aborted"));
            };
          }

          const handleUrlGenerated = ({
            fileId: fid,
            publicUrl,
          }: {
            fileId: string;
            publicUrl?: string;
          }) => {
            console.log("handleUrlGenerated:", fid, publicUrl);
            if (fid === fileId) {
              cleanup();
              if (publicUrl) {
                resolve(publicUrl);
              } else {
                reject(new Error("Public URL not generated"));
              }
            }
          };

          const handleUploadFailed = ({
            fileId: fid,
            error,
          }: {
            fileId: string;
            error: any;
          }) => {
            console.log("handleUploadFailed:", fid, error);
            if (fid === fileId) {
              cleanup();
              reject(error);
            }
          };

          const onUppyProgress = (f: any, progress: any) => {
            if (f.id === fileId) {
              // progress.bytesUploaded / progress.bytesTotal * 100
              // simple-editor.tsx seems to use uppy logic.
              // Uppy progress object: { bytesUploaded, bytesTotal, ... }
              const percentage =
                (progress.bytesUploaded / progress.bytesTotal) * 100;
              onProgress?.({ progress: Math.round(percentage) });
            }
          };

          const cleanup = () => {
            eventEmitter.off("file-url-generated", handleUrlGenerated);
            eventEmitter.off("file-upload-failed", handleUploadFailed);
            uppy.off("upload-progress", onUppyProgress);
            if (abortSignal) {
              abortSignal.onabort = null;
            }
          };

          eventEmitter.on("file-url-generated", handleUrlGenerated);
          eventEmitter.on("file-upload-failed", handleUploadFailed);
          uppy.on("upload-progress", onUppyProgress);
        } catch (err) {
          reject(err);
        }
      });
    },
    [uppy],
  );

  const handleRemoveExistingFiles = useCallback(async (fileIds: string[]) => {
      for (const fileId of fileIds) {
          await deleteFileFromServer(fileId);
      }
      setExistingFiles((prev) =>
          prev.filter((f) => !fileIds.includes(f.id)),
      );
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      // TextStyle,
      FontFamily,
      FontSize,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      ResizableImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: 20 * 1024 * 1024, // 20MB
        limit: 3,
        upload: handleImageNodeUpload,
        onError: (error: any) => console.error("Upload failed:", error),
      }),
      Placeholder.configure({
        placeholder,
      }),
      ...TableExtension,
      ...TextColorExtension,
      ...YoutubeExtension,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  useEffect(() => {
    if (editorRef) {
      // @ts-ignore
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <UppyContextProvider uppy={uppy as any}>
        <div className="simple-editor-wrapper">
          {editable && (
            <Toolbar>
              {mobileView === "main" ? (
                <MainToolbarContent
                  editor={editor}
                  onHighlighterClick={() => setMobileView("highlighter")}
                  onLinkClick={() => setMobileView("link")}
                  isMobile={isMobile}
                  uppy={uppy}
                />
              ) : (
                <MobileToolbarContent
                  type={mobileView === "highlighter" ? "highlighter" : "link"}
                  onBack={() => setMobileView("main")}
                />
              )}
            </Toolbar>
          )}

          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </div>
        {showFileUploader && editable && (
          <div className="file-upload-section p-4 border-t border-gray-200">
            <h3 className="file-upload-title text-sm font-medium mb-2">
              File Attachments
            </h3>
            <div className="file-uploader">
              <div className="file-upload-container">
                <Dropzone uppy={uppy} />
                <UploadingFilesList uppy={uppy} onCancel={handleCancelUpload} />
                <FilesGrid
                  editor={editor}
                  existingFiles={existingFiles}
                  onRemoveExistingFiles={handleRemoveExistingFiles}
                  onSetMainThumbnail={handleSetMainThumbnail}
                  mainThumbnailId={mainThumbnailId}
                />
              </div>
            </div>
          </div>
        )}
      </UppyContextProvider>
    </EditorContext.Provider>
  );
}
