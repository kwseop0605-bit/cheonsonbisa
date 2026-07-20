// ── 천손비사 UI/저장/보스/AI 모듈 (ui_save.js) ──────────
// cheonson.html에서 분리됨

// 12_boss
// ═══════════════════════════════════════


// ── 탭 전환 ──────────────────────────────────────
function showTab(id){
  // 채집터가 열려있을 때는 탭 전환 차단 (나가기 버튼으로만 나감)
  const gm = document.getElementById('gathermap');
  if(gm && gm.style.display !== 'none'){
    return;
  }
  document.querySelectorAll('.content-area').forEach(e=>e.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(e=>e.classList.remove('active'));
  document.getElementById('tab-'+id)?.classList.add('active');
  const tabs=['hunt','gather','char','skill','inv','village','build','quest'];
  const idx=tabs.indexOf(id);
  if(idx>=0) document.querySelectorAll('.tab-btn')[idx]?.classList.add('active');
  const alert = document.getElementById('gather-alert');
  if(alert) alert.style.display='none';
  closeCtxMenu();
  const fullmap = document.getElementById('fullmap');
  if(fullmap && fullmap.style.display !== 'none') exitFullMap();
  // 채집터는 나가기 버튼으로만 닫음 (showTab에서 닫지 않음)
  // 마을 탭 전환 시 건물 패널 닫기
  if(id==='village') closeBuildingPanel();
  if(id==='hunt'){
    document.getElementById('view-zone').style.display='block';
    document.getElementById('view-mtype').style.display='none';
    document.getElementById('view-battle').style.display='none';
  }
  if(id==='gather') renderGatherZoneList();
  if(id==='build') renderBuildings();
  if(id==='village') renderVillage();
  if(id==='skill'){ renderSkillList(); renderToolShop(); }
  if(id==='char') renderChar();
  if(id==='inv') renderInv();
  if(id==='quest') renderQuests();
}


// ────── 13_ui.js ──────
// ═══════════════════════════════════════
// 13_ui
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 13_ui
// ═══════════════════════════════════════

// ── 저장 ─────────────────────────────────────────
function saveGame(){
  // 이름 없으면 저장 안 함 (캐릭터 생성 전 상태 보호)
  if(!G.char || !G.char.name) return;
  localStorage.setItem('cheonson_save',JSON.stringify(G));
}
function resetGame(){if(!confirm('초기화하시겠습니까?'))return;localStorage.removeItem('cheonson_save');location.reload()}

// ── AI 전투 분석 (클립보드 복사 방식) ───────────────────


// ────── 14_save.js ──────
// ═══════════════════════════════════════
// 14_save
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 14_save
// ═══════════════════════════════════════

function showAIAnalysis(){
  closeItemPopup();
  const c = G.char;
  const bs = G.battleStats || {};


// ────── 15_ai.js ──────
// ═══════════════════════════════════════
// 15_ai
// ═══════════════════════════════════════

// 분석 데이터 구성
  const statsData = {
    캐릭터: {
      이름: c.name, 레벨: c.lv, 성별: c.gender, 체형: c.body,
      체력: `${c.hp}/${c.mhp}`, 내공: `${c.mp}/${c.mmp}`,
      공격력: c.atk, 방어력: c.def, 회피: `${c.ev}%`, 운: `${c.luck}%`,
      잔여포인트: c.pts, 보유골드: c.gold,
    },
    장착: {
      무기: G.equipped?.weapon||'없음',
      방어구: G.equipped?.armor||'없음',
      악세사리: G.equipped?.accessory||'없음',
      채집도구: {
        호미: G.equippedTools?.gather!=null ? (G.inventory[G.equippedTools.gather]?.name||'없음') : '미착용',
        도끼: G.equippedTools?.logging!=null ? (G.inventory[G.equippedTools.logging]?.name||'없음') : '미착용',
        곡괭이: G.equippedTools?.mining!=null ? (G.inventory[G.equippedTools.mining]?.name||'없음') : '미착용',
      }
    },
    보유스킬: G.skills.map(s=>`${s.name}(Lv${s.lv},자동:${s.auto?'ON':'OFF'})`).join(', '),
    전투통계: {
      몬스터처치: bs.monKills||{},
      사망원인: bs.monDeaths||{},
      스킬사용횟수: bs.skillUse||{},
      스킬총데미지: bs.skillDmg||{},
      크리티컬횟수: bs.critCount||0,
      급소공격횟수: bs.vitalCount||0,
      총가한데미지: bs.totalDmgDealt||0,
      총받은데미지: bs.totalDmgTaken||0,
    },
    급소파악현황: Object.entries(G.vitalFound||{}).map(([id,arr])=>{
      const vitals = MONSTER_VITALS[id]||[];
      const found = arr.map(i=>vitals[i]).filter(Boolean);
      const monName = ZONES.flatMap(z=>z.monsters).find(m=>m.id===id)?.name||id;
      return `${monName}: ${found.join(',')||'미파악'}(${arr.length}/6)`;
    }).join(' | ')||'없음',
    채집스킬: Object.entries(G.gatherSkills||{}).map(([k,v])=>`${k}:Lv${v.lv}(숙련도${v.xp}%)`).join(', '),
    채집통계: {
      총채집횟수: G.gatherStats?.totalGather||0,
      채집물별획득량: G.gatherStats?.itemCount||{},
      도구사용횟수: G.gatherStats?.toolUse||{},
    },
    제작스킬: Object.keys(G.craftSkills||{}).filter(k=>G.craftSkills[k]).join(', ')||'없음',
    제작통계: {
      총제작횟수: G.craftStats?.totalCraft||0,
      제작물별횟수: G.craftStats?.craftCount||{},
      소모재료: G.craftStats?.matUsed||{},
    },
    보유재료: G.mats||{},
  };

  const analysisText =
`[천손비사 플레이 데이터 분석 요청]

${JSON.stringify(statsData, null, 2)}

위 데이터를 바탕으로 아래 항목을 분석해 주세요:
1. 현재 상태 평가 (레벨 대비 스탯 밸런스)
2. 전투 문제점 (사망 원인, 취약점, 비효율 요소)
3. 스킬 활용도 (미사용 스킬, 자동 설정 추천)
4. 채집/제작 현황 (효율 평가, 우선순위)
5. 즉시 해야 할 것 3가지
6. 급소 파악 전략`;

  // 팝업 생성
  const overlay=document.createElement('div');
  overlay.id='item-popup';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.onclick=e=>{ if(e.target===overlay) closeItemPopup(); };
  const box=document.createElement('div');
  box.style.cssText='background:#0d1020;border:1px solid #6a3a9a;border-radius:10px;padding:1.3rem 1.5rem;max-width:360px;width:93%';
  box.onclick=e=>e.stopPropagation();
  box.innerHTML=`
    <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.8rem">
      <span style="font-size:1.5rem">🤖</span>
      <div>
        <div style="font-size:.9rem;font-weight:700;color:#c09aea">AI 전투 분석</div>
        <div style="font-size:.62rem;color:var(--text3)">천손비사 어드바이저</div>
      </div>
    </div>
    <div style="background:rgba(20,15,40,.8);border:1px solid #4a3a6a;border-radius:6px;padding:.8rem;margin-bottom:.8rem">
      <div style="font-size:.72rem;color:#c09aea;font-weight:600;margin-bottom:.4rem">📋 사용 방법</div>
      <div style="font-size:.68rem;color:#ccc;line-height:1.8">
        ① 아래 [데이터 복사] 버튼 클릭<br>
        ② Claude 채팅창에 붙여넣기 (Ctrl+V)<br>
        ③ AI가 분석 결과를 바로 알려줘요!
      </div>
    </div>
    <div style="background:rgba(10,10,20,.8);border:1px solid var(--border);border-radius:6px;padding:.6rem;margin-bottom:.8rem;max-height:120px;overflow-y:auto">
      <div style="font-size:.6rem;color:var(--text3);font-family:monospace;word-break:break-all;line-height:1.5">
        ${c.name} · Lv${c.lv} · ATK${c.atk} DEF${c.def}<br>
        처치: ${Object.entries(bs.monKills||{}).map(([k,v])=>k+'×'+v).join(', ')||'없음'}<br>
        사망: ${Object.entries(bs.monDeaths||{}).map(([k,v])=>k+'×'+v).join(', ')||'없음'}<br>
        크리${bs.critCount||0}회 · 급소${bs.vitalCount||0}회
      </div>
    </div>
    <div style="display:flex;gap:.4rem">
      <button id="copy-analysis-btn" class="btn" style="flex:1;font-size:.72rem;padding:.4rem;background:linear-gradient(135deg,rgba(60,20,80,.9),rgba(20,40,80,.9));border-color:#6a3a9a"
        onclick="copyAnalysisData()">📋 데이터 복사</button>
      <button class="btn" style="flex:1;font-size:.72rem;padding:.4rem" onclick="closeItemPopup()">닫기</button>
    </div>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // 전역에 분석 텍스트 저장
  window._analysisText = analysisText;
}

function copyAnalysisData(){
  if(!window._analysisText) return;
  navigator.clipboard.writeText(window._analysisText).then(()=>{
    const btn = document.getElementById('copy-analysis-btn');
    if(btn){ btn.textContent='✅ 복사 완료!'; btn.style.borderColor='#2a8a3a'; }
    toast('📋 분석 데이터 복사 완료! Claude 채팅에 붙여넣기 하세요.');
  }).catch(()=>{
    // 클립보드 API 실패 시 선택 방식으로 폴백
    const ta = document.createElement('textarea');
    ta.value = window._analysisText;
    ta.style.cssText='position:fixed;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const btn = document.getElementById('copy-analysis-btn');
    if(btn){ btn.textContent='✅ 복사 완료!'; btn.style.borderColor='#2a8a3a'; }
    toast('📋 분석 데이터 복사 완료!');
  });
}
function getSaveSlotKey(slot){ return `cheonson_slot_${slot}`; }

function showSavePanel(){
  closeItemPopup();
  const overlay=document.createElement('div');
  overlay.id='item-popup';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.onclick=closeItemPopup;
  const box=document.createElement('div');
  box.style.cssText='background:#0d1020;border:1px solid #2a5a9a;border-radius:10px;padding:1.2rem 1.5rem;max-width:320px;width:92%';
  box.onclick=e=>e.stopPropagation();

  const slots = renderSaveSlots('save');
  box.innerHTML=`
    <div style="font-size:.92rem;font-weight:700;color:#e8b84b;margin-bottom:.8rem">💾 게임 저장</div>
    <div style="font-size:.65rem;color:var(--text3);margin-bottom:.6rem">슬롯을 선택하여 저장하세요 (최대 5개)</div>
    <div id="save-slot-list" style="display:flex;flex-direction:column;gap:.4rem">${slots}</div>
    <button class="btn" style="width:100%;margin-top:.7rem;font-size:.7rem" onclick="closeItemPopup()">닫기</button>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function showLoadPanel(){
  closeItemPopup();
  const overlay=document.createElement('div');
  overlay.id='item-popup';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.onclick=closeItemPopup;
  const box=document.createElement('div');
  box.style.cssText='background:#0d1020;border:1px solid #2a5a9a;border-radius:10px;padding:1.2rem 1.5rem;max-width:320px;width:92%';
  box.onclick=e=>e.stopPropagation();

  const slots = renderSaveSlots('load');
  box.innerHTML=`
    <div style="font-size:.92rem;font-weight:700;color:#e8b84b;margin-bottom:.8rem">📂 게임 불러오기</div>
    <div style="font-size:.65rem;color:var(--text3);margin-bottom:.6rem">저장된 슬롯을 선택하세요</div>
    <div id="save-slot-list" style="display:flex;flex-direction:column;gap:.4rem">${slots}</div>
    <button class="btn" style="width:100%;margin-top:.7rem;font-size:.7rem" onclick="closeItemPopup()">닫기</button>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function renderSaveSlots(mode){
  return [1,2,3,4,5].map(slot=>{
    const raw = localStorage.getItem(getSaveSlotKey(slot));
    const data = raw ? JSON.parse(raw) : null;
    const isEmpty = !data;
    const charName = data?.char?.name || '';
    const charLv = data?.char?.lv || '';
    const saveTime = data?._saveTime ? new Date(data._saveTime).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
    const charGold = data?.char?.gold?.toLocaleString() || '';

    if(mode==='save'){
      return `<div style="display:flex;align-items:center;gap:.6rem;background:rgba(20,30,50,.6);border:1px solid var(--border);border-radius:6px;padding:.5rem .7rem">
        <div style="flex:1">
          <div style="font-size:.75rem;font-weight:600;color:${isEmpty?'var(--text3)':'#e8b84b'}">
            ${isEmpty?`슬롯 ${slot} (비어있음)`:`${charName} · Lv${charLv}`}
          </div>
          ${!isEmpty?`<div style="font-size:.6rem;color:var(--text3)">${saveTime} · ${charGold}냥</div>`:''}
        </div>
        <button class="btn" style="font-size:.65rem;padding:.25rem .6rem;background:rgba(20,60,20,.8);border-color:#2a8a3a"
          onclick="doSave(${slot})">저장</button>
        ${!isEmpty?`<button class="btn" style="font-size:.65rem;padding:.25rem .5rem;background:rgba(80,20,20,.7);border-color:#8a2a2a"
          onclick="deleteSlot(${slot})">삭제</button>`:''}
      </div>`;
    } else {
      return `<div style="display:flex;align-items:center;gap:.6rem;background:rgba(20,30,50,.6);border:1px solid var(--border);border-radius:6px;padding:.5rem .7rem;opacity:${isEmpty?.4:1}">
        <div style="flex:1">
          <div style="font-size:.75rem;font-weight:600;color:${isEmpty?'var(--text3)':'#e8b84b'}">
            ${isEmpty?`슬롯 ${slot} (비어있음)`:`${charName} · Lv${charLv}`}
          </div>
          ${!isEmpty?`<div style="font-size:.6rem;color:var(--text3)">${saveTime} · ${charGold}냥</div>`:''}
        </div>
        ${!isEmpty?`<button class="btn" style="font-size:.65rem;padding:.25rem .6rem;background:rgba(20,40,80,.8);border-color:#2a5a9a"
          onclick="doLoad(${slot})">불러오기</button>`:'<span style="font-size:.6rem;color:var(--text3)">없음</span>'}
      </div>`;
    }
  }).join('');
}

function doSave(slot){
  const data = JSON.parse(JSON.stringify(G)); // 깊은 복사
  data._saveTime = Date.now();
  localStorage.setItem(getSaveSlotKey(slot), JSON.stringify(data));
  localStorage.setItem('cheonson_save', JSON.stringify(G)); // 자동저장도 갱신
  toast(`💾 슬롯 ${slot}에 저장 완료! (${G.char.name} Lv${G.char.lv})`);
  closeItemPopup();
  setTimeout(showSavePanel, 100); // 패널 새로고침
}

function doLoad(slot){
  const raw = localStorage.getItem(getSaveSlotKey(slot));
  if(!raw){ toast('저장 데이터가 없습니다!'); return; }
  if(!confirm(`슬롯 ${slot}을 불러오시겠습니까?\n현재 진행 중인 내용이 덮어씌워집니다.`)) return;
  const data = JSON.parse(raw);
  delete data._saveTime;
  Object.assign(G, data);
  closeItemPopup();
  startGame();
  toast(`📂 슬롯 ${slot} 불러오기 완료! (${G.char.name} Lv${G.char.lv})`);
}

function deleteSlot(slot){
  if(!confirm(`슬롯 ${slot}의 저장 데이터를 삭제하시겠습니까?`)) return;
  localStorage.removeItem(getSaveSlotKey(slot));
  toast(`슬롯 ${slot} 삭제 완료`);
  closeItemPopup();
  setTimeout(showSavePanel, 100);
}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500);}
setInterval(saveGame,30000);
// 건물 생산 1분마다 업데이트
setInterval(()=>{
  calcOfflineProduction();
  const buildTab = document.getElementById('tab-build');
  if(buildTab && buildTab.classList.contains('active')) renderBuildings();
}, 60000);


// ────── 15_ai.js ──────
// ═══════════════════════════════════════
// 15_ai (14_save.js로 이동됨)
// ═══════════════════════════════════════

