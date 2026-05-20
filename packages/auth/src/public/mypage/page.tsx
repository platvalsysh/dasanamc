import { useState, useEffect, useRef } from "react";
import {
  useAuthServerContext,
  useSupabaseServerContext,
  signVerificationToken,
  verifyVerificationToken,
  signVerifiedToken,
  verifyVerifiedToken,
  readCookie,
  setVerificationCookie,
  setVerifiedCookie,
  clearCookie,
  VERIFICATION_COOKIE,
  VERIFIED_COOKIE,
  getAuthRegistrationConfig,
  type AuthRegistrationConfig,
} from "../../.server";
import { smsService } from "@repo/module-sms";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@repo/ui";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data as routerData,
  redirect,
  useFetcher,
  useLoaderData,
} from "react-router";
import { prisma } from "@repo/database";
import { z } from "zod";
import {
  displayNameSchema,
  passwordStrongSchema,
  koreanNameSchema,
} from "@repo/schema";

const AccountSchema = z.object({
  display_name: displayNameSchema,
});

const PasswordSchema = z
  .object({
    password: passwordStrongSchema,
    confirm_password: passwordStrongSchema,
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirm_password"],
  });

/** 정책 기반 프로필 스키마 — 회원가입과 동일한 토글 사용. */
function buildProfileSchema(policy: AuthRegistrationConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  if (policy.collectName)
    shape.name_kor = z.preprocess((v) => v ?? "", koreanNameSchema);
  if (policy.collectPhone)
    shape.cellphone_number = z.preprocess(
      (v) => v ?? "",
      z.string().optional(),
    );
  if (policy.collectSex)
    shape.sex = z.preprocess(
      (v) => v ?? "",
      z.string().min(1, "성별을 선택해 주세요."),
    );
  if (policy.collectAddress)
    shape.address = z.preprocess((v) => v ?? "", z.string().optional());
  return z.object(shape);
}

function buildPreferencesSchema(policy: AuthRegistrationConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  if (policy.marketingOptIn) shape.allow_mailing = z.enum(["Y", "N"]);
  if (policy.messageOptIn) shape.allow_message = z.enum(["Y", "N"]);
  return z.object(shape);
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.isLogged()) {
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    return redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const userContext = auth.getUser();
  if (!userContext?.id) return redirect("/auth/login");

  const [profile, identifierData, policy] = await Promise.all([
    prisma.profiles.findUnique({ where: { user_id: userContext.id } }),
    prisma.identifiers.findUnique({ where: { user_id: userContext.id } }),
    getAuthRegistrationConfig(),
  ]);

  return {
    id: userContext.id,
    identifier: identifierData?.identifier || "",
    email: userContext.email,
    profile,
    extra_vars: (profile?.extra_vars || {}) as Record<string, string | undefined>,
    policy,
  };
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const auth = useAuthServerContext(context);
  if (!auth.isLogged())
    return { error: "로그인이 필요합니다.", intent: "global" };
  const userId = auth.getUser()?.id;
  if (!userId)
    return { error: "사용자 정보를 찾을 수 없습니다.", intent: "global" };

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const rawValues = Object.fromEntries(formData.entries());
  const policy = await getAuthRegistrationConfig();

  // SMS 인증 코드 발송 / 검증
  if (intent === "send-code") {
    if (!policy.smsVerification)
      return { error: "SMS 인증이 비활성화되어 있습니다.", intent };
    const phone = formData.get("cellphone_number") as string;
    if (!phone) return { error: "휴대폰 번호를 입력해 주세요.", intent };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await smsService.sendKakao({
        to: phone.replace(/-/g, ""),
        text: `아래 인증번호를 확인하시고\n서비스 화면에 입력해주세요.\n\n인증번호: ${code}`,
        channelId: "KA01PF260204070228919xD0tZq08ua1",
        templateId: "KA01TP221027002252645FPwAcO9SguY",
        type: "ATA",
        variables: { "#{인증번호}": code },
      });
      const token = signVerificationToken(phone, code);
      const expiresAt = Date.now() + 5 * 60 * 1000;
      return routerData(
        {
          success: true,
          codeSent: true,
          expiresAt,
          message: "인증번호가 발송되었습니다.",
          intent,
        },
        { headers: { "Set-Cookie": setVerificationCookie(token) } },
      );
    } catch (e) {
      console.error("SMS Send Error:", e);
      return { error: "인증번호 발송에 실패했습니다.", intent };
    }
  }

  if (intent === "verify-code") {
    const phone = formData.get("cellphone_number") as string;
    const code = formData.get("verify_code") as string;
    const token = readCookie(request, VERIFICATION_COOKIE);
    if (verifyVerificationToken(phone, token, code)) {
      const verifiedToken = signVerifiedToken(phone);
      const headers = new Headers();
      headers.append("Set-Cookie", setVerifiedCookie(verifiedToken));
      headers.append("Set-Cookie", clearCookie(VERIFICATION_COOKIE));
      return routerData(
        { success: true, verified: true, message: "인증되었습니다.", intent },
        { headers },
      );
    }
    return { error: "인증번호가 일치하지 않거나 만료되었습니다.", intent };
  }

  // 4개 섹션 처리
  let result;
  if (intent === "account") {
    result = AccountSchema.safeParse(rawValues);
  } else if (intent === "profile") {
    result = buildProfileSchema(policy).safeParse(rawValues);
  } else if (intent === "preferences") {
    if (policy.marketingOptIn)
      rawValues.allow_mailing = rawValues.allow_mailing === "Y" ? "Y" : "N";
    if (policy.messageOptIn)
      rawValues.allow_message = rawValues.allow_message === "Y" ? "Y" : "N";
    result = buildPreferencesSchema(policy).safeParse(rawValues);
  } else if (intent === "password") {
    result = PasswordSchema.safeParse(rawValues);
  } else {
    return { error: "잘못된 요청입니다.", intent };
  }

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message || "입력 정보가 올바르지 않습니다.",
      intent,
    };
  }

  const data = result.data as Record<string, string | undefined>;

  try {
    const existingProfile = await prisma.profiles.findUnique({
      where: { user_id: userId },
    });
    const currentExtraVars = (existingProfile?.extra_vars || {}) as Record<
      string,
      string | undefined
    >;
    const updateData: Record<string, unknown> = {};
    const newExtraVars: Record<string, string | undefined> = {
      ...currentExtraVars,
    };

    if (intent === "account") {
      updateData.display_name = data.display_name;
    } else if (intent === "profile") {
      // 휴대폰 변경 시 SMS 정책 ON 이면 OTP 인증 필수
      if (policy.collectPhone && policy.smsVerification) {
        const cleanNew = (data.cellphone_number || "").replace(/-/g, "");
        const cleanOld = (currentExtraVars.cellphone_number || "").replace(/-/g, "");
        if (cleanNew !== cleanOld && cleanNew) {
          const verifiedToken = readCookie(request, VERIFIED_COOKIE);
          if (!verifyVerifiedToken(cleanNew, verifiedToken)) {
            return {
              error:
                "휴대폰 인증 정보가 올바르지 않거나 만료되었습니다. 다시 인증해 주세요.",
              intent,
            };
          }
        }
      }
      if (policy.collectName) newExtraVars.user_name = data.name_kor || "";
      if (policy.collectPhone)
        newExtraVars.cellphone_number = (data.cellphone_number || "").replace(/-/g, "");
      if (policy.collectSex) newExtraVars.sex = data.sex || "";
      if (policy.collectAddress) newExtraVars.address = data.address || "";
    } else if (intent === "preferences") {
      if (policy.marketingOptIn)
        updateData.allow_mailing = data.allow_mailing === "Y";
      if (policy.messageOptIn)
        updateData.allow_message = data.allow_message === "Y";
    } else if (intent === "password") {
      const supabase = useSupabaseServerContext(context);
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      return { success: true, message: "비밀번호가 변경되었습니다.", intent };
    }

    updateData.extra_vars = newExtraVars;
    await prisma.profiles.update({
      where: { user_id: userId },
      data: updateData,
    });

    if (intent === "profile" && policy.smsVerification) {
      return routerData(
        { success: true, message: "정보가 수정되었습니다.", intent },
        { headers: { "Set-Cookie": clearCookie(VERIFIED_COOKIE) } },
      );
    }
    return { success: true, message: "정보가 수정되었습니다.", intent };
  } catch (e) {
    console.error("Failed to update profile:", e);
    return { error: "정보 수정에 실패했습니다.", intent };
  }
};

function SectionCard({
  title,
  intent,
  editing,
  setEditing,
  onSubmit,
  children,
}: {
  title: string;
  intent: string;
  editing: string | null;
  setEditing: (s: string | null) => void;
  onSubmit: (form: HTMLFormElement) => void;
  children: React.ReactNode;
}) {
  const isEditing = editing === intent;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(intent)}>
              수정
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                취소
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  const form = (e.target as HTMLElement).closest("form") as HTMLFormElement;
                  if (form) onSubmit(form);
                }}
              >
                저장
              </Button>
            </div>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export default function MyPage() {
  const { email, identifier, profile, extra_vars, policy } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const processedRef = useRef<typeof fetcher.data | null>(null);

  useEffect(() => {
    if (!fetcher.data || !("success" in fetcher.data) || !fetcher.data.success) return;
    if ("codeSent" in fetcher.data && fetcher.data.codeSent) {
      setShowVerifyCode(true);
      setIsVerified(false);
      const expiresAt = "expiresAt" in fetcher.data ? (fetcher.data.expiresAt as number) : 0;
      setTimeLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    }
    if ("verified" in fetcher.data && fetcher.data.verified) setIsVerified(true);
  }, [fetcher.data]);

  useEffect(() => {
    if (timeLeft <= 0 || isVerified) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft, isVerified]);

  // 성공 시 편집 모드 해제
  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.success &&
      fetcher.data !== processedRef.current
    ) {
      if (editingSection && editingSection === fetcher.data.intent) {
        setEditingSection(null);
      }
      processedRef.current = fetcher.data;
    }
  }, [fetcher.state, fetcher.data, editingSection]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const error = fetcher.data && "error" in fetcher.data ? fetcher.data.error : undefined;
  const success = fetcher.data?.success && "message" in fetcher.data
    ? (fetcher.data.message as string)
    : undefined;

  const submitForm = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    fetcher.submit(fd, { method: "post" });
  };

  const handleSendCode = (form: HTMLFormElement) => {
    const phone = (form.querySelector("input[name=cellphone_number]") as HTMLInputElement | null)?.value;
    if (!phone) return alert("휴대폰 번호를 입력해 주세요.");
    const fd = new FormData();
    fd.append("intent", "send-code");
    fd.append("cellphone_number", phone);
    fetcher.submit(fd, { method: "post" });
  };

  const handleVerifyCode = (form: HTMLFormElement) => {
    const phone = (form.querySelector("input[name=cellphone_number]") as HTMLInputElement | null)?.value;
    const code = (form.querySelector("input[name=verify_code]") as HTMLInputElement | null)?.value;
    if (!phone || !code) return;
    const fd = new FormData();
    fd.append("intent", "verify-code");
    fd.append("cellphone_number", phone);
    fd.append("verify_code", code);
    fetcher.submit(fd, { method: "post" });
  };

  return (
    <div className="container max-w-3xl py-8 space-y-4">
      <h1 className="text-2xl font-bold mb-2">내 정보</h1>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && fetcher.state === "idle" && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* 계정 */}
      <SectionCard
        title="계정"
        intent="account"
        editing={editingSection}
        setEditing={setEditingSection}
        onSubmit={submitForm}
      >
        <fetcher.Form method="post" className="space-y-3">
          <input type="hidden" name="intent" value="account" />
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label>이메일</Label>
            <span className="col-span-2 text-sm text-gray-700">{email}</span>
          </div>
          {identifier && (
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label>아이디</Label>
              <span className="col-span-2 text-sm text-gray-700">{identifier}</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor="display_name">닉네임</Label>
            {editingSection === "account" ? (
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile?.display_name || ""}
                className="col-span-2"
              />
            ) : (
              <span className="col-span-2 text-sm text-gray-700">
                {profile?.display_name || "-"}
              </span>
            )}
          </div>
        </fetcher.Form>
      </SectionCard>

      {/* 개인정보 (정책 ON 필드 있을 때만 노출) */}
      {(policy.collectName ||
        policy.collectPhone ||
        policy.collectSex ||
        policy.collectAddress) && (
        <SectionCard
          title="개인정보"
          intent="profile"
          editing={editingSection}
          setEditing={setEditingSection}
          onSubmit={submitForm}
        >
          <fetcher.Form method="post" className="space-y-3">
            <input type="hidden" name="intent" value="profile" />

            {policy.collectName && (
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label htmlFor="name_kor">이름</Label>
                {editingSection === "profile" ? (
                  <Input
                    id="name_kor"
                    name="name_kor"
                    defaultValue={extra_vars.user_name || ""}
                    className="col-span-2"
                  />
                ) : (
                  <span className="col-span-2 text-sm text-gray-700">
                    {extra_vars.user_name || "-"}
                  </span>
                )}
              </div>
            )}

            {policy.collectSex && (
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label htmlFor="sex">성별</Label>
                {editingSection === "profile" ? (
                  <Select name="sex" defaultValue={extra_vars.sex || ""}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">남성</SelectItem>
                      <SelectItem value="F">여성</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="col-span-2 text-sm text-gray-700">
                    {extra_vars.sex === "M"
                      ? "남성"
                      : extra_vars.sex === "F"
                        ? "여성"
                        : "-"}
                  </span>
                )}
              </div>
            )}

            {policy.collectPhone && (
              <div className="grid grid-cols-3 gap-2 items-start">
                <Label htmlFor="cellphone_number" className="pt-2">
                  휴대폰
                </Label>
                {editingSection === "profile" ? (
                  <div className="col-span-2 space-y-2">
                    {policy.smsVerification ? (
                      <div className="flex gap-2">
                        <Input
                          id="cellphone_number"
                          name="cellphone_number"
                          defaultValue={extra_vars.cellphone_number || ""}
                          disabled={isVerified}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const f = (e.target as HTMLElement).closest("form") as HTMLFormElement;
                            handleSendCode(f);
                          }}
                          disabled={isVerified}
                        >
                          {isVerified ? "인증완료" : "인증"}
                        </Button>
                      </div>
                    ) : (
                      <Input
                        id="cellphone_number"
                        name="cellphone_number"
                        defaultValue={extra_vars.cellphone_number || ""}
                      />
                    )}
                    {policy.smsVerification && showVerifyCode && !isVerified && (
                      <div className="flex gap-2 items-center">
                        <Input name="verify_code" placeholder="6자리" maxLength={6} />
                        <span className="text-xs text-red-600 font-mono w-12 text-right">
                          {formatTime(timeLeft)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const f = (e.target as HTMLElement).closest("form") as HTMLFormElement;
                            handleVerifyCode(f);
                          }}
                        >
                          확인
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="col-span-2 text-sm text-gray-700">
                    {extra_vars.cellphone_number || "-"}
                  </span>
                )}
              </div>
            )}

            {policy.collectAddress && (
              <div className="grid grid-cols-3 gap-2 items-start">
                <Label htmlFor="address" className="pt-2">
                  주소
                </Label>
                {editingSection === "profile" ? (
                  <Textarea
                    id="address"
                    name="address"
                    rows={2}
                    defaultValue={extra_vars.address || ""}
                    className="col-span-2"
                  />
                ) : (
                  <span className="col-span-2 text-sm text-gray-700">
                    {extra_vars.address || "-"}
                  </span>
                )}
              </div>
            )}
          </fetcher.Form>
        </SectionCard>
      )}

      {/* 수신 동의 */}
      {(policy.marketingOptIn || policy.messageOptIn) && (
        <SectionCard
          title="수신 동의"
          intent="preferences"
          editing={editingSection}
          setEditing={setEditingSection}
          onSubmit={submitForm}
        >
          <fetcher.Form method="post" className="space-y-3">
            <input type="hidden" name="intent" value="preferences" />
            {policy.marketingOptIn && (
              <div className="flex items-center gap-2">
                {editingSection === "preferences" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="allow_mailing"
                      value="Y"
                      defaultChecked={profile?.allow_mailing ?? false}
                    />
                    마케팅 / 이메일 수신 동의
                  </label>
                ) : (
                  <span className="text-sm text-gray-700">
                    마케팅 / 이메일 수신:{" "}
                    {profile?.allow_mailing ? "동의" : "거부"}
                  </span>
                )}
              </div>
            )}
            {policy.messageOptIn && (
              <div className="flex items-center gap-2">
                {editingSection === "preferences" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="allow_message"
                      value="Y"
                      defaultChecked={profile?.allow_message ?? false}
                    />
                    쪽지 / 알림 수신 동의
                  </label>
                ) : (
                  <span className="text-sm text-gray-700">
                    쪽지 / 알림 수신:{" "}
                    {profile?.allow_message ? "동의" : "거부"}
                  </span>
                )}
              </div>
            )}
          </fetcher.Form>
        </SectionCard>
      )}

      {/* 비밀번호 변경 */}
      <SectionCard
        title="비밀번호 변경"
        intent="password"
        editing={editingSection}
        setEditing={setEditingSection}
        onSubmit={submitForm}
      >
        <fetcher.Form method="post" className="space-y-3">
          <input type="hidden" name="intent" value="password" />
          {editingSection === "password" ? (
            <>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label htmlFor="password">새 비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="col-span-2"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Label htmlFor="confirm_password">비밀번호 확인</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  className="col-span-2"
                  required
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              비밀번호는 정기적으로 변경하는 것을 권장합니다.
            </p>
          )}
        </fetcher.Form>
      </SectionCard>
    </div>
  );
}
