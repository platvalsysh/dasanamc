import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { configManager } from "@repo/core/server";
import { Save } from "lucide-react";

interface AppearanceConfig {
  theme: "light" | "dark" | "system";
  primaryColor: string;
  fontFamily: string;
  sidebarCollapsed: boolean;
}

const DEFAULT_CONFIG: AppearanceConfig = {
  theme: "light",
  primaryColor: "#3b82f6",
  fontFamily: "Inter",
  sidebarCollapsed: false,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const config = await configManager.get<AppearanceConfig>(
    "site",
    "appearance",
    DEFAULT_CONFIG,
  );
  return { config };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const newConfig: AppearanceConfig = {
    theme: formData.get("theme") as "light" | "dark" | "system",
    primaryColor: formData.get("primaryColor") as string,
    fontFamily: formData.get("fontFamily") as string,
    sidebarCollapsed: formData.get("sidebarCollapsed") === "true",
  };

  await configManager.set(
    "site",
    "appearance",
    newConfig,
    "Appearance settings",
  );

  return { success: true, config: newConfig };
};

export default function AppearanceSettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentConfig = actionData?.config || config;

  return (
    <Form method="post" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">테마 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              테마 모드
            </label>
            <select
              name="theme"
              defaultValue={currentConfig.theme}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">라이트 모드</option>
              <option value="dark">다크 모드</option>
              <option value="system">시스템 설정 따름</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              글꼴 (Font Family)
            </label>
            <input
              type="text"
              name="fontFamily"
              defaultValue={currentConfig.fontFamily}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기본 색상 (Primary Color)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="primaryColor"
                defaultValue={currentConfig.primaryColor}
                className="h-10 w-20 p-1 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="primaryColorText"
                value={currentConfig.primaryColor}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">레이아웃</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">사이드바 닫힘 기본값</p>
            <p className="text-sm text-gray-600">
              로그인 시 사이드바가 닫힌 상태로 시작합니다
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="sidebarCollapsed"
              value="true"
              defaultChecked={currentConfig.sidebarCollapsed}
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
