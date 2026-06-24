import { Link } from "react-router";
import {
  ArrowUp,
  Phone,
  MapPin,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@repo/ui/utils";
import { useUser } from "@repo/auth/ui";

export function QuickBar() {
  const [isVisible, setIsVisible] = useState(false);
  const user = useUser();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const quickLinks = [
    {
      icon: Phone,
      label: "전화예약",
      href: "tel:0507-1330-5958",
      isVisible: true,
    },
    {
      icon: MapPin,
      label: "오시는길",
      href: "/about/contact",
      isVisible: true,
    },
    {
      icon: MessageCircle,
      label: "블로그",
      href: "https://blog.naver.com/dasanoneamc",
      isVisible: true,
    },
    {
      icon: UserPlus,
      label: "회원가입",
      href: "/auth/sign-up",
      isVisible: !user,
    },
  ];

  return (
    <div className="hidden md:flex fixed right-0 top-[88px] h-[calc(100vh-88px)] w-16 bg-gray-100 border-l border-gray-200 z-40 flex-col items-center py-6 shadow-xl">
      {/* Quick Links */}
      <div className="flex flex-col gap-3 mb-auto mt-4 relative z-10">
        {quickLinks
          .filter((link) => link.isVisible)
          .map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="flex flex-col items-center justify-center w-12 h-12 hover:bg-white rounded-lg transition-all group relative"
            >
              <link.icon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-medium text-gray-500 group-hover:text-primary transition-colors mt-0.5">
                {link.label}
              </span>
            </Link>
          ))}
      </div>

      {/* Vertical Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 writing-vertical-rl text-gray-300/60 font-bold text-sm tracking-widest uppercase select-none whitespace-nowrap pointer-events-none z-0">
        DASANONE Animal Medical Center · 24h
      </div>

      {/* Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "flex flex-col items-center justify-center w-12 h-12 mt-auto transition-all duration-300 rounded-lg relative z-10",
          isVisible
            ? "opacity-100 bg-primary text-white hover:bg-primary/90"
            : "opacity-0 pointer-events-none",
        )}
      >
        <ArrowUp className="w-5 h-5" />
        <span className="text-[9px] font-medium mt-0.5">TOP</span>
      </button>
    </div>
  );
}
