import type { Route } from "./+types/greeting";
import { PageHeader } from "@repo/ui";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "대표원장 인사말 - 24시 다산 원동물의료센터" },
    {
      name: "description",
      content: "24시 다산 원동물의료센터 대표원장 인사말입니다.",
    },
  ];
}

export default function Greeting() {
  return (
    <div className="w-full">
      <PageHeader
        title="대표원장 인사말"
        description="아픈 아이를 안고 병원 문을 들어서는 보호자님께 드리는 약속입니다."
      />
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="space-y-12">

          {/* Content */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* TODO(template): 대표원장 실제 사진으로 교체 */}
            <div className="w-full md:w-1/3 shrink-0">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
                <img
                  src="/images/greeting.jpg"
                  alt="대표원장 이현우"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 space-y-6 leading-relaxed text-lg">
              <p>
                안녕하세요. 24시 다산 원동물의료센터 대표원장 이현우입니다.
              </p>
              <p>
                아픈 아이를 안고 병원 문을 들어서는 보호자님의 무거운 마음을
                저희는 매일 마주합니다. 짧게 끝나는 진료가 아니라, 진단부터
                수술과 회복까지 한 곳에서 끝까지 책임지는 동물병원이 되겠다는
                마음으로 다산원을 열었습니다.
              </p>

              <div className="space-y-4 bg-[color:var(--color-snubeige)]/40 dark:bg-gray-800/40 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-[color:var(--color-snublue)]">
                  세 가지 ONE 약속
                </h2>
                <ul className="space-y-3">
                  <li>
                    <strong>ONE-STOP.</strong> 11개 특화진료센터의 분과별 협진,
                    대학병원급 CT 당일 판독으로 진단·치료·회복을 한 곳에서.
                  </li>
                  <li>
                    <strong>ONE-DAY.</strong> 365일 24시간 연중무휴 진료.
                    낮에도 새벽에도, 응급은 늘 가능합니다.
                  </li>
                  <li>
                    <strong>ONE-FAMILY.</strong> 우리 아이를 가족처럼.
                    외과 전공 대표원장이 직접 집도하고, 6명의 석사 이상 의료진이
                    한 케이스를 함께 봅니다.
                  </li>
                </ul>
              </div>

              <p>
                특히 고양이는 예민한 동물입니다. 강아지와 분리된 전용 대기·
                처치·입원 공간을 운영하며, 고양이전문클리닉이 별도로 가동됩니다.
              </p>
              <p>
                의료의 본질은 결과만이 아니라 과정에 대한 신뢰라고 생각합니다.
                저희가 환자의 상태를 어떻게 판단했는지, 왜 이 치료를 선택했는지
                보호자님께 가능한 한 명확하게 설명드리는 것을 원칙으로 합니다.
                작은 신호도 놓치지 않겠다는 약속, 저희 팀이 매일 지키겠습니다.
              </p>

              <div className="pt-8 text-right">
                <p className="font-bold text-xl text-gray-900">
                  24시 다산 원동물의료센터 대표원장
                </p>
                <p className="text-2xl font-serif mt-2">이 현 우</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
