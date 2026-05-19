import { AlertTriangle } from "lucide-react";

/**
 * 시스템 설정 페이지가 form 만 있고 아직 시스템 동작에 반영되지 않을 때 띄우는 안내 배너.
 *
 * 외주 운영자가 설정 저장 후 효과가 없다고 혼란스러워하는 걸 막기 위함.
 * 해당 시스템과 통합되면 이 배너는 제거하면 됨.
 */
export function NotImplementedBanner({
  feature,
}: {
  /** 사용자에게 보일 기능 이름. 예: "이메일 발송", "자동 백업" */
  feature: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">{feature} 통합은 아직 준비 중입니다</p>
        <p className="mt-1 text-xs">
          이 페이지의 설정은 DB 에 저장되지만, 시스템 동작과는 아직 연결되지
          않았습니다. 외주 클라이언트에서 실제로 사용하려면 별도 통합 작업이
          필요합니다.
        </p>
      </div>
    </div>
  );
}
