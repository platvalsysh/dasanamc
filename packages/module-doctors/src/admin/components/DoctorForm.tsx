import { Form } from "react-router";
import { Button, Input, Textarea } from "@repo/ui-admin";
import type { CenterOption, DoctorView } from "../../types";

interface DoctorFormProps {
  doctor?: DoctorView;
  centers: CenterOption[];
  error?: string;
  isSubmitting: boolean;
  submitLabel: string;
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

/**
 * 등록/수정 공용 폼. multipart 로 전송 (사진 업로드).
 * 체크박스는 native input — 같은 name(centers) 을 여러 개 보내기 위해.
 */
export function DoctorForm({ doctor, centers, error, isSubmitting, submitLabel }: DoctorFormProps) {
  return (
    <Form method="post" encType="multipart/form-data" className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="이름 *" htmlFor="name">
          <Input id="name" name="name" required maxLength={50} defaultValue={doctor?.name ?? ""} />
        </Field>
        <Field label="직책 *" htmlFor="title" hint="예: 대표원장 · 외과">
          <Input id="title" name="title" required maxLength={100} defaultValue={doctor?.title ?? ""} />
        </Field>
        <div className="md:col-span-2">
          <Field label="약력 요약" htmlFor="cred" hint="카드 상단에 한 줄로 노출됩니다.">
            <Input id="cred" name="cred" maxLength={500} defaultValue={doctor?.cred ?? ""} />
          </Field>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field label="정렬 순서" htmlFor="list_order" hint="작을수록 위에 표시됩니다.">
          <Input
            id="list_order"
            name="list_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={doctor?.listOrder ?? 0}
          />
        </Field>
        <label className="flex items-center gap-2 pt-7 text-sm text-gray-700">
          <input
            type="checkbox"
            name="is_chief"
            defaultChecked={doctor?.isChief ?? false}
            className="h-4 w-4 rounded border-gray-300"
          />
          대표원장 (CHIEF DIRECTOR 섹션에 표시)
        </label>
        <label className="flex items-center gap-2 pt-7 text-sm text-gray-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={doctor?.isActive ?? true}
            className="h-4 w-4 rounded border-gray-300"
          />
          사이트에 노출
        </label>
      </section>

      <section className="space-y-6">
        <Field label="진료 철학 인용구" htmlFor="quote">
          <Input id="quote" name="quote" maxLength={300} defaultValue={doctor?.quote ?? ""} />
        </Field>
        <Field label="인사말" htmlFor="greeting">
          <Textarea id="greeting" name="greeting" rows={5} maxLength={3000} defaultValue={doctor?.greeting ?? ""} />
        </Field>
        <Field label="전체 약력" htmlFor="career" hint="한 줄에 하나씩 입력하세요.">
          <Textarea
            id="career"
            name="career"
            rows={10}
            defaultValue={(doctor?.career ?? []).join("\n")}
          />
        </Field>
      </section>

      <section>
        <div className="block text-sm font-medium text-gray-700 mb-2">담당 센터</div>
        {centers.length === 0 ? (
          <p className="text-sm text-gray-500">등록된 센터 선택지가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {centers.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="centers"
                  value={c.id}
                  defaultChecked={doctor?.centers.includes(c.id) ?? false}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {c.label}
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="block text-sm font-medium text-gray-700">사진</div>
        {doctor?.photoUrl && (
          <div className="flex items-start gap-4">
            <img
              src={doctor.photoUrl}
              alt={`${doctor.name} 현재 사진`}
              className="h-40 w-32 rounded-md object-cover object-top bg-gray-100"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="remove_photo" className="h-4 w-4 rounded border-gray-300" />
              현재 사진 삭제
            </label>
          </div>
        )}
        <Field
          label="사진 업로드"
          htmlFor="photo"
          hint="PNG · JPG · WebP, 10MB 이하. 배경 제거된 세로 컷아웃을 권장합니다. 업로드하면 기존 사진을 대체합니다."
        >
          <Input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
        </Field>
        <Field
          label="사진 URL (직접 입력)"
          htmlFor="photo_url"
          hint="업로드 대신 정적 경로(/images/doctors/….png)나 외부 URL 을 쓸 때. 업로드 사진이 있으면 업로드가 우선합니다."
        >
          <Input
            id="photo_url"
            name="photo_url"
            maxLength={500}
            defaultValue={doctor?.photoFileId ? "" : (doctor?.photoUrl ?? "")}
          />
        </Field>
      </section>

      <div className="flex justify-end gap-2 border-t pt-6">
        <Button type="button" variant="outline" asChild>
          <a href="/admin/doctors">취소</a>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중…" : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
