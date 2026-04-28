import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { configManager } from "@repo/core/server";
import { Save, AlertCircle } from "lucide-react";

interface SecurityConfig {
  emailVerification: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: string;
  maxUploadSize: string;
}

const DEFAULT_CONFIG: SecurityConfig = {
  emailVerification: true,
  twoFactorAuth: false,
  sessionTimeout: "30",
  maxUploadSize: "100",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const config = await configManager.get<SecurityConfig>(
    "site",
    "security",
    DEFAULT_CONFIG,
  );
  return { config };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const emailVerification = formData.get("emailVerification") === "true";
  const twoFactorAuth = formData.get("twoFactorAuth") === "true";

  const newConfig: SecurityConfig = {
    emailVerification,
    twoFactorAuth,
    sessionTimeout: formData.get("sessionTimeout") as string,
    maxUploadSize: formData.get("maxUploadSize") as string,
  };

  await configManager.set("site", "security", newConfig, "Security settings");

  return { success: true, config: newConfig };
};

export default function SecuritySettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentConfig = actionData?.config || config;

  return (
    <Form method="post" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">인증 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">이메일 인증</p>
              <p className="text-sm text-gray-600">
                회원가입 시 이메일 인증을 요구합니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="emailVerification"
                value="true"
                defaultChecked={currentConfig.emailVerification}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">2단계 인증</p>
              <p className="text-sm text-gray-600">
                추가 보안을 위한 2단계 인증을 활성화합니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="twoFactorAuth"
                value="true"
                defaultChecked={currentConfig.twoFactorAuth}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">세션 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              세션 타임아웃 (분)
            </label>
            <input
              type="number"
              name="sessionTimeout"
              defaultValue={currentConfig.sessionTimeout}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 업로드 크기 (MB)
            </label>
            <input
              type="number"
              name="maxUploadSize"
              defaultValue={currentConfig.maxUploadSize}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-900">보안 권장사항</p>
            <p className="text-sm text-yellow-700 mt-1">
              강력한 비밀번호 정책과 정기적인 보안 업데이트를 권장합니다. SSL
              인증서가 올바르게 설치되어 있는지 확인하세요.
            </p>
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
