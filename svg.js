// ── 천손비사 SVG 렌더링 모듈 (svg.js) ──────────────────
// cheonson.html에서 분리됨

// ────── 02_svg.js ──────
// ═══════════════════════════════════════
// 02_svg
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 02_svg
// ═══════════════════════════════════════

// ── 채집터 데이터 ──────────────────────────────────
const GATHER_ZONES = [
  {id:'meadow',   name:'들판 채집터', icon:'🌾', bg:'field'},
  {id:'forest',   name:'숲속 채집터', icon:'🌲', bg:'forest'},
  {id:'mountain', name:'깊은산 채집터',icon:'⛰', bg:'deep'},
  {id:'mine',     name:'광산 채집터', icon:'⛏️', bg:'mine'},
];

const GATHER_POINTS = {
  meadow: [
    {id:'gp_쑥',    name:'쑥',    icon:'🌱', skill:'gather', time:5, pos:{x:14,y:72}, skillLvMin:1, noRegen:true, hiddenIcon:true},
    {id:'gp_감초',  name:'감초',  icon:'🌿', skill:'gather', time:5, pos:{x:72,y:40}, skillLvMin:1, noRegen:true, hiddenIcon:true},
    {id:'gp_돌광석',name:'돌광석',icon:'🪨', skill:'mining', time:5, pos:{x:55,y:75}, skillLvMin:1, noRegen:true, resultName:'돌조각', iconH:'190px'},
  ],
  forest: [
    {id:'gf_나뭇가지', name:'나뭇가지', icon:'🪵', skill:'logging', time:5, pos:{x:20,y:65}, skillLvMin:1, noRegen:true},
    {id:'gf_소나무',   name:'소나무',   icon:'🌲', skill:'logging', time:5, pos:{x:45,y:55}, skillLvMin:1, noRegen:true},
  ],
  mountain: [
    {id:'gm_약초',  name:'약초',  icon:'🌿', skill:'gather', time:5, pos:{x:20,y:65}, skillLvMin:1, noRegen:true},
    {id:'gm_더덕',  name:'더덕',  icon:'🌱', skill:'gather', time:5, pos:{x:45,y:55}, skillLvMin:1, noRegen:true},
  ],
  mine: [
    {id:'mn_철광석', name:'철광석', icon:'⚙️', skill:'mining', time:5, pos:{x:30,y:50}, skillLvMin:1, noRegen:true},
    {id:'mn_석탄',   name:'석탄',   icon:'🖤', skill:'mining', time:5, pos:{x:55,y:45}, skillLvMin:1, noRegen:true},
  ],
};

// 열매 효과 데이터
const BERRY_EFFECTS = {
  '붉은열매':   {type:'hp', val:100,  desc:'HP +100 회복'},
  '청열매':     {type:'mp', val:50,   desc:'MP +50 회복'},
  '산딸기':     {type:'hp', val:200,  desc:'HP +200 회복'},
  '오디':       {type:'mp', val:100,  desc:'MP +100 회복'},
  '영험한열매': {type:'hp', pct:0.20, desc:'HP 20% 회복'},
  '신령열매':   {type:'mp', pct:0.20, desc:'MP 20% 회복'},
};

function getGatherQty(proficiency, lv, ptLvMin){
  // 새 시스템: 숙련도 50 이상이면 2개, 아니면 1개
  // proficiency = 현재 레벨 내 채집 횟수 (0~99)
  return proficiency >= 50 ? 2 : 1;
}

// 채집 스킬 레벨업 체크 (100회 = 레벨업)
function checkGatherLevelUp(skill){
  const sk = G.gatherSkills[skill];
  if(!sk) return;
  if(sk.xp >= 100){
    sk.xp -= 100;
    sk.lv = (sk.lv||1) + 1;
    toast(`🎉 ${skill==='gather'?'채집':skill==='logging'?'벌목':'채광'} 스킬 Lv${sk.lv}!`);
    addHistory('레벨업', `${skill==='gather'?'채집':skill==='logging'?'벌목':'채광'} 스킬이 Lv${sk.lv}이 되었다.`);
    // HUD 업데이트
    updateGatherHUD && updateGatherHUD();
  }
}

// (구 GATHER_DATA 호환용 더미)
const GATHER_DATA = {
  field: {
    name:'들판', icon:'🌾',
    items:[
      {id:'풀잎',    name:'풀잎',    icon:'🌿', time:5,  qty:[1,3], desc:'들판 곳곳에 자라는 풀잎'},
      {id:'야생화',  name:'야생화',  icon:'🌸', time:8,  qty:[1,2], desc:'들판에 피어있는 야생화'},
      {id:'버섯',    name:'버섯',    icon:'🍄', time:12, qty:[1,2], desc:'풀밭 그늘에서 자라는 버섯'},
      {id:'약초',    name:'약초',    icon:'🌱', time:20, qty:[1,2], desc:'생명력이 깃든 귀한 약초'},
      {id:'돌조각',  name:'돌조각',  icon:'🪨', time:10, qty:[2,4], desc:'들판에 굴러다니는 돌조각'},
    ]
  },
  forest: {
    name:'숲속', icon:'🌲',
    items:[
      {id:'나뭇가지',name:'나뭇가지',icon:'🪵', time:8,  qty:[2,4], desc:'숲속에서 주운 나뭇가지'},
      {id:'목재',    name:'목재',    icon:'🪵', time:20, qty:[1,2], desc:'단단한 목재'},
      {id:'수액',    name:'수액',    icon:'💧', time:15, qty:[1,2], desc:'나무에서 흘러나오는 수액'},
      {id:'철광석',  name:'철광석',  icon:'⚙', time:25, qty:[1,2], desc:'숲속 바위에서 캐낸 철광석'},
      {id:'버섯',    name:'버섯',    icon:'🍄', time:10, qty:[2,3], desc:'숲 바닥에 자라는 버섯'},
    ]
  },
  deep: {
    name:'깊은산', icon:'⛰',
    items:[
      {id:'수정',    name:'수정',    icon:'💎', time:30, qty:[1,2], desc:'깊은산 동굴의 수정'},
      {id:'은광석',  name:'은광석',  icon:'🪙', time:25, qty:[1,2], desc:'빛나는 은광석'},
      {id:'금광석',  name:'금광석',  icon:'✨', time:40, qty:[1,1], desc:'희귀한 금광석'},
      {id:'영지버섯',name:'영지버섯',icon:'🍄', time:35, qty:[1,2], desc:'깊은산 영지버섯'},
      {id:'구리광석',name:'구리광석',icon:'🔶', time:15, qty:[2,3], desc:'구리광석'},
    ]
  }
};

// ── 화면 크기 ─────────────────────────────────────
function selectSize(mode){
  document.getElementById('size-select').style.display='none';
  if(mode==='full') document.documentElement.requestFullscreen?.();
  initGame();
}

// ── 캐릭터 생성 ────────────────────────────────────


// ────── 03_core.js ──────
