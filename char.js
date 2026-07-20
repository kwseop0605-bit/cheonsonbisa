// ── 천손비사 캐릭터/스탯 모듈 (char.js) ──────────────────
// cheonson.html에서 분리됨

// ────── 06_char.js ──────
// ═══════════════════════════════════════
// 06_char
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 06_char
// ═══════════════════════════════════════

function renderChar(){
  const c=G.char;
  const pp=G.ptsPending;
  document.getElementById('char-stats-grid').innerHTML=
    [['HP',c.mhp+(pp.mhp||0)*10],['MP',c.mmp+(pp.mmp||0)*5],
     ['ATK',c.atk+(pp.atk||0)*2],['DEF',c.def+(pp.def||0)*2],
     ['회피',(c.ev+Math.round((pp.ev||0)*0.1*10)/10)+'%'],
     ['관통',(c.pen+Math.round((pp.pen||0)*0.1*10)/10)+'%'],
     ['운',  (c.luck+Math.round((pp.luck||0)*0.2*10)/10)+'%'],['Lv',c.lv]]
    .map(([k,v])=>`<div style="background:var(--bg3);border:1px solid var(--border);padding:.32rem .5rem;border-radius:3px;display:flex;justify-content:space-between;font-size:.72rem"><span style="color:var(--text3)">${k}</span><span style="color:var(--gold2)">${v}</span></div>`).join('');

  const remain = c.pts - G.ptsUsed;
  document.getElementById('pts-remain').textContent = remain;

  const ptsD=[
    {k:'체력', d:'HP+10',  key:'mhp'},
    {k:'내공', d:'MP+5',   key:'mmp'},
    {k:'공격', d:'ATK+2',  key:'atk'},
    {k:'방어', d:'DEF+2',  key:'def'},
    {k:'회피', d:'+0.1%',  key:'ev'},
    {k:'관통', d:'+0.1%',  key:'pen'},
    {k:'운',   d:'+0.2%',  key:'luck'},
  ];

  const hasPending = G.ptsUsed > 0;

  document.getElementById('pts-list').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:.1rem">
      ${ptsD.map((p,i)=>`
        <div class="pts-row">
          <span class="pts-key">${p.k}</span>
          <span class="pts-desc">${p.d}</span>
          <span style="font-size:.7rem;color:var(--gold2);min-width:20px;text-align:center">${pp[p.key]||0}</span>
          <button class="btn" style="padding:.15rem .38rem;font-size:.62rem" onclick="addPtsTemp('${p.key}')" ${remain<=0?'disabled':''}>+</button>
          <button class="btn" style="padding:.15rem .38rem;font-size:.62rem;background:rgba(120,40,10,.5)" onclick="subPtsTemp('${p.key}')" ${(pp[p.key]||0)<=0?'disabled':''}>−</button>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:.4rem;margin-top:.5rem">
      <button class="btn" style="flex:1;padding:.35rem;font-size:.72rem;background:rgba(30,80,30,.8);border-color:#2a8a3a" onclick="confirmPts()" ${!hasPending?'disabled':''}>✅ 확정</button>
      <button class="btn" style="flex:1;padding:.35rem;font-size:.72rem;background:rgba(80,30,10,.7);border-color:#7a4a1a" onclick="resetPtsTemp()" ${!hasPending?'disabled':''}>↩ 초기화</button>
    </div>`;
}

function addPtsTemp(key){
  const remain = G.char.pts - G.ptsUsed;
  if(remain <= 0) return;
  if(key==='luck' && G.char.luck + Math.round(((G.ptsPending.luck||0)+1)*0.2*10)/10 > 90) return;
  G.ptsPending[key] = (G.ptsPending[key]||0) + 1;
  G.ptsUsed++;
  updateHUD(); renderChar();
}

function subPtsTemp(key){
  if((G.ptsPending[key]||0) <= 0) return;
  G.ptsPending[key]--;
  G.ptsUsed--;
  updateHUD(); renderChar();
}

function confirmPts(){
  if(G.ptsUsed <= 0) return;
  const c = G.char;
  const pp = G.ptsPending;
  c.pts -= G.ptsUsed;
  c.mhp += (pp.mhp||0)*10; c.hp = Math.min(c.hp + (pp.mhp||0)*10, c.mhp);
  c.mmp += (pp.mmp||0)*5;  c.mp = Math.min(c.mp + (pp.mmp||0)*5, c.mmp);
  c.atk += (pp.atk||0)*2;
  c.def += (pp.def||0)*2;
  c.ev  = Math.round((c.ev  + (pp.ev||0)*0.1)*10)/10;
  c.pen = Math.round((c.pen + (pp.pen||0)*0.1)*10)/10;
  c.luck= Math.round((c.luck+ (pp.luck||0)*0.2)*10)/10;
  G.ptsPending = {mhp:0,mmp:0,atk:0,def:0,ev:0,pen:0,luck:0};
  G.ptsUsed = 0;
  toast('✅ 포인트 확정!');
  updateHUD(); renderChar();
  updateFmHUD();        // 사냥터 HUD 즉시 반영
  updateGatherSkillHUD(); // 채집터 HUD 즉시 반영
  saveGame();
}

function resetPtsTemp(){
  G.ptsPending = {mhp:0,mmp:0,atk:0,def:0,ev:0,pen:0,luck:0};
  G.ptsUsed = 0;
  updateHUD(); renderChar();
}

const ptsA=[
  c=>{c.pts--;c.mhp+=10;c.hp=Math.min(c.hp+10,c.mhp)},
  c=>{c.pts--;c.mmp+=5;c.mp=Math.min(c.mp+5,c.mmp)},
  c=>{c.pts--;c.atk+=2},c=>{c.pts--;c.def+=2},
  c=>{c.pts--;c.ev=Math.round((c.ev+0.1)*10)/10},
  c=>{c.pts--;c.pen=Math.round((c.pen+0.1)*10)/10},
  c=>{if(G.char.luck<90){G.char.pts--;G.char.luck=Math.round((G.char.luck+0.2)*10)/10}},
];
function addPts(i){if(G.char.pts<=0)return;ptsA[i](G.char);updateHUD();renderChar();saveGame();}

// ── 스킬 ──────────────────────────────────────────
// 무관에서 구매 가능한 기본 무공
const SKILL_SHOP = [
  {id:'combo',   name:'연속지르기', icon:'👊', mp:8,  maxCd:10, dmgMult:1.2, hitCount:2, unlockLv:3,  price:500,  desc:'빠른 2연타 (ATK×1.2×2)'},
  {id:'heal',    name:'기공심법',   icon:'💚', mp:15, maxCd:5, dmgMult:0, special:'heal', unlockLv:3, price:500,  desc:'내공×3 체력 회복 (쿨5초)'},
  {id:'slash',   name:'용아참',     icon:'⚔', mp:12, maxCd:10, dmgMult:1.8, unlockLv:5,  price:1200, desc:'강력한 하향 베기 (ATK×1.8)'},
  {id:'ironwall',name:'철산고',     icon:'🛡', mp:10, maxCd:15, dmgMult:0, special:'def_up', unlockLv:5, price:1200, desc:'방어력 대폭 증가'},
  {id:'rest',    name:'운기조식',   icon:'🌬', mp:0,  maxCd:8,  dmgMult:0, special:'mp_heal', unlockLv:5, price:800,  desc:'내공 회복'},
  {id:'ghost',   name:'환영보',     icon:'💨', mp:8,  maxCd:12, dmgMult:0, special:'ev_up', unlockLv:5, price:1000, desc:'회피 확률 +40%', noRegen:true},
  {id:'spin',    name:'회전발차기', icon:'🦵', mp:15, maxCd:12, dmgMult:2.0, unlockLv:7,  price:2500, desc:'강력한 회전 킥 (ATK×2.0)'},
  {id:'twin',    name:'선풍검',     icon:'🌀', mp:18, maxCd:15, dmgMult:1.3, hitCount:2, unlockLv:7, price:2500, desc:'회전 2타 (ATK×1.3×2)'},
  {id:'burst',   name:'기폭장',     icon:'💣', mp:22, maxCd:20, dmgMult:2.2, unlockLv:9, price:5000, desc:'내공 폭발 (ATK×2.2)'},
  {id:'thunder', name:'뇌전신보',   icon:'⚡', mp:14, maxCd:10, dmgMult:1.5, unlockLv:9, price:5000, desc:'번개 질주 (ATK×1.5)'},
];

// 몬스터 드롭 고급 스킬북 (희귀 드롭)
const SKILL_BOOK = [
  {id:'counter', name:'철벽공격',   icon:'⚡', mp:18, maxCd:15, dmgMult:1.8, special:'def_up2', unlockLv:9,  bookName:'철벽공격 비급', desc:'ATK×1.8 + 방어 증가'},
  {id:'counter2',name:'반격지세',   icon:'🔰', mp:8,  maxCd:20, dmgMult:1.0, special:'counter', unlockLv:9,  bookName:'반격지세 비급', desc:'방어+반격 자세'},
  {id:'tiger',   name:'맹호출림',   icon:'🐯', mp:22, maxCd:20, dmgMult:2.5, unlockLv:11, bookName:'맹호출림 비급', desc:'맹렬한 호권 (ATK×2.5)'},
  {id:'shield',  name:'철포삼',     icon:'🔵', mp:10, maxCd:15, dmgMult:0, special:'def_big', unlockLv:11, bookName:'철포삼 비급', desc:'방어력 대폭 증가'},
  {id:'drop',    name:'천근추락',   icon:'💥', mp:25, maxCd:22, dmgMult:3.0, special:'pen_up', unlockLv:13, bookName:'천근추락 비급', desc:'ATK×3.0 + 방어 50% 무시'},
  {id:'crush',   name:'파산공',     icon:'🌪', mp:30, maxCd:25, dmgMult:3.5, special:'def_break', unlockLv:15, bookName:'파산공 비급', desc:'ATK×3.5 + 적 방어 감소'},
];

// 전투 외 회복 스킬 사용 (기공심법/운기조식)
function useSkillOutOfCombat(skillId){
  const sk = G.skills.find(s=>s.id===skillId);
  if(!sk) return;
  if((sk.cd||0)>0){ toast(`쿨타임 중입니다! (${sk.cd}초)`); return; }
  if(sk.mp > G.char.mp){ toast('내공이 부족합니다!'); return; }
  const c = G.char;
  c.mp = Math.max(0, c.mp - sk.mp);

  if(sk.special==='heal'){
    const healAmt = sk.mp * 3;
    c.hp = Math.min(c.mhp, c.hp + healAmt);
    toast(`💚 ${sk.name} — HP +${healAmt}`);
  } else if(sk.special==='mp_heal'){
    const mpAmt = Math.floor(c.mmp * 0.3);
    c.mp = Math.min(c.mmp, c.mp + mpAmt);
    toast(`🌬 ${sk.name} — MP +${mpAmt}`);
  }

  // 쿨타임 시작
  if(sk.maxCd>0){
    sk.cd = sk.maxCd;
    const t = setInterval(()=>{
      sk.cd = Math.max(0, sk.cd-1);
      renderSkillList();
      if(sk.cd===0) clearInterval(t);
    }, 1000);
  }
  sk.xp = Math.min(99, sk.xp+1);
  updateHUD(); updateFmHUD(); renderSkillList(); saveGame();
}

function renderSkillList(){
  const c = G.char;
  // 보유 스킬 최고 숙련도
  const maxXp = Math.max(...G.skills.map(sk=>sk.xp));
  const canLearn = maxXp >= 50;

  // 보유 스킬
  document.getElementById('skill-list').innerHTML = G.skills.length ? G.skills.map(sk=>{
    const isHeal = sk.special==='heal' || sk.special==='mp_heal';
    const cdOk = (sk.cd||0) === 0;
    const mpOk = sk.mp <= G.char.mp;
    const canUseNow = isHeal && cdOk && mpOk;
    return `
    <div class="sk-row"><span style="font-size:1.3rem">${sk.icon}</span>
      <div class="sk-info">
        <div class="sk-title">${sk.name} <span style="font-size:.6rem;color:var(--text3)">Lv${sk.lv}</span></div>
        <div class="sk-detail">내공 ${sk.mp} · 쿨타임 ${sk.maxCd}초 · ${sk.dmgMult>0?'데미지 '+sk.dmgMult+'배':'특수'}</div>
        <div class="sk-xp-bar"><div class="sk-xp-fill" style="width:${sk.xp}%"></div></div>
        <div style="font-size:.58rem;color:var(--text3)">숙련도 ${sk.xp}%</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:.3rem">
        <label style="font-size:.62rem;color:var(--text3);display:flex;align-items:center;gap:.2rem;cursor:pointer">자동
          <input type="checkbox" ${sk.auto?'checked':''} onchange="G.skills.find(s=>s.id==='${sk.id}').auto=this.checked;saveGame()"></label>
        ${isHeal?`<button class="btn" style="font-size:.6rem;padding:.2rem .4rem;${canUseNow?'':'opacity:.4;cursor:not-allowed'}"
          ${canUseNow?`onclick="useSkillOutOfCombat('${sk.id}')"`:'disabled'}>
          ${(sk.cd||0)>0?`쿨${sk.cd}초`:'사용'}
        </button>`:''}
      </div>
    </div>`;
  }).join('') : '<div style="color:var(--text3);font-size:.75rem;padding:.5rem">보유한 무공이 없습니다</div>';

  // 생활 스킬
  const lifeEl = document.getElementById('life-skill-list');
  if(lifeEl){
    const lifeSkills = [
      {key:'gather',  name:'채집', icon:'🌿', desc:'약초·식물 채집 (호미 필요)',   unlockLv:1, tool:'호미'},
      {key:'logging', name:'벌목', icon:'🪵', desc:'나무 벌목 (도끼 필요)',        unlockLv:1, tool:'도끼'},
      {key:'mining',  name:'채광', icon:'⛏️', desc:'광석 채굴 (곡괭이 필요)',      unlockLv:2, tool:'곡괭이', needBuy:true},
    ];
    lifeEl.innerHTML = lifeSkills.map(ls=>{
      const sk = G.gatherSkills[ls.key] || {lv:1,xp:0};
      const unlocked = ls.needBuy
        ? (G.lifeSkills && G.lifeSkills[ls.key])
        : c.lv >= ls.unlockLv;
      const hasTool = G.inventory.some(i=>i&&i.name===ls.tool);
      if(!unlocked) return `
        <div style="display:flex;align-items:center;gap:.6rem;padding:.45rem;border-bottom:1px solid var(--border);opacity:.4">
          <span style="font-size:1.3rem">${ls.icon}</span>
          <div style="flex:1">
            <div style="font-size:.78rem;font-weight:600;color:var(--text)">${ls.name}
              <span style="font-size:.65rem;color:#e74c3c">🔒 ${ls.needBuy?'마을 사부 습득 필요':`Lv${ls.unlockLv} 해금`}</span>
            </div>
            <div style="font-size:.7rem;font-weight:600;color:var(--text3)">${ls.desc}</div>
          </div>
        </div>`;
      const profPct = sk.xp % 100;
      return `
        <div style="display:flex;align-items:center;gap:.6rem;padding:.45rem;border-bottom:1px solid var(--border)">
          <span style="font-size:1.3rem">${ls.icon}</span>
          <div style="flex:1">
            <div style="font-size:.78rem;font-weight:600;color:var(--text)">${ls.name} <span style="font-size:.65rem;color:var(--text3)">Lv${sk.lv}</span>
              <span style="font-size:.63rem;margin-left:.3rem;color:${hasTool?'#6abf4a':'#e74c3c'}">${hasTool?'✅ '+ls.tool+' 보유':'❌ '+ls.tool+' 없음'}</span>
            </div>
            <div style="font-size:.7rem;font-weight:600;color:var(--text3)">${ls.desc}</div>
            <div style="background:var(--bg3);border-radius:2px;height:4px;margin-top:4px;overflow:hidden">
              <div style="height:100%;width:${profPct}%;background:#2a8a3a;transition:width .3s"></div>
            </div>
            <div style="font-size:.65rem;font-weight:600;color:var(--text3);margin-top:2px">숙련도 ${profPct}% · 획득량 ${getGatherQty(profPct, sk.lv)}개</div>
          </div>
        </div>`;
    }).join('');
  }
  const owned = new Set(G.skills.map(s=>s.id));
  const el = document.getElementById('skill-learn-list');
  if(!el) return;

  const available = SKILL_BOOK.filter(sk => !owned.has(sk.id));
  if(!available.length){ el.innerHTML='<div style="color:var(--text3);font-size:.75rem;padding:.5rem">배울 수 있는 무공이 없습니다</div>'; return; }

  el.innerHTML = available.map(sk=>{
    const lvOk = c.lv >= sk.unlockLv;
    const xpOk = canLearn;
    const ok = lvOk && xpOk;
    return `
    <div style="display:flex;align-items:center;gap:.6rem;padding:.45rem;border-bottom:1px solid var(--border);opacity:${ok?1:0.5}">
      <span style="font-size:1.3rem">${sk.icon}</span>
      <div style="flex:1">
        <div style="font-size:.78rem;font-weight:600;color:var(--text)">${sk.name}</div>
        <div style="font-size:.63rem;color:var(--text3)">${sk.desc}</div>
        <div style="font-size:.6rem;color:var(--gold2);margin-top:2px">
          내공 ${sk.mp} · 쿨타임 ${sk.maxCd}초
          &nbsp;|&nbsp; <span style="color:${lvOk?'#6abf4a':'#e74c3c'}">Lv${sk.unlockLv} 필요</span>
          &nbsp;|&nbsp; <span style="color:${xpOk?'#6abf4a':'#e74c3c'}">숙련도 50%+ 필요</span>
        </div>
      </div>
      <button class="btn" style="font-size:.65rem;padding:.25rem .55rem;${ok?'':'opacity:.4;cursor:not-allowed'}"
        ${ok?`onclick="learnSkill('${sk.id}')"`:''} ${ok?'':'disabled'}>습득</button>
    </div>`;
  }).join('');
}

function learnSkill(id){
  const sk = SKILL_BOOK.find(s=>s.id===id);
  if(!sk) return;
  if(G.char.lv < sk.unlockLv){ toast('레벨이 부족합니다!'); return; }
  const maxXp = Math.max(...G.skills.map(s=>s.xp));
  if(maxXp < 50){ toast('숙련도 50% 이상인 무공이 필요합니다!'); return; }
  if(G.skills.find(s=>s.id===id)){ toast('이미 보유한 무공입니다!'); return; }

  G.skills.push({
    id: sk.id, name: sk.name, icon: sk.icon,
    mp: sk.mp, cd: 0, maxCd: sk.maxCd,
    dmgMult: sk.dmgMult, special: sk.special||null,
    hitCount: sk.hitCount||1,
    auto: false, lv: 1, xp: 0
  });
  toast(`📖 ${sk.name} 습득!`);
  renderSkillList();
  saveGame();
}


// ── 인벤토리/장비 → inventory.js로 분리됨 ──
