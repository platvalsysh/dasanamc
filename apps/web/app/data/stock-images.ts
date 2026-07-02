/**
 * 임시 스톡 이미지 (Unsplash 공개 CDN).
 *
 * 실제 병원 촬영본이 준비되면 이 파일의 URL 만 로컬 경로로 교체하면 됨.
 * 모든 URL 은 2026-07 기준 200 응답 검증 완료.
 */

const u = (id: string, w = 1920, q = 70) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/** 페이지 hero 배경 (1920px) */
export const HERO_IMAGES = {
  doctors: u("1628009368231-7bb7cfcb0def"),   // 수의사 + 강아지 진료
  facilities: "/images/facility/exam-hall.jpg", // 실촬영 — 진료실 복도
  equipment: "/images/facility/ct-room.jpg",   // 실촬영 — CT실 (Toshiba Activion)
  centers: u("1548199973-03cce0bbc87b"),       // 함께 달리는 강아지들
  centerDetail: u("1601758124510-52d02ddb7cbd"), // 진료대 위 강아지
  checkup: u("1583337130417-3346a1be7dee"),    // 케어 받는 골든리트리버
  support: u("1450778869180-41d0601e046e"),    // 강아지와 고양이
  notice: u("1587300003388-59208cc962cb"),     // 나란히 앉은 강아지·고양이
  faq: u("1543466835-00a7907e9de1"),           // 점프하는 강아지
  contact: u("1583511655857-d19b40a7a54e"),    // 웃는 강아지
} as const;

/** 홈 ONE STOP CARE 등 콘텐츠 슬롯 */
export const CONTENT_IMAGES = {
  oneStopCare: u("1601758228041-f3b2795255f1", 1200), // 진료 현장
  blogThumb: u("1548199973-03cce0bbc87b", 900),        // 달리는 강아지들
} as const;
