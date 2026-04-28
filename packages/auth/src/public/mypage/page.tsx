import { useState, useMemo, useEffect, useRef } from "react";
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
  Checkbox,
  Textarea
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

const AccountSchema = z.object({
  display_name: z.string().min(1, "닉네임을 입력해 주세요."),
});

const PersonalSchema = z.object({
  name_kor: z.preprocess((val) => val ?? "", z.string().min(1, "이름을 입력해 주세요.")),
  sex: z.preprocess((val) => val ?? "", z.string().min(1, "성별을 선택해 주세요.")),
  cellphone_number: z.preprocess((val) => val ?? "", z.string().optional()),
  phone_number: z.preprocess((val) => val ?? "", z.string().optional()),
  address: z.preprocess((val) => val ?? "", z.string().optional()),
});

const EducationSchema = z.object({
  enter_year: z.string().optional(),
  major: z.string().optional(),
  graduate_year: z.string().optional(),
  graduate_month: z.enum(["", "2", "8"]).optional(),
  graduate_number: z.string().optional(),
  master_major: z.string().optional(),
  master_graduate_year: z.string().optional(),
  master_graduate_month: z.enum(["", "2", "8"]).optional(),
  master_graduate_number: z.string().optional(),
  doctor_major: z.string().optional(),
  doctor_graduate_year: z.string().optional(),
  doctor_graduate_month: z.enum(["", "2", "8"]).optional(),
  doctor_graduate_number: z.string().optional(),
}).refine((data) => {
  return !!(data.major || data.master_major || data.doctor_major);
}, {
  message: "학사, 석사, 박사 정보 중 최소 하나는 입력하거나 선택해야 합니다.",
  path: ["major"]
});

const OfficeSchema = z.object({
  office_name: z.string().optional(),
  office_position: z.string().optional(),
  job_class: z.string().optional(),
  office_phone_number: z.string().optional(),
  office_area: z.string().optional(),
  office_address: z.string().optional(),
  office_career: z.string().optional(),
});

const SettingsSchema = z.object({
  search_agree: z.enum(["Y", "N"]).default("N"),
  o_cellphone_number: z.enum(["Y", "N"]).default("N"),
  o_email_address: z.enum(["Y", "N"]).default("N"),
  o_office_name: z.enum(["Y", "N"]).default("N"),
  o_office_position: z.enum(["Y", "N"]).default("N"),
  allow_mailing: z.enum(["Y", "N"]).default("N"),
  allow_message: z.enum(["Y", "N"]).default("N"),
});

const PasswordSchema = z.object({
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
  confirm_password: z.string().min(8, "비밀번호 확인을 입력해 주세요."),
}).refine((data) => data.password === data.confirm_password, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirm_password"],
});

export async function loader({ context, request }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  const isLogged = auth.isLogged();
  if (!isLogged) {
    const url = new URL(request.url);
    return redirect(`/auth/login?next=${url.pathname}`);
  }

  const userContext = auth.getUser();
  if (!userContext?.id) return redirect("/auth/login");

  const profilePromise = prisma.profiles.findUnique({
    where: { user_id: userContext.id },
  });
  const identifierPromise = prisma.identifiers.findUnique({
    where: { user_id: userContext.id },
  });

  const [profile, identifierData] = await Promise.all([profilePromise, identifierPromise]);

  return { 
    id: userContext.id,
    identifier: identifierData?.identifier || "",
    email: userContext.email,
    profile,
    extra_vars: (profile?.extra_vars || {}) as Record<string, any>
  };
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const auth = useAuthServerContext(context);
  if (!auth.isLogged()) return { error: "로그인이 필요합니다.", intent: "global" };
  const userId = auth.getUser()?.id;
  if (!userId) return { error: "사용자 정보를 찾을 수 없습니다.", intent: "global" };

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const rawValues = Object.fromEntries(formData.entries());

  if (intent === "send-code") {
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
        variables: {
          "#{인증번호}": code,
        },
      });
      const token = signVerificationToken(phone, code);
      const expiresAt = Date.now() + 5 * 60 * 1000;
      return routerData(
        { success: true, codeSent: true, expiresAt, message: "인증번호가 발송되었습니다.", intent },
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

  let result;
  if (intent === "account") {
    result = AccountSchema.safeParse(rawValues);
  } else if (intent === "personal") {
    result = PersonalSchema.safeParse(rawValues);
  } else if (intent === "education") {
    result = EducationSchema.safeParse(rawValues);
  } else if (intent === "office") {
    result = OfficeSchema.safeParse(rawValues);
  } else if (intent === "settings") {
    rawValues.search_agree = rawValues.search_agree === "Y" ? "Y" : "N";
    rawValues.o_cellphone_number = rawValues.o_cellphone_number === "Y" ? "Y" : "N";
    rawValues.o_email_address = rawValues.o_email_address === "Y" ? "Y" : "N";
    rawValues.o_office_name = rawValues.o_office_name === "Y" ? "Y" : "N";
    rawValues.o_office_position = rawValues.o_office_position === "Y" ? "Y" : "N";
    rawValues.allow_mailing = rawValues.allow_mailing === "Y" ? "Y" : "N";
    rawValues.allow_message = rawValues.allow_message === "Y" ? "Y" : "N";
    result = SettingsSchema.safeParse(rawValues);
  } else if (intent === "password") {
    result = PasswordSchema.safeParse(rawValues);
  } else {
    return { error: "잘못된 요청입니다." };
  }

  if (!result.success) {
    return { 
      error: result.error.issues[0]?.message || "입력 정보가 올바르지 않습니다.",
      intent
    };
  }

  const data = result.data as any;

  try {
    const existingProfile = await prisma.profiles.findUnique({
      where: { user_id: userId },
    });
    const currentExtraVars = (existingProfile?.extra_vars || {}) as Record<string, any>;
    let updateData: any = {};
    let newExtraVars: any = { ...currentExtraVars };

    if (intent === "account") {
      updateData.display_name = data.display_name;
    } else if (intent === "personal") {
      // 휴대폰 번호가 변경된 경우 인증 여부 확인
      const cleanNewPhone = (data.cellphone_number || "").replace(/-/g, "");
      const cleanOldPhone = (currentExtraVars.cellphone_number || "").replace(/-/g, "");
      
      if (cleanNewPhone !== cleanOldPhone) {
        const verifiedToken = readCookie(request, VERIFIED_COOKIE);
        if (!verifyVerifiedToken(data.cellphone_number, verifiedToken)) {
          return { error: "휴대폰 인증 정보가 올바르지 않거나 만료되었습니다. 다시 인증해 주세요.", intent };
        }
      }

      newExtraVars.user_name = data.name_kor;
      if (data.cellphone_number) {
        newExtraVars.cellphone_number = data.cellphone_number.replace(/-/g, "");
      }
      newExtraVars.sex = data.sex;
      newExtraVars.phone_number = data.phone_number?.replace(/-/g, "") || "";
      newExtraVars.address = data.address || "";
    } else if (intent === "education") {
      newExtraVars.major = data.major || "";
      newExtraVars.enter_year = data.enter_year || "";
      newExtraVars.graduate_year = data.graduate_year || "";
      newExtraVars.graduate_month = data.graduate_month || "";
      newExtraVars.graduate_number = data.graduate_number || "";
      newExtraVars.master_major = data.master_major || "";
      newExtraVars.master_graduate_year = data.master_graduate_year || "";
      newExtraVars.master_graduate_month = data.master_graduate_month || "";
      newExtraVars.master_graduate_number = data.master_graduate_number || "";
      newExtraVars.doctor_major = data.doctor_major || "";
      newExtraVars.doctor_graduate_year = data.doctor_graduate_year || "";
      newExtraVars.doctor_graduate_month = data.doctor_graduate_month || "";
      newExtraVars.doctor_graduate_number = data.doctor_graduate_number || "";
      newExtraVars.is_major = data.major ? "Y" : "N";
      newExtraVars.is_master = data.master_major ? "Y" : "N";
      newExtraVars.is_doctor = data.doctor_major ? "Y" : "N";
    } else if (intent === "office") {
      newExtraVars.office_name = data.office_name || "";
      newExtraVars.office_position = data.office_position || "";
      newExtraVars.job_class = data.job_class || "";
      newExtraVars.office_area = data.office_area || "";
      newExtraVars.office_phone_number = (data.office_phone_number || "").replace(/-/g, "");
      newExtraVars.office_address = data.office_address || "";
      newExtraVars.office_career = data.office_career || "";
    } else if (intent === "settings") {
      updateData.allow_mailing = data.allow_mailing === "Y";
      updateData.allow_message = data.allow_message === "Y";
      newExtraVars.search_agree = data.search_agree;
      newExtraVars.o_cellphone_number = data.o_cellphone_number;
      newExtraVars.o_email_address = data.o_email_address;
      newExtraVars.o_office_name = data.o_office_name;
      newExtraVars.o_office_position = data.o_office_position;
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

    if (intent === "personal") {
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

export default function MyPage() {
  const { email, identifier, profile, extra_vars } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPhoneChanging, setIsPhoneChanging] = useState(false);
  const processedDataRef = useRef<any>(null);

  useMemo(() => {
    if (!fetcher.data || !("success" in fetcher.data) || !fetcher.data.success) return;
    if (fetcher.data.intent === "send-code" && "codeSent" in fetcher.data && fetcher.data.codeSent) {
      setShowVerifyCode(true);
      setIsVerified(false);
      const expiresAt = "expiresAt" in fetcher.data ? (fetcher.data.expiresAt as number) : 0;
      setTimeLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    }
    if (fetcher.data.intent === "verify-code" && "verified" in fetcher.data && fetcher.data.verified) {
      setIsVerified(true);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (timeLeft <= 0 || isVerified) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isVerified]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const [showBachelor, setShowBachelor] = useState(!!extra_vars.major);
  const [showMaster, setShowMaster] = useState(!!extra_vars.master_major);
  const [showDoctor, setShowDoctor] = useState(!!extra_vars.doctor_major);

  const error = fetcher.data && "error" in fetcher.data ? fetcher.data.error : undefined;
  const loading = fetcher.state === "submitting";
  const successIntent = fetcher.data?.success ? fetcher.data.intent : null;

  // 성공 시 수정 모드 해제
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && fetcher.data !== processedDataRef.current) {
      if (editingSection === fetcher.data.intent) {
        setEditingSection(null);
        setIsPhoneChanging(false);
        processedDataRef.current = fetcher.data;
      }
    }
  }, [fetcher.state, fetcher.data, editingSection]);


  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const result = [];
    for (let i = currentYear; i >= 1900; i--) {
      result.push(i.toString());
    }
    return result;
  }, []);

  const SectionHeader = ({ title, sectionId, isEditing, required }: { title: string, sectionId: string, isEditing: boolean, required?: boolean }) => {
    return (
      <>
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-1">
          {title} {required && <span className="text-red-500 font-normal text-sm">*</span>}
        </h3>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setEditingSection(sectionId)}>수정</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              setEditingSection(null);
              if (sectionId === "personal") setIsPhoneChanging(false);
            }}>취소</Button>
            <Button size="sm" type="submit" form={`form-${sectionId}`} disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </div>
        )}
      </div>
      {error && fetcher.data?.intent === sectionId && (
        <div className="mb-4 p-2 text-xs bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}
      </>
    );
  };

  const InfoRow = ({ label, value }: { label: string, value?: string }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0 text-sm">
      <dt className="text-muted-foreground font-medium flex items-center">{label}</dt>
      <dd className="col-span-2 text-foreground font-medium">{value || "-"}</dd>
    </div>
  );

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 text-gray-900 bg-gray-50/50">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-snublue">마이페이지</h1>
          <p className="text-muted-foreground text-lg">나의 회원 정보를 확인하고 관리합니다.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* 계정 정보 */}
          <Card>
            <CardContent className="pt-6">
              <fetcher.Form method="post" id="form-account">
                <input type="hidden" name="intent" value="account" />
                <SectionHeader title="계정 정보" sectionId="account" isEditing={editingSection === "account"} />
                {editingSection === "account" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">이메일 주소</Label>
                      <Input id="email" value={email} readOnly disabled className="bg-gray-100" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="display_name">닉네임 <span className="text-red-500">*</span></Label>
                      <Input id="display_name" name="display_name" defaultValue={profile?.display_name || ""} required />
                    </div>
                  </div>
                ) : (
                  <dl>
                    <InfoRow label="아이디" value={identifier} />
                    <InfoRow label="이메일 주소" value={email} />
                    <InfoRow label="닉네임" value={profile?.display_name || ""} />
                  </dl>
                )}
              </fetcher.Form>
            </CardContent>
          </Card>

          {/* 비밀번호 변경 */}
          <Card>
            <CardContent className="pt-6">
              <fetcher.Form method="post" id="form-password">
                <input type="hidden" name="intent" value="password" />
                <SectionHeader title="비밀번호 변경" sectionId="password" isEditing={editingSection === "password"} />
                {editingSection === "password" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">새 비밀번호</Label>
                      <Input id="password" name="password" type="password" placeholder="새 비밀번호 (8자 이상)" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm_password">비밀번호 확인</Label>
                      <Input id="confirm_password" name="confirm_password" type="password" placeholder="비밀번호 재입력" required />
                    </div>
                  </div>
                ) : (
                  <dl>
                    <InfoRow label="비밀번호" value="********" />
                  </dl>
                )}
              </fetcher.Form>
            </CardContent>
          </Card>

          {/* 개인 정보 */}
          <Card>
            <CardContent className="pt-6">
              <fetcher.Form method="post" id="form-personal">
                <input type="hidden" name="intent" value="personal" />
                <SectionHeader title="개인 정보" sectionId="personal" isEditing={editingSection === "personal"} />
                {editingSection === "personal" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name_kor">이름 <span className="text-red-500">*</span></Label>
                      <Input id="name_kor" name="name_kor" defaultValue={extra_vars.user_name || ""} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sex">성별 <span className="text-red-500">*</span></Label>
                      <Select name="sex" defaultValue={extra_vars.sex || ""}>
                        <SelectTrigger id="sex">
                          <SelectValue placeholder=":: 성별 선택 ::" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="남">남성</SelectItem>
                          <SelectItem value="여">여성</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cellphone_number">휴대폰 번호 <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input 
                          id="cellphone_number" 
                          name="cellphone_number" 
                          defaultValue={extra_vars.cellphone_number || ""} 
                          required 
                          placeholder="010-0000-0000" 
                          className={`flex-1 ${(!isPhoneChanging || isVerified) ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          readOnly={!isPhoneChanging || isVerified}
                        />
                        <input type="hidden" name="cellphone_number_original" value={extra_vars.cellphone_number || ""} />
                        {!isPhoneChanging ? (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="shrink-0"
                            onClick={() => setIsPhoneChanging(true)}
                          >
                            변경
                          </Button>
                        ) : (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="shrink-0"
                            disabled={isVerified}
                            onClick={() => {
                              const phone = (document.getElementById("cellphone_number") as HTMLInputElement)?.value;
                              if (!phone) return alert("휴대폰 번호를 입력해 주세요.");
                              const fd = new FormData();
                              fd.append("intent", "send-code");
                              fd.append("cellphone_number", phone);
                              fetcher.submit(fd, { method: "post" });
                            }}
                          >
                            {showVerifyCode ? "재발송" : "인증번호 발송"}
                          </Button>
                        )}
                      </div>
                    </div>
                    {showVerifyCode && (
                      <div className="grid gap-2">
                        <Label htmlFor="verify_code" className="flex justify-between items-center text-xs">
                          <span>인증번호 <span className="text-red-500">*</span></span>
                          {!isVerified && timeLeft > 0 && (
                            <span className="text-red-500 font-medium">유효 시간 ({formatTime(timeLeft)})</span>
                          )}
                          {!isVerified && timeLeft === 0 && (
                            <span className="text-red-500 font-medium whitespace-nowrap">시간 초과 (재발송 필요)</span>
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="verify_code"
                            name="verify_code"
                            placeholder="인증번호 6자리"
                            required
                            readOnly={isVerified}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            disabled={isVerified || timeLeft === 0}
                            onClick={() => {
                              const phone = (document.getElementById("cellphone_number") as HTMLInputElement)?.value;
                              const code = (document.getElementById("verify_code") as HTMLInputElement)?.value;
                              if (!code) return alert("인증번호를 입력해 주세요.");
                              const fd = new FormData();
                              fd.append("intent", "verify-code");
                              fd.append("cellphone_number", phone);
                              fd.append("verify_code", code);
                              fetcher.submit(fd, { method: "post" });
                            }}
                          >
                            {isVerified ? "인증 완료" : "확인"}
                          </Button>
                        </div>
                        {isVerified && <p className="text-[10px] text-green-600 font-medium">인증되었습니다.</p>}
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="phone_number">자택 전화번호</Label>
                      <Input id="phone_number" name="phone_number" defaultValue={extra_vars.phone_number || ""} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="address">자택 주소</Label>
                      <Input id="address" name="address" defaultValue={extra_vars.address || ""} />
                    </div>
                  </div>
                ) : (
                  <dl>
                    <InfoRow label="이름" value={extra_vars.user_name} />
                    <InfoRow label="성별" value={extra_vars.sex} />
                    <InfoRow label="휴대폰 번호" value={extra_vars.cellphone_number} />
                    <InfoRow label="자택 전화번호" value={extra_vars.phone_number} />
                    <InfoRow label="자택 주소" value={extra_vars.address} />
                  </dl>
                )}
              </fetcher.Form>
            </CardContent>
          </Card>

          {/* 학력 정보 */}
          <Card>
            <CardContent className="pt-6">
              <fetcher.Form method="post" id="form-education">
                <input type="hidden" name="intent" value="education" />
                <SectionHeader title="학력 정보" sectionId="education" isEditing={editingSection === "education"} required />
                
                <datalist id="year-list">
                  {years.map((y) => (
                    <option key={y} value={y} />
                  ))}
                </datalist>

                {editingSection === "education" ? (
                  <div className="space-y-6">
                    <p className="text-xs text-muted-foreground -mt-2">학사, 석사, 박사 중 최소 하나 이상의 학위 정보를 입력해 주세요.</p>
                    {/* 학사 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="has_bachelor" 
                          checked={showBachelor} 
                          onCheckedChange={(checked) => setShowBachelor(!!checked)} 
                        />
                        <Label htmlFor="has_bachelor" className="text-base font-semibold cursor-pointer">학사</Label>
                      </div>
                      {showBachelor && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 py-2">
                          <div className="grid gap-2">
                            <Label htmlFor="enter_year">입학 년도 <span className="text-red-500">*</span></Label>
                            <Input id="enter_year" name="enter_year" list="year-list" defaultValue={extra_vars.enter_year || ""} required={showBachelor} placeholder="YYYY" />
                          </div>
                          <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="major">졸업 학과 <span className="text-red-500">*</span></Label>
                            <Select name="major" defaultValue={extra_vars.major || ""}>
                              <SelectTrigger id="major">
                                <SelectValue placeholder=":: 선택 ::" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="경성공업전문학교(전기)">경성공업전문학교(전기)</SelectItem>
                                <SelectItem value="경성공업전문학교(후기)">경성공업전문학교(후기)</SelectItem>
                                <SelectItem value="경성고등공업학교">경성고등공업학교</SelectItem>
                                <SelectItem value="경성대학이공학부">경성대학이공학부</SelectItem>
                                <SelectItem value="공과대학전문부">공과대학전문부</SelectItem>
                                <SelectItem value="화학공학과">화학공학과</SelectItem>
                                <SelectItem value="응용화학과">응용화학과</SelectItem>
                                <SelectItem value="공업화학과">공업화학과</SelectItem>
                                <SelectItem value="응용화학부">응용화학부</SelectItem>
                                <SelectItem value="화학생물공학부">화학생물공학부</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="graduate_year">졸업 년도 <span className="text-red-500">*</span></Label>
                            <Input id="graduate_year" name="graduate_year" list="year-list" defaultValue={extra_vars.graduate_year || ""} required={showBachelor} placeholder="YYYY" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="graduate_month">졸업 월</Label>
                            <Select name="graduate_month" defaultValue={extra_vars.graduate_month || ""}>
                              <SelectTrigger id="graduate_month">
                                <SelectValue placeholder=":: 선택 ::" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2월</SelectItem>
                                <SelectItem value="8">8월</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="graduate_number">졸업 기수</Label>
                            <Input id="graduate_number" name="graduate_number" defaultValue={extra_vars.graduate_number || ""} />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* 석사 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="has_master" 
                          checked={showMaster} 
                          onCheckedChange={(checked) => setShowMaster(!!checked)} 
                        />
                        <Label htmlFor="has_master" className="text-base font-semibold cursor-pointer">석사</Label>
                      </div>
                      {showMaster && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 py-2">
                          <div className="grid gap-2 md:col-span-3">
                            <Label htmlFor="master_major">전공 <span className="text-red-500">*</span></Label>
                            <Select name="master_major" defaultValue={extra_vars.master_major || ""}>
                              <SelectTrigger id="master_major">
                                <SelectValue placeholder=":: 선택 ::" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="화학공학과">화학공학과</SelectItem>
                                <SelectItem value="공업화학과">공업화학과</SelectItem>
                                <SelectItem value="응용화학부">응용화학부</SelectItem>
                                <SelectItem value="화학생물공학부">화학생물공학부</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="master_graduate_year">졸업 년도 <span className="text-red-500">*</span></Label>
                            <Input id="master_graduate_year" name="master_graduate_year" list="year-list" defaultValue={extra_vars.master_graduate_year || ""} required={showMaster} placeholder="YYYY" />
                          </div>
                           <div className="grid gap-2">
                            <Label htmlFor="master_graduate_month">졸업 월</Label>
                            <Select name="master_graduate_month" defaultValue={extra_vars.master_graduate_month || ""}>
                              <SelectTrigger id="master_graduate_month">
                                <SelectValue placeholder=":: 선택 ::" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2월</SelectItem>
                                <SelectItem value="8">8월</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="master_graduate_number">졸업 기수</Label>
                            <Input id="master_graduate_number" name="master_graduate_number" defaultValue={extra_vars.master_graduate_number || ""} />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* 박사 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="has_doctor" 
                          checked={showDoctor} 
                          onCheckedChange={(checked) => setShowDoctor(!!checked)} 
                        />
                        <Label htmlFor="has_doctor" className="text-base font-semibold cursor-pointer">박사</Label>
                      </div>
                      {showDoctor && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 py-2">
                          <div className="grid gap-2 md:col-span-3">
                            <Label htmlFor="doctor_major">전공 <span className="text-red-500">*</span></Label>
                            <Select name="doctor_major" defaultValue={extra_vars.doctor_major || ""}>
                              <SelectTrigger id="doctor_major">
                                <SelectValue placeholder=":: 선택 ::" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="화학공학과(구)">화학공학과(구)</SelectItem>
                                <SelectItem value="화학공학과">화학공학과</SelectItem>
                                <SelectItem value="공업화학과">공업화학과</SelectItem>
                                <SelectItem value="응용화학부">응용화학부</SelectItem>
                                <SelectItem value="응용화학과">응용화학과</SelectItem>
                                <SelectItem value="화학생물공학부">화학생물공학부</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="doctor_graduate_year">졸업 년도 <span className="text-red-500">*</span></Label>
                            <Input id="doctor_graduate_year" name="doctor_graduate_year" list="year-list" defaultValue={extra_vars.doctor_graduate_year || ""} required={showDoctor} placeholder="YYYY" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="doctor_graduate_month">졸업 월</Label>
                            <Select name="doctor_graduate_month" defaultValue={extra_vars.doctor_graduate_month || ""}>
                              <SelectTrigger id="doctor_graduate_month">
                                <SelectValue placeholder=":: 선택 ::" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2월</SelectItem>
                                <SelectItem value="8">8월</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="doctor_graduate_number">졸업 기수</Label>
                            <Input id="doctor_graduate_number" name="doctor_graduate_number" defaultValue={extra_vars.doctor_graduate_number || ""} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {extra_vars.major && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold bg-gray-100 px-2 py-1 rounded w-fit">학사</h4>
                        <dl className="pl-2">
                          <InfoRow label="입학/졸업 년도" value={`${extra_vars.enter_year || "-"} / ${extra_vars.graduate_year || "-"}${extra_vars.graduate_month ? ` (${extra_vars.graduate_month}월)` : ""}`} />
                          <InfoRow label="졸업 학과" value={extra_vars.major} />
                          <InfoRow label="졸업 기수" value={extra_vars.graduate_number} />
                        </dl>
                      </div>
                    )}
                    {extra_vars.master_major && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold bg-gray-100 px-2 py-1 rounded w-fit">석사</h4>
                        <dl className="pl-2">
                          <InfoRow label="졸업 년도" value={`${extra_vars.master_graduate_year || "-"}${extra_vars.master_graduate_month ? ` (${extra_vars.master_graduate_month}월)` : ""}`} />
                          <InfoRow label="전공" value={extra_vars.master_major} />
                          <InfoRow label="졸업 기수" value={extra_vars.master_graduate_number} />
                        </dl>
                      </div>
                    )}
                    {extra_vars.doctor_major && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold bg-gray-100 px-2 py-1 rounded w-fit">박사</h4>
                        <dl className="pl-2">
                          <InfoRow label="졸업 년도" value={`${extra_vars.doctor_graduate_year || "-"}${extra_vars.doctor_graduate_month ? ` (${extra_vars.doctor_graduate_month}월)` : ""}`} />
                          <InfoRow label="전공" value={extra_vars.doctor_major} />
                          <InfoRow label="졸업 기수" value={extra_vars.doctor_graduate_number} />
                        </dl>
                      </div>
                    )}
                    {!extra_vars.major && !extra_vars.master_major && !extra_vars.doctor_major && (
                      <p className="text-sm text-muted-foreground italic">등록된 학력 정보가 없습니다.</p>
                    )}
                  </div>
                )}
              </fetcher.Form>
            </CardContent>
          </Card>

          {/* 직장 정보 */}
          <Card>
            <CardContent className="pt-6">
              <fetcher.Form method="post" id="form-office">
                <input type="hidden" name="intent" value="office" />
                <SectionHeader title="직장 정보" sectionId="office" isEditing={editingSection === "office"} />
                {editingSection === "office" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="office_name">현/최종 직장명</Label>
                      <Input id="office_name" name="office_name" defaultValue={extra_vars.office_name || ""} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="office_position">부서명/직책</Label>
                      <Input id="office_position" name="office_position" defaultValue={extra_vars.office_position || ""} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="job_class">직업군</Label>
                      <Select name="job_class" defaultValue={extra_vars.job_class || ""}>
                        <SelectTrigger id="job_class">
                          <SelectValue placeholder=":: 선택 ::" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="- 전공 기업">- 전공 기업</SelectItem>
                          <SelectItem value="- 전공 외 기업 (금융 등)">- 전공 외 기업 (금융 등)</SelectItem>
                          <SelectItem value="- 외국계 기업">- 외국계 기업</SelectItem>
                          <SelectItem value="- 교육기관">- 교육기관</SelectItem>
                          <SelectItem value="- 국공립연구기관">- 국공립연구기관</SelectItem>
                          <SelectItem value="- 전문직업">- 전문직업</SelectItem>
                          <SelectItem value="- 기타">- 기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="office_area">직장 지역</Label>
                      <Select name="office_area" defaultValue={extra_vars.office_area || ""}>
                        <SelectTrigger id="office_area">
                          <SelectValue placeholder=":: 지역 선택 ::" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="서울">서울</SelectItem>
                          <SelectItem value="부산">부산</SelectItem>
                          <SelectItem value="대구">대구</SelectItem>
                          <SelectItem value="인천">인천</SelectItem>
                          <SelectItem value="광주">광주</SelectItem>
                          <SelectItem value="대전">대전</SelectItem>
                          <SelectItem value="울산">울산</SelectItem>
                          <SelectItem value="강원도">강원도</SelectItem>
                          <SelectItem value="경기도">경기도</SelectItem>
                          <SelectItem value="경상남도">경상남도</SelectItem>
                          <SelectItem value="경상북도">경상북도</SelectItem>
                          <SelectItem value="전라남도">전라남도</SelectItem>
                          <SelectItem value="전라북도">전라북도</SelectItem>
                          <SelectItem value="제주도">제주도</SelectItem>
                          <SelectItem value="충청남도">충청남도</SelectItem>
                          <SelectItem value="충청북도">충청북도</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="office_phone_number">직장 전화번호</Label>
                      <Input id="office_phone_number" name="office_phone_number" defaultValue={extra_vars.office_phone_number || ""} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="office_address">직장 주소</Label>
                      <Input id="office_address" name="office_address" defaultValue={extra_vars.office_address || ""} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="office_career">주요 경력</Label>
                      <Textarea id="office_career" name="office_career" defaultValue={extra_vars.office_career || ""} placeholder="주요 경력을 입력해 주세요." className="min-h-[100px]" />
                    </div>
                  </div>
                ) : (
                  <dl>
                    <InfoRow label="현/최종 직장명" value={extra_vars.office_name} />
                    <InfoRow label="부서명/직책" value={extra_vars.office_position} />
                    <InfoRow label="직업군" value={extra_vars.job_class} />
                    <InfoRow label="직장 지역" value={extra_vars.office_area} />
                    <InfoRow label="직장 전화번호" value={extra_vars.office_phone_number} />
                    <InfoRow label="직장 주소" value={extra_vars.office_address} />
                    <div className="py-2 text-sm">
                      <dt className="text-muted-foreground font-medium mb-1">주요 경력</dt>
                      <dd className="text-foreground whitespace-pre-wrap">{extra_vars.office_career || "-"}</dd>
                    </div>
                  </dl>
                )}
              </fetcher.Form>
            </CardContent>
          </Card>

          {/* 설정 (알림/검색) */}
          <Card>
            <CardContent className="pt-6">
              <fetcher.Form method="post" id="form-settings">
                <input type="hidden" name="intent" value="settings" />
                <SectionHeader title="설정" sectionId="settings" isEditing={editingSection === "settings"} />
                {editingSection === "settings" ? (
                  <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-muted-foreground">알림 설정</h4>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="allow_mailing" 
                          name="allow_mailing" 
                          value="Y" 
                          defaultChecked={profile?.allow_mailing ?? false} 
                        />
                        <Label htmlFor="allow_mailing" className="cursor-pointer">메일 수신 동의</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="allow_message" 
                          name="allow_message" 
                          value="Y" 
                          defaultChecked={profile?.allow_message ?? false} 
                        />
                        <Label htmlFor="allow_message" className="cursor-pointer">메시지 수신 동의</Label>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t space-y-3">
                      <h4 className="text-sm font-bold text-muted-foreground">검색 정보 공개 설정</h4>
                      <div className="flex items-center space-x-3 mb-2">
                        <Checkbox 
                          id="search_agree" 
                          name="search_agree" 
                          value="Y" 
                          defaultChecked={extra_vars.search_agree === "Y"}
                          onCheckedChange={(checked) => {
                            const isChecked = !!checked;
                            const targets = ["o_cellphone_number", "o_email_address", "o_office_name", "o_office_position"];
                            targets.forEach(id => {
                              // We need to trigger change on these as well
                              // Note: This manual manipulation of DOM elements is a bit fragile with shadcn Checkbox
                              // but let's see if we can use the id-based selection.
                              const el = document.querySelector(`button[id="${id}"]`) as HTMLButtonElement | null;
                              if (el && el.getAttribute('aria-checked') !== (isChecked ? 'true' : 'false')) {
                                el.click();
                              }
                            });
                          }}
                        />
                        <Label htmlFor="search_agree" className="font-bold cursor-pointer text-snublue">동문 검색 결과에서 내 정보 공개 동의</Label>
                      </div>
                      <div className="ml-6 grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox id="o_cellphone_number" name="o_cellphone_number" value="Y" defaultChecked={extra_vars.o_cellphone_number === "Y"} />
                          <Label htmlFor="o_cellphone_number" className="text-sm cursor-pointer font-medium">휴대폰</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox id="o_email_address" name="o_email_address" value="Y" defaultChecked={extra_vars.o_email_address === "Y"} />
                          <Label htmlFor="o_email_address" className="text-sm cursor-pointer font-medium">이메일</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox id="o_office_name" name="o_office_name" value="Y" defaultChecked={extra_vars.o_office_name === "Y"} />
                          <Label htmlFor="o_office_name" className="text-sm cursor-pointer font-medium">직장명</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox id="o_office_position" name="o_office_position" value="Y" defaultChecked={extra_vars.o_office_position === "Y"} />
                          <Label htmlFor="o_office_position" className="text-sm cursor-pointer font-medium">직책</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <dl>
                    <InfoRow label="메일 수신" value={profile?.allow_mailing ? "동의" : "거부"} />
                    <InfoRow label="메시지 수신" value={profile?.allow_message ? "동의" : "거부"} />
                    <InfoRow label="검색 정보 공개" value={extra_vars.search_agree === "Y" ? "동의" : "거부"} />
                    {extra_vars.search_agree === "Y" && (
                      <div className="py-2 text-sm ml-4 border-l-2 pl-4">
                        <dt className="text-muted-foreground font-medium mb-1">공개 항목</dt>
                        <dd className="text-foreground flex gap-3 flex-wrap">
                          {extra_vars.o_cellphone_number === "Y" && <span>휴대폰</span>}
                          {extra_vars.o_email_address === "Y" && <span>이메일</span>}
                          {extra_vars.o_office_name === "Y" && <span>직장명</span>}
                          {extra_vars.o_office_position === "Y" && <span>직책</span>}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </fetcher.Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
