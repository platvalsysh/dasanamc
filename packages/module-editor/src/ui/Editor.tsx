import { ClientOnly } from "@repo/core/ui";
import { SimpleEditor } from "./simple-editor";
import { type ExistingFile } from "./file-upload/FilesGrid";
import { type UppyOptions } from "@uppy/core";
import { type Content, type Editor as TiptapEditor } from "@tiptap/react";

export interface Meta {
  [key: string]: any;
}

export interface Body {
  [key: string]: any;
}

export interface EditorProps {
  content?: Content;
  onChange?: (content: string) => void;
  placeholder?: string;
  module: string;
  moduleId?: string | null;
  targetId?: string | null;
  bucket?: string;
  editable?: boolean;
  showFileUploader?: boolean;
  uppyOption?: UppyOptions<Meta, Body>;
  initialFiles?: ExistingFile[];
  onSetMainThumbnail?: (fileId: string) => void;
  onSetGalleryThumbnails?: (fileIds: string[]) => void;
  mainThumbnailId?: string | null;
  editorRef?: React.RefObject<TiptapEditor | null>;
}

export default function Editor(props: EditorProps) {
  return (
    <ClientOnly>
      <SimpleEditor {...props} />
    </ClientOnly>
  );
}
