import { prisma as db } from "@repo/database";
import { FileThumbnail } from "../FileThumbnail";
import { supabaseAdmin } from "./SupabaseStorage";
import path from 'path';
import sharp from 'sharp';
import { VARIANT_CONFIGS } from "../constants";
import { FileVariants } from "../FileVariants";

export interface CreateUploadUrlParams {
  module: string;
  moduleId?: string | null;
  targetId?: string | null;
  filename: string;
  mimeType: string;
  fileSize: number;
  userId?: string;
  bucket?: string;
  s3_key?: string;
  storage_type?: string;
  status?: string;
}


function selectBucketByMime(mime: string): string {
  if (mime.startsWith("image/")) return "public-images";
  if (mime.startsWith("video/")) return "public-videos";
  return "files";
}


export class FileService {
  /**
   * Generate a signed upload URL and create a pending file record
   */
  static async createUploadUrl(params: CreateUploadUrlParams) {
    const {
      module,
      moduleId = null,
      targetId = null,
      filename,
      mimeType,
      fileSize,
      userId = null,
      bucket,
      s3_key: customS3Key,
      storage_type = "s3",
      status = "P",
    } = params;

    const s3Bucket = bucket ?? selectBucketByMime(mimeType);
    let s3Key = customS3Key;

    const extension = path.extname(filename).replace('.', '').toLowerCase();
    if (!s3Key) {
      const now = new Date();
      const uuid = crypto.randomUUID();
      const folder = `${now.getFullYear()}/${now.getMonth() + 1}`;
      const suffix = extension ? `.${extension}` : '';
      s3Key = `${module}/${moduleId || "0"}/${folder}/${uuid}${suffix}`;
    }

    const { data: uploadUrl, error } = await supabaseAdmin.storage
      .from(s3Bucket)
      .createSignedUploadUrl(s3Key, { upsert: true });

    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    const fileRecord = await db.files.create({
      data: {
        module,
        module_id: moduleId,
        target_id: targetId,
        original_name: filename,
        file_size: BigInt(fileSize),
        mime_type: mimeType,
        extension: extension,
        storage_type: storage_type,
        s3_bucket: s3Bucket,
        s3_key: s3Key,
        s3_region: "ap-northeast-2",
        status: status,
        uploaded_by: userId,
      },
    });

    return {
      ...uploadUrl,
      fileId: fileRecord.id,
      path: s3Key,
    };
  }

  /**
   * Upload file directly to S3 and create record
   */
  static async uploadDirectly(params: CreateUploadUrlParams & { buffer: Buffer }) {
    const {
      module,
      moduleId = null,
      targetId = null,
      filename,
      mimeType,
      fileSize,
      userId = null,
      bucket,
      s3_key: customS3Key,
      storage_type = "s3",
      status = "U", // Default to Uploaded for direct upload
      buffer,
    } = params;

    const s3Bucket = bucket ?? selectBucketByMime(mimeType);
    let s3Key = customS3Key;

    const extension = path.extname(filename).replace('.', '').toLowerCase();
    if (!s3Key) {
      const now = new Date();
      const uuid = crypto.randomUUID();
      const folder = `${now.getFullYear()}/${now.getMonth() + 1}`;
      const suffix = extension ? `.${extension}` : '';
      s3Key = `${module}/${moduleId || "0"}/${folder}/${uuid}${suffix}`;
    }

    // Upload to S3
    const { error: uploadError } = await supabaseAdmin.storage
      .from(s3Bucket)
      .upload(s3Key, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file to S3: ${uploadError.message}`);
    }

    // Create File Record
    const fileRecord = await db.files.create({
      data: {
        module,
        module_id: moduleId,
        target_id: targetId,
        original_name: filename,
        file_size: BigInt(fileSize),
        mime_type: mimeType,
        extension: extension,
        storage_type: storage_type,
        s3_bucket: s3Bucket,
        s3_key: s3Key,
        s3_region: "ap-northeast-2",
        status: status,
        uploaded_by: userId,
        uploaded_at: new Date(),
      },
    });

    return {
      fileId: fileRecord.id,
      path: s3Key,
    };
  }

  /**
   * Update file record to mark as uploaded
   */
  static async markAsUploaded(fileId: string) {
    await db.files.update({
      where: { id: fileId },
      data: {
        status: "U", // Uploaded
        uploaded_at: new Date(),
      },
    });
  }

  /**
   * Mark file upload as failed
   */
  static async markAsFailed(fileId: string): Promise<void> {
    await db.files.update({
      where: { id: fileId },
      data: {
        status: "F", // Failed
      },
    });
  }

  /**
   * Get files list by module and optional filters
   */
  static async getFilesList(params: {
    module?: string;
    moduleId?: string;
    targetId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { module, moduleId, targetId, limit = 100, offset = 0 } = params;

    const where: any = {};
    if (module) where.module = module;
    if (moduleId) where.module_id = moduleId;
    if (targetId) where.target_id = targetId;

    const files = await db.files.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit,
      skip: offset,
    });

    return files;
  }

  /**
   * Get a single file by ID
   */
  static async getFileById(fileId: string) {
    const file = await db.files.findUnique({
      where: { id: fileId },
    });

    return file;
  }

  static async deleteFile(fileId: string): Promise<void> {
    const file = await db.files.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Delete from storage if S3
    if (file.storage_type === "s3" && file.s3_bucket && file.s3_key) {
        const keysToDelete = [file.s3_key];

        // Add variants to deletion list
        if (file.variants) {
            try {
                // variants could be a string or object depending on Prisma type mapping, usually object for Json
                const variants = file.variants as any; 
                // Check if it has internal map or just object properties
                // based on FileVariants class, it has .toJSON(), but here it's raw JSON from DB.
                // It likely mimics the Map structure if saved via .toJSON() which yields { "small": {...}, "medium": {...} }
                // or array depending on implementation.
                // Let's assume object where values have .path
                
                Object.values(variants).forEach((variant: any) => {
                    if (variant?.path) {
                        keysToDelete.push(variant.path);
                    }
                });
            } catch (e) {
                console.error("Error parsing variants for deletion:", e);
            }
        }

      const { error } = await supabaseAdmin.storage
        .from(file.s3_bucket)
        .remove(keysToDelete);

      if (error) {
        throw new Error(`Failed to delete file from storage: ${error.message}`);
      }
    }

    // Delete from database
    await db.files.delete({
      where: { id: fileId },
    });
  }

  /**
   * Increment download count
   */
  static async incrementDownloadCount(fileId: string): Promise<void> {
    await db.files.update({
      where: { id: fileId },
      data: {
        download_count: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get download URL for a file
   */
  static async getDownloadUrl(
    fileId: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const file = await db.files.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    if (file.storage_type !== "s3" || !file.s3_bucket || !file.s3_key) {
      throw new Error("File is not stored in S3");
    }

    // Increment download count
    await this.incrementDownloadCount(fileId);

    // Generate signed download URL
    // 1️⃣ signed URL 생성 (download 옵션 사용 ❌)
    const { data, error } = await supabaseAdmin.storage
      .from(file.s3_bucket)
      .createSignedUrl(file.s3_key, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed download URL: ${error.message}`);
    }

    // 2️⃣ 우리가 직접 쿼리 추가 (정석)
    const signedUrl =
      data.signedUrl +
      '&download=' +
      encodeURIComponent(file.original_name);

    return signedUrl;
  }

  /**
   * Get public URL for a file
   */
  static async getPublicUrl(fileId: string) {
    const file = await db.files.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return null;
    }

    const thumbnail = FileThumbnail.resolve(file);
    if (!thumbnail) {
      return null;
    }
    
    return thumbnail.src;
  }

  static getStoragePublicUrl(file: {
    storage_type: string;
    local_path: string | null;
    s3_bucket: string | null;
    s3_key: string | null;
  }) {
    if (file.storage_type !== "s3" || !file.s3_bucket || !file.s3_key) {
      // Return empty string or handle local paths if needed
      return null;
    }
    const { data } = supabaseAdmin.storage
      .from(file.s3_bucket)
      .getPublicUrl(file.s3_key);
    return data.publicUrl;
  }

  /**
   * Publish all files for a specific target
   * This marks files as published when a document is saved
   */
  static async publishFiles(targetId: string): Promise<void> {
    await db.files.updateMany({
      where: { target_id: targetId },
      data: { is_publish: true },
    });
  }

  /**
   * Unpublish files for a specific target
   * Useful for reverting to draft state
   */
  static async unpublishFiles(targetId: string): Promise<void> {
    await db.files.updateMany({
      where: { target_id: targetId },
      data: { is_publish: false },
    });
  }

  /**
   * Delete unpublished files older than a specific date
   * Useful for cleaning up orphaned files from abandoned drafts
   */
  static async deleteUnpublishedFiles(olderThan: Date): Promise<number> {
    const files = await db.files.findMany({
      where: {
        is_publish: false,
        created_at: {
          lt: olderThan,
        },
      },
      select: { // explicit select to match pattern
          id: true,
          storage_type: true,
          s3_bucket: true,
          s3_key: true,
          variants: true,
      }
    });

    // Delete from storage
    for (const file of files) {
      if (file.storage_type === "s3" && file.s3_bucket && file.s3_key) {
        try {
          const keysToDelete = [file.s3_key];
          
          if (file.variants) {
             const variants = file.variants as any;
             Object.values(variants).forEach((variant: any) => {
                if (variant?.path) {
                    keysToDelete.push(variant.path);
                }
             });
          }

          const { error } = await supabaseAdmin.storage
            .from(file.s3_bucket)
            .remove(keysToDelete);

          if (error) {
            throw new Error(
              `Failed to delete file from storage: ${error.message}`,
            );
          }
        } catch (error) {
          console.error(
            `Failed to delete file ${file.id} from storage:`,
            error,
          );
        }
      }
    }

    // Delete from database
    const result = await db.files.deleteMany({
      where: {
        is_publish: false,
        created_at: {
          lt: olderThan,
        },
      },
    });

    return Number(result.count);
  }
  static async deleteFilesByModuleId(moduleId: string): Promise<void> {
    const BATCH_SIZE = 100;

    while (true) {
      const files = await db.files.findMany({
        where: { module_id: moduleId },
        take: BATCH_SIZE,
        select: {
          id: true,
          storage_type: true,
          s3_bucket: true,
          s3_key: true,
          variants: true,
        },
      });

      if (files.length === 0) break;

      // Group by bucket
      const keysByBucket = new Map<string, string[]>();

      for (const file of files) {
        if (
          file.storage_type === "s3" &&
          file.s3_bucket &&
          file.s3_key
        ) {
          const params = keysByBucket.get(file.s3_bucket) || [];
          params.push(file.s3_key);

          // Add variants
          if (file.variants) {
             const variants = file.variants as any;
             Object.values(variants).forEach((variant: any) => {
                if (variant?.path) {
                    params.push(variant.path);
                }
             });
          }

          keysByBucket.set(file.s3_bucket, params);
        }
      }

      // Delete from S3
      for (const [bucket, keys] of keysByBucket) {
        try {
          const { error } = await supabaseAdmin.storage
            .from(bucket)
            .remove(keys);

          if (error) {
            console.error(
              `Failed to delete files from bucket ${bucket}: ${error.message}`,
            );
          }
        } catch (error) {
          console.error(`Failed to delete files from bucket ${bucket}:`, error);
        }
      }

      // Delete from DB
      await db.files.deleteMany({
        where: {
          id: { in: files.map((f) => f.id) },
        },
      });

      if (files.length < BATCH_SIZE) break;
    }
  }

  /**
   * Get filtered file list for admin
   */
  static async getAdminFilesList(params: {
    page: number;
    limit: number;
    module?: string;
    mimeType?: string;
    search?: string;
    isPublish?: string;
    status?: string;
  }) {
    const { page, limit, module, mimeType, search, isPublish, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (module && module !== "all") {
      where.module = module;
    }

    if (mimeType && mimeType !== "all") {
       if (mimeType === "image") {
           where.mime_type = { startsWith: "image/" };
       } else if (mimeType === "video") {
           where.mime_type = { startsWith: "video/" };
       } else {
           where.mime_type = mimeType;
       }
    }

    if (status && status !== "all") {
        where.status = status;
    }

    if (isPublish !== undefined && isPublish !== "all") {
        where.is_publish = isPublish === "true";
    }
    
    if (search) {
      where.OR = [
        { original_name: { contains: search, mode: "insensitive" } },
        { modules: { mid: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, items] = await Promise.all([
      db.files.count({ where }),
      db.files.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: limit,
        skip,
        include: {
           modules: {
              select: {
                  mid: true
              }
           },
           users: {
              select: {
                  email: true,
                  profiles: {
                      select: {
                          display_name: true
                      }
                  }
              }
           }
        }
      }),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    };
  }

  static async deleteFilesByTargetId(targetId: string): Promise<void> {
    const BATCH_SIZE = 100;

    while (true) {
      const files = await db.files.findMany({
        where: { target_id: targetId },
        take: BATCH_SIZE,
        select: {
          id: true,
          storage_type: true,
          s3_bucket: true,
          s3_key: true,
          variants: true,
        },
      });

      if (files.length === 0) break;

      // Group by bucket
      const keysByBucket = new Map<string, string[]>();

      for (const file of files) {
        if (
          file.storage_type === "s3" &&
          file.s3_bucket &&
          file.s3_key
        ) {
          const params = keysByBucket.get(file.s3_bucket) || [];
          params.push(file.s3_key);

          // Add variants
          if (file.variants) {
             try {
                const variants = file.variants as any;
                Object.values(variants).forEach((variant: any) => {
                    if (variant?.path) {
                        params.push(variant.path);
                    }
                });
             } catch (e) {
                 console.error("Error parsing variants for deletion:", e);
             }
          }

          keysByBucket.set(file.s3_bucket, params);
        }
      }

      // Delete from S3
      for (const [bucket, keys] of keysByBucket) {
        try {
          const { error } = await supabaseAdmin.storage
            .from(bucket)
            .remove(keys);

          if (error) {
            console.error(
              `Failed to delete files from bucket ${bucket}: ${error.message}`,
            );
          }
        } catch (error) {
          console.error(`Failed to delete files from bucket ${bucket}:`, error);
        }
      }

      // Delete from DB
      await db.files.deleteMany({
        where: {
          id: { in: files.map((f) => f.id) },
        },
      });

      if (files.length < BATCH_SIZE) break;
    }
  }

  static async generateThumbnail(fileId: string) {
      const file = await db.files.findUnique({ where: { id: fileId } });
      if (!file) throw new Error("File not found");

      // Check if image
      if (!file.mime_type?.startsWith("image/")) {
          return null;
      }

      // Check if already has variants
      if (file.variants) {
          return FileThumbnail.resolve(file);
      }
      
      // 실패되더라도 다시 실행안하도록. 썸네일 무한 생성 방지.
      await db.files.update({
          where: { id: fileId },
          data: {
              variants: {}
          }
      });

      const variants = new FileVariants();

      // Need to generate
      if (!file.s3_bucket || !file.s3_key) throw new Error("File content missing");

      const { data, error } = await supabaseAdmin.storage
          .from(file.s3_bucket)
          .download(file.s3_key);
      
      if (error || !data) throw new Error("Failed to download file from storage");

      const buffer = Buffer.from(await data.arrayBuffer());
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (metadata.width) {
        const { dir, name } = path.posix.parse(file.s3_key);
        const s3KeyWithoutExt = path.posix.join(dir, name);

        await Promise.all(VARIANT_CONFIGS.map(async ({ key, width }) => {
            if ((metadata.width || 0) > width) {
                const resizedBuffer = await image.clone()
                    .resize({ width })
                    .toFormat("webp")
                    .toBuffer();
                
                const variantKey = `thumb/${s3KeyWithoutExt}/${key}.webp`; // thumb/path/uuid/small.webp

                const { error: vError } = await supabaseAdmin.storage
                    .from(file.s3_bucket!)
                    .upload(variantKey, resizedBuffer, {
                        contentType: "image/webp",
                        upsert: true
                    });
                
                if (!vError) {
                    variants.set(key, {
                        key,
                        width,
                        height: Math.round((metadata.height! * width) / metadata.width!),
                        size: resizedBuffer.length,
                        format: "image/webp",
                        ext: "webp",
                        path: variantKey
                    });
                }
            }
        }));
      }

      const updated = await db.files.update({
          where: { id: fileId },
          data: {
              variants: variants
          }
      });
      return FileThumbnail.resolve(updated);
  }
}
