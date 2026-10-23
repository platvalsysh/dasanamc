import { Phone, MapPin, PenSquare } from "lucide-react";
import { HOSPITAL } from "~/data/dasanone-content";

/**
 * 모바일(≤720px) 하단 고정 콘택트 바. 데스크탑은 QuickBar 가 대체.
 * 항목: 전화 / 길찾기 / 문의 — 데스크탑 QuickBar 와 동일한 lucide 아이콘.
 */
export function MobileBar() {
  const itemCls =
    "flex items-center justify-center gap-1.5 py-3.5 text-[color:var(--color-ds-text)] text-[13px] font-bold";
  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-[70] hidden max-[720px]:block bg-white/95 backdrop-blur border-t border-[color:var(--color-ds-border)]"
      aria-label="모바일 콘택트 바"
    >
      <div className="grid grid-cols-3">
        <a
          href="tel:0507-1330-5958"
          className={itemCls + " border-r border-[color:var(--color-ds-border)]"}
        >
          <Phone size={15} strokeWidth={2} />
          전화
        </a>
        <a
          href={HOSPITAL.mapUrl}
          target="_blank"
          rel="noreferrer"
          className={itemCls + " border-r border-[color:var(--color-ds-border)]"}
        >
          <MapPin size={15} strokeWidth={2} />
          길찾기
        </a>
        <a href="/support/contact" className={itemCls}>
          <PenSquare size={15} strokeWidth={2} />
          문의
        </a>
      </div>
    </div>
  );
}
