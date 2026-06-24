import { MapPin, Phone, Mail, Clock, Car } from "lucide-react";
import { PageHeader } from "@repo/ui";
import type { Route } from "./+types/contact";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "오시는 길 - 24시 다산 원동물의료센터" },
    {
      name: "description",
      content: "24시 다산 원동물의료센터 위치, 연락처, 진료시간, 주차 안내입니다.",
    },
  ];
}

export default function Contact() {
  return (
    <div className="w-full">
      <PageHeader
        title="오시는 길"
        description="24시 다산 원동물의료센터 위치와 연락처, 진료시간을 안내해 드립니다."
      />
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="space-y-16">

          {/* Contact Info & Map Grid */}
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gray-50 p-6 md:p-8 border border-gray-200 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                  연락처 및 주소
                </h2>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[color:var(--color-snubeige)]/40 flex items-center justify-center shrink-0 text-[color:var(--color-snublue)]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">
                        주소
                      </h3>
                      <p className="text-gray-900 break-keep leading-relaxed">
                        경기 남양주시 다산중앙로 15, 3층
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[color:var(--color-snubeige)]/40 flex items-center justify-center shrink-0 text-[color:var(--color-snublue)]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">
                        전화번호
                      </h3>
                      <p className="text-gray-900">
                        <a href="tel:0507-1330-5958" className="hover:underline">
                          0507-1330-5958
                        </a>{" "}
                        /{" "}
                        <a href="tel:031-522-5956" className="hover:underline">
                          031-522-5956
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[color:var(--color-snubeige)]/40 flex items-center justify-center shrink-0 text-[color:var(--color-snublue)]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">
                        이메일
                      </h3>
                      <a
                        href="mailto:dasanoneamc@gmail.com"
                        className="text-gray-900 hover:text-[color:var(--color-snublue)] transition-colors"
                      >
                        dasanoneamc@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[color:var(--color-snubeige)]/40 flex items-center justify-center shrink-0 text-[color:var(--color-snublue)]">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">
                        진료시간
                      </h3>
                      <p className="text-gray-900 text-sm leading-relaxed">
                        주간 일반 09:30 ~ 21:00
                        <br />
                        야간 응급 21:00 ~ 09:30
                        <br />
                        회진 12:30 ~ 13:00
                      </p>
                      <p className="text-xs text-[color:var(--color-snublue)] mt-1 font-semibold">
                        365일 24시간 연중무휴
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        야간 진료비 +40,000원
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[color:var(--color-snubeige)]/40 flex items-center justify-center shrink-0 text-[color:var(--color-snublue)]">
                      <Car size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">
                        주차
                      </h3>
                      <p className="text-gray-900 text-sm leading-relaxed">
                        건물 지하주차장 3시간 30분 무료
                        <br />
                        인근 공영주차장 2시간 무료
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-3 h-[400px] lg:h-auto bg-gray-100 border border-gray-200 relative">
              <iframe
                title="24시 다산 원동물의료센터 약도 (네이버 지도)"
                src="https://map.naver.com/p/search/남양주 다산원동물의료센터"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute bottom-2 right-2">
                <a
                  href="https://map.naver.com/p/search/남양주 다산원동물의료센터"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-white/95 hover:bg-white text-xs px-3 py-1.5 rounded shadow border border-gray-200"
                >
                  네이버 지도에서 열기 →
                </a>
              </div>
            </div>
          </div>

          {/* Helpful info */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">방문 안내</h2>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">예약·문의</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  방문 전 전화 예약 권장. 응급은 별도 예약 없이 바로 내원
                  가능합니다. 카카오톡 채널{" "}
                  <span className="font-semibold">"24시 다산 원동물의료센터"</span>{" "}
                  로 검색해 문의 가능합니다.
                </p>
              </div>

              <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  더 자세히 보기
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  진료 사례·시설 사진은 네이버 블로그{" "}
                  <a
                    href="https://blog.naver.com/dasanoneamc"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[color:var(--color-snublue)] hover:underline"
                  >
                    blog.naver.com/dasanoneamc
                  </a>{" "}
                  에서 확인하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
