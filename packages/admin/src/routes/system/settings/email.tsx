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
import { requireSettingsView, requireSettingsEdit } from "../../../utils/admin-guard";

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSecure: boolean;
  senderName: string;
  senderEmail: string;
}

const DEFAULT_CONFIG: EmailConfig = {
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "",
  smtpSecure: true,
  senderName: "",
  senderEmail: "",
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  requireSettingsView(context);
  const config = await configManager.get<EmailConfig>(
    "site",
    "email",
    DEFAULT_CONFIG,
  );
  // Don't expose password in loader if we had one.
  return { config };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  requireSettingsEdit(context);
  const formData = await request.formData();

  const newConfig: EmailConfig = {
    smtpHost: formData.get("smtpHost") as string,
    smtpPort: parseInt(formData.get("smtpPort") as string) || 587,
    smtpUser: formData.get("smtpUser") as string,
    smtpSecure: formData.get("smtpSecure") === "true",
    senderName: formData.get("senderName") as string,
    senderEmail: formData.get("senderEmail") as string,
  };

  // Note: Password usually should be handled separately or encrypted,
  // but if kept in config, we would merge it.
  // For now assuming SMTP config without password field in this generic UI or managed via ENV.
  // Or if user wants password field, we can add it but be careful about returning it.

  await configManager.set("site", "email", newConfig, "Email service settings");

  return { success: true, config: newConfig };
};

export default function EmailSettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentConfig = actionData?.config || config;

  return (
    <Form method="post" className="space-y-6">
      <NotImplementedBanner feature="이메일 발송 (SMTP)" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          발신자 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              발신자 이름
            </label>
            <input
              type="text"
              name="senderName"
              defaultValue={currentConfig.senderName}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              발신자 이메일
            </label>
            <input
              type="email"
              name="senderEmail"
              defaultValue={currentConfig.senderEmail}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP 호스트
            </label>
            <input
              type="text"
              name="smtpHost"
              defaultValue={currentConfig.smtpHost}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP 포트
            </label>
            <input
              type="number"
              name="smtpPort"
              defaultValue={currentConfig.smtpPort}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP 사용자 (ID)
            </label>
            <input
              type="text"
              name="smtpUser"
              defaultValue={currentConfig.smtpUser}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">보안 연결 (SSL/TLS)</p>
            <p className="text-sm text-gray-600">
              이메일 전송 시 암호화된 연결을 사용합니다
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="smtpSecure"
              value="true"
              defaultChecked={currentConfig.smtpSecure}
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
