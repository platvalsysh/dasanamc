-- 초기 의료진 시드 — 기존 하드코딩 데이터(dasanone-content.ts) 이관.
-- 테이블이 비어 있을 때만 1회 삽입 (재실행/운영 데이터 보호).

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM modules.doctors LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO modules.doctors
    (name, title, cred, quote, greeting, career, centers, photo_url, is_chief, is_active, list_order)
  VALUES
  (
    '이현우', '대표원장 · 외과',
    '경북대 수의과 · 수의외과학 석사 · AOVET TPLO 마스터',
    $q$수술로 열어가는 새로운 삶, 책임감 있는 외과 진료$q$,
    $q$외과 수술은 단순한 기술이 아니라, 아이의 두 번째 삶을 열어주는 과정입니다. 세밀한 계획과 철저한 준비, 그리고 책임감을 바탕으로 반려동물의 건강을 지켜가고 있습니다. 보호자분께는 과정과 예후를 솔직히 말씀드리고, 반려동물에게는 통증과 불안을 최소화하는 안전한 수술을 약속드립니다.$q$,
    jsonb_build_array(
      '경북대학교 수의과대학 수의학과 졸업',
      '경북대학교 수의과대학 대학원 수의외과학 석사 졸업',
      '전) 경북대학교 수의과대학 부속동물병원 외과 진료수의사',
      'RECOVER CPR Workshop 수료',
      '2022 AOVET Asia Pacific — Principle of Small Animal Fracture Management 코스 수료',
      '2022 AOVET Asia Pacific — Master Course: TPLO(Tibial Plateau Leveling Osteotomy) 코스 수료',
      '2023 AOVET Asia Pacific — Advance of Small Animal Fracture Management 코스 수료',
      'Advanced Techniques in Small Animal Fracture Management (Lecture & Workshop)',
      'N동물의료센터 노원점·강북점 외과 과장',
      '국내·국외 학술지 투고 (각막 각질세포에 대한 SVF·중간엽줄기세포 연구)',
      '현) 24시 다산 원동물의료센터 원장'
    ),
    jsonb_build_array('ortho', 'surgery', 'neuro'),
    '/images/doctors/lee-hyunwoo.png', true, true, 1
  ),
  (
    '조항빈', '대표원장',
    '경북대 수의과 · 건국대 수의내과학 석사 · KSVCD 정회원·교육위원',
    $q$평생을 함께 지키는 중증·노령 내과 케어$q$,
    $q$내과 진료는 단순히 질환을 치료하는 것을 넘어, 아이의 '삶의 질'을 관리하는 과정입니다. 중증 질환과 노령 반려동물의 건강 관리에 집중하여, 오랜 경험과 데이터를 토대로 최적의 치료 방향을 제시합니다. 보호자분의 이야기를 끝까지 경청하며, 아이가 남은 생을 건강하고 편안하게 보낼 수 있도록 최선을 다하겠습니다.$q$,
    jsonb_build_array(
      '경북대학교 수의과대학 졸업',
      '건국대학교 수의과대학 수의내과학 석사',
      '경북대학교 수의과대학 임상로테이션 수료',
      '대구동물메디컬센터 실습',
      '경기도청 공중방역수의사',
      '대성미생물연구소 신약개발 담당 주임',
      'HLB테라퓨틱스 항암제 해외 RA 대리',
      '미래동물의료센터 진료수의사',
      'KSVCD 한국수의임상피부학회 정회원·교육위원',
      '안재상 박사 안과 세미나 수료',
      '2024 수의응급의학회 세미나 수료',
      '현) 24시 다산 원동물의료센터 원장'
    ),
    jsonb_build_array('hepato', 'heart', 'onco', 'endo'),
    '/images/doctors/cho-hangbin.png', true, true, 2
  ),
  (
    '임동환', '진료 과장',
    '건국대 수의과대학 · 육군 수의장교 대위 전역',
    $q$세심한 관찰과 따뜻한 동반자로서의 진료$q$,
    $q$작은 이상 신호도 놓치지 않고 보호자와 함께 해결해 나가는 것을 가장 중요하게 생각합니다. 단순한 치료가 아닌, 예방부터 생활 관리까지 함께 고민하며 반려동물의 전 생애 건강을 지켜드리겠습니다. 언제든지 편하게 상담하고 의지할 수 있는 '가장 가까운 주치의'가 되겠습니다.$q$,
    jsonb_build_array(
      '건국대학교 수의과대학 졸업',
      '건국대학교 수의과대학 임상로테이션 수료',
      '육군 수의장교 대위 전역',
      '강북 24시 N동물의료센터 진료수의사',
      '2023·2024·2025 서울수의컨퍼런스 참가',
      '현) 24시 다산 원동물의료센터 진료과장'
    ),
    jsonb_build_array('checkup-c'),
    '/images/doctors/lim-donghwan.png', false, true, 3
  ),
  (
    '정지윤', '내과원장',
    '충남대 수의과 · 수의내과학 석사 · 日本獣医生命科学大学 실습',
    $q$삶의 질을 개선하는 내과 질환 치료$q$,
    $q$내과 진료는 아이의 생애 전반을 함께 걷는 긴 여정입니다. 심장, 신장, 내분비 질환처럼 꾸준한 관리가 필요한 만성 질환일수록 보호자님과의 소통이 중요합니다. 아이의 투병 과정을 보호자님 혼자 견디게 하지 않겠습니다. 아이가 통증 없이 가족 곁에서 행복하게 오래 머물 수 있도록 최적의 관리 솔루션을 제공합니다.$q$,
    jsonb_build_array(
      '충남대학교 수의과대학 졸업',
      '충남대학교 수의과대학 수의내과학 석사 과정',
      '충남대학교 수의과대학 임상로테이션 수료',
      '일본 日本獣医生命科学大学 동물병원 실습',
      '동탄 24시 I동물의료센터·대전 S동물병원·양주 H동물병원 실습',
      '2023·2025 부산수의컨퍼런스 참가',
      '2025 대전·인천 연수교육 세미나 참가',
      '한국임상수의학회 춘계학술대회 발표 (Polyarthritis Associated with Adjuvant Doxorubicin for Renal Hemangiosarcoma in a Maltese Dog)'
    ),
    jsonb_build_array('hepato', 'heart', 'onco', 'endo'),
    '/images/doctors/jung-jiyoon.png', false, true, 4
  ),
  (
    '박병준', '응급 과장',
    '경북대 수의학과 · 임상수의학 석사 · 수의내과학 박사과정',
    $q$가장 어두운 밤, 아이의 곁을 지키는 가장 밝은 빛이 되겠습니다$q$,
    $q$예고 없이 찾아온 위기의 순간, 명확한 판단과 오차 없는 응급 처치로 아이가 다시 평온한 일상으로 돌아갈 수 있도록 진심을 다해 진료하겠습니다. 사고의 순간부터 완전한 회복에 이르기까지 세밀하게 모니터링하여, 긴박한 골든타임에 병원 문을 두드린 보호자님께 '안도'라는 확신을 드리겠습니다.$q$,
    jsonb_build_array(
      '경북대학교 수의학과 졸업',
      '경북대학교 임상수의학 석사 졸업',
      '한양대학교 경영전문대학원 석사 졸업',
      '경북대학교 수의과대학 수의내과학 박사과정',
      '경북대학교 동물병원 당직 수의사',
      'F동물메디컬센터 내과 팀장',
      '녹십자수의약품 Marketing PM · 연구소 R&D Specialist',
      '현) 녹십자수의약품 임상수의자문',
      '국경없는수의사회(VWB) 정회원',
      '대한수의피부과학회(KSVD) 정회원',
      '한국수의종양의학연구회(KVOS) 정회원',
      '한국고양이수의사회(KSFM) 정회원'
    ),
    jsonb_build_array('er'),
    '/images/doctors/park-byungjoon.png', false, true, 5
  ),
  (
    '이선아', '영상 과장',
    '건국대 수의학과 · 수의영상진단의학 석사 · 건국대 부속동물병원 영상진단의학과',
    $q$영상으로 읽는 아이들의 속마음, 건강한 내일을 봅니다$q$,
    $q$정확한 진단으로 아픈 아이들의 보이지 않는 곳의 이상을 명확히 찾아내겠습니다. 보호자분께는 눈에 보이지 않는 아이의 상태를 쉽고 투명하게 설명해 드리고, 반려동물에게는 효율적이고 편안한 검사 과정을 약속드립니다. 작은 단서 하나가 아이의 평생을 바꿀 수 있다는 사명감으로 소중한 일상을 묵묵히 지켜나가겠습니다.$q$,
    jsonb_build_array(
      '건국대학교 수의학과 졸업',
      '건국대학교 수의영상진단의학과 석사 졸업',
      '건국대학교 수의과대학 부속동물병원 영상진단의학과 진료수의사',
      '한국수의영상의학연구회(KSVMI) 정회원',
      'T동물의료센터 영상과장',
      'V동물의료센터 노원점 영상과장'
    ),
    jsonb_build_array('ct'),
    NULL, false, true, 6
  );
END $$;
