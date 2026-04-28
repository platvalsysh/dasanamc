import { useSupabaseServerContext } from "../../.server";
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
import { type ActionFunctionArgs, redirect, useFetcher } from "react-router";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const supabase = useSupabaseServerContext(context);
  const formData = await request.formData();
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "새 비밀번호를 입력해 주세요." };
  }

  const { error } = await supabase.auth.updateUser({ password: password });

  if (error) {
    return {
      error: error instanceof Error ? error.message : "오류가 발생했습니다.",
    };
  }

  // Redirect to sign-in page after successful password update
  return redirect("/");
};

export default function Page() {
  const fetcher = useFetcher<typeof action>();

  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";

  return (
    <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10 min-h-[500px]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">새 비밀번호 설정</CardTitle>
              <CardDescription>
                새로 사용할 비밀번호를 입력해 주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <fetcher.Form method="post">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="password">새 비밀번호</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="새 비밀번호 입력"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full font-bold" disabled={loading}>
                    {loading ? "저장 중..." : "비밀번호 변경 완료"}
                  </Button>
                </div>
              </fetcher.Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
