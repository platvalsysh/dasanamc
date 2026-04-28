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
              alt="서울대학교 화학생물공학부 동창회"
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="text-sm text-gray-300">
              (08826) 서울특별시 관악구 관악로 1 서울대학교 302동
            </p>
            <p className="text-sm text-gray-300">
              Tel: 02-880-1234 | Email: alumni@snu.ac.kr
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about/greeting" className="hover:underline">
                  동창회 소개
                </Link>
              </li>
              <li>
                <Link to="/board/Notice" className="hover:underline">
                  공지사항
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:underline">
                  행사 일정
                </Link>
              </li>
              <li>
                <Link to="/membership" className="hover:underline">
                  동창회비/발전기금
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">관련 사이트</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://cbe.snu.ac.kr"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  화학생물공학부
                </a>
              </li>
              <li>
                <a
                  href="https://www.snu.ac.kr"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  서울대학교
                </a>
              </li>
              <li>
                <a
                  href="https://eng.snu.ac.kr"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  공과대학
                </a>
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
            © 2024 SNU Chemical & Biological Engineering Alumni Association. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
