import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { configManager } from "@repo/core/server";
import { Save } from "lucide-react";

interface NotificationConfig {
  emailAlerts: boolean;
  systemAlerts: boolean;
  browserNotifications: boolean;
  slackWebhookUrl: string;
}

const DEFAULT_CONFIG: NotificationConfig = {
  emailAlerts: true,
  systemAlerts: true,
  browserNotifications: false,
  slackWebhookUrl: "",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const config = await configManager.get<NotificationConfig>(
    "site",
    "notifications",
    DEFAULT_CONFIG,
  );
  return { config };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const newConfig: NotificationConfig = {
    emailAlerts: formData.get("emailAlerts") === "true",
    systemAlerts: formData.get("systemAlerts") === "true",
    browserNotifications: formData.get("browserNotifications") === "true",
    slackWebhookUrl: formData.get("slackWebhookUrl") as string,
  };

  await configManager.set(
    "site",
    "notifications",
    newConfig,
    "Notification settings",
  );

  return { success: true, config: newConfig };
};

export default function NotificationSettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentConfig = actionData?.config || config;

  return (
    <Form method="post" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 채널</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">이메일 알림</p>
              <p className="text-sm text-gray-600">
                주요 이벤트 발생 시 관리자 이메일로 알림을 보냅니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="emailAlerts"
                value="true"
                defaultChecked={currentConfig.emailAlerts}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">시스템 내부 알림</p>
              <p className="text-sm text-gray-600">
                관리자 대시보드 내 알림 센터에 메시지를 표시합니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="systemAlerts"
                value="true"
                defaultChecked={currentConfig.systemAlerts}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">브라우저 푸시 알림</p>
              <p className="text-sm text-gray-600">
                브라우저 권한 허용 시 데스크탑 푸시 알림을 발송합니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="browserNotifications"
                value="true"
                defaultChecked={currentConfig.browserNotifications}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">외부 연동</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slack Webhook URL
          </label>
          <input
            type="url"
            name="slackWebhookUrl"
            defaultValue={currentConfig.slackWebhookUrl}
            placeholder="https://hooks.slack.com/services/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            주요 시스템 이벤트를 Slack 채널로 전송하려면 Webhook URL을
            입력하세요.
          </p>
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
