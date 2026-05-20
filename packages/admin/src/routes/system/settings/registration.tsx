import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import {
  getAuthRegistrationConfig,
  setAuthRegistrationConfig,
  type AuthRegistrationConfig,
} from "@repo/auth/server";
import { Save } from "lucide-react";
import { requireSettingsView, requireSettingsEdit } from "../../../utils/admin-guard";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  requireSettingsView(context);
  const config = await getAuthRegistrationConfig();
  return { config };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  requireSettingsEdit(context);
  const formData = await request.formData();
  const newConfig: AuthRegistrationConfig = {
    smsVerification: formData.get("smsVerification") === "true",
    emailVerification: formData.get("emailVerification") === "true",
    collectName: formData.get("collectName") === "true",
    collectPhone: formData.get("collectPhone") === "true",
    collectSex: formData.get("collectSex") === "true",
    collectAddress: formData.get("collectAddress") === "true",
    marketingOptIn: formData.get("marketingOptIn") === "true",
    messageOptIn: formData.get("messageOptIn") === "true",
  };
  await setAuthRegistrationConfig(newConfig);
  return { success: true, config: newConfig };
};

function Toggle({
  name,
  defaultChecked,
  title,
  description,
  disabled,
  disabledReason,
}: {
  name: string;
  defaultChecked: boolean;
  title: string;
  description: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg ${disabled ? "bg-gray-100 opacity-70" : "bg-gray-50"}`}
    >
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        {disabled && disabledReason && (
          <p className="text-xs text-amber-700 mt-1">{disabledReason}</p>
        )}
      </div>
      <label
        className={`relative inline-flex items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          type="checkbox"
          name={name}
          value="true"
          defaultChecked={defaultChecked}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}

export default function RegistrationSettings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentConfig = actionData?.config || config;
  // SMS 인증 ON 이면 휴대폰 수집은 강제 — UI 잠금
  const phoneLockedBySms = currentConfig.smsVerification;

  return (
    <Form method="post" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          회원가입 정책
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          회원가입 폼이 즉시 이 정책을 따릅니다. 변경 후 신규 회원가입은 변경된
          정책으로 진행됩니다.
        </p>
      </div>

      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-3">인증 방식</h4>
        <div className="space-y-3">
          <Toggle
            name="emailVerification"
            defaultChecked={currentConfig.emailVerification}
            title="이메일 인증"
            description="Supabase Auth 의 confirm 메일 — 가입 후 메일 링크로 활성화. 끄면 가입 즉시 활성."
          />
          <Toggle
            name="smsVerification"
            defaultChecked={currentConfig.smsVerification}
            title="SMS 휴대폰 인증"
            description="가입 단계에서 휴대폰 OTP 검증. 외주에 SMS 발송 채널이 있을 때만 사용."
          />
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-3">
          수집할 개인정보
        </h4>
        <div className="space-y-3">
          <Toggle
            name="collectName"
            defaultChecked={currentConfig.collectName}
            title="이름 (name_kor)"
            description="실명 1자 이상 필수 입력 필드"
          />
          <Toggle
            name="collectPhone"
            defaultChecked={currentConfig.collectPhone || phoneLockedBySms}
            title="휴대폰 번호 (cellphone_number)"
            description="휴대폰 번호 필드 표시"
            disabled={phoneLockedBySms}
            disabledReason="SMS 인증을 사용하면 자동으로 켜집니다"
          />
          <Toggle
            name="collectSex"
            defaultChecked={currentConfig.collectSex}
            title="성별 (sex)"
            description="성별 select 필드"
          />
          <Toggle
            name="collectAddress"
            defaultChecked={currentConfig.collectAddress}
            title="주소 (address)"
            description="주소 textbox"
          />
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-3">수신 동의</h4>
        <div className="space-y-3">
          <Toggle
            name="marketingOptIn"
            defaultChecked={currentConfig.marketingOptIn}
            title="마케팅 / 메일 수신 동의 체크박스"
            description="회원가입 시 allow_mailing 동의를 받음"
          />
          <Toggle
            name="messageOptIn"
            defaultChecked={currentConfig.messageOptIn}
            title="쪽지 / 알림 수신 동의 체크박스"
            description="회원가입 시 allow_message 동의를 받음"
          />
        </div>
      </div>

      {actionData?.success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          저장되었습니다.
        </div>
      )}

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
