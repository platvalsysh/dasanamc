import { FileService } from "./.server/FileService";
import { FileVariants } from "./FileVariants";
import { type VariantKey, type StoredVariant } from "./types";
import { type Prisma } from "@repo/database";

export type ThumbnailFileSource = Pick<
  Prisma.filesModel,
  | "storage_type"
  | "local_path"
  | "s3_bucket"
  | "s3_key"
  | "mime_type"
  | "variants"
>;

export type ThumbnailSrcSet = {
  [key in VariantKey]?: { url: string; width: number };
};

export interface ThumbnailResult {
  src: string;
  srcSet?: ThumbnailSrcSet;
}

export class FileThumbnail {
  static resolve(
    file: ThumbnailFileSource | null,
    priority: VariantKey = "medium",
  ): ThumbnailResult | null {
    if (!file) {
      return null;
    }
    if (!file.mime_type?.startsWith("image/")) {
      return null;
    }

    if (file.variants) {
      const variants = FileVariants.parse(file.variants).data;
      if (variants && Object.keys(variants).length > 0) {
        const srcSet: ThumbnailSrcSet = {};
        // Build srcset object
        for (const [key, v] of Object.entries(variants) as [
          VariantKey,
          StoredVariant,
        ][]) {
          if (v?.path) {
            const url = FileService.getStoragePublicUrl({
              ...file,
              s3_key: v.path,
            });
            if (url) {
                srcSet[key] = { url, width: v.width };
            }
          }
        }

        // Set src priority: priority > medium > large > small
        const mainVariant =
          srcSet[priority] ||
          srcSet["medium"] ||
          srcSet["large"] ||
          srcSet["small"];

        if (mainVariant) {
          return { src: mainVariant.url, srcSet };
        }
      }
    }
    const url = FileService.getStoragePublicUrl(file);
    if (!url) {
      return null;
    }
    return { src: url };
  }
}
