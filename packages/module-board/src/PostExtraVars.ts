import { z } from "zod";

export interface PostExtraVarsShape {
  has_image: boolean;
  has_video: boolean;
  has_file: boolean;
}

const DEFAULT_POST_EXTRA_VARS: PostExtraVarsShape = {
  has_image: false,
  has_video: false,
  has_file: false,
};

const PostExtraVarsSchema = z.object({
  has_image: z.boolean().default(false),
  has_video: z.boolean().default(false),
  has_file: z.boolean().default(false),
});

export class PostExtraVars implements PostExtraVarsShape {
  public has_image: boolean;
  public has_video: boolean;
  public has_file: boolean;

  constructor(extra_vars?: Partial<PostExtraVarsShape>) {
    const merged: PostExtraVarsShape = {
      ...DEFAULT_POST_EXTRA_VARS,
      ...extra_vars,
    };

    this.has_image = merged.has_image;
    this.has_video = merged.has_video;
    this.has_file = merged.has_file;
  }


  static fromJson(value: any) {
    let parsed: any = {};
    try {
        const json = typeof value === 'string' ? JSON.parse(value) : value;
        const result = PostExtraVarsSchema.safeParse(json);
        if (result.success) {
            parsed = result.data;
        }
    } catch (e) {
        // Parsing error
    }
    return new PostExtraVars(parsed);
  }

  toJSON(): PostExtraVarsShape {
    return {
      has_image: this.has_image,
      has_video: this.has_video,
      has_file: this.has_file,
    };
  }

  // Media Detection Helpers
  static hasAttachment(files: { mime_type?: string | null }[]) {
    if (!files || files.length === 0) return false;
    // Exclude images and videos
    return files.some((f) => {
      const mime = f.mime_type || "";
      return !mime.startsWith("image/") && !mime.startsWith("video/");
    });
  }

  static hasImage(files: { mime_type?: string | null }[], content: string) {
    if (files?.some((f) => (f.mime_type || "").startsWith("image/")))
      return true;
    if (content && /<img\s+/i.test(content)) return true;
    return false;
  }

  static hasVideo(files: { mime_type?: string | null }[], content: string) {
    if (files?.some((f) => (f.mime_type || "").startsWith("video/")))
      return true;
    if (content) {
      if (/<video\s+/i.test(content)) return true;
      if (/youtube\.com|youtu\.be/i.test(content)) return true;
    }
    return false;
  }
}
