import type { CSSProperties } from "react";

/**
 * 에셋 자리 표시 컴포넌트.
 * `src` 가 있으면 `<img>`, 없으면 회색 사선 줄무늬 placeholder + 라벨.
 *
 * 레퍼런스 HTML 의 `repeating-linear-gradient(45deg,#e8ece9 ...)` 패턴을
 * 그대로 가져와 디자인 시안과 동일한 톤을 유지.
 */
interface AssetSlotProps {
  /** 이미지 경로. undefined/빈 문자열이면 placeholder 렌더 */
  src?: string;
  alt?: string;
  /** placeholder 상태일 때 노출되는 작은 라벨 (예: "프로필 사진") */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function AssetSlot({ src, alt = "", label, className, style }: AssetSlotProps) {
  if (src) {
    return <img src={src} alt={alt} className={className} style={style} loading="lazy" />;
  }
  return (
    <div
      className={
        "flex items-center justify-center " + (className ?? "")
      }
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg,#e8ece9,#e8ece9 11px,#eef2ef 11px,#eef2ef 22px)",
        ...style,
      }}
      aria-label={label || alt || "이미지"}
    >
      {label && (
        <span
          style={{
            font: "600 11px ui-monospace,monospace",
            letterSpacing: "0.08em",
            color: "#9aa9a4",
            textAlign: "center",
            padding: "0 8px",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
