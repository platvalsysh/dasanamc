#!/usr/bin/env node
// pnpm new:module <name>  — packages/module-example 을 복제하여 새 모듈 생성

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const name = process.argv[2];
if (!name) {
  console.error("사용법: pnpm new:module <name>");
  console.error("예시:  pnpm new:module faq");
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("이름은 소문자/숫자/하이픈만 사용 (예: blog, my-feature)");
  process.exit(1);
}

const SRC = path.join(ROOT, "packages", "module-example");
const DST = path.join(ROOT, "packages", `module-${name}`);

if (fs.existsSync(DST)) {
  console.error(`이미 존재합니다: ${DST}`);
  process.exit(1);
}
if (!fs.existsSync(SRC)) {
  console.error(`소스를 찾을 수 없습니다: ${SRC}`);
  process.exit(1);
}

const SKIP_DIRS = new Set(["node_modules", ".turbo", "dist", "build", ".react-router"]);

function copyRec(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue;
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyRec(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyRec(SRC, DST);

const cap = name[0].toUpperCase() + name.slice(1).replaceAll("-", "");
const upper = name.toUpperCase().replaceAll("-", "_");

function replaceInFile(file) {
  let txt = fs.readFileSync(file, "utf8");
  txt = txt
    .replaceAll("@repo/module-example", `@repo/module-${name}`)
    .replaceAll("module-example", `module-${name}`)
    .replaceAll('createModule("example")', `createModule("${name}")`)
    .replaceAll("example.", `${name}.`)
    .replaceAll("/example", `/${name}`)
    .replaceAll("ROLE_EXAMPLE", `ROLE_${upper}`)
    .replaceAll("Example", cap);
  fs.writeFileSync(file, txt);
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx|json|md)$/.test(e.name)) replaceInFile(p);
  }
}
walk(DST);

console.log(`생성 완료: packages/module-${name}`);
console.log("");
console.log("다음 단계:");
console.log(`  1. apps/web/app/modules.server.ts 에 추가:`);
console.log(`     import { module as ${name.replaceAll("-", "_")} } from "@repo/module-${name}/module";`);
console.log(`     export const modules = [..., ${name.replaceAll("-", "_")}];`);
console.log(`  2. pnpm install`);
console.log(`  3. pnpm typecheck`);
