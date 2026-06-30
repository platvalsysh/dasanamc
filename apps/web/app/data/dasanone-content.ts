/**
 * 24시 다산 원동물의료센터 콘텐츠 데이터.
 *
 * design_handoff_dasanone/reference/다산원동물의료센터.dc.html 의 `renderVals()`
 * 안에서 정의된 모든 데이터를 React 컴포넌트가 import 할 수 있도록 정적 export
 * 로 옮긴 것. 카피 수정은 이 파일에서.
 */

export const HOSPITAL = {
  name: "24시 다산 원동물의료센터",
  nameEn: "DASANONE ANIMAL MEDICAL CENTER",
  phone: "0507-1330-5958",
  phone2: "031-522-5956",
  email: "dasanoneamc@gmail.com",
  address: "경기 남양주시 다산중앙로 15, 3층",
  blog: "https://blog.naver.com/dasanoneamc",
  mapUrl:
    "https://map.naver.com/p/search/" +
    encodeURIComponent("남양주 다산원동물의료센터"),
  hours: {
    day: "09:30 ~ 21:00",
    night: "21:00 ~ 09:30",
    round: "12:30 ~ 13:00",
  },
  parking: {
    underground: "지하 3시간 30분 무료",
    public: "공영주차장 2시간 무료",
  },
};

export const THREE_ONE = [
  {
    tag: "The ONE & Only",
    ko: "단 하나의 진심",
    d: "내 아이를 치료하는 마음으로, 생명을 대하는 일에 어떠한 타협도 하지 않습니다.",
  },
  {
    tag: "All-in-ONE",
    ko: "원스톱 진료 시스템",
    d: "분과별 전공의들의 협진 체계와 대학병원급 의료 장비로 진단부터 수술, 회복까지 한 곳에서 이루어집니다.",
  },
  {
    tag: "Number ONE",
    ko: "다산을 대표하는 으뜸 병원",
    d: "끊임없는 연구와 임상 경험으로, 보호자님이 가장 먼저 믿고 맡길 수 있는 지역 최고의 주치의가 되겠습니다.",
  },
] as const;

export const STRENGTHS_4 = [
  { n: "01", t: "분야별 협진 진료 시스템", d: "내과·외과·영상의학과 협진으로 최상의 의료 서비스를 제공합니다." },
  { n: "02", t: "외과 전공 대표원장 직접 집도", d: "정형외과부터 신경외과 수술까지 외과 전공 대표원장이 직접 집도합니다." },
  { n: "03", t: "대학병원급 CT·영상장비", d: "대학병원급 CT와 영상장비로 정확하고 빠른 진단이 가능합니다." },
  { n: "04", t: "고양이 전용 별도 공간", d: "스트레스에 예민한 고양이를 위한 별도의 전용 공간을 갖췄습니다." },
] as const;

export const DOCTORS = [
  { name: "이현우", role: "대표원장 · 외과", cred: "경북대 수의과 · 수의외과학 석사 · AOVET TPLO 마스터" },
  { name: "조항빈", role: "대표원장", cred: "경북대 수의과 · 건국대 수의내과학 석사 · KSVCD 정회원·교육위원" },
  { name: "임동환", role: "진료 과장", cred: "건국대 수의과대학 · 육군 수의장교 대위 전역" },
  { name: "정지윤", role: "내과원장", cred: "충남대 수의과 · 수의내과학 석사 · 日本獣医生命科学大学 실습" },
  { name: "박병준", role: "응급 과장", cred: "경북대 수의학과 · 임상수의학 석사 · 수의내과학 박사과정" },
  { name: "이선아", role: "영상 과장", cred: "건국대 수의학과 · 수의영상진단의학 석사 · 건국대 부속동물병원 영상진단의학과" },
] as const;

export const FACILITIES = [
  "안내데스크 (리셉션)",
  "진료실",
  "고양이 전용 대기실",
  "고양이 전용 처치실",
  "고양이 전용 입원실",
  "강아지 처치실·입원실",
  "대형견 전용 입원장",
  "X-ray·초음파 검사실",
  "안과 진료실",
  "CT 실",
  "제1 수술실",
  "ICU 중환자실",
] as const;

export const EQUIPMENT = [
  {
    t: "대학병원급 CT",
    d: "엑스레이·초음파로 보기 어려운 3차원 영상을 확보하고, 촬영 당일 판독 시스템으로 신속·정확한 진단을 제공합니다.",
  },
  {
    t: "고사양 초음파",
    d: "영상의학 전공 과장이 직접 심장·복부 초음파를 진행해 진단의 정확도를 극대화합니다.",
  },
  {
    t: "동물용 HFNC",
    d: "고농도 산소 치료로 폐수종 등 응급 심장·호흡기 환자의 골든타임을 사수합니다.",
  },
  {
    t: "C-arm 실시간 X-ray",
    d: "정형외과·신경외과 수술 중 실시간 영상으로 정밀한 수술 계획과 시행을 지원합니다.",
  },
  {
    t: "내시경 시스템",
    d: "초소형견부터 대형견까지, 개복 없이 이물 제거·조직 검사를 수행하는 최소 침습 장비입니다.",
  },
  {
    t: "ICU 중환자 시스템",
    d: "고사양 ICU와 24시간 집중 모니터링으로 수술 후 중환자와 응급 환자를 케어합니다.",
  },
] as const;

export interface CenterInfo {
  id: string;
  num: string;
  ko: string;
  en: string;
  slogan: string;
  overview: string;
  targets: string;
  strengths: readonly string[];
}

export const CENTERS: readonly CenterInfo[] = [
  {
    id: "hepato",
    num: "01",
    ko: "간담낭췌장특화센터",
    en: "Hepatobiliary & Pancreatic Center",
    slogan: "침묵의 장기, 간·담낭·췌장의 복합 질환을 정밀하게 진단하고 근본적으로 치료합니다.",
    overview:
      "간·담낭·췌장은 서로 밀접하게 연관되어 증상이 모호하고 복합적인 경우가 많습니다. 고해상도 영상 진단과 정밀 혈액 검사로 원인을 정확히 파악하고, 내과적 관리부터 외과적 수술까지 통합적인 최적의 솔루션을 제공합니다.",
    targets: "만성 간염 · 간경화 · 담낭 점액종 · 담석증 · 급/만성 췌장염 · 간/췌장 종양",
    strengths: [
      "대학병원급 CT 및 고사양 초음파를 통한 정밀 영상 진단",
      "내과·외과 분과 협진을 통한 복합 질환의 체계적 관리",
      "고난도 담낭 절제술 및 간 종양 적출술 가능 수술팀 가동",
    ],
  },
  {
    id: "onco",
    num: "02",
    ko: "종양항암센터",
    en: "Oncology & Chemotherapy Center",
    slogan: "아이의 삶의 질(QoL)을 최우선으로, 암과 싸우는 고단한 여정에 따뜻한 동행이 되겠습니다.",
    overview:
      "반려동물의 고령화로 종양 발생률이 높아지고 있습니다. 암의 정확한 기수 판정부터 맞춤형 항암 스케줄, 부작용 관리, 근치적 수술까지 전 과정을 책임집니다. 인체의학 수준의 표적항암치료를 적극 적용하여, 종양의 유전자 변이를 정밀하게 검사해 가장 잘 맞는 항암제를 찾는 1:1 맞춤형 치료를 제공합니다.",
    targets: "피부 종양 · 유선 종양 · 림프종 · 비만세포종 · 골종양 · 각종 장기 내 종양",
    strengths: [
      "CT를 통한 종양의 전이 여부 및 범위 정밀 판독",
      "종양 타입에 맞춘 환자 맞춤형 항암 프로토콜",
      "통증 관리·영양학적 지원을 통한 삶의 질 유지 프로그램 병행",
    ],
  },
  {
    id: "heart",
    num: "03",
    ko: "심장센터",
    en: "Heart Center",
    slogan: "멈추지 않는 생명의 엔진, 심장의 미세한 변화를 포착하여 아이의 숨결을 편안하게 지킵니다.",
    overview:
      "켁켁거림·호흡곤란의 주요 원인인 심장 질환은 조기 발견과 지속적 관리가 생명 연장의 핵심입니다. 영상의학을 전공한 과장이 직접 최신 장비로 심장 초음파를 진행해 진단 정확도를 극대화하고, 호르몬 검사를 병행하여 구조적·기능적 이상을 빈틈없이 파악합니다.",
    targets: "이첨판폐쇄부전증(MMVD) · 확장성심근증(DCM) · 고양이 비대성심근증(HCM) · 선천성 심장 기형 · 심장사상충",
    strengths: [
      "최상위 등급 심장 전용 초음파 장비 보유",
      "혈압·ECG·심장 마커 검사를 통한 종합적 심기능 평가",
      "폐수종 등 응급 환자를 위한 24시간 산소 처치 및 집중 케어",
      "동물용 HFNC 기계 보유로 골든타임을 지키는 고농도 산소 치료",
    ],
  },
  {
    id: "endo",
    num: "04",
    ko: "내시경센터",
    en: "Endoscopy Center",
    slogan: "칼을 대지 않는 최소 침습 시술로, 통증은 줄이고 진단과 치료는 정확하게 합니다.",
    overview:
      "개복 수술 없이 내시경으로 소화기계·호흡기계 내부를 직접 관찰하고 이물을 제거하거나 조직 검사를 수행합니다. 아이의 신체적 부담을 최소화하여 빠른 회복을 돕습니다.",
    targets: "위내 이물 제거 · 만성 구토/설사 원인 규명 · 식도 협착 확장술 · 콧속 이물 제거",
    strengths: [
      "초소형견부터 대형견까지 가능한 다양한 크기의 최신 내시경",
      "개복 없이 이물을 안전하게 제거하는 비수술적 치료 전문",
      "당일 시술·당일 퇴원이 가능한 빠른 회복 시스템",
    ],
  },
  {
    id: "ct",
    num: "05",
    ko: "CT영상센터",
    en: "CT Imaging Center",
    slogan: "몸속 깊은 곳의 이상까지, 0.1mm의 오차 없이 찾아내는 진단의 핵심입니다.",
    overview:
      "대학병원급 첨단 CT 장비로 엑스레이나 초음파만으로 확인하기 어려운 정밀한 3차원 영상을 확보합니다. 이는 모든 특화센터 진료의 근본이 되는 정확한 진단의 기초가 됩니다.",
    targets: "종양의 전이·범위 평가 · 복잡한 골절 및 관절 질환 · 두부/척추 질환 · 혈관 기형 진단",
    strengths: [
      "대학병원급 고해상도 CT 스캐너 도입",
      "CT 촬영 후 당일 판독 시스템으로 신속·정확한 치료 계획 수립",
      "영상의학 전공 수의사의 정밀 판독 시스템",
      "짧은 스캔 시간으로 마취 시간 단축 및 환자 안전 확보",
    ],
  },
  {
    id: "ortho",
    num: "06",
    ko: "골관절센터",
    en: "Bone & Joint Center",
    slogan: "튼튼한 다리로 다시 뛰어놀 수 있도록, 슬개골 탈구부터 고난도 정형외과 수술까지 해결합니다.",
    overview:
      "소형견에게 흔한 슬개골 탈구는 물론 십자인대 파열, 골절 등 보행에 지장을 주는 모든 골관절 질환을 다룹니다. 정확한 정형외과적 검사와 영상 진단으로 재발 없는 확실한 수술적 해법을 제시합니다.",
    targets: "슬개골 탈구 · 전십자인대 파열(CTWO/TPLO) · 대퇴골두 괴사(FHNO) · 각종 골절 · 관절염",
    strengths: [
      "재발률을 최소화하는 고난도 정형외과 수술 전문 의료진",
      "CT 및 C-arm을 활용한 정밀 수술 계획 및 시행",
      "수술 후 빠른 회복을 돕는 맞춤형 재활 프로그램 연계",
    ],
  },
  {
    id: "neuro",
    num: "07",
    ko: "신경외과센터",
    en: "Neurosurgery Center",
    slogan: "아이의 마비와 통증을 멈추게 하는 촌각을 다투는 수술, 숙련된 손길이 기적을 만듭니다.",
    overview:
      "디스크(IVDD), 뇌질환 등 신경계 이상으로 인한 마비·극심한 통증은 신속한 진단과 수술이 예후를 결정합니다. 고난도 신경 수술에 특화된 의료진과 장비로 촌각을 다투는 환자를 치료합니다.",
    targets: "강아지 디스크(IVDD) · 척추 골절 · 뇌수두증 · 환축추 아탈구",
    strengths: [
      "신경계 질환 전공 의료진의 전문적 진단 및 수술",
      "미세현미경·정밀 수술 기구를 활용한 안전한 척추/뇌 수술",
      "수술 후 신경 회복을 위한 24시간 집중 ICU 케어 및 재활",
    ],
  },
  {
    id: "surgery",
    num: "08",
    ko: "일반외과센터",
    en: "General Surgery Center",
    slogan: "안전한 마취와 무균 수술 시스템, 가장 기본적이면서도 치명적인 질환을 완벽하게 수술합니다.",
    overview:
      "중성화 수술부터 자궁축농증, 위염전 등 연부조직에 발생하는 다양한 질환의 수술을 담당합니다. 생명을 최우선으로 하는 안전한 마취 프로토콜과 철저한 무균 원칙을 준수합니다.",
    targets: "중성화 수술 · 자궁축농증 · 위·장 이물 수술 · 유선종양 · 탈장 수술 · 위염전 · 방광결석 수술",
    strengths: [
      "마취 전담 수의사의 밀착 모니터링을 통한 마취 안정성 확보",
      "통증 최소화를 위한 최신 수술 기구(Ligasure 등) 및 통증 관리 프로그램",
      "철저한 무균 원칙을 준수하는 수술 시스템",
    ],
  },
  {
    id: "feline",
    num: "09",
    ko: "고양이전문클리닉",
    en: "Feline Specialized Clinic",
    slogan: "예민한 고양이의 마음까지 케어하는, 스트레스 없는 전용 공간과 따뜻한 손길.",
    overview:
      "강아지와 전혀 다른 고양이만의 신체적 특징·질환·행동학을 깊이 이해하는 수의사가 진료합니다. 대기실부터 진료실, 입원실까지 강아지와 완전히 분리된 고양이 전용 공간에서 편안한 진료를 약속합니다.",
    targets:
      "하부요로기계질환(FLUTD) · 만성 신부전(CKD) · 비대성심근증(HCM) · 고양이 전염성 복막염(FIP) · 구내염",
    strengths: [
      "ISFM(국제고양이의학협회) Gold 등급 수준의 고양이 전용 시설",
      "고양이 전공 수의사의 친묘(Cat-friendly) 진료 방식",
      "신장·심장·치과 등 고양이 호발 질환에 특화된 정밀 검진",
    ],
  },
  {
    id: "er",
    num: "10",
    ko: "응급중환자센터",
    en: "Emergency & Intensive Care Center",
    slogan: "365일 24시간 깨어있는 단 하나의 불빛, 골든타임을 지키는 마지막 신뢰의 이름입니다.",
    overview:
      "밤낮없이 발생하는 예기치 못한 응급 상황과 고난도 수술 후 집중 케어가 필요한 중환자를 위해, 365일 24시간 전문 수의사와 스태프가 병원에 상주합니다.",
    targets: "교통사고 등 중증 외상 · 난산 · 급성 쇼크 · 중독증 · 수술 후 집중 관리가 필요한 환자",
    strengths: [
      "365일 24시간 야간 응급 진료 및 수술 가능",
      "응급 처치 전용 장비 및 고사양 ICU 시스템 가동",
      "응급 수혈 시스템 및 전담팀 가동으로 골든타임 사수",
    ],
  },
  {
    id: "checkup-c",
    num: "11",
    ko: "건강검진센터",
    en: "Health Checkup Center",
    slogan: "질병의 근본은 조기 발견입니다. 연령과 상태에 맞춘 체계적인 종합 검진 프로토콜.",
    overview:
      "반려동물은 아파도 말을 하지 못해 질병이 상당히 진행된 후 병원을 찾는 경우가 많습니다. 연령별·품종별·증상별 맞춤형 검진 프로그램으로 질병을 조기에 발견하고 예방하여 행복한 삶을 오래 누리도록 돕습니다.",
    targets: "생애 주기별 필수 검진(퍼피/키튼·성견/성묘·노령견/노령묘) · 품종별 호발 질환 검진",
    strengths: [
      "대학병원급 CT를 포함한 정밀 검진 프로그램 구성",
      "검진 결과에 따라 각 특화센터 전문의 즉시 연계",
      "검진 데이터 기반의 장기적인 건강 관리 포트폴리오 제공",
    ],
  },
];

export const HERO_STATS = [
  { v: "24/7", l: "365일 연중무휴 응급진료" },
  { v: "11", l: "특화진료센터" },
  { v: "6", l: "석사 이상 전문 의료진" },
  { v: "CT", l: "대학병원급 당일 판독" },
] as const;

export const STAT_BIG = [
  { v: "24/7", l: "365일 연중무휴 응급진료", s: "야간·주말에도 전문 수의사 상주" },
  { v: "11", l: "특화진료센터", s: "분과별 전공의 협진 시스템" },
  { v: "6", l: "전문 의료진", s: "전원 석사 이상 · 경북대·건국대·충남대" },
  { v: "CT", l: "대학병원급 당일 판독", s: "촬영 당일 정밀 영상 진단" },
] as const;

export const MARQUEE_ITEMS = [
  "대학병원급 CT",
  "분과별 협진 시스템",
  "외과 전공 대표원장 직접 집도",
  "동물용 HFNC",
  "고양이 전용 공간",
  "24시간 ICU",
  "표적항암치료",
  "당일 판독",
] as const;

export const HERO_ROTATING_PHRASES = [
  "수준 높은 의료 서비스",
  "365일 24시간 응급케어",
  "대학병원급 정밀 진단",
  "분과 협진 원스톱 케어",
] as const;

export const SOLUTION_TABS = [
  {
    label: "정밀 진단",
    title: "대학병원급 CT·초음파로 정밀하게",
    desc: "엑스레이로 보이지 않는 영역까지, 영상의학 전공 과장이 직접 판독합니다. CT는 촬영 당일 판독으로 빠르게 치료 계획을 세웁니다.",
    points: ["대학병원급 고해상도 CT · 당일 판독", "심장·복부 고사양 초음파", "내시경 최소 침습 진단"],
  },
  {
    label: "분과 협진",
    title: "내과·외과·영상의학 분과 협진",
    desc: "각 분과 전공의가 한 환자를 함께 봅니다. 복합 질환도 협진 체계로 누락 없이 진단하고 치료 방향을 정합니다.",
    points: ["11개 특화센터 전공의 협진", "복합 질환 통합 진료 계획", "검진 → 특화센터 즉시 연계"],
  },
  {
    label: "수술·치료",
    title: "외과 전공 대표원장 직접 집도",
    desc: "정형외과부터 신경외과까지 외과 전공 대표원장이 직접 집도합니다. 마취 전담 수의사의 밀착 모니터링으로 안전을 확보합니다.",
    points: ["정형·신경외과 고난도 수술", "마취 전담 모니터링 시스템", "표적항암 등 맞춤 치료"],
  },
  {
    label: "24시 케어",
    title: "365일 24시간 ICU 집중 케어",
    desc: "수술 후 중환자와 야간 응급 환자를 위해 전문 수의사와 스태프가 24시간 상주합니다. 동물용 HFNC로 골든타임을 지킵니다.",
    points: ["24시간 응급 진료·수술", "고사양 ICU 중환자 시스템", "동물용 HFNC 고농도 산소"],
  },
] as const;

export const PROCESS_STEPS = [
  { n: "01", t: "문진표 작성", d: "반려동물의 생활 패턴과 현재 건강 상태를 문진표로 작성합니다." },
  { n: "02", t: "신체검사", d: "시진·촉진·청진으로 신체 전반을 평가하고 바이탈 사인을 측정합니다." },
  { n: "03", t: "채혈·혈액검사", d: "채혈 후 각 프로그램에 해당하는 혈액 검사 항목을 진행합니다." },
  { n: "04", t: "영상검사", d: "방사선·초음파·CT 등 프로그램별 영상 검사를 진행합니다." },
  {
    n: "05",
    t: "결과 상담",
    d: "담당 수의사와 향후 관리·치료 방향을 상담하고, 이상 소견 시 특화센터로 연계합니다.",
  },
] as const;

export const INFO_ROWS = [
  { k: "주소", v: HOSPITAL.address },
  { k: "대표전화", v: `${HOSPITAL.phone} / ${HOSPITAL.phone2}` },
  { k: "주간진료", v: `${HOSPITAL.hours.day} (워크인 가능)` },
  { k: "야간응급", v: `${HOSPITAL.hours.night} · 야간 진료비 +40,000원` },
  { k: "운영", v: "365일 24시간 연중무휴" },
  { k: "주차", v: `${HOSPITAL.parking.underground} · ${HOSPITAL.parking.public}` },
] as const;

export interface CheckRow {
  item: string;
  head?: boolean;
  sep?: boolean;
  b: string;
  s: string;
  p: string;
}

interface CheckGroup {
  rows: { item: string; b: string; s: string; p: string }[];
}

function buildRows(groups: readonly CheckGroup[]): CheckRow[] {
  const mark = (v: string) => (v === "✓" ? "✓" : v ? v : "·");
  const out: CheckRow[] = [];
  groups.forEach((g, gi) => {
    g.rows.forEach((r, ri) => {
      out.push({
        item: r.item,
        b: mark(r.b),
        s: mark(r.s),
        p: mark(r.p),
        head: ri === 0,
        sep: ri === 0 && gi > 0,
      });
    });
  });
  return out;
}

const DOG_GROUPS: readonly CheckGroup[] = [
  { rows: [
    { item: "신체검사", b: "✓", s: "✓", p: "✓" },
    { item: "혈압측정", b: "✓", s: "✓", p: "✓" },
    { item: "검이경 검사", b: "✓", s: "✓", p: "✓" },
    { item: "피부검사", b: "✓", s: "✓", p: "✓" },
  ] },
  { rows: [ { item: "치과 직접검안", b: "✓", s: "✓", p: "✓" } ] },
  { rows: [ { item: "안압(토노펜) 검사", b: "", s: "", p: "✓" } ] },
  { rows: [
    { item: "심장초음파 검사", b: "", s: "✓", p: "✓" },
    { item: "심전도 검사", b: "", s: "", p: "✓" },
  ] },
  { rows: [
    { item: "혈구검사(CBC)", b: "✓", s: "✓", p: "✓" },
    { item: "간·신장·혈당·전해질", b: "화학 10종", s: "화학 17종", p: "화학 17종" },
    { item: "혈액가스(정맥혈)", b: "", s: "✓", p: "✓" },
    { item: "조기신장기능(SDMA)", b: "", s: "✓", p: "✓" },
    { item: "갑상선 호르몬(T4)", b: "", s: "", p: "✓" },
  ] },
  { rows: [ { item: "요검사(노스틱)", b: "", s: "", p: "✓" } ] },
  { rows: [
    { item: "흉·복부 방사선", b: "✓", s: "✓", p: "✓" },
    { item: "복부 초음파", b: "", s: "✓", p: "✓" },
  ] },
  { rows: [
    { item: "정형외과 검사", b: "✓", s: "✓", p: "✓" },
    { item: "전지·후지 방사선", b: "", s: "", p: "✓" },
  ] },
  { rows: [ { item: "검진 비용 (예시)", b: "15만원", s: "29만원", p: "45만원" } ] },
];

const CAT_GROUPS: readonly CheckGroup[] = [
  { rows: [
    { item: "신체검사", b: "✓", s: "✓", p: "✓" },
    { item: "혈압측정", b: "✓", s: "✓", p: "✓" },
    { item: "검이경 검사", b: "✓", s: "✓", p: "✓" },
    { item: "피부검사", b: "✓", s: "✓", p: "✓" },
  ] },
  { rows: [ { item: "치과 직접검안", b: "✓", s: "✓", p: "✓" } ] },
  { rows: [ { item: "심장초음파 검사", b: "", s: "✓", p: "✓" } ] },
  { rows: [
    { item: "혈구검사(CBC)", b: "✓", s: "✓", p: "✓" },
    { item: "일반 화학 검사", b: "혈액 6종", s: "화학 17종", p: "화학 17종" },
    { item: "혈액가스(정맥혈)", b: "", s: "✓", p: "✓" },
    { item: "심장바이오마커(BNP)", b: "", s: "✓", p: "✓" },
    { item: "조기신장기능(SDMA)", b: "", s: "✓", p: "✓" },
    { item: "갑상선 호르몬(T4)", b: "", s: "", p: "✓" },
  ] },
  { rows: [ { item: "요검사(노스틱)", b: "", s: "", p: "✓" } ] },
  { rows: [
    { item: "흉·복부 방사선", b: "✓", s: "✓", p: "✓" },
    { item: "복부 초음파", b: "", s: "✓", p: "✓" },
  ] },
  { rows: [ { item: "검진 비용 (예시)", b: "14만원", s: "27만원", p: "42만원" } ] },
];

export const DOG_ROWS: readonly CheckRow[] = buildRows(DOG_GROUPS);
export const CAT_ROWS: readonly CheckRow[] = buildRows(CAT_GROUPS);

/** 헤더 dropdown 메뉴에 사용. 11개 센터 + 건강검진 */
export interface CenterMenuItem {
  num: string;
  label: string;
  to: string;
}
export const CENTER_MENU: readonly CenterMenuItem[] = [
  { num: "01", label: "간담낭췌장특화센터", to: "/centers#hepato" },
  { num: "02", label: "종양항암센터", to: "/centers#onco" },
  { num: "03", label: "심장센터", to: "/centers#heart" },
  { num: "04", label: "내시경센터", to: "/centers#endo" },
  { num: "05", label: "CT영상센터", to: "/centers#ct" },
  { num: "06", label: "골관절센터", to: "/centers#ortho" },
  { num: "07", label: "신경외과센터", to: "/centers#neuro" },
  { num: "08", label: "일반외과센터", to: "/centers#surgery" },
  { num: "09", label: "고양이전문클리닉", to: "/centers#feline" },
  { num: "10", label: "응급중환자센터", to: "/centers#er" },
  { num: "11", label: "건강검진센터", to: "/centers#checkup-c" },
  { num: "＋", label: "건강검진 프로그램", to: "/centers#checkup" },
];

/** 헤더 dropdown — 병원소개 */
export const ABOUT_MENU = [
  { label: "병원소개", to: "/about" },
  { label: "의료진소개", to: "/about#doctors" },
  { label: "병원둘러보기", to: "/about#facilities" },
] as const;

export const LEAD_DOCTORS = DOCTORS.slice(0, 2);
export const REST_DOCTORS = DOCTORS.slice(2);

export const NOTICES_FALLBACK = [
  { tag: "안내", date: "2025.08", t: "24시 다산 원동물의료센터가 개원하였습니다." },
  { tag: "운영", date: "상시", t: "365일 24시간 연중무휴 응급 진료를 운영합니다." },
  { tag: "블로그", date: "업데이트", t: "진료 케이스와 건강 정보를 네이버 블로그에서 확인하세요." },
] as const;

export const FAQS = [
  {
    q: "예약 없이 바로 진료가 가능한가요?",
    a: "네, 워크인 진료가 가능합니다. 다만 예약 환자와 응급 환자가 우선되어 대기가 발생할 수 있어, 가능하시면 전화 예약을 권해드립니다.",
  },
  {
    q: "야간이나 새벽에도 진료하나요?",
    a: "365일 24시간 연중무휴로 운영합니다. 야간 응급진료는 21:00~익일 09:30이며, 야간 진료비 40,000원이 추가됩니다.",
  },
  {
    q: "진료비는 어떻게 되나요?",
    a: "초진료 10,000원, 재진료 5,000원입니다. 검사·처치·수술 비용은 진료 후 별도로 안내드립니다.",
  },
  {
    q: "주차할 수 있나요?",
    a: "건물 지하 주차장 3시간 30분 무료, 병원 앞 공영주차장 2시간 무료를 지원합니다.",
  },
  {
    q: "고양이도 편하게 진료받을 수 있나요?",
    a: "대기실·처치실·입원실까지 강아지와 완전히 분리된 고양이 전용 공간을 운영하여 스트레스를 최소화합니다.",
  },
  {
    q: "다른 병원에서 CT·수술 의뢰가 가능한가요?",
    a: "네, 대학병원급 CT와 외과 협진 의뢰를 받고 있습니다. 고객센터로 문의해 주세요.",
  },
] as const;
