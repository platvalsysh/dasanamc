import { MapPin, Phone, Mail, User } from "lucide-react";
import { PageHeader } from "@repo/ui";
import type { Route } from "./+types/contact";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "오시는 길 - 서울대학교 화학생물공학부 동창회" },
        {
            name: "description",
            content: "서울대학교 화학생물공학부 동창회 오시는 길 및 연락처 안내입니다.",
        },
    ];
}

export default function Contact() {
    return (
        <div className="w-full">
            <PageHeader
                title="오시는 길"
                description="서울대학교 화학생물공학부 동창회 사무실 위치와 연락처를 안내해 드립니다."
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
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-1">
                                                주소
                                            </h3>
                                            <p className="text-gray-900 break-keep leading-relaxed">
                                                서울시 관악구 관악로1 서울대학교
                                                <br />
                                                화학생물공학부 동창회
                                                <span className="text-gray-500 text-sm ml-1">
                                                    (302동 416-3호)
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-green-600">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-1">
                                                전화번호
                                            </h3>
                                            <p className="text-gray-900">02-880-7412</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 text-orange-600">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-1">
                                                이메일
                                            </h3>
                                            <a
                                                href="mailto:chemalum@snu.ac.kr"
                                                className="text-gray-900 hover:text-blue-600 transition-colors"
                                            >
                                                chemalum@snu.ac.kr
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 text-purple-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-1">
                                                담당자
                                            </h3>
                                            <p className="text-gray-900">백석향</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="lg:col-span-3 h-[400px] lg:h-auto bg-gray-100 border border-gray-200 relative">
                            <iframe
                                title="Seoul National University Building 302 Map"
                                src="https://maps.google.com/maps?q=%EC%84%9C%EC%9A%B8%EB%8C%80%ED%95%99%EA%B5%90+302%EB%8F%99&t=&z=16&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Transportation Info */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                대중교통 이용 안내
                            </h2>
                            <div className="h-px bg-gray-200 flex-1" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                                        2
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        서울대입구역 이용 시
                                    </h3>
                                </div>
                                <ul className="space-y-4 ml-2">
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                        <span>
                                            지하철 2호선 서울대입구역{" "}
                                            <span className="font-semibold text-gray-900">
                                                3번 출구
                                            </span>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                        <span>
                                            시내버스{" "}
                                            <span className="font-semibold text-blue-600">
                                                5511, 5513
                                            </span>
                                            번 탑승
                                            <p className="text-sm text-gray-400 mt-1">
                                                (5512번은 노선 변경으로 확인 필요)
                                            </p>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                        <span>
                                            <span className="font-semibold text-gray-900">
                                                신공학관
                                            </span>{" "}
                                            정류장 하차
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                                        2
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        낙성대역 이용 시
                                    </h3>
                                </div>
                                <ul className="space-y-4 ml-2">
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                        <span>
                                            지하철 2호선 낙성대역{" "}
                                            <span className="font-semibold text-gray-900">
                                                4번 출구
                                            </span>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                        <span>
                                            마을버스{" "}
                                            <span className="font-semibold text-green-600">
                                                관악02
                                            </span>
                                            번 탑승
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                        <span>
                                            <span className="font-semibold text-gray-900">
                                                신공학관
                                            </span>{" "}
                                            정류장 하차
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
