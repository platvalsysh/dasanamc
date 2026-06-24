import { Link } from "react-router";
import { cn } from "@repo/ui/utils";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("w-full border-t border-gray-700 bg-gray-800 py-12 text-white", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4 col-span-2">
            <img
              src="/images/logo.png"
              alt="24시 다산 원동물의료센터"
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="text-sm text-gray-300">
              경기 남양주시 다산중앙로 15, 3층
            </p>
            <p className="text-sm text-gray-300">
              Tel: 0507-1330-5958 / 031-522-5956 | Email: dasanoneamc@gmail.com
            </p>
            <p className="text-sm text-gray-300">
              365일 24시간 연중무휴 · 야간 응급 21:00~09:30
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about/greeting" className="hover:underline">
                  병원소개
                </Link>
              </li>
              <li>
                <Link to="/centers" className="hover:underline">
                  특화진료센터
                </Link>
              </li>
              <li>
                <Link to="/board/Notice" className="hover:underline">
                  공지사항
                </Link>
              </li>
              <li>
                <Link to="/about/contact" className="hover:underline">
                  오시는 길
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">관련 사이트</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://blog.naver.com/dasanoneamc"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  네이버 블로그
                </a>
              </li>
              <li>
                <a
                  href="https://map.naver.com/p/search/남양주 다산원동물의료센터"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  오시는 길 (네이버 지도)
                </a>
              </li>
              <li>
                <span className="text-gray-400">
                  카카오톡 채널: "24시 다산 원동물의료센터"
                </span>
              </li>
            </ul>
          </div>

        </div>
        <div className="mt-8 border-t border-gray-700 pt-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-gray-400 justify-center mb-4">
            <Link to="/rules" className="hover:text-white transition-colors">이용약관</Link>
            <span>|</span>
            <Link to="/privacy" className="hover:text-white transition-colors">개인정보 처리방침</Link>
            <span>|</span>
            <Link to="/email-reject" className="hover:text-white transition-colors">이메일 무단 수집거부</Link>
          </div>
          <div className="text-center text-sm text-gray-400">
            © 2026 DASANONE Animal Medical Center. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
