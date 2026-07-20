// ── 천손비사 열매/슬롯 모듈 (berry.js) ──────────────────
// cheonson.html에서 분리됨

// ═══════════════════════════════════════
// 10_berry
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 10_berry
// ═══════════════════════════════════════

function useConsumable(recipeId){
  const r = ALL_CRAFT_RECIPES.find(x=>x.id===recipeId);
  if(!r||!r.consume) return;
  if((G.mats[r.result]||0)<=0){ toast('보유 아이템 없음!'); return; }
  G.mats[r.result]--;
  if(G.mats[r.result]<=0) delete G.mats[r.result];
  const c = G.char;
  if(r.consume.hp>=1) c.hp=c.mhp;
  else if(r.consume.hp) c.hp=Math.min(c.mhp, c.hp+Math.floor(c.mhp*r.consume.hp));
  if(r.consume.mp>=1) c.mp=c.mmp;
  else if(r.consume.mp) c.mp=Math.min(c.mmp, c.mp+Math.floor(c.mmp*r.consume.mp));
  toast(`${r.resultIcon} ${r.result} 사용! ${r.desc}`);
  updateHUD(); renderMats(); renderCraftList(); saveGame();
}

const BUILDINGS = [
  {
    id:'warehouse', name:'창고', icon:'🏚️', unlockLv:1,
    cost:[1000], // Lv별 건설/업그레이드 비용 (Lv0→1, 1→2, ...)
    upgradeCost:(lv)=>Math.round(1000*Math.pow(1.8,lv)),
    maxLv:10,
    desc:'재료 보관 종류 확대',
    produce: null, // 생산 없음
    effect:(lv)=>`재료 ${lv*10}종류 보관`,
  },
  {
    id:'logging_camp', name:'벌목장', icon:'🌲', unlockLv:5,
    cost:[8000],
    upgradeCost:(lv)=>Math.round(8000*Math.pow(1.8,lv)),
    maxLv:10,
    desc:'나무 자동 생산',
    produce:{
      1:'나뭇가지', 2:'나뭇가지', 3:'목재', 4:'목재', 5:'대나무',
      6:'대나무',   7:'느티나무목재', 8:'오동나무목재', 9:'박달나무목재', 10:'천년송목재'
    },
    effect:(lv)=>`${['나뭇가지','나뭇가지','목재','목재','대나무','대나무','느티나무목재','오동나무목재','박달나무목재','천년송목재'][lv-1]} ${lv}개/분`,
  },
  {
    id:'mine', name:'광산', icon:'⛏️', unlockLv:10,
    cost:[40000],
    upgradeCost:(lv)=>Math.round(40000*Math.pow(1.8,lv)),
    maxLv:10,
    desc:'광석 자동 생산',
    produce:{
      1:'철광석', 2:'철광석', 3:'구리광석', 4:'구리광석', 5:'은광석',
      6:'은광석',  7:'수정',   8:'금광석',   9:'미스릴원석', 10:'천강석'
    },
    effect:(lv)=>`${['철광석','철광석','구리광석','구리광석','은광석','은광석','수정','금광석','미스릴원석','천강석'][lv-1]} ${lv}개/분`,
  },
  {
    id:'orchard', name:'과수원', icon:'🍎', unlockLv:15,
    cost:[150000],
    upgradeCost:(lv)=>Math.round(150000*Math.pow(1.8,lv)),
    maxLv:10,
    desc:'과일 자동 생산',
    produce:{
      1:'산딸기', 2:'산딸기', 3:'사과', 4:'사과', 5:'오미자',
      6:'오미자',  7:'복분자', 8:'산수유', 9:'구기자', 10:'천도복숭아'
    },
    effect:(lv)=>`${['산딸기','산딸기','사과','사과','오미자','오미자','복분자','산수유','구기자','천도복숭아'][lv-1]} ${lv}개/분`,
  },
  {
    id:'herb_garden', name:'약초밭', icon:'🌿', unlockLv:20,
    cost:[250000],
    upgradeCost:(lv)=>Math.round(250000*Math.pow(1.8,lv)),
    maxLv:10,
    desc:'약초 자동 생산',
    produce:{
      1:'쑥', 2:'쑥', 3:'질경이', 4:'도라지', 5:'당귀',
      6:'천궁', 7:'하수오', 8:'인삼', 9:'산삼', 10:'만년초'
    },
    effect:(lv)=>`${['쑥','쑥','질경이','도라지','당귀','천궁','하수오','인삼','산삼','만년초'][lv-1]} ${lv}개/분`,
  },
  {
    id:'fishing_spot', name:'낚시터', icon:'🎣', unlockLv:25,
    cost:[600000],
    upgradeCost:(lv)=>Math.round(600000*Math.pow(1.8,lv)),
    maxLv:10,
    desc:'물고기 자동 생산',
    produce:{
      1:'피라미', 2:'피라미', 3:'붕어', 4:'붕어', 5:'쏘가리',
      6:'쏘가리',  7:'잉어', 8:'황쏘가리', 9:'용의수염', 10:'해룡'
    },
    effect:(lv)=>`${['피라미','피라미','붕어','붕어','쏘가리','쏘가리','잉어','황쏘가리','용의수염','해룡'][lv-1]} ${lv}개/분`,
  },
  {
    id:'farm', name:'농장', icon:'🌾', unlockLv:30,
    cost:[1500000],
    upgradeCost:(lv)=>Math.round(1500000*Math.pow(1.8,lv)),
    maxLv:10,
    desc:'곡식·채소 자동 생산',
    produce:{
      1:'조', 2:'쌀', 3:'보리', 4:'콩', 5:'팥',
      6:'수수', 7:'기장', 8:'메밀', 9:'녹두', 10:'오곡정수'
    },
    effect:(lv)=>`${['조','쌀','보리','콩','팥','수수','기장','메밀','녹두','오곡정수'][lv-1]} ${lv}개/분`,
  },
];

// 창고 용량 (3시간 = 180분 분량)
function getBuildingStorage(lv){ return lv * 180; }

// 오프라인 자동 생산 계산
function calcOfflineProduction(){
  const now = Date.now();
  BUILDINGS.forEach(bd=>{
    if(!bd.produce) return;
    const b = G.buildings[bd.id];
    if(!b || b.lv < 1) return;
    const lastCollect = b.lastCollect || now;
    const elapsedMin = (now - lastCollect) / 60000;
    const maxStorage = getBuildingStorage(b.lv);
    const produced = Math.min(Math.floor(elapsedMin * b.lv), maxStorage - (b.storage||0));
    if(produced > 0){
      b.storage = (b.storage||0) + produced;
    }
    b.lastCollect = now;
  });
}

// 건물 탭 렌더링
function renderBuildings(){
  const c = G.char;
  const el = document.getElementById('build-list');
  const goldEl = document.getElementById('build-gold');
  if(goldEl) goldEl.textContent = c.gold.toLocaleString();
  if(!el) return;

  // 오프라인 생산 먼저 계산
  calcOfflineProduction();

  el.innerHTML = BUILDINGS.map(bd=>{
    const b = G.buildings[bd.id] || {lv:0, storage:0, lastCollect:Date.now()};
    const owned = b.lv > 0;
    const unlocked = c.lv >= bd.unlockLv;
    const isMaxLv = b.lv >= bd.maxLv;

    // 잠금 상태
    if(!unlocked) return `
      <div style="display:flex;align-items:center;gap:.7rem;padding:.6rem;border-bottom:1px solid var(--border);opacity:.4">
        <span style="font-size:1.8rem">${bd.icon}</span>
        <div style="flex:1">
          <div style="font-size:.8rem;font-weight:600;color:var(--text)">${bd.name} <span style="font-size:.65rem;color:#e74c3c">🔒 Lv${bd.unlockLv} 해금</span></div>
          <div style="font-size:.63rem;color:var(--text3)">${bd.desc}</div>
        </div>
      </div>`;

    const buildCost = owned ? bd.upgradeCost(b.lv) : bd.cost[0];
    const canAfford = c.gold >= buildCost;
    const storageAmt = b.storage || 0;
    const maxStor = owned ? getBuildingStorage(b.lv) : 0;

    return `
      <div style="padding:.65rem;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:.7rem;margin-bottom:${owned?'.45rem':'0'}">
          <span style="font-size:1.8rem">${bd.icon}</span>
          <div style="flex:1">
            <div style="font-size:.82rem;font-weight:600;color:var(--text)">${bd.name}
              ${owned?`<span style="font-size:.65rem;color:var(--text3);margin-left:.3rem">Lv${b.lv}${isMaxLv?' (최대)':''}</span>`:''}
            </div>
            <div style="font-size:.63rem;color:var(--text3)">${owned ? bd.effect(b.lv) : bd.desc}</div>
          </div>
          ${!owned ? `
            <button class="btn" style="font-size:.65rem;padding:.28rem .6rem;${canAfford?'':'opacity:.5;cursor:not-allowed'}"
              ${canAfford?`onclick="buildBuilding('${bd.id}')"`:'disabled'}>
              건설<br><span style="font-size:.58rem">${bd.cost[0].toLocaleString()}냥</span>
            </button>` : ''}
          ${owned && !isMaxLv ? `
            <button class="btn" style="font-size:.65rem;padding:.28rem .6rem;${canAfford?'':'opacity:.5;cursor:not-allowed'}"
              ${canAfford?`onclick="upgradeBuilding('${bd.id}')"`:'disabled'}>
              업그레이드<br><span style="font-size:.58rem">${buildCost.toLocaleString()}냥</span>
            </button>` : ''}
          ${isMaxLv ? `<span style="font-size:.65rem;color:var(--gold2);padding:.3rem">최대 Lv</span>` : ''}
        </div>
        ${owned && bd.produce ? `
          <div style="background:var(--bg3);border-radius:4px;padding:.4rem .5rem">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.3rem">
              <span style="font-size:.65rem;color:var(--text3)">보관창고: ${storageAmt}/${maxStor}개</span>
              ${storageAmt>0?`<button class="btn" style="font-size:.6rem;padding:.2rem .5rem;background:rgba(30,80,30,.8);border-color:#2a8a3a" onclick="collectBuilding('${bd.id}')">📦 수거 (${storageAmt}개)</button>`:'<span style="font-size:.6rem;color:var(--text3)">생산 중...</span>'}
            </div>
            <div style="background:var(--bg2);border-radius:2px;height:6px;overflow:hidden">
              <div style="height:100%;width:${Math.min(100,storageAmt/maxStor*100)}%;background:${storageAmt>=maxStor?'#e74c3c':'#2a8a3a'};transition:width .3s"></div>
            </div>
            ${storageAmt>=maxStor?'<div style="font-size:.58rem;color:#e74c3c;margin-top:2px">⚠️ 창고 가득! 수거하지 않으면 생산 중단</div>':''}
          </div>` : ''}
      </div>`;
  }).join('');
}

function buildBuilding(id){
  const bd = BUILDINGS.find(b=>b.id===id);
  if(!bd) return;
  const cost = bd.cost[0];
  if(G.char.gold < cost){ toast('냥이 부족합니다!'); return; }
  G.char.gold -= cost;
  G.buildings[id] = { lv:1, storage:0, lastCollect:Date.now() };
  toast(`🏗️ ${bd.name} 건설 완료!`);
  renderBuildings();
  updateHUD(); saveGame();
}

function upgradeBuilding(id){
  const bd = BUILDINGS.find(b=>b.id===id);
  if(!bd) return;
  const b = G.buildings[id];
  if(!b) return;
  if(b.lv >= bd.maxLv){ toast('최대 레벨입니다!'); return; }
  const cost = bd.upgradeCost(b.lv);
  if(G.char.gold < cost){ toast('냥이 부족합니다!'); return; }
  G.char.gold -= cost;
  b.lv++;
  toast(`⬆️ ${bd.name} Lv${b.lv} 업그레이드!`);
  renderBuildings();
  updateHUD(); saveGame();
}

function collectBuilding(id){
  const bd = BUILDINGS.find(b=>b.id===id);
  if(!bd || !bd.produce) return;
  const b = G.buildings[id];
  if(!b || (b.storage||0) <= 0){ toast('수거할 재료가 없습니다!'); return; }
  const matName = bd.produce[b.lv];
  const qty = b.storage;
  G.mats[matName] = (G.mats[matName]||0) + qty;
  b.storage = 0;
  toast(`📦 ${matName} ×${qty} 수거!`);
  renderBuildings();
  renderMats(); saveGame();
}

function showGatherAlert(title, msg){
  document.getElementById('gather-alert-title').textContent = title;
  document.getElementById('gather-alert-msg').textContent = msg;
  document.getElementById('gather-alert').style.display = 'flex';
}
function closeGatherAlert(){
  document.getElementById('gather-alert').style.display = 'none';
}

// ── 마을 시스템 ───────────────────────────────────


// ── 마을/건물 → village.js로 분리됨 ──
