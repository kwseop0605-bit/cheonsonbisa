// ═══════════════════════════════════════
// 화면 스케일 - 1920x1080 고정 디자인을 창 크기에 맞춰 확대/축소
// ═══════════════════════════════════════
function fitScaleWrap(){
  const wrap = document.getElementById('game-scale-wrap');
  const game = document.getElementById('game');
  if(!wrap || !game) return;
  const DESIGN_W = 1920, DESIGN_H = 1080;
  const ww = wrap.clientWidth, wh = wrap.clientHeight;
  if(ww <= 0 || wh <= 0) return;
  const scale = Math.min(ww / DESIGN_W, wh / DESIGN_H);
  const offsetX = (ww - DESIGN_W * scale) / 2;
  const offsetY = (wh - DESIGN_H * scale) / 2;
  game.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}
window.addEventListener('resize', fitScaleWrap);

// ── 천손비사 코어/초기화 모듈 (core.js) ──────────────────
// cheonson.html에서 분리됨

// ────── 03_core.js ──────
// ═══════════════════════════════════════
// 03_core
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 03_core
// ═══════════════════════════════════════

let selGender='남', selBody='균형';
function selectOpt(el){
  const group=el.dataset.group;
  document.querySelectorAll(`[data-group="${group}"]`).forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  if(group==='gender') selGender=el.dataset.val;
  if(group==='body') selBody=el.dataset.val;
}

function createChar(){
  const name=document.getElementById('char-name-input').value.trim();
  if(!name){toast('이름을 입력하세요!');return;}
  G.char.name=name; G.char.gender=selGender; G.char.body=selBody;
  if(selBody==='날렵') G.char.ev=5;
  else if(selBody==='다부진') G.char.def+=1;
  G.char.createdAt = Date.now();
  G.history = [];
  addHistory('탄생', `${name}(이)가 천손으로 각성하였다.`);
  document.getElementById('char-create').style.display='none';
  saveGame(); startGame();
}

// ── 인벤토리 추가 (빈 슬롯 우선) ────────────────────
function addToInventory(item){
  const emptyIdx = G.inventory.findIndex(i=>i===null||i===undefined);
  if(emptyIdx>=0){
    G.inventory[emptyIdx] = item;
  } else {
    G.inventory.push(item);
  }
}

function initGame(){
  const saved = localStorage.getItem('cheonson_save');
  if(saved){
    try{
      const data = JSON.parse(saved);
      const name = data?.char?.name;
      const lv = data?.char?.lv || 1;
      const gold = (data?.char?.gold||0).toLocaleString();

      const overlay = document.createElement('div');
      overlay.id = 'start-overlay';
      overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center';
      const displayName = name || '이름 없음';
      overlay.innerHTML=`
        <div style="background:#0d1020;border:1px solid #c9922a;border-radius:12px;padding:2rem 2.5rem;text-align:center;min-width:280px">
          <div style="font-size:1.4rem;font-weight:700;color:#e8b84b;margin-bottom:.4rem;font-family:var(--font-title)">天孫秘史</div>
          <div style="font-size:.75rem;color:var(--text3);margin-bottom:1.5rem">저장된 게임이 있습니다</div>
          <div style="background:rgba(20,30,50,.8);border:1px solid var(--border);border-radius:8px;padding:.8rem 1rem;margin-bottom:1.2rem">
            <div style="font-size:.85rem;font-weight:700;color:#e8b84b">${displayName}</div>
            <div style="font-size:.7rem;color:var(--text3);margin-top:.2rem">Lv${lv} · ${gold}냥</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:.5rem">
            <button class="btn" onclick="_loadSave()"
              style="font-size:.82rem;padding:.55rem;background:rgba(20,60,20,.8);border-color:#2a8a3a">
              ▶ 이어하기
            </button>
            <button class="btn" onclick="_newGame()"
              style="font-size:.82rem;padding:.55rem">
              ✦ 새 게임
            </button>
          </div>
          <div style="font-size:.62rem;color:var(--text3);margin-top:.8rem">
            💾 기존 저장은 슬롯(5개)에 보관됩니다
          </div>
        </div>`;
      document.body.appendChild(overlay);
      return;
    }catch(e){
      // JSON 파싱 오류 → 손상된 데이터 제거
      localStorage.removeItem('cheonson_save');
    }
  }
  document.getElementById('char-create').style.display='flex';
}

function _closeStartOverlay(){
  const el = document.getElementById('start-overlay');
  if(el) el.remove();
}

function _loadSave(){
  _closeStartOverlay();
  const saved = localStorage.getItem('cheonson_save');
  if(saved){
    try{
      Object.assign(G, JSON.parse(saved));
      // 오래된 아이콘 경로 자동 수정
      const iconFix = {
        'homi.png':'images/tools/homi.png','pickaxe.png':'images/tools/pickaxe.png',
        'axe.png':'images/tools/axe.png','sickle.png':'images/tools/sickle.png',
        'images/homi.png':'images/tools/homi.png','images/pickaxe.png':'images/tools/pickaxe.png',
        'images/axe.png':'images/tools/axe.png','images/sickle.png':'images/tools/sickle.png',
      };
      if(G.inventory) G.inventory.forEach(item=>{ if(item && iconFix[item.icon]) item.icon = iconFix[item.icon]; });
      // bossWaiting 초기화 (이전 버그로 stuck된 상태 해제)
      G.bossWaiting = {};
      // equippedTools 인덱스 검증 (아이템 이름 기반으로 재확인)
      if(G.equippedTools){
        const toolNames = {gather:'호미', logging:'도끼', mining:'곡괭이'};
        Object.keys(G.equippedTools).forEach(skill=>{
          const idx = G.equippedTools[skill];
          if(idx == null) return;
          const item = G.inventory[idx];
          // 인덱스의 아이템이 해당 슬롯 도구가 아니면 초기화
          if(!item || item.type !== 'tool' || item.skill !== skill){
            // 올바른 도구 찾아서 재설정
            const correctIdx = G.inventory.findIndex(i=>i&&i.type==='tool'&&i.skill===skill&&(i.dur||0)>0);
            G.equippedTools[skill] = correctIdx >= 0 ? correctIdx : null;
          }
        });
      }
      startGame();
      return;
    }catch(e){}
  }
  document.getElementById('char-create').style.display='flex';
}

function _newGame(){
  _closeStartOverlay();
  localStorage.removeItem('cheonson_save');
  document.getElementById('char-create').style.display='flex';
}

// ── 사냥터 ↔ 채집터 빠른 이동 ───────────────────────
function _updateCrossBtn(){
  // 사냥터 맵의 채집터 버튼
  const gatherBtn = document.getElementById('fm-goto-gather-btn');
  if(gatherBtn){
    if(G.lastGatherZone){
      gatherBtn.style.display = 'block';
      gatherBtn.textContent = `🌿 ${G.lastGatherZone.name}`;
    } else {
      gatherBtn.style.display = 'none';
    }
  }
  // 채집터 맵의 사냥터 버튼
  const huntBtn = document.getElementById('gm-goto-battle-btn');
  if(huntBtn){
    if(G.lastHuntZone){
      const monName = G.lastHuntZone.monType.name;
      huntBtn.style.display = 'block';
      huntBtn.textContent = `⚔ ${monName}`;
    } else {
      huntBtn.style.display = 'none';
    }
  }
}

// 사냥터에서 마지막 채집터로 바로 이동
function gotoGatherFromBattle(){
  if(!G.lastGatherZone) return;
  // 전투 중이면 도망 처리
  if(battleTimer){ clearInterval(battleTimer); battleTimer = null; }
  if(enemyTimer){ clearInterval(enemyTimer); enemyTimer = null; }
  curMonIdx = -1;
  autoBattle = false; // 자동전투 OFF
  // fullmap 닫기
  document.getElementById('fullmap').style.display = 'none';
  // 채집터 바로 열기
  const zone = G.lastGatherZone;
  G.curGatherZone = zone;
  showTab('gather');
  openGatherMap(zone, null);
}

// 채집터에서 마지막 사냥터로 바로 이동
function gotoHuntFromGather(){
  if(!G.lastHuntZone) return;
  // 채집 중이면 취소
  cancelGatherMap();
  // gathermap 닫기
  document.getElementById('gathermap').style.display = 'none';
  // 사냥터 바로 열기
  const {zone, monType} = G.lastHuntZone;
  G.curZone = zone;
  showTab('hunt');
  enterMonsterMap(monType);
}


function startGame(){
  // 채집터 선택 배경 설정
  if(typeof ZONE_BG !== 'undefined' && ZONE_BG.gather_select){
    document.documentElement.style.setProperty('--gather-select-bg', `url('${ZONE_BG.gather_select}')`);
  }
  document.getElementById('game-scale-wrap').classList.add('show');
  fitScaleWrap();
  // 항상 zone 선택 화면부터 시작
  document.getElementById('view-zone').style.display='block';
  document.getElementById('view-mtype').style.display='none';
  document.getElementById('view-battle').style.display='none';
  document.getElementById('fullmap').style.display='none';
  G.curZone=null; G.curMonType=null;
  // 마을 탭 명시적 활성화 (첫 화면)
  document.querySelectorAll('.content-area').forEach(e=>e.classList.remove('active'));
  document.getElementById('tab-village').classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(e=>e.classList.remove('active'));
  document.querySelectorAll('.tab-btn')[5]?.classList.add('active');
  // 캐릭터 SVG
  // 캐릭터 이미지 (사이드바 = normal)
  const charSvg = document.getElementById('char-svg');
  if(charSvg){
    const gender = G.char.gender||'남';
    const charKey = `${gender}_normal`;
    if(typeof CHAR_IMAGES !== 'undefined' && CHAR_IMAGES[charKey]){
      charSvg.innerHTML = `<image href="${CHAR_IMAGES[charKey]}" x="0" y="0" width="60" height="80" preserveAspectRatio="xMidYMid meet"/>`;
    } else {
      drawChar(charSvg, G.char.gender, G.char.body);
    }
  }
  // buildings 없으면 초기화
  if(!G.buildings) G.buildings = {};
  // 기본 도구 지급 — 튜토리얼 미완료 시에만 startGame에서 지급하지 않음
  // (튜토리얼에서 불메장이가 지급함. 단 튜토리얼 완료 후 재접속 시 도구 없으면 지급)
  // 튜토리얼 완료 체크
  if(G.tutorialDone){
    // 파손된 도구는 재지급하지 않음 (대장간에서 제작해야 함)
  }
  // 재료창고에 실수로 들어간 도구 제거
  ['호미','곡괭이','도끼'].forEach(n=>{ if(G.mats[n]) delete G.mats[n]; });
  // 오프라인 생산 계산
  calcOfflineProduction();
  // ptsPending 없으면 초기화
  if(!G.ptsPending) G.ptsPending={mhp:0,mmp:0,atk:0,def:0,ev:0,pen:0,luck:0};
  if(!G.ptsUsed) G.ptsUsed=0;
  // fm-player-svg는 openFullMap에서 그림
  updateHUD(); updateSide();
  if(!G.craftSkills) G.craftSkills = {};
  if(!G.lifeSkills) G.lifeSkills = {};
  if(!G.vitalKills) G.vitalKills={};
  if(!G.vitalFound) G.vitalFound={};
  if(!G.battleStats) G.battleStats={monKills:{},monDeaths:{},skillUse:{},skillDmg:{},critCount:0,vitalCount:0,totalBattles:0,totalDmgDealt:0,totalDmgTaken:0};
  if(!G.gatherStats) G.gatherStats={itemCount:{},totalGather:0,toolUse:{}};
  if(!G.craftStats)  G.craftStats={craftCount:{},totalCraft:0,matUsed:{}};
  if(!G.berrySlots) G.berrySlots = [null,null];
  renderZoneList(); renderSkillList(); renderInv(); renderChar(); renderQuests(); renderGatherZoneList(); renderBuildings(); renderToolShop(); renderVillage();
  toast(`${G.char.name}, 천명을 받아들이다!`);
  // 새 캐릭터면 튜토리얼 시작 (대화창은 startTutorial 안에서 .show 추가)
  if(!G.tutorialDone){
    _tutorialStartTimer = setTimeout(startTutorial, 1200);
  }

  // ── HP/MP 자동 회복 타이머 ──
  // 2분(120초)에 전체 회복 → 1초마다 mhp/120, mmp/120씩 회복
  if(window._regenTimer) clearInterval(window._regenTimer);
  window._regenTimer = setInterval(()=>{
    const c = G.char;
    // 전투 중이거나 자동전투 ON이거나 사냥터 맵이 열려있으면 회복 안 함
    // 채집터는 회복 허용
    const inBattle = battleTimer || autoBattle ||
      (document.getElementById('fullmap')?.style.display !== 'none');
    if(inBattle) return;
    let changed = false;
    if(c.hp < c.mhp){
      c.hp = Math.min(c.mhp, c.hp + Math.ceil(c.mhp / 120));
      changed = true;
    }
    if(c.mp < c.mmp){
      c.mp = Math.min(c.mmp, c.mp + Math.ceil(c.mmp / 120));
      changed = true;
    }
    if(changed){
      updateHUD();      // 사이드바 HUD
      updateFmHUD();    // 사냥터 풀맵 HUD
      updateGatherSkillHUD(); // 채집터 HUD
    }
  }, 1000);
}

// ── HUD ───────────────────────────────────────────
function updateHUD(){
  const c=G.char;
  document.getElementById('bar-hp').style.width=(c.hp/c.mhp*100)+'%';
  document.getElementById('val-hp').textContent=`${c.hp}/${c.mhp}`;
  document.getElementById('bar-mp').style.width=(c.mp/c.mmp*100)+'%';
  document.getElementById('val-mp').textContent=`${c.mp}/${c.mmp}`;
  const need=Math.round(100*Math.pow(1.15,c.lv-1));
  document.getElementById('bar-xp').style.width=(c.xp/need*100)+'%';
  document.getElementById('val-xp').textContent=`${c.xp}/${need}`;
  document.getElementById('hud-lv').textContent=c.lv;
  document.getElementById('hud-gold').textContent=fmtGold(c.gold);
  updateSide();
}
function fmtGold(n){
  if(n>=10000) return `${Math.floor(n/10000)}금 ${Math.floor((n%10000)/100)}관 ${n%100}냥`;
  if(n>=100) return `${Math.floor(n/100)}관 ${n%100}냥`;
  return `${n}냥`;
}
function updateSide(){
  const c=G.char;
  document.getElementById('side-name').textContent=c.name||'-';
  document.getElementById('side-class').textContent=`${c.gender}·${c.body}형 천손 Lv${c.lv}`;
  // 장착 스탯 포함한 실제 스탯 표시
  const eq = getEquipStats();
  document.getElementById('s-atk').textContent=c.atk + (eq.atk?`+${eq.atk}`:'');
  document.getElementById('s-def').textContent=c.def + (eq.def?`+${eq.def}`:'');
  document.getElementById('s-ev').textContent=c.ev+'%';
  document.getElementById('s-pen').textContent=c.pen+'%';
  document.getElementById('s-luck').textContent=(c.luck+(eq.luck||0))+'%';
  document.getElementById('s-pts').textContent=c.pts;
  document.getElementById('s-weapon').textContent=G.equipped.weapon||'없음';
  document.getElementById('s-armor').textContent=G.equipped.armor||'없음';
  document.getElementById('s-accessory').textContent=G.equipped.accessory||'없음';
}

// 장착 스탯 합산
function getEquipStats(){
  const stats={atk:0,def:0,luck:0};
  const items=[G.equipped.weapon,G.equipped.armor,G.equipped.accessory];
  items.forEach(name=>{
    if(!name) return;
    const recipe=ALL_CRAFT_RECIPES.find(r=>r.result===name);
    if(recipe&&recipe.equip){
      if(recipe.equip.atk) stats.atk+=recipe.equip.atk;
      if(recipe.equip.def) stats.def+=recipe.equip.def;
      if(recipe.equip.luck) stats.luck+=recipe.equip.luck;
    }
  });
  return stats;
}

// ── 사냥터 ────────────────────────────────────────
function renderZoneList(){
  const el=document.getElementById('zone-list');
  el.innerHTML='';
  ZONES.forEach(z=>{
    const d=document.createElement('div');
    d.className='zone-card';
    d.innerHTML=`<div class="zone-card-icon">${z.icon}</div>
      <div class="zone-card-name">${z.name}</div>
      <div class="zone-card-lv">권장 Lv ${z.lv}</div>
      <div class="zone-card-count">몬스터 ${z.monsters.length}종</div>`;
    d.onclick=()=>enterZone(z);
    el.appendChild(d);
  });
}

function enterZone(zone){
  G.curZone=zone;
  document.getElementById('view-zone').style.display='none';
  document.getElementById('view-mtype').style.display='block';
  document.getElementById('zone-name-title').textContent=zone.name;
  renderMTypeList(zone);
}

function renderMTypeList(zone){
  const el=document.getElementById('mtype-list');
  el.innerHTML='';
  zone.monsters.forEach(m=>{
    const d=document.createElement('div');
    d.className='mtype-card';
    // SVG와 텍스트를 한번에 설정
    d.innerHTML=`
      <div style="width:70px;height:80px">${getMonsterSVG(m.id)}</div>
      <div class="mtype-name">${m.name}</div>
      <div class="mtype-lv">Lv ${m.lv}</div>
    `;
    d.onclick=()=>enterMonsterMap(m);
    el.appendChild(d);
  });
}

function enterMonsterMap(monType){
  G.curMonType=monType;
  // 마지막 사냥터 기록
  G.lastHuntZone = {zone: G.curZone, monType: monType};
  // 채집터 → 사냥터로 왔다면 채집터 버튼 표시
  _updateCrossBtn();
  const zid=G.curZone.id+'_'+monType.id;
  if(!G.zoneMonsters[zid]){
    G.zoneMonsters[zid]=Array.from({length:10},(_,i)=>({
      ...monType, hp:monType.maxHp, dead:false, regenLeft:0, idx:i
    }));
  } else {
    // 재진입 시 죽은 몬스터 리젠 + 보스 슬롯 일반 몬스터로 복원
    if(!G.bossWaiting[zid]){
      G.zoneMonsters[zid].forEach((m,i)=>{
        if(m.isBoss){
          G.zoneMonsters[zid][i] = {...monType, hp:monType.maxHp, dead:false, regenLeft:0, idx:i};
        } else if(m.dead){
          m.dead=false; m.hp=m.maxHp; m.regenLeft=0;
        }
      });
    }
  }
  document.getElementById('view-battle').style.display='block';
  openFullMap();
}

// ── 전체화면 맵 ───────────────────────────────────


// ── 맵/몬스터 렌더링 → map_draw.js로 분리됨 ──
// ── 캐릭터/스탯 → char.js로 분리됨 ──
// ── 제작/수리 → craft.js로 분리됨 ──
// ── 열매/슬롯 → berry.js로 분리됨 ──
// ═══════════════════════════════════════
// 12_boss
