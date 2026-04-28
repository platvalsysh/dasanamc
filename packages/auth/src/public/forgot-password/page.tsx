import { useSupabaseServerContext } from "../../.server";
import { prisma } from "@repo/database";
import { Button } from "../components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/Card";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import {
  type ActionFunctionArgs,
  Link,
  data,
  redirect,
  useFetcher,
  useSearchParams,
} from "react-router";

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

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  const supabase = useSupabaseServerContext(context);
  const origin = getRequestOrigin(request);

  // Check if user exists and is not deleted
  const user = await prisma.users.findFirst({
    where: { email, deleted_at: null },
    select: { id: true },
  });

  if (!user) {
    // We return success to prevent email enumeration, 
    // but we don't send the reset email.
    return redirect("/auth/forgot-password?success");
  }

  // Send the actual reset password email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/auth/update-password`,
  });

  if (error) {
    return data({
      error: error instanceof Error ? error.message : "오류가 발생했습니다.",
      data: { email },
    });
  }

  return redirect("/auth/forgot-password?success");
};

{/* <h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">
    Reset Password
  </a>
</p> */}

export default function ForgotPassword() {
  const fetcher = useFetcher<typeof action>();
  let [searchParams] = useSearchParams();

  const success = !!searchParams.has("success");
  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";

  return (
    <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10 min-h-[500px]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {success ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">이메일을 확인해 주세요</CardTitle>
                <CardDescription>
                  비밀번호 재설정 안내 메일이 발송되었습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line text-balance">
                  가입하신 이메일 주소로 비밀번호를 재설정할 수 있는 링크를 보내드렸습니다. 이메일을 확인해 주세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">비밀번호 재설정</CardTitle>
                <CardDescription>
                  가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <fetcher.Form method="post">
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">이메일 주소</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@example.com"
                        required
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full font-bold" disabled={loading}>
                      {loading ? "발송 중..." : "재설정 링크 받기"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    계정이 이미 있으신가요?{" "}
                    <Link
                      to="/auth/login"
                      className="underline underline-offset-4 font-medium"
                    >
                      로그인
                    </Link>
                  </div>
                </fetcher.Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
