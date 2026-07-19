/**
 * 서브 페이지의 다크 hero — about/centers/support 공통.
 * 우측에 베이지 사선 패턴 사이드 영역(`.herobg`)이 있고, 좌측에 카테고리 태그
 * + 큰 타이틀 + 보조 카피를 배치.
 */
interface DarkPageHeroProps {
  /** 우측 상단 모노 태그 (예: ABOUT) */
  tag: string;
  /** 큰 타이틀 (예: 병원소개) */
  title: string;
  /** 보조 카피 */
  subtitle?: string;
}

export function DarkPageHero({ tag, title, subtitle }: DarkPageHeroProps) {
  return (
    <div
      className="darkhero relative overflow-hidden"
      style={{ background: "var(--color-ds-dark)", color: "#f4efe6" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(150deg,#0a2620 0%,#06201c 55%,#041815 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 80% at 86% 6%,rgba(176,128,82,0.20),transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 72% at 8% 94%,rgba(14,157,140,0.16),transparent 62%)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 herobg flex items-center justify-center"
        style={{
          width: "46%",
          background:
            "repeating-linear-gradient(45deg,rgba(176,128,82,0.10),rgba(176,128,82,0.10) 12px,transparent 12px,transparent 24px)",
        }}
      >
        <span
          style={{
            font: "600 12px ui-monospace, monospace",
            letterSpacing: "0.14em",
            color: "#b9a78c",
          }}
        >
          배경 이미지 영역
        </span>
      </div>
      <div
        className="relative max-w-[1280px] mx-auto"
        style={{ padding: "130px clamp(24px,4vw,64px) 104px" }}
      >
        <div
          className="mb-5"
          style={{
            font: "700 13px/1 ui-monospace, monospace",
            letterSpacing: "0.22em",
            color: "var(--color-ds-teal-3)",
          }}
        >
          {tag}
        </div>
        <h1
          className="font-extrabold"
          style={{
            fontSize: "clamp(44px, 6.5vw, 80px)",
            letterSpacing: "-0.035em",
            lineHeight: 1.02,
            color: "#f4efe6",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-[17px] mt-[22px] max-w-[640px]"
            style={{ color: "#c2d0ca", lineHeight: 1.7 }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
