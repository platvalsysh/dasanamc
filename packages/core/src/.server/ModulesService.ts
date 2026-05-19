import { prisma, type Prisma } from "@repo/database";
import { moduleManager } from "./ModuleManager";

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

  /**
   * 모듈 인스턴스를 삭제한다.
   *
   * 1. 원본 행을 `core.deleted_modules` 에 백업 + `core.modules` 에서 제거
   *    (트랜잭션)
   * 2. 트랜잭션 성공 후 모듈 정의의 `functions.delete` 훅을 호출 — 외부 자원
   *    (S3 파일, 첨부 documents 등) 정리. 훅이 실패해도 `deleted_modules` 행은
   *    남아있어 재시도 가능.
   *
   * 훅을 트랜잭션 밖에서 부르는 이유: 외부 시스템(S3 등) 호출은 commit 후에야
   * 안전. 또한 hook 실패가 modules 삭제를 rollback 시키면 deleted_modules 도
   * 같이 사라져 흔적이 안 남음.
   */
  static async deleteModule(id: string) {
    const deletedRow = await prisma.$transaction(async (tx) => {
      const currentModule = await tx.modules.findUnique({
        where: { id },
      });

      if (!currentModule) {
        throw new Error("Module not found");
      }

      // Insert into deleted_modules (백업) + 원본에서 제거
      const deleted = await tx.deleted_modules.create({
        data: {
          module_id: currentModule.id,
          module: currentModule.module,
          mid: currentModule.mid,
          payload: currentModule as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.modules.delete({
        where: { id },
      });

      return deleted;
    });

    // 트랜잭션 밖에서 모듈 정의의 정리 훅 호출
    const moduleDef = moduleManager.getModule(deletedRow.module);
    if (moduleDef?.functions?.delete) {
      try {
        await moduleDef.functions.delete(deletedRow);
      } catch (e) {
        console.error(
          `[ModulesService.deleteModule] functions.delete hook failed for module=${deletedRow.module}, instance=${deletedRow.mid}:`,
          e,
        );
        // 훅 실패는 호출자에게 다시 던지지 않음 — 백업 행이 남아있어 admin UI
        // 또는 retry job 으로 재시도 가능.
      }
    }
  }
}
