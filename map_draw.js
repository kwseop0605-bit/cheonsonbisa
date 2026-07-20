// ── 천손비사 맵/몬스터 렌더링 모듈 (map_draw.js) ──────────
// cheonson.html에서 분리됨

// ────── 04_map_draw.js ──────
// ═══════════════════════════════════════
// 04_map_draw
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 04_map_draw
// ═══════════════════════════════════════

// 몬스터 위치 - 파란선 영역(x:25~95, y:50~78)에 랜덤 분포
const FM_MON_POS=[
  // 캐릭터(좌측 ~15%)와 하단 UI를 피해 3줄 배치
  {x:30, y:28},  // 1번: 뒷줄 좌
  {x:50, y:25},  // 2번: 뒷줄 중앙
  {x:70, y:28},  // 3번: 뒷줄 우
  {x:88, y:30},  // 4번: 뒷줄 맨우
  {x:25, y:48},  // 5번: 중간줄 좌
  {x:45, y:45},  // 6번: 중간줄 중앙좌
  {x:65, y:48},  // 7번: 중간줄 중앙우
  {x:85, y:45},  // 8번: 중간줄 우
  {x:35, y:62},  // 9번: 앞줄 좌
  {x:60, y:60},  // 10번: 앞줄 우
];

// 열매 빠른 슬롯 렌더링
function renderBerrySlots(){
  const el = document.getElementById('berry-slots');
  if(!el) return;
  if(!G.berrySlots) G.berrySlots=[null,null];
  el.innerHTML = [
    {idx:0, label:'HP', color:'#e74c3c'},
    {idx:1, label:'MP', color:'#3a8ae8'},
  ].map(({idx,label,color})=>{
    const name = G.berrySlots[idx];
    const ef = name ? BERRY_EFFECTS[name] : null;
    const berryItem = name ? G.inventory.find(x=>x&&x.name===name&&x.type==='berry') : null;
    const count = berryItem ? (berryItem.qty||1) : 0;
    const ptIcon = name ? (Object.values(GATHER_POINTS).flat().find(p=>p.name===name)?.icon||'🍎') : '';
    const hasItem = count > 0;
    const border = name ? color : 'rgba(255,255,255,.15)';
    return `<div onclick="useBerrySlot(${idx})" ondblclick="event.stopPropagation();clearBerrySlot(${idx})"
      style="width:72px;height:72px;background:rgba(20,15,5,.85);border:2px solid ${border};
             border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;
             cursor:pointer;position:relative;transition:border .15s;${!hasItem&&name?'opacity:.4':''}">
      <span style="font-size:.72rem;color:${color};font-weight:700;margin-bottom:2px">${label}</span>
      ${name
        ? `<span style="font-size:1.8rem;line-height:1">${ptIcon}</span>
           <span style="font-size:.65rem;color:${hasItem?'#e8b84b':'#888'};margin-top:2px">${hasItem?'×'+count:'없음'}</span>`
        : `<span style="font-size:1.4rem;color:rgba(255,255,255,.2)">＋</span>`
      }
    </div>`;
  }).join('');
}

function useBerrySlot(slotIdx){
  if(!G.berrySlots) G.berrySlots=[null,null,null];
  const name = G.berrySlots[slotIdx];
  if(!name){ showBerryRegisterPopup(slotIdx); return; }
  useBerry(name);
  renderBerrySlots();
}

function clearBerrySlot(slotIdx){
  if(!G.berrySlots) G.berrySlots=[null,null,null];
  G.berrySlots[slotIdx]=null;
  renderBerrySlots(); saveGame();
  toast(`슬롯 ${slotIdx+1} 해제`);
}

function showBerryRegisterPopup(slotIdx){
  closeItemPopup();
  const slotType = slotIdx===0 ? 'hp' : 'mp';
  const slotName = slotIdx===0 ? 'HP 회복' : 'MP 회복';
  // 해당 슬롯 타입에 맞는 열매만 필터링
  const berries = G.inventory.filter(x=>x&&x.type==='berry'&&BERRY_EFFECTS[x.name]?.type===slotType);
  if(!berries.length){ toast(`보유한 ${slotName} 열매가 없습니다!`); return; }
  const unique = [...new Map(berries.map(b=>[b.name,b])).values()];
  const overlay = document.createElement('div');
  overlay.id='item-popup';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.onclick=closeItemPopup;
  const box=document.createElement('div');
  box.style.cssText='background:#110d08;border:1px solid #c9922a;border-radius:8px;padding:1rem 1.3rem;max-width:260px;width:90%';
  box.onclick=e=>e.stopPropagation();
  box.innerHTML=`
    <div style="font-size:.85rem;font-weight:700;color:#e8b84b;margin-bottom:.6rem">🍎 ${slotName} 열매 등록</div>
    <div style="display:flex;flex-direction:column;gap:.3rem">
      ${unique.map(b=>{
        const ef=BERRY_EFFECTS[b.name];
        const cnt=G.inventory.filter(x=>x&&x.name===b.name&&x.type==='berry').length;
        return `<button class="btn" style="display:flex;align-items:center;gap:.5rem;padding:.35rem .6rem;text-align:left;width:100%"
          onclick="registerBerrySlot(${slotIdx},'${b.name}')">
          <span style="font-size:1.2rem">${b.icon}</span>
          <div><div style="font-size:.72rem;font-weight:600">${b.name} ×${cnt}</div>
          <div style="font-size:.6rem;color:var(--text3)">${ef?.desc||''}</div></div>
        </button>`;
      }).join('')}
    </div>
    <button class="btn" style="width:100%;margin-top:.5rem;font-size:.65rem" onclick="closeItemPopup()">취소</button>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function registerBerrySlot(slotIdx, name){
  if(!G.berrySlots) G.berrySlots=[null,null,null];
  G.berrySlots[slotIdx]=name;
  closeItemPopup(); renderBerrySlots(); saveGame();
  const sn = slotIdx===0?'HP':'MP';
  toast(`${sn} 슬롯 → ${name} 등록!`);
}

function openFullMap(){
  const fm=document.getElementById('fullmap');
  fm.style.display='block';
  const zid=G.curZone.id+'_'+G.curMonType.id;
  const bc=G.bossCounter[zid]||0;
  document.getElementById('fm-title').textContent=`${G.curZone.name} — ${G.curMonType.name}`;
  document.getElementById('fm-counter').textContent=`보스까지 ${bc}/50`;
  document.getElementById('fm-player-name').textContent=G.char.name;

  // 캐릭터 이미지 (사냥터=battle, 채집터=normal)
  const psvg=document.getElementById('fm-player-svg');
  const gender = G.char.gender||'남';
  const isBattle = document.getElementById('fullmap')?.style.display !== 'none';
  const charKey = `${gender}_${isBattle?'battle':'normal'}`;
  if(typeof CHAR_IMAGES !== 'undefined' && CHAR_IMAGES[charKey]){
    psvg.innerHTML = `<image href="${CHAR_IMAGES[charKey]}" x="0" y="0" width="60" height="80" preserveAspectRatio="xMidYMid meet"/>`;
  } else {
    drawChar(psvg, G.char.gender, G.char.body);
  }

  // 캐릭터 초기 위치 (좌측 중앙)
  const player=document.getElementById('fm-player');
  player.style.left='10%';
  player.style.top='62%';

  // 배경 그리기
  drawFullMapBg();
  updateFmHUD();
  renderFmMonsters();
  renderFmSkills();
  renderBerrySlots();
  const nonBasic = G.skills.filter(sk=>sk.id!=='punch');
  const anyAutoSkill = nonBasic.some(sk=>sk.auto);
  const skillBtn = document.getElementById('auto-skill-btn');
  const skillLbl = document.getElementById('auto-skill-label');
  if(skillBtn){
    skillBtn.style.background = anyAutoSkill?'rgba(10,60,10,.9)':'rgba(10,40,20,.85)';
    skillBtn.style.borderColor = anyAutoSkill?'#4abf4a':'#2a7a3a';
    skillBtn.style.color = anyAutoSkill?'#8fff8f':'#6abf4a';
  }
  if(skillLbl) skillLbl.textContent = anyAutoSkill?'ON':'OFF';

  // 자동전투 버튼 상태 복원
  const autoBtn = document.getElementById('auto-battle-btn');
  const autoLbl = document.getElementById('auto-battle-label');
  if(autoBattle){
    if(autoBtn){ autoBtn.style.background='rgba(10,50,20,.85)'; autoBtn.style.borderColor='#2a8a3a'; autoBtn.style.color='#6abf4a'; }
    if(autoLbl) autoLbl.textContent='ON';
    // 자동전투 ON 상태로 진입하면 즉시 몬스터 자동 선택
    if(curMonIdx<0) setTimeout(autoSelectMonster, 500);
  } else {
    if(autoBtn){ autoBtn.style.background='rgba(10,20,50,.85)'; autoBtn.style.borderColor='#2a3a8a'; autoBtn.style.color='#6a8ab0'; }
    if(autoLbl) autoLbl.textContent='OFF';
  }
  updateFmExitBtn();
}

function drawFullMapBg(){
  const zid=G.curZone.id;

  // 배경 이미지가 있으면 img 태그 사용
  const bgImg=document.getElementById('map-bg-img');
  const canvas=document.getElementById('map-canvas');
  if(typeof ZONE_BG!=='undefined' && ZONE_BG[zid]){
    bgImg.src=ZONE_BG[zid];
    bgImg.style.display='block';
    canvas.style.display='none';
    return;
  }
  bgImg.style.display='none';
  canvas.style.display='block';

  const W=window.innerWidth, H=window.innerHeight;
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d');

  if(zid==='field'){
    // ── 들판: 실사 사진 스타일 ──────────────────────

    // 1. 하늘 (회청색 흐린 하늘)
    const skyGrd=ctx.createLinearGradient(0,0,0,H*0.38);
    skyGrd.addColorStop(0,'#b8cce0');
    skyGrd.addColorStop(0.5,'#c8daea');
    skyGrd.addColorStop(1,'#d5e8d8');
    ctx.fillStyle=skyGrd; ctx.fillRect(0,0,W,H*0.38);

    // 2. 구름
    function drawCloud(x,y,w,h,alpha){
      ctx.save(); ctx.globalAlpha=alpha;
      ctx.fillStyle='#f0f4f8';
      [[-0.3,0,0.5],[0,-.15,0.4],[0.25,-.05,0.45],[-.1,.05,0.35],[0.15,.08,0.3]].forEach(([ox,oy,r])=>{
        ctx.beginPath(); ctx.ellipse(x+ox*w,y+oy*h,w*r,h*0.38,0,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();
    }
    drawCloud(W*.12,H*.07,180,55,0.6);
    drawCloud(W*.38,H*.05,220,50,0.5);
    drawCloud(W*.65,H*.09,160,45,0.55);
    drawCloud(W*.85,H*.06,130,40,0.45);

    // 3. 산 능선 (멀리, 청록색)
    const mountGrd=ctx.createLinearGradient(0,H*.15,0,H*.38);
    mountGrd.addColorStop(0,'#4a6e5a');
    mountGrd.addColorStop(1,'#6a8e6a');
    ctx.fillStyle=mountGrd;
    ctx.beginPath();
    ctx.moveTo(0,H*.38);
    const mPts=[
      [0,H*.28],[W*.08,H*.18],[W*.15,H*.22],[W*.22,H*.16],[W*.3,H*.2],
      [W*.38,H*.15],[W*.45,H*.19],[W*.52,H*.17],[W*.6,H*.22],
      [W*.68,H*.16],[W*.75,H*.2],[W*.82,H*.18],[W*.9,H*.23],[W*.95,H*.21],[W,H*.24],[W,H*.38]
    ];
    ctx.moveTo(0,H*.38);
    mPts.forEach(([x,y])=>ctx.lineTo(x,y));
    ctx.fill();

    // 산 위 나무 실루엣
    const treeGrd=ctx.createLinearGradient(0,H*.1,0,H*.38);
    treeGrd.addColorStop(0,'#2a4a35');
    treeGrd.addColorStop(1,'#3a5e45');
    ctx.fillStyle=treeGrd;
    ctx.beginPath(); ctx.moveTo(0,H*.38);
    const tPts=[
      [0,H*.32],[W*.05,H*.25],[W*.07,H*.28],[W*.1,H*.23],[W*.13,H*.27],
      [W*.16,H*.24],[W*.19,H*.26],[W*.22,H*.22],[W*.26,H*.26],
      [W*.3,H*.23],[W*.33,H*.27],[W*.37,H*.24],[W*.41,H*.26],
      [W*.45,H*.23],[W*.48,H*.27],[W*.52,H*.24],[W*.56,H*.26],
      [W*.6,H*.22],[W*.63,H*.26],[W*.67,H*.24],[W*.71,H*.27],
      [W*.75,H*.23],[W*.79,H*.26],[W*.83,H*.24],[W*.87,H*.27],
      [W*.91,H*.25],[W*.95,H*.28],[W,H*.3],[W,H*.38]
    ];
    ctx.moveTo(0,H*.38);
    tPts.forEach(([x,y])=>ctx.lineTo(x,y));
    ctx.fill();

    // 4. 중간 나무숲 띠
    const midGrd=ctx.createLinearGradient(0,H*.35,0,H*.48);
    midGrd.addColorStop(0,'#2d5e38');
    midGrd.addColorStop(1,'#3a7048');
    ctx.fillStyle=midGrd;
    ctx.fillRect(0,H*.36,W,H*.12);

    // 개별 나무 (중간 숲)
    for(let i=0;i<28;i++){
      const tx=W*(i/27), ty=H*(.34+Math.sin(i*1.3)*.02);
      const th=H*(.06+Math.abs(Math.sin(i*.7))*.04);
      const tw=W*.018;
      // 나무 실루엣
      ctx.fillStyle=`rgba(${20+i%4*5},${55+i%5*7},${25+i%3*5},0.9)`;
      ctx.beginPath();
      ctx.moveTo(tx-tw,ty+th);
      ctx.quadraticCurveTo(tx-tw*.3,ty+th*.3,tx,ty);
      ctx.quadraticCurveTo(tx+tw*.3,ty+th*.3,tx+tw,ty+th);
      ctx.fill();
    }

    // 5. 측백나무 (뾰족한, 줄지어)
    [.12,.18,.26,.33,.55,.62,.7,.78,.88].forEach((xr,i)=>{
      const tx=W*xr, ty=H*.36;
      const h2=H*(0.1+i%3*.025);
      const w2=W*.012;
      // 측백나무 그라디언트
      const cGrd=ctx.createLinearGradient(tx-w2,0,tx+w2,0);
      cGrd.addColorStop(0,'#1a4a28');
      cGrd.addColorStop(0.4,'#2a6a38');
      cGrd.addColorStop(1,'#1a4a28');
      ctx.fillStyle=cGrd;
      ctx.beginPath();
      ctx.moveTo(tx,ty-h2);
      ctx.lineTo(tx-w2,ty);
      ctx.lineTo(tx+w2,ty);
      ctx.fill();
      // 하이라이트
      ctx.fillStyle='rgba(80,160,60,0.25)';
      ctx.beginPath();
      ctx.moveTo(tx,ty-h2);
      ctx.lineTo(tx-w2*.3,ty-h2*.3);
      ctx.lineTo(tx+w2*.1,ty-h2*.5);
      ctx.fill();
    });

    // 6. 가까운 잔디 (밝고 넓게)
    const grassGrd=ctx.createLinearGradient(0,H*.45,0,H);
    grassGrd.addColorStop(0,'#6dc42a');
    grassGrd.addColorStop(0.3,'#78d030');
    grassGrd.addColorStop(0.7,'#5eb820');
    grassGrd.addColorStop(1,'#4aaa18');
    ctx.fillStyle=grassGrd; ctx.fillRect(0,H*.45,W,H*.55);

    // 잔디 결 (원근감)
    for(let row=0;row<18;row++){
      const y=H*(.46+row*.03);
      const alpha=0.04+row*.01;
      const spacing=8+row*3;
      for(let x=0;x<W;x+=spacing){
        ctx.fillStyle=`rgba(0,60,0,${alpha})`;
        ctx.fillRect(x,y,1,2+row*.3);
      }
    }

    // 잔디 밝은 선 (하이라이트)
    for(let row=0;row<10;row++){
      const y=H*(.5+row*.04);
      for(let x=row%2*15;x<W;x+=30+row*5){
        ctx.fillStyle=`rgba(180,255,80,${0.06+row*.005})`;
        ctx.fillRect(x,y,4+row,1);
      }
    }

    // 7. 원근 어둠 (앞쪽)
    const fogGrd=ctx.createLinearGradient(0,H*.45,0,H*.5);
    fogGrd.addColorStop(0,'rgba(100,160,80,0.3)');
    fogGrd.addColorStop(1,'transparent');
    ctx.fillStyle=fogGrd; ctx.fillRect(0,H*.45,W,H*.08);

    // 8. 전봇대/가로등 (사진에 있는)
    [.4,.46,.52,.58,.64].forEach((xr,i)=>{
      const lx=W*xr, ly=H*.38;
      ctx.strokeStyle='rgba(80,80,60,0.7)';
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx,ly+H*.07); ctx.stroke();
      // 등 달린 부분
      ctx.beginPath(); ctx.moveTo(lx,ly+H*.01); ctx.lineTo(lx+W*.015,ly+H*.01); ctx.stroke();
      ctx.fillStyle='rgba(255,240,180,0.5)';
      ctx.beginPath(); ctx.arc(lx+W*.015,ly+H*.01,W*.004,0,Math.PI*2); ctx.fill();
    });

  }else if(zid==='forest'){
    // ── 숲속 ──────────────────────────────────────
    const skyGrd2=ctx.createLinearGradient(0,0,0,H*.3);
    skyGrd2.addColorStop(0,'#4a6e3a');
    skyGrd2.addColorStop(1,'#2a4a20');
    ctx.fillStyle=skyGrd2; ctx.fillRect(0,0,W,H*.3);

    // 숲 바닥
    const floorGrd=ctx.createLinearGradient(0,H*.3,0,H);
    floorGrd.addColorStop(0,'#1e3812');
    floorGrd.addColorStop(1,'#2a4a18');
    ctx.fillStyle=floorGrd; ctx.fillRect(0,H*.3,W,H*.7);

    // 바닥 질감
    for(let y=H*.3;y<H;y+=18){
      for(let x=0;x<W;x+=18){
        if((Math.floor(x/18)+Math.floor(y/18))%3===0){
          ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(x,y,18,18);
        }
      }
    }

    // 나무 (크고 많이)
    const treeXs=[.04,.12,.2,.28,.36,.44,.52,.6,.68,.76,.84,.92,.08,.24,.4,.56,.72,.88];
    const treeYs=[.08,.12,.06,.1,.09,.07,.11,.08,.1,.07,.09,.08,.3,.28,.32,.29,.31,.27];
    treeXs.forEach((xr,i)=>{
      const tx=W*xr, ty=H*treeYs[i], tr=28+i%4*8;
      ctx.fillStyle='rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(tx+4,ty+tr+8,tr*.7,10,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#3a1a08'; ctx.fillRect(tx-6,ty+tr*.4,12,tr*.6);
      const c1=`rgb(${15+i%4*6},${45+i%5*9},${8+i%3*5})`;
      const c2=`rgb(${22+i%4*5},${58+i%5*8},${12+i%3*4})`;
      ctx.fillStyle=c1; ctx.beginPath(); ctx.arc(tx,ty,tr,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=c2; ctx.beginPath(); ctx.arc(tx+5,ty-tr*.35,tr*.7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(120,220,60,0.15)';
      ctx.beginPath(); ctx.arc(tx-tr*.2,ty-tr*.1,tr*.4,0,Math.PI*2); ctx.fill();
    });

    // 빛줄기
    [.2,.5,.8].forEach(xr=>{
      const grd=ctx.createLinearGradient(W*xr,0,W*xr+40,H);
      grd.addColorStop(0,'rgba(200,255,150,0.08)');
      grd.addColorStop(0.6,'rgba(200,255,150,0.03)');
      grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd;
      ctx.beginPath();
      ctx.moveTo(W*xr,0); ctx.lineTo(W*xr+25,0);
      ctx.lineTo(W*xr+60,H); ctx.lineTo(W*xr+35,H);
      ctx.fill();
    });

    // 낙엽
    ['#8a5010','#a06820','#784008'].forEach((c,ci)=>{
      for(let i=0;i<40;i++){
        const lx=(ci*W/3)+Math.sin(i*1.7)*W*.28+W*.15;
        const ly=H*.35+Math.cos(i*2.1)*H*.3+H*.2;
        ctx.save(); ctx.translate(lx,ly); ctx.rotate(i*.8);
        ctx.fillStyle=c+'cc';
        ctx.beginPath(); ctx.ellipse(0,0,4+i%3,2+i%2,0,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
    });

  }else{
    // ── 깊은산: 동굴/바위 ──────────────────────────
    const bgGrd=ctx.createLinearGradient(0,0,0,H);
    bgGrd.addColorStop(0,'#0e101c');
    bgGrd.addColorStop(1,'#181a28');
    ctx.fillStyle=bgGrd; ctx.fillRect(0,0,W,H);

    // 바닥 돌판
    for(let y=0;y<H;y+=30){
      for(let x=0;x<W;x+=40){
        const v=(Math.sin(x*.1)*Math.cos(y*.1)+1)*8;
        ctx.fillStyle=`rgb(${28+v},${30+v},${46+v})`;
        ctx.fillRect(x,y,39,29);
        ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=1;
        ctx.strokeRect(x,y,40,30);
      }
    }

    // 큰 바위들
    [[.08,.15,30,20],[.22,.08,40,25],[.45,.12,35,22],[.68,.1,42,28],[.85,.16,28,18],
     [.15,.55,38,24],[.38,.48,32,20],[.6,.52,45,28],[.8,.58,35,22]].forEach(([xr,yr,rw,rh])=>{
      const rx=W*xr, ry=H*yr;
      const g=ctx.createLinearGradient(rx-rw,ry-rh,rx+rw,ry+rh);
      g.addColorStop(0,'#3a3e58'); g.addColorStop(0.5,'#2e3248'); g.addColorStop(1,'#22263a');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.ellipse(rx,ry,rw,rh,.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.ellipse(rx-rw*.2,ry-rh*.25,rw*.28,rh*.2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(rx+rw*.15,ry+rh*.2,rw*.35,rh*.15,0,0,Math.PI*2); ctx.fill();
    });

    // 동굴 천장 종유석
    for(let i=0;i<15;i++){
      const sx=W*(i/14), sh=H*(.05+Math.sin(i*1.4)*.04);
      ctx.fillStyle='#1a1c2e';
      ctx.beginPath();
      ctx.moveTo(sx-W*.025,0);
      ctx.lineTo(sx+W*.025,0);
      ctx.lineTo(sx+W*.008,sh);
      ctx.lineTo(sx-W*.008,sh);
      ctx.fill();
    }

    // 횃불 (현실감있게)
    [[.15,.1],[.5,.07],[.85,.12],[.3,.85],[.7,.8]].forEach(([xr,yr],fi)=>{
      const lx=W*xr, ly=H*yr;
      // 벽 받침대
      ctx.fillStyle='#4a3a20';
      ctx.fillRect(lx-6,ly+12,12,5);
      ctx.fillRect(lx-2,ly+8,4,16);
      // 불꽃 (레이어)
      [['rgba(255,220,50,0.9)',6],['rgba(255,150,20,0.8)',5],
       ['rgba(255,80,10,0.7)',4],['rgba(200,40,0,0.5)',3]].forEach(([c,r],li)=>{
        ctx.fillStyle=c;
        ctx.beginPath();
        ctx.moveTo(lx,ly-r*2.5);
        ctx.quadraticCurveTo(lx+r,ly,lx,ly+r*.5);
        ctx.quadraticCurveTo(lx-r,ly,lx,ly-r*2.5);
        ctx.fill();
      });
      // 빛 번짐
      const grd=ctx.createRadialGradient(lx,ly,0,lx,ly,110);
      grd.addColorStop(0,'rgba(255,180,40,0.18)');
      grd.addColorStop(0.4,'rgba(200,100,20,0.08)');
      grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd; ctx.fillRect(lx-110,ly-110,220,220);
    });

    // 이끼
    for(let i=0;i<20;i++){
      const mx=W*(i/19+Math.sin(i)*0.03);
      const my=H*(.3+Math.cos(i*1.3)*.25+.2);
      ctx.fillStyle=`rgba(15,${50+i%3*10},12,0.5)`;
      ctx.beginPath(); ctx.ellipse(mx,my,12+i%5*3,5+i%3*2,Math.sin(i),0,Math.PI*2); ctx.fill();
    }
  }
}
function updateFmHUD(){
  const c=G.char;
  document.getElementById('fm-hp-bar').style.width=(c.hp/c.mhp*100)+'%';
  document.getElementById('fm-hp-val').textContent=`${c.hp}/${c.mhp}`;
  document.getElementById('fm-mp-bar').style.width=(c.mp/c.mmp*100)+'%';
  document.getElementById('fm-mp-val').textContent=`${c.mp}/${c.mmp}`;
  // 경험치 바
  const xpNeeded = Math.round(100 * Math.pow(2, c.lv-1));
  const xpPct = Math.min(100, Math.floor(c.xp / xpNeeded * 100));
  const xpBar = document.getElementById('fm-xp-bar');
  const xpVal = document.getElementById('fm-xp-val');
  if(xpBar) xpBar.style.width = xpPct + '%';
  if(xpVal) xpVal.textContent = `${c.xp}/${xpNeeded}`;
  // 급소 현황
  const mid3 = G.curMonType?.id||'';
  const vf = G.vitalFound?.[mid3]||[];
  const vEl = document.getElementById('fm-vital');
  if(vEl){
    if(vf.length===0) vEl.textContent='⚡ 급소 미파악';
    else vEl.textContent=`⚡ 급소 ${vf.length}/6 (+${vf.length*5}%)`;
    vEl.style.color = vf.length>=6?'#ff8f4a':vf.length>0?'#e8b84b':'#888';
  }
}

function renderFmMonsters(){
  if(!G.curMonType) return;
  const zid=G.curZone.id+'_'+G.curMonType.id;
  const mons=G.zoneMonsters[zid]||[];
  const alive=mons.filter(m=>!m.dead).length;
  document.getElementById('fm-counter').textContent=`보스까지 ${G.bossCounter[zid]||0}/50  |  생존 ${alive}/10`;

  const container=document.getElementById('fm-monsters');
  container.innerHTML='';
  const W=window.innerWidth, H=window.innerHeight;

  mons.forEach((m,i)=>{
    const pos=FM_MON_POS[i]||{x:Math.random()*80+5,y:Math.random()*50+10};
    const px=pos.x/100*W, py=pos.y/100*H;

    const wrap=document.createElement('div');
    wrap.id=`fm-mon-${i}`;
    // dead면 완전히 숨김
    wrap.style.cssText=`position:absolute;left:${px}px;top:${py}px;transform:translate(-50%,-50%);display:${m.dead?'none':'flex'};flex-direction:column;align-items:center;gap:2px;transition:transform .15s;z-index:5`;

    // SVG — 보스면 더 크게
    const svgDiv=document.createElement('div');
    const svgSize = m.isBoss ? 'width:156px;height:174px' : 'width:108px;height:120px';
    const bossGlow = m.isBoss ? ';filter:drop-shadow(0 0 20px #c0392b) drop-shadow(0 4px 10px rgba(0,0,0,.9))' : '';
    svgDiv.style.cssText=`${svgSize};${m.dead?'filter:grayscale(1);opacity:.3':'filter:drop-shadow(0 4px 10px rgba(0,0,0,.9))'+bossGlow}${i===curMonIdx&&!m.isBoss?';filter:drop-shadow(0 0 16px #c0392b)':''}`;
    svgDiv.innerHTML=getMonsterSVG(m.id, m.dead, i===curMonIdx && !m.dead);

    // HP바
    const hpW=document.createElement('div');
    const hpBarW = m.isBoss ? '132px' : '90px';
    hpW.style.cssText=`width:${hpBarW};height:${m.isBoss?'7px':'4px'};background:rgba(0,0,0,.6);border-radius:3px;overflow:hidden`;
    const hpF=document.createElement('div');
    hpF.id=`fm-mhp-${i}`;
    hpF.style.cssText=`height:100%;width:${m.dead?0:Math.round(m.hp/m.maxHp*100)}%;background:${m.hp/m.maxHp>.5?'#2a8a3a':m.hp/m.maxHp>.25?'#c9922a':'#c0392b'};border-radius:3px;transition:width .3s`;
    hpW.appendChild(hpF);

    // 이름
    const lbl=document.createElement('div');
    lbl.id=`fm-mlbl-${i}`;
    lbl.style.cssText=`font-size:${m.isBoss?'.72rem':'.65rem'};color:${m.isBoss?'#e74c3c':'#e8d090'};background:rgba(0,0,10,.8);padding:.15rem .45rem;border-radius:3px;white-space:nowrap;font-weight:600${m.isBoss?';border:1px solid #c0392b':''}`;
    lbl.textContent = m.isBoss ? `💀 ${m.name}` : m.name;

    wrap.appendChild(svgDiv);
    wrap.appendChild(hpW);
    wrap.appendChild(lbl);

    if(!m.dead){
      wrap.style.cursor='pointer';
      // 보스는 맵 중앙에 고정
      if(m.isBoss){
        wrap.style.left = (window.innerWidth*0.55)+'px';
        wrap.style.top  = (window.innerHeight*0.52)+'px';
        wrap.style.zIndex = '20';
      }
      wrap.onmouseover=()=>{if(i!==curMonIdx)wrap.style.transform='translate(-50%,-50%) scale(1.05)'};
      wrap.onmouseout=()=>{if(i!==curMonIdx)wrap.style.transform='translate(-50%,-50%) scale(1)'};
      wrap.onclick=()=>startBattle(i);
    }
    container.appendChild(wrap);
  });
}

function renderFmSkills(){
  const el=document.getElementById('fm-skills'); el.innerHTML='';
  G.skills.forEach(sk=>{
    const isBasic=sk.id==='punch';
    const isAuto=sk.auto;
    const onCd=sk.cd>0;
    const noMp=sk.mp>G.char.mp;
    const isHealSk = sk.special==='heal' || sk.special==='mp_heal';
    const disabled = noMp || (curMonIdx<0 && !isHealSk);

    const btn=document.createElement('button');
    btn.style.cssText=`
      padding:.5rem .9rem;
      background:${isBasic?'rgba(20,40,80,.85)':isAuto?'rgba(10,40,20,.85)':'rgba(40,20,10,.85)'};
      border:1px solid ${isBasic?'#2a5aaa':isAuto?'#2a7a3a':'#7a4a1a'};
      color:${disabled&&!onCd?'#555':isBasic?'#8aaad0':isAuto?'#6abf4a':'#c9922a'};
      cursor:${disabled?'not-allowed':'pointer'};
      border-radius:4px;font-size:.78rem;font-family:var(--font-body);
      position:relative;overflow:hidden;transition:all .15s;
      min-width:80px;
      ${onCd?'opacity:.7':''}
    `;
    btn.innerHTML=`
      <div style="font-size:1.2rem">${sk.icon}</div>
      <div style="font-weight:600;margin-top:.1rem">${sk.name}</div>
      <div style="font-size:.6rem;color:${isBasic?'#6a8ab0':isAuto?'#4a9a3a':'#9a7030'};margin-top:.1rem">
        ${isBasic?'자동(기본)':isAuto?'자동':'수동'} ${sk.mp>0?'| 내공'+sk.mp:''}
      </div>
      ${onCd?`<div style="position:absolute;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:#fff">${sk.cd}</div>`:''}
    `;
    if(!disabled&&!onCd){
      btn.onmouseover=()=>btn.style.opacity='.85';
      btn.onmouseout=()=>btn.style.opacity='1';
    }
    btn.onclick=()=>{
      if(onCd){toast(`쿨타임 ${sk.cd}초!`);return;}
      // 클릭 시점의 실시간 내공 체크
      if(sk.mp > G.char.mp){toast('내공 부족!');return;}
      // 회복 스킬(기공심법/운기조식)은 전투 없이도 사용 가능
      if(sk.special==='heal' || sk.special==='mp_heal'){
        useSkillOutOfCombat(sk.id);
        return;
      }
      if(curMonIdx<0){toast('몬스터를 먼저 클릭하세요!');return;}
      useSkill(sk, false); // 수동 클릭 → 즉시 반격
    };
    el.appendChild(btn);
  });
}

// 공격 이펙트 (캐릭터 → 몬스터 방향으로 번쩍임)
function showAttackEffect(monIdx, isCrit){
  const zid=G.curZone.id+'_'+G.curMonType.id;
  const pos=FM_MON_POS[monIdx]||{x:50,y:30};
  const W=window.innerWidth, H=window.innerHeight;
  const px=pos.x/100*W, py=pos.y/100*H;

  const eff=document.getElementById('fm-effect');
  eff.style.cssText=`position:absolute;left:${px}px;top:${py}px;transform:translate(-50%,-50%);pointer-events:none;display:flex;align-items:center;justify-content:center;font-size:${isCrit?'2rem':'1.5rem'};animation:eff-pop .4s ease-out forwards;z-index:20`;
  eff.textContent=isCrit?'💥':'⚡';
  eff.style.display='flex';
  setTimeout(()=>eff.style.display='none',400);

  // 캐릭터 → 몬스터 방향 이동 애니메이션
  const player=document.getElementById('fm-player');
  const baseX=10, baseY=62;
  const midX=baseX+(pos.x-baseX)*0.3;
  const midY=baseY+(pos.y-baseY)*0.3;
  player.style.transition='left .15s,top .15s';
  player.style.left=midX+'%';
  player.style.top=midY+'%';
  setTimeout(()=>{
    player.style.left=baseX+'%';
    player.style.top=baseY+'%';
  },200);
}

function exitFullMap(){
  if(battleTimer){clearInterval(battleTimer);battleTimer=null;}
  if(enemyTimer){clearInterval(enemyTimer);enemyTimer=null;}
  if(autoSelectTimer){clearTimeout(autoSelectTimer);autoSelectTimer=null;}
  curMonIdx=-1; autoBattle=false;
  // 사냥터 나갈 때 모든 몬스터 체력 풀회복 (보스 제외)
  const zid = G.curZone?.id && G.curMonType?.id ? G.curZone.id+'_'+G.curMonType.id : null;
  if(zid && G.zoneMonsters[zid]){
    G.zoneMonsters[zid].forEach(m=>{
      if(!m.isBoss) m.hp = m.maxHp;
    });
  }
  // HP/MP는 현재 상태 그대로 유지 (자동으로 채우지 않음)
  updateHUD();
  document.getElementById('fullmap').style.display='none';
  document.getElementById('view-battle').style.display='none';
  document.getElementById('view-mtype').style.display='block';
  G.curMonType=null;
  updateFmExitBtn();
  saveGame();
}

// 나가기/도망 버튼 상태 업데이트
function updateFmExitBtn(){
  const btn = document.getElementById('fm-exit-btn');
  if(!btn) return;
  if(curMonIdx >= 0 && battleTimer){
    // 전투 중 → 도망 버튼
    btn.textContent = '🏃 도망';
    btn.style.borderColor = '#c9922a';
    btn.style.color = '#e8b84b';
  } else {
    // 전투 외 → 나가기 버튼
    btn.textContent = '← 나가기';
    btn.style.borderColor = '';
    btn.style.color = 'var(--text2)';
  }
}

// 나가기/도망 처리
function tryExitFullMap(){
  if(curMonIdx >= 0 && battleTimer){
    // 전투 중 → 도망 시도 (30% 성공)
    if(Math.random() < 0.3){
      addLog('🏃 도망 성공!');
      toast('🏃 도망에 성공했습니다!');
      exitFullMap();
    } else {
      addLog('❌ 도망 실패! 계속 싸워야 합니다...');
      toast('❌ 도망 실패!');
    }
  } else {
    // 전투 외 → 바로 나가기
    exitFullMap();
  }
}

function addLog(msg){
  const el=document.getElementById('fm-log');
  if(!el) return;
  const d=document.createElement('div'); d.textContent=msg;
  el.appendChild(d);
  while(el.children.length>5) el.removeChild(el.firstChild);
  el.scrollTop=el.scrollHeight;
}

function goBack(to){
  if(battleTimer){clearInterval(battleTimer);battleTimer=null;}
  curMonIdx=-1;
  if(to==='zone'){
    document.getElementById('view-mtype').style.display='none';
    document.getElementById('view-battle').style.display='none';
    document.getElementById('view-zone').style.display='block';
    G.curZone=null; G.curMonType=null;
  } else if(to==='mtype'){
    document.getElementById('view-battle').style.display='none';
    document.getElementById('view-mtype').style.display='block';
    G.curMonType=null;
  }
  saveGame();
}

// 사냥터 배경 SVG
function drawZoneBg(zoneId){
  const svg=document.getElementById('zone-bg');
  const bgs={
    field:`
      <rect width="100%" height="100%" fill="#0a1a05"/>
      <rect x="0" y="60%" width="100%" height="40%" fill="#0d2008"/>
      <rect x="0" y="65%" width="100%" height="35%" fill="#0f2a0a"/>
      ${[...Array(30)].map((_,i)=>`<rect x="${i*4}%" y="${55+Math.sin(i)*5}%" width="${2+Math.random()*2}%" height="${8+Math.random()*6}%" rx="1" fill="#1a3a0a" opacity="${.6+Math.random()*.4}"/>`).join('')}
      ${[...Array(15)].map((_,i)=>`<ellipse cx="${i*7+Math.random()*5}%" cy="${62+Math.random()*8}%" rx="${3+Math.random()*3}%" ry="${2+Math.random()*2}%" fill="#2a5a0a" opacity="${.4+Math.random()*.3}"/>`).join('')}
      <ellipse cx="50%" cy="15%" rx="8%" ry="6%" fill="#c9c9aa" opacity=".08"/>
      <ellipse cx="70%" cy="10%" rx="5%" ry="4%" fill="#c9c9aa" opacity=".05"/>
    `,
    forest:`
      <rect width="100%" height="100%" fill="#050e05"/>
      <rect x="0" y="50%" width="100%" height="50%" fill="#081208"/>
      ${[...Array(20)].map((_,i)=>`
        <rect x="${i*6-1}%" y="${10+Math.random()*30}%" width="${4+Math.random()*3}%" height="${35+Math.random()*20}%" rx="1" fill="#0d1f0d"/>
        <ellipse cx="${i*6+1}%" cy="${10+Math.random()*30}%" rx="${5+Math.random()*3}%" ry="${8+Math.random()*5}%" fill="#1a3a10" opacity=".8"/>
      `).join('')}
      ${[...Array(8)].map((_,i)=>`<ellipse cx="${i*14+5}%" cy="${55+Math.random()*10}%" rx="${6+Math.random()*4}%" ry="${3+Math.random()*2}%" fill="#0f2a0a" opacity=".5"/>`).join('')}
    `,
    deep:`
      <rect width="100%" height="100%" fill="#05080e"/>
      <rect x="0" y="40%" width="100%" height="60%" fill="#080a10"/>
      ${[...Array(12)].map((_,i)=>`
        <polygon points="${i*9}%,100% ${i*9+2}%,${30+Math.random()*20}% ${i*9+5}%,100%" fill="#0d1020" opacity=".8"/>
        <polygon points="${i*9+1}%,100% ${i*9+3}%,${35+Math.random()*15}% ${i*9+6}%,100%" fill="#141828" opacity=".6"/>
      `).join('')}
      ${[...Array(6)].map((_,i)=>`<ellipse cx="${i*18+5}%" cy="${42+Math.random()*8}%" rx="${8+Math.random()*5}%" ry="${4+Math.random()*3}%" fill="#0a0e1a" opacity=".6"/>`).join('')}
      <ellipse cx="30%" cy="20%" rx="6%" ry="4%" fill="#c9922a" opacity=".04"/>
      <ellipse cx="75%" cy="25%" rx="4%" ry="3%" fill="#c9922a" opacity=".03"/>
    `,
    mine:`
      <rect width="100%" height="100%" fill="#0a0806"/>
      <rect x="0" y="55%" width="100%" height="45%" fill="#0d0a06"/>
      ${[...Array(8)].map((_,i)=>`
        <rect x="${i*14}%" y="${20+Math.random()*20}%" width="${10+Math.random()*5}%" height="${60+Math.random()*20}%" fill="#1a1208" opacity=".9"/>
      `).join('')}
      ${[...Array(15)].map((_,i)=>`
        <ellipse cx="${Math.random()*100}%" cy="${40+Math.random()*40}%" rx="${1+Math.random()*2}%" ry="${0.5+Math.random()}%" fill="#5a4a20" opacity="${.2+Math.random()*.3}"/>
      `).join('')}
      ${[...Array(6)].map((_,i)=>`
        <ellipse cx="${i*18+5}%" cy="${65+Math.random()*15}%" rx="${4+Math.random()*3}%" ry="${2+Math.random()*2}%" fill="#2a1e0a" opacity=".7"/>
      `).join('')}
      <ellipse cx="25%" cy="30%" rx="5%" ry="3%" fill="#c9922a" opacity=".08"/>
      <ellipse cx="60%" cy="25%" rx="4%" ry="2.5%" fill="#c9922a" opacity=".06"/>
      <ellipse cx="80%" cy="35%" rx="3%" ry="2%" fill="#8a8a6a" opacity=".05"/>
      <rect x="0" y="0" width="100%" height="8%" fill="#060402" opacity=".9"/>
    `,
  };
  svg.innerHTML=bgs[zoneId]||bgs.field;
}

// 몬스터 위치 (10마리 고정 위치 - 자연스럽게 흩어짐)
const MON_POSITIONS=[
  {x:8,  y:20},{x:22, y:35},{x:38, y:18},{x:55, y:28},{x:72, y:15},
  {x:15, y:55},{x:32, y:62},{x:50, y:50},{x:65, y:58},{x:82, y:45},
];

function renderMonstersGrid(){
  if(!G.curMonType) return;
  const zoneId=G.curZone.id;
  const zid=zoneId+'_'+G.curMonType.id;
  const mons=G.zoneMonsters[zid]||[];
  const alive=mons.filter(m=>!m.dead).length;
  document.getElementById('mon-grid-title').textContent=`${G.curMonType.name} 생존 ${alive}/10`;

  // 배경 그리기
  drawZoneBg(zoneId);

  const container=document.getElementById('monsters-map');
  container.innerHTML='';

  mons.forEach((m,i)=>{
    const pos=MON_POSITIONS[i]||{x:Math.random()*80+5,y:Math.random()*60+10};
    const wrap=document.createElement('div');
    wrap.style.cssText=`position:absolute;left:${pos.x}%;top:${pos.y}%;transform:translate(-50%,-50%);display:${m.dead?'none':'flex'};flex-direction:column;align-items:center;gap:2px;cursor:pointer;transition:transform .15s`;
    wrap.id=`mc-${i}`;

    // SVG 몬스터
    const svgWrap=document.createElement('div');
    svgWrap.style.cssText=`width:64px;height:72px;${m.dead?'filter:grayscale(1);opacity:.4':''}${i===curMonIdx?'filter:drop-shadow(0 0 6px #c0392b)':''}`;
    svgWrap.innerHTML=getMonsterSVG(m.id,m.dead, i===curMonIdx && !m.dead);

    // 이름/레벨
    const lbl=document.createElement('div');
    lbl.style.cssText=`font-size:.58rem;color:${m.dead?'#555':'#c8a870'};background:rgba(0,0,10,.7);padding:.1rem .3rem;border-radius:2px;white-space:nowrap;${i===curMonIdx?'color:#e74c3c':''}`;
    lbl.textContent=m.dead?`리젠 ${m.regenLeft}초`:m.name;

    // HP바
    const hpWrap=document.createElement('div');
    hpWrap.style.cssText='width:52px;height:4px;background:rgba(0,0,0,.5);border-radius:2px;overflow:hidden';
    const hpFill=document.createElement('div');
    hpFill.id=`mhp-${i}`;
    hpFill.style.cssText=`height:100%;width:${m.dead?0:Math.round(m.hp/m.maxHp*100)}%;background:#2a8a3a;border-radius:2px;transition:width .3s`;
    hpWrap.appendChild(hpFill);

    wrap.appendChild(svgWrap);
    wrap.appendChild(lbl);
    wrap.appendChild(hpWrap);

    if(!m.dead){
      wrap.onmouseover=()=>wrap.style.transform='translate(-50%,-50%) scale(1.1)';
      wrap.onmouseout=()=>wrap.style.transform='translate(-50%,-50%) scale(1)';
      wrap.onclick=()=>startBattle(i);
    }
    if(i===curMonIdx){
      wrap.style.transform='translate(-50%,-50%) scale(1.05)';
    }
    container.appendChild(wrap);
  });
}

// ── 전투 시스템 → battle.js로 분리됨 ──
