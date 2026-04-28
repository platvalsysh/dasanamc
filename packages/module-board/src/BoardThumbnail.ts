import { FileThumbnail, type ThumbnailFileSource, type ThumbnailResult } from "@repo/module-file/thumbnail";
import { type VariantKey } from "@repo/module-file/types";

export class BoardThumbnail {
  static resolve(
    files: ThumbnailFileSource | null,
    content?: string | null,
    priority: VariantKey = "medium",
  ): ThumbnailResult | null {
    // 1. Try from File (Variants) using FileThumbnail
    const fileResult = FileThumbnail.resolve(files, priority);
    if (fileResult) {
        return fileResult;
    }

    // 2. Try from Content if no file thumbnail
    if (content) {
      const match = content.match(/<img[^>]+src="([^">]+)"/);
      if (match) {
        const src = match[1];
        return { src };
      }
    }

    return null;
  }
}
