import { type RouteConfigEntry } from "@react-router/dev/routes";
import Path from "path";
import fs from "fs";

function createRouteId(file: string) {
  return Path.normalize(stripFileExtension(file));
}

function stripFileExtension(file: string) {
  return file.replace(/\.[a-z0-9]+$/i, "");
}

type RouteManifestItem = {
  id: string;
  parentId: string | undefined;
  file: string;
  path: string | undefined;
  index: boolean | undefined;
  caseSensitive: boolean | undefined;
};

export function configRoutesToRouteManifest(routes: RouteConfigEntry[]) {
  const routeManifest: Record<string, RouteManifestItem> = {};
  const rootDirectory = findProjectRoot(process.cwd());
  const appDirectory = Path.join(rootDirectory, "apps/web/app");

  function walk(route: RouteConfigEntry, parentId?: string) {
    let id = route.id || createRouteId(route.file);
    const manifestItem: RouteManifestItem = {
      id,
      parentId,
      file: Path.isAbsolute(route.file)
        ? Path.relative(appDirectory, route.file)
        : route.file,
      path: route.path,
      index: route.index,
      caseSensitive: route.caseSensitive,
    };

    if (routeManifest.hasOwnProperty(id)) {
      throw new Error(
        `Unable to define routes with duplicate route id: "${id}"`,
      );
    }
    routeManifest[id] = manifestItem;

    if (route.children) {
      for (let child of route.children) {
        walk(child, id);
      }
    }
  }

  for (let route of routes) {
    walk(route);
  }

  return routeManifest;
}

/**
 * Find the project root directory by looking for pnpm-workspace.yaml
 */
function findProjectRoot(startDir: string): string {
  let currentDir = startDir;
  while (true) {
    if (fs.existsSync(Path.join(currentDir, "pnpm-workspace.yaml"))) {
      return currentDir;
    }
    const parentDir = Path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(
        "Could not find project root (pnpm-workspace.yaml not found)",
      );
    }
    currentDir = parentDir;
  }
}

/**
 * 같은 파일의 라우터가 있으면 오류 발생. 자동 id 부여.
 *
 * Unable to define routes with duplicate route id fix
 */
export function configRoutesFixId(routes: RouteConfigEntry[]): void {
  let idUseCount: Record<string, number> = {};
  const rootDirectory = findProjectRoot(process.cwd());
  const appDirectory = Path.join(rootDirectory, "apps/web/app");

  function walk(route: RouteConfigEntry, parentId?: string) {
    const realfile = Path.isAbsolute(route.file)
      ? route.file
      : Path.join(appDirectory, route.file);
    if (!fs.existsSync(realfile)) {
      throw new Error(
        `Cannot register route. The specified file does not exist: "${route.file}" (path: ${route.path}) (resolved: ${realfile})`,
      );
    }
    const file = Path.relative(rootDirectory, realfile);
    const id = route.id || createRouteId(file);
    let cnt = idUseCount[id] ?? 0;

    route.id = cnt > 0 ? `${id}__${cnt}` : id;
    idUseCount[id] = cnt + 1;

    if (route.children) {
      for (let child of route.children) {
        walk(child, id);
      }
    }
  }

  for (let route of routes) {
    walk(route);
  }
}
