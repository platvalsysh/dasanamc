import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, animate } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

/**
 * 홈 화면용 절제된 모션 프리미티브 (motion/react).
 *
 * 역할 분담: 스크롤 스크럽(서브페이지 hero)은 GSAP ScrollTrigger,
 * 진입 연출·카운트업은 motion. reduced-motion 사용자는 모두 정적 표시.
 */

interface RiseProps {
  children: ReactNode;
  /** 등장 지연 (초) — hero 시퀀스 계단용 */
  delay?: number;
  /** 이동 거리 px (기본 26) */
  y?: number;
  /** serif 카피용 — blur 6px → 0 으로 또렷해지는 연출 */
  blur?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** 뷰포트 진입 시 1회 fade + rise. 위 요소(hero)는 마운트 직후 발동. */
export function Rise({ children, delay = 0, y = 26, blur = false, className, style }: RiseProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: blur ? "blur(6px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: [0.2, 0.65, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface CountUpProps {
  /** "11" · "24/7" · "6" · "CT" — 앞자리 숫자만 카운트, 나머지는 그대로 */
  value: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

/** 뷰포트 진입 시 숫자 카운트업. 숫자가 없으면(CT 등) 정적 표시. */
export function CountUp({ value, duration = 1.1, className, style }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const m = value.match(/^(\d+)([\s\S]*)$/);
  const target = m ? parseInt(m[1], 10) : null;
  const suffix = m ? m[2] : "";
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || target == null || reduced) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.2, 0.7, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, reduced, duration]);

  if (target == null || reduced) {
    return (
      <span ref={ref} className={className} style={style}>
        {value}
      </span>
    );
  }
  return (
    <span ref={ref} className={className} style={style}>
      {inView ? n : 0}
      {suffix}
    </span>
  );
}
