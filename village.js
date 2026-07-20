// ── 천손비사 마을/건물 모듈 (village.js) ──────────────────
// cheonson.html에서 분리됨

// ────── 11_village.js ──────
// ═══════════════════════════════════════
// 11_village
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 11_village
// ═══════════════════════════════════════

const CRAFT_SKILLS = [
  {id:'smelt',    name:'제련',     icon:'🔥', price:800,  desc:'광석 → 금속괴 제련',
   require:{charLv:3, gatherSkill:{mining:3}},   requireDesc:'캐릭터 Lv3 + 채광 Lv3'},
  {id:'woodwork', name:'목공',     icon:'🪵', price:1200, desc:'칼자루·칼집 제작',
   require:{charLv:3, gatherSkill:{logging:3}},  requireDesc:'캐릭터 Lv3 + 벌목 Lv3'},
  {id:'weapon',   name:'무기제작', icon:'⚔', price:2000, desc:'무기 제작',
   require:{charLv:5, craftSkills:['smelt','woodwork']}, requireDesc:'캐릭터 Lv5 + 제련+목공 습득'},
  {id:'armor',    name:'방어구',   icon:'🛡', price:3500, desc:'방어구 제작',
   require:{charLv:7, craftSkills:['smelt']},    requireDesc:'캐릭터 Lv7 + 제련 습득'},
  {id:'access',   name:'악세사리', icon:'💍', price:5000, desc:'반지·목걸이·부적 제작',
   require:{charLv:9, craftSkills:['smelt']},    requireDesc:'캐릭터 Lv9 + 제련 습득'},
  {id:'alchemi',  name:'연금술',   icon:'⚗️', price:8000, desc:'회복단·내공단 등 제작',
   require:{charLv:11, gatherSkill:{gather:5}},  requireDesc:'캐릭터 Lv11 + 채집 Lv5'},
];

// 대장간 탭 전환
// 마을 건물 패널 열기/닫기
function openBuildingPanel(building){
  const panel = document.getElementById('building-panel');
  if(!panel) return;
  // 모든 패널 숨기기
  ['forge','herb','mudogwan','shindansu','mudang','joomak','magukan'].forEach(b=>{
    const el = document.getElementById('panel-'+b);
    if(el) el.style.display='none';
  });
  // 선택한 건물 패널 보이기
  const target = document.getElementById('panel-'+building);
  if(target) target.style.display='block';
  panel.style.display='block';

  // 대장간 열릴 때 렌더링
  if(building==='forge'){
    renderForgeRepair();
    renderCraftList();
  }
  // 튜토리얼 트리거
  if(!G.tutorialDone){
    if(building==='forge'){
      tutorialTrigger('forge');
      document.getElementById('forge-arrow').style.display='none';
      document.getElementById('forge-arrow-label').style.display='none';
      document.querySelectorAll('.village-btn').forEach(b=>b.style.animation='');
    }
    if(building==='shindansu'){
      const result = tutorialTrigger('shindansu_return') || tutorialTrigger('ssuk_done') || tutorialTrigger('logging_done') || tutorialTrigger('mining_done');
      hideShindansuArrow();
    }
  }
  // 약초방 열릴 때 마을 관련 렌더
  if(building==='herb'){
    renderVillageLifeSkill && renderVillageLifeSkill();
    renderVillageSellList && renderVillageSellList();
  }
  // 무도관 열릴 때 무공 목록 렌더
  if(building==='mudogwan'){
    renderVillageSkillList && renderVillageSkillList();
  }
  // 신단수 열릴 때 역사 렌더
  if(building==='shindansu'){
    renderShindansu && renderShindansu();
  }
  // 대장간 열릴 때 보유 냥 업데이트
  const vg = document.getElementById('village-gold');
  if(vg) vg.textContent = G.gold;
}

function closeBuildingPanel(){
  const panel = document.getElementById('building-panel');
  if(panel) panel.style.display='none';
}

function showForgPanel(tab){
  const panel = document.getElementById('forge-content-panel');
  const title = document.getElementById('forge-panel-title');
  const craft = document.getElementById('forge-craft-content');
  const repair = document.getElementById('forge-repair-content');
  const bg = document.getElementById('forge-bg');
  // 배경 forge_work로 교체
  if(bg) bg.style.backgroundImage = "url('images/bg/forge_work.jpg')";
  panel.style.display = 'block';
  if(tab === 'craft'){
    title.textContent = '⚒️ 제작';
    craft.style.display = 'block';
    repair.style.display = 'none';
    renderCraftList();
  } else {
    title.textContent = '🔧 수리';
    craft.style.display = 'none';
    repair.style.display = 'block';
    renderForgeRepair();
  }
}

function showForge(tab){
  if(tab==='repair') renderForgeRepair();
  if(tab==='craft')  renderCraftList();
}

// 수리 패널 — 가방에서 도구 목록 표시
function renderForgeRepair(){
  const el = document.getElementById('forge-repair-inv');
  if(!el) return;
  const tools = G.inventory.filter(i=>i&&i.type==='tool');
  if(!tools.length){
    el.innerHTML='<div style="color:var(--text3);font-size:.75rem">가방에 도구가 없습니다</div>';
    return;
  }
  el.innerHTML = tools.map((item, i)=>{
    const realIdx = G.inventory.indexOf(item);
    const durPct = Math.round((item.dur||0)/(item.maxDur||1)*100);
    const durColor = durPct>50?'#2a8a3a':durPct>25?'#c9922a':'#c0392b';
    const repairCost = (item.maxDur||0)-(item.dur||0);
    const canRepair = item.repairable === true && repairCost > 0;
    const fullDur = (item.dur||0) >= (item.maxDur||0);
    return `
    <div style="display:flex;align-items:center;gap:.5rem;padding:.45rem .2rem;border-bottom:1px solid var(--border)">
      ${item.icon && item.icon.startsWith('images/')
        ? `<img src="${item.icon}" style="width:1.3rem;height:1.3rem;object-fit:contain" draggable="false">`
        : `<span style="font-size:1.3rem">${item.icon||'🔧'}</span>`}
      <div style="flex:1">
        <div style="font-size:.78rem;font-weight:600;color:var(--text)">${item.name}
          ${item.repairable===false?`<span style="font-size:.58rem;color:#e74c3c;margin-left:.3rem">수리불가</span>`:''}
          ${item.dur<=0?`<span style="font-size:.58rem;color:#e74c3c;margin-left:.3rem">💥파손</span>`:''}
        </div>
        <div style="display:flex;align-items:center;gap:.4rem;margin-top:3px">
          <div style="flex:1;background:var(--bg2);border-radius:2px;height:4px;overflow:hidden">
            <div style="height:100%;width:${durPct}%;background:${durColor}"></div>
          </div>
          <span style="font-size:.6rem;color:var(--text3)">${item.dur}/${item.maxDur}</span>
        </div>
      </div>
      ${fullDur ? `<span style="font-size:.62rem;color:#6abf4a">최대</span>` :
        canRepair ? `<button class="btn" style="font-size:.62rem;padding:.25rem .5rem;background:rgba(30,60,30,.8);border-color:#2a8a3a;${G.char.gold<repairCost?'opacity:.5':''}"
          ${G.char.gold>=repairCost?`onclick="repairToolForge(${realIdx})"`:'disabled'}>
          🔧 ${repairCost}냥
        </button>` :
        `<span style="font-size:.62rem;color:var(--text3)">수리불가</span>`
      }
    </div>`;
  }).join('');
}

// 대장간 수리
function repairToolForge(invIdx){
  const item = G.inventory[invIdx];
  if(!item||item.type!=='tool'){return;}
  if(item.repairable===false){toast('이 도구는 수리할 수 없습니다!');return;}
  if((item.dur||0)>=(item.maxDur||0)){toast('이미 최대 내구도입니다!');return;}
  const cost = (item.maxDur||0)-(item.dur||0);
  if(G.char.gold<cost){toast(`수리비 부족! (${cost}냥 필요)`);return;}
  G.char.gold -= cost;
  item.dur = item.maxDur;
  // 최대 내구도 영구 감소
  const dec   = Math.ceil((item.initMaxDur||item.maxDur)*0.05);
  const floor = Math.ceil((item.initMaxDur||item.maxDur)*0.10);
  item.maxDur = Math.max(floor, item.maxDur - dec);
  item.repairCount = (item.repairCount||0)+1;
  toast(`🔧 ${item.name} 수리 완료! (-${cost}냥)`);
  renderInv(); renderForgeRepair(); updateHUD(); saveGame();
}

function renderVillage(){
  const c = G.char;
  const goldEl = document.getElementById('village-gold');
  if(goldEl) goldEl.textContent = c.gold.toLocaleString();

  // 현재 열려있는 탭 확인 후 없으면 기본 구매 탭 열기
  const craftPanel = document.getElementById('forge-craft');
  const repairPanel = document.getElementById('forge-repair');
  const buyPanel = document.getElementById('forge-buy');
  const craftOpen = craftPanel && craftPanel.style.display === 'block';
  const repairOpen = repairPanel && repairPanel.style.display === 'block';

  if(!craftOpen && !repairOpen){
    showForge('buy');
  } else if(craftOpen){
    showForge('craft');
  } else if(repairOpen){
    showForge('repair');
  }

  // ── 대장간: 제작 스킬 ──
  const csEl = document.getElementById('village-craft-skill-list-learn');
  if(csEl){
    csEl.innerHTML = CRAFT_SKILLS.map(cs=>{
      const owned = G.craftSkills && G.craftSkills[cs.id];
      const {ok, msg} = checkCraftRequire(cs);
      const canBuy = !owned && ok && c.gold >= cs.price;
      return `
      <div style="display:flex;align-items:center;gap:.5rem;padding:.4rem .2rem;border-bottom:1px solid var(--border);opacity:${ok?1:0.5}">
        <span style="font-size:1.2rem">${cs.icon}</span>
        <div style="flex:1">
          <div style="font-size:.75rem;font-weight:600;color:var(--text)">${cs.name}
            ${owned?`<span style="font-size:.63rem;color:#6abf4a;margin-left:.3rem">✅습득</span>`:''}
          </div>
          <div style="font-size:.7rem;font-weight:600;color:var(--text3)">${cs.desc}</div>
          <div style="font-size:.72rem;color:${ok?'#6abf4a':'#e74c3c'};margin-top:2px;font-weight:600">
            ${ok ? '✅ 조건 충족' : `🔒 ${msg}`}
            &nbsp;|&nbsp; ${cs.requireDesc}
          </div>
        </div>
        ${!owned?`<button class="btn" style="font-size:.6rem;padding:.22rem .5rem;${canBuy?'':'opacity:.5;cursor:not-allowed'}"
          ${canBuy?`onclick="buyCraftSkill('${cs.id}')"`:'disabled'}>
          ${cs.price}냥
        </button>`:`<span style="font-size:.65rem;color:#6abf4a">습득완료</span>`}
      </div>`;
    }).join('');
  }

  // ── 무관: 무공 구매 ──
  const skEl = document.getElementById('village-skill-list');
  if(skEl){
    const owned = new Set(G.skills.map(s=>s.id));
    skEl.innerHTML = SKILL_SHOP.map(sk=>{
      const have = owned.has(sk.id);
      const lvOk = c.lv >= sk.unlockLv;
      const canBuy = !have && lvOk && c.gold >= sk.price;
      return `
      <div style="display:flex;align-items:center;gap:.5rem;padding:.45rem .2rem;border-bottom:1px solid var(--border);opacity:${lvOk?1:0.45}">
        <span style="font-size:1.2rem">${sk.icon}</span>
        <div style="flex:1">
          <div style="font-size:.72rem;font-weight:600;color:var(--text)">${sk.name}
            ${have?`<span style="font-size:.63rem;color:#6abf4a;margin-left:.3rem">✅보유</span>`:''}
            ${!lvOk?`<span style="font-size:.63rem;color:#e74c3c;margin-left:.3rem">🔒Lv${sk.unlockLv}</span>`:''}
          </div>
          <div style="font-size:.7rem;font-weight:600;color:var(--text3)">${sk.desc} · MP${sk.mp} · 쿨${sk.maxCd}초</div>
        </div>
        ${!have?`<button class="btn" style="font-size:.6rem;padding:.22rem .5rem;${canBuy?'':'opacity:.5;cursor:not-allowed'}"
          ${canBuy?`onclick="buySkillVillage('${sk.id}')"`:'disabled'}>
          ${sk.price.toLocaleString()}냥
        </button>`:`<span style="font-size:.65rem;color:#6abf4a">보유중</span>`}
      </div>`;
    }).join('');

    // 고급 무공 안내
    skEl.innerHTML += `
      <div style="padding:.5rem;background:rgba(30,20,5,.5);border-radius:4px;margin-top:.4rem;font-size:.65rem;color:var(--text3)">
        📖 <b style="color:var(--gold2)">고급 무공 비급</b>은 보스 몬스터 처치 시 드롭됩니다.<br>
        비급을 인벤토리에서 사용하면 무공을 습득할 수 있습니다.
      </div>`;
  }

  renderLifeSkillShop();
  renderCraftList();

  // ── 잡화점: 재료 판매 ──
  const sellEl = document.getElementById('village-sell-list');
  if(sellEl){
    const mats = Object.entries(G.mats).filter(([n,v])=>v>0).sort((a,b)=>a[0].localeCompare(b[0],'ko'));
    if(!mats.length){
      sellEl.innerHTML='<div style="color:var(--text3);font-size:.75rem;padding:.3rem">판매할 재료가 없습니다</div>';
    } else {
      const totalGold = mats.reduce((s,[n,v])=>s+(SELL_PRICES[n]||3)*v,0);
      sellEl.innerHTML = mats.map(([name,qty])=>{
        const price = SELL_PRICES[name]||3;
        return `
        <div style="display:flex;align-items:center;gap:.4rem;padding:.28rem .2rem;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:.72rem;color:var(--text)">${name} <span style="color:var(--text3)">×${qty}</span></span>
          <span style="font-size:.62rem;color:var(--gold2)">${(price*qty).toLocaleString()}냥</span>
          <button class="btn" style="font-size:.57rem;padding:.15rem .35rem" onclick="sellMatVillage('${name}',1)">1개</button>
          <button class="btn" style="font-size:.57rem;padding:.15rem .35rem" onclick="sellMatVillage('${name}',10)">10개</button>
          <button class="btn" style="font-size:.57rem;padding:.15rem .35rem;background:rgba(80,20,20,.7)" onclick="sellMatVillage('${name}',${qty})">전부</button>
        </div>`;
      }).join('');
      sellEl.innerHTML += `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.5rem">
          <span style="font-size:.7rem;color:var(--gold2)">전체: ${totalGold.toLocaleString()}냥</span>
          <button class="btn" style="font-size:.65rem;padding:.28rem .6rem;background:rgba(100,60,10,.8);border-color:var(--gold2)" onclick="sellAllVillage()">💰 전부 판매</button>
        </div>`;
    }
  }
}

function repairToolVillage(name){
  const ti = G.inventory.find(i=>i&&i.name===name);
  if(!ti||ti.dur>=ti.maxDur){toast('수리 불필요!');return;}
  const cost = ti.maxDur - ti.dur;
  if(G.char.gold<cost){toast(`수리비 부족! (${cost}냥 필요)`);return;}
  G.char.gold -= cost;
  ti.dur = ti.maxDur;
  const dec = Math.ceil(ti.initMaxDur*0.05);
  ti.maxDur = Math.max(Math.ceil(ti.initMaxDur*0.10), ti.maxDur-dec);
  ti.repairCount = (ti.repairCount||0)+1;
  toast(`🔧 ${name} 수리! (-${cost}냥)`);
  renderInv(); renderVillage(); updateHUD(); saveGame();
}

function buySkillVillage(id){
  const sk = SKILL_SHOP.find(s=>s.id===id);
  if(!sk){return;}
  if(G.char.lv<sk.unlockLv){toast('레벨이 부족합니다!');return;}
  if(G.char.gold<sk.price){toast('냥이 부족합니다!');return;}
  if(G.skills.find(s=>s.id===id)){toast('이미 보유한 무공!');return;}
  G.char.gold -= sk.price;
  G.skills.push({id:sk.id,name:sk.name,icon:sk.icon,mp:sk.mp,cd:0,maxCd:sk.maxCd,dmgMult:sk.dmgMult,special:sk.special||null,hitCount:sk.hitCount||1,auto:false,lv:1,xp:0});
  toast(`🥋 ${sk.name} 습득!`);
  renderSkillList(); renderVillage(); updateHUD(); saveGame();
}

// 제작 스킬 조건 체크
function checkCraftRequire(cs){
  const c = G.char;
  const r = cs.require;
  if(!r) return {ok:true, msg:''};
  const msgs = [];
  // 캐릭터 레벨
  if(r.charLv && c.lv < r.charLv) msgs.push(`캐릭터 Lv${r.charLv}`);
  // 생활 스킬 레벨
  if(r.gatherSkill){
    Object.entries(r.gatherSkill).forEach(([skill, lv])=>{
      const cur = (G.gatherSkills[skill]||{lv:1}).lv;
      const name = skill==='gather'?'채집':skill==='logging'?'벌목':'채광';
      if(cur < lv) msgs.push(`${name} Lv${lv}(현재${cur})`);
    });
  }
  // 제작 스킬 선행
  if(r.craftSkills){
    r.craftSkills.forEach(sid=>{
      if(!G.craftSkills||!G.craftSkills[sid]){
        const name = CRAFT_SKILLS.find(s=>s.id===sid)?.name||sid;
        msgs.push(`${name} 습득`);
      }
    });
  }
  return {ok: msgs.length===0, msg: msgs.join(', ')};
}

function buyCraftSkill(id){
  const cs = CRAFT_SKILLS.find(s=>s.id===id);
  if(!cs) return;
  const {ok, msg} = checkCraftRequire(cs);
  if(!ok){ toast(`조건 미충족: ${msg}`); return; }
  if(G.char.gold < cs.price){ toast('냥이 부족합니다!'); return; }
  if(!G.craftSkills) G.craftSkills={};
  if(G.craftSkills[id]){ toast('이미 습득한 스킬!'); return; }
  G.craftSkills[id] = true;
  G.char.gold -= cs.price;
  toast(`📖 ${cs.name} 스킬 습득!`);
  renderVillage(); updateHUD(); saveGame();
}

function sellMatVillage(name, qty){
  const have = G.mats[name]||0;
  const sell = Math.min(qty, have);
  if(sell<=0){toast('재료가 없습니다!');return;}
  const price = SELL_PRICES[name]||3;
  G.mats[name] -= sell;
  if(G.mats[name]<=0) delete G.mats[name];
  G.char.gold += price*sell;
  toast(`💰 ${name}×${sell} → ${(price*sell).toLocaleString()}냥`);
  renderMats(); renderVillage(); updateHUD(); saveGame();
}

function sellAllVillage(){
  let total=0;
  Object.entries(G.mats).forEach(([n,v])=>{
    total += (SELL_PRICES[n]||3)*v;
    delete G.mats[n];
  });
  G.char.gold += total;
  toast(`💰 전체 판매 → ${total.toLocaleString()}냥!`);
  renderMats(); renderVillage(); updateHUD(); saveGame();
}

// ── 생활 스킬 사부 ─────────────────────────────────
const LIFE_SKILL_SHOP = [
  {
    key:'mining', name:'채광', icon:'⛏️',
    unlockLv:2, price:500,
    desc:'광석과 석탄을 캘 수 있습니다.',
    flavor:'"돌을 깨는 것도 하나의 도(道)니라..."',
  },
  {
    key:'fishing', name:'낚시', icon:'🎣',
    unlockLv:10, price:1500,
    desc:'물고기를 낚을 수 있습니다.',
    flavor:'"기다림을 배워야 큰 물고기를 낚느니라..."',
  },
  {
    key:'farming', name:'농사', icon:'🌾',
    unlockLv:15, price:2500,
    desc:'곡식과 채소를 재배할 수 있습니다.',
    flavor:'"땅을 일구는 자가 하늘을 품느니라..."',
  },
];

function renderLifeSkillShop(){
  const el = document.getElementById('village-life-skill-list');
  if(!el) return;
  const c = G.char;

  // 기본 지급 안내
  let html = `
    <div style="background:rgba(20,30,10,.5);border-radius:4px;padding:.4rem .6rem;margin-bottom:.5rem;font-size:.65rem;color:var(--text3)">
      🌿 채집 · 🪓 벌목은 기본 지급 스킬입니다.
    </div>`;

  html += LIFE_SKILL_SHOP.map(ls=>{
    const owned = G.gatherSkills[ls.key] && G.gatherSkills[ls.key].lv >= 1
                  && ls.key !== 'mining' ? true
                  : G.lifeSkills && G.lifeSkills[ls.key];
    // 채광은 gatherSkills에 있지만 별도 해금 필요
    const miningOwned = ls.key==='mining' && G.lifeSkills && G.lifeSkills['mining'];
    const isOwned = ls.key==='mining' ? miningOwned : owned;
    const lvOk = c.lv >= ls.unlockLv;
    const canBuy = !isOwned && lvOk && c.gold >= ls.price;

    return `
    <div style="padding:.6rem .2rem;border-bottom:1px solid var(--border);opacity:${lvOk?1:0.5}">
      <div style="display:flex;align-items:center;gap:.6rem">
        <span style="font-size:1.6rem">${ls.icon}</span>
        <div style="flex:1">
          <div style="font-size:.8rem;font-weight:600;color:var(--text)">${ls.name}
            ${isOwned?`<span style="font-size:.65rem;color:#6abf4a;margin-left:.3rem">✅ 습득완료</span>`:''}
            ${!lvOk?`<span style="font-size:.65rem;color:#e74c3c;margin-left:.3rem">🔒 Lv${ls.unlockLv} 필요</span>`:''}
          </div>
          <div style="font-size:.72rem;font-weight:600;color:var(--text3);margin-top:2px">${ls.desc}</div>
          <div style="font-size:.68rem;color:#8a7a5a;margin-top:3px;font-style:italic">${ls.flavor}</div>
        </div>
        ${!isOwned?`<button class="btn" style="font-size:.63rem;padding:.28rem .55rem;flex-shrink:0;${canBuy?'':'opacity:.5;cursor:not-allowed'}"
          ${canBuy?`onclick="buyLifeSkill('${ls.key}')"`:'disabled'}>
          ${ls.price.toLocaleString()}냥
        </button>`:''}
      </div>
    </div>`;
  }).join('');

  el.innerHTML = html;
}

function buyLifeSkill(key){
  const ls = LIFE_SKILL_SHOP.find(s=>s.key===key);
  if(!ls) return;
  if(G.char.lv < ls.unlockLv){ toast(`캐릭터 Lv${ls.unlockLv} 이상 필요합니다!`); return; }
  if(G.char.gold < ls.price){ toast('냥이 부족합니다!'); return; }
  if(!G.lifeSkills) G.lifeSkills={};
  if(G.lifeSkills[key]){ toast('이미 습득한 스킬입니다!'); return; }
  G.char.gold -= ls.price;
  G.lifeSkills[key] = true;
  // gatherSkills에도 초기화
  if(!G.gatherSkills[key]) G.gatherSkills[key] = {lv:1, xp:0};
  toast(`👴 ${ls.name} 스킬 습득! 사부: "${ls.flavor.replace(/['"]/g,'')}"`);
  renderVillage(); renderSkillList(); updateHUD(); saveGame();
}

// 스킬북 사용 (인벤토리에서)
function useRecipeBook(invIdx){
  const item = G.inventory[invIdx];
  if(!item || item.type !== 'recipe') return;
  const recipeId = item.recipeId;
  if(!recipeId) return;
  if(!G.craftSkills) G.craftSkills = {};
  if(G.craftSkills[recipeId]){
    toast('이미 습득한 제작법입니다.');
    return;
  }
  G.craftSkills['tool'] = true;
  G.craftSkills[recipeId] = true;
  G.inventory[invIdx] = null;
  const recipeName = item.name.replace(' 제작서','');
  showLevelUpPopup(`📖 ${item.name} 사용!`, `${recipeName} 제작법을 습득했습니다!\n대장간 → 제작 탭에서 만들 수 있어요.`);
  renderInv();
  saveGame();
}

function useSkillBook(invIdx){
  const item = G.inventory[invIdx];
  if(!item||item.type!=='skillbook'){toast('스킬북이 아닙니다!');return;}
  const sk = SKILL_BOOK.find(s=>s.bookName===item.name);
  if(!sk){toast('알 수 없는 스킬북!');return;}
  if(G.skills.find(s=>s.id===sk.id)){toast('이미 보유한 무공!');return;}
  if(G.char.lv<sk.unlockLv){toast(`Lv${sk.unlockLv} 이상 필요!`);return;}
  G.skills.push({id:sk.id,name:sk.name,icon:sk.icon,mp:sk.mp,cd:0,maxCd:sk.maxCd,dmgMult:sk.dmgMult,special:sk.special||null,hitCount:sk.hitCount||1,auto:false,lv:1,xp:0});
  G.inventory.splice(invIdx,1);
  toast(`📖 ${sk.name} 습득!`);
  renderSkillList(); renderInv(); saveGame();
}

// ── 도구 시스템 ───────────────────────────────────
const TOOL_DATA = {
  '호미':   {icon:'🪛', skill:'gather',  dur:50, price:50,  desc:'채집용 호미'},
  '곡괭이': {icon:'⛏️', skill:'mining',  dur:50, price:80,  desc:'채광용 곡괭이'},
  '도끼':   {icon:'🪓', skill:'logging', dur:50, price:70,  desc:'벌목용 도끼'},
};

// 도구 초기화 (처음 지급 시)
function initTool(name){
  if(!G.tools[name]){
    const d = TOOL_DATA[name];
    if(!d) return;
    G.tools[name] = { dur: d.dur, maxDur: d.dur, initMaxDur: d.dur, repairCount: 0 };
  }
}

// 채집 시 내구도 소모 (1회 -1)
function useTool(skill){
  const toolMap = {gather:'호미', mining:'곡괭이', logging:'도끼'};
  const name = toolMap[skill];
  if(!name) return true;
  // 재료창고에 있는지 확인
  if(!(G.mats[name] > 0)) return false;
  initTool(name);
  const t = G.tools[name];
  t.dur = Math.max(0, t.dur - 1);
  if(t.dur <= 0){
    toast(`⚠️ ${name}이(가) 파손됐습니다! 수리가 필요해요.`);
  }
  return true;
}

// 도구 사용 가능 여부 체크 (파손 시 false)
function checkTool(skill){
  const toolMap = {gather:'호미', mining:'곡괭이', logging:'도끼'};
  const name = toolMap[skill];
  if(!name) return true;
  if(!(G.mats[name] > 0) && !G.inventory.some(i=>i&&i.name===name)){
    toast(`⚠️ ${name}가 없습니다! 상점에서 구매하세요.`);
    return false;
  }
  initTool(name);
  if(G.tools[name].dur <= 0){
    toast(`⚠️ ${name}이(가) 파손됐습니다! 수리 후 사용하세요.`);
    return false;
  }
  return true;
}

// 도구 수리
function repairTool(name){
  const ti = G.inventory.find(i=>i&&i.name===name);
  if(!ti){ toast('도구가 인벤토리에 없습니다!'); return; }
  if(ti.dur >= ti.maxDur){ toast('이미 최대 내구도입니다!'); return; }
  const cost = ti.maxDur - ti.dur;
  if(G.char.gold < cost){ toast(`수리비가 부족합니다! (${cost}냥 필요)`); return; }
  G.char.gold -= cost;
  ti.dur = ti.maxDur;
  // 최대 내구도 영구 감소 (최초 최대치의 5%, 하한 10%)
  const decrease = Math.ceil(ti.initMaxDur * 0.05);
  const floor    = Math.ceil(ti.initMaxDur * 0.10);
  ti.maxDur = Math.max(floor, ti.maxDur - decrease);
  ti.repairCount = (ti.repairCount||0) + 1;
  toast(`🔧 ${name} 수리 완료! (-${cost}냥) 최대 내구도 ${ti.maxDur}`);
  renderInv(); renderToolShop(); updateHUD(); saveGame();
}

// 도구 구매 → 인벤토리에 추가
function buyTool(name){
  const d = TOOL_DATA[name];
  if(!d) return;
  if(G.char.gold < d.price){ toast(`냥이 부족합니다! (${d.price}냥 필요)`); return; }
  G.char.gold -= d.price;
  // 이미 인벤에 있으면 내구도 초기화
  const existing = G.inventory.find(i=>i&&i.name===name);
  if(existing){
    existing.dur = d.dur; existing.maxDur = d.dur; existing.initMaxDur = d.dur; existing.repairCount = 0;
    toast(`🛒 ${name} 교체! (-${d.price}냥) 내구도 초기화`);
  } else {
    addToInventory({name, icon:d.icon, type:'tool', skill:d.skill, dur:d.dur, maxDur:d.dur, initMaxDur:d.dur, repairCount:0, qty:1});
    toast(`🛒 ${name} 구매! (-${d.price}냥)`);
  }
  renderInv(); renderToolShop(); updateHUD(); saveGame();
}

function renderToolShop(){
  const el = document.getElementById('tool-shop-list');
  if(!el) return;
  const goldEl = document.getElementById('tool-shop-gold');
  if(goldEl) goldEl.textContent = G.char.gold.toLocaleString();

  el.innerHTML = Object.entries(TOOL_DATA).map(([name, d])=>{
    const ti = G.inventory.find(i=>i&&i.name===name);
    const has = !!ti;
    const durPct = ti ? Math.round(ti.dur / ti.maxDur * 100) : 0;
    const durColor = durPct > 50 ? '#2a8a3a' : durPct > 25 ? '#c9922a' : '#c0392b';
    const broken = ti && ti.dur <= 0;
    const repairCost = ti ? (ti.maxDur - ti.dur) : 0;
    return `
    <div style="padding:.6rem;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:${has?'.4rem':'0'}">
        <span style="font-size:1.4rem">${d.icon}</span>
        <div style="flex:1">
          <div style="font-size:.8rem;font-weight:600;color:var(--text)">${name}
            ${has ? `<span style="font-size:.6rem;color:#6abf4a;margin-left:.3rem">✅ 보유</span>` : ''}
            ${broken ? `<span style="font-size:.6rem;color:#e74c3c;margin-left:.3rem">💥 파손</span>` : ''}
          </div>
          <div style="font-size:.63rem;color:var(--text3)">${d.desc}</div>
        </div>
        <button class="btn" style="font-size:.63rem;padding:.25rem .55rem;${G.char.gold<d.price?'opacity:.5':''}"
          ${G.char.gold>=d.price?`onclick="buyTool('${name}')"`:'disabled'}>
          ${has?'교체':'구매'} ${d.price}냥
        </button>
      </div>
      ${has && ti ? `
      <div style="background:var(--bg3);border-radius:4px;padding:.35rem .5rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.25rem">
          <span style="font-size:.62rem;color:var(--text3)">내구도 ${ti.dur}/${ti.maxDur}
            <span style="color:var(--text3);font-size:.58rem">(최초 ${ti.initMaxDur})</span>
          </span>
          ${repairCost>0 ? `<button class="btn" style="font-size:.58rem;padding:.18rem .4rem;background:rgba(30,60,30,.8);border-color:#2a8a3a;${G.char.gold<repairCost?'opacity:.5':''}"
            ${G.char.gold>=repairCost?`onclick="repairTool('${name}')"`:'disabled'}>
            🔧 수리 ${repairCost}냥
          </button>` : `<span style="font-size:.6rem;color:#6abf4a">최대 내구도</span>`}
        </div>
        <div style="background:var(--bg2);border-radius:2px;height:5px;overflow:hidden">
          <div style="height:100%;width:${durPct}%;background:${durColor};transition:width .3s"></div>
        </div>
        ${(ti.repairCount||0)>0?`<div style="font-size:.55rem;color:var(--text3);margin-top:2px">수리 ${ti.repairCount}회 (최대 내구도 ${ti.maxDur}/${ti.initMaxDur})</div>`:''}
      </div>` : ''}
    </div>`;
  }).join('');
}

// ── 판매 시스템 ───────────────────────────────────
const SELL_PRICES = {
  // 기본 재료 단가 (개당 냥)
// ═══════════════════════════════════════
// 12_boss
// ═══════════════════════════════════════

'풀잎':3, '쑥':5, '야생화':8, '칡':6, '민들레':5,
  '버섯':8, '수액':10, '도라지':12, '약초':15, '영지버섯':25,
  '천년초':50, '더덕':18,
  '돌조각':3, '철광석':8, '석탄':6, '구리광석':15,
  '은광석':30, '수정':50, '금광석':80,
  '나뭇가지':4, '목재':10, '대나무':12,
  // 몬스터 드롭
  '메뚜기껍질':5,'메뚜기액':6,'메뚜기뼈':4,'메뚜기독':10,
  '방아깨비껍질':6,'방아깨비액':8,'방아깨비뼈':5,'방아깨비독':12,
  '귀뚜라미껍질':7,'귀뚜라미액':9,'귀뚜라미뼈':6,'귀뚜라미독':14,
  '딱정벌레껍질':9,'딱정벌레뿔':15,'딱정벌레뼈':7,'딱정벌레진액':18,
  '사슴벌레껍질':11,'사슴벌레집게':20,'사슴벌레뼈':8,'사슴벌레진액':22,
  '말벌날개':15,'말벌독침':25,'말벌껍질':12,'말벌독':30,
  '사마귀낫발':20,'사마귀날개':18,'사마귀뼈':12,'사마귀독':35,
  '거미줄':18,'거미독액':40,'거미뼈':14,'거미껍질':20,
  '지네독':50,'지네껍질':22,'지네뼈':16,'지네촉수':35,
  '장수말벌독':65,'장수말벌날개':55,'장수말벌껍질':30,'장수말벌독침':70,
};
const NO_SELL = new Set([]); // 도구는 인벤토리에 있으므로 판매 목록에 안 뜸

function showSellPanel(){
  const el = document.getElementById('sell-panel');
  el.style.display = 'block';
  renderSellList();
}
function hideSellPanel(){
  document.getElementById('sell-panel').style.display='none';
}

function renderSellList(){
  const el = document.getElementById('sell-list');
  if(!el) return;
  const mats = Object.entries(G.mats).filter(([n,v])=>v>0&&!NO_SELL.has(n)).sort((a,b)=>a[0].localeCompare(b[0],'ko'));
  if(!mats.length){ el.innerHTML='<div style="color:var(--text3);font-size:.75rem">판매할 재료가 없습니다</div>'; return; }
  el.innerHTML = mats.map(([name,qty])=>{
    const price = SELL_PRICES[name] || 3;
    return `
    <div style="display:flex;align-items:center;gap:.4rem;padding:.3rem .2rem;border-bottom:1px solid var(--border)">
      <span style="flex:1;font-size:.72rem;color:var(--text)">${name} <span style="color:var(--text3)">×${qty}</span></span>
      <span style="font-size:.65rem;color:var(--gold2)">${(price*qty).toLocaleString()}냥</span>
      <button class="btn" style="font-size:.58rem;padding:.18rem .4rem" onclick="sellMat('${name}',1)">1개</button>
      <button class="btn" style="font-size:.58rem;padding:.18rem .4rem" onclick="sellMat('${name}',10)">10개</button>
      <button class="btn" style="font-size:.58rem;padding:.18rem .4rem;background:rgba(80,20,20,.7)" onclick="sellMat('${name}',${qty})">전부</button>
    </div>`;
  }).join('');
  // 전체 판매 버튼
  const totalGold = mats.reduce((sum,[n,v])=>sum+(SELL_PRICES[n]||3)*v, 0);
  el.innerHTML += `
    <div style="margin-top:.5rem;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:.7rem;color:var(--gold2)">전체 판매가: ${totalGold.toLocaleString()}냥</span>
      <button class="btn" style="font-size:.65rem;padding:.28rem .6rem;background:rgba(100,60,10,.8);border-color:var(--gold2)" onclick="sellAllMats()">💰 전부 판매</button>
    </div>`;
}

function sellMat(name, qty){
  const have = G.mats[name]||0;
  const sell = Math.min(qty, have);
  if(sell<=0){toast('재료가 없습니다!');return;}
  const price = SELL_PRICES[name]||3;
  G.mats[name] -= sell;
  if(G.mats[name]<=0) delete G.mats[name];
  G.char.gold += price * sell;
  toast(`💰 ${name}×${sell} → ${(price*sell).toLocaleString()}냥`);
  renderMats(); renderSellList(); updateHUD(); saveGame();
}

function sellAllMats(){
  let total = 0;
  Object.entries(G.mats).forEach(([n,v])=>{
    if(NO_SELL.has(n)) return;
    total += (SELL_PRICES[n]||3)*v;
    delete G.mats[n];
  });
  G.char.gold += total;
  toast(`💰 전체 판매 → ${total.toLocaleString()}냥 획득!`);
  renderMats(); renderSellList(); updateHUD(); saveGame();
}

// ── 보스 시스템 ───────────────────────────────────
let bossMonster = null; // 현재 보스 몬스터 데이터

function showBossPopup(zid){
  const monType = G.curMonType;
  const boss = makeBossData(monType);
  bossMonster = boss;

  const rareDrop = boss.drop[3] || boss.drop[0];
  document.getElementById('boss-popup-name').textContent = `💀 보스 ${boss.name} 출현!`;
  document.getElementById('boss-popup-stats').innerHTML =
    `HP: ${boss.maxHp.toLocaleString()} &nbsp;|&nbsp; ATK: ${boss.atk} &nbsp;|&nbsp; DEF: ${boss.def}<br>
     처치 시: ${rareDrop} ×3 · 냥 대량 · 📖 스킬북 30%`;
  document.getElementById('boss-popup').style.display = 'flex';
  addLog(`💀 보스 ${boss.name}이(가) 나타났다!`);
}

function makeBossData(monType){
  return {
    ...monType,
    name: '보스 ' + monType.name,
    isBoss: true,
    maxHp: Math.round(monType.maxHp * 12),
    hp:    Math.round(monType.maxHp * 12),
    atk:   Math.round(monType.atk * 2.5),
    def:   Math.round(monType.def * 7),
    xp:    monType.xp * 5,
    gold:  [monType.gold[0]*10, monType.gold[1]*20],
    drop:  monType.drop, // 동일 드롭풀 (희귀 드롭은 별도 처리)
    dead:  false,
    regenLeft: 0,
    idx:   0,
  };
}

function startBossBattle(){
  document.getElementById('boss-popup').style.display = 'none';
  if(!bossMonster) return;

  // 보스를 인덱스 0 슬롯에 배치 (기존 몬스터 위에 덮어씌움)
  const zid = G.curZone.id + '_' + G.curMonType.id;
  // 일반 몬스터 전부 죽음 처리 (보스만 남김)
  const mons = G.zoneMonsters[zid] || [];
  mons.forEach(m => { m.dead = true; });
  // 보스를 맵 중앙에 배치
  G.zoneMonsters[zid][0] = { ...bossMonster, idx:0 };

  renderFmMonsters();
  addLog(`⚔ ${bossMonster.name}에게 도전!`);
  startBattle(0);
}

function skipBoss(){
  document.getElementById('boss-popup').style.display = 'none';
  // 카운터 초기화 + 보스 대기 해제
  const zid = G.curZone.id + '_' + G.curMonType.id;
  G.bossCounter[zid] = 0;
  G.bossWaiting[zid] = false;
  bossMonster = null;
  addLog('보스를 피했다. 카운터 초기화.');
  exitFullMap();
  saveGame();
}

// 보스 처치 여부 확인 (killMonster 내에서 호출)
function checkBossKill(m, zid){
  if(!m.isBoss) return;
  // 보스 처치!
  G.bossCounter[zid] = 0;
  G.bossWaiting[zid] = false;
  bossMonster = null;

  // 보스 전용 드롭
  const rareDrop = m.drop[3] || m.drop[0];
  G.mats[rareDrop] = (G.mats[rareDrop]||0) + 3;
  const gold2 = m.gold[0] + Math.floor(Math.random()*(m.gold[1]-m.gold[0]+1));
  G.char.gold += gold2;

  // 스킬북 드롭 (30% 확률)
  const unownedBooks = SKILL_BOOK.filter(sb=>!G.skills.find(s=>s.id===sb.id));
  if(unownedBooks.length>0 && Math.random()<0.3){
    const book = unownedBooks[Math.floor(Math.random()*unownedBooks.length)];
    G.inventory.push({name:book.bookName, icon:'📖', type:'skillbook', qty:1});
    addLog(`📖 ${book.bookName} 획득! (인벤토리 확인)`);
    toast(`📖 ${book.bookName} 드롭!`);
  }
  addLog(`🏆 보스 처치! +${m.xp}xp +${gold2}냥 +${rareDrop}×3`);
  toast(`🏆 보스 ${m.name} 처치!`);
  // 보스 처치 기록 - 최초이면 특별 표시
  if(!G.bossKill) G.bossKill = {};
  const prevKills = G.bossKill[m.name] || 0;
  if(prevKills === 0){
    addHistory('보스', `🌟 최초! 보스 ${m.name} 처치 성공!`);
  } else {
    addHistory('보스', `보스 ${m.name} 처치 성공! (${prevKills+1}번째)`);
  }
  G.bossKill[m.name] = prevKills + 1;

  // 일반 몬스터 전체 리젠 복구 (보스 슬롯 포함)
  const zData = G.zoneMonsters[zid];
  const monType = G.curMonType;
  if(zData && monType){
    zData.forEach((mon, i) => {
      // 보스였던 슬롯(i=0)도 일반 몬스터로 복원
      if(mon.isBoss){
        zData[i] = {...monType, hp:monType.maxHp, dead:false, regenLeft:0, idx:i};
      } else {
        mon.dead = false; mon.hp = mon.maxHp; mon.regenLeft = 0;
      }
    });
  }
  setTimeout(()=>renderFmMonsters(), 500);
}

function renderMats(){
  const el=document.getElementById('mat-list');
  if(!el) return;
  el.innerHTML='';
  const entries=Object.entries(G.mats).filter(([,v])=>v>0).sort((a,b)=>a[0].localeCompare(b[0],'ko'));
  if(!entries.length){el.innerHTML='<div style="color:var(--text3);font-size:.75rem;padding:.5rem">재료가 없습니다</div>';return;}
  entries.forEach(([name,qty])=>{
    const d=document.createElement('div');
    d.style.cssText='display:flex;align-items:center;gap:.5rem;padding:.3rem .4rem;border-bottom:1px solid var(--border);font-size:.75rem';
    const img = GATHER_IMAGES && GATHER_IMAGES[name]
      ? `<img src="${GATHER_IMAGES[name]}" style="width:1.6rem;height:1.6rem;object-fit:contain;flex-shrink:0" draggable="false">`
      : `<span style="font-size:1.1rem;flex-shrink:0">📦</span>`;
    d.innerHTML=`${img}<span style="color:var(--text);flex:1">${name}</span><span style="color:var(--gold2)">${qty}개</span>`;
    el.appendChild(d);
  });
}


// ────── 12_boss.js ──────
