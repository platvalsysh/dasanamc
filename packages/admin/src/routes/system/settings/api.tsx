import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { configManager } from "@repo/core/server";
import { Save } from "lucide-react";

interface ApiConfig {
  enablePublicApi: boolean;
  apiKeyExpirationDays: number;
  rateLimitPerMinute: number;
  googleMapsApiKey: string;
  openaiApiKey: string;
}

const DEFAULT_CONFIG: ApiConfig = {
  enablePublicApi: false,
  apiKeyExpirationDays: 365,
  rateLimitPerMinute: 60,
  googleMapsApiKey: "",
  openaiApiKey: "",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const config = await configManager.get<ApiConfig>(
    "site",
    "api",
    DEFAULT_CONFIG,
  );
  return { config };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const newConfig: ApiConfig = {
    enablePublicApi: formData.get("enablePublicApi") === "true",
    apiKeyExpirationDays:
      parseInt(formData.get("apiKeyExpirationDays") as string) || 365,
    rateLimitPerMinute:
      parseInt(formData.get("rateLimitPerMinute") as string) || 60,
    googleMapsApiKey: formData.get("googleMapsApiKey") as string,
    openaiApiKey: formData.get("openaiApiKey") as string,
  };

  await configManager.set(
    "site",
    "api",
    newConfig,
    "API configuration settings",
  );

  return { success: true, config: newConfig };
};

export default function ApiSettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentConfig = actionData?.config || config;

  return (
    <Form method="post" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          공개 API 설정
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">공개 API 활성화</p>
              <p className="text-sm text-gray-600">
                외부 애플리케이션이 API에 접근할 수 있도록 허용합니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enablePublicApi"
                value="true"
                defaultChecked={currentConfig.enablePublicApi}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API 키 만료 기간 (일)
              </label>
              <input
                type="number"
                name="apiKeyExpirationDays"
                defaultValue={currentConfig.apiKeyExpirationDays}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                분당 요청 제한 (Rate Limit)
              </label>
              <input
                type="number"
                name="rateLimitPerMinute"
                defaultValue={currentConfig.rateLimitPerMinute}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          외부 서비스 연동
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps API Key
            </label>
            <input
              type="text"
              name="googleMapsApiKey"
              defaultValue={currentConfig.googleMapsApiKey}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <input
              type="text"
              name="openaiApiKey"
              defaultValue={currentConfig.openaiApiKey}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
