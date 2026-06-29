// ── 천손비사 채집 시스템 모듈 (gather.js) ──────────────────────────────
// 채집/벌목/채광 자동채집 전담 모듈

const _gather = {
  timer: null,
  pointId: null,
  zoneId: null,
  remaining: 0,
  total: 5000,
  sessionId: 0,
  stopAfter: false,
  nextPointId: null,  // 다음에 채집할 포인트 대기열
  clickCount: 0,
  clickWindowStart: 0,
};

// ── 채집 시작 ──────────────────────────────────────────────────────────
function gatherStart(zoneId, pointId){
  // 기존 채집 중단
  gatherStop(false);

  const pts = GATHER_POINTS[zoneId] || [];
  const pt = pts.find(p => p.id === pointId);
  if(!pt) return;

  // 리젠 중 체크
  const state = G.gatherPointState[pt.id] || {status:'ready'};
  if(state.status === 'regen' && Date.now() < state.endTime){
    toast('리젠 중입니다!');
    return;
  }

  // 광산 층 체크
  if(zoneId === 'mine' && G.mineFloor && pt.skillLvMin !== G.mineFloor){
    toast('이 층의 광석이 아닙니다!');
    return;
  }

  // 채광 스킬 체크
  if(pt.skill === 'mining' && !(G.lifeSkills && G.lifeSkills['mining'])){
    showGatherAlert('채광 스킬이 없습니다!', '마을 → 신단수 퀘스트에서\n채광 스킬을 받으세요.');
    return;
  }

  // ── 도구 체크 ──
  const toolMap = {gather:'호미', mining:'곡괭이', logging:'도끼'};
  const toolMapAlt = {gather:'돌호미', mining:'돌곡괭이', logging:'돌도끼'};
  const needTool = toolMap[pt.skill];
  if(!G.equippedTools) G.equippedTools={gather:null,logging:null,mining:null};
  const eqIdx = G.equippedTools[pt.skill];
  let toolItem = null;
  if(eqIdx != null){
    const inv = G.inventory[eqIdx];
    if(inv && (inv.name === toolMap[pt.skill] || inv.name === toolMapAlt[pt.skill]) && (inv.dur||0) > 0){
      toolItem = inv;
    }
  }
  if(!toolItem){
    const hasTool = G.inventory.some(i=>i&&(i.name===toolMap[pt.skill]||i.name===toolMapAlt[pt.skill])&&(i.dur||0)>0);
    const toolDesc = {호미:'채집(풀·약초)',도끼:'벌목(나무)',곡괭이:'채광(광석)'}[needTool]||'';
    if(hasTool){
      showGatherAlert(`🪛 ${needTool} 미착용!`, `가방에 ${needTool}가 있지만 장착하지 않았습니다.\n인벤토리에서 더블클릭으로 장착하세요.`);
    } else {
      showGatherAlert(`🪛 ${needTool}가 없습니다!`, `대장간 → 제작 탭에서\n${needTool}를 제작하세요.`);
    }
    return;
  }
  if((toolItem.dur||0) <= 0){
    showGatherAlert(`🪛 ${needTool} 파손!`, `내구도가 0이 됐습니다.\n대장간 → 수리 또는 제작 탭을 이용하세요.`);
    return;
  }

  // ── 채집 시작 ──
  _gather.pointId = pointId;
  _gather.zoneId = zoneId;
  _gather.remaining = 5000;
  _gather.total = 5000;
  _gather.stopAfter = false;
  _gather.nextPointId = null;
  _gather.sessionId++;

  // 게이지 표시
  const el = document.getElementById(gmpId(pointId));
  if(el){
    // 기존 게이지 제거 후 새로 추가
    let bar = el.querySelector('.gmp-bar-wrap');
    if(bar) bar.remove();
    bar = document.createElement('div');
    bar.className = 'gmp-bar-wrap';
    bar.style.cssText = 'position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);width:90px;height:15px;background:rgba(0,0,0,.6);border-radius:7px;overflow:hidden;border:1px solid rgba(255,255,255,.2)';
    const inner = document.createElement('div');
    inner.className = 'gmp-bar-inner';
    inner.style.cssText = 'height:100%;background:linear-gradient(90deg,#2a8a3a,#4aaf5a);width:0%;transition:width .25s';
    bar.appendChild(inner);
    el.appendChild(bar);
  }

  // 타이머 시작
  _gather.timer = setInterval(()=>{
    _gather.remaining = Math.max(0, _gather.remaining - 300);
    const pct = 100 - (_gather.remaining / _gather.total * 100);
    const ptEl = document.getElementById(gmpId(pointId));
    if(ptEl){
      const inner = ptEl.querySelector('.gmp-bar-inner');
      if(inner) inner.style.width = pct + '%';
    }
    if(_gather.remaining <= 0){
      clearInterval(_gather.timer);
      _gather.timer = null;
      gatherFinish(zoneId, pointId);
    }
  }, 300);
}

// ── 채집 중단 ──────────────────────────────────────────────────────────
function gatherStop(){
  if(_gather.timer){ clearInterval(_gather.timer); _gather.timer = null; }
  _gather.sessionId++; // 세션 ID 바꿔서 진행 중인 재시작 차단

  const pid = _gather.pointId;
  if(pid){
    const el = document.getElementById(gmpId(pid));
    if(el){
      el.style.animation = '';
      const bw = el.querySelector('.gmp-bar-wrap');
      if(bw) bw.remove();
    }
    if(G.gatherPointState[pid]) G.gatherPointState[pid] = {status:'ready'};
  }

  _gather.pointId = null;
  _gather.zoneId = null;
  mapGatherPointId = null;
  _gatherPointId2 = '';
}

// ── 채집 완료 ──────────────────────────────────────────────────────────
function gatherFinish(zoneId, pointId){
  // 게이지 제거
  const finEl = document.getElementById(gmpId(pointId));
  if(finEl){ const bw=finEl.querySelector('.gmp-bar-wrap'); if(bw) bw.remove(); }

  const pts = GATHER_POINTS[zoneId] || [];
  const pt = pts.find(p => p.id === pointId);
  if(!pt) return;

  const sk = G.gatherSkills[pt.skill] || {lv:1, xp:0};

  // ── 아이템 획득 ──
  if(pt.fixedQty){
    // 열매 처리
    const existing = G.inventory.find(x=>x&&x.name===pt.name&&x.type==='berry');
    if(existing){ existing.qty = Math.min(999, (existing.qty||1)+1); }
    else { addToInventory({name:pt.name, icon:pt.icon, type:'berry', qty:1}); }
    toast(`${pt.icon} ${pt.name} 획득!`);
    renderInv();
  } else {
    const curXp = (G.gatherSkills[pt.skill]||{xp:0}).xp || 0;
    const qty = getGatherQty(curXp, sk.lv, pt.skillLvMin);
    const matName = pt.resultName || pt.name;
    G.mats[matName] = (G.mats[matName]||0) + qty;
    // 최초 채집 역사 기록
    if(!G.gatherStats) G.gatherStats={itemCount:{},totalGather:0,firstTime:{}};
    if(!G.gatherStats.firstTime) G.gatherStats.firstTime = {};
    G.gatherStats.itemCount[pt.name] = (G.gatherStats.itemCount[pt.name]||0) + qty;
    G.gatherStats.totalGather = (G.gatherStats.totalGather||0) + 1;
    if(!G.gatherStats.firstTime[pt.name]){
      G.gatherStats.firstTime[pt.name] = true;
      const kor = {gather:'채집',mining:'채광',logging:'벌목'}[pt.skill]||'채집';
      addHistory(kor, `${pt.name} 최초 ${kor} 성공`);
    }
    toast('✅ ' + (pt.icon||'') + ' ' + matName + ' ×' + qty + ' 획득!');
  }

  // ── 도구 내구도 소모 ──
  const toolName = {gather:'호미', mining:'곡괭이', logging:'도끼'}[pt.skill];
  const toolNameAlt = {gather:'돌호미', mining:'돌곡괭이', logging:'돌도끼'}[pt.skill];
  if(toolName){
    const eqIdx = G.equippedTools?.[pt.skill];
    const ti = (eqIdx!=null && G.inventory[eqIdx] &&
                (G.inventory[eqIdx].name===toolName||G.inventory[eqIdx].name===toolNameAlt))
               ? G.inventory[eqIdx] : null;
    if(ti){
      ti.dur = Math.max(0,(ti.dur||0)-1);
      if(ti.dur <= 0){
        G.inventory[G.inventory.indexOf(ti)] = null;
        G.equippedTools[pt.skill] = null;
        renderEquipSlots();
        showLevelUpPopup(`⚠️ ${ti.name} 파손!`, `내구도가 0이 됐습니다.\n대장간에서 수리 또는 제작하세요.`);
      }
    }
  }

  // ── 숙련도/레벨업 ──
  if(!G.gatherSkills[pt.skill]) G.gatherSkills[pt.skill]={lv:1,xp:0};
  G.gatherSkills[pt.skill].xp = (G.gatherSkills[pt.skill].xp||0) + 1;
  if(G.gatherSkills[pt.skill].xp >= 100){
    G.gatherSkills[pt.skill].xp = 0;
    G.gatherSkills[pt.skill].lv++;
    const sName = pt.skill==='gather'?'채집':pt.skill==='logging'?'벌목':'채광';
    const newLv = G.gatherSkills[pt.skill].lv;
    showLevelUpPopup(`⛏ ${sName} Lv${newLv}!`, `${sName} 숙련도가 올랐습니다!\n숙련도 50 이상 시 2개 채집!`);
    addHistory('레벨업', `${sName} 스킬이 Lv${newLv}이 되었다.`);
    updateGatherHUD && updateGatherHUD();
  }

  // ── 화면 갱신 ──
  renderMats();
  renderSkillList();
  updateGatherSkillHUD && updateGatherSkillHUD();
  updateQuestHUD && updateQuestHUD();
  saveGame();

  // ── noRegen 자동 재시작 ──
  if(pt.noRegen){
    G.gatherPointState[pointId] = {status:'ready'};
    _gather.pointId = null;
    _gather.zoneId = null;
    mapGatherPointId = null; _gatherPointId2 = '';

    const el2 = document.getElementById(gmpId(pointId));
    if(el2) el2.style.display = 'flex';
    if(G.curGatherZone) renderGatherItemList(G.curGatherZone);

    const mySession = _gather.sessionId;
    const savedZoneId = zoneId;
    const savedPointId = pointId;

    setTimeout(()=>{
      if(_gather.sessionId !== mySession) return;
      if(!G.curGatherZone) return;
      if(document.getElementById('gathermap')?.style.display === 'none') return;
      // 대기열에 다음 포인트가 있으면 그것을 채집
      if(_gather.nextPointId){
        const nextId = _gather.nextPointId;
        _gather.nextPointId = null;
        gatherStart(savedZoneId, nextId);
      } else if(!_gather.stopAfter){
        // 대기열 없고 stopAfter 아니면 같은 포인트 반복
        gatherStart(savedZoneId, savedPointId);
      }
    }, 300);
  } else {
    // 일반 리젠
    G.gatherPointState[pointId] = {status:'regen', endTime: Date.now() + (pt.regenTime||15)*1000};
    _gather.pointId = null;
    mapGatherPointId = null; _gatherPointId2 = '';

    const el = document.getElementById(gmpId(pointId));
    if(el){ el.style.display='none'; el.style.animation=''; const bw=el.querySelector('.gmp-bar-wrap'); if(bw) bw.remove(); }
    if(G.curGatherZone) renderGatherItemList(G.curGatherZone);

    const _regenRefresh = setInterval(()=>{
      const st = G.gatherPointState[pointId];
      if(!st || st.status!=='regen' || Date.now() >= st.endTime){
        clearInterval(_regenRefresh);
        G.gatherPointState[pointId] = {status:'ready'};
        const el2 = document.getElementById(gmpId(pointId));
        if(el2) el2.style.display = 'flex';
        if(G.curGatherZone) renderGatherItemList(G.curGatherZone);
      } else {
        if(G.curGatherZone) renderGatherItemList(G.curGatherZone);
      }
    }, 500);
  }
}

// ── 스페이스/클릭으로 채집 단축 ───────────────────────────────────────
function gatherBoost(){
  if(!_gather.timer) return;
  const now = Date.now();
  if(now - _gather.clickWindowStart > 1000){ _gather.clickCount=0; _gather.clickWindowStart=now; }
  if(_gather.clickCount >= 2) return;
  _gather.clickCount++;
  _gather.remaining = Math.max(0, _gather.remaining - 500);
  const pct = 100 - (_gather.remaining / _gather.total * 100);
  const ptEl = document.getElementById(gmpId(_gather.pointId));
  if(ptEl){ const inner=ptEl.querySelector('.gmp-bar-inner'); if(inner) inner.style.width=pct+'%'; }
  if(_gather.remaining <= 0){
    clearInterval(_gather.timer); _gather.timer=null;
    gatherFinish(_gather.zoneId, _gather.pointId);
  }
}

// 하위 호환용 래퍼
function startGatherPointExec(zoneId, pointId){ gatherStart(zoneId, pointId); }
function cancelGatherMap(){ gatherStop(); }
function exitGatherMap(){
  gatherStop();
  document.getElementById('gathermap').style.display = 'none';
  const ov = document.getElementById('gather-inv-overlay');
  if(ov) ov.style.display = 'none';
}
