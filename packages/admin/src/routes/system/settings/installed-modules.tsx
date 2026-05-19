import { type RouteConfigEntry } from "@react-router/dev/routes";
import { moduleManager } from "@repo/core/server";
import { prisma } from "@repo/database";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui-admin";
import { AlertTriangle, Check, RefreshCw, X } from "lucide-react";
import { type ActionFunctionArgs, useFetcher, useLoaderData } from "react-router";

// Helper to analyze file content for exports
const analyzeFile = async (filePath: string): Promise<string[]> => {
  try {
    const module = await import(/* @vite-ignore */ filePath);
    const methods: string[] = [];
    if (module.loader || module.default) methods.push("GET");
    if (module.action) methods.push("POST");
    return methods;
  } catch (error) {
    return ["GET"];
  }
};

// Helper to flatten routes
const flattenRoutes = async (
  routes: RouteConfigEntry[],
  parentId: string = "",
  parentPath: string = "",
): Promise<{ methods: string[]; path: string }[]> => {
  const results: { methods: string[]; path: string }[] = [];
  for (const route of routes) {
    const currentPath = route.path
      ? parentPath
        ? `${parentPath}/${route.path}`.replace(/\/+/g, "/")
        : route.path
      : parentPath;
    const id = route.id || `${parentId}/${route.path || (route.index ? "index" : "layout")}`;
    const isLayout = !route.path && !route.index;
    const children = route.children
      ? await flattenRoutes(route.children, id, currentPath)
      : [];
    if (!isLayout && route.file) {
      const methods = await analyzeFile(route.file);
      results.push({ path: currentPath || "/", methods });
    }
    results.push(...children);
  }
  return results;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const moduleName = formData.get("module") as string;

  if (intent === "syncModule" && moduleName) {
    await moduleManager.syncModule(moduleName);
    return { success: true, message: `Synced module: ${moduleName}` };
  }
  
  if (intent === "syncAll") {
    await moduleManager.syncWithDatabase();
    return { success: true, message: `Synced all modules` };
  }
  
  return { success: false };
};

export const loader = async () => {
  const modules = moduleManager.getModules();
  
  // Fetch DB state — deactivated 권한은 제외 (모듈이 더 이상 선언하지 않는 것)
  const dbPermissions = await prisma.admin_permissions.findMany({
    where: { deactivated_at: null },
  });
  const dbRoles = await prisma.admin_roles.findMany({
    include: {
      admin_role_permissions: {
        include: { admin_permissions: true }
      }
    }
  });

  const processedModules = await Promise.all(
    Object.values(modules).map(async (module) => {
      // Compare Permissions
      const permissionsStatus = (module.permissions || []).map(p => {
        const dbP = dbPermissions.find(dp => dp.name === p.name);
        let status = "MISSING_IN_DB";
        if (dbP) {
           status = "MATCH";
           
           // Check if category matches module name
           if (dbP.category !== module.name) {
             status = "MISMATCH";
           }
        }
        return { code: p, db: dbP, status };
      });

      // Compare Roles
      const rolesStatus = (module.roles || []).map(r => {
        const dbR = dbRoles.find(dr => dr.name === r.name);
        const codePerms = new Set(r.permission_names || []);
        
        let status = "MISSING_IN_DB";
        let dbPerms: string[] = [];
        
        if (dbR) {
          status = "MATCH";
          dbPerms = dbR.admin_role_permissions.map(arp => arp.admin_permissions.name);
          const dbPermsSet = new Set(dbPerms);
          
          // Check for mismatch in attached permissions
          const codeHasExtra = [...codePerms].some(p => !dbPermsSet.has(p));
          const dbHasExtra = dbPerms.some(p => !codePerms.has(p));
          
          if (codeHasExtra || dbHasExtra) {
            status = "MISMATCH";
          }
        }
        return { code: r, db: dbR, status, dbPerms };
      });


      return {
        name: module.name,
        permissions: permissionsStatus,
        roles: rolesStatus,
        flatRoutes: {
          admin: await flattenRoutes(module.routes?.admin || []),
          public: await flattenRoutes(module.routes?.public || []),
          api: await flattenRoutes(module.routes?.api || []),
        },
      };
    })
  );

  return { modules: processedModules };
};

function StatusIcon({ status }: { status: string }) {
  if (status === "MATCH") return <Check className="w-4 h-4 text-green-500" />;
  if (status === "MISMATCH") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  if (status === "MISSING_IN_DB") return <X className="w-4 h-4 text-red-500" />;
  return null;
}

function RoutesView({ routes, type }: { routes: any[], type: string }) {
    if (!routes.length) return null;
    return (
        <div className="mb-4">
             <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{type}</h4>
             <div className="space-y-1">
                {routes.map((route, idx) => (
                    <div key={idx} className="flex gap-2 text-xs bg-gray-50 p-1.5 rounded">
                        <span className="font-mono flex-1">{route.path}</span>
                        <div className="flex gap-1">
                            {route.methods.map((m: string) => (
                                <Badge key={m} variant="outline" className="px-1 py-0 h-4 text-[10px]">{m}</Badge>
                            ))}
                        </div>
                    </div>
                ))}
             </div>
        </div>
    )
}

export default function InstalledModules() {
  const { modules } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // Check if any module needs sync
  const globalHasChanges = modules.some(m => 
    m.permissions.some(p => p.status !== "MATCH") || 
    m.roles.some(r => r.status !== "MATCH")
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">설치된 모듈</h2>
          <p className="text-sm text-gray-500 mt-1">
            서버에 등록된 모듈의 상세 정보와 데이터베이스 동기화 상태를 확인합니다.
          </p>
        </div>
        <fetcher.Form method="post">
            <input type="hidden" name="intent" value="syncAll" />
            <Button 
                variant={globalHasChanges ? "default" : "outline"}
                disabled={fetcher.state !== "idle" || !globalHasChanges}
                className="gap-2"
            >
                <RefreshCw className={`w-4 h-4 ${fetcher.state !== "idle" ? "animate-spin" : ""}`} />
                전체 모듈 동기화
            </Button>
        </fetcher.Form>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {modules.map((module) => {
          const hasChanges = 
            module.permissions.some(p => p.status !== "MATCH") || 
            module.roles.some(r => r.status !== "MATCH");

          return (
            <Card key={module.name} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      {module.name}
                      {hasChanges && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Update Required
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                        System Module
                    </CardDescription>
                  </div>
                  <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="syncModule" />
                      <input type="hidden" name="module" value={module.name} />
                      <Button 
                          size="sm" 
                          variant={hasChanges ? "default" : "secondary"}
                          disabled={fetcher.state !== "idle" || !hasChanges}
                          className="gap-2"
                      >
                          <RefreshCw className={`w-3 h-3 ${fetcher.state !== "idle" && fetcher.formData?.get('module') === module.name ? "animate-spin" : ""}`} />
                          모듈 동기화
                      </Button>
                  </fetcher.Form>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x">
                     {/* Routes */}
                     <div className="p-6">
                          <h3 className="font-medium mb-4 flex items-center gap-2">Routes</h3>
                          <div className="h-[300px] w-full rounded border p-4 overflow-y-auto">
                              <RoutesView routes={module.flatRoutes.admin} type="Admin" />
                              <RoutesView routes={module.flatRoutes.public} type="Public" />
                              <RoutesView routes={module.flatRoutes.api} type="API" />
                              {!module.flatRoutes.admin.length && !module.flatRoutes.public.length && !module.flatRoutes.api.length && (
                                  <p className="text-gray-400 text-sm">No routes defined.</p>
                              )}
                          </div>
                     </div>
  
                     {/* Permissions */}
                     <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium flex items-center gap-2">Permissions ({module.permissions.length})</h3>
                          </div>
                          <div className="border rounded overflow-hidden">
                              <Table>
                                  <TableHeader>
                                      <TableRow className="text-xs hover:bg-transparent">
                                          <TableHead className="h-8">Code</TableHead>
                                          <TableHead className="h-8 w-[80px] text-center">DB</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {module.permissions.map((item, idx) => (
                                          <TableRow key={idx}>
                                              <TableCell className="py-2">
                                                  <div className="font-medium text-sm">{item.code.name}</div>
                                                  <div className="text-xs text-gray-500">{item.code.display_name}</div>
                                              </TableCell>
                                              <TableCell className="py-2 text-center">
                                                  <div className="flex justify-center" title={item.status}>
                                                      <StatusIcon status={item.status} />
                                                  </div>
                                              </TableCell>
                                          </TableRow>
                                      ))}
                                      {module.permissions.length === 0 && (
                                          <TableRow>
                                              <TableCell colSpan={2} className="text-center text-gray-400 py-4">No permissions</TableCell>
                                          </TableRow>
                                      )}
                                  </TableBody>
                              </Table>
                          </div>
                     </div>
  
                     {/* Roles */}
                     <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium flex items-center gap-2">Roles ({module.roles.length})</h3>
                          </div>
                           <div className="border rounded overflow-hidden">
                              <Table>
                                  <TableHeader>
                                      <TableRow className="text-xs hover:bg-transparent">
                                          <TableHead className="h-8">Role & Permissions</TableHead>
                                          <TableHead className="h-8 w-[80px] text-center">DB</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {module.roles.map((item, idx) => (
                                          <TableRow key={idx}>
                                              <TableCell className="py-2">
                                                  <div className="font-medium text-sm">{item.code.name}</div>
                                                  <div className="text-xs text-gray-500 mb-1">{item.code.display_name}</div>
                                                  <div className="flex flex-wrap gap-1">
                                                      {(item.code.permission_names || []).map(p => {
                                                          const inDb = item.dbPerms.includes(p);
                                                          return (
                                                              <Badge key={p} variant="secondary" className={`text-[10px] px-1 py-0 h-4 ${!inDb && item.db ? 'text-red-500' : ''}`}>
                                                                  {p}
                                                              </Badge>
                                                          )
                                                      })}
                                                  </div>
                                              </TableCell>
                                              <TableCell className="py-2 text-center align-top">
                                                  <div className="flex justify-center mt-1" title={item.status}>
                                                      <StatusIcon status={item.status} />
                                                  </div>
                                              </TableCell>
                                          </TableRow>
                                      ))}
                                      {module.roles.length === 0 && (
                                          <TableRow>
                                              <TableCell colSpan={2} className="text-center text-gray-400 py-4">No roles</TableCell>
                                          </TableRow>
                                      )}
                                  </TableBody>
                              </Table>
                          </div>
                     </div>
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
