/**
 * 본문 섹션 공통 헤더 — brainall.kr 참고한 대형 타이포 계층.
 *
 * eyebrow(모노 teal) → 큰 타이틀(clamp 30~44px extrabold) → 설명.
 * `align="center"` 로 중앙 정렬 변형.
 */
interface SectionHeadProps {
  /** 상단 모노 eyebrow (예: WHY DASANONE) */
  eyebrow?: string;
  title: string;
  /** 타이틀 우측/아래 설명 */
  desc?: string;
  align?: "left" | "center";
  /** 다크 섹션 위에서 사용 시 */
  onDark?: boolean;
  className?: string;
}

export function SectionHead({
  eyebrow,
  title,
  desc,
  align = "left",
  onDark = false,
  className = "",
}: SectionHeadProps) {
  const isCenter = align === "center";
  return (
    <div
      className={
        (isCenter ? "text-center max-w-[820px] mx-auto " : "max-w-[860px] ") +
        "mb-12 md:mb-16 " +
        className
      }
    >
      {eyebrow && (
        <div
          className="mb-5"
          style={{
            font: "700 13px/1 ui-monospace, monospace",
            letterSpacing: "0.22em",
            color: onDark ? "var(--color-ds-teal-2)" : "var(--color-ds-teal-deep)",
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className="font-extrabold"
        style={{
          fontSize: "clamp(30px, 3.6vw, 44px)",
          letterSpacing: "-0.03em",
          lineHeight: 1.25,
          color: onDark ? "#ffffff" : "var(--color-ds-text)",
        }}
      >
        {title}
      </h2>
      {desc && (
        <p
          className="mt-5 text-[16px] md:text-[17px]"
          style={{
            color: onDark ? "#aec6bf" : "var(--color-ds-text-sub)",
            lineHeight: 1.75,
          }}
        >
          {desc}
        </p>
      )}
    </div>
  );
}
