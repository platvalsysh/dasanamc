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

export async function loader({ context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["doctors.edit", "doctors.*"]);
  return { centers: DoctorsOptions.getCenters() };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["doctors.edit", "doctors.*"]);

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
    const doctor = await DoctorsService.create(toDoctorInput(parsed.data));
    if (photo) {
      await DoctorsService.attachPhoto(doctor.id, photo.file, auth.getUser()?.id ?? null);
    }
    return redirect("/admin/doctors");
  } catch (e) {
    console.error("[doctors.create]", e);
    return data(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}

export default function DoctorsAdminNew() {
  const { centers } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">새 의료진 등록</h1>
      <DoctorForm
        centers={centers}
        error={actionData?.error}
        isSubmitting={navigation.state === "submitting"}
        submitLabel="등록"
      />
    </div>
  );
}
