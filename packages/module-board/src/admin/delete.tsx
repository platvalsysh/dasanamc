import React from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { useState } from "react";
import { ModulesService } from "@repo/core/server";
import { Button, Input } from "@repo/ui-admin";

export async function loader({ params }: LoaderFunctionArgs) {
  const moduleData = await ModulesService.getModule(params.id!);

  if (!moduleData) {
    throw new Response("Not Found", { status: 404 });
  }

  return { module: moduleData };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const mid = formData.get("mid") as string;
  const confirm_mid = formData.get("confirm_mid") as string;

  if (mid !== confirm_mid) {
    return { error: "게시판 ID가 일치하지 않습니다." };
  }

  try {
    await ModulesService.deleteModule(params.id!);
    return redirect("/admin/board");
  } catch (e) {
    console.error(e);
    return { error: "게시판 삭제 중 오류가 발생했습니다." };
  }
}

export default function DeleteModulePage() {
  const { module } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [deleteId, setDeleteId] = useState("");

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-red-700">게시판 삭제</h1>

      <div className="bg-red-50 p-6 border border-red-200">
        <h2 className="text-lg font-bold text-red-900 mb-4">
          정말 삭제하시겠습니까?
        </h2>
        <p className="text-red-700 mb-6">
          <strong>{module.mid}</strong> ({module.browser_title || "제목 없음"})
          게시판을 삭제하면{" "}
          <span className="font-bold underline">
            연관된 모든 게시물, 댓글, 파일이 영구적으로 삭제됩니다.
          </span>{" "}
          이 작업은 되돌릴 수 없습니다.
        </p>

        <Form method="post" className="space-y-4">
          {actionData?.error && (
            <div className="bg-red-100 text-red-800 p-3 text-sm border-l-4 border-red-500">
              {actionData.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-red-900 mb-1">
              삭제를 확인하려면 <strong>{module.mid}</strong> 를 입력하세요.
            </label>
            <Input
              type="text"
              name="confirm_mid"
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              className="w-full bg-white border-red-300 focus:border-red-500"
              placeholder={module.mid}
            />
            <input type="hidden" name="mid" value={module.mid} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => history.back()}
              className="font-medium"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteId !== module.mid || isSubmitting}
              className="font-bold"
            >
              {isSubmitting ? "삭제 중..." : "게시판 영구 삭제"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
