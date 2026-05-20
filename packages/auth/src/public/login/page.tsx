import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Input,
  Label
} from "@repo/ui";
import {
  Link,
  redirect,
  useFetcher,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { useAuthServerContext, useSupabaseServerContext } from "../../.server";
import { prisma } from "@repo/database";
import bcrypt from "bcrypt";
import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { getAuthLoginConfig } from "../../.server/server-config";
import { enforceRateLimit, getRequestIp } from "@repo/core/server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  const isLogged = auth.isLogged();
  if (isLogged) {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/";
    return redirect(redirectTo);
  }
  return {};
}

/**
 * 입력된 identifier (이메일 / 휴대폰 / 로그인 ID) 로 사용자 레코드를 찾아
 * Supabase signInWithPassword 에 넘길 credentials 형태로 변환.
 *
 * 비밀번호 검증은 bcrypt 만 사용. (chemeng 레거시 MD5 fallback 은 dasanamc
 * 에 무관하므로 제거 — audit C4)
 */
async function resolveCredentialFromIdentifier(
  identifier: string,
  password: string,
): Promise<{ credentials: SignInWithPasswordCredentials; error?: string }> {
  const config = await getAuthLoginConfig();
  const notFoundCredential = {
    credentials: { email: identifier, password },
    error: "아이디 또는 비밀번호가 올바르지 않습니다.",
  };

  const passwordMatches = (encrypted: string | null) => {
    if (!encrypted) return false;
    if (!encrypted.startsWith("$2")) return false; // bcrypt prefix
    try {
      return bcrypt.compareSync(password, encrypted);
    } catch {
      return false;
    }
  };

  if (config.email || config.phone) {
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          config.email ? { email: identifier } : {},
          config.phone ? { phone: identifier } : {},
        ],
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        encrypted_password: true,
      },
    });
    if (user && passwordMatches(user.encrypted_password)) {
      if (config.email && user.email === identifier) {
        return { credentials: { email: user.email, password } };
      }
      if (config.phone && user.phone === identifier) {
        return { credentials: { phone: user.phone, password } };
      }
    }
  }
  if (config.login_id) {
    const userInfo = await prisma.identifiers.findFirst({
      where: { identifier },
      select: { user_id: true },
    });
    if (userInfo) {
      const user = await prisma.users.findFirst({
        where: { id: userInfo.user_id, deleted_at: null },
        select: {
          id: true,
          email: true,
          phone: true,
          encrypted_password: true,
        },
      });
      if (user && passwordMatches(user.encrypted_password)) {
        if (user.email) {
          return { credentials: { email: user.email, password } };
        }
        if (user.phone) {
          return { credentials: { phone: user.phone, password } };
        }
      }
    }
  }
  return notFoundCredential;
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  // audit C7 — IP 당 5분 / 10회 + identifier 당 5분 / 10회 동시 제한.
  // brute force 대응이며 정상 로그인 흐름은 영향 없음.
  // 폼 사용자는 fetcher.Form 으로 호출하므로 throw Response 가 inline 에러로
  // 매끄럽게 표시되지 않음. try/catch 로 받아 `{ error }` 객체로 변환.
  const supabase = useSupabaseServerContext(context);
  const formData = await request.formData();
  const url = new URL(request.url);
  const redirectTo =
    (formData.get("redirectTo") as string | null) ||
    url.searchParams.get("redirectTo") ||
    "/";

  const identifier = formData.get("identifier") as string; // Can be email or login_id
  const password = formData.get("password") as string;

  try {
    const ip = getRequestIp(request);
    await enforceRateLimit(
      `login:ip:${ip}`,
      10,
      5 * 60,
      "로그인 시도가 너무 잦습니다. 5분 후 다시 시도해 주세요.",
    );
    if (identifier) {
      await enforceRateLimit(
        `login:id:${identifier.toLowerCase().slice(0, 100)}`,
        10,
        5 * 60,
        "이 계정에 대한 로그인 시도가 너무 잦습니다. 5분 후 다시 시도해 주세요.",
      );
    }
  } catch (e) {
    if (e instanceof Response && e.status === 429) {
      const msg = await e.text();
      return { error: msg };
    }
    throw e;
  }

  // Step 1: Resolve email from identifier
  const { credentials, error } = await resolveCredentialFromIdentifier(
    identifier,
    password,
  );

  if (error) {
    return { error };
  }

  // Step 2: Try Supabase login
  const { error: signInError } =
    await supabase.auth.signInWithPassword(credentials);

  if (signInError) {
    return { error: signInError.message };
  }
  // Update this route to redirect to an authenticated route. The user already has an active session.
  return redirect(redirectTo);
};

export default function Login() {
  const fetcher = useFetcher<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";
  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";

  return (
    <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10 text-foreground bg-background/50 min-h-[600px]">
      <div className="w-full max-sm:max-w-sm max-w-md">
        <div className="flex flex-col gap-8">
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-4xl font-bold tracking-tight text-snublue">로그인</h1>
            <p className="text-muted-foreground">동문 네트워크에 로그인하세요.</p>
          </div>

          <Card className="border-none shadow-none bg-transparent p-0">
            <CardContent>
              <fetcher.Form method="post">
                {redirectTo && (
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                )}
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="identifier">이메일 또는 아이디</Label>
                    <Input
                      id="identifier"
                      name="identifier"
                      type="text"
                      placeholder="이메일 또는 아이디"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">비밀번호</Label>
                      <Link
                        to="/auth/forgot-password"
                        tabIndex={-1}
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        비밀번호를 잊으셨나요?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full h-14 text-lg font-bold bg-snublue hover:bg-snublue/90 rounded-none transition-all hover:scale-[1.01] active:scale-[0.99]" 
                    disabled={loading}
                  >
                    {loading ? "로그인 중..." : "로그인"}
                  </Button>
                </div>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                  아직 계정이 없으신가요?{" "}
                  <Link
                    to="/auth/sign-up"
                    className="text-snublue font-semibold hover:underline underline-offset-4"
                  >
                    회원가입
                  </Link>
                </div>
              </fetcher.Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
