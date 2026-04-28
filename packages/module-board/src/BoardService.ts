import { prisma, type Prisma, type document_categories, type modules } from "@repo/database";
import { FileService } from "@repo/module-file/server";
import { BoardExtraVars, type BoardExtraVarsShape, type BoardPermissionsBoolean, type BoardPermissionsShape } from "./BoardExtraVars";
import type { Auth } from "@repo/auth/server";
import { PostExtraVars } from "./PostExtraVars";
import { BoardThumbnail } from "./BoardThumbnail";
import { FileThumbnail } from "@repo/module-file/thumbnail";

export type BoardModule = Omit<modules, "extra_vars"> & { extra_vars: BoardExtraVarsShape };

export class BoardService {
  /**
   * Check Permission
   */
  static async checkPermission({
    auth,
    extra_vars,
    action,
  }: {
    auth?: Auth;
    extra_vars: BoardExtraVarsShape;
    action: keyof BoardPermissionsShape;
  }): Promise<boolean> {
    const perm = extra_vars.permissions?.[action];
    
    // Fail safe
    if (!perm) return true; 

    // 0. Super Admin Bypass
    if (auth?.isSuperAdmin()) return true;

    // 1. All
    if (perm.type === "all") return true;

    // 2. Admin
    // If logic is "Board Admin", we need to check if user is admin of THIS board.
    // However, currently "admin" permission usually means "Manager" level or "Super Admin".
    // If we want to support "Board Manager" (specific users), that needs extra logic.
    // For now, let's assume "admin" type requires Super Admin or specific role.
    if (perm.type === "admin") {
         return auth?.checkPermissions(['board.*']) || false;
    }

    // 3. Member
    if (perm.type === "member") return auth?.isLogged() || false;

    // 4. Group
    if (perm.type === "group") {
        if (!auth || !auth.isLogged()) return false;
        
        const userRoles = auth.getRoles() as string[]; // Roles are names now
        if (!perm.roles || perm.roles.length === 0) return false;
        
        // perm.roles are now names (saved by BoardPermissionSelector)
        return perm.roles.some(roleName => userRoles.includes(roleName));
    }

    return false;
  }

  /**
   * Get all permissions for the current user/context
   */
  static async getPermissions({
    auth,
    extra_vars,
  }: {
    auth?: Auth;
    extra_vars: BoardExtraVarsShape;
  }) {
    const permissions: BoardPermissionsBoolean = {
        access: false,
        list: false,
        read: false,
        write: false,
        comment: false,
        manage: false,
    };
    const allActions = Object.keys(permissions) as (keyof BoardPermissionsBoolean)[];

    permissions.manage = await BoardService.checkPermission({
        auth,
        extra_vars,
        action: "manage",
    });
    if (permissions.manage) {
      allActions.forEach(k => { permissions[k] = true; });
      return permissions;
    }

    permissions.access = await BoardService.checkPermission({
        auth,
        extra_vars,
        action: "access",
    });
    if (!permissions.access) {
      allActions.forEach(k => { permissions[k] = false; });
      return permissions;
    }

    const actions = allActions.filter(
      (a)=> a !== "manage" && a !== "access"
    );
    for (const action of actions) {
      permissions[action] = await BoardService.checkPermission({
        auth,
        extra_vars,
        action,
      });
    }
    return permissions;
  }

  static async getModuleByMid(mid: string | undefined): Promise<BoardModule | null> {
    if (!mid) return null;

    const module = await prisma.modules.findFirst({
      where: { mid: { equals: mid, mode: "insensitive" } }
    });
    if (!module) return null;

    return {
      ...module,
      extra_vars: BoardExtraVars.fromJson(module.extra_vars).toJSON()
    };
  }

  /**
   * Get Documents with pagination, filtering, and search
   */
  static async getDocuments({
    moduleId,
    page = 1,
    limit = 20,
    searchTarget,
    searchKeyword,
    categoryId,
  }: {
    moduleId: string;
    page?: number;
    limit?: number;
    searchTarget?: string;
    searchKeyword?: string;
    categoryId?: string | null;
  }) {
    const categories = await BoardService.getCategories(moduleId);

    const where: Prisma.documentsWhereInput = {
      module_id: moduleId,
      status: { not: "TEMP" }, // Filter drafts
    };

    if (categoryId) {
      // Find selected category and all descendants
      const getDescendants = (id: string, allCats: document_categories[]): string[] => {
        const children = allCats.filter((c) => c.parent_id === id);
        let ids = [id];
        for (const child of children) {
          ids = [...ids, ...getDescendants(child.id, allCats)];
        }
        return ids;
      };

      const targetIds = getDescendants(categoryId, categories);
      where.category_id = { in: targetIds };
    }

    if (searchKeyword) {
      if (searchTarget === "title") {
        where.title = { contains: searchKeyword, mode: "insensitive" };
      } else if (searchTarget === "content") {
        where.content = { contains: searchKeyword, mode: "insensitive" };
      } else if (searchTarget === "title_content" || !searchTarget) {
        where.OR = [
          { title: { contains: searchKeyword, mode: "insensitive" } },
          { content: { contains: searchKeyword, mode: "insensitive" } },
        ];
      }
    }

    const skip = (page - 1) * limit;

    const [total, documents] = await Promise.all([
      prisma.documents.count({ where }),
      prisma.documents.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              profiles: {
                select: {
                  display_name: true,
                  profile_image: true,
                },
              },
            },
          },
          document_categories: {
            select: {
              id: true,
              name: true,
            },
          },
          files: {
            select: {
              storage_type: true,
              local_path: true,
              s3_bucket: true,
              s3_key: true,
              mime_type: true,
              variants: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: [{ is_notice: "desc" }, { created_at: "desc" }],
      }),
    ]);

    // Transform documents
    const transformedDocuments = documents.map((doc) => {
      const user = doc.users;
      const display_name = user?.profiles?.display_name || "Unknown";
      
      const transformedUser = user ? {
        ...user,
        display_name,
      } : null;

      const thumbnailInfo = BoardThumbnail.resolve(doc.files, doc.content);
      
      return {
        ...doc,
        thumbnailInfo,
        extra_vars: PostExtraVars.fromJson(doc.extra_vars).toJSON(),
        users: transformedUser,
      };
    });

    return {
      documents: transformedDocuments,
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },

    };
  }

  /**
   * Get a single document by ID
   */
  static async getDocument(id: string) {
    const document = await prisma.documents.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            profiles: {
              select: {
                display_name: true,
                profile_image: true,
              },
            },
          },
        },
        files: {
            select: {
              storage_type: true,
              local_path: true,
              s3_bucket: true,
              s3_key: true,
              mime_type: true,
              variants: true,
            }
        }
      },
    });

    if (!document) return null;

    const user = document.users;
    const display_name = user?.profiles?.display_name || "Unknown";
    const transformedUser = user ? { ...user, display_name } : null;

    const thumbnailInfo = BoardThumbnail.resolve(document.files, document.content);

    return {
      ...document,
      thumbnailInfo,
      extra_vars: PostExtraVars.fromJson(document.extra_vars).toJSON(),
      users: transformedUser,
    };
  }

  /**
   * Get comments for a document
   */
  static async getComments({
    documentId,
    page = 1,
    limit = 100,
  }: {
    documentId: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      prisma.comments.count({ where: { document_id: documentId } }),
      prisma.comments.findMany({
        where: { document_id: documentId },
        include: {
          users: {
            select: {
              id: true,
              profiles: {
                select: {
                  display_name: true,
                  profile_image: true,
                }
              }
            },
          },
        },
        orderBy: [{ head: "asc" }, { arrange: "asc" }],
        skip,
        take: limit,
      }),
    ]);
    
    // Transform comments if needed? 
    // Comment structure is simple.
    // However, users.profiles.display_name needs to be flattened or accessed safely in UI?
    // Current UI uses `comment.users?.display_name`.
    // Wait, `getDocuments` -> `users.profiles.display_name`.
    // `getReadContext` -> `comments: ... include: { users: { include: { profiles: true } } }`.
    // And UI: `comment.users?.display_name`. 
    // If `users` model has `display_name` directly, that's fine.
    // If it relies on profile, we need to map it OR UI handles `users.profiles.display_name`.
    // `GeneralSkin.tsx` line 504: `comment.users?.display_name`.
    // This implies `users` object has `display_name`.
    // This might be a view or the relation name is different.
    // Actually, `users` table usually doesn't have `display_name` if `profiles` is separate.
    // Check `getDocuments` again. `users: { select: { profiles: { select: { display_name: true } } } }`.
    // This returns structure: `doc.users.profiles.display_name`.
    // But `GeneralSkin` uses `post.users?.profiles?.display_name` for POST.
    // For COMMENT, `GeneralSkin` line 504 uses `comment.users?.display_name`.
    // Why different?
    // Maybe `comments` relation `users` points to a view or I am misremembering.
    // Let's assume `users` has `display_name` OR I should include profiles and map it.
    // Let's look at `getReadContext` old implementation to be sure.
    // I can't see it in current view, it was further down.
    // I will use `users: { include: { profiles: true } }` and let UI handle it, OR verify.
    // Safe bet: include profiles.
    
    return {
      comments: comments.map(c => {
         const user = (c as any).users;
         const display_name = user?.profiles?.display_name || "Anonymous";
         return {
           ...c,
           users: user ? { ...user, display_name } : null
         };
      }),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Get files for a document
   */
  static async getFiles(documentId: string) {
    const files = await FileService.getFilesList({ module: "board", targetId: documentId });
    return files.map(f => ({
      id: f.id,
      name: f.original_name,
      size: Number(f.file_size),
      thumbnail: FileThumbnail.resolve(f),
    }));
  }

  /**
   * Create a comment with threaded logic (Shift-Arrange)
   */
  static async createComment({
    documentId,
    authorId,
    content,
    parentId,
  }: {
    documentId: string;
    authorId: string | null;
    content: string;
    parentId?: string | null;
  }) {
    // Threading Logic
    let head = null;
    let arrange = 1;
    let depth = 0;

    if (parentId) {
      // Reply
      const parent = await prisma.comments.findUnique({
        where: { id: parentId },
      });
      if (!parent) throw new Error("Parent comment not found.");

      head = parent.head;
      depth = (parent.depth || 0) + 1;

      // Find insertion point: Max arrange of immediate children or subtree
      const nextSibling = await prisma.comments.findFirst({
        where: {
          head: parent.head,
          arrange: { gt: parent.arrange || 0 },
          depth: { lte: parent.depth || 0 },
        },
        orderBy: { arrange: "asc" },
      });

      let insertionArrange = 0;
      if (nextSibling) {
        insertionArrange = nextSibling.arrange || 0;
      } else {
        // No next sibling/branch found, implies parenet's subtree goes to end of thread.
        // Get max arrange of the whole thread
        const maxArrangeComment = await prisma.comments.findFirst({
          where: { head: parent.head },
          orderBy: { arrange: "desc" },
        });
        insertionArrange = (maxArrangeComment?.arrange || 0) + 1;
      }

      // Shift everyone from insertionArrange onwards by +1 if inserting in middle
      if (nextSibling) {
        await prisma.comments.updateMany({
          where: {
            head: parent.head,
            arrange: { gte: insertionArrange },
          },
          data: {
            arrange: { increment: 1 },
          },
        });
        arrange = insertionArrange;
      } else {
        arrange = insertionArrange;
      }
    } else {
      // Root Comment
      arrange = 1;
    }

    const newComment = await prisma.comments.create({
      data: {
        document_id: documentId,
        author_id: authorId,
        content: content,
        head: head || undefined, // If null/undefined, DB default is used (new sequence val)
        arrange: arrange,
        depth: depth,
        parent_id: parentId,
      },
    });

    // Exact Count Update
    const count = await prisma.comments.count({
      where: { document_id: documentId },
    });
    await prisma.documents.update({
      where: { id: documentId },
      data: { comment_count: count },
    });

    return newComment;
  }

  /**
   * Delete a comment
   */
  static async deleteComment({
    commentId,
    documentId,
    userId,
    manage,
  }: {
    commentId: string;
    documentId: string;
    userId: string;
    manage: boolean;
  }) {
    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new Error("Comment not found");

    if (!manage && comment.author_id !== userId) {
      throw new Error("Forbidden: Unauthorized to delete comment");
    }

    // Check children
    const childCount = await prisma.comments.count({
      where: { parent_id: commentId },
    });

    if (childCount > 0) {
      // Soft Delete (Placeholder)
      await prisma.comments.update({
        where: { id: commentId },
        data: {
          content: "삭제된 댓글입니다.",
          author_id: null,
          is_secret: false,
          // We keep the structure (head, arrange, depth) intact
        },
      });
    } else {
      // Hard Delete
      await prisma.comments.delete({ where: { id: commentId } });
    }

    // Exact Count Update
    const count = await prisma.comments.count({
      where: { document_id: documentId },
    });
    await prisma.documents.update({
      where: { id: documentId },
      data: { comment_count: count },
    });

    return true;
  }

  /**
   * Toggle Like
   */
  static async toggleLike({
    documentId,
    userId,
    ipAddress,
  }: {
    documentId: string;
    userId: string;
    ipAddress: string;
  }) {
    // Check existing vote
    const existing = await prisma.document_vote_log.findUnique({
      where: {
        document_id_user_id_vote_type: {
          document_id: documentId,
          user_id: userId,
          vote_type: "LIKE",
        },
      },
    });

    if (existing) {
      // Unlike
      await prisma.$transaction([
        prisma.document_vote_log.delete({
          where: { id: existing.id },
        }),
        prisma.documents.update({
          where: { id: documentId },
          data: { like_count: { decrement: 1 } },
        }),
      ]);
      return false;
    } else {
      // Like
      await prisma.$transaction([
        prisma.document_vote_log.create({
          data: {
            document_id: documentId,
            user_id: userId,
            ip_address: ipAddress,
            vote_type: "LIKE",
          },
        }),
        prisma.documents.update({
          where: { id: documentId },
          data: { like_count: { increment: 1 } },
        }),
      ]);
      return true;
    }
  }

  /**
   * Log Document View (Increment View Count safely)
   */
  static async logView({
    documentId,
    userId,
    ipAddress,
  }: {
    documentId: string;
    userId: string | null;
    ipAddress: string;
  }) {
    if (userId) {
      // Logged-in User
      const history = await prisma.document_read_history.findUnique({
        where: {
          document_id_user_id: {
            document_id: documentId,
            user_id: userId,
          },
        },
      });

      if (!history) {
        await prisma.$transaction([
          prisma.document_read_history.create({
            data: {
              document_id: documentId,
              user_id: userId,
            },
          }),
          prisma.documents.update({
            where: { id: documentId },
            data: { view_count: { increment: 1 } },
          }),
        ]);
      }
    } else {
      // Guest (IP Check - 24 hours)
      const recentLog = await prisma.document_ip_view_log.findFirst({
        where: {
          document_id: documentId,
          ip_address: ipAddress,
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          },
        },
      });

      if (!recentLog) {
        await prisma.$transaction([
          prisma.document_ip_view_log.create({
            data: {
              document_id: documentId,
              ip_address: ipAddress,
            },
          }),
          prisma.documents.update({
            where: { id: documentId },
            data: { view_count: { increment: 1 } },
          }),
        ]);
      }
    }
  }

  /**
   * Toggle Blame (Report)
   */
  static async toggleBlame({
    documentId,
    userId,
    ipAddress,
  }: {
    documentId: string;
    userId: string;
    ipAddress: string;
  }) {
    // Check existing vote
    const existing = await prisma.document_vote_log.findUnique({
      where: {
        document_id_user_id_vote_type: {
          document_id: documentId,
          user_id: userId,
          vote_type: "BLAME",
        },
      },
    });

    if (existing) {
      // Un-Blame
      await prisma.$transaction([
        prisma.document_vote_log.delete({
          where: { id: existing.id },
        }),
        prisma.documents.update({
          where: { id: documentId },
          data: { blame_count: { decrement: 1 } },
        }),
      ]);
      return false;
    } else {
      // Blame
      await prisma.$transaction([
        prisma.document_vote_log.create({
          data: {
            document_id: documentId,
            user_id: userId,
            ip_address: ipAddress,
            vote_type: "BLAME",
          },
        }),
        prisma.documents.update({
          where: { id: documentId },
          data: { blame_count: { increment: 1 } },
        }),
      ]);
      return true;
    }
  }

  static async toggleCommentLike({
    commentId,
    userId,
    ipAddress,
  }: {
    commentId: string;
    userId: string;
    ipAddress: string;
  }) {
    // Check existing like
    const existing = await prisma.comment_vote_log.findUnique({
      where: {
        comment_id_user_id_vote_type: {
          comment_id: commentId,
          user_id: userId,
          vote_type: "LIKE",
        },
      },
    });

    if (existing) {
      // Unlike
      await prisma.$transaction([
        prisma.comment_vote_log.delete({
          where: { id: existing.id },
        }),
        prisma.comments.update({
          where: { id: commentId },
          data: { like_count: { decrement: 1 } },
        }),
      ]);
      return false;
    } else {
      // Like
      await prisma.$transaction([
        prisma.comment_vote_log.create({
          data: {
            comment_id: commentId,
            user_id: userId,
            ip_address: ipAddress,
            vote_type: "LIKE",
          },
        }),
        prisma.comments.update({
          where: { id: commentId },
          data: { like_count: { increment: 1 } },
        }),
      ]);
      return true;
    }
  }

  /**
   * Create Document (with Category Count)
   */
  static async createDocument({
    documentId,
    moduleId,
    title,
    content,
    thumbnail,
    isNotice = false,
    isSecret = false,
    commentStatus = "ALLOW",
    status = "PUBLIC",
    extraVars = new PostExtraVars(),
    fileCount = 0,
    categoryId,
    authorId,
  }: {
    documentId: string;
    moduleId: string;
    title: string;
    content: string;
    thumbnail?: string | null;
    isNotice?: boolean;
    isSecret?: boolean;
    commentStatus?: string;
    status?: string;
    extraVars?: PostExtraVars;
    fileCount?: number;
    categoryId?: string | null;
    authorId: string;
  }) {

    // Transaction: Create Document + Increment Category Count
    return prisma.$transaction(async (tx) => {
      const doc = await tx.documents.create({
        data: {
          id: documentId,
          module_id: moduleId,
          title,
          content,
          author_id: authorId,
          thumbnail: thumbnail || null,
          is_notice: isNotice,
          is_secret: isSecret,
          comment_status: commentStatus,
          status,
          extra_vars: extraVars,
          file_count: fileCount,
          category_id: categoryId,
        },
      });

      if (categoryId) {
        await tx.document_categories.update({
          where: { id: categoryId },
          data: { document_count: { increment: 1 } },
        });
      }

      return doc;
    });
  }

  /**
   * Update Document (with Category Count adjustment)
   */
  static async updateDocument({
    documentId,
    title,
    content,
    thumbnail,
    isNotice,
    isSecret,
    commentStatus,
    status,
    extraVars,
    fileCount,
    categoryId,
  }: {
    documentId: string;
    title?: string;
    content?: string;
    thumbnail?: string | null;
    isNotice?: boolean;
    isSecret?: boolean;
    commentStatus?: string;
    status?: string;
    extraVars?: PostExtraVars;
    fileCount?: number;
    categoryId?: string | null;
  }) {
    const oldDoc = await prisma.documents.findUnique({
      where: { id: documentId },
    });

    if (!oldDoc) throw new Error("Document not found");
  
    return prisma.$transaction(async (tx) => {
      const updatedDoc = await tx.documents.update({
        where: { id: documentId },
        data: {
          title,
          content,
          thumbnail,
          is_notice: isNotice,
          is_secret: isSecret,
          comment_status: commentStatus,
          status,
          extra_vars: extraVars,
          file_count: fileCount,
          category_id: categoryId,
        },
      });

      // Handle Category Change
      if (categoryId !== undefined && oldDoc.category_id !== categoryId) {
        // Decrement old
        if (oldDoc.category_id) {
          await tx.document_categories.update({
            where: { id: oldDoc.category_id },
            data: { document_count: { decrement: 1 } },
          });
        }
        // Increment new
        if (categoryId) {
          await tx.document_categories.update({
            where: { id: categoryId },
            data: { document_count: { increment: 1 } },
          });
        }
      }

      return updatedDoc;
    });
  }

  /**
   * Delete Document (with Category Count decrement)
   */
  static async deleteDocument(documentId: string) {
    const doc = await prisma.documents.findUnique({
      where: { id: documentId },
    });

    if (!doc) return null;
    
    // Delete all associated files
    await FileService.deleteFilesByTargetId(documentId);

    return prisma.$transaction(async (tx) => {
      await tx.documents.delete({ where: { id: documentId } });

      if (doc.category_id) {
        await tx.document_categories.update({
          where: { id: doc.category_id },
          data: { document_count: { decrement: 1 } },
        });
      }
    });
  }

  /**
   * Get Categories for a module
   */
  /**
   * Get Categories for a module
   * Returns a flattened list sorted by tree structure (Parent -> Children)
   */
  static async getCategories(moduleId: string) {
    const categories = await prisma.document_categories.findMany({
      where: { module_id: moduleId },
      orderBy: { list_order: "asc" },
    });

    const sortedCategories: typeof categories = [];
    const map = new Map<string | null, typeof categories>();

    // Group by parent_id
    for (const cat of categories) {
      const pid = cat.parent_id;
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(cat);
    }

    // Recursive traverse
    const traverse = (pid: string | null) => {
      const children = map.get(pid);
      if (children) {
        for (const child of children) {
          sortedCategories.push(child);
          traverse(child.id);
        }
      }
    };

    traverse(null);
    return sortedCategories;
  }

  /**
   * Create Category
   * UI/App manages the sequence logic.
   * Path: /seq/ or parent_path + seq/
   */
  static async createCategory({
    moduleId,
    name,
    parentId,
  }: {
    moduleId: string;
    name: string;
    parentId?: string | null;
  }) {
    // 1. Get Next Sequence (Max + 1)
    const maxSeqAgg = await prisma.document_categories.aggregate({
      _max: { seq: true },
    });
    const nextSeq = (maxSeqAgg._max.seq || 0) + 1;

    let path = `/${nextSeq}/`;
    let depth = 0;

    if (parentId) {
      const parent = await prisma.document_categories.findUnique({
        where: { id: parentId },
      });
      if (!parent) throw new Error("Parent category not found");
      path = `${parent.path || ""}${nextSeq}/`;
      depth = parent.depth + 1;
    }

    return prisma.document_categories.create({
      data: {
        module_id: moduleId,
        seq: nextSeq,
        name,
        path,
        depth,
        parent_id: parentId,
        list_order: nextSeq, // Default order to seq
      },
    });
  }

  /**
   * Update Category
   */
  static async updateCategory(
    categoryId: string,
    data: { name?: string; list_order?: number },
  ) {
    return prisma.document_categories.update({
      where: { id: categoryId },
      data,
    });
  }

  /**
   * Delete Category
   */
  static async deleteCategory(categoryId: string) {
    return prisma.document_categories.delete({
      where: { id: categoryId },
    });
  }

  /**
   * Reorder Category
   * Swaps list_order with the adjacent sibling.
   */
  static async reorderCategory(categoryId: string, direction: "up" | "down") {
    const category = await prisma.document_categories.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new Error("Category not found");

    // Find sibling in the same level (same parent)
    const where: Prisma.document_categoriesWhereInput = {
      module_id: category.module_id,
      parent_id: category.parent_id,
    };

    if (direction === "up") {
      // Find previous sibling (list_order < current)
      where.list_order = { lt: category.list_order };
    } else {
      // Find next sibling (list_order > current)
      where.list_order = { gt: category.list_order };
    }

    const sibling = await prisma.document_categories.findFirst({
      where,
      orderBy: { list_order: direction === "up" ? "desc" : "asc" },
    });

    if (sibling) {
      // Swap list_order
      await prisma.$transaction([
        prisma.document_categories.update({
          where: { id: category.id },
          data: { list_order: sibling.list_order },
        }),
        prisma.document_categories.update({
          where: { id: sibling.id },
          data: { list_order: category.list_order },
        }),
      ]);
    }
  }

  /**
   * Get Vote Status for Document and Comments
   */
  static async getVoteStatus({
    documentId,
    commentIds = [],
    userId,
  }: {
    documentId: string;
    commentIds?: string[];
    userId: string;
  }) {
    // Document Votes
    // Ensure prisma is imported. (It is at top)
    const docVotes = await prisma.document_vote_log.findMany({
        where: {
            document_id: documentId,
            user_id: userId,
            vote_type: { in: ["LIKE", "BLAME"] },
        },
    });
    
    const hasLiked = docVotes.some((v) => v.vote_type === "LIKE");
    const hasBlamed = docVotes.some((v) => v.vote_type === "BLAME");

    // Comment Votes
    let likedCommentIds: string[] = [];
    if (commentIds.length > 0) {
        const commentVotes = await prisma.comment_vote_log.findMany({
            where: {
                comment_id: { in: commentIds },
                user_id: userId,
                vote_type: "LIKE",
            },
            select: { comment_id: true },
        });
        likedCommentIds = commentVotes.map((v) => v.comment_id);
    }

    return { hasLiked, hasBlamed, likedCommentIds };
  }

  // --- Board Templates ---

  static async getTemplates(moduleId: string) {
    return prisma.board_templates.findMany({
      where: { module_id: moduleId },
      orderBy: { list_order: "asc" },
    });
  }

  static async getTemplate(id: string) {
    return prisma.board_templates.findUnique({
      where: { id },
    });
  }

  static async createTemplate({
    moduleId,
    name,
    content,
    listOrder = 0,
  }: {
    moduleId: string;
    name: string;
    content: string;
    listOrder?: number;
  }) {
    return prisma.board_templates.create({
      data: {
        module_id: moduleId,
        name,
        content,
        list_order: listOrder,
      },
    });
  }

  static async updateTemplate(
    id: string,
    data: { name?: string; content?: string; listOrder?: number }
  ) {
    return prisma.board_templates.update({
      where: { id },
      data: {
        name: data.name,
        content: data.content,
        list_order: data.listOrder,
      },
    });
  }

  static async deleteTemplate(id: string) {
    return prisma.board_templates.delete({
      where: { id },
    });
  }
}

