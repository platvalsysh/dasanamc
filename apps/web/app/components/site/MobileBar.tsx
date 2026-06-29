/**
 * 모바일(≤720px) 하단 고정 콘택트 바. 데스크탑은 QuickBar 가 대체.
 * 항목: 전화 / 길찾기 / 문의
 */
export function MobileBar() {
  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-[70] hidden max-[720px]:block bg-white/95 backdrop-blur border-t border-[color:var(--color-ds-border)]"
      aria-label="모바일 콘택트 바"
    >
      <div className="grid grid-cols-3">
        <a
          href="tel:0507-1330-5958"
          className="py-3.5 text-center text-[color:var(--color-ds-text)] text-[13px] font-bold border-r border-[color:var(--color-ds-border)]"
        >
          📞 전화
        </a>
        <a
          href="https://map.naver.com/p/search/24%EC%8B%9C%20%EB%8B%A4%EC%82%B0%20%EC%9B%90%EB%8F%99%EB%AC%BC%EC%9D%98%EB%A3%8C%EC%84%BC%ED%84%B0"
          target="_blank"
          rel="noreferrer"
          className="py-3.5 text-center text-[color:var(--color-ds-text)] text-[13px] font-bold border-r border-[color:var(--color-ds-border)]"
        >
          📍 길찾기
        </a>
        <a
          href="/support#contactform"
          className="py-3.5 text-center text-[color:var(--color-ds-text)] text-[13px] font-bold"
        >
          💬 문의
        </a>
      </div>
    </div>
  );
}
