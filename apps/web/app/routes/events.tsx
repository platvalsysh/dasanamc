import React from "react";
import { Building2, Presentation, GraduationCap, Trophy, Map, Users2, ChevronRight } from "lucide-react";
import { PageHeader, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";

export default function EventsPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* 1. Page Header (Classic Angular) */}
      <PageHeader
        title="동창회 주요 행사"
        description="서울대학교 화학생물공학부 동창회는 세대와 지역을 넘어 다양한 활동을 통해 동문 간의 유대를 이어가고 있습니다."
      />

      <div className="container mx-auto px-4 py-12 md:py-20 space-y-24">
        {/* 2. 각 섹션별 활동 (검증된 이미지 1:1 매핑) */}

        {/* 1. 이사회 및 임원회의 */}
        <EventSection
          title="이사회 및 임원회의"
          subtitle="Governing & Leadership"
          icon={<Building2 className="w-6 h-6 text-[#0f0f70]" />}
          description="동창회의 투명한 운영과 지속 가능한 발전을 위한 중추적인 의결 기구 활동입니다. 정기적인 회의를 통해 예결산 승인, 주요 사업 계획 확정, 그리고 차세대 리더십 선출 등 동창회의 미래를 설계합니다."
          events={["정기 이사회", "상임이사회", "회장단 회의", "정기 감사 전형"]}
          imageUrl="https://pcqrknclbcgrllqoyvzq.supabase.co/storage/v1/object/public/public-images/board/dedfc3cb-f6b8-41b9-8f14-c9275663f210/2019/3/41de1d89-c878-4a5f-b387-43d3ff41b2a0.jpg"
          reverse={false}
        />

        {/* 2. 정기 총회 및 송년의 밤 */}
        <EventSection
          title="정기 총회 및 송년의 밤"
          subtitle="General Assembly & Year-end Party"
          icon={<Presentation className="w-6 h-6 text-[#0f0f70]" />}
          description="매년 봄과 가을, 전 세계 동문들이 모교에 모여 한 해의 성과를 공유하고 화합하는 가장 큰 축제입니다. 춘계 총회와 추계 총회, 송년의 밤 행사를 통해 세대를 아우르는 동문애를 나눕니다."
          events={["춘계 정기 총회 (4월)", "추계 정기 총회 (11월)", "동문 송년의 밤", "조직 강화 모임"]}
          imageUrl="https://pcqrknclbcgrllqoyvzq.supabase.co/storage/v1/object/public/public-images/board/dedfc3cb-f6b8-41b9-8f14-c9275663f210/2025/4/d344cb95-9fb5-41ca-8345-3d030a100cb4.jpg"
          reverse={true}
        />

        {/* 3. 학술 및 졸업 */}
        <EventSection
          title="졸업식 및 후배 지원"
          subtitle="Academic Connection & Mentorship"
          icon={<GraduationCap className="w-6 h-6 text-[#0f0f70]" />}
          description="새로운 동문으로 거듭나는 후배들의 졸업을 진심으로 축하하며, 동창회의 든든한 일원이 되었음을 선포합니다. 장학금 전달과 공학 캠프를 통해 선배들의 지혜와 정성을 후배들에게 전합니다."
          events={["하계 학위수여식 축하", "신입 회원 입회식", "잡페어 (Job Fair)", "제8차 공학 캠프", "학부 발전기금 전달"]}
          imageUrl="https://pcqrknclbcgrllqoyvzq.supabase.co/storage/v1/object/public/public-images/board/dedfc3cb-f6b8-41b9-8f14-c9275663f210/2025/8/26d675f0-0986-4a52-8fea-121be9e4f9b4.jpg"
          reverse={false}
        />

        {/* 4. 스포츠 - 골프 */}
        <EventSection
          title="동창회장배 골프 대회"
          subtitle="Alumni Golf Tournament"
          icon={<Trophy className="w-6 h-6 text-[#0f0f70]" />}
          description="필드 위에서 승부를 겨루며 건강한 에너지를 나누는 역동적인 스포츠 교류의 장입니다. 정기적인 골프 대회를 통해 기수와 분야를 초월한 긴밀한 네트워크를 형성하고 우정을 쌓아갑니다."
          events={["동창회장배 정기 골프 대회", "기수별 라운딩 모임", "동호회 친선 경기"]}
          imageUrl="https://pcqrknclbcgrllqoyvzq.supabase.co/storage/v1/object/public/public-images/board/dedfc3cb-f6b8-41b9-8f14-c9275663f210/2018/10/f94830e1-7522-4082-8c53-b38c8c43ce4c.jpeg"
          reverse={true}
        />

        {/* 5. 스포츠 - 등반 */}
        <EventSection
          title="정기 등반 대회"
          subtitle="Mountain Trekking"
          icon={<Map className="w-6 h-6 text-[#0f0f70]" />}
          description="우리나라의 아름다운 산천을 누비며 호연지기를 기르고 선후배가 끈끈하게 소통하는 행사입니다. 춘계와 추계 산행을 통해 일상의 스트레스를 해소하고 동문 간의 대화의 꽃을 피웁니다."
          events={["춘계 합동 등반 대회", "추계 합동 산행 (관악산)", "청계산 등반 모임"]}
          imageUrl="https://pcqrknclbcgrllqoyvzq.supabase.co/storage/v1/object/public/public-images/board/dedfc3cb-f6b8-41b9-8f14-c9275663f210/2023/3/5a464cbe-9474-4e43-a905-e573560aa2d4.jpg"
          reverse={false}
        />

        {/* 6. 특화 모임 및 소그룹 */}
        <EventSection
          title="여성동문회 및 소모임"
          subtitle="Specialized Networking"
          icon={<Users2 className="w-6 h-6 text-[#0f0f70]" />}
          description="여성 동문들만의 섬세하고 긴밀한 네트워크부터 기수별 홈커밍데이까지 다양하고 특화된 교류 활동이 활발하게 일어납니다. 오찬 모임과 문화 체험을 통해 풍성한 동창회 문화를 만들고 있습니다."
          events={["여성 동문 오찬 모임", "홈커밍 가나다라 야외 행사", "기수별 홈커밍데이"]}
          imageUrl="https://pcqrknclbcgrllqoyvzq.supabase.co/storage/v1/object/public/public-images/board/dedfc3cb-f6b8-41b9-8f14-c9275663f210/2023/7/abf24ad9-b675-423c-94b8-58447265c0bd.jpg"
          reverse={true}
        />
      </div>


    </div>
  );
}

function EventSection({
  title,
  subtitle,
  icon,
  description,
  events,
  imageUrl,
  reverse
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  events: string[];
  imageUrl: string;
  reverse: boolean;
}) {
  return (
    <section className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-20`}>
      <div className="w-full lg:w-3/5 space-y-6">
        <Card className="border-none shadow-none bg-transparent py-0">
          <CardHeader className="px-0 pt-0 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-none">
                {icon}
              </div>
              <span className="text-sm font-bold tracking-[0.3em] uppercase text-[#0f0f70]/60">
                {subtitle}
              </span>
            </div>
            <CardTitle className="text-3xl md:text-5xl font-bold font-serif text-[#0f0f70] tracking-tight leading-tight break-keep">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-lg text-gray-600 leading-relaxed mb-10 break-keep font-light font-sans">
              {description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 border-t border-gray-100 pt-8">
              {events.map((event, idx) => (
                <div key={idx} className="flex items-center text-base font-medium text-gray-800 group font-sans">
                  <ChevronRight className="w-4 h-4 mr-3 text-[#0f0f70]/40 group-hover:text-[#0f0f70] transition-colors" />
                  {event}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-2/5">
        <div className="relative aspect-[4/3] bg-gray-50 border border-gray-200 rounded-none overflow-hidden group">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-none transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0f0f70]/10 to-transparent opacity-40 group-hover:opacity-0 transition-opacity duration-500" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
        </div>
      </div>
    </section>
  );
}
