import {
  Form,
  useLoaderData,
  useActionData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data as response,
} from "react-router";
import { prisma } from "@repo/database";
import { configManager } from "@repo/core/server";
import { useAuthServerContext } from "@repo/auth/server";
import { useState } from "react";
import { GroupPermissionSelector } from "../components/GroupPermissionSelector";
import { Button } from "@repo/ui-admin";

export async function loader({ context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  // Check permission? Maybe 'bxmember.setting' or generic 'admin.access'
  // For now, assuming anyone who can access admin routes can see this, or add specific check.
  // if (!auth.checkPermissions(["bxmember.setting"])) throw new Response("Forbidden", { status: 403 });

  const [roles, config] = await Promise.all([
    prisma.admin_roles.findMany({
      orderBy: { level: "asc" },
    }),
    configManager.getModule<{ roles: string[] }>("bxmember", "public_access", {
      roles: [],
    }),
  ]);

  return { roles, config };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  // if (!auth.checkPermissions(["bxmember.setting"])) return response({ success: false, error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const rolesJson = formData.get("roles") as string;
  let roles: string[] = [];
  try {
      roles = JSON.parse(rolesJson);
  } catch (e) {
      return response({ success: false, error: "Invalid data" }, { status: 400 });
  }

  await configManager.setModule(
    "bxmember",
    "public_access",
    { roles },
    "Public access control for bxmember list"
  );

  return response({ success: true, error: undefined });
}

export default function SettingsPage() {
  const { roles, config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(config.roles || []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">동문회원 설정</h1>
      </div>

      {actionData?.success && (
        <div className="p-4 bg-green-50 text-green-700">
          설정이 저장되었습니다.
        </div>
      )}
      
      {actionData?.error && (
        <div className="p-4 bg-red-50 text-red-700">
          오류가 발생했습니다: {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">접근 권한 설정</h2>
          <p className="text-sm text-gray-500 mb-6">
            동문회원 목록(Public)에 접근할 수 있는 그룹을 선택하세요.
          </p>
          
          <GroupPermissionSelector
            label="접근 허용 그룹"
            roles={roles}
            selectedRoles={selectedRoles}
            onChange={setSelectedRoles}
          />
          <input type="hidden" name="roles" value={JSON.stringify(selectedRoles)} />
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            저장
          </Button>
        </div>
      </Form>
    </div>
  );
}
