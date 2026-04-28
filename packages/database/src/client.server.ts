import { type Prisma, PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { DATABASE_URL } from "@repo/env/server";

const adapter = new PrismaPg({
  connectionString: DATABASE_URL
});

const color = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
};

function makePrismaClient() {
  const DATABASE_DEBUG = process.env.DATABASE_DEBUG === "1";
  const prisma = new PrismaClient({
    adapter,
    log:
      DATABASE_DEBUG
        ? [
          {
            emit: 'event',
            level: 'query',
          },
          // 'query', 
          'info' , "error", "warn"]
        : ["error"],
  });
  if (DATABASE_DEBUG) {
    prisma.$on('query', (event: Prisma.QueryEvent) => {
      let query = event.query;
      try {
        const params = JSON.parse(event.params);
        query = query.replace(/\$(\d+)/g, (_, number) => {
          const value = params[Number(number) - 1];
          return typeof value === 'string' ? `'${value}'` : String(value);
        });
      } catch {
        // ignore
      }
      
      // Remove newlines and reduce multiple spaces
      query = query.replace(/\s+/g, ' ').trim();
      
      console.log(`${color.blue('prisma:query')} ${query}  ${color.gray(`${event.duration.toFixed(3)}ms`)} `);
    });
  }

  return prisma;
}

function getPrismaClient() {
  // Use globalThis for broader environment compatibility
  /**
   * globalForPrisma를 사용하는 주된 이유는 개발 환경(Development)에서의 핫 리로딩(Hot Module Replacement) 때문입니다.
   *
   * 1. 서버 재시작 방지: 개발 중 파일(코드)을 수정하고 저장하면 프레임워크가 변경된 모듈만 다시 로드합니다. 이때 이 파일도 다시 실행됩니다.
   * 2. DB 연결 폭주 방지: 이 파일이 다시 실행될 때마다 new PrismaClient()가 호출되면, DB 연결 개수 제한(Connection Limit)을 초과하여 "Too many connections" 에러가 발생할 수 있습니다.
   * 3. 해결책 (Singleton Pattern): globalThis에 이미 생성된 인스턴스가 있는지 확인하고 재사용함으로써, 개발 중에 서버 코드가 수십 번 다시 로드되어도 실제 Prisma Client(DB 연결)는 하나만 유지되도록 보장합니다.
   */
  const globalForPrisma = globalThis as typeof globalThis & {
    prisma?: ReturnType<typeof makePrismaClient>;
  };
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const prisma = makePrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
  return prisma;
}

export const prisma = getPrismaClient();

export type PrismaClientType = typeof prisma;

