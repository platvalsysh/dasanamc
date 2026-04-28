export const KakaoTemplateStatusMap: Record<string, string> = {
  PENDING: "대기",
  INSPECTING: "검수중",
  APPROVED: "등록완료",
  REJECTED: "반려됨",
};

export const KakaoMessageTypeMap: Record<string, string> = {
  BA: "기본형",
  EX: "부가정보형",
  AD: "광고형",
  MI: "복합형",
};

export const KakaoEmphasizeTypeMap: Record<string, string> = {
  NONE: "선택안함",
  TEXT: "강조표기형",
  IMAGE: "이미지형",
  ITEM_LIST: "아이템리스트형",
};

export const KakaoButtonTypeMap: Record<string, string> = {
  DS: "배송조회",
  WL: "웹링크",
  AL: "앱링크",
  BK: "봇키워드",
  MD: "메시지전달",
  BC: "상담톡전환",
  BT: "봇전환",
  AC: "채널추가",
};
