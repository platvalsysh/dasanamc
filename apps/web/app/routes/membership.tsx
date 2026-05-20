import { Check, CreditCard, Heart, Phone, Receipt, QrCode, ArrowRight, Wallet, Users } from "lucide-react";
import { PageHeader } from "@repo/ui";

export default function Membership() {
    return (
        <div className="w-full bg-gray-50/50">
            <PageHeader
                title="동창회비 납부 안내"
            />

            <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
                {/* Intro Section */}
                <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                        <Heart className="w-4 h-4 fill-blue-500 text-blue-500" />
                        <span>동문님들의 소중한 정성</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#30325a] tracking-tight leading-tight">
                        후배들의 꿈과 동창회의 미래가 됩니다
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed break-keep">
                        시간은 흘러 각자의 자리에서 빛나는 열매를 맺고 있지만, 우리가 <span className="font-semibold text-[#30325a]">서울대학교 화학생물공학부 동문</span>이라는 이름으로 하나 된 인연은 무엇과도 바꿀 수 없는 소중한 자산입니다.
                        우리 화학생물공학부 동창회는 동문 선후배 간의 든든한 가교가 되고, 모교의 발전에 힘을 보태기 위해 존재합니다.
                        그리고 이 모든 활동의 중심에는 여러 동문 여러분이 보내주시는 정성이 있습니다.
                    </p>
                </div>

                {/* Funding Info Card */}
                <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm mb-16 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-[#30325a]">
                            <Users className="w-6 h-6" />
                            <h3 className="text-xl font-bold">운영 재원 안내</h3>
                        </div>
                        <p className="text-lg text-gray-600 leading-relaxed break-keep">
                            화학생물공학부 동창회는 <span className="font-medium text-gray-900">개인회비, 기별회비와 회장단 찬조금, 행사찬조금 및 협찬, 그 외 광고수익</span>으로 운영되고 있습니다. <br className="hidden md:block" />
                            2025~2026 회계연도에 기별회비와 찬조금을 납부해 주신 각 기별 운영위원과 여러 동창회 활동에 찬조금과 협찬을 해 주신 동문 및 회장단, 간사진께 진심으로 감사드립니다.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* CMS Card - Primary Focus */}
                    <div className="bg-[#30325a] text-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-900/10 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold flex items-center gap-2">
                                        <Wallet className="w-6 h-6 text-blue-400" />
                                        CMS 개인회비 (정기후원)
                                    </h3>
                                    <p className="text-blue-200/80">월 5,000원의 소중한 정성</p>
                                </div>
                                <div className="bg-blue-500 text-xs font-bold px-3 py-1 rounded-full text-white uppercase tracking-wider">
                                    Recommended
                                </div>
                            </div>

                            <p className="text-gray-300 leading-relaxed mb-10 break-keep">
                                월 5,000원의 개인회비를 CMS 자동이체를 통해 정기적으로 납부하실 수 있습니다.
                                아래 QR코드를 통해 스마트폰으로 간편하게 신청이 가능합니다.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-8 bg-white/5 p-6 rounded-2xl border border-white/10">
                                <div className="bg-white p-2 rounded-xl border border-white/20 shadow-lg shrink-0">
                                    <img
                                        src="/images/membership/cms_qr.png"
                                        alt="CMS QR Code"
                                        className="w-32 h-32 md:w-40 md:h-40 object-contain"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1 bg-blue-500/20 rounded-md mt-1">
                                            <QrCode className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <p className="text-sm text-gray-300">카메라로 QR코드를 스캔하여 바로 신청 페이지로 이동하세요.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-1 bg-blue-500/20 rounded-md mt-1">
                                            <Check className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <p className="text-sm text-gray-300">공인인증서 없이 휴대폰 번호로 간단하게 인증 가능합니다.</p>
                                    </div>
                                    <button className="flex items-center gap-2 text-white font-semibold text-sm group hover:text-blue-400 transition-colors">
                                        자세히 보기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Transfer Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-emerald-50 rounded-2xl">
                                    <CreditCard className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">납부 계좌 안내</h3>
                                    <p className="text-sm text-gray-500">기별회비, 행사찬조금, 기부금 등</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center mb-8">
                                <span className="inline-block px-3 py-1 bg-white rounded-lg border border-gray-200 text-xs font-bold text-gray-500 tracking-wider uppercase mb-4">
                                    농협은행 NH Bank
                                </span>
                                <div className="text-2xl md:text-3xl font-mono font-bold text-gray-900 mb-2 tracking-tight">
                                    301-0240-7782-51
                                </div>
                                <p className="text-gray-600 font-medium tracking-tight">
                                    예금주: 서울대학교 화학생물공학부 동창회
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2 text-gray-900">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm font-bold">납부 항목</span>
                                    </div>
                                    <ul className="text-xs text-gray-500 space-y-1 pl-6 list-disc">
                                        <li>기별 회비</li>
                                        <li>행사 찬조금</li>
                                        <li>발전 기금 (기부금)</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2 text-gray-900">
                                        <Receipt className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm font-bold">영수증 발급</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        소득공제용 영수증 신청은 사무국으로 연락 바랍니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Contact Info */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10 border-t border-gray-200">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400 font-medium">사무국 전화문의</span>
                            <span className="text-xl font-bold text-[#30325a]">02-880-7412</span>
                        </div>
                        <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400 font-medium">이메일 문의</span>
                            <a href="mailto:chemalum@snu.ac.kr" className="text-xl font-bold text-[#30325a] hover:text-blue-600 transition-colors">
                                chemalum@snu.ac.kr
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm italic font-medium">
                        <Heart className="w-4 h-4 text-rose-500" />
                        동문님의 참여가 동창회의 힘이 됩니다
                    </div>
                </div>
            </div>
        </div>
    );
}
