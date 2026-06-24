import { Link } from "react-router";
import { cn } from "@repo/ui/utils";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        "w-full bg-[color:var(--color-ds-dark-3)] text-white pt-16 pb-10 px-8",
        className,
      )}
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] pb-10 border-b border-white/10">
          <div>
            <img
              src="/images/logo.png"
              alt="24시 다산 원동물의료센터 DASANONE ANIMAL MEDICAL CENTER"
              className="h-11 w-auto block mb-[18px] brightness-0 invert opacity-90"
            />
            <p className="text-sm text-[color:var(--color-ds-text-mute)] leading-[1.7] max-w-[380px]">
              말 못 하는 아이들의 작은 신호, 그 하나도 놓치지 않겠습니다. 365일 24시간 연중무휴 진료.
            </p>
          </div>
          <div>
            <div className="text-[13px] font-extrabold text-[color:var(--color-ds-teal-3)] mb-3.5">진료 안내</div>
            <div className="flex flex-col gap-2 text-[13.5px] text-[color:var(--color-ds-text-mute)]">
              <div>주간 일반진료 09:30 ~ 21:00</div>
              <div>야간 응급진료 21:00 ~ 09:30</div>
              <div>회진 12:30 ~ 13:00 · 연중무휴</div>
            </div>
          </div>
          <div>
            <div className="text-[13px] font-extrabold text-[color:var(--color-ds-teal-3)] mb-3.5">연락처</div>
            <div className="flex flex-col gap-2 text-[13.5px] text-[color:var(--color-ds-text-mute)]">
              <div>
                <a href="tel:0507-1330-5958" className="hover:underline">0507-1330-5958</a>
                {" / "}
                <a href="tel:031-522-5956" className="hover:underline">031-522-5956</a>
              </div>
              <div>
                <a href="mailto:dasanoneamc@gmail.com" className="hover:underline">dasanoneamc@gmail.com</a>
              </div>
              <div>경기 남양주시 다산중앙로 15, 3층</div>
              <a
                href="https://blog.naver.com/dasanoneamc"
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--color-ds-teal-3)] font-semibold hover:underline"
              >
                네이버 블로그 →
              </a>
            </div>
          </div>
        </div>
        <div className="pt-6 flex justify-between gap-4 flex-wrap text-[12.5px] text-[color:var(--color-ds-text-mute)]">
          <span>
            24시 다산 원동물의료센터 · 대표 이현우 · 사업자등록번호 692-07-03028
          </span>
          <div className="flex gap-3 items-center">
            <Link to="/rules" className="hover:text-white transition-colors">이용약관</Link>
            <span>|</span>
            <Link to="/privacy" className="hover:text-white transition-colors">개인정보 처리방침</Link>
            <span>|</span>
            <Link to="/email-reject" className="hover:text-white transition-colors">이메일 무단 수집거부</Link>
            <span className="ml-2">© 2026 DASANONE Animal Medical Center.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
