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
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { useAuthServerContext, useSupabaseServerContext } from "../../.server";
import { prisma } from "@repo/database";
import crypto from "crypto";
import bcrypt from "bcrypt";
import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { getAuthLoginConfig } from "../../.server/server-config";

export async function loader({ context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  const isLogged = auth.isLogged();
  if (isLogged) {
    return redirect("/");
  }
  return {};
}

function isOldPassword(password: string, encrypted_password: string) {
  const passwordMd5 = crypto
    .createHash("md5")
    .update(password, "utf8")
    .digest("hex");
  return passwordMd5.toLowerCase() === encrypted_password.toLowerCase();
}

async function updateUserPassword(id: string, password: string) {
  const encrypted_password = await bcrypt.hash(password, 10);
  await prisma.users.update({
    where: {
      id,
    },
    data: {
      encrypted_password,
    },
  });
}

async function resolveCredentialFromIdentifier(
  identifier: string,
  password: string,
): Promise<{ credentials: SignInWithPasswordCredentials; error?: string }> {
  const config = await getAuthLoginConfig();
  const notFoundCredential = {
    credentials: { email: identifier, password },
    error: "아이디 또는 비밀번호가 올바르지 않습니다.",
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
    if (user && user.encrypted_password) {
      if (isOldPassword(password, user.encrypted_password)) {
        await updateUserPassword(user.id, password);
      } else if (!bcrypt.compareSync(password, user.encrypted_password)) {
        return notFoundCredential;
      }
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
      where: {
        identifier: identifier,
      },
      select: {
        user_id: true,
      },
    });
    if (userInfo) {
      const user = await prisma.users.findFirst({
        where: {
          id: userInfo.user_id,
          deleted_at: null,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          encrypted_password: true,
        },
      });
      if (user && user.encrypted_password) {
        if (isOldPassword(password, user.encrypted_password)) {
          await updateUserPassword(user.id, password);
        } else if (!bcrypt.compareSync(password, user.encrypted_password)) {
          return notFoundCredential;
        }

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
  const supabase = useSupabaseServerContext(context);
  const formData = await request.formData();
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";

  const identifier = formData.get("identifier") as string; // Can be email or login_id
  const password = formData.get("password") as string;

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
