import { prisma, type Prisma } from "@repo/database";

export class ModulesService {
  static async getModules(
    cond: {
      moduleName?: string;
      searchKeyword?: string;
    },
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.modulesWhereInput = {};
    
    if (cond.moduleName) {
      where.module = cond.moduleName;
    }

    where.AND = [];
    if (cond.searchKeyword) {
      where.AND.push({ mid: { contains: cond.searchKeyword, mode: "insensitive" } });
    }

    const [total, data] = await Promise.all([
      prisma.modules.count({ where }),
      prisma.modules.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getModule(id: string) {
    return prisma.modules.findUnique({
      where: { id },
    });
  }

  static async createModule(data: {
    module: string;
    mid: string;
    browser_title?: string;
    extra_vars?: Prisma.InputJsonValue;
  }) {
    return prisma.modules.create({
      data: {
        module: data.module,
        mid: data.mid,
        browser_title: data.browser_title,
        extra_vars: data.extra_vars ?? {},
      },
    });
  }

  static async updateModule(
    id: string,
    data: {
      mid: string;
      browser_title?: string;
      extra_vars?: Prisma.InputJsonValue;
    },
  ) {
    return prisma.modules.update({
      where: { id },
      data: {
        mid: data.mid,
        browser_title: data.browser_title,
        extra_vars: data.extra_vars ?? {},
      },
    });
  }

  static async updateModuleExtraVars(
    id: string,
    extra_vars: Prisma.InputJsonValue,
  ) {
    return prisma.modules.update({
      where: { id },
      data: {
        extra_vars,
      },
    });
  }

  static async deleteModule(id: string) {
    return prisma.$transaction(async (tx) => {
      const currentModule = await tx.modules.findUnique({
        where: { id },
      });

      if (!currentModule) {
        throw new Error("Module not found");
      }

      // Insert into deleted_modules
      await tx.deleted_modules.create({
        data: {
          module_id: currentModule.id,
          module: currentModule.module,
          mid: currentModule.mid,
          payload: currentModule as unknown as Prisma.InputJsonValue,
        },
      });

      // Delete from modules
      await tx.modules.delete({
        where: { id },
      });
    });
  }
}
