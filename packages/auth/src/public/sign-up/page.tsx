import { useState, useMemo, useEffect } from "react";
import crypto from "node:crypto";
import { useAuthServerContext, useSupabaseServerContext } from "../../.server";
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
  Textarea
} from "@repo/ui";
import {
  type ActionFunctionArgs,
  Link,
  type LoaderFunctionArgs,
  redirect,
  useFetcher,
  useSearchParams,
} from "react-router";
import { prisma } from "@repo/database";
import { z } from "zod";

const VERIFY_SECRET = process.env.AUTH_SECRET || "default-secret-for-phone-verify";

function signVerificationToken(phone: string, code: string): string {
  const expiry = Date.now() + 5 * 60 * 1000; // 5 min
  const payload = `${phone}:${expiry}`;
  const signature = crypto.createHmac("sha256", VERIFY_SECRET).update(`${phone}:${code}:${expiry}`).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

function verifyVerificationToken(phone: string, token: string, code: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const [tPhone, tExpiry, tSignature] = parts;
    if (tPhone !== phone) return false;
    if (Date.now() > parseInt(tExpiry)) return false;
    const expectedSignature = crypto.createHmac("sha256", VERIFY_SECRET).update(`${tPhone}:${code}:${tExpiry}`).digest("hex");
    return expectedSignature === tSignature;
  } catch {
    return false;
  }
}

function signVerifiedToken(phone: string): string {
  const expiry = Date.now() + 60 * 60 * 1000; // 1 hour for form filling
  const payload = `verified:${phone}:${expiry}`;
  const signature = crypto.createHmac("sha256", VERIFY_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

function verifyVerifiedToken(phone: string, token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return false;
    const [prefix, tPhone, tExpiry, tSignature] = parts;
    if (prefix !== "verified" || tPhone !== phone) return false;
    if (Date.now() > parseInt(tExpiry)) return false;
    const expectedSignature = crypto.createHmac("sha256", VERIFY_SECRET).update(`${prefix}:${tPhone}:${tExpiry}`).digest("hex");
    return expectedSignature === tSignature;
  } catch {
    return false;
  }
}

/**
 * 리버스 프록시 환경을 고려하여 Request 객체로부터 실제 Origin을 추출합니다.
 */
export function getRequestOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") || 
    request.headers.get("host");

  // 프록시가 https를 사용했는지 확인 (기본값은 request.url의 프로토콜)
  const protocol = 
    request.headers.get("x-forwarded-proto") === "https" ? "https" : "http";

  if (!host) {
    // 호스트 정보를 찾을 수 없는 경우 Fallback
    const url = new URL(request.url);
    return url.origin;
  }

  return `${protocol}://${host}`;
}

const SignUpSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  display_name: z.string().min(1, "닉네임을 입력해 주세요."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
  "repeat-password": z.string(),
  name_kor: z.string().min(1, "이름을 입력해 주세요."),
  sex: z.string().min(1, "성별을 선택해 주세요."),
  cellphone_number: z.string().min(1, "휴대폰 번호를 입력해 주세요."),
  phone_number: z.string().optional(),
  address: z.string().optional(),
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
  office_name: z.string().optional(),
  office_position: z.string().optional(),
  job_class: z.string().optional(),
  office_phone_number: z.string().optional(),
  office_area: z.string().optional(),
  office_address: z.string().optional(),
  office_career: z.string().optional(),
  search_agree: z.enum(["Y", "N"]).default("N"),
  o_cellphone_number: z.enum(["Y", "N"]).default("N"),
  o_email_address: z.enum(["Y", "N"]).default("N"),
  o_office_name: z.enum(["Y", "N"]).default("N"),
  o_office_position: z.enum(["Y", "N"]).default("N"),
  allow_mailing: z.enum(["Y", "N"]).default("N"),
  allow_message: z.enum(["Y", "N"]).default("N"),
}).refine((data) => data.password === data["repeat-password"], {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["repeat-password"],
}).refine((data) => {
  // 학사 학과, 석사 전공, 박사 전공 중 하나라도 입력되었는지 확인
  return !!(data.major || data.master_major || data.doctor_major);
}, {
  message: "학사, 석사, 박사 정보 중 최소 하나는 입력하거나 선택해야 합니다.",
  path: ["major"] // 학력 정보 섹션의 첫 번째 관련 필드에 매핑
});

export async function loader({ context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  const isLogged = auth.isLogged();
  if (isLogged) {
    return redirect("/");
  }
  return {};
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const supabase = useSupabaseServerContext(context);
  const origin = getRequestOrigin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "send-code") {
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
        variables: {
          "#{인증번호}": code,
        },
      });
      const token = signVerificationToken(phone, code);
      return { success: true, token, message: "인증번호가 발송되었습니다." };
    } catch (e) {
      console.error("SMS Send Error:", e);
      return { error: "인증번호 발송에 실패했습니다." };
    }
  }

  if (intent === "verify-code") {
    const phone = formData.get("cellphone_number") as string;
    const code = formData.get("verify_code") as string;
    const token = formData.get("token") as string;
    
    if (verifyVerificationToken(phone, token, code)) {
      const verifiedToken = signVerifiedToken(phone);
      return { success: true, verified: true, verifiedToken, message: "인증되었습니다." };
    }
    return { error: "인증번호가 일치하지 않거나 만료되었습니다." };
  }

  const rawValues = Object.fromEntries(formData.entries());
  rawValues.search_agree = rawValues.search_agree === "Y" ? "Y" : "N";
  rawValues.o_cellphone_number = rawValues.o_cellphone_number === "Y" ? "Y" : "N";
  rawValues.o_email_address = rawValues.o_email_address === "Y" ? "Y" : "N";
  rawValues.o_office_name = rawValues.o_office_name === "Y" ? "Y" : "N";
  rawValues.o_office_position = rawValues.o_office_position === "Y" ? "Y" : "N";
  rawValues.allow_mailing = rawValues.allow_mailing === "Y" ? "Y" : "N";
  rawValues.allow_message = rawValues.allow_message === "Y" ? "Y" : "N";

  const result = SignUpSchema.safeParse(rawValues);

  if (!result.success) {
    return { 
      // ZodError issues use 'issues', not 'errors'
      error: result.error.issues[0]?.message || "입력 정보가 올바르지 않습니다." 
    };
  }

  const data = result.data;

  // Re-verify phone using the long-lived verifiedToken
  const verifiedToken = formData.get("verifiedToken") as string;
  if (!verifyVerifiedToken(data.cellphone_number, verifiedToken)) {
    return { error: "휴대폰 인증 정보가 올바르지 않거나 만료되었습니다. 다시 인증해 주세요." };
  }

  const cleanCellphone = data.cellphone_number.replace(/-/g, "");
  const cleanPhone = data.phone_number?.replace(/-/g, "") || "";

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    phone: cleanCellphone,
    options: {
      emailRedirectTo: `${origin}/`,
      data: {
        display_name: data.display_name,
      }
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const userId = signUpData.user?.id;
  if (userId) {
    try {
      const extraVars = {
        user_name: data.name_kor,
        cellphone_number: cleanCellphone,
        sex: data.sex,

        office_name: data.office_name || "",
        office_position: data.office_position || "",
        job_class: data.job_class || "",
        phone_number: cleanPhone,
        address: data.address || "",
        major: data.major || "",

        graduate_number: data.graduate_number || "",
        graduate_year: data.graduate_year || "",
        graduate_month: data.graduate_month || "",

        master_major: data.master_major || "",
        master_graduate_number: data.master_graduate_number || "",
        master_graduate_year: data.master_graduate_year || "",
        master_graduate_month: data.master_graduate_month || "",

        doctor_major: data.doctor_major || "",
        doctor_graduate_number: data.doctor_graduate_number || "",
        doctor_graduate_year: data.doctor_graduate_year || "",
        doctor_graduate_month: data.doctor_graduate_month || "",

        office_address: data.office_address || "",
        office_phone_number: data.office_phone_number || "",
        office_area: data.office_area || "",

        enter_year: data.enter_year || "",
        search_agree: data.search_agree,
        
        office_career: data.office_career || "",
        is_major: data.major ? "Y" : "N",
        is_master: data.master_major ? "Y" : "N",
        is_doctor: data.doctor_major ? "Y" : "N",
        
        o_cellphone_number: data.o_cellphone_number,
        o_email_address: data.o_email_address,
        o_office_name: data.o_office_name,
        o_office_position: data.o_office_position,
        // o_user_name: "Y",
        // o_graduate: "Y",
      };

      await prisma.profiles.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          display_name: data.display_name,
          allow_mailing: data.allow_mailing === "Y",
          allow_message: data.allow_message === "Y",
          extra_vars: extraVars,
        },
        update: {
          display_name: data.display_name,
          allow_mailing: data.allow_mailing === "Y",
          allow_message: data.allow_message === "Y",
          extra_vars: extraVars,
        },
      });
    } catch (e) {
      console.error("Failed to create profile record:", e);
    }
  }

  return redirect("/auth/sign-up?success");
};

export default function SignUp() {
  const fetcher = useFetcher<typeof action>();
  let [searchParams] = useSearchParams();

  const [showBachelor, setShowBachelor] = useState(false);
  const [showMaster, setShowMaster] = useState(false);
  const [showDoctor, setShowDoctor] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const success = !!searchParams.has("success");
  
  // Handle fetcher data
  useMemo(() => {
    if (fetcher.data?.success) {
      if (fetcher.data.token) {
        setVerificationToken(fetcher.data.token);
        setShowVerifyCode(true);
        
        try {
          const decoded = atob(fetcher.data.token);
          const expiry = parseInt(decoded.split(":")[1]);
          setTimeLeft(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));
        } catch (e) {
          setTimeLeft(300); // 5 min fallback
        }
      }
      if (fetcher.data.verified) {
        setIsVerified(true);
        if (fetcher.data.verifiedToken) {
          setVerifiedToken(fetcher.data.verifiedToken);
        }
      }
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

  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";

  const inputClass = "flex h-9 w-full rounded-none border border-input bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const result = [];
    for (let i = currentYear; i >= 1900; i--) {
      result.push(i.toString());
    }
    return result;
  }, []);

  return (
    <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10 text-foreground bg-background/50 min-h-[600px]">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col gap-8">
          {success ? (
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl">
                  회원가입을 축하합니다!
                </CardTitle>
                <CardDescription>이메일을 확인해주세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  성공적으로 가입되었습니다. 가입하신 이메일로 받은 확인 메일을 통해 계정을 활성화해 주세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-snublue">회원가입</h1>
                <p className="text-muted-foreground text-lg">새로운 계정을 생성하고 동문 네트워크에 참여하세요.</p>
              </div>

              <Card className="border-none shadow-none bg-transparent p-0">
                <fetcher.Form method="post">
                  <div className="flex flex-col gap-8">
                    {/* 계정 정보 섹션 */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-snubeige/30" />
                        <h3 className="text-xl font-bold text-snublue shrink-0">계정 정보</h3>
                        <div className="h-px flex-1 bg-snubeige/30" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">이메일 주소 <span className="text-red-500">*</span></Label>
                          <Input id="email" name="email" type="email" placeholder="example@example.com" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="display_name">닉네임 <span className="text-red-500">*</span></Label>
                          <Input id="display_name" name="display_name" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">비밀번호 <span className="text-red-500">*</span></Label>
                          <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="repeat-password">비밀번호 확인 <span className="text-red-500">*</span></Label>
                          <Input id="repeat-password" name="repeat-password" type="password" required />
                        </div>
                      </div>
                    </div>

                    {/* 개인 정보 섹션 */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-snubeige/30" />
                        <h3 className="text-xl font-bold text-snublue shrink-0">개인 정보</h3>
                        <div className="h-px flex-1 bg-snubeige/30" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name_kor">이름 <span className="text-red-500">*</span></Label>
                          <Input id="name_kor" name="name_kor" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="sex">성별 <span className="text-red-500">*</span></Label>
                          <Select name="sex">
                            <SelectTrigger className="w-full h-9">
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
                              required 
                              placeholder="010-0000-0000" 
                              className="flex-1"
                              readOnly={isVerified} 
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="shrink-0 h-9" 
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
                              {verificationToken ? "재발송" : "인증번호 발송"}
                            </Button>
                          </div>
                        </div>
                        {showVerifyCode && (
                          <div className="grid gap-2">
                            <Label htmlFor="verify_code" className="flex justify-between items-center">
                              <span>인증번호 <span className="text-red-500">*</span></span>
                              {!isVerified && timeLeft > 0 && (
                                <span className="text-xs text-red-500 font-medium">유효 시간 ({formatTime(timeLeft)})</span>
                              )}
                              {!isVerified && timeLeft === 0 && (
                                <span className="text-xs text-red-500 font-medium whitespace-nowrap">시간 초과 (재발송 필요)</span>
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
                              <input type="hidden" name="token" value={verificationToken} />
                              <input type="hidden" name="verifiedToken" value={verifiedToken} />
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="shrink-0 h-9"
                                disabled={isVerified || timeLeft === 0}
                                onClick={() => {
                                  const phone = (document.getElementById("cellphone_number") as HTMLInputElement)?.value;
                                  const code = (document.getElementById("verify_code") as HTMLInputElement)?.value;
                                  if (!code) return alert("인증번호를 입력해 주세요.");
                                  const fd = new FormData();
                                  fd.append("intent", "verify-code");
                                  fd.append("cellphone_number", phone);
                                  fd.append("verify_code", code);
                                  fd.append("token", verificationToken);
                                  fetcher.submit(fd, { method: "post" });
                                }}
                              >
                                {isVerified ? "인증 완료" : "확인"}
                              </Button>
                            </div>
                            {isVerified && <p className="text-xs text-green-600 font-medium">인증되었습니다.</p>}
                            {!isVerified && error && (
                              <p className="text-xs text-red-500 font-medium">{error}</p>
                            )}
                          </div>
                        )}
                        <div className="grid gap-2">
                          <Label htmlFor="phone_number">자택 전화번호</Label>
                          <Input id="phone_number" name="phone_number" />
                        </div>
                        <div className="grid gap-2">
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="address">자택 주소</Label>
                          <Input id="address" name="address" />
                        </div>
                      </div>
                    </div>

                    {/* 학력 정보 섹션 */}
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="h-px flex-1 bg-snubeige/30" />
                          <h3 className="text-xl font-bold text-snublue shrink-0">학력 정보 <span className="text-red-500">*</span></h3>
                          <div className="h-px flex-1 bg-snubeige/30" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">학사, 석사, 박사 중 최소 하나 이상의 학위 정보를 입력해 주세요.</p>
                      </div>
                      
                      <datalist id="year-list">
                        {years.map((y) => (
                          <option key={y} value={y} />
                        ))}
                      </datalist>

                      {/* 학사 섹션 */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="has_bachelor" 
                            checked={showBachelor} 
                            onChange={(e) => setShowBachelor(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                          />
                          <Label htmlFor="has_bachelor" className="text-base font-medium">학사</Label>
                        </div>
                        
                        {showBachelor && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-6 border-l-2 border-snubeige/50 py-4 bg-snubeige/5 rounded-r-lg transition-all">
                            <div className="grid gap-2">
                              <Label htmlFor="enter_year">입학 년도 <span className="text-red-500">*</span></Label>
                              <Input id="enter_year" name="enter_year" list="year-list" placeholder="YYYY" required={showBachelor} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                              <Label htmlFor="major">졸업 학과 <span className="text-red-500">*</span></Label>
                              <Select name="major">
                                <SelectTrigger className="w-full h-9">
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
                              <Input id="graduate_year" name="graduate_year" list="year-list" placeholder="YYYY" required={showBachelor} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="graduate_month">졸업 월</Label>
                              <Select name="graduate_month">
                                <SelectTrigger className="w-full h-9">
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
                              <Input id="graduate_number" name="graduate_number" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 석사 섹션 */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="has_master" 
                            checked={showMaster} 
                            onChange={(e) => setShowMaster(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                          />
                          <Label htmlFor="has_master" className="text-base font-medium">석사</Label>
                        </div>

                        {showMaster && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-6 border-l-2 border-snubeige/50 py-4 bg-snubeige/5 rounded-r-lg transition-all">
                            <div className="grid gap-2 md:col-span-3">
                              <Label htmlFor="master_major">전공 <span className="text-red-500">*</span></Label>
                              <Select name="master_major">
                                <SelectTrigger className="w-full h-9">
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
                              <Input id="master_graduate_year" name="master_graduate_year" list="year-list" placeholder="YYYY" required={showMaster} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="master_graduate_month">졸업 월</Label>
                              <Select name="master_graduate_month">
                                <SelectTrigger className="w-full h-9">
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
                              <Input id="master_graduate_number" name="master_graduate_number" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 박사 섹션 */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="has_doctor" 
                            checked={showDoctor} 
                            onChange={(e) => setShowDoctor(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                          />
                          <Label htmlFor="has_doctor" className="text-base font-medium">박사</Label>
                        </div>

                        {showDoctor && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-6 border-l-2 border-snubeige/50 py-4 bg-snubeige/5 rounded-r-lg transition-all">
                            <div className="grid gap-2 md:col-span-3">
                              <Label htmlFor="doctor_major">전공 <span className="text-red-500">*</span></Label>
                              <Select name="doctor_major">
                                <SelectTrigger className="w-full h-9">
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
                              <Input id="doctor_graduate_year" name="doctor_graduate_year" list="year-list" placeholder="YYYY" required={showDoctor} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="doctor_graduate_month">졸업 월</Label>
                              <Select name="doctor_graduate_month">
                                <SelectTrigger className="w-full h-9">
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
                              <Input id="doctor_graduate_number" name="doctor_graduate_number" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 직장 정보 섹션 */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-snubeige/30" />
                        <h3 className="text-xl font-bold text-snublue shrink-0">직장 정보</h3>
                        <div className="h-px flex-1 bg-snubeige/30" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="office_name">현/최종 직장명</Label>
                          <Input id="office_name" name="office_name" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="office_position">부서명/직책</Label>
                          <Input id="office_position" name="office_position" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="job_class">직업군</Label>
                          <Select name="job_class">
                            <SelectTrigger className="w-full h-9">
                              <SelectValue placeholder=":: 선택 ::" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="- 전공 기업">- 전공 기업</SelectItem>
                              <SelectItem value="- 전공 외 기업 (금융 등)">- 전공 외 기업 (금융 등)</SelectItem>
                              <SelectItem value="- 외국계 기업">- 외국계 기업</SelectItem>
                              <SelectItem value="- 교육기관">- 교육기관</SelectItem>
                              <SelectItem value="- 국공립연구기관">- 국공립연구기관</SelectItem>
                              <SelectItem value="- 전문직업 (공무원, 회계사. 변리사, 의사 등 자격증 위주)">- 전문직업 (공무원, 회계사. 변리사, 의사 등 자격증 위주)</SelectItem>
                              <SelectItem value="- 기타">- 기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="office_area">직장 지역</Label>
                          <Select name="office_area">
                            <SelectTrigger className="w-full h-9">
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
                          <Input id="office_phone_number" name="office_phone_number" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="office_address">직장 주소</Label>
                          <Input id="office_address" name="office_address" />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="office_career">주요 경력</Label>
                          <Textarea 
                            id="office_career" 
                            name="office_career" 
                            className="bg-transparent min-h-[100px]"
                            placeholder="주요 경력을 입력해 주세요."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-snubeige/30" />
                        <h3 className="text-xl font-bold text-snublue shrink-0">공개 설정</h3>
                        <div className="h-px flex-1 bg-snubeige/30" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="allow_mailing" name="allow_mailing" value="Y" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                          <Label htmlFor="allow_mailing">메일 수신을 동의합니다.</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="allow_message" name="allow_message" value="Y" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                          <Label htmlFor="allow_message">메시지 수신을 동의합니다.</Label>
                        </div>
                        
                        <div className="pt-4 border-t mt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <input 
                              type="checkbox" 
                              id="search_agree" 
                              name="search_agree" 
                              value="Y" 
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const targets = ["o_cellphone_number", "o_email_address", "o_office_name", "o_office_position"];
                                targets.forEach(id => {
                                  const el = document.getElementById(id) as HTMLInputElement;
                                  if (el) el.checked = checked;
                                });
                              }}
                            />
                            <Label htmlFor="search_agree" className="font-bold">동문 검색 결과에서 내 정보가 공개되는 것에 동의합니다.</Label>
                          </div>
                          
                          <div className="ml-6 grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="o_cellphone_number" name="o_cellphone_number" value="Y" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                              <Label htmlFor="o_cellphone_number" className="text-sm">휴대폰</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="o_email_address" name="o_email_address" value="Y" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                              <Label htmlFor="o_email_address" className="text-sm">이메일</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="o_office_name" name="o_office_name" value="Y" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                              <Label htmlFor="o_office_name" className="text-sm">직장명</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="o_office_position" name="o_office_position" value="Y" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                              <Label htmlFor="o_office_position" className="text-sm">직책</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
                    
                    <Button 
                      type="submit" 
                      size="lg"
                      className="flex-1 h-14 text-lg font-bold bg-snublue hover:bg-snublue/90 rounded-none transition-all hover:scale-[1.01] active:scale-[0.99]" 
                      disabled={loading || (showVerifyCode && !isVerified)}
                      onClick={(e) => {
                        if (showVerifyCode && !isVerified) {
                          e.preventDefault();
                          alert("휴대폰 인증을 완료해 주세요.");
                        }
                      }}
                    >
                      {loading ? "가입 처리 중..." : "회원가입 완료"}
                    </Button>
                  </div>

                  <div className="mt-8 text-center text-sm text-muted-foreground">
                    이미 계정이 있으신가요?{" "}
                    <Link
                      to="/auth/login"
                      className="text-snublue font-semibold hover:underline underline-offset-4"
                    >
                      로그인
                    </Link>
                  </div>
                </fetcher.Form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
