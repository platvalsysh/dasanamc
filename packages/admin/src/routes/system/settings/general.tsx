import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { configManager } from "@repo/core/server";
import { Save } from "lucide-react";
import { NotImplementedBanner } from "../../../components/NotImplementedBanner";

interface GeneralConfig {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

const DEFAULT_CONFIG: GeneralConfig = {
  siteName: "",
  siteUrl: "",
  adminEmail: "",
  timezone: "Asia/Seoul",
  language: "ko",
  maintenanceMode: false,
  registrationEnabled: true,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const config = await configManager.get<GeneralConfig>(
    "site",
    "general",
    DEFAULT_CONFIG,
  );
  return { config };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const maintenanceMode = formData.get("maintenanceMode") === "true";
  const registrationEnabled = formData.get("registrationEnabled") === "true";

  const newConfig: GeneralConfig = {
    siteName: formData.get("siteName") as string,
    siteUrl: formData.get("siteUrl") as string,
    adminEmail: formData.get("adminEmail") as string,
    timezone: formData.get("timezone") as string,
    language: formData.get("language") as string,
    maintenanceMode,
    registrationEnabled,
  };

  await configManager.set(
    "site",
    "general",
    newConfig,
    "General site settings",
  );

  return { success: true, config: newConfig };
};

export default function GeneralSettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Use actionData if available (optimistic UI), otherwise loader data
  const currentConfig = actionData?.config || config;

  return (
    <Form method="post" className="space-y-6">
      <NotImplementedBanner feature="일반 설정 (siteName, siteUrl 등)" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사이트 이름
            </label>
            <input
              type="text"
              name="siteName"
              defaultValue={currentConfig.siteName}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사이트 URL
            </label>
            <input
              type="url"
              name="siteUrl"
              defaultValue={currentConfig.siteUrl}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              관리자 이메일
            </label>
            <input
              type="email"
              name="adminEmail"
              defaultValue={currentConfig.adminEmail}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              타임존
            </label>
            <select
              name="timezone"
              defaultValue={currentConfig.timezone}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Seoul">Asia/Seoul (KST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기본 언어
            </label>
            <select
              name="language"
              defaultValue={currentConfig.language}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          사이트 설정
        </h3>
        <div className="space-y-4">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">유지보수 모드</p>
              <p className="text-sm text-gray-600">
                사이트를 일시적으로 비활성화합니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="maintenanceMode"
                value="true"
                defaultChecked={currentConfig.maintenanceMode}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Registration Enabled */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">신규 가입 허용</p>
              <p className="text-sm text-gray-600">
                새로운 사용자의 회원가입을 허용합니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="registrationEnabled"
                value="true"
                defaultChecked={currentConfig.registrationEnabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
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
