import type { Route } from "./+types/bylaws";
import { useEffect } from "react";

import { redirect } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "동창회 정관 - 서울대학교 화학생물공학부 동창회" },
    {
      name: "description",
      content: "서울대학교 화학생물공학부 동창회 정관입니다.",
    },
  ];
}

import { Link, useLocation, useNavigate } from "react-router";
import { PageHeader } from "@repo/ui";

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = useAuthServerContext(context);
  return { isLogged: auth.isLogged() };
}

export default function Bylaws({ loaderData }: Route.ComponentProps) {
  const { isLogged } = loaderData;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogged) {
      const redirectTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth/login?redirectTo=${redirectTo}`, { replace: true });
    }
  }, [isLogged, navigate, location]);

  if (!isLogged) {
    return null;
  }

  return (
    <div className="w-full">
      <PageHeader
        title="동창회 정관"
        description="서울대학교 화학생물공학부 동창회 정관입니다."
      />
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="space-y-12">

          {/* Content */}
          <div className="text-gray-700">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary-200 border-b-2 border-primary-200/20 pb-3 mb-6">제 1장 총칙</h2>

              <div className="space-y-8 pl-2 md:pl-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제1조(목적)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600">
                    본회는 상호간의 친목을 도모하고 모교의 발전에 공헌함을 목적으로 한다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제2조(명칭)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600">본회는 서울대학교 공과대학 화학생물공학부 동창회라 칭한다.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제3조(소재지)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600">본회는 서울대학교 공과대학 화학생물공학부 안에 둔다.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제4조(분회)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600">본회는 지역에 따라 분회를 둘 수 있다.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제5조(사업내용)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600 mb-2">본회 목적을 달성하기 위하여 다음 각 호의 사업을 추진한다.</p>
                  <ol className="list-decimal pl-10 space-y-1 text-gray-600">
                    <li>친목회, 간담회, 장학회, 연구발표회</li>
                    <li>회지 및 회원명부 발간</li>
                    <li>기타 목적달성에 필요하다고 인정되는 사업</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제6조(회원의 구분과 자격)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>① 본회의 회원은 정회원, 초청회원, 특별회원으로 한다.</p>
                    <p>② 회원은 다음 각 호에 해당하는 사람이 된다.</p>
                    <ol className="list-decimal pl-6 space-y-2 mt-2">
                      <li>
                        정회원은 구 서울대학교 응용화학과, 공업화학과, 화학공학과
                        동창회원, 응용화학부, 화학생물공학부 학사과정 및 대학원 졸업생
                      </li>
                      <li>
                        초청회원은 서울대학교 공과대학 화학생물공학부의 현 교직원 및 전직 교직원
                      </li>
                      <li>
                        특별회원은 서울대학교 공과대학 화학생물공학부(화학생물공학부
                        전신의 모든 학과를 포함한다)에 입학하고 졸업하지 아니한 인사로서
                        운영위원회에서 추천 받은 자
                      </li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제7조(회원의 권리와 의무)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>
                      ① 정회원은 의결권과 선거권, 피선거권을 가지며 회비 납부와 회칙 준수의 의무를 진다.
                    </p>
                    <p>② 초청회원 및 특별회원은 회의에 참석하여 의견을 진술할 수 있다.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary-200 border-b-2 border-primary-200/20 pb-3 mb-6">제 2장 임원</h2>

              <div className="space-y-8 pl-2 md:pl-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제8조(임원의 구분)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600 mb-2">본회에 다음 각 호의 임원을 둔다.</p>
                  <ol className="list-decimal pl-10 space-y-1 text-gray-600">
                    <li>회장 1명</li>
                    <li>총괄부회장 1명</li>
                    <li>부회장: 학계 10명 이내 & 업계 10명 이내</li>
                    <li>감사 2명</li>
                    <li>간사장 1명</li>
                    <li>간사 약간명</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제9조(임원의 임기)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>
                      ① 모든 임원의 임기는 1년으로 하되, 중임할 수 있다. 단 회장의 임기는 3년 이내로 한다.
                    </p>
                    <p>
                      ② 임원은 그 임기가 끝난 후일지라도 후임자가 결정될 때까지 임기가 연장된다.
                    </p>
                    <p>
                      ③ 임원이 실격 또는 사임한 시에는 제9조에 의해 선임하고 보충임기는 전임자의 잔여기간으로 한다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제10조(임원의 선임)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>
                      ① 회장, 부회장, 총괄부회장, 감사, 간사장은 임기 만료 전에 후보자를 선정하여 총회에서 인준한다.
                    </p>
                    <p>
                      ② 회장은 전임 회장들로 구성된 회장후보선정위원회에서 후보자를 선정한다.
                    </p>
                    <p>
                      ③ 총괄부회장, 부회장, 감사, 간사장은 운영위원회에서 후보자를 선정한다.
                    </p>
                    <p>
                      ④ 총괄부회장과 간사장은 전임 총괄부회장과 간사장보다 졸업연도가 1년 후의 졸업생 중에서 선정하고 공업화학과와 화학공학과 통합학과 졸업생 이전까지는 양 학과에서 교대로 선출하는 것을 원칙으로 한다.
                    </p>
                    <p>⑤ 간사는 간사장의 추천으로 회장이 임명한다.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제11조(임원의 직무)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>
                      ① 회장은 본회를 대표하며 총회와 운영위원회를 소집하고 그 의장이 된다.
                    </p>
                    <p>
                      ② 총괄부회장과 부회장은 회장을 보좌하고 유고시에는 그 직무를 대행한다. 총괄부회장은 회장의 명을 받아 본회의 회무를 통할한다.
                    </p>
                    <p>③ 감사는 본 회의 회무와 회계를 감사한다.</p>
                    <p>
                      ④ 간사장은 본회의 회무를 주관하고 간사는 간사장을 보좌하여 본회의 회무를 분담한다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제12조(고문)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>① 본회에 고문 약간명을 둘 수 있다.</p>
                    <p>
                      ② 고문은 전임 회장 및 본회 발전에 기여한 정회원 중 운영위원회에서 추대한 회원으로 한다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary-200 border-b-2 border-primary-200/20 pb-3 mb-6">제 3장 회의</h2>

              <div className="space-y-8 pl-2 md:pl-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제13조(운영위원회의 구성 및 소집)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>
                      ① 운영위원회는 임원과 현직 분회의 지부장, 기 운영위원으로 구성한다.
                    </p>
                    <p>② 운영위원회는 회장이 총회 개최 전 2개월 이내에 소집한다.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제14조(운영위원회의 심의)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600 mb-2">운영위원회는 다음 각 호의 사항을 심의한다.</p>
                  <ol className="list-decimal pl-10 space-y-1 text-gray-600">
                    <li>사업 계획 및 실적에 관한 사항</li>
                    <li>예산 및 결산에 관한 사항</li>
                    <li>고문 추대</li>
                    <li>특별회원 추천</li>
                    <li>회비 결정</li>
                    <li>회장이 심의를 요청하는 사항</li>
                    <li>기타 동창회 운영에 관련된 사항</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제15조(총회의 구성 및 소집)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>① 총회는 회원으로 구성한다.</p>
                    <p>
                      ② 정기총회는 춘계, 추계 연 2회로 하며 춘계 총회는 매년 4월, 추계 총회는 매년 11월 중 소집함을 원칙으로 한다.
                    </p>
                    <p>
                      ③ 임시총회는 운영위원회에서 긴급히 필요하다고 인정할 때 회장이 이를 소집한다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제16조(총회의 의결)</h3>
                  <div className="pl-4 space-y-2 text-gray-600 leading-relaxed">
                    <p>① 총회는 출석 과반수로 의결한다.</p>
                    <p>
                      ② 총회는 다음 각 호의 사항을 의결하되, 춘계 총회에서 의결함을 원칙으로 한다.
                    </p>
                    <ol className="list-decimal pl-6 space-y-1 mt-2">
                      <li>임원 선임에 관한 사항</li>
                      <li>회칙 개정에 관한 사항</li>
                      <li>사업실적 및 결산의 승인</li>
                      <li>사업계획 및 예산의 승인</li>
                      <li>기타 본회 목적 달성을 위한 중요 사항</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary-200 border-b-2 border-primary-200/20 pb-3 mb-6">제 4장 재무</h2>

              <div className="space-y-8 pl-2 md:pl-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제17조(회비)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600">본회의 재정은 기별회비, 임원년회비 및 찬조비로 충당한다.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제18조(회계년도)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600">
                    본회의 회계년도는 매년 5월 1일부터 그 다음해 4월 30일까지로 한다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary-200 border-b-2 border-primary-200/20 pb-3 mb-6">부칙</h2>

              <div className="space-y-8 pl-2 md:pl-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제1조(세칙)</h3>
                  <p className="pl-4 leading-relaxed text-gray-600">
                    본 회칙의 시행에 필요한 세칙은 운영위원회의 의결을 거쳐 따로 정한다.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">제2조(시행일)</h3>
                  <ol className="list-decimal pl-10 space-y-1 text-gray-600">
                    <li>본 회칙은 총회에서 인준된 날부터 시행한다.(제정)</li>
                    <li>본 회칙은 총회에서 인준된 날부터 시행한다.(2012. 4. 개정)</li>
                    <li>
                      본 회칙은 총회에서 인준된 날부터 시행한다.(2013. 11. 12. 개정)
                    </li>
                    <li>
                      본 회칙은 총회에서 인준된 날부터 시행한다.(2017. 11. 11. 개정)
                    </li>
                  </ol>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
