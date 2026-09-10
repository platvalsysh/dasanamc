import {
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { useAuthServerContext } from "@repo/auth/server";
import { DoctorsService } from "../.server/DoctorsService";
import { DoctorsOptions } from "../.server/DoctorsOptions";
import { parseDoctorForm, pickPhotoFile, toDoctorInput } from "../DoctorsSchemas";
import { DoctorForm } from "./components/DoctorForm";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["doctors.edit", "doctors.*"]);
  const doctor = await DoctorsService.getById(params.id!);
  if (!doctor) {
    throw new Response("의료진을 찾을 수 없습니다.", { status: 404 });
  }
  return { doctor, centers: DoctorsOptions.getCenters() };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["doctors.edit", "doctors.*"]);
  const id = params.id!;

  const formData = await request.formData();
  const parsed = parseDoctorForm(formData);
  if (!parsed.success) {
    return data({ error: parsed.error }, { status: 400 });
  }
  const photo = pickPhotoFile(formData);
  if (photo && "error" in photo) {
    return data({ error: photo.error }, { status: 400 });
  }

  try {
    const existing = await DoctorsService.getById(id);
    if (!existing) {
      return data({ error: "의료진을 찾을 수 없습니다." }, { status: 404 });
    }
    await DoctorsService.update(id, toDoctorInput(parsed.data));
    if (parsed.data.remove_photo) {
      await DoctorsService.removePhoto(id);
    }
    if (photo) {
      await DoctorsService.attachPhoto(id, photo.file, auth.getUser()?.id ?? null);
    }
    return redirect("/admin/doctors");
  } catch (e) {
    console.error("[doctors.update]", e);
    return data(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}

export default function DoctorsAdminEdit() {
  const { doctor, centers } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">의료진 수정</h1>
        <p className="text-sm text-gray-500 mt-1">
          {doctor.name} · {doctor.title}
        </p>
      </div>
      <DoctorForm
        doctor={doctor}
        centers={centers}
        error={actionData?.error}
        isSubmitting={navigation.state === "submitting"}
        submitLabel="저장"
      />
    </div>
  );
}
