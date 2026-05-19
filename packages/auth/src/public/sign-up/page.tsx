import { useState, useEffect } from "react";
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
  CardDescription,
  CardHeader,
  CardTitle,
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
  Link,
  type LoaderFunctionArgs,
  data as routerData,
  redirect,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "react-router";
import { prisma } from "@repo/database";
import { z } from "zod";
import {
  emailSchema,
  displayNameSchema,
  passwordSchema,
  koreanNameSchema,
} from "@repo/schema";

/**
 * 리버스 프록시 환경을 고려하여 실제 Origin 추출.
 */
export function getRequestOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") === "https" ? "https" : "http";
  if (!host) return new URL(request.url).origin;
  return `${protocol}://${host}`;
}

/** 회원가입 정책에 맞춰 Zod 스키마를 동적 생성. */
function buildSignUpSchema(policy: AuthRegistrationConfig) {
  const shape: Record<string, z.ZodTypeAny> = {
    email: emailSchema,
    display_name: displayNameSchema,
    password: passwordSchema,
    "repeat-password": z.string(),
  };

  if (policy.collectName) {
    shape.name_kor = koreanNameSchema;
  }
  if (policy.collectPhone) {
    shape.cellphone_number = z.string().min(1, "휴대폰 번호를 입력해 주세요.");
  } else {
    shape.cellphone_number = z.string().optional();
  }
  if (policy.collectSex) {
    shape.sex = z.string().min(1, "성별을 선택해 주세요.");
  } else {
    shape.sex = z.string().optional();
  }
  if (policy.collectAddress) {
    shape.address = z.string().optional();
  }
  if (policy.marketingOptIn) {
    shape.allow_mailing = z.enum(["Y", "N"]).default("N");
  }
  if (policy.messageOptIn) {
    shape.allow_message = z.enum(["Y", "N"]).default("N");
  }

  return z
    .object(shape)
    .refine((d) => d.password === d["repeat-password"], {
      message: "비밀번호가 일치하지 않습니다.",
      path: ["repeat-password"],
    });
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (auth.isLogged()) {
    return redirect("/");
  }
  const policy = await getAuthRegistrationConfig();
  return { policy };
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const supabase = useSupabaseServerContext(context);
  const origin = getRequestOrigin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const policy = await getAuthRegistrationConfig();

  // 1) SMS 인증 코드 발송
  if (intent === "send-code") {
    if (!policy.smsVerification) {
      return { error: "SMS 인증이 비활성화되어 있습니다." };
    }
    const phone = formData.get("cellphone_number") as string;
    if (!phone) return { error: "휴대폰 번호를 입력해 주세요." };

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
        },
        { headers: { "Set-Cookie": setVerificationCookie(token) } },
      );
    } catch (e) {
      console.error("SMS Send Error:", e);
      return { error: "인증번호 발송에 실패했습니다." };
    }
  }

  // 2) SMS 인증 코드 검증
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
        { success: true, verified: true, message: "인증되었습니다." },
        { headers },
      );
    }
    return { error: "인증번호가 일치하지 않거나 만료되었습니다." };
  }

  // 3) 회원가입 본 제출
  const rawValues = Object.fromEntries(formData.entries());
  if (policy.marketingOptIn)
    rawValues.allow_mailing = rawValues.allow_mailing === "Y" ? "Y" : "N";
  if (policy.messageOptIn)
    rawValues.allow_message = rawValues.allow_message === "Y" ? "Y" : "N";

  const schema = buildSignUpSchema(policy);
  const result = schema.safeParse(rawValues);
  if (!result.success) {
    return {
      error:
        result.error.issues[0]?.message || "입력 정보가 올바르지 않습니다.",
    };
  }
  const data = result.data as Record<string, string | undefined>;

  // SMS 인증 정책이 켜져 있으면 verified 쿠키 재검증
  if (policy.smsVerification) {
    const verifiedToken = readCookie(request, VERIFIED_COOKIE);
    const cellphone = data.cellphone_number || "";
    if (!verifyVerifiedToken(cellphone, verifiedToken)) {
      return {
        error:
          "휴대폰 인증 정보가 올바르지 않거나 만료되었습니다. 다시 인증해 주세요.",
      };
    }
  }

  const cleanCellphone = (data.cellphone_number || "").replace(/-/g, "");

  // Supabase Auth signUp — emailVerification 정책에 따라 emailRedirectTo
  // 옵션 분기. email confirm 끄려면 Dashboard 의 Auth → Email auth →
  // "Confirm email" 도 동시에 꺼야 동작 (Supabase 측 정책).
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email!,
    password: data.password!,
    ...(cleanCellphone ? { phone: cleanCellphone } : {}),
    options: {
      emailRedirectTo: policy.emailVerification ? `${origin}/` : undefined,
      data: { display_name: data.display_name! },
    },
  });

  if (signUpError) return { error: signUpError.message };

  const userId = signUpData.user?.id;
  if (userId) {
    try {
      const extraVars: Record<string, string> = {};
      if (policy.collectName) extraVars.user_name = data.name_kor || "";
      if (policy.collectPhone) extraVars.cellphone_number = cleanCellphone;
      if (policy.collectSex) extraVars.sex = data.sex || "";
      if (policy.collectAddress) extraVars.address = data.address || "";

      await prisma.profiles.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          display_name: data.display_name!,
          allow_mailing: policy.marketingOptIn
            ? data.allow_mailing === "Y"
            : false,
          allow_message: policy.messageOptIn
            ? data.allow_message === "Y"
            : false,
          extra_vars: extraVars,
        },
        update: {
          display_name: data.display_name!,
          allow_mailing: policy.marketingOptIn
            ? data.allow_mailing === "Y"
            : false,
          allow_message: policy.messageOptIn
            ? data.allow_message === "Y"
            : false,
          extra_vars: extraVars,
        },
      });
    } catch (e) {
      console.error("Failed to create profile record:", e);
    }
  }

  return redirect("/auth/sign-up?success", {
    headers: policy.smsVerification
      ? { "Set-Cookie": clearCookie(VERIFIED_COOKIE) }
      : undefined,
  });
};

export default function SignUp() {
  const { policy } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [searchParams] = useSearchParams();

  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const error = fetcher.data && "error" in fetcher.data ? fetcher.data.error : undefined;
  const codeSent = fetcher.data && "codeSent" in fetcher.data;
  const verified = fetcher.data && "verified" in fetcher.data;
  const success = searchParams.get("success") !== null;
  const loading = fetcher.state === "submitting";

  useEffect(() => {
    if (codeSent) {
      setShowVerifyCode(true);
      setTimeLeft(300);
    }
    if (verified) setIsVerified(true);
  }, [codeSent, verified]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (success) {
    return (
      <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">가입 신청 완료</CardTitle>
            <CardDescription>
              {policy.emailVerification
                ? "입력하신 이메일로 인증 메일을 발송했습니다. 메일의 링크를 눌러 가입을 완료해 주세요."
                : "회원가입이 완료되었습니다. 로그인해 주세요."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/auth/login"
              className="text-blue-600 hover:underline text-sm"
            >
              로그인 페이지로
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendCode = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = (e.target as HTMLElement).closest("form") as HTMLFormElement;
    const phoneInput = form.querySelector(
      "input[name=cellphone_number]",
    ) as HTMLInputElement | null;
    if (!phoneInput || !phoneInput.value) {
      alert("휴대폰 번호를 입력해 주세요.");
      return;
    }
    const formData = new FormData();
    formData.append("intent", "send-code");
    formData.append("cellphone_number", phoneInput.value);
    fetcher.submit(formData, { method: "post" });
  };

  const handleVerifyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = (e.target as HTMLElement).closest("form") as HTMLFormElement;
    const phoneInput = form.querySelector(
      "input[name=cellphone_number]",
    ) as HTMLInputElement | null;
    const codeInput = form.querySelector(
      "input[name=verify_code]",
    ) as HTMLInputElement | null;
    if (!phoneInput || !codeInput) return;
    const formData = new FormData();
    formData.append("intent", "verify-code");
    formData.append("cellphone_number", phoneInput.value);
    formData.append("verify_code", codeInput.value);
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>아래 정보를 입력하고 가입하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <fetcher.Form method="post" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display_name">닉네임 *</Label>
              <Input id="display_name" name="display_name" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">비밀번호 확인 *</Label>
                <Input
                  id="repeat-password"
                  name="repeat-password"
                  type="password"
                  required
                />
              </div>
            </div>

            {policy.collectName && (
              <div className="grid gap-2">
                <Label htmlFor="name_kor">이름 *</Label>
                <Input id="name_kor" name="name_kor" required />
              </div>
            )}

            {policy.collectSex && (
              <div className="grid gap-2">
                <Label htmlFor="sex">성별 *</Label>
                <Select name="sex">
                  <SelectTrigger>
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">남성</SelectItem>
                    <SelectItem value="F">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {policy.collectPhone && (
              <div className="grid gap-2">
                <Label htmlFor="cellphone_number">
                  휴대폰 번호 {policy.smsVerification ? "*" : ""}
                </Label>
                {policy.smsVerification ? (
                  <div className="flex gap-2">
                    <Input
                      id="cellphone_number"
                      name="cellphone_number"
                      required
                      disabled={isVerified}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendCode}
                      disabled={isVerified || loading}
                    >
                      {isVerified ? "인증완료" : "인증번호 발송"}
                    </Button>
                  </div>
                ) : (
                  <Input id="cellphone_number" name="cellphone_number" />
                )}
                {policy.smsVerification && showVerifyCode && !isVerified && (
                  <div className="flex gap-2 items-center">
                    <Input
                      name="verify_code"
                      placeholder="6자리 인증번호"
                      maxLength={6}
                    />
                    <span className="text-xs text-red-600 font-mono w-12 text-right">
                      {formatTime(timeLeft)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyCode}
                      disabled={loading}
                    >
                      확인
                    </Button>
                  </div>
                )}
              </div>
            )}

            {policy.collectAddress && (
              <div className="grid gap-2">
                <Label htmlFor="address">주소</Label>
                <Textarea id="address" name="address" rows={2} />
              </div>
            )}

            {(policy.marketingOptIn || policy.messageOptIn) && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {policy.marketingOptIn && (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="allow_mailing" value="Y" />
                    마케팅 / 이메일 수신에 동의합니다
                  </label>
                )}
                {policy.messageOptIn && (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="allow_message" value="Y" />
                    쪽지 / 알림 수신에 동의합니다
                  </label>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading || (policy.smsVerification && !isVerified)
              }
            >
              {loading ? "처리 중..." : "회원가입"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/auth/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                로그인
              </Link>
            </p>
          </fetcher.Form>
        </CardContent>
      </Card>
    </div>
  );
}
