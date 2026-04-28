import type { Route } from "./+types/greeting";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "인사말 - 서울대학교 화학생물공학부 동창회" },
    {
      name: "description",
      content: "서울대학교 화학생물공학부 동창회장 인사말입니다.",
    },
  ];
}

import { PageHeader } from "@repo/ui";

export default function Greeting() {
  return (
    <div className="w-full">
      <PageHeader
        title="동창회장 인사말"
        description="서울대학교 화학생물공학부 동창회장 인사말입니다."
      />
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="space-y-12">

          {/* Content */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Image Placeholder */}
            <div className="w-full md:w-1/3 shrink-0">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
                <img
                  src="/images/greeting.jpg"
                  alt="제25대 동창회장 이준혁"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 space-y-6 leading-relaxed text-lg">
              <p>안녕하십니까. 제25대 동창회장으로 취임하게 된 이준혁입니다.</p>
              <p>
                먼저, 지난 임기 동안 동창회를 위해 애써주신 홍창식 회장님과
                임원진, 그리고 여러 교수님들께 깊이 감사의 말씀 올립니다. 서울대
                화생공 동창회는 우리가 걸어온 길을 되새기고 함께 미래를 만들어가는
                공동체입니다. 선배님들의 헌신과 노력 덕분에 오늘 우리가 더욱
                끈끈한 유대 속에서 하나로 뭉칠 수 있었습니다. 이 자리를 빌려 다시
                한번 깊은 존경과 감사를 표합니다.
              </p>
              <p>
                서울대학교 화학생물공학부는 학계와 산업계를 넘나들며 수많은 혁신을
                만들어왔습니다. 화학, 소재, 에너지, 바이오 등 다양한 분야에서 우리
                동문들은 핵심적인 역할을 수행하고 있으며, 이제는 그 영역을 더욱
                확장하여 여러 방면에서 새로운 지평을 열어가고 있습니다.
              </p>
              <p>
                이러한 변화 속에서 동창회의 역할도 한층 더 강화되어야 합니다.
                동문들의 연결을 더욱 공고히 하고, 서로의 경험과 지식을 공유하며,
                우리 공동체가 더욱 강력한 네트워크를 형성할 수 있도록 하는
                것이야말로 동창회의 핵심 과제입니다.
              </p>
              <p>
                이를 위해 저는 세대와 분야를 아우르는 네트워크를 활성화하여,
                선후배 간의 연결을 강화시킬 수 있도록 동창회를 운영하고자 합니다.
                공식 행사뿐만 아니라, 보다 다양한 방식의 모임을 지원하여, 화학산업
                외로도 다양한 산업계로 진출하는 후배들이 보다 탄탄한 기반을 다질
                수 있도록 돕겠습니다. 또한, 선배 동문들도 후배들과의 교류를 통해
                새로운 시너지를 얻을 수 있도록 하겠습니다. 이를 통해 동문들이
                즐거우면서도 함께 참여할 수 있는 동창회 문화를 만들겠습니다.
              </p>
              <p>
                지금 우리에게 필요한 것은 단순한 유대를 넘어, 함께 성장할 수 있는
                강력한 연결입니다. 서울대 화생공 동창회는 이미 탄탄한 기반을
                가지고 있습니다. 이제 우리는 그 기반 위에 더욱 크고 단단한 미래를
                쌓아 올려야 합니다. 여러분과 함께 새로운 도약을 준비하겠습니다.
              </p>
              <p>
                앞으로도 동문회에 대한 많은 관심과 적극적인 참여를 부탁드리며,
                동문 여러분의 건강과 건승을 기원합니다.
              </p>

              <div className="pt-8 text-right">
                <p className="font-bold text-xl text-gray-900">
                  제25대 서울대학교 화학생물공학부 동창회장
                </p>
                <p className="text-2xl font-serif mt-2">이 준 혁</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
