import { Clock, Wallet, Car, AlertCircle } from "lucide-react";
import type { Route } from "./+types/info";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "진료안내 - 24시 다산 원동물의료센터" },
    {
      name: "description",
      content:
        "24시 다산 원동물의료센터 진료시간, 진료비, 주차, 야간 응급 안내입니다.",
    },
  ];
}

export default function Info() {
  return (
    <div className="w-full">
      {/* HERO (다크) */}
      <div className="text-white px-8 pt-20 pb-[70px]" style={{ background: "var(--color-ds-dark)" }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="font-mono font-bold text-[13px] mb-4.5 text-[color:var(--color-ds-teal-2)] tracking-[0.22em] leading-none">
            VISIT GUIDE
          </div>
          <h1 className="text-[42px] font-extrabold leading-[1.3]" style={{ letterSpacing: "-0.03em" }}>
            진료안내
          </h1>
          <p className="text-[17px] mt-4 max-w-[620px]" style={{ color: "#aebdb8" }}>
            진료시간, 진료비, 주차, 야간 응급 정보를 안내해 드립니다.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
        {/* 진료시간 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Clock className="w-7 h-7 text-[color:var(--color-snublue)]" />
            <h2 className="text-2xl font-bold text-gray-900">진료시간</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-5">
              <p className="text-sm text-gray-500 mb-1">주간 일반진료</p>
              <p className="text-xl font-bold text-gray-900">09:30 ~ 21:00</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5 bg-[color:var(--color-snubeige)]/30">
              <p className="text-sm text-gray-500 mb-1">야간 응급진료</p>
              <p className="text-xl font-bold text-gray-900">21:00 ~ 09:30</p>
              <p className="text-xs text-gray-500 mt-1">365일 24시간 응급 대응</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <p className="text-sm text-gray-500 mb-1">회진 시간 (휴진)</p>
              <p className="text-xl font-bold text-gray-900">12:30 ~ 13:00</p>
            </div>
          </div>
          <p className="text-sm text-[color:var(--color-snublue)] font-semibold">
            ※ 연중무휴 — 공휴일·명절에도 동일하게 진료합니다.
          </p>
        </section>

        {/* 진료비 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Wallet className="w-7 h-7 text-[color:var(--color-snublue)]" />
            <h2 className="text-2xl font-bold text-gray-900">진료비</h2>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    항목
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    안내
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4 text-gray-900">진료 상담</td>
                  <td className="p-4 text-gray-600">
                    문진·진찰 후 케이스별 안내
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-900">야간 진료비 (21:00 ~ 09:30)</td>
                  <td className="p-4 text-gray-600 font-semibold">
                    + 40,000원 추가
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-900">검사 / 수술 / 입원</td>
                  <td className="p-4 text-gray-600">진료 후 견적 별도 안내</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            ※ 검사·수술비는 케이스에 따라 다르며, 사전에 보호자님께 상세 견적을
            드린 후 진행합니다.
          </p>
        </section>

        {/* 주차 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Car className="w-7 h-7 text-[color:var(--color-snublue)]" />
            <h2 className="text-2xl font-bold text-gray-900">주차 안내</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-5">
              <p className="font-bold text-gray-900 mb-2">건물 지하주차장</p>
              <p className="text-gray-600 text-sm">3시간 30분 무료</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <p className="font-bold text-gray-900 mb-2">인근 공영주차장</p>
              <p className="text-gray-600 text-sm">2시간 무료</p>
            </div>
          </div>
        </section>

        {/* 야간 응급 안내 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-7 h-7 text-[color:var(--color-snublue)]" />
            <h2 className="text-2xl font-bold text-gray-900">야간 응급 안내</h2>
          </div>
          <div className="rounded-lg bg-[color:var(--color-snubeige)]/40 p-6 space-y-3">
            <p className="text-gray-900 leading-relaxed">
              <strong>21:00 ~ 09:30</strong> 야간 시간대에도 응급 진료가
              가능합니다. 예약 없이 바로 내원하시거나, 가능하시면 출발 전
              전화로 상태를 알려주시면 도착 시점에 바로 응급 처치가 시작될 수
              있도록 준비해 두겠습니다.
            </p>
            <div className="pt-2">
              <a
                href="tel:0507-1330-5958"
                className="inline-block px-5 py-2.5 bg-[color:var(--color-snublue)] text-white font-semibold rounded hover:opacity-90 transition-opacity"
              >
                응급 전화 0507-1330-5958
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
