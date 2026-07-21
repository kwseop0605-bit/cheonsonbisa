// ── 천손비사 데이터 정의 모듈 (data.js) ──────────────────
// cheonson.html에서 분리됨

// ────── 01_data.js ──────
// ═══════════════════════════════════════
// 01_data
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 01_data
// ═══════════════════════════════════════

// ── 몬스터 이미지 데이터 ──────────────────────────
// 사냥터 배경 이미지 (이미지 파일 적용 시 여기에 base64 추가)
const ZONE_BG = {
  gather_select: 'images/bg/gather_select.jpg',

  field: "images/bg/field.jpg",
  forest: "images/bg/forest.jpg",
  // deep: "data:image/jpeg;base64,...",
  mine: 'images/bg/mine.jpg',};


const CHAR_IMAGES = {
  '남_normal':  'images/characters/male_normal.png',
  '여_normal':  'images/characters/female_normal.png',
  '남_battle':  'images/characters/male_battle.png',
  '여_battle':  'images/characters/female_battle.png',
};

const GATHER_IMAGES = {
  '쑥':     'images/gather/ssuk.png',
  '돌광석': 'images/gather/stone.png',       // 들판 채집 맵 아이콘
  '돌조각': 'images/gather/stone_chunk.png', // 재료창고 표시
  '소나무': 'images/gather/pine.png',
  '철광석': 'images/gather/iron_ore.png',
  '석탄':   'images/gather/coal.png',
  '수정':   'images/gather/crystal.png',
  '은광석': 'images/gather/silver_ore.png',
  '금광석': 'images/gather/gold_ore.png',
};

const MON_IMAGES = {
  'grasshopper_normal': 'images/monsters/grasshopper_normal.png',
  'grasshopper_battle': 'images/monsters/grasshopper_battle.png',
  'katydid_normal': 'images/monsters/katydid_normal.png',
  'katydid_battle': 'images/monsters/katydid_battle.png',
  'centipede_normal': 'images/monsters/centipede_normal.png',
  'centipede_battle': 'images/monsters/centipede_battle.png',
  'giant_wasp_normal': 'images/monsters/giant_wasp_normal.png',
  'giant_wasp_battle': 'images/monsters/giant_wasp_battle.png',
  'spider_normal': 'images/monsters/spider_normal.png',
  'spider_battle': 'images/monsters/spider_battle.png',
};
// ── SVG 드로잉 ────────────────────────────────────

// 천손 캐릭터 SVG
function drawChar(svgEl, gender='남', body='균형'){
  const isMale = gender === '남';
  const S = `
  <!-- 더듬이/머리카락 -->
  ${isMale ? `
    <rect x="22" y="2" width="3" height="8" rx="1" fill="#3a2010"/>
    <rect x="35" y="2" width="3" height="8" rx="1" fill="#3a2010"/>
    <rect x="15" y="8" width="30" height="12" rx="4" fill="#3a2010"/>
  ` : `
    <path d="M20 10 Q15 5 18 2 Q22 0 25 5" fill="#1a0a0a"/>
    <path d="M40 10 Q45 5 42 2 Q38 0 35 5" fill="#1a0a0a"/>
    <rect x="16" y="8" width="28" height="6" rx="2" fill="#1a0a0a"/>
  `}
  <!-- 얼굴 -->
  <rect x="18" y="10" width="24" height="20" rx="5" fill="#f4c896" stroke="#d4a870" stroke-width=".8"/>
  <!-- 눈 -->
  <ellipse cx="26" cy="18" rx="2.5" ry="2" fill="#1a0a00"/>
  <ellipse cx="34" cy="18" rx="2.5" ry="2" fill="#1a0a00"/>
  <circle cx="26.8" cy="17.3" r=".8" fill="#fff"/>
  <circle cx="34.8" cy="17.3" r=".8" fill="#fff"/>
  <!-- 입 -->
  <path d="M27 23 Q30 25 33 23" fill="none" stroke="#c07060" stroke-width=".8" stroke-linecap="round"/>
  <!-- 상체(전통 두루마기) -->
  <path d="M16 30 Q15 32 14 45 L46 45 Q45 32 44 30 Q37 28 30 28 Q23 28 16 30Z" fill="${isMale ? '#1a3a8a' : '#8a1a2a'}" stroke="${isMale ? '#2a5aaa' : '#aa2a4a'}" stroke-width=".8"/>
  <!-- 깃 -->
  <path d="M27 28 L24 45" fill="none" stroke="${isMale ? '#c9922a' : '#c9922a'}" stroke-width="1"/>
  <path d="M33 28 L36 45" fill="none" stroke="${isMale ? '#c9922a' : '#c9922a'}" stroke-width="1"/>
  <!-- 목 -->
  <rect x="27" y="27" width="6" height="5" fill="#f4c896"/>
  <!-- 팔(소매) -->
  <path d="M14 32 Q8 36 6 42 L12 44 Q14 38 16 34Z" fill="${isMale ? '#1a3a8a' : '#8a1a2a'}"/>
  <path d="M46 32 Q52 36 54 42 L48 44 Q46 38 44 34Z" fill="${isMale ? '#1a3a8a' : '#8a1a2a'}"/>
  <!-- 손 -->
  <ellipse cx="9" cy="44" rx="3" ry="2.5" fill="#f4c896"/>
  <ellipse cx="51" cy="44" rx="3" ry="2.5" fill="#f4c896"/>
  <!-- 무기(오른손) - 검 -->
  <rect x="53" y="28" width="2" height="22" rx="1" fill="#c8c8c8"/>
  <rect x="50" y="36" width="8" height="2" rx="1" fill="#c9922a"/>
  <rect x="53.5" y="26" width="1" height="4" rx=".5" fill="#c9922a"/>
  <!-- 하의 -->
  <path d="M16 45 L14 68 L26 68 L30 55 L34 68 L46 68 L44 45Z" fill="${isMale ? '#0a1a4a' : '#4a0a1a'}"/>
  <!-- 신발 -->
  <path d="M14 68 Q12 72 16 73 L26 73 Q28 72 26 68Z" fill="#1a0a00"/>
  <path d="M46 68 Q48 72 44 73 L34 73 Q32 72 34 68Z" fill="#1a0a00"/>
  `;
  svgEl.innerHTML = S;
}

// 몬스터 SVG 함수들
function getMonsterSVG(id, isGray=false, isBattle=false){
  const f = isGray ? 'grayscale(1)' : 'none';
  const style = isGray ? `style="filter:grayscale(1);opacity:.5"` : '';

  // 실제 이미지가 있으면 img 태그로 반환
  // 전투 중이면 _battle, 아니면 _normal 이미지 사용
  if(MON_IMAGES){
    const battleKey = `${id}_battle`;
    const normalKey = `${id}_normal`;
    const imgKey = (isBattle && MON_IMAGES[battleKey]) ? battleKey : (MON_IMAGES[normalKey] ? normalKey : id);
    if(MON_IMAGES[imgKey]){
      const grayStyle = isGray ? 'filter:grayscale(1);opacity:.4;' : '';
      return `<img src="${MON_IMAGES[imgKey]}" style="width:100%;height:100%;object-fit:contain;${grayStyle}" />`;
    }
  }

  const svgs = {
    // Lv1 메뚜기 - 통통한 몸, 짧은 더듬이, 긴 뒷다리
    grasshopper: `<svg viewBox="0 0 120 100" ${style}>
      <defs>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff2200"/>
          <stop offset="60%" stop-color="#aa1100"/>
          <stop offset="100%" stop-color="#550000"/>
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8a9a2a"/>
          <stop offset="40%" stop-color="#6a7a18"/>
          <stop offset="100%" stop-color="#3a4a08"/>
        </linearGradient>
        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8a7a3a" stop-opacity=".7"/>
          <stop offset="100%" stop-color="#4a3a18" stop-opacity=".4"/>
        </linearGradient>
      </defs>

      <!-- 더듬이 (길고 거칠게) -->
      <path d="M38 18 Q28 8 15 2" fill="none" stroke="#8a6020" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M36 17 Q26 10 18 4" fill="none" stroke="#6a4010" stroke-width="1" stroke-linecap="round"/>
      <path d="M44 18 Q50 8 58 3" fill="none" stroke="#8a6020" stroke-width="1.5" stroke-linecap="round"/>
      <!-- 더듬이 마디 -->
      <circle cx="22" cy="6" r="1.2" fill="#7a5018"/>
      <circle cx="16" cy="3" r="1" fill="#7a5018"/>
      <circle cx="52" cy="6" r="1.2" fill="#7a5018"/>

      <!-- 날개 (반투명 그물) -->
      <path d="M55 35 Q85 28 95 42 Q90 55 70 52 Z" fill="url(#wingGrad)" stroke="#6a5a28" stroke-width=".8"/>
      <path d="M55 38 Q80 33 88 46 Q84 56 65 54 Z" fill="rgba(100,80,30,0.25)" stroke="#5a4a20" stroke-width=".5"/>
      <!-- 날개 그물 무늬 -->
      <line x1="60" y1="38" x2="80" y2="36" stroke="rgba(120,100,40,0.4)" stroke-width=".5"/>
      <line x1="63" y1="44" x2="84" y2="42" stroke="rgba(120,100,40,0.4)" stroke-width=".5"/>
      <line x1="66" y1="50" x2="86" y2="49" stroke="rgba(120,100,40,0.4)" stroke-width=".5"/>
      <line x1="68" y1="36" x2="72" y2="52" stroke="rgba(120,100,40,0.4)" stroke-width=".5"/>
      <line x1="75" y1="34" x2="78" y2="52" stroke="rgba(120,100,40,0.4)" stroke-width=".5"/>
      <line x1="82" y1="35" x2="84" y2="50" stroke="rgba(120,100,40,0.4)" stroke-width=".5"/>

      <!-- 몸통 (갑옷 외골격) -->
      <path d="M35 25 Q50 20 65 25 Q72 32 70 50 Q65 62 50 65 Q35 62 30 50 Q28 32 35 25Z"
        fill="url(#bodyGrad)" stroke="#4a5a10" stroke-width="1.5"/>
      <!-- 외골격 판 -->
      <path d="M35 30 Q50 26 65 30" fill="none" stroke="#8a9a2a" stroke-width="1"/>
      <path d="M33 38 Q50 34 67 38" fill="none" stroke="#7a8a20" stroke-width=".8"/>
      <path d="M33 46 Q50 42 67 46" fill="none" stroke="#6a7a18" stroke-width=".8"/>
      <!-- 갑옷 디테일 (가시) -->
      <path d="M38 25 L35 20 L40 24" fill="#5a6a15" stroke="#3a4a08" stroke-width=".5"/>
      <path d="M50 22 L50 17 L53 22" fill="#5a6a15" stroke="#3a4a08" stroke-width=".5"/>
      <path d="M62 25 L65 20 L60 24" fill="#5a6a15" stroke="#3a4a08" stroke-width=".5"/>
      <!-- 몸통 무늬 -->
      <ellipse cx="48" cy="45" rx="8" ry="5" fill="rgba(80,60,10,0.3)"/>
      <ellipse cx="52" cy="38" rx="5" ry="3" fill="rgba(80,60,10,0.25)"/>

      <!-- 머리 -->
      <path d="M30 28 Q38 20 50 22 Q42 18 34 22Z" fill="#7a8a22" stroke="#4a5a10" stroke-width="1"/>
      <ellipse cx="38" cy="27" rx="12" ry="10" fill="#8a9a28" stroke="#4a5a10" stroke-width="1.2"/>
      <!-- 머리 외골격 -->
      <path d="M28 28 Q38 22 50 26 Q44 20 38 20 Q30 22 28 28Z" fill="#9aaa30" opacity=".5"/>

      <!-- 복안 (크고 붉게) -->
      <ellipse cx="34" cy="26" rx="7" ry="6" fill="url(#eyeGlow)" stroke="#330000" stroke-width="1"/>
      <ellipse cx="32" cy="24" rx="3" ry="2.5" fill="#ff4400" opacity=".7"/>
      <circle cx="31" cy="23" r="1.2" fill="#ffaa00" opacity=".8"/>
      <!-- 복안 그물 패턴 -->
      <path d="M28 24 Q34 20 40 24 Q36 30 28 28Z" fill="none" stroke="rgba(255,100,0,0.3)" stroke-width=".5"/>

      <!-- 집게턱 -->
      <path d="M26 30 Q20 34 18 38 Q22 36 26 34Z" fill="#6a5018" stroke="#4a3010" stroke-width=".8"/>
      <path d="M26 32 Q19 38 17 42 Q21 39 25 36Z" fill="#5a4010" stroke="#3a2008" stroke-width=".8"/>
      <path d="M27 31 Q22 36 20 40" fill="none" stroke="#8a6020" stroke-width="1" stroke-linecap="round"/>
      <!-- 작은 부속지 -->
      <path d="M28 33 Q24 37 23 40" fill="none" stroke="#6a5018" stroke-width=".7"/>
      <path d="M29 35 Q26 38 25 41" fill="none" stroke="#6a5018" stroke-width=".7"/>

      <!-- 앞다리 (가시 돋힌) -->
      <path d="M33 38 Q20 42 12 50 Q8 56 10 62" fill="none" stroke="#7a8a20" stroke-width="2" stroke-linecap="round"/>
      <path d="M35 40 Q22 45 14 53 Q10 59 12 65" fill="none" stroke="#5a6a15" stroke-width="1" stroke-linecap="round"/>
      <!-- 가시 -->
      <line x1="22" y1="44" x2="19" y2="41" stroke="#8a7020" stroke-width="1"/>
      <line x1="18" y1="48" x2="15" y2="45" stroke="#8a7020" stroke-width="1"/>
      <!-- 발톱 -->
      <path d="M10 62 Q6 65 5 68 M10 62 Q8 66 9 70" fill="none" stroke="#6a5010" stroke-width="1.2" stroke-linecap="round"/>

      <!-- 중간다리 -->
      <path d="M38 50 Q28 55 20 62 Q16 68 18 74" fill="none" stroke="#7a8a20" stroke-width="2" stroke-linecap="round"/>
      <line x1="28" y1="57" x2="25" y2="54" stroke="#8a7020" stroke-width="1"/>
      <line x1="24" y1="61" x2="21" y2="58" stroke="#8a7020" stroke-width="1"/>
      <path d="M18 74 Q14 77 13 80 M18 74 Q16 78 17 82" fill="none" stroke="#6a5010" stroke-width="1.2" stroke-linecap="round"/>

      <!-- 뒷다리 (크고 강하게) -->
      <path d="M55 48 Q70 38 80 30 Q88 24 90 18" fill="none" stroke="#8a9a22" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M90 18 Q88 30 82 45 Q78 58 75 70" fill="none" stroke="#7a8a20" stroke-width="2.2" stroke-linecap="round"/>
      <!-- 뒷다리 가시 -->
      <line x1="76" y1="36" x2="79" y2="33" stroke="#9a8a22" stroke-width="1.2"/>
      <line x1="80" y1="30" x2="83" y2="27" stroke="#9a8a22" stroke-width="1.2"/>
      <line x1="83" y1="42" x2="86" y2="40" stroke="#9a8a22" stroke-width="1.2"/>
      <line x1="80" y1="50" x2="83" y2="48" stroke="#9a8a22" stroke-width="1.2"/>
      <line x1="78" y1="58" x2="81" y2="57" stroke="#9a8a22" stroke-width="1.2"/>
      <!-- 뒷발톱 -->
      <path d="M75 70 Q72 75 70 79 M75 70 Q77 75 76 79 M75 70 Q73 74 74 78" fill="none" stroke="#6a5a10" stroke-width="1.3" stroke-linecap="round"/>

      <!-- 오른쪽 앞다리 -->
      <path d="M62 38 Q72 42 80 50 Q84 56 82 62" fill="none" stroke="#7a8a20" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="74" y1="45" x2="77" y2="42" stroke="#8a7020" stroke-width="1"/>
      <path d="M82 62 Q85 65 87 68 M82 62 Q84 66 83 70" fill="none" stroke="#6a5010" stroke-width="1.2" stroke-linecap="round"/>

      <!-- 배 끝 가시 -->
      <path d="M48 65 Q52 72 50 78" fill="none" stroke="#5a6a15" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M52 64 Q57 70 56 76" fill="none" stroke="#4a5a10" stroke-width="1" stroke-linecap="round"/>

      <!-- 몸통 광택 -->
      <ellipse cx="44" cy="30" rx="6" ry="4" fill="rgba(200,220,100,0.12)" transform="rotate(-20 44 30)"/>
    </svg>`,

    // Lv2 방아깨비 - 길쭉한 몸, 뾰족한 머리, 매우 긴 뒷다리
    katydid: `<svg viewBox="0 0 80 90" ${style}>
      <path d="M35 5 Q37 1 40 3" fill="none" stroke="#3a6a10" stroke-width="1" stroke-linecap="round"/>
      <path d="M45 5 Q43 1 40 3" fill="none" stroke="#3a6a10" stroke-width="1" stroke-linecap="round"/>
      <polygon points="35,5 45,5 43,18 37,18" fill="#6ab42a" stroke="#3a7a0a" stroke-width="1.2"/>
      <ellipse cx="37" cy="10" rx="3" ry="2.5" fill="#1a2a00"/>
      <ellipse cx="43" cy="10" rx="3" ry="2.5" fill="#1a2a00"/>
      <rect x="37" y="18" width="6" height="28" rx="2" fill="#6ab42a" stroke="#3a7a0a" stroke-width="1.2"/>
      <ellipse cx="40" cy="62" rx="5" ry="10" fill="#7ac43a" stroke="#4a8a1a" stroke-width="1"/>
      <line x1="36" y1="38" x2="46" y2="38" stroke="#4a8a1a" stroke-width=".8" opacity=".6"/>
      <line x1="36" y1="44" x2="46" y2="44" stroke="#4a8a1a" stroke-width=".8" opacity=".6"/>
      <line x1="36" y1="24" x2="20" y2="34" stroke="#4a8a1a" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="44" y1="24" x2="60" y2="34" stroke="#4a8a1a" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="36" y1="32" x2="18" y2="42" stroke="#4a8a1a" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="44" y1="32" x2="62" y2="42" stroke="#4a8a1a" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M35 48 Q15 30 8 70" fill="none" stroke="#3a7a10" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M45 48 Q65 30 72 70" fill="none" stroke="#3a7a10" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,

    // Lv3 귀뚜라미 - 검은색, 긴 더듬이, 굵은 뒷다리
    cricket: `<svg viewBox="0 0 80 80" ${style}>
      <path d="M30 8 Q20 2 12 0" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M50 8 Q60 2 68 0" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="40" cy="20" rx="11" ry="13" fill="#2a2a2a" stroke="#111" stroke-width="1.2"/>
      <ellipse cx="33" cy="17" rx="3.5" ry="3" fill="#1a0000"/>
      <ellipse cx="47" cy="17" rx="3.5" ry="3" fill="#1a0000"/>
      <circle cx="33.8" cy="16" r="1.3" fill="#ff2020" opacity=".7"/>
      <circle cx="47.8" cy="16" r="1.3" fill="#ff2020" opacity=".7"/>
      <ellipse cx="38" cy="45" rx="10" ry="14" fill="#3a3a3a" stroke="#1a1a1a" stroke-width="1.2"/>
      <ellipse cx="42" cy="45" rx="10" ry="14" fill="#3a3a3a" stroke="#1a1a1a" stroke-width="1.2"/>
      <line x1="35" y1="35" x2="15" y2="44" stroke="#222" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="45" y1="35" x2="65" y2="44" stroke="#222" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="35" y1="42" x2="14" y2="50" stroke="#222" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="45" y1="42" x2="66" y2="50" stroke="#222" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M33 55 Q18 42 10 64" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M47 55 Q62 42 70 64" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M32 52 Q38 50 44 52" fill="none" stroke="#444" stroke-width=".8"/>
    </svg>`,

    // Lv4 장수풍뎅이 - 큰 몸, 뿔, 딱딱한 등딱지
    beetle: `<svg viewBox="0 0 80 80" ${style}>
      <path d="M38 4 Q38 -2 40 -2 Q42 -2 42 4" fill="#5a3a10" stroke="#3a2000" stroke-width="1" stroke-linecap="round"/>
      <ellipse cx="40" cy="18" rx="12" ry="10" fill="#5a3a10" stroke="#3a2000" stroke-width="1.2"/>
      <ellipse cx="33" cy="15" rx="3.5" ry="3" fill="#1a0000"/>
      <ellipse cx="47" cy="15" rx="3.5" ry="3" fill="#1a0000"/>
      <circle cx="33.8" cy="14" r="1.2" fill="#ff8020" opacity=".6"/>
      <circle cx="47.8" cy="14" r="1.2" fill="#ff8020" opacity=".6"/>
      <ellipse cx="40" cy="47" rx="16" ry="20" fill="#4a3000" stroke="#2a1800" stroke-width="1.5"/>
      <path d="M30 28 Q25 32 30 47" fill="none" stroke="#3a2000" stroke-width="1" stroke-dasharray="2,2"/>
      <path d="M50 28 Q55 32 50 47" fill="none" stroke="#3a2000" stroke-width="1" stroke-dasharray="2,2"/>
      <line x1="35" y1="32" x2="12" y2="42" stroke="#3a2000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="45" y1="32" x2="68" y2="42" stroke="#3a2000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="33" y1="42" x2="10" y2="52" stroke="#3a2000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="47" y1="42" x2="70" y2="52" stroke="#3a2000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="33" y1="55" x2="12" y2="62" stroke="#3a2000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="47" y1="55" x2="68" y2="62" stroke="#3a2000" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    // Lv5 사슴벌레 - 큰 턱집게
    stag: `<svg viewBox="0 0 80 80" ${style}>
      <path d="M30 8 Q22 4 18 8 Q16 12 22 13" fill="none" stroke="#2a1a00" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 13 Q28 11 30 14" fill="#2a1a00"/>
      <path d="M50 8 Q58 4 62 8 Q64 12 58 13" fill="none" stroke="#2a1a00" stroke-width="2" stroke-linecap="round"/>
      <path d="M58 13 Q52 11 50 14" fill="#2a1a00"/>
      <ellipse cx="40" cy="20" rx="11" ry="9" fill="#3a2a0a" stroke="#1a1000" stroke-width="1.2"/>
      <ellipse cx="33" cy="17" rx="3" ry="2.5" fill="#1a0000"/>
      <ellipse cx="47" cy="17" rx="3" ry="2.5" fill="#1a0000"/>
      <circle cx="33.8" cy="16" r="1" fill="#ff6020" opacity=".6"/>
      <circle cx="47.8" cy="16" r="1" fill="#ff6020" opacity=".6"/>
      <ellipse cx="40" cy="48" rx="15" ry="19" fill="#2a1a00" stroke="#1a0a00" stroke-width="1.5"/>
      <line x1="34" y1="38" x2="12" y2="45" stroke="#1a1000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="46" y1="38" x2="68" y2="45" stroke="#1a1000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="33" y1="47" x2="10" y2="54" stroke="#1a1000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="47" y1="47" x2="70" y2="54" stroke="#1a1000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="34" y1="58" x2="14" y2="65" stroke="#1a1000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="46" y1="58" x2="66" y2="65" stroke="#1a1000" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    // Lv6 말벌 - 노란 줄무늬, 침, 날개
    wasp: `<svg viewBox="0 0 80 80" ${style}>
      <path d="M34 5 Q32 1 30 0" fill="none" stroke="#2a2a00" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M46 5 Q48 1 50 0" fill="none" stroke="#2a2a00" stroke-width="1.2" stroke-linecap="round"/>
      <ellipse cx="40" cy="16" rx="9" ry="10" fill="#c9922a" stroke="#8a5a00" stroke-width="1.2"/>
      <ellipse cx="33" cy="13" rx="3.5" ry="3" fill="#1a0a00"/>
      <ellipse cx="47" cy="13" rx="3.5" ry="3" fill="#1a0a00"/>
      <circle cx="33.8" cy="12" r="1.2" fill="#ffaa00" opacity=".7"/>
      <circle cx="47.8" cy="12" r="1.2" fill="#ffaa00" opacity=".7"/>
      <rect x="36" y="26" width="8" height="5" rx="2" fill="#8a5a00"/>
      <ellipse cx="40" cy="45" rx="9" ry="15" fill="#c9922a" stroke="#8a5a00" stroke-width="1.2"/>
      <rect x="32" y="36" width="16" height="3" rx="1" fill="#1a1a00"/>
      <rect x="31" y="42" width="18" height="3" rx="1" fill="#1a1a00"/>
      <rect x="32" y="48" width="16" height="3" rx="1" fill="#1a1a00"/>
      <path d="M38 54 L37 62 L40 64 L43 62 L42 54Z" fill="#8a5a00"/>
      <ellipse cx="18" cy="32" rx="14" ry="7" fill="#aad4ff" opacity=".5" stroke="#8ab4dd" stroke-width=".8" transform="rotate(-15 18 32)"/>
      <ellipse cx="62" cy="32" rx="14" ry="7" fill="#aad4ff" opacity=".5" stroke="#8ab4dd" stroke-width=".8" transform="rotate(15 62 32)"/>
      <line x1="33" y1="38" x2="14" y2="50" stroke="#8a5a00" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="47" y1="38" x2="66" y2="50" stroke="#8a5a00" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="33" y1="47" x2="12" y2="56" stroke="#8a5a00" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="47" y1="47" x2="68" y2="56" stroke="#8a5a00" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,

    // Lv7 왕사마귀
    mantis: `<svg viewBox="0 0 80 100" ${style}>
      <path d="M34 8 Q28 2 22 0" fill="none" stroke="#2a5a0a" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M46 8 Q52 2 58 0" fill="none" stroke="#2a5a0a" stroke-width="1.2" stroke-linecap="round"/>
      <polygon points="30,8 50,8 42,22 38,22" fill="#6ab42a" stroke="#3a7a0a" stroke-width="1.2"/>
      <ellipse cx="32" cy="12" rx="4" ry="3.5" fill="#1a3a00"/>
      <ellipse cx="48" cy="12" rx="4" ry="3.5" fill="#1a3a00"/>
      <circle cx="33" cy="11" r="1.2" fill="#4aff20" opacity=".5"/>
      <circle cx="49" cy="11" r="1.2" fill="#4aff20" opacity=".5"/>
      <rect x="35" y="22" width="10" height="20" rx="3" fill="#5a9a1a" stroke="#3a6a0a" stroke-width="1.2"/>
      <path d="M35 26 L18 18 L12 24 L18 30 L35 32" fill="#4a8a14" stroke="#2a5a08" stroke-width="1" stroke-linejoin="round"/>
      <line x1="18" y1="22" x2="15" y2="25" stroke="#2a5a08" stroke-width=".8"/>
      <line x1="21" y1="20" x2="18" y2="23" stroke="#2a5a08" stroke-width=".8"/>
      <path d="M45 26 L62 18 L68 24 L62 30 L45 32" fill="#4a8a14" stroke="#2a5a08" stroke-width="1" stroke-linejoin="round"/>
      <line x1="62" y1="22" x2="65" y2="25" stroke="#2a5a08" stroke-width=".8"/>
      <line x1="59" y1="20" x2="62" y2="23" stroke="#2a5a08" stroke-width=".8"/>
      <ellipse cx="36" cy="56" rx="7" ry="18" fill="#5a9a1a" stroke="#3a6a0a" stroke-width="1" transform="rotate(-5 36 56)"/>
      <ellipse cx="44" cy="56" rx="7" ry="18" fill="#5a9a1a" stroke="#3a6a0a" stroke-width="1" transform="rotate(5 44 56)"/>
      <path d="M35 42 Q32 58 34 75 Q38 80 40 80 Q42 80 46 75 Q48 58 45 42Z" fill="#6ab42a" stroke="#3a7a0a" stroke-width="1.2"/>
      <line x1="35" y1="50" x2="45" y2="50" stroke="#4a8a14" stroke-width=".8" opacity=".6"/>
      <line x1="34" y1="57" x2="46" y2="57" stroke="#4a8a14" stroke-width=".8" opacity=".6"/>
      <line x1="35" y1="48" x2="15" y2="62" stroke="#4a8a14" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="15" y1="62" x2="10" y2="72" stroke="#4a8a14" stroke-width="1" stroke-linecap="round"/>
      <line x1="45" y1="48" x2="65" y2="62" stroke="#4a8a14" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="65" y1="62" x2="70" y2="72" stroke="#4a8a14" stroke-width="1" stroke-linecap="round"/>
      <line x1="36" y1="60" x2="14" y2="78" stroke="#4a8a14" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="44" y1="60" x2="66" y2="78" stroke="#4a8a14" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,

    // Lv8 독거미
    spider: `<svg viewBox="0 0 90 80" ${style}>
      <ellipse cx="45" cy="28" rx="8" ry="7" fill="#1a0a1a" stroke="#0a000a" stroke-width="1.2"/>
      <ellipse cx="41" cy="25" rx="2.5" ry="2" fill="#ff0000"/>
      <ellipse cx="49" cy="25" rx="2.5" ry="2" fill="#ff0000"/>
      <ellipse cx="37" cy="27" rx="1.5" ry="1.2" fill="#ff4040"/>
      <ellipse cx="53" cy="27" rx="1.5" ry="1.2" fill="#ff4040"/>
      <circle cx="41.8" cy="24.5" r=".8" fill="#ffaaaa"/>
      <circle cx="49.8" cy="24.5" r=".8" fill="#ffaaaa"/>
      <ellipse cx="45" cy="50" rx="12" ry="14" fill="#2a0a2a" stroke="#1a001a" stroke-width="1.5"/>
      <path d="M40 40 Q35 36 32 38" fill="none" stroke="#1a001a" stroke-width="1"/>
      <path d="M50 40 Q55 36 58 38" fill="none" stroke="#1a001a" stroke-width="1"/>
      <line x1="36" y1="42" x2="8" y2="35" stroke="#1a001a" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="48" x2="6" y2="48" stroke="#1a001a" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="54" x2="8" y2="62" stroke="#1a001a" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="60" x2="10" y2="72" stroke="#1a001a" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="54" y1="42" x2="82" y2="35" stroke="#1a001a" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="54" y1="48" x2="84" y2="48" stroke="#1a001a" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="54" y1="54" x2="82" y2="62" stroke="#1a001a" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="54" y1="60" x2="80" y2="72" stroke="#1a001a" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M40 58 L40 68 L45 72 L50 68 L50 58" fill="#2a0a2a" stroke="#1a001a" stroke-width="1"/>
    </svg>`,

    // Lv9 지네
    centipede: `<svg viewBox="0 0 90 60" ${style}>
      <ellipse cx="15" cy="30" rx="9" ry="7" fill="#8a1a00" stroke="#5a0a00" stroke-width="1.2"/>
      <ellipse cx="11" cy="27" rx="2.5" ry="2" fill="#ff2000"/>
      <ellipse cx="19" cy="27" rx="2.5" ry="2" fill="#ff2000"/>
      <path d="M8 30 Q4 28 2 32" fill="none" stroke="#5a0a00" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M22 30 Q26 28 28 32" fill="none" stroke="#5a0a00" stroke-width="1.5" stroke-linecap="round"/>
      ${[24,33,42,51,60,69,78].map((x,i)=>`
        <ellipse cx="${x}" cy="30" rx="7" ry="6" fill="${i%2===0?'#8a1a00':'#aa2a00'}" stroke="#5a0a00" stroke-width="1"/>
        <line x1="${x-4}" y1="27" x2="${x-10}" y2="${20+i%2*6}" stroke="#5a0a00" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="${x+4}" y1="27" x2="${x+10}" y2="${20+i%2*6}" stroke="#5a0a00" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="${x-4}" y1="33" x2="${x-10}" y2="${38+i%2*4}" stroke="#5a0a00" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="${x+4}" y1="33" x2="${x+10}" y2="${38+i%2*4}" stroke="#5a0a00" stroke-width="1.2" stroke-linecap="round"/>
      `).join('')}
    </svg>`,

    // Lv10 장수말벌
    giant_wasp: `<svg viewBox="0 0 80 90" ${style}>
      <path d="M32 6 Q30 2 28 0" fill="none" stroke="#5a3a00" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M48 6 Q50 2 52 0" fill="none" stroke="#5a3a00" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="40" cy="18" rx="12" ry="13" fill="#e8a020" stroke="#8a5a00" stroke-width="1.5"/>
      <ellipse cx="32" cy="14" rx="4.5" ry="4" fill="#1a0a00"/>
      <ellipse cx="48" cy="14" rx="4.5" ry="4" fill="#1a0a00"/>
      <circle cx="33" cy="13" r="1.5" fill="#ff8800" opacity=".7"/>
      <circle cx="49" cy="13" r="1.5" fill="#ff8800" opacity=".7"/>
      <rect x="36" y="31" width="8" height="6" rx="2" fill="#5a3a00"/>
      <ellipse cx="40" cy="55" rx="11" ry="20" fill="#e8a020" stroke="#8a5a00" stroke-width="1.5"/>
      <rect x="30" y="43" width="20" height="4" rx="2" fill="#1a0a00"/>
      <rect x="29" y="51" width="22" height="4" rx="2" fill="#1a0a00"/>
      <rect x="30" y="59" width="20" height="4" rx="2" fill="#1a0a00"/>
      <path d="M38 68 L37 78 L40 82 L43 78 L42 68Z" fill="#5a3a00"/>
      <ellipse cx="14" cy="38" rx="16" ry="8" fill="#aad4ff" opacity=".55" stroke="#8ab4dd" stroke-width="1" transform="rotate(-20 14 38)"/>
      <ellipse cx="66" cy="38" rx="16" ry="8" fill="#aad4ff" opacity=".55" stroke="#8ab4dd" stroke-width="1" transform="rotate(20 66 38)"/>
      <line x1="31" y1="44" x2="10" y2="56" stroke="#8a5a00" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="49" y1="44" x2="70" y2="56" stroke="#8a5a00" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="30" y1="54" x2="8" y2="64" stroke="#8a5a00" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="50" y1="54" x2="72" y2="64" stroke="#8a5a00" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`,
  };
  return svgs[id] || svgs['grasshopper'];
}

// ── 게임 데이터 ────────────────────────────────────

// 몬스터별 급소 데이터 (각 6개)
const MONSTER_VITALS = {
  grasshopper: ['겹눈',    '더듬이',     '앞가슴판',   '고막',       '뒷다리관절', '산란관'],
  katydid:     ['겹눈',    '더듬이',     '앞가슴판',   '고막',       '뒷다리근육', '날개뿌리'],
  cricket:     ['겹눈',    '촉각수염',   '고막',       '앞다리',     '날개맥',     '꼬리털'],
  beetle:      ['겹눈',    '뿔밑동',     '딱지날개연결부','앞다리관절','입틀',       '배마디'],
  stag:        ['큰턱관절','겹눈',       '딱지날개연결부','앞다리관절','더듬이',     '배마디'],
  wasp:        ['독침낭',  '겹눈',       '허리잘록',   '날개힘줄',   '더듬이',     '홑눈'],
  mantis:      ['겹눈',    '낫발관절',   '목관절',     '날개뿌리',   '더듬이',     '복부마디'],
  spider:      ['독니',    '겹눈묶음',   '실샘',       '다리관절',   '배갑연결부', '촉지'],
  centipede:   ['독발톱',  '머리판',     '첫째다리마디','복부마디연결','촉각',      '항문판'],
  giant_wasp:  ['독침낭',  '겹눈',       '허리잘록',   '날개힘줄',   '큰턱',       '촉각'],
};

const ZONES = [
  {id:'field', name:'들판', icon:'🌾', lv:'1~3',
   monsters:[
    {id:'grasshopper',name:'메뚜기',   lv:1, maxHp:56,  atk:8,  def:2,  xp:10, gold:[10,25], drop:['메뚜기껍질','메뚜기액','메뚜기뼈','메뚜기독','풀잎'], noRegen:true},
    {id:'katydid',   name:'방아깨비', lv:2, maxHp:120, atk:15, def:4,  xp:13, gold:[12,30], drop:['방아깨비껍질','방아깨비액','방아깨비뼈','방아깨비독','나뭇가지']},
    {id:'cricket',   name:'귀뚜라미', lv:3, maxHp:170, atk:18, def:5,  xp:16, gold:[15,35], drop:['귀뚜라미껍질','귀뚜라미액','귀뚜라미뼈','귀뚜라미독','철광석']},
   ]},
  {id:'forest', name:'숲속', icon:'🌲', lv:'4~6',
   monsters:[
    {id:'beetle',    name:'장수풍뎅이',lv:4, maxHp:240, atk:22, def:8,  xp:20, gold:[20,45], drop:['딱정벌레껍질','딱정벌레뿔','딱정벌레뼈','딱정벌레진액','목재']},
    {id:'stag',      name:'사슴벌레', lv:5, maxHp:320, atk:27, def:10, xp:25, gold:[25,55], drop:['사슴벌레껍질','사슴벌레집게','사슴벌레뼈','사슴벌레진액','목재']},
    {id:'wasp',      name:'말벌',     lv:6, maxHp:420, atk:35, def:14, xp:30, gold:[30,65], drop:['말벌날개','말벌독침','말벌껍질','말벌독','구리광석']},
   ]},
  {id:'deep', name:'깊은 산', icon:'⛰️', lv:'7~10',
   monsters:[
    {id:'mantis',    name:'왕사마귀', lv:7, maxHp:560, atk:45, def:20, xp:36, gold:[40,80], drop:['사마귀낫발','사마귀날개','사마귀뼈','사마귀독','수정']},
    {id:'spider',    name:'독거미',   lv:8, maxHp:720, atk:55, def:26, xp:43, gold:[50,100],drop:['거미줄','거미독액','거미뼈','거미껍질','은광석']},
    {id:'centipede', name:'지네',     lv:9, maxHp:920, atk:67, def:33, xp:52, gold:[60,120],drop:['지네독','지네껍질','지네뼈','지네촉수','은광석']},
    {id:'giant_wasp',name:'장수말벌', lv:10,maxHp:1200,atk:82, def:42, xp:62, gold:[80,150],drop:['장수말벌독','장수말벌날개','장수말벌껍질','장수말벌독침','금광석'], noRegen:true},
   ]},
];

// ── 게임 상태 ─────────────────────────────────────
const G = {
  char:{name:'',gender:'남',body:'균형',lv:1,xp:0,hp:100,mhp:100,mp:50,mmp:50,atk:10,def:5,ev:0,pen:0,luck:5,pts:0,gold:0},
  ptsPending:{mhp:0,mmp:0,atk:0,def:0,ev:0,pen:0,luck:0}, // 임시 분배
  ptsUsed:0, // 임시로 사용한 포인트 수
  skills:[
    {id:'punch',name:'정권찌르기',icon:'👊',mp:0,cd:0,maxCd:0,auto:true,lv:1,xp:0,dmgMult:1.0},
    {id:'kick', name:'발차기',   icon:'🦵',mp:5,cd:0,maxCd:8,auto:true,lv:1,xp:0,dmgMult:1.5},
  ],
  inventory:[],mats:{},equipped:{weapon:null,armor:null,accessory:null},
  equippedTools:{gather:null,logging:null,mining:null}, // 채집 도구 장착 슬롯
  berrySlots:[null,null], // 열매 빠른 슬롯 (HP/MP 각 1개)
  quests:[
    {id:'q1',title:'천손의 첫 걸음',desc:'들판의 메뚜기 5마리를 처치하라',done:false,
     obj:{type:'kill',monster:'메뚜기',val:5,cur:0},reward:{mats:{'메뚜기껍질':3,'풀잎':5}}},
    {id:'q2',title:'자연의 소리',desc:'귀뚜라미 3마리를 처치하라',done:false,
     obj:{type:'kill',monster:'귀뚜라미',val:3,cur:0},reward:{mats:{'귀뚜라미껍질':3,'철광석':2}}},
  ],
  bossCounter:{},
  bossWaiting:{},
  vitalKills:{}, // {몬스터id: 처치수} — 급소 파악용
  vitalFound:{}, // {몬스터id: [0,1,2,...]} — 파악된 급소 인덱스
  battleStats:{ // 전투 통계
    monKills:{},    // {몬스터명: 처치수}
    monDeaths:{},   // {몬스터명: 사망수}
    skillUse:{},    // {스킬명: 사용횟수}
    skillDmg:{},    // {스킬명: 총데미지}
    critCount:0,    // 크리티컬 횟수
    vitalCount:0,   // 급소 공격 횟수
    totalBattles:0, // 총 전투 횟수
    totalDmgDealt:0,// 총 가한 데미지
    totalDmgTaken:0,// 총 받은 데미지
  },
  gatherStats:{  // 채집 통계
    itemCount:{},  // {채집물명: 총획득량}
    totalGather:0, // 총 채집 횟수
    toolUse:{},    // {도구명: 사용횟수}
  },
  craftStats:{   // 제작 통계
    craftCount:{}, // {제작물명: 제작횟수}
    totalCraft:0,  // 총 제작 횟수
    matUsed:{},    // {재료명: 총소모량}
  }, // {zid: true} 보스 대기 중 여부
  zoneMonsters:{},
  curZone:null, curMonType:null,
  lastHuntZone: null,    // 마지막 사냥 구역 {zone, monType}
  lastGatherZone: null,  // 마지막 채집 구역
  gather:{active:false, zoneId:null, itemId:null, startTime:0, duration:0},
  gatherSkills:{ gather:{lv:1,xp:0}, logging:{lv:1,xp:0}, mining:{lv:1,xp:0} },
  gatherPointState:{}, // {pointId: {status:'ready'|'regen', endTime}}
  curGatherZone: null, // 현재 선택된 채집터
  buildings: {}, // {buildId: {lv, storage, lastCollect}}
  gotStarterTools: false,
  tools: {},
  bagSize: 30, // 가방 최대 칸수 (6칸씩 확장)
  tutorialDone: false,
  tutorialStep: 0,     // 튜토리얼 진행 단계 저장
  history: [],
};

// ── 채집 데이터 ────────────────────────────────────


// ────── 02_svg.js ──────
