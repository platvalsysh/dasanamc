import { useRef } from "react";
import { FeatureSection } from "~/components/feature-section";
import { PageHeader } from "@repo/ui";

export default function MentoringPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    const consultants = [
        {
            name: "허달",
            role: "화학공학과 18회",
            description: "서울대 경영대학원 석사, 연세대 국제경영대학원 최고위과정\n前 ㈜SK 부사장\n前 한국화인케미칼㈜, M&H Laboratories, Ace Biotech CEO\n現 코칭경영원 파트너코치, 한국코칭센터 시니어코치",
            email: "dhugh@nate.com",
        },
        {
            name: "이경순",
            role: "화학공학과 27회",
            description: "영남화학㈜ (생산, 에너지/환경/공정관리)\n에쓰오일㈜ (생산, 공정관리, 연구·사업개발, 공장 담당 중역, 연구개발 담당 중역, 윤활유 완제품 합작회사 파견 운영 총괄 중역, 회사 영업 전반 자문)",
            email: "jill_900@hotmail.com",
        },
        {
            name: "김영재",
            role: "공업화학과 35회",
            description: "한국과학기술원 화학과 석사\n前 대덕전자㈜ 이사\n現 대덕전자㈜ 대표이사 사장, 대덕GDS㈜ 대표이사 사장\n삼성전자협력회사협의회 회장, 한국중견기업연합회 부회장",
            email: "yjkim@daeduck.com",
        },
        {
            name: "송재천",
            role: "화학공학과 37회",
            description: "서울대 화학공학박사\n前 한화인베스트먼트㈜ 투자본부장\n前 한화L&C 신사업추진팀장, 한화나노텍㈜ 대표이사\n前 한화케미칼㈜ 폴리실리콘사업본부장\n現 한화케미칼㈜ 중앙연구소 부소장, 한국태양광발전학회 이사",
            email: "jcsong@hanwha.com",
        },
        {
            name: "김문수",
            role: "응용화학부 56회",
            description: "㈜이투스 창업 및 대표이사 (누드교과서 베스트셀러, 온라인 강의 업계 2위 달성, SK커뮤니케이션즈와 합병)\n㈜스마투스 창업 (Nexon 투자 유치, 디지털교육 전문 플랫폼 글로벌 론칭, BeNative 오픈)",
            email: "alan@smatoos.com",
        },
    ];

    return (
        <div className="w-full" ref={containerRef}>
            <PageHeader
                title="선·후배님 도와주세요"
                description="동문 여러분의 고민상담, 진로상담, 구인구직 등 도움이 필요할 때 선배님의 자문을 받아보세요."
            />

            <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
                <div className="prose prose-lg dark:prose-invert max-w-none mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                        프로그램 소개
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            서울대 화학생물공학부 동창회에서는 홈페이지 활성화 방안의 일환으로{" "}
                            <strong className="text-primary font-semibold">
                                "선·후배님 도와주세요"
                            </strong>{" "}
                            메뉴를 개설하였습니다.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            동문분들의 고민상담, 진로상담, 구인구직 등 여러 가지 도움이 필요할
                            경우 선·후배님들의 자문을 받을 수 있도록 현재 5분의 자문위원이
                            상담을 진행해 드리고 있습니다.
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold mt-12 mb-4 text-gray-900 dark:text-gray-100">
                        이용 방법
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        상담을 원하시는 동문께서는 '게시판/선·후배님 도와주세요' 코너를 통해
                        자문위원분들께(한 분 또는 여러 분) 게시판 글을 남기거나, 아래 기재된
                        이메일로 직접 문의하실 수 있습니다.
                    </p>
                </div>

                <div className="space-y-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-8 w-1 bg-primary rounded-full"></div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            자문위원 명단
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {consultants.map((consultant, index) => (
                            <div
                                key={consultant.name}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {consultant.name}
                                        </h3>
                                        <p className="text-primary font-medium text-sm mt-1">
                                            {consultant.role}
                                        </p>
                                    </div>
                                    {consultant.email && (
                                        <a
                                            href={`mailto:${consultant.email}`}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
                                        >
                                            이메일 문의
                                        </a>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                                        {consultant.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
