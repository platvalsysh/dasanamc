import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { useSearchParams } from "react-router";

export default function Page() {
  let [searchParams] = useSearchParams();

  return (
    <div className="flex-1 flex w-full items-center justify-center p-6 md:p-10 min-h-[500px]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-600">
                오류가 발생했습니다
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchParams?.get("error") ? (
                <p className="text-sm text-muted-foreground">
                  에러 코드: {searchParams?.get("error")}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
