import { Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/support";
import {
  HOSPITAL,
  FAQS,
  NOTICES_FALLBACK,
} from "~/data/dasanone-content";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `고객센터 — ${HOSPITAL.name}` },
    {
      name: "description",
      content:
        "진료 예약·문의는 전화 또는 온라인으로, 진료 케이스와 건강 정보는 블로그에서. 365일 24시간 응급진료 0507-1330-5958.",
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
  console.info("[support] 문의 접수", { name, phone, pet, desired, message });

  return {
    ok: true,
    message:
      "문의가 접수되었습니다. 진료팀이 확인 후 빠르게 연락드릴게요. 응급은 전화 부탁드립니다.",
  };
}

export default function Support() {
  const result = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";

  return (
    <>
      {/* dark hero */}
      <div className="darkhero relative overflow-hidden" style={{ background: "#06201c", color: "#f4efe6" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(150deg,#0a2620 0%,#06201c 55%,#041815 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(70% 80% at 86% 6%,rgba(176,128,82,0.20),transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(58% 72% at 8% 94%,rgba(14,157,140,0.16),transparent 62%)" }} />
        <div
          className="absolute right-0 top-0 bottom-0 herobg flex items-center justify-center"
          style={{
            width: "46%",
            background: "repeating-linear-gradient(45deg,rgba(176,128,82,0.10),rgba(176,128,82,0.10) 12px,transparent 12px,transparent 24px)",
          }}
        >
          <span style={{ font: "600 12px ui-monospace, monospace", letterSpacing: "0.14em", color: "#b9a78c" }}>
            배경 이미지 영역
          </span>
        </div>
        <div className="relative max-w-[1280px] mx-auto" style={{ padding: "130px clamp(24px,4vw,64px) 104px" }}>
          <div className="mb-5" style={{ font: "700 13px/1 ui-monospace, monospace", letterSpacing: "0.22em", color: "#6ed4c5" }}>
            CUSTOMER CENTER
          </div>
          <h1
            className="font-extrabold"
            style={{ fontSize: "clamp(44px, 6.5vw, 80px)", letterSpacing: "-0.035em", lineHeight: 1.02, color: "#f4efe6" }}
          >
            고객센터
          </h1>
          <p className="text-[17px] mt-[22px] max-w-[540px]" style={{ color: "#c2d0ca", lineHeight: 1.7 }}>
            진료 예약·문의는 전화 또는 온라인으로, 진료 케이스와 건강 정보는
            블로그에서 만나보세요.
          </p>
        </div>
      </div>

      {/* 3 contact cards */}
      <section className="max-w-[1280px] mx-auto px-8 pt-[72px] pb-6">
        <div
          data-stagger=""
          className="grid grid-cols-1 md:grid-cols-3 gap-[18px] three"
        >
          <a
            href={`tel:${HOSPITAL.phone}`}
            className="bg-[color:var(--color-ds-teal)] text-white rounded-2xl px-7 py-8 flex flex-col gap-2"
          >
            <span className="text-[13px] font-bold text-[#bfe8e1]">
              24시간 전화 상담
            </span>
            <span className="text-2xl font-extrabold tracking-[-0.01em]">
              {HOSPITAL.phone}
            </span>
            <span className="text-sm text-[#c8ebe4]">{HOSPITAL.phone2}</span>
          </a>
          <a
            href="#contactform"
            className="text-left bg-transparent rounded-xl px-[26px] py-[30px] flex flex-col gap-2"
            style={{ border: "1px solid #e9dfca" }}
          >
            <span className="text-[13px] font-bold text-[color:var(--color-ds-teal)]">
              온라인 문의·예약
            </span>
            <span className="text-[22px] font-extrabold text-[color:var(--color-ds-text)]">
              문의 남기기 →
            </span>
            <span className="text-sm text-[#6b7975]">
              진료 예약과 일반 문의를 접수합니다
            </span>
          </a>
          <a
            href={HOSPITAL.blog}
            target="_blank"
            rel="noreferrer"
            className="bg-transparent rounded-xl px-[26px] py-[30px] flex flex-col gap-2"
            style={{ border: "1px solid #e9dfca" }}
          >
            <span className="text-[13px] font-bold text-[color:var(--color-ds-teal)]">
              진료 케이스 · 블로그
            </span>
            <span className="text-[22px] font-extrabold text-[color:var(--color-ds-text)]">
              네이버 블로그 →
            </span>
            <span className="text-sm text-[#6b7975]">
              blog.naver.com/dasanoneamc
            </span>
          </a>
        </div>
      </section>

      {/* notice */}
      <section className="max-w-[1280px] mx-auto px-8 py-12">
        <div
          className="mb-[18px]"
          style={{
            font: "700 13px/1 ui-monospace, monospace",
            letterSpacing: "0.2em",
            color: "var(--color-ds-teal)",
          }}
        >
          NOTICE
        </div>
        <div className="flex flex-col gap-px rounded-2xl overflow-hidden" style={{ background: "#e8ddc6", border: "1px solid #e8ddc6" }}>
          {NOTICES_FALLBACK.map((n, i) => (
            <div key={i} className="bg-white px-6 py-[18px] flex items-center gap-[18px]">
              <span
                className="text-[11.5px] font-extrabold shrink-0"
                style={{ color: "var(--color-ds-teal)", background: "#e2f4f1", padding: "5px 11px", borderRadius: 6 }}
              >
                {n.tag}
              </span>
              <span className="text-[15px] font-semibold flex-1" style={{ color: "#2a3b37" }}>{n.t}</span>
              <span className="text-[13px] shrink-0" style={{ color: "#a59a82" }}>{n.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1280px] mx-auto px-8 py-12">
        <div
          className="mb-[18px]"
          style={{
            font: "700 13px/1 ui-monospace, monospace",
            letterSpacing: "0.2em",
            color: "var(--color-ds-teal)",
          }}
        >
          FAQ — 자주 묻는 질문
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <div key={i} className="px-1 py-6" style={{ borderTop: "1px solid #e9dfca" }}>
              <div className="flex gap-3 items-start mb-2.5">
                <span className="text-[17px] font-extrabold text-[color:var(--color-ds-teal)] shrink-0">
                  Q
                </span>
                <span className="text-[16.5px] font-extrabold text-[color:var(--color-ds-text)] leading-[1.5]">
                  {f.q}
                </span>
              </div>
              <div className="flex gap-3 items-start pl-px">
                <span className="text-[17px] font-extrabold shrink-0" style={{ color: "#c9bda3" }}>A</span>
                <p className="text-[15px] text-[color:var(--color-ds-text-sub)] leading-[1.7]">
                  {f.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* contact form */}
      <section className="max-w-[1280px] mx-auto px-8 pt-12 pb-[100px]">
        <div
          id="contactform"
          className="pt-11 pb-2"
          style={{ scrollMarginTop: "100px" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 formgrid">
            <div>
              <div
                className="mb-4"
                style={{
                  font: "700 13px/1 ui-monospace, monospace",
                  letterSpacing: "0.2em",
                  color: "var(--color-ds-teal)",
                }}
              >
                ONLINE
              </div>
              <h2 className="text-[28px] font-extrabold tracking-[-0.02em] text-[color:var(--color-ds-text)] mb-4">
                온라인 문의·예약
              </h2>
              <p className="text-[15px] text-[color:var(--color-ds-text-sub)] leading-[1.7] mb-6">
                남겨주신 내용은 진료팀이 확인 후 빠르게 연락드립니다. 응급은
                전화로 연락 주세요.
              </p>
              <div className="flex flex-col gap-2.5 text-sm text-[#3a4744]">
                <div>📞 {HOSPITAL.phone} / {HOSPITAL.phone2}</div>
                <div>✉️ {HOSPITAL.email}</div>
                <div>💬 카카오톡 검색 — {HOSPITAL.name}</div>
              </div>
            </div>
            <form method="post" className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  name="name"
                  required
                  placeholder="보호자 성함"
                  className="px-4 py-3.5 border border-[color:var(--color-ds-border-2)] rounded-[10px] text-[15px] bg-white font-[inherit]"
                />
                <input
                  name="phone"
                  required
                  placeholder="연락처"
                  className="px-4 py-3.5 border border-[color:var(--color-ds-border-2)] rounded-[10px] text-[15px] bg-white font-[inherit]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  name="pet"
                  placeholder="반려동물 (이름/종/나이)"
                  className="px-4 py-3.5 border border-[color:var(--color-ds-border-2)] rounded-[10px] text-[15px] bg-white font-[inherit]"
                />
                <input
                  name="desired"
                  placeholder="희망 진료 (예: CT, 외과 협진)"
                  className="px-4 py-3.5 border border-[color:var(--color-ds-border-2)] rounded-[10px] text-[15px] bg-white font-[inherit]"
                />
              </div>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="문의 내용을 남겨주세요"
                className="px-4 py-3.5 border border-[color:var(--color-ds-border-2)] rounded-[10px] text-[15px] bg-white font-[inherit] resize-y"
              />
              <label className="flex items-center gap-2.5 text-[13.5px] text-[color:var(--color-ds-text-sub)]">
                <input
                  type="checkbox"
                  name="agree"
                  className="w-4 h-4 accent-[color:var(--color-ds-teal)]"
                  required
                />
                <span>
                  개인정보 수집·이용에 동의합니다 (
                  <Link
                    to="/privacy"
                    className="underline hover:text-[color:var(--color-ds-text)]"
                  >
                    자세히
                  </Link>
                  )
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
        </div>
      </section>
    </>
  );
}
