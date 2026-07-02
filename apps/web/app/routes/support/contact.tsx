import { Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/contact";
import { HOSPITAL } from "~/data/dasanone-content";
import { StickyBgHero } from "~/components/site/StickyBgHero";
import { HERO_IMAGES } from "~/data/stock-images";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `온라인 문의 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "진료 예약·상담·CT/외과 협진 의뢰 — 진료팀이 확인 후 빠르게 연락드립니다.",
    },
  ];
}

interface ActionResult {
  ok: boolean;
  message: string;
}

export async function action({ request }: Route.ActionArgs): Promise<ActionResult> {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const pet = String(form.get("pet") ?? "").trim();
  const desired = String(form.get("desired") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const agree = form.get("agree") === "on";

  if (!name || !phone || !message) {
    return { ok: false, message: "보호자 성함, 연락처, 문의 내용은 필수입니다." };
  }
  if (!agree) {
    return { ok: false, message: "개인정보 수집·이용에 동의해 주세요." };
  }

  // TODO: 실제 메일 전송 또는 DB 적재. 우선 placeholder.
  console.info("[support/contact] 문의 접수", { name, phone, pet, desired, message });

  return {
    ok: true,
    message:
      "문의가 접수되었습니다. 진료팀이 확인 후 빠르게 연락드릴게요. 응급은 전화 부탁드립니다.",
  };
}

export default function SupportContact() {
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";

  return (
    <>
      <StickyBgHero
        bgImage={HERO_IMAGES.contact}
        location={[{ label: "고객센터", to: "/support" }, { label: "온라인 문의" }]}
        copy={"남겨주신 이야기,\n진료팀이 확인해 빠르게 연락드립니다."}
        sub="응급 상황은 24시간 전화(0507-1330-5958)로 연락 주세요"
      />

      <section className="max-w-[1080px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 formgrid">
          <div>
            <div className="mb-4" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.2em", color: "var(--color-ds-teal)" }}>
              CONTACT
            </div>
            <h2 className="text-[24px] font-extrabold mb-4" style={{ letterSpacing: "-0.02em", color: "var(--color-ds-text)" }}>
              연락처 안내
            </h2>
            <div className="flex flex-col gap-2.5 text-sm" style={{ color: "#3a4744" }}>
              <div>📞 {HOSPITAL.phone} / {HOSPITAL.phone2}</div>
              <div>✉️ {HOSPITAL.email}</div>
              <div>💬 카카오톡 검색 — {HOSPITAL.name}</div>
              <div>📍 {HOSPITAL.address}</div>
            </div>
            <a
              href={HOSPITAL.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-7 items-center gap-2 text-[14px] font-bold"
              style={{ background: "var(--color-ds-teal)", color: "#fff", padding: "12px 20px", borderRadius: 999 }}
            >
              네이버 지도로 길찾기 →
            </a>
          </div>
          <form method="post" className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <input
                name="name"
                required
                placeholder="보호자 성함"
                className="px-4 py-3.5 rounded-[10px] text-[15px] bg-white font-[inherit]"
                style={{ border: "1px solid #d8e0dc" }}
              />
              <input
                name="phone"
                required
                placeholder="연락처"
                className="px-4 py-3.5 rounded-[10px] text-[15px] bg-white font-[inherit]"
                style={{ border: "1px solid #d8e0dc" }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <input
                name="pet"
                placeholder="반려동물 (이름/종/나이)"
                className="px-4 py-3.5 rounded-[10px] text-[15px] bg-white font-[inherit]"
                style={{ border: "1px solid #d8e0dc" }}
              />
              <input
                name="desired"
                placeholder="희망 진료 (예: CT, 외과 협진)"
                className="px-4 py-3.5 rounded-[10px] text-[15px] bg-white font-[inherit]"
                style={{ border: "1px solid #d8e0dc" }}
              />
            </div>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="문의 내용을 남겨주세요"
              className="px-4 py-3.5 rounded-[10px] text-[15px] bg-white font-[inherit] resize-y"
              style={{ border: "1px solid #d8e0dc" }}
            />
            <label className="flex items-center gap-2.5 text-[13.5px]" style={{ color: "var(--color-ds-text-sub)" }}>
              <input type="checkbox" name="agree" required className="w-4 h-4 accent-[color:var(--color-ds-teal)]" />
              <span>
                개인정보 수집·이용에 동의합니다 (
                <Link to="/privacy" className="underline hover:text-[color:var(--color-ds-text)]">자세히</Link>)
              </span>
            </label>
            {result && (
              <div
                className={
                  "rounded-[10px] px-4 py-3 text-sm " +
                  (result.ok
                    ? "bg-[#e2f4f1] text-[#0a7468] border border-[color:var(--color-ds-teal)]"
                    : "bg-[#fdecec] text-[#a33333] border border-[#f0b8b8]")
                }
              >
                {result.message}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="text-white border-none py-4 rounded-[11px] text-base font-bold cursor-pointer disabled:opacity-60"
              style={{ background: "#0d3a35" }}
            >
              {submitting ? "보내는 중…" : "문의 보내기"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
