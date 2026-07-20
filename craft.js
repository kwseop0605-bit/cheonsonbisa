// ── 천손비사 제작/수리 모듈 (craft.js) ──────────────────
// cheonson.html에서 분리됨

// ── 채집 UI/렌더링 → gather_ui.js로 분리됨 ──
// ═══════════════════════════════════════
// 09_craft
// ═══════════════════════════════════════

function lupRefresh(){
  const c = G.char;
  const pp = G.ptsPending;
  const remain = c.pts - G.ptsUsed;
  const el = document.getElementById('lup-pts-remain');
  if(el) el.textContent = remain;
  ['mhp','mmp','atk','def','ev','pen','luck'].forEach(key=>{
    const v = document.getElementById('lup-val-'+key);
    if(v) v.textContent = pp[key]||0;
  });
}

function lupAddPts(key){
  const remain = G.char.pts - G.ptsUsed;
  if(remain <= 0){ toast('포인트가 없습니다!'); return; }
  G.ptsPending[key] = (G.ptsPending[key]||0) + 1;
  G.ptsUsed++;
  lupRefresh(); updateHUD();
}

function lupSubPts(key){
  if((G.ptsPending[key]||0) <= 0) return;
  G.ptsPending[key]--;
  G.ptsUsed--;
  lupRefresh(); updateHUD();
}

function lupConfirm(){
  if(G.ptsUsed > 0) confirmPts();
  lupClose();
}

function lupClose(){
  const el = document.getElementById('levelup-popup');
  if(el) el.remove();
}

// ── 제작 레시피 전체 ─────────────────────────────
const ALL_CRAFT_RECIPES = [
  // 🔧 기본 도구 (튜토리얼 완료 시 제작법 지급)
  {id:'tool_homi',     skill:'tool', name:'돌호미 제작',   icon:'🌱', result:'돌호미',
   mats:{돌조각:5, 소나무:2}, resultQty:1, resultIcon:'🌱',
   resultTool:{type:'tool', skill:'gather', dur:100, maxDur:100, initMaxDur:100, repairCount:0, repairable:false, icon:'images/tools/homi.png'}},
  {id:'tool_pickaxe',  skill:'tool', name:'돌곡괭이 제작', icon:'⛏️', result:'돌곡괭이',
   mats:{돌조각:5, 소나무:2}, resultQty:1, resultIcon:'⛏️',
   resultTool:{type:'tool', skill:'mining', dur:100, maxDur:100, initMaxDur:100, repairCount:0, repairable:false, icon:'images/tools/pickaxe.png'}},
  {id:'tool_axe',      skill:'tool', name:'돌도끼 제작',   icon:'🪓', result:'돌도끼',
   mats:{돌조각:5, 소나무:2}, resultQty:1, resultIcon:'🪓',
   resultTool:{type:'tool', skill:'logging', dur:100, maxDur:100, initMaxDur:100, repairCount:0, repairable:false, icon:'images/tools/axe.png'}},
  // 🔥 제련
  {id:'smelt_iron',    skill:'smelt', name:'철괴 제련',     icon:'⚙️', result:'철괴',
   mats:{철광석:10,석탄:2}, resultQty:1, resultIcon:'⚙️'},
  {id:'smelt_copper',  skill:'smelt', name:'구리괴 제련',   icon:'🔶', result:'구리괴',
   mats:{구리광석:10,석탄:2}, resultQty:1, resultIcon:'🔶'},
  {id:'smelt_silver',  skill:'smelt', name:'은괴 제련',     icon:'🪙', result:'은괴',
   mats:{은광석:5,석탄:2}, resultQty:1, resultIcon:'🪙'},
  {id:'smelt_gold',    skill:'smelt', name:'금괴 제련',     icon:'✨', result:'금괴',
   mats:{금광석:5,석탄:2}, resultQty:1, resultIcon:'✨'},
  {id:'smelt_crystal', skill:'smelt', name:'수정괴 제련',   icon:'💎', result:'수정괴',
   mats:{수정:5,석탄:2}, resultQty:1, resultIcon:'💎'},

  // 🪵 목공
  {id:'wood_handle',   skill:'woodwork', name:'칼자루 제작', icon:'🪵', result:'칼자루',
   mats:{나뭇가지:3}, resultQty:1, resultIcon:'🪵'},
  {id:'wood_scabbard', skill:'woodwork', name:'칼집 제작',   icon:'🪵', result:'칼집',
   mats:{목재:2}, resultQty:1, resultIcon:'🪵'},
  {id:'wood_bamboo',   skill:'woodwork', name:'죽간 제작',   icon:'🎍', result:'죽간',
   mats:{대나무:3}, resultQty:1, resultIcon:'🎍'},

  // ⚔ 무기제작 (장착)
  {id:'weapon_iron',   skill:'weapon', name:'철검 제작',   icon:'⚔', result:'철검',
   mats:{철괴:2,칼자루:1}, resultQty:1, resultIcon:'⚔',
   equip:{slot:'weapon',atk:10}, desc:'ATK +10'},
  {id:'weapon_copper', skill:'weapon', name:'동검 제작',   icon:'⚔', result:'동검',
   mats:{구리괴:2,칼자루:1}, resultQty:1, resultIcon:'⚔',
   equip:{slot:'weapon',atk:18}, desc:'ATK +18'},
  {id:'weapon_silver', skill:'weapon', name:'은검 제작',   icon:'⚔', result:'은검',
   mats:{은괴:2,칼집:1}, resultQty:1, resultIcon:'⚔',
   equip:{slot:'weapon',atk:28}, desc:'ATK +28'},
  {id:'weapon_gold',   skill:'weapon', name:'금검 제작',   icon:'⚔', result:'금검',
   mats:{금괴:2,칼집:1}, resultQty:1, resultIcon:'⚔',
   equip:{slot:'weapon',atk:40}, desc:'ATK +40'},

  // 🛡 방어구 (장착)
  {id:'armor_iron',   skill:'armor', name:'철갑옷 제작',  icon:'🛡', result:'철갑옷',
   mats:{철괴:2}, resultQty:1, resultIcon:'🛡',
   equip:{slot:'armor',def:8}, desc:'DEF +8'},
  {id:'armor_copper', skill:'armor', name:'동갑옷 제작',  icon:'🛡', result:'동갑옷',
   mats:{구리괴:3}, resultQty:1, resultIcon:'🛡',
   equip:{slot:'armor',def:14}, desc:'DEF +14'},
  {id:'armor_silver', skill:'armor', name:'은갑옷 제작',  icon:'🛡', result:'은갑옷',
   mats:{은괴:3}, resultQty:1, resultIcon:'🛡',
   equip:{slot:'armor',def:22}, desc:'DEF +22'},

  // 💍 악세사리 (장착)
  {id:'acc_silver_ring', skill:'access', name:'은반지 제작',   icon:'💍', result:'은반지',
   mats:{은괴:1,수정괴:1}, resultQty:1, resultIcon:'💍',
   equip:{slot:'accessory',luck:3}, desc:'운 +3%'},
  {id:'acc_gold_neck',   skill:'access', name:'금목걸이 제작', icon:'📿', result:'금목걸이',
   mats:{금괴:1,수정괴:1}, resultQty:1, resultIcon:'📿',
   equip:{slot:'accessory',atk:5,def:5}, desc:'ATK+5 DEF+5'},

  // ⚗️ 연금술 (소비)
  {id:'alch_hp',   skill:'alchemi', name:'회복단 제작',   icon:'🧪', result:'회복단',
   mats:{약초:3,수액:2}, resultQty:3, resultIcon:'🧪',
   consume:{hp:0.5}, desc:'HP 50% 회복'},
  {id:'alch_mp',   skill:'alchemi', name:'내공단 제작',   icon:'💧', result:'내공단',
   mats:{영지버섯:2,더덕:2}, resultQty:3, resultIcon:'💧',
   consume:{mp:0.5}, desc:'MP 50% 회복'},
  {id:'alch_full', skill:'alchemi', name:'대회복단 제작', icon:'✨', result:'대회복단',
   mats:{천년초:1,영지버섯:2}, resultQty:2, resultIcon:'✨',
   consume:{hp:1,mp:1}, desc:'HP+MP 완전회복'},
];

// 스킬별 그룹
const SKILL_RECIPE_MAP = {
  tool:     {name:'🔧 도구제작',  recipes:ALL_CRAFT_RECIPES.filter(r=>r.skill==='tool')},
  smelt:    {name:'🔥 제련',     recipes:ALL_CRAFT_RECIPES.filter(r=>r.skill==='smelt')},
  woodwork: {name:'🪵 목공',     recipes:ALL_CRAFT_RECIPES.filter(r=>r.skill==='woodwork')},
  weapon:   {name:'⚔ 무기제작', recipes:ALL_CRAFT_RECIPES.filter(r=>r.skill==='weapon')},
  armor:    {name:'🛡 방어구',   recipes:ALL_CRAFT_RECIPES.filter(r=>r.skill==='armor')},
  access:   {name:'💍 악세사리', recipes:ALL_CRAFT_RECIPES.filter(r=>r.skill==='access')},
  alchemi:  {name:'⚗️ 연금술',   recipes:ALL_CRAFT_RECIPES.filter(r=>r.skill==='alchemi')},
};

// ── 제작 목록 렌더링 ─────────────────────────────
function renderCraftList(){
  const el = document.getElementById('village-craft-skill-list');
  if(!el) return;
  if(!G.craftSkills) G.craftSkills={};
  if(!G.equipped) G.equipped={weapon:null,armor:null,accessory:null};

  let html = '';
  Object.entries(SKILL_RECIPE_MAP).forEach(([skillId,group])=>{
    if(!G.craftSkills[skillId]) return;
    html += `<div style="font-size:.7rem;font-weight:700;color:var(--gold2);padding:.45rem .2rem .2rem;border-top:1px solid var(--border);margin-top:.2rem">${group.name}</div>`;
    group.recipes.forEach(r=>{
      const mats = Object.entries(r.mats);
      const canCraft = mats.every(([n,q])=>(G.mats[n]||0)>=q);
      const matStr = mats.map(([n,q])=>{
        const have = G.mats[n]||0;
        const ok = have>=q;
        return `<span style="color:${ok?'#6abf4a':'#e74c3c'}">${n}×${q}(${have})</span>`;
      }).join(' + ');
      const haveResult = G.mats[r.result]||0;
      const equipped = r.equip && G.equipped[r.equip.slot]===r.result;

      html += `
      <div style="padding:.4rem .2rem;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:.4rem">
          <span style="font-size:1.1rem">${r.resultIcon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:.72rem;font-weight:600;color:var(--text)">
              ${r.result}${r.resultQty>1?` <span style="color:var(--text3);font-size:.65rem">×${r.resultQty}</span>`:''}
              ${r.desc?` <span style="font-size:.65rem;color:var(--gold2)">${r.desc}</span>`:''}
              ${equipped?` <span style="font-size:.63rem;color:#6abf4a">✅장착중</span>`:''}
              ${haveResult>0?` <span style="font-size:.63rem;color:#aaa">보유:${haveResult}</span>`:''}
            </div>
            <div style="font-size:.65rem;font-weight:600;margin-top:2px;flex-wrap:wrap">${matStr}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:.2rem;align-items:flex-end;flex-shrink:0">
            ${canCraft?`
            <div style="display:flex;align-items:center;gap:.2rem">
              <input type="number" id="qty_${r.id}" value="1" min="1" max="99"
                style="width:36px;font-size:.63rem;text-align:center;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:3px;padding:1px 2px">
              <button class="btn" style="font-size:.6rem;padding:.2rem .45rem" onclick="doCraft('${r.id}')">제작</button>
            </div>`:`<span style="font-size:.6rem;color:#e74c3c">재료부족</span>`}
            ${r.equip&&haveResult>0?`
            <button class="btn" style="font-size:.58rem;padding:.15rem .4rem;background:${equipped?'rgba(80,20,20,.7)':'rgba(20,60,20,.8)'};border-color:${equipped?'#c0392b':'#2a8a3a'}"
              onclick="toggleEquip('${r.id}')">${equipped?'해제':'장착'}</button>`:''}
            ${r.consume&&haveResult>0?`
            <button class="btn" style="font-size:.58rem;padding:.15rem .4rem;background:rgba(20,50,60,.8)"
              onclick="useConsumable('${r.id}')">사용(${haveResult})</button>`:''}
          </div>
        </div>
      </div>`;
    });
  });

  if(!html) html=`<div style="color:var(--text3);font-size:.7rem;padding:.5rem;line-height:1.7">
    습득한 제작 스킬이 없습니다.<br>위 [제작 스킬 습득] 목록에서 스킬을 배우세요.</div>`;
  el.innerHTML = html;
}

// ── 제작 실행 ────────────────────────────────────
function doCraft(recipeId){
  const r = ALL_CRAFT_RECIPES.find(x=>x.id===recipeId);
  if(!r) return;
  const qtyEl = document.getElementById('qty_'+recipeId);
  const qty = Math.max(1, parseInt(qtyEl?.value||1)||1);
  const mats = Object.entries(r.mats);
  for(const [n,q] of mats){
    if((G.mats[n]||0) < q*qty){
      toast(`재료 부족! ${n} ${q*qty}개 필요 (보유:${G.mats[n]||0})`); return;
    }
  }
  mats.forEach(([n,q])=>{ G.mats[n]-=q*qty; if(G.mats[n]<=0) delete G.mats[n]; });
  const total = r.resultQty*qty;
  G.mats[r.result] = (G.mats[r.result]||0)+total;
  // 제작 통계 수집
  if(!G.craftStats) G.craftStats={craftCount:{},totalCraft:0,matUsed:{}};
  G.craftStats.craftCount[r.result] = (G.craftStats.craftCount[r.result]||0) + total;
  G.craftStats.totalCraft = (G.craftStats.totalCraft||0) + qty;
  mats.forEach(([n,q])=>{ G.craftStats.matUsed[n] = (G.craftStats.matUsed[n]||0) + q*qty; });
  toast(`🔨 ${r.result} ×${total} 제작 완료!`);
  // 역사 기록 - 최초 제작만
  if(!G.craftStats.firstTime) G.craftStats.firstTime = {};
  if(!G.craftStats.firstTime[r.result]){
    G.craftStats.firstTime[r.result] = true;
    addHistory('제작', `${r.result} 최초 제작 성공`);
  }
  // 돌 도구 제작 시 관련 채집 숙련도 +2
  const toolXpMap = {
    '돌호미':    {skill:'gather',  xp:2},
    '돌곡괭이':  {skill:'mining',  xp:2},
    '돌도끼':    {skill:'logging', xp:2},
  };
  if(toolXpMap[r.result]){
    const {skill, xp} = toolXpMap[r.result];
    if(!G.gatherSkills[skill]) G.gatherSkills[skill]={lv:1,xp:0};
    G.gatherSkills[skill].xp = (G.gatherSkills[skill].xp||0) + xp * qty;
    // 레벨업 체크
    while(G.gatherSkills[skill].xp >= 100){
      G.gatherSkills[skill].xp -= 100;
      G.gatherSkills[skill].lv++;
      const sName = skill==='gather'?'채집':skill==='logging'?'벌목':'채광';
      toast(`🎉 ${sName} 스킬 Lv${G.gatherSkills[skill].lv}!`);
    }
    toast(`📈 ${skill==='gather'?'채집':skill==='logging'?'벌목':'채광'} 숙련도 +${xp*qty}`);
  }
  renderMats(); renderCraftList(); renderVillage(); saveGame();
}

// ── 장착 / 해제 ──────────────────────────────────
function toggleEquip(recipeId){
  const r = ALL_CRAFT_RECIPES.find(x=>x.id===recipeId);
  if(!r||!r.equip) return;
  if(!G.equipped) G.equipped={weapon:null,armor:null,accessory:null};
  const slot = r.equip.slot;
  if(G.equipped[slot]===r.result){
    G.equipped[slot]=null; toast(`${r.result} 해제`);
  } else {
    if((G.mats[r.result]||0)<=0){ toast('보유 아이템 없음!'); return; }
    G.equipped[slot]=r.result; toast(`⚔ ${r.result} 장착!`);
  }
  updateSide(); renderCraftList(); saveGame();
}

// ── 소비 아이템 사용 ──────────────────────────────


// ────── 10_berry.js ──────
