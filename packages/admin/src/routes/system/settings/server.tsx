import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { configManager } from "@repo/core/server";
import { Save } from "lucide-react";

interface ServerConfig {
  logLevel: "debug" | "info" | "warn" | "error";
  maxUploadSizeMb: number;
  enableGzip: boolean;
  sessionTimeoutMinutes: number;
}

const DEFAULT_CONFIG: ServerConfig = {
  logLevel: "info",
  maxUploadSizeMb: 10,
  enableGzip: true,
  sessionTimeoutMinutes: 60,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const config = await configManager.get<ServerConfig>(
    "site",
    "server",
    DEFAULT_CONFIG,
  );
  return { config };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const newConfig: ServerConfig = {
    logLevel: formData.get("logLevel") as "debug" | "info" | "warn" | "error",
    maxUploadSizeMb: parseInt(formData.get("maxUploadSizeMb") as string) || 10,
    enableGzip: formData.get("enableGzip") === "true",
    sessionTimeoutMinutes:
      parseInt(formData.get("sessionTimeoutMinutes") as string) || 60,
  };

  await configManager.set(
    "site",
    "server",
    newConfig,
    "Server configuration settings",
  );

  return { success: true, config: newConfig };
};

export default function ServerSettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentConfig = actionData?.config || config;

  return (
    <Form method="post" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">서버 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              로그 레벨 (Log Level)
            </label>
            <select
              name="logLevel"
              defaultValue={currentConfig.logLevel}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 업로드 크기 (MB)
            </label>
            <input
              type="number"
              name="maxUploadSizeMb"
              defaultValue={currentConfig.maxUploadSizeMb}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              세션 만료 시간 (분)
            </label>
            <input
              type="number"
              name="sessionTimeoutMinutes"
              defaultValue={currentConfig.sessionTimeoutMinutes}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Gzip 압축 활성화</p>
            <p className="text-sm text-gray-600">
              응답 데이터를 압축하여 전송 속도를 높입니다
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="enableGzip"
              value="true"
              defaultChecked={currentConfig.enableGzip}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "저장 중..." : "변경사항 저장"}
        </button>
      </div>
    </Form>
  );
}
