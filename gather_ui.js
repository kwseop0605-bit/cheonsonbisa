// ── 천손비사 채집 UI/렌더링 모듈 (gather_ui.js) ──────────
// cheonson.html에서 분리됨

// ═══════════════════════════════════════
// 08_gather
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 08_gather
// ═══════════════════════════════════════

let mapGatherTimer = null;
let mapGatherPointId = null;
let _gatherRemaining = 0;
let _gatherStartRemain = 0;
let _gatherZoneId2 = '';
let _gatherPointId2 = '';
let _gatherClickCount = 0;
let _gatherClickWindowStart = 0;




function renderGatherZoneList(){
  const el = document.getElementById('gzone-list');
  if(!el) return;
  el.innerHTML = '';
  GATHER_ZONES.forEach(z => {
    const card = document.createElement('div');
    card.className = 'zone-card';
    if(z.id === 'mine'){
      // 광산은 층 선택 카드로 표시
      card.innerHTML = `<span style="font-size:1.4rem">${z.icon}</span>
        <div>
          <div class="zone-card-name">${z.name}</div>
          <div style="font-size:.62rem;color:var(--text3);margin-top:.2rem">층 선택 후 입장</div>
        </div>`;
      card.onclick = () => selectMinFloor();
    } else {
      card.innerHTML = '<span style="font-size:1.4rem">' + z.icon + '</span><div><div class="zone-card-name">' + z.name + '</div></div>';
      card.onclick = () => {
        // 도구 체크: 해당 구역에서 사용 가능한 스킬이 하나도 없을 때만 차단
        const toolMap = {gather:'호미', logging:'도끼', mining:'곡괭이'};
        const skillNameMap = {gather:'채집', logging:'벌목', mining:'채광'};
        const pts = GATHER_POINTS[z.id] || [];
        const skills = [...new Set(pts.filter(p=>!p.fixedQty).map(p=>p.skill))];
        const missingTools = [];
        const unwornTools = [];
        let hasAnyOk = false;
        for(const skill of skills){
          const needTool = toolMap[skill];
          if(!needTool){ hasAnyOk = true; continue; }
          if(!G.equippedTools) G.equippedTools={gather:null,logging:null,mining:null};
          const eqIdx = G.equippedTools[skill];
          const toolOk = eqIdx!=null && G.inventory[eqIdx]?.name===needTool && (G.inventory[eqIdx]?.dur||0)>0;
          if(toolOk){ hasAnyOk = true; continue; }
          const hasTool = G.inventory.some(i=>i&&i.name===needTool&&(i.dur||0)>0);
          if(hasTool) unwornTools.push({tool:needTool, skill});
          else missingTools.push({tool:needTool, skill});
        }
        // 모든 도구 없으면 진입 차단
        if(!hasAnyOk){
          const allMissing = [...missingTools, ...unwornTools];
          if(unwornTools.length > 0 && missingTools.length === 0){
            showGatherAlert(`⚠️ 도구 미착용!`,
              `${unwornTools.map(t=>t.tool).join(', ')}가 가방에 있지만 장착되지 않았습니다.\n\n` +
              `인벤토리 탭 → 도구 더블클릭으로 장착하세요.`);
          } else {
            showGatherAlert(`❌ 도구가 없습니다!`,
              `${missingTools.map(t=>t.tool).join(', ')}가 없어서 입장할 수 없습니다.\n\n` +
              `마을 → 대장간 → [제작] 탭에서 제작하세요.`);
          }
          return;
        }
        // 일부 도구만 없으면 진입 허용 + 토스트 안내
        if(missingTools.length > 0){
          missingTools.forEach(t=>{
            toast(`⚠️ ${t.tool}가 없어서 ${skillNameMap[t.skill]} 채집물은 이용할 수 없습니다.`);
          });
        }
        if(unwornTools.length > 0){
          unwornTools.forEach(t=>{
            toast(`⚠️ ${t.tool} 미착용 → ${skillNameMap[t.skill]} 채집물 이용 불가`);
          });
        }
        // 맵 진입
        G.curGatherZone = z;
        openGatherMap(z, null);
      };
    }
    el.appendChild(card);
  });
}

function selectMinFloor(){
  // 곡괭이 체크 먼저
  if(!G.equippedTools) G.equippedTools={gather:null,mining:null,logging:null};
  const eqIdx = G.equippedTools['mining'];
  const toolOk = eqIdx!=null && G.inventory[eqIdx]?.name==='곡괭이' && (G.inventory[eqIdx]?.dur||0)>0;
  console.log('[광산체크] eqIdx:', eqIdx, 'toolOk:', toolOk);
  if(!toolOk){
    const hasTool = G.inventory.some(i=>i&&i.name==='곡괭이'&&(i.dur||0)>0);
    console.log('[광산체크] hasTool:', hasTool);
    if(hasTool){
      showGatherAlert('⚠️ 곡괭이 미착용!',
        '곡괭이가 가방에 있지만 장착되지 않았습니다.\n\n' +
        '인벤토리 탭 → 곡괭이 더블클릭으로 장착하세요.');
    } else {
      showGatherAlert('❌ 곡괭이가 없습니다!',
        '곡괭이가 없어서 광산에 입장할 수 없습니다.\n\n' +
        '마을 → 대장간 → [구매] 탭에서\n곡괭이를 구매하세요.');
    }
    return;
  }
  // 광산 층 선택 팝업
  const overlay = document.createElement('div');
  overlay.id = 'mine-floor-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9000;display:flex;align-items:center;justify-content:center';
  const mineZone = GATHER_ZONES.find(z=>z.id==='mine');

  // 층별 광물 정보
  const floors = [
    {label:'1층 (지표층)', desc:'⚙️철광석 · 🖤석탄', yRange:[0, 0.44], pts: GATHER_POINTS['mine'].filter((_,i)=>i<10)},
    {label:'2층 (중층)',   desc:'🔶구리광석 · 🪙은광석', yRange:[0.44, 0.70], pts: GATHER_POINTS['mine'].filter((_,i)=>i>=10&&i<20)},
    {label:'3층 (심층)',   desc:'💎수정 · ✨금광석', yRange:[0.70, 1.0], pts: GATHER_POINTS['mine'].filter((_,i)=>i>=20)},
  ];

  overlay.innerHTML = `
    <div style="background:#0d1020;border:1px solid #c9922a;border-radius:12px;padding:1.5rem;min-width:280px;text-align:center">
      <div style="font-size:1.1rem;font-weight:700;color:#e8b84b;margin-bottom:1rem">⛏️ 광산 채광터</div>
      <div style="display:flex;flex-direction:column;gap:.6rem">
        ${floors.map((f,i)=>`
          <div onclick="enterMineFloor(${i})" style="background:rgba(20,15,10,.8);border:1px solid #5a4020;border-radius:8px;padding:.8rem 1rem;cursor:pointer;text-align:left;transition:all .15s"
            onmouseover="this.style.borderColor='#c9922a'" onmouseout="this.style.borderColor='#5a4020'">
            <div style="font-size:.85rem;font-weight:700;color:#e8b84b">${f.label}</div>
            <div style="font-size:.7rem;color:var(--text3);margin-top:.3rem">${f.desc}</div>
          </div>`).join('')}
      </div>
      <button class="btn" onclick="document.getElementById('mine-floor-overlay').remove()" style="margin-top:1rem;width:100%;font-size:.75rem">취소</button>
    </div>`;
  document.body.appendChild(overlay);
}

function enterMineFloor(floorIdx){
  const overlay = document.getElementById('mine-floor-overlay');
  if(overlay) overlay.remove();
  const mineZone = GATHER_ZONES.find(z=>z.id==='mine');
  G.curGatherZone = mineZone;
  G.mineFloor = floorIdx + 1; // 1층=1, 2층=2, 3층=3
  openGatherMap(mineZone, null);
}

function selectGatherZone(zone){
  G.curGatherZone = zone;
  openGatherMap(zone, null);
}

function renderGatherItemList(zone){
  const el = document.getElementById('gitem-list');
  if(!el) return;
  el.innerHTML = '';
  const pts = GATHER_POINTS[zone.id] || [];
  pts.forEach(pt => {
    const state = G.gatherPointState[pt.id] || {status:'ready'};
    const isRegen = state.status === 'regen' && Date.now() < state.endTime;
    const remain = isRegen ? Math.ceil((state.endTime - Date.now())/1000) : 0;
    const sk = G.gatherSkills[pt.skill] || {lv:1,xp:0};
    const qty = pt.fixedQty ? 1 : getGatherQty(sk.xp % 100, sk.lv, pt.skillLvMin);
    const card = document.createElement('div');
    card.className = 'monster-type-card';

    if(isRegen){
      // 리젠 중이면 흐리게 + 리젠 타이머 표시
      card.style.opacity = '0.4';
      card.style.cursor = 'not-allowed';
      const skillName = pt.skill==='gather'?'채집':(pt.skill==='logging'?'벌목':'채광');
      card.innerHTML = '<span style="font-size:1.8rem" style="filter:grayscale(1)">' + pt.icon + '</span><div class="mtype-info"><div class="mtype-name">' + pt.name + '</div><div class="mtype-desc" style="font-size:.62rem;color:var(--text3)">리젠 ' + remain + '초</div></div>';
    } else {
      const skillName = pt.skill==='gather'?'채집':(pt.skill==='logging'?'벌목':'채광');
      const curLv = sk.lv;
      const lvMin = pt.skillLvMin||1;
      const lvMax = pt.skillLvMax||99;
      const lvLocked = curLv < lvMin || curLv > lvMax;
      const lvText = lvMax>=99 ? `Lv${lvMin}+` : `Lv${lvMin}~${lvMax}`;

      // 스킬 해금 여부 - 채광만 lifeSkills 잠금 (채집/벌목은 항상 가능)
      const gatherLocked = false;
      const loggingLocked= false;
      const miningLocked = pt.skill==='mining'  && !(G.lifeSkills && G.lifeSkills['mining']);

      // 채광 스킬 없으면 완전히 숨김
      if(miningLocked){ el.style.display='none'; return; }

      const hasGImg = typeof GATHER_IMAGES !== 'undefined' && GATHER_IMAGES[pt.name];
      const iconEl = hasGImg
        ? `<img src="${GATHER_IMAGES[pt.name]}" style="width:1.8rem;height:1.8rem;object-fit:contain" draggable="false">`
        : `<span style="font-size:1.8rem;filter:grayscale(1)">${pt.icon}</span>`;

      if(gatherLocked || loggingLocked || miningLocked){
        const skillName2 = pt.skill==='gather'?'채집':pt.skill==='logging'?'벌목':'채광';
        card.style.opacity = '0.4';
        card.style.cursor = 'not-allowed';
        card.innerHTML = iconEl + `<div class="mtype-info"><div class="mtype-name">${pt.name}</div><div class="mtype-desc" style="font-size:.62rem;color:#e74c3c">🔒 ${skillName2} 스킬 필요 (신단수 퀘스트)</div></div>`;
      } else if(lvLocked){
        card.style.opacity = '0.4';
        card.style.cursor = 'not-allowed';
        card.innerHTML = iconEl + '<div class="mtype-info"><div class="mtype-name">' + pt.name + '</div><div class="mtype-desc" style="font-size:.62rem;color:#e74c3c">🔒 ' + skillName + ' ' + lvText + ' 필요 (현재 Lv' + curLv + ')</div></div>';
      } else {
        const normalIcon = hasGImg
          ? `<img src="${GATHER_IMAGES[pt.name]}" style="width:1.8rem;height:1.8rem;object-fit:contain" draggable="false">`
          : `<span style="font-size:1.8rem">${pt.icon}</span>`;
        card.innerHTML = normalIcon + '<div class="mtype-info"><div class="mtype-name">' + pt.name + '</div><div class="mtype-desc" style="font-size:.62rem;color:var(--text3)">' + skillName + ' ' + lvText + ' · 예상 ' + qty + '개</div></div>';
        card.onclick = () => {
          // 도구 체크 먼저 (맵 열기 전)
          const toolMap = {gather:'호미', logging:'도끼', mining:'곡괭이'};
          const needTool = toolMap[pt.skill];
          if(needTool){
            if(!G.equippedTools) G.equippedTools={gather:null,logging:null,mining:null};
            const eqIdx = G.equippedTools[pt.skill];
            const toolOk = eqIdx!=null && G.inventory[eqIdx]?.name===needTool && (G.inventory[eqIdx]?.dur||0)>0;
            if(!toolOk){
              const toolDesc = {'호미':'채집(풀·약초·열매)','도끼':'벌목(나무·대나무)','곡괭이':'채광(광석·석탄)'}[needTool]||'';
              const hasTool = G.inventory.some(i=>i&&i.name===needTool&&(i.dur||0)>0);
              if(hasTool){
                toast(`🪛 ${needTool} 미착용! 인벤토리에서 더블클릭으로 장착하세요.`);
                showGatherAlert(`🪛 ${needTool} 미착용!`,
                  `가방에 ${needTool}가 있지만 장착하지 않았습니다.\n\n` +
                  `【착용 방법】\n\n` +
                  `① 인벤토리 탭으로 이동\n` +
                  `② 가방에서 ${needTool} 더블클릭\n` +
                  `   또는 우클릭 → [장착] 선택\n\n` +
                  `③ 채집터로 돌아와 채집 시작\n\n` +
                  `💡 ${needTool}: ${toolDesc}`);
              } else {
                toast(`🪛 ${needTool}가 없습니다! 마을 대장간에서 구매하세요.`);
                showGatherAlert(`🪛 ${needTool}가 없습니다!`,
                  `【도구 착용 방법】\n\n` +
                  `① 마을 → 대장간 → [구매] 탭\n` +
                  `   ${needTool} 제작 (가방에 추가)\n\n` +
                  `② 인벤토리 탭으로 이동\n` +
                  `   가방에서 ${needTool} 더블클릭\n\n` +
                  `③ 채집터로 돌아와 채집 시작\n\n` +
                  `💡 ${needTool}: ${toolDesc}`);
              }
              return;
            }
          }
          openGatherMap(zone, pt.id);
        };
      }
    }
    el.appendChild(card);
  });
}

function openGatherMap(zone, startPointId){
  // 마지막 채집터 기록
  G.lastGatherZone = zone;
  // 사냥터 → 채집터로 왔다면 사냥터 버튼 표시
  _updateCrossBtn();

  // 광산 층 이동 버튼 표시/숨김
  const mineFloorBtns = document.getElementById('gm-mine-floors');
  if(mineFloorBtns){
    if(zone.id === 'mine'){
      mineFloorBtns.style.display = 'flex';
      // 현재 층 버튼 활성화 표시
      [1,2,3].forEach(f=>{
        const btn = document.getElementById(`gm-floor-${f}`);
        if(btn){
          if(f === G.mineFloor){
            btn.style.background = 'rgba(180,120,20,.9)';
            btn.style.borderColor = '#e8b84b';
            btn.style.color = '#fff';
          } else {
            btn.style.background = 'rgba(80,50,10,.7)';
            btn.style.borderColor = '#c9922a';
            btn.style.color = '#e8b84b';
          }
        }
      });
    } else {
      mineFloorBtns.style.display = 'none';
    }
  }

  const gm = document.getElementById('gathermap');
  gm.style.display = 'block';
  document.getElementById('gm-title').textContent = zone.name;
  updateGatherSkillHUD();
  const bgImg = document.getElementById('gmap-bg-img');
  const canvas = document.getElementById('gmap-canvas');
  if(typeof ZONE_BG !== 'undefined' && ZONE_BG[zone.bg]){
    bgImg.src = ZONE_BG[zone.bg]; bgImg.style.display = 'block'; canvas.style.display = 'none';
    // 광산이면 3층 구분선 오버레이 추가
    if(zone.bg === 'mine'){
      bgImg.style.display = 'block';
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      canvas.style.top = '0'; canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      const W = window.innerWidth, H = window.innerHeight;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,W,H);
      // 층 구분선
      const layers = [
        {y:0.45, label:'▼ 2층 (중층)'},
        {y:0.70, label:'▼ 3층 (심층)'},
      ];
      layers.forEach(({y, label})=>{
        const yPx = H * y;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,200,80,.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([12,8]);
        ctx.beginPath(); ctx.moveTo(0,yPx); ctx.lineTo(W,yPx); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = 'rgba(0,0,0,.55)';
        ctx.fillRect(4, yPx+4, 130, 22);
        ctx.fillStyle = '#ffcc44';
        ctx.font = '12px Malgun Gothic';
        ctx.fillText(label, 10, yPx+20);
      });
      // 층 레이블
      const floorLabels = ['1층 (지표층)', '2층 (중층)', '3층 (심층)'];
      const floorY = [0.1, 0.55, 0.78];
      floorLabels.forEach((lbl,i)=>{
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(W-110, H*floorY[i]-16, 106, 24);
        ctx.fillStyle = '#ffdd88';
        ctx.font = 'bold 13px Malgun Gothic';
        ctx.textAlign = 'right';
        ctx.fillText(lbl, W-6, H*floorY[i]+4);
        ctx.textAlign = 'left';
      });
    }
  } else {
    bgImg.style.display = 'none'; canvas.style.display = 'block';
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    // 구역별 배경색
    const bgColors = {
      field:   ['#2a4a10','#1a3a08'],
      forest:  ['#0d2a10','#0a1e0a'],
      deep:    ['#0a1a0d','#060e08'],
      mine:    ['#1a1208','#0d0a06'],
    };
    const cols = bgColors[zone.bg] || ['#1a3a10','#0a2008'];
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, cols[0]);
    grad.addColorStop(1, cols[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);
    // 광산이면 돌 질감 점 추가
    if(zone.bg === 'mine'){
      ctx.fillStyle = 'rgba(80,60,40,.3)';
      for(let i=0;i<200;i++){
        const x=Math.random()*W, y=Math.random()*H, r=Math.random()*8+2;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
    }
  }
  renderGatherMapPoints(zone.id);
  if(startPointId) setTimeout(()=>startGatherPointExec(zone.id, startPointId), 100);
}

function updateGatherSkillHUD(){
  const gs = G.gatherSkills;
  ['gather','logging','mining'].forEach(skill=>{
    const sk = gs[skill];
    const lv = document.getElementById(`gm-${skill}-lv`);
    const bar = document.getElementById(`gm-${skill}-bar`);
    const xp = document.getElementById(`gm-${skill}-xp`);
    const pct = Math.min(100, Math.floor((sk.xp % 100)));
    if(lv) lv.textContent = 'Lv' + sk.lv;
    if(bar) bar.style.width = pct + '%';
    if(xp) xp.textContent = pct + '%';
  });
  // 채집터 HP/MP 업데이트
  const c = G.char;
  const hv = document.getElementById('gm-hp-val');
  const hb = document.getElementById('gm-hp-bar');
  const mv = document.getElementById('gm-mp-val');
  const mb = document.getElementById('gm-mp-bar');
  if(hv) hv.textContent = `${c.hp}/${c.mhp}`;
  if(hb) hb.style.width = (c.hp/c.mhp*100)+'%';
  if(mv) mv.textContent = `${c.mp}/${c.mmp}`;
  if(mb) mb.style.width = (c.mp/c.mmp*100)+'%';
}

// 채집 포인트 DOM ID 생성 (한글 포함 ID 문제 방지)
function gmpId(ptId){
  return 'gmp_' + ptId.replace(/[^a-zA-Z0-9]/g, c => '_' + c.charCodeAt(0) + '_');
}

function renderGatherMapPoints(zoneId){
  const container = document.getElementById('gm-points');
  if(!container) return;
  container.innerHTML = '';
  const pts = GATHER_POINTS[zoneId] || [];
  // 광산이면 현재 층(mineFloor) skillLvMin만 표시
  const filteredPts = (zoneId === 'mine' && G.mineFloor)
    ? pts.filter(p => p.skillLvMin === G.mineFloor)
    : pts;

  const skillUnlock = {
    gather:  true,
    logging: true,
    mining:  G.lifeSkills && G.lifeSkills['mining'],
  };
  const zone = (typeof GATHER_ZONES !== 'undefined') ? GATHER_ZONES.find(z=>z.id===zoneId) : null;

  filteredPts.forEach(pt => {
    const state = G.gatherPointState[pt.id] || {status:'ready'};
    let isRegen = state.status === 'regen' && Date.now() < state.endTime;
    // 같은 berryGroup 중 하나라도 regen이면 이 포인트도 숨김
    if(!isRegen && pt.berryGroup){
      const allPts = Object.values(GATHER_POINTS).flat();
      isRegen = allPts.some(p=> p.berryGroup===pt.berryGroup && p.id!==pt.id &&
        (G.gatherPointState[p.id]||{}).status==='regen' && Date.now()<(G.gatherPointState[p.id].endTime||0));
    }
    const isActive = mapGatherPointId === pt.id;
    const isLocked = !skillUnlock[pt.skill]; // 잠금 여부

    // 레벨 조건 잠금 (먼저 선언)
    const sk2 = G.gatherSkills[pt.skill]||{lv:1};
    const lvLocked2 = (
      (pt.skillLvMin && sk2.lv < pt.skillLvMin) ||
      (pt.skillLvMax && sk2.lv > pt.skillLvMax)
    );
    const skillName2 = pt.skill==='gather'?'채집':(pt.skill==='logging'?'벌목':'채광');
    const lvText2 = (pt.skillLvMax||99)>=99 ? `Lv${pt.skillLvMin||1}+` : `Lv${pt.skillLvMin||1}~${pt.skillLvMax}`;

    const el = document.createElement('div');
    el.id = gmpId(pt.id);
    el.style.cssText = `position:absolute;left:${pt.pos.x}%;top:${pt.pos.y}%;transform:translate(-50%,-50%);display:${isRegen?'none':'flex'};flex-direction:column;align-items:center;gap:2px;cursor:${(isLocked||lvLocked2)?'not-allowed':'pointer'};z-index:10`;

    const iconStyle = (isLocked || lvLocked2)
      ? 'font-size:2.4rem;filter:grayscale(1) opacity(.4) drop-shadow(0 3px 10px rgba(0,0,0,.9))'
      : 'font-size:2.4rem;filter:drop-shadow(0 3px 10px rgba(0,0,0,.9))';

    const labelColor = isLocked ? '#888' : lvLocked2 ? '#e74c3c' : isActive ? '#6abf4a' : '#c8e6a0';
    const labelText = isLocked ? `🔒 사부 습득 필요`
                    : lvLocked2 ? `🔒 ${skillName2} ${lvText2}`
                    : pt.name;
    const labelBg = (isLocked || lvLocked2) ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.7)';

    // 아이콘: GATHER_IMAGES에 이미지가 있으면 img 태그, 없으면 이모지
    // noRegen 포인트는 배경 이미지에 이미 식물이 그려져 있으므로 아이콘 숨김
    const hasImg = typeof GATHER_IMAGES !== 'undefined' && GATHER_IMAGES[pt.name];
    const isMine = zone && zone.id === 'mine';
    const iconSize = isMine ? '6rem' : '4.8rem';
    const imgSize = isMine ? '120px' : '76px';
    const iconHtml = pt.hiddenIcon
      ? ``
      : hasImg
        ? `<img src="${GATHER_IMAGES[pt.name]}" style="${pt.iconH ? `height:${pt.iconH};width:auto` : `width:${imgSize};height:${imgSize}`};object-fit:contain;${(isLocked||lvLocked2)?'filter:grayscale(1) opacity(.4)':''}" draggable="false">`
        : `<div style="${iconStyle.replace('2.4rem', iconSize)}">${pt.icon}</div>`;

    // hiddenIcon 포인트는 투명 클릭 영역만 (이미지에 식물이 이미 그려져 있음)
    if(pt.hiddenIcon){
      el.style.cssText = `position:absolute;left:${pt.pos.x}%;top:${pt.pos.y}%;transform:translate(-50%,-50%);width:160px;height:180px;cursor:pointer;z-index:10`;
      el.innerHTML = `<div style="width:100%;height:100%;border-radius:8px"></div>
        <div style="position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);font-size:.78rem;color:#c8e6a0;background:rgba(0,0,0,.65);padding:.1rem .5rem;border-radius:3px;white-space:nowrap;font-weight:600">${pt.name}</div>`;
    } else {
      el.innerHTML = `
        ${iconHtml}
        <div style="font-size:.85rem;color:${labelColor};background:${labelBg};padding:.15rem .5rem;border-radius:3px;white-space:nowrap;font-weight:600">${labelText}</div>
      `;
    }

    if(!isRegen){
      el.onclick = (e) => {
        e.stopPropagation();
        if(isLocked){
          showGatherAlert('채광 스킬이 없습니다!', '마을 → 생활 스킬 사부에게\n채광 스킬을 배우세요.\n(Lv2 + 500냥)');
          return;
        }
        if(lvLocked2){
          showGatherAlert(`🔒 레벨 부족!`, `${pt.name}은(는) ${skillName2} ${lvText2} 필요\n현재 ${skillName2} Lv${sk2.lv}`);
          return;
        }
        // 채집 중이면 대기열에 등록
        if(_gather.timer){
          if(_gather.pointId === pt.id){
            gatherBoost(); // 같은 포인트면 단축
          } else {
            _gather.nextPointId = pt.id; // 다른 포인트면 대기열 교체
            _gather.stopAfter = false;
            toast(`${pt.name} 대기 중...`);
          }
          return;
        }
        gatherStart(zoneId, pt.id);
      };
    }
    container.appendChild(el);
  });
}

function startGatherPointExec(zoneId, pointId){
  if(mapGatherTimer){ clearInterval(mapGatherTimer); mapGatherTimer = null; }
  if(mapGatherPointId && mapGatherPointId !== pointId){
    const oldEl = document.getElementById(gmpId(mapGatherPointId));
    if(oldEl) oldEl.style.animation = '';
    mapGatherPointId = null;
  }
  const pts = GATHER_POINTS[zoneId] || [];
  const pt = pts.find(p => p.id === pointId);
  if(!pt) return;
  const state = G.gatherPointState[pt.id] || {status:'ready'};
  if(state.status === 'regen' && Date.now() < state.endTime){ toast('리젠 중입니다!'); return; }

  // 광산이면 현재 층(mineFloor) 광석인지 확인
  if(zoneId === 'mine' && G.mineFloor && pt.skillLvMin !== G.mineFloor){
    toast('이 층의 광석이 아닙니다!');
    return;
  }
  if(pt.skill === 'mining' && !(G.lifeSkills && G.lifeSkills['mining'])){
    showGatherAlert('채광 스킬이 없습니다!',
      '마을 → 생활 스킬 사부에게\n채광 스킬을 배우세요.\n(Lv2 + 500냥)');
    return;
  }

  // ── 도구 체크 (채집 시작 전) ──
  const toolMap3 = {gather:'호미', mining:'곡괭이', logging:'도끼'};
  const toolMap3alt = {gather:'돌호미', mining:'돌곡괭이', logging:'돌도끼'};
  const needTool = toolMap3[pt.skill];
  if(!G.equippedTools) G.equippedTools={gather:null,logging:null,mining:null};
  let toolItem = null;
  const equippedIdx = G.equippedTools[pt.skill];
  // 해당 스킬 슬롯에 착용된 도구 (호미/돌호미, 곡괭이/돌곡괭이, 도끼/돌도끼 모두 허용)
  if(equippedIdx!=null){
    const inv = G.inventory[equippedIdx];
    if(inv && (inv.name===toolMap3[pt.skill] || inv.name===toolMap3alt[pt.skill]) && (inv.dur||0)>0){
      toolItem = inv;
    }
  }
  // 슬롯에 착용 안 했거나 도구가 없는 경우
  const hasTool = G.inventory.some(i=>i&&i.name===needTool&&(i.dur||0)>0);
  if(!toolItem){
    const toolDesc = {'호미':'채집(풀·약초·열매)','도끼':'벌목(나무·대나무)','곡괭이':'채광(광석·석탄)'}[needTool]||'';
    if(hasTool){
      // 가방엔 있지만 슬롯에 미착용
      showGatherAlert(`🪛 ${needTool} 미착용!`,
        `가방에 ${needTool}가 있지만 장착하지 않았습니다.\n\n` +
        `【착용 방법】\n\n` +
        `① 인벤토리 탭으로 이동\n` +
        `② 가방에서 ${needTool} 더블클릭\n` +
        `   또는 우클릭 → [장착] 선택\n` +
        `   → 채집 도구 슬롯에 장착!\n\n` +
        `③ 채집터로 돌아와 채집 시작\n\n` +
        `💡 ${needTool}: ${toolDesc}`);
    } else {
      // 아예 없는 경우
      showGatherAlert(`🪛 ${needTool}가 없습니다!`,
        `【도구 착용 방법】\n\n` +
        `① 마을 → 대장간 → [구매] 탭\n` +
        `   ${needTool} 제작 (가방에 추가)\n\n` +
        `② 인벤토리 탭으로 이동\n` +
        `   가방에서 ${needTool} 더블클릭\n` +
        `   또는 우클릭 → [장착] 선택\n` +
        `   → 채집 도구 슬롯 자동 장착!\n\n` +
        `③ 채집터로 돌아와 채집 시작\n\n` +
        `💡 ${needTool}: ${toolDesc}`);
    }
    return;
  }
  if((toolItem.dur||0) <= 0){
    if(toolItem.repairable === false){
      showGatherAlert(`🪛 ${needTool} 파손!`,
        `지급 도구는 수리가 불가합니다.\n\n` +
        `【해결 방법】\n` +
        `마을 → 대장간 → [구매] 탭\n` +
        `새 ${needTool} 구매 후 인벤토리에서\n더블클릭으로 장착하세요.`);
    } else {
      showGatherAlert(`🪛 ${needTool} 파손!`,
        `내구도가 0이 되었습니다.\n\n` +
        `【해결 방법】\n` +
        `A) 마을 → 대장간 → [수리] 탭에서 수리\n` +
        `B) 마을 → 대장간 → [제작] 탭에서 새 제작\n\n` +
        `제작 후 인벤토리에서 더블클릭으로 장착!`);
    }
    return;
  }

  mapGatherPointId = pointId;
  _gatherZoneId2 = zoneId;
  _gatherPointId2 = pointId;
  _gatherRemaining = 5000; // 5초
  _gatherStartRemain = 5000;
  _gatherClickCount = 0;

  // 기존 채집 중이던 포인트 게이지 강제 제거
  document.querySelectorAll('.gmp-bar-wrap').forEach(b=>b.remove());
  document.querySelectorAll('[id^="gmp_"]').forEach(e=>e.style.animation='');

  // 채집물 아래에 진행바 표시
  const el = document.getElementById(gmpId(pointId));
  if(el){
    // noRegen 포인트는 위치 고정 - pulse 애니메이션 적용 안 함
    if(!pt.noRegen) el.style.animation = 'gather-pulse .6s infinite alternate';
    // 기존 진행바 제거 후 새로 추가
    let bar = el.querySelector('.gmp-bar-wrap');
    if(!bar){
      bar = document.createElement('div');
      bar.className = 'gmp-bar-wrap';
      bar.style.cssText = 'width:135px;height:15px;background:rgba(0,0,0,.6);border-radius:7px;margin-top:6px;overflow:hidden;border:1px solid rgba(255,255,255,.2)';
      const inner = document.createElement('div');
      inner.className = 'gmp-bar-inner';
      inner.style.cssText = 'height:100%;background:linear-gradient(90deg,#2a8a3a,#4aaf5a);width:0%;transition:width .25s';
      bar.appendChild(inner);
      el.appendChild(bar);
    }
    el.querySelector('.gmp-bar-inner').style.width = '0%';
  }

  // 중앙 팝업은 숨김 (채집물 아래 바로 표시)
  const popup = document.getElementById('gm-popup');
  if(popup) popup.style.display = 'none';

  mapGatherTimer = setInterval(()=>{
    _gatherRemaining = Math.max(0, _gatherRemaining - 300);
    const pct = 100 - (_gatherRemaining / _gatherStartRemain * 100);
    // 채집물 아래 바 업데이트
    const ptEl = document.getElementById(gmpId(pointId));
    if(ptEl){
      const inner = ptEl.querySelector('.gmp-bar-inner');
      if(inner) inner.style.width = pct + '%';
    }
    if(_gatherRemaining <= 0){ clearInterval(mapGatherTimer); mapGatherTimer = null; finishGatherPointExec(zoneId, pointId); }
  }, 300);
}

function clickGatherBoost(){
  const now = Date.now();
  if(now - _gatherClickWindowStart > 1000){ _gatherClickCount = 0; _gatherClickWindowStart = now; }
  if(_gatherClickCount >= 2) return;
  _gatherClickCount++;
  _gatherRemaining = Math.max(0, _gatherRemaining - 500);
  const pct = 100 - (_gatherRemaining / _gatherStartRemain * 100);
  // 채집물 아래 바 업데이트
  const ptEl = document.getElementById(gmpId(_gatherPointId2));
  if(ptEl){
    const inner = ptEl.querySelector('.gmp-bar-inner');
    if(inner) inner.style.width = pct + '%';
  }
  if(_gatherRemaining <= 0 && mapGatherTimer){ clearInterval(mapGatherTimer); mapGatherTimer = null; finishGatherPointExec(_gatherZoneId2, _gatherPointId2); }
}

function finishGatherPointExec(zoneId, pointId){
  const pts = GATHER_POINTS[zoneId] || [];
  const pt = pts.find(p => p.id === pointId);
  if(!pt) return;

  const sk = G.gatherSkills[pt.skill] || {lv:1,xp:0};

  // ── 열매 처리 (fixedQty=1, 스킬 레벨 조건 체크) ──
  if(pt.fixedQty){
    const curLv = sk.lv;
    const minOk = !pt.skillLvMin || curLv >= pt.skillLvMin;
    const maxOk = !pt.skillLvMax || curLv <= pt.skillLvMax;
    if(!minOk || !maxOk){
      const needMin = pt.skillLvMin||1, needMax = pt.skillLvMax||99;
      toast(`🔒 ${pt.name}: 채집 Lv${needMin}~${needMax} 필요 (현재 Lv${curLv})`);
    } else {
      // 열매 인벤토리에 추가
      const bIcon = {'🍎붉은열매':'🍎','🫐청열매':'🫐','🍓산딸기':'🍓','🍇오디':'🍇','🍑영험한열매':'🍑','🔮신령열매':'🔮'}[pt.icon+pt.name]||pt.icon;
      const existing = G.inventory.find(x=>x&&x.name===pt.name&&x.type==='berry');
      if(existing){ existing.qty = Math.min(999, (existing.qty||1)+1); }
      else { addToInventory({name:pt.name, icon:pt.icon, type:'berry', qty:1}); }
      // 마지막 채집 열매 이름 기억 (교대 채집용)
      G.lastBerryName = pt.name;
      // 채집 통계 수집
      if(!G.gatherStats) G.gatherStats={itemCount:{},totalGather:0,toolUse:{}};
      G.gatherStats.itemCount[pt.name] = (G.gatherStats.itemCount[pt.name]||0) + 1;
      G.gatherStats.totalGather = (G.gatherStats.totalGather||0) + 1;
      const effect = BERRY_EFFECTS[pt.name];
      toast(`${pt.icon} ${pt.name} 획득! ${effect?effect.desc:''}`);
      renderInv();

      // 같은 berryGroup의 모든 포인트 동시 리젠 처리
      if(pt.berryGroup){
        const regenEnd = Date.now() + pt.regenTime*1000;
        Object.values(GATHER_POINTS).forEach(zone=>{
          zone.forEach(p=>{
            if(p.berryGroup === pt.berryGroup && p.id !== pointId){
              G.gatherPointState[p.id] = {status:'regen', endTime: regenEnd};
              // 맵에서 숨기기
              const el2 = document.getElementById(gmpId(p.id));
              if(el2){ el2.style.display='none'; el2.style.animation='';
                const bw=el2.querySelector('.gmp-bar-wrap'); if(bw) bw.remove(); }
              // 리젠 후 나타나기
              setTimeout(()=>{
                G.gatherPointState[p.id] = {status:'ready'};
                const e2 = document.getElementById(gmpId(p.id));
                if(e2) e2.style.display='flex';
                if(G.curGatherZone) renderGatherItemList(G.curGatherZone);
              }, pt.regenTime*1000);
            }
          });
        });
      }
    }
  } else {
    // 일반 채집물 레벨 조건 체크
    const curLv = sk.lv;
    const minOk = !pt.skillLvMin || curLv >= pt.skillLvMin;
    const maxOk = !pt.skillLvMax || curLv <= pt.skillLvMax;
    if(!minOk || !maxOk){
      const needMin = pt.skillLvMin||1, needMax = pt.skillLvMax>=99 ? '∞' : pt.skillLvMax||'∞';
      const skillName = pt.skill==='gather'?'채집':(pt.skill==='logging'?'벌목':'채광');
      toast(`🔒 ${pt.name}: ${skillName} Lv${needMin}~${needMax} 필요 (현재 Lv${curLv})`);
      return;
    }
    // 일반 채집물 획득 - 새 시스템: 숙련도(xp) 기반
    const curXp = (G.gatherSkills[pt.skill]||{xp:0}).xp || 0;
    const qty = pt.fixedQty ? 1 : getGatherQty(curXp, sk.lv, pt.skillLvMin);
    const matName = pt.resultName || pt.name;
    G.mats[matName] = (G.mats[matName]||0) + qty;
    // 채집 통계 수집
    if(!G.gatherStats) G.gatherStats={itemCount:{},totalGather:0,toolUse:{}};
    G.gatherStats.itemCount[pt.name] = (G.gatherStats.itemCount[pt.name]||0) + qty;
    G.gatherStats.totalGather = (G.gatherStats.totalGather||0) + 1;
    // 역사 기록 - 최초 채집만
    const skillTypeKor = {gather:'채집',mining:'채광',logging:'벌목'}[pt.skill]||'채집';
    if(!G.gatherStats.firstTime) G.gatherStats.firstTime = {};
    if(!G.gatherStats.firstTime[pt.name]){
      G.gatherStats.firstTime[pt.name] = true;
      addHistory(skillTypeKor, `${pt.name} 최초 ${skillTypeKor} 성공`);
    }
    toast('✅ ' + pt.icon + ' ' + matName + ' ×' + qty + ' 획득!');
  }

  // 도구 내구도 소모 (toolName2를 여기서 선언)
  const toolName2 = {gather:'호미', mining:'곡괭이', logging:'도끼'}[pt.skill];
  if(!G.gatherSkills[pt.skill]) G.gatherSkills[pt.skill]={lv:1,xp:0};
  if(!G.gatherStats) G.gatherStats={itemCount:{},totalGather:0,toolUse:{}};
  if(toolName2) G.gatherStats.toolUse[toolName2] = (G.gatherStats.toolUse[toolName2]||0) + 1;

  if(toolName2){
    const eqIdx = G.equippedTools?.[pt.skill];
    const ti = (eqIdx!=null && G.inventory[eqIdx]?.name===toolName2) ? G.inventory[eqIdx] : null;
    if(ti){
      ti.dur = Math.max(0,(ti.dur||0)-1);
      if(ti.dur<=0){
        // 레벨업과 동시 발생 여부 체크 (레벨업 시 합쳐서 팝업 표시)
        const lv2 = G.gatherSkills[pt.skill].lv;
        let needCount2;
        if(lv2===1) needCount2=200;
        else if(lv2===2) needCount2=400;
        else if(lv2===3) needCount2=800;
        else if(lv2===4) needCount2=1200;
        else if(lv2===5) needCount2=1600;
        else if(lv2===6) needCount2=2000;
        else if(lv2===7) needCount2=2500;
        else needCount2 = 2500 + (lv2-7)*500;
        const gain2 = Math.round((100/needCount2)*1000)/1000;
        const willLevelUp = G.gatherSkills[pt.skill].xp + gain2 >= 100;
        if(!willLevelUp){
          if(ti.repairable===true){
            showLevelUpPopup(`🔧 ${ti.name} 파손!`, `내구도가 0이 됐습니다.\n마을 → 대장간 → [수리] 탭에서\n수리하세요.`);
          } else {
            showLevelUpPopup(`⚠️ ${ti.name} 파손!`, `내구도가 0이 됐습니다.\n마을 → 대장간 → [구매] 탭에서\n새 ${ti.name}를 구매하세요.`);
          }
        }
        const idx=G.inventory.indexOf(ti);
        if(idx!==-1) G.inventory[idx]=null; // splice 대신 null로 → 인덱스 밀림 방지
        G.equippedTools[pt.skill]=null;
        renderEquipSlots();
      } else if(ti.repairable===true && (ti.dur===20||ti.dur===10||ti.dur===5)){
        showLevelUpPopup(`🔧 ${ti.name} 수리 필요!`, `내구도가 ${ti.dur} 남았습니다.\n마을 → 대장간 → [수리] 탭에서\n수리하세요.`);
      }
    }
  }

  // 새 채집 레벨/숙련도 시스템
  // 숙련도(xp): 채집 1번 = +1, 100이 되면 레벨업
  if(!G.gatherSkills[pt.skill]) G.gatherSkills[pt.skill]={lv:1,xp:0};
  G.gatherSkills[pt.skill].xp = (G.gatherSkills[pt.skill].xp||0) + 1;

  if(G.gatherSkills[pt.skill].xp >= 100){
    G.gatherSkills[pt.skill].xp = 0;
    G.gatherSkills[pt.skill].lv++;
    const skillName = pt.skill==='gather'?'채집':(pt.skill==='logging'?'벌목':'채광');
    const newLv = G.gatherSkills[pt.skill].lv;
    showLevelUpPopup(`⛏ ${skillName} Lv${newLv}!`, `${skillName} 숙련도가 올랐습니다!\n숙련도 50 이상 시 2개 채집!`);
    addHistory('레벨업', `${skillName} 스킬이 Lv${newLv}이 되었다.`);
    updateGatherHUD && updateGatherHUD();
  }

  // noRegen 아이템: 리젠 없이 즉시 같은 포인트 자동 재채집
  if(pt.noRegen){
    G.gatherPointState[pointId] = {status:'ready'};
    // 변수 초기화 먼저 (자동 재시작 조건 체크에 필요)
    mapGatherPointId = null; _gatherPointId2 = '';
    const el2 = document.getElementById(gmpId(pointId));
    if(el2) el2.style.display = 'flex';
    if(G.curGatherZone) renderGatherItemList(G.curGatherZone);
    updateGatherSkillHUD();
    renderSkillList();
    renderMats();
    saveGame();
    // 300ms 후 같은 포인트 자동 재시작
    const thisPointId = pointId;
    const thisZoneId = G.curGatherZone?.id;
    setTimeout(()=>{
      if(!G.curGatherZone) return;
      if(document.getElementById('gathermap')?.style.display === 'none') return;
      if(mapGatherPointId || _gatherPointId2) return; // 다른 포인트 채집 중이면 중단
      // 도구 체크만 하고 조용히 재시작 (alert 없이)
      const pts2 = GATHER_POINTS[thisZoneId] || [];
      const pt2 = pts2.find(p=>p.id===thisPointId);
      if(!pt2) return;
      const eqIdx2 = G.equippedTools?.[pt2.skill];
      const inv2 = (eqIdx2!=null) ? G.inventory[eqIdx2] : null;
      if(!inv2 || (inv2.dur||0)<=0) return; // 도구 없거나 파손 - 조용히 중단
      startGatherPointExec(thisZoneId, thisPointId);
    }, 300);
    return;
  } else {
    G.gatherPointState[pointId] = {status:'regen', endTime: Date.now() + (pt.regenTime||15)*1000};
  }
  mapGatherPointId = null; _gatherPointId2 = '';
  document.getElementById('gm-popup').style.display = 'none';

  // 채집 맵 포인트 즉시 숨기기
  const el = document.getElementById(gmpId(pointId));
  if(el){
    el.style.display = 'none';
    el.style.animation = '';
    const barWrap = el.querySelector('.gmp-bar-wrap');
    if(barWrap) barWrap.remove();
  }

  // 채집 목록 즉시 갱신
  if(G.curGatherZone) renderGatherItemList(G.curGatherZone);

  // 리젠 카운트다운 (채집 목록용 + 완료 시 포인트 복원)
  const _regenRefresh = setInterval(()=>{
    const st = G.gatherPointState[pointId];
    if(!st || st.status!=='regen' || Date.now() >= st.endTime){
      clearInterval(_regenRefresh);
      G.gatherPointState[pointId] = {status:'ready'};
      // 채집 맵에서 포인트 다시 표시
      const el2 = document.getElementById(gmpId(pointId));
      if(el2) el2.style.display = 'flex';
      if(G.curGatherZone) renderGatherItemList(G.curGatherZone);
    } else {
      if(G.curGatherZone) renderGatherItemList(G.curGatherZone);
    }
  }, 500);

  // 내구도 0 체크
  if(toolName2){
    const tiCheck = G.inventory.find(i=>i&&i.name===toolName2&&i.repairable!==false);
    if(tiCheck && (tiCheck.dur||0) <= 0) showDurabilityAlert(toolName2, false);
  }
  updateGatherSkillHUD();
  renderSkillList();
  renderMats();
  if(G.curGatherZone) renderGatherItemList(G.curGatherZone);
  saveGame();
}

// exitGatherMap, cancelGatherMap → gather.js에서 처리

function toggleGatherInv(){
  const ov = document.getElementById('gather-inv-overlay');
  const isOpen = ov.style.display !== 'none';
  if(isOpen){ ov.style.display='none'; return; }
  ov.style.display = 'block';
  renderGatherInvOverlay();
}

function renderGatherInvOverlay(){
  // 장착 도구
  const equipEl = document.getElementById('gather-inv-equip');
  if(equipEl){
    const tools = ['gather','logging','mining'];
    const toolName = {gather:'호미',logging:'도끼',mining:'곡괭이'};
    equipEl.innerHTML = tools.map(s=>{
      const idx = G.equippedTools?.[s];
      const ti = (idx!=null && G.inventory[idx]) ? G.inventory[idx] : null;
      const durPct = ti ? Math.round(ti.dur/ti.maxDur*100) : 0;
      return `<div style="flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:.3rem;text-align:center;font-size:.65rem">
        ${ti ? (ti.icon && ti.icon.startsWith('images/') ? `<img src="${ti.icon}" style="width:2rem;height:2rem;object-fit:contain">` : `<span style="font-size:1.2rem">${ti.icon||'🔧'}</span>`) : `<span style="color:var(--text3)">${toolName[s]}</span>`}
        ${ti ? `<div style="color:var(--text2);font-size:.6rem">${ti.name}</div><div style="height:3px;background:var(--bg3);border-radius:2px;margin-top:2px"><div style="height:100%;width:${durPct}%;background:${durPct>50?'#4a8':'#e74c3c'};border-radius:2px"></div></div>` : ''}
      </div>`;
    }).join('');
  }

  // 인벤토리 슬롯
  const slotsEl = document.getElementById('gather-inv-slots');
  if(slotsEl){
    slotsEl.innerHTML = G.inventory.map((item,idx)=>{
      if(!item) return `<div style="aspect-ratio:1;background:var(--bg2);border:1px solid var(--border);border-radius:4px"></div>`;
      const icon = item.icon && item.icon.startsWith('images/')
        ? `<img src="${item.icon}" style="width:2rem;height:2rem;object-fit:contain">`
        : `<span style="font-size:1.3rem">${item.icon||'📦'}</span>`;
      return `<div onclick="showItemContextMenu(${idx},event)" style="aspect-ratio:1;background:var(--bg2);border:1px solid var(--border2);border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;padding:.2rem;font-size:.6rem;color:var(--text2)">
        ${icon}
        <div style="font-size:.58rem;text-align:center;line-height:1.2;margin-top:2px">${item.name}</div>
      </div>`;
    }).join('');
  }
}

(()=>{
  const s = document.createElement('style');
  s.textContent = '@keyframes gather-pulse{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.15)}}';
  document.head.appendChild(s);
})();

// ── 채집 스페이스바 단축 ───────────────────────────
document.addEventListener('keydown', (e)=>{
  if(e.code === 'Space'){
    // 버튼에 포커스가 있으면 포커스 해제 (자동채집 버튼 오작동 방지)
    if(document.activeElement && document.activeElement.tagName === 'BUTTON'){
      document.activeElement.blur();
    }
    if(mapGatherTimer && _gatherPointId2){
      e.preventDefault();
      clickGatherBoost();
    }
  }
  // 숫자키 1: HP 슬롯 열매, 숫자키 2: MP 슬롯 열매
  if(e.code === 'Digit1' && !e.ctrlKey && !e.altKey){
    const name = G.berrySlots?.[0];
    if(name){ e.preventDefault(); useBerry(name); renderBerrySlots(); }
  }
  if(e.code === 'Digit2' && !e.ctrlKey && !e.altKey){
    const name = G.berrySlots?.[1];
    if(name){ e.preventDefault(); useBerry(name); renderBerrySlots(); }
  }
});

// ── 내구도 0 알림 ───────────────────────────────────
function showDurabilityAlert(toolName, isGift){
  const overlay = document.createElement('div');
  overlay.id = 'dur-alert';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
  const msg = isGift
    ? `지급 도구는 수리 불가합니다.\n마을 대장간 → 구매 탭에서\n새 ${toolName}를 구매하세요.`
    : `마을 대장간 → 수리 탭에서 수리하거나\n구매 탭에서 새 ${toolName}를 구매하세요.`;
  overlay.innerHTML = `
    <div style="background:#110d08;border:2px solid #c0392b;border-radius:8px;padding:1.4rem 1.8rem;text-align:center;max-width:280px">
      <div style="font-size:2rem;margin-bottom:.5rem">🔧</div>
      <div style="font-size:.95rem;font-weight:600;color:#e74c3c;margin-bottom:.5rem">${toolName} 파손!</div>
      <div style="font-size:.72rem;color:#ccc;line-height:1.7;white-space:pre-line;margin-bottom:1rem">${msg}</div>
      <button onclick="document.getElementById('dur-alert').remove()" style="padding:.45rem 1.4rem;background:rgba(100,50,10,.8);border:1px solid #c9922a;color:#e8b84b;border-radius:5px;cursor:pointer;font-size:.82rem">확인</button>
    </div>`;
  document.body.appendChild(overlay);
}

// ── 레벨업/스킬업 중앙 팝업 ───────────────────────────
function showLevelUpPopup(msg, sub){
  // 기존 팝업 제거
  const existing = document.getElementById('levelup-popup');
  if(existing) existing.remove();

  if(!G.ptsPending) G.ptsPending = {};
  if(!G.ptsUsed) G.ptsUsed = 0;

  const ptsD=[
    {k:'체력', d:'HP+10', key:'mhp'},
    {k:'내공', d:'MP+5',  key:'mmp'},
    {k:'공격', d:'ATK+2', key:'atk'},
    {k:'방어', d:'DEF+2', key:'def'},
    {k:'회피', d:'+0.1%', key:'ev'},
    {k:'관통', d:'+0.1%', key:'pen'},
    {k:'운',   d:'+0.2%', key:'luck'},
  ];

  function renderPtsUI(){
    const c = G.char;
    const pp = G.ptsPending;
    const remain = c.pts - (G.ptsUsed||0);
    return `
      <div style="margin:.8rem 0;font-size:1rem;color:var(--gold2);text-align:center">
        잔여 포인트: <b id="lup-pts-remain" style="color:#e8b84b;font-size:1.2rem">${remain}</b>
      </div>
      <div style="display:flex;flex-direction:column;gap:.4rem;margin-bottom:.8rem">
        ${ptsD.map(p=>`
        <div style="display:flex;align-items:center;gap:.6rem">
          <span style="font-size:1rem;color:var(--text3);width:46px">${p.k}</span>
          <span style="font-size:.85rem;color:#888;flex:1">${p.d}</span>
          <span style="font-size:1rem;color:#e8b84b;min-width:28px;text-align:center" id="lup-val-${p.key}">${pp[p.key]||0}</span>
          <button onclick="lupAddPts('${p.key}')"
            style="padding:.25rem .7rem;font-size:.9rem;background:rgba(30,80,30,.8);border:1px solid #2a8a3a;color:#6abf4a;border-radius:4px;cursor:pointer">+</button>
          <button onclick="lupSubPts('${p.key}')"
            style="padding:.25rem .7rem;font-size:.9rem;background:rgba(80,30,10,.7);border:1px solid #7a4a1a;color:#e07040;border-radius:4px;cursor:pointer">−</button>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:.6rem">
        <button onclick="lupConfirm()" style="flex:1;padding:.55rem;font-size:1rem;background:rgba(30,80,30,.8);border:1px solid #2a8a3a;color:#6abf4a;border-radius:5px;cursor:pointer;font-weight:600">✅ 확정</button>
        <button onclick="lupClose()" style="flex:1;padding:.55rem;font-size:1rem;background:rgba(20,20,40,.8);border:1px solid #3a5a9a;color:#6a8ab0;border-radius:5px;cursor:pointer">나중에</button>
      </div>`;
  }

  const overlay = document.createElement('div');
  overlay.id = 'levelup-popup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div id="levelup-box" style="background:#0a0e1a;border:2px solid #e8b84b;border-radius:12px;padding:2rem 2.8rem;text-align:center;max-width:560px;width:95%;box-shadow:0 0 40px rgba(232,184,75,.3)">
      <div style="font-size:3rem;margin-bottom:.5rem">⭐</div>
      <div style="font-size:1.6rem;font-weight:700;color:#e8b84b;margin-bottom:.4rem">${msg}</div>
      <div style="font-size:1rem;color:#aaa;margin-bottom:1rem;white-space:pre-line">${sub||''}</div>
      <div id="lup-pts-area">${G.char.pts > 0 ? renderPtsUI() : '<button onclick="lupClose()" style="padding:.6rem 2.4rem;background:rgba(120,80,10,.9);border:1px solid #e8b84b;color:#e8b84b;border-radius:6px;cursor:pointer;font-size:1rem;font-weight:600">확인</button>'}</div>
    </div>`;
  document.body.appendChild(overlay);
}


// ────── 09_craft.js ──────
