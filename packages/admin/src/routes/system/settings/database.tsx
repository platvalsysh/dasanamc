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

interface DatabaseConfig {
  autoBackup: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupRetentionDays: number;
  maintenanceWindow: string;
}

const DEFAULT_CONFIG: DatabaseConfig = {
  autoBackup: true,
  backupFrequency: "daily",
  backupRetentionDays: 30,
  maintenanceWindow: "03:00",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const config = await configManager.get<DatabaseConfig>(
    "site",
    "database",
    DEFAULT_CONFIG,
  );
  return { config };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const newConfig: DatabaseConfig = {
    autoBackup: formData.get("autoBackup") === "true",
    backupFrequency: formData.get("backupFrequency") as
      | "daily"
      | "weekly"
      | "monthly",
    backupRetentionDays:
      parseInt(formData.get("backupRetentionDays") as string) || 30,
    maintenanceWindow: formData.get("maintenanceWindow") as string,
  };

  await configManager.set(
    "site",
    "database",
    newConfig,
    "Database maintenance settings",
  );

  return { success: true, config: newConfig };
};

export default function DatabaseSettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentConfig = actionData?.config || config;

  return (
    <Form method="post" className="space-y-6">
      <NotImplementedBanner feature="자동 백업 / 유지보수 윈도우" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">백업 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">자동 백업 활성화</p>
              <p className="text-sm text-gray-600">
                주기적으로 데이터베이스를 백업합니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="autoBackup"
                value="true"
                defaultChecked={currentConfig.autoBackup}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                백업 주기
              </label>
              <select
                name="backupFrequency"
                defaultValue={currentConfig.backupFrequency}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                보관 기간 (일)
              </label>
              <input
                type="number"
                name="backupRetentionDays"
                defaultValue={currentConfig.backupRetentionDays}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">유지보수</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            유지보수 시간대 (Maintenance Window)
          </label>
          <input
            type="time"
            name="maintenanceWindow"
            defaultValue={currentConfig.maintenanceWindow}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            데이터베이스 최적화 등 부하가 큰 작업이 수행될 수 있는 시간대입니다.
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
