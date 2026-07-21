// ── 천손비사 전투 시스템 모듈 (battle.js) ──────────────────
// cheonson.html에서 분리됨

// ── 전투 ──────────────────────────────────────────
let curMonIdx=-1, battleTimer=null, enemyTimer=null, autoBattle=false;


// ────── 05_battle.js ──────
// ═══════════════════════════════════════
// 05_battle
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 05_battle
// ═══════════════════════════════════════

let autoSelectTimer=null; // 자동전투 시 몬스터 자동선택 타이머

function toggleAutoBattle(){
  autoBattle=!autoBattle;
  const btn=document.getElementById('auto-battle-btn');
  const lbl=document.getElementById('auto-battle-label');
  if(autoBattle){
    btn.style.background='rgba(10,50,20,.85)';
    btn.style.borderColor='#2a8a3a';
    btn.style.color='#6abf4a';
    lbl.textContent='ON';
    addLog('⚙ 자동전투 ON!');
    // 현재 전투 중이 아니면 즉시 몬스터 자동 선택
    if(curMonIdx<0) autoSelectMonster();
  }else{
    btn.style.background='rgba(10,20,50,.85)';
    btn.style.borderColor='#2a3a8a';
    btn.style.color='#6a8ab0';
    lbl.textContent='OFF';
    if(autoSelectTimer){clearInterval(autoSelectTimer);autoSelectTimer=null;}
    addLog('⚙ 자동전투 OFF');
  }
  renderFmSkills();
}

// 자동전투: 살아있는 몬스터 중 첫 번째 선택
function toggleAllSkillAuto(){
  // 기본공격 제외한 스킬이 하나라도 자동이면 → 전체 OFF, 아니면 → 전체 ON
  const nonBasic = G.skills.filter(sk=>sk.id!=='punch');
  const allOn = nonBasic.length>0 && nonBasic.every(sk=>sk.auto);
  nonBasic.forEach(sk=>{ sk.auto = !allOn; });
  const isOn = !allOn;
  const btn = document.getElementById('auto-skill-btn');
  const lbl = document.getElementById('auto-skill-label');
  if(btn){
    btn.style.background = isOn?'rgba(10,60,10,.9)':'rgba(10,40,20,.85)';
    btn.style.borderColor = isOn?'#4abf4a':'#2a7a3a';
    btn.style.color = isOn?'#8fff8f':'#6abf4a';
  }
  if(lbl) lbl.textContent = isOn?'ON':'OFF';
  renderFmSkills();
  saveGame();
  toast(isOn?'⚡ 스킬 전체 자동 ON':'스킬 자동 OFF');
}

function autoSelectMonster(){
  if(!G.curZone || !G.curMonType) return;
  const zid=G.curZone.id+'_'+G.curMonType.id;
  const mons=G.zoneMonsters[zid]||[];
  const aliveIdx=mons.findIndex(m=>!m.dead);
  if(aliveIdx>=0){
    addLog(`🤖 ${mons[aliveIdx].name} 자동 선택!`);
    startBattle(aliveIdx);
  } else {
    // 모두 죽었으면 1초 후 재시도 (리젠 기다림)
    if(autoBattle) setTimeout(autoSelectMonster, 1000);
  }
}

function startBattle(idx){
  if(curMonIdx===idx) return;
  if(mapGatherTimer){ toast('채집 중에는 전투를 시작할 수 없습니다!'); return; }
  if(battleTimer){clearInterval(battleTimer);battleTimer=null;}
  if(enemyTimer){clearInterval(enemyTimer);enemyTimer=null;}
  curMonIdx=idx;
  const zid=G.curZone.id+'_'+G.curMonType.id;
  const m=G.zoneMonsters[zid][idx];
  if(!m||m.dead) return;

  addLog(`⚔ ${m.name}이(가) 나타났다!`);
  if(!autoBattle) addLog('💡 내공 스킬은 직접 클릭하세요!');

  updateFmHUD(); renderFmMonsters(); renderFmSkills();
  updateFmExitBtn();

  // 캐릭터를 몬스터 앞으로 이동
  movePlayerToMonster(idx);

  setTimeout(()=>{
    if(curMonIdx!==idx) return;
    const zid2=G.curZone.id+'_'+G.curMonType.id;
    const mon=G.zoneMonsters[zid2]?.[idx];
    if(!mon||mon.dead) return;
    const autoSk=G.skills.find(s=>s.auto&&s.cd===0&&s.mp<=G.char.mp&&s.id!=='punch');
    useSkill(autoSk||G.skills[0], false);
    battleTimer=setInterval(()=>{
      if(curMonIdx<0||!G.curMonType) return;
      const zid3=G.curZone.id+'_'+G.curMonType.id;
      const mon2=G.zoneMonsters[zid3]?.[curMonIdx];
      if(!mon2||mon2.dead){clearInterval(battleTimer);battleTimer=null;return;}
      const autoSk=G.skills.find(s=>s.auto&&s.cd===0&&s.mp<=G.char.mp&&s.id!=='punch');
      useSkill(autoSk||G.skills[0], false);
    },2000);
  },1000);

  setTimeout(()=>{
    if(curMonIdx!==idx) return;
    const zid2=G.curZone.id+'_'+G.curMonType.id;
    const mon=G.zoneMonsters[zid2]?.[idx];
    if(!mon||mon.dead) return;
    enemyAtk(mon);
    enemyTimer=setInterval(()=>{
      if(curMonIdx<0||!G.curMonType) return;
      const zid3=G.curZone.id+'_'+G.curMonType.id;
      const mon2=G.zoneMonsters[zid3]?.[curMonIdx];
      if(!mon2||mon2.dead){clearInterval(enemyTimer);enemyTimer=null;return;}
      enemyAtk(mon2);
    },2000);
  },1000);
}

function updateBattleBars(){
  updateFmHUD();
  if(curMonIdx>=0&&G.curMonType){
    const zid=G.curZone.id+'_'+G.curMonType.id;
    const m=G.zoneMonsters[zid][curMonIdx];
    if(m){
      const hpF=document.getElementById(`fm-mhp-${curMonIdx}`);
      if(hpF){hpF.style.width=Math.round(m.hp/m.maxHp*100)+'%';hpF.style.background=m.hp/m.maxHp>.5?'#2a8a3a':m.hp/m.maxHp>.25?'#c9922a':'#c0392b';}
    }
  }
  updateHUD();
}

function doAuto(){
  // startBattle 내부 타이머로 대체됨 (하위 호환용)
  if(curMonIdx<0||!G.curMonType) return;
  const zid=G.curZone.id+'_'+G.curMonType.id;
  const m=G.zoneMonsters[zid][curMonIdx];
  if(!m||m.dead) return;
  const autoSk=G.skills.find(s=>s.auto&&s.cd===0&&s.mp<=G.char.mp&&s.id!=='punch');
  useSkill(autoSk||G.skills[0]);
}

function useSkill(sk, skipEnemyAtk=true){
  if(!sk||curMonIdx<0||!G.curMonType) return;
  const c=G.char;
  const zid=G.curZone.id+'_'+G.curMonType.id;
  const m=G.zoneMonsters[zid][curMonIdx];
  if(!m||m.dead) return;
  if(sk.mp>c.mp){addLog('내공 부족!');return;}
  c.mp=Math.max(0,c.mp-sk.mp);

  // ── special 효과 처리 ──
  if(sk.special){
    switch(sk.special){
      case 'heal': {
        // 내공소모의 3배 체력 회복
        const healAmt = sk.mp * 3;
        c.hp = Math.min(c.mhp, c.hp + healAmt);
        addLog(`${sk.icon}${sk.name} — HP +${healAmt}`);
        if(sk.maxCd>0){sk.cd=sk.maxCd;const t=setInterval(()=>{sk.cd=Math.max(0,sk.cd-1);renderFmSkills();if(sk.cd===0)clearInterval(t);},1000);}
        sk.xp=Math.min(99,sk.xp+1);
        updateBattleBars(); renderFmSkills(); updateHUD();
        if(!skipEnemyAtk) enemyAtk(m);
        return;
      }
      case 'mp_heal': {
        const mpAmt = Math.floor(c.mmp * 0.3);
        c.mp = Math.min(c.mmp, c.mp + mpAmt);
        addLog(`${sk.icon}${sk.name} — MP +${mpAmt}`);
        if(sk.maxCd>0){sk.cd=sk.maxCd;const t=setInterval(()=>{sk.cd=Math.max(0,sk.cd-1);renderFmSkills();if(sk.cd===0)clearInterval(t);},1000);}
        sk.xp=Math.min(99,sk.xp+1);
        updateBattleBars(); renderFmSkills(); updateHUD();
        if(!skipEnemyAtk) enemyAtk(m);
        return;
      }
      case 'def_up':
      case 'def_big': {
        const defBonus = sk.special==='def_big' ? 30 : 15;
        c.def += defBonus;
        addLog(`${sk.icon}${sk.name} — DEF +${defBonus} (5초)`);
        setTimeout(()=>{ c.def -= defBonus; updateBattleBars(); }, 5000);
        break;
      }
      case 'def_up2': break; // 데미지도 주는 버전 — 아래 일반 공격 흐름으로
      case 'ev_up': {
        c.ev += 40;
        addLog(`${sk.icon}${sk.name} — 회피 +40% (5초)`);
        setTimeout(()=>{ c.ev -= 40; }, 5000);
        if(sk.maxCd>0){sk.cd=sk.maxCd;const t=setInterval(()=>{sk.cd=Math.max(0,sk.cd-1);renderFmSkills();if(sk.cd===0)clearInterval(t);},1000);}
        sk.xp=Math.min(99,sk.xp+1);
        updateBattleBars(); renderFmSkills();
        if(!skipEnemyAtk) enemyAtk(m);
        return;
      }
      case 'pen_up': {
        c.pen += 50; // 방어 50% 무시
        setTimeout(()=>{ c.pen -= 50; }, 5000);
        break; // 데미지도 주므로 아래 흐름으로
      }
      case 'def_break': {
        m.def = Math.max(0, m.def - 10);
        addLog(`${sk.icon}${sk.name} — 적 방어력 감소!`);
        break;
      }
    }
  }

  // ── 일반 공격 데미지 ──
  let evR=0;
  if(c.ev===c.pen&&c.ev>0) evR=50;
  else evR=Math.max(0,c.ev-c.pen);
  if(Math.random()*100<evR){addLog(`${sk.icon}${sk.name} — 빗나감!`);return;}

  const eq = getEquipStats();
  const totalAtk = c.atk + (eq.atk||0);
  const totalLuck = c.luck + (eq.luck||0);

  // 급소 공격 확률 (파악된 급소 수 × 5%)
  const mid2 = G.curMonType?.id||'';
  const vFound = G.vitalFound?.[mid2]||[];
  const vitalChance = vFound.length * 5; // 0~30%

  const hitCount = sk.hitCount||1;
  let totalDmg = 0;
  let isVital = false;
  let isCrit = false;
  for(let h=0; h<hitCount; h++){
    let dmg=Math.max(0,Math.floor(totalAtk*sk.dmgMult)-m.def);
    let crit=false;
    // 치명타: luck% 확률, 2배 데미지
    if(Math.random()*100 < totalLuck){ dmg=Math.floor(totalAtk*sk.dmgMult*2); crit=true; isCrit=true;
      if(!G.battleStats) G.battleStats={monKills:{},monDeaths:{},skillUse:{},skillDmg:{},critCount:0,vitalCount:0,totalBattles:0,totalDmgDealt:0,totalDmgTaken:0};
      G.battleStats.critCount=(G.battleStats.critCount||0)+1;
    }
    // 급소 공격: vitalChance% 확률, 1.5배 데미지 (치명타와 중복 불가)
    else if(vitalChance>0 && Math.random()*100 < vitalChance){
      dmg=Math.floor(dmg*1.5); isVital=true;
    }
    if(crit && h===0) addLog(`${sk.icon}${sk.name} 💥크리  -${dmg}`);
    totalDmg += dmg;
  }
  m.hp=Math.max(0,m.hp-totalDmg);
  sk.xp=Math.min(99,sk.xp+1);
  // 무기 내구도 감소 (공격 1회)
  reduceEquipDur('weapon');
  // 크리티컬/급소 시 악세사리 내구도 감소
  if(isCrit || isVital) reduceEquipDur('accessory');
  // 통계 수집
  if(!G.battleStats) G.battleStats={monKills:{},monDeaths:{},skillUse:{},skillDmg:{},critCount:0,vitalCount:0,totalBattles:0,totalDmgDealt:0,totalDmgTaken:0};
  G.battleStats.skillUse[sk.name]=(G.battleStats.skillUse[sk.name]||0)+1;
  G.battleStats.skillDmg[sk.name]=(G.battleStats.skillDmg[sk.name]||0)+totalDmg;
  G.battleStats.totalDmgDealt=(G.battleStats.totalDmgDealt||0)+totalDmg;
  if(isVital) G.battleStats.vitalCount=(G.battleStats.vitalCount||0)+1;
  if(sk.maxCd>0){sk.cd=sk.maxCd;const t=setInterval(()=>{sk.cd=Math.max(0,sk.cd-1);renderFmSkills();if(sk.cd===0)clearInterval(t);},1000);}

  showAttackEffect(curMonIdx,false);
  if(isVital){
    const vName = MONSTER_VITALS[mid2]?.[Math.floor(Math.random()*vFound.length)]||'급소';
    addLog(`${sk.icon}${sk.name} ⚡${vName}!  -${totalDmg}`);
  } else if(hitCount<=1){
    addLog(`${sk.icon}${sk.name}  -${totalDmg}`);
  } else {
    addLog(`${sk.icon}${sk.name} ${hitCount}타  -${totalDmg}`);
  }

  // 몬스터 피격 이펙트
  const monWrap=document.getElementById(`fm-mon-${curMonIdx}`);
  if(monWrap){
    monWrap.style.transition='transform .05s';
    monWrap.style.transform='translate(-50%,-50%) scale(0.9) rotate(-3deg)';
    setTimeout(()=>{
      monWrap.style.transform='translate(-50%,-50%) scale(1.05) rotate(3deg)';
      setTimeout(()=>{monWrap.style.transform='translate(-50%,-50%) scale(1)';},80);
    },60);
  }

  updateBattleBars(); renderFmSkills();
  if(m.hp<=0){
    // 몰이 추가 타겟에도 70% 데미지 적용 (onKill 전에 처리)
    const moliCount = getMoliCount(m.name);
    if(moliCount > 1){
      const targets = getMoliTargets(zid2, curMonIdx, moliCount);
      targets.forEach(({m:tm, i:ti}) => {
        const moliDmg = Math.max(1, Math.floor(totalDmg * 0.7));
        tm.hp = Math.max(0, tm.hp - moliDmg);
        addLog(`  ↳ 몰이 ${tm.name} -${moliDmg}`);
        const tw = document.getElementById(`fm-mon-${ti}`);
        if(tw){ tw.style.filter='brightness(2)'; setTimeout(()=>{tw.style.filter='';},200); }
        // 추가 타겟 처치 시 간단 처리 (bossCounter는 메인 처치에서만 증가)
        if(tm.hp <= 0){
          tm.dead = true; tm.hp = 0;
          const tw2 = document.getElementById(`fm-mon-${ti}`);
          if(tw2) tw2.style.display='none';
          // 드랍/경험치/통계 처리
          G.char.xp += tm.xp; checkLevelUp();
          if(!G.battleStats) G.battleStats={monKills:{},monDeaths:{},skillUse:{},skillDmg:{},critCount:0,vitalCount:0,totalBattles:0,totalDmgDealt:0,totalDmgTaken:0};
          G.battleStats.monKills[tm.name]=(G.battleStats.monKills[tm.name]||0)+1;
          if(Math.random()<0.3){const g2=tm.gold[0]+Math.floor(Math.random()*(tm.gold[1]-tm.gold[0]+1));G.char.gold+=g2;addLog(`💰 ${g2}냥`);}
          if(Math.random()<0.3){const d2=tm.drop[Math.floor(Math.random()*tm.drop.length)];G.mats[d2]=(G.mats[d2]||0)+1;addLog(`📦 ${d2}`);}
          addLog(`✅ ${tm.name} 처치! (몰이)`);
          // 리젠 타이머
          tm.regenLeft = 10;
          const _t = setInterval(()=>{
            tm.regenLeft--;
            if(tm.regenLeft<=0){
              clearInterval(_t);
              if(!G.bossWaiting[zid2]){ tm.dead=false; tm.hp=tm.maxHp; renderFmMonsters(); }
            }
          }, 1000);
        }
      });
    }
    onKill(curMonIdx);
    return;
  }
  if(!skipEnemyAtk) enemyAtk(m);
}

// ── 몰이사냥 ──────────────────────────────────────
// 해당 몬스터 종류의 누적 처치 수로 동시 타격 수 계산
function getMoliCount(monName){
  const kills = G.battleStats?.monKills?.[monName] || 0;
  const extra = Math.min(5, Math.floor(kills / 500)); // 500마다 +1, 최대 5
  return 1 + extra; // 메인 1 + 추가 최대 5 = 최대 6
}

// 몰이 추가 타겟 선택 (메인 제외 살아있는 몬스터 중 랜덤)
function getMoliTargets(zid, mainIdx, count){
  const mons = G.zoneMonsters[zid] || [];
  const alive = mons
    .map((m, i) => ({m, i}))
    .filter(({m, i}) => i !== mainIdx && !m.dead && m.hp > 0 && m.regenLeft <= 0);
  // 랜덤 섞기
  for(let i = alive.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [alive[i], alive[j]] = [alive[j], alive[i]];
  }
  return alive.slice(0, count - 1); // 메인 제외 나머지
}

// ── 장비 내구도 감소 함수 ─────────────────────────
function reduceEquipDur(slot){
  const item = G.equipped?.[slot] ? G.inventory.find(i=>i&&i.name===G.equipped[slot]) : null;
  if(!item || !item.dur) return;
  item.dur = Math.max(0, item.dur - 1);
  // 파손
  if(item.dur <= 0){
    if(item.repairable===true){
      showLevelUpPopup(`🔧 ${item.name} 파손!`, `내구도가 0이 됐습니다.\n마을 → 대장간 → [수리] 탭에서\n수리하세요.`);
    } else {
      showLevelUpPopup(`⚠️ ${item.name} 파손!`, `내구도가 0이 됐습니다.\n마을 → 대장간 → [구매] 탭에서\n새 장비를 구매하세요.`);
    }
    G.equipped[slot] = null;
    renderEquipSlots();
  // 제작 아이템: 내구도 20/10/5 → 수리 권고
  } else if(item.repairable===true && (item.dur===20||item.dur===10||item.dur===5)){
    showLevelUpPopup(`🔧 ${item.name} 수리 필요!`, `내구도가 ${item.dur} 남았습니다.\n마을 → 대장간 → [수리] 탭에서\n수리하세요.`);
  }
}

function enemyAtk(m){
  const c=G.char;
  let evR=0;
  if(c.ev===c.pen&&c.ev>0) evR=50;
  else evR=Math.max(0,c.ev-c.pen);

  // 몬스터 공격 애니메이션 (캐릭터 쪽으로 돌진)
  const monWrap=document.getElementById(`fm-mon-${curMonIdx}`);
  const player=document.getElementById('fm-player');
  if(monWrap){
    // 몬스터 위치
    const pos=FM_MON_POS[curMonIdx]||{x:50,y:30};
    const W=window.innerWidth, H=window.innerHeight;
    const monX=pos.x/100*W, monY=pos.y/100*H;
    // 캐릭터 위치 (하단 중앙 50%, 85%)
    const playerX=W*0.08, playerY=H*0.80;
    // 방향 벡터
    const dx=playerX-monX, dy=playerY-monY;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const moveX=(dx/dist)*40, moveY=(dy/dist)*40;

    // 돌진
    monWrap.style.transition='transform .12s ease-out';
    monWrap.style.transform=`translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.1)`;

    setTimeout(()=>{
      // 회피 판정
      if(Math.random()*100<evR){
        addLog(`${m.name} 공격 — 회피!`);
        monWrap.style.transition='transform .15s ease-in';
        monWrap.style.transform='translate(-50%,-50%) scale(1)';
        return;
      }
      const eqD = getEquipStats();
      const dmg=Math.max(1,m.atk-(c.def+(eqD.def||0)));
      c.hp=Math.max(0,c.hp-dmg);
      if(!G.battleStats) G.battleStats={monKills:{},monDeaths:{},skillUse:{},skillDmg:{},critCount:0,vitalCount:0,totalBattles:0,totalDmgDealt:0,totalDmgTaken:0};
      G.battleStats.totalDmgTaken=(G.battleStats.totalDmgTaken||0)+dmg;
      addLog(`${m.name} ⚔ -${dmg} 피해`);
      // 방어구 내구도 감소 (피격 1회)
      reduceEquipDur('armor');

      // 캐릭터 피격 이펙트
      if(player){
        player.style.transition='none';
        player.style.filter='brightness(3) saturate(0)';
        const pushX=W*0.08+(dx/dist)*-15;
        const pushY=H*0.80+(dy/dist)*-15;
        player.style.left=pushX+'px'; player.style.top=pushY+'px';
        setTimeout(()=>{
          player.style.filter='';
          player.style.transition='left .15s,top .15s';
          player.style.left='8%'; player.style.top='80%';
        },120);
      }

      updateBattleBars();
      if(c.hp<=0) onDie();

      // 몬스터 복귀
      monWrap.style.transition='transform .18s ease-in';
      monWrap.style.transform='translate(-50%,-50%) scale(1)';
    },120);
    return; // 아래 코드는 setTimeout 내부에서 처리
  }

  // monWrap 없을 때 폴백
  if(Math.random()*100<evR){addLog(`${m.name} 공격 — 회피!`);return;}
  const eqD2=getEquipStats();
  const dmg=Math.max(1,m.atk-(c.def+(eqD2.def||0)));
  c.hp=Math.max(0,c.hp-dmg);
  if(!G.battleStats) G.battleStats={monKills:{},monDeaths:{},skillUse:{},skillDmg:{},critCount:0,vitalCount:0,totalBattles:0,totalDmgDealt:0,totalDmgTaken:0};
  G.battleStats.totalDmgTaken=(G.battleStats.totalDmgTaken||0)+dmg;
  addLog(`${m.name} ⚔ -${dmg} 피해`);
  // 방어구 내구도 감소 (피격 1회)
  reduceEquipDur('armor');
  if(player){player.style.filter='brightness(2)';setTimeout(()=>player.style.filter='',150);}
  updateBattleBars();
  if(c.hp<=0) onDie();
}

function onKill(idx){
  if(battleTimer){clearInterval(battleTimer);battleTimer=null;}
  if(enemyTimer){clearInterval(enemyTimer);enemyTimer=null;}
  const zid=G.curZone.id+'_'+G.curMonType.id;
  const m=G.zoneMonsters[zid][idx];
  m.dead=true; m.hp=0;

  // 스킬 쿨타임 리셋
  G.skills.forEach(sk=>sk.cd=0);

  G.char.xp+=m.xp; checkLevelUp();
  updateFmHUD(); // 경험치 바 즉시 업데이트

  // 보스 처치 여부 먼저 체크 (보스면 별도 처리, 카운터 증가 안 함)
  if(m.isBoss){
    checkBossKill(m, zid);
  } else {
    // 일반 몬스터만 카운터 증가
    G.bossCounter[zid]=(G.bossCounter[zid]||0)+1;
    if(Math.random()<0.3){const g=m.gold[0]+Math.floor(Math.random()*(m.gold[1]-m.gold[0]+1));G.char.gold+=g;addLog(`💰 ${g}냥`);}
    if(Math.random()<0.3){const d=m.drop[Math.floor(Math.random()*m.drop.length)];G.mats[d]=(G.mats[d]||0)+1;addLog(`📦 ${d} → 재료창고`);}
    // 열매 드롭 0.1%
    if(Math.random()<0.001){
      const berries = Object.keys(BERRY_EFFECTS);
      const b = berries[Math.floor(Math.random()*berries.length)];
      const bIcon = Object.values(GATHER_POINTS).flat().find(p=>p.name===b)?.icon||'🍎';
      const bExist = G.inventory.find(x=>x&&x.name===b&&x.type==='berry');
      if(bExist){ bExist.qty = Math.min(999, (bExist.qty||1)+1); }
      else { G.inventory.push({name:b, icon:bIcon, type:'berry', qty:1}); }
      addLog(`🍀 행운! ${b} 드롭!`);
      toast(`🍀 ${b} 드롭!`);
      renderInv();
    }
    // 급소 파악 카운터 (100마리마다 급소 1개 공개)
    if(!G.vitalKills) G.vitalKills={};
    if(!G.vitalFound) G.vitalFound={};
    const mid = m.id;
    G.vitalKills[mid] = (G.vitalKills[mid]||0)+1;
    // 처치 통계
    if(!G.battleStats) G.battleStats={monKills:{},monDeaths:{},skillUse:{},skillDmg:{},critCount:0,vitalCount:0,totalBattles:0,totalDmgDealt:0,totalDmgTaken:0};
    G.battleStats.monKills[m.name]=(G.battleStats.monKills[m.name]||0)+1;
    const kills = G.vitalKills[mid];
    const found = G.vitalFound[mid]||[];
    const shouldReveal = Math.floor(kills/100); // 100,200,300...마다
    if(shouldReveal > found.length && found.length < 6){
      const vitals = MONSTER_VITALS[mid]||[];
      const newVital = vitals[found.length];
      if(newVital){
        G.vitalFound[mid] = [...found, found.length];
        const cnt = G.vitalFound[mid].length;
        showLevelUpPopup(`💥 급소 발견!`,
          `${m.name}의 급소를 파악했습니다!\n\n⚡ ${newVital}\n\n급소 공격 확률 +5% → 현재 ${cnt*5}%\n(파악 ${cnt}/6)`);
        addLog(`💥 급소 파악: [${newVital}]!`);
        saveGame();
      }
    }
    addLog(`✅ ${m.name} 처치! +${m.xp}xp`);

    // 퀘스트 체크
    G.quests.forEach(q=>{
      if(!q.done&&q.obj?.type==='kill'&&q.obj.monster===m.name){
        q.obj.cur=(q.obj.cur||0)+1;
        if(q.obj.cur>=q.obj.val){q.done=true;Object.entries(q.reward.mats||{}).forEach(([k,v])=>G.mats[k]=(G.mats[k]||0)+v);toast(`📜 천명 완료: ${q.title}!`);renderQuests();}
      }
    });

    // 보스 카운터 체크 (일반 몬스터만)
    const bc=G.bossCounter[zid]||0;
    if(bc===49) addLog('⚠️ 보스 출현 임박!');
    if(bc>=50 && !G.bossWaiting[zid]){
      G.bossWaiting[zid] = true;
      showBossPopup(zid);
    }
  }

  m.regenLeft = m.isBoss ? 0 : 10;
  curMonIdx=-1;
  // 캐릭터 원위치 복귀
  returnPlayerToBase();
  // 처치한 몬스터 즉시 숨김
  const deadWrap=document.getElementById(`fm-mon-${idx}`);
  if(deadWrap) deadWrap.style.display='none';
  renderFmSkills();
  // 카운터 업데이트 (몰이 단계 표시)
  const bc2=G.bossCounter[zid]||0;
  const alive2=G.zoneMonsters[zid].filter(mon=>!mon.dead).length;
  const moliCount2 = getMoliCount(G.curMonType?.name||'');
  const moliText = moliCount2 > 1 ? `  ⚔${moliCount2}몰이` : '';
  document.getElementById('fm-counter').textContent=`보스까지 ${bc2}/50  |  생존 ${alive2}/8${moliText}`;

  if(!m.isBoss){
    const t=setInterval(()=>{
      m.regenLeft--;
      if(m.regenLeft<=0){
        clearInterval(t);
        // 보스 대기 중이면 일반 몬스터 리젠 안 함
        if(G.bossWaiting[zid]) return;
        m.dead=false; m.hp=m.maxHp;
        addLog(`🔄 ${m.name} 리젠!`);
        renderFmMonsters();
      }
    },1000);
  }

  // 자동전투 ON이면 1초 후 다음 몬스터 자동 선택
  if(autoBattle){
    setTimeout(()=>autoSelectMonster(), 1000);
  }
  updateFmExitBtn(); // 나가기 버튼으로 복구
  saveGame();
}

function onDie(){
  if(battleTimer){clearInterval(battleTimer);battleTimer=null;}
  if(enemyTimer){clearInterval(enemyTimer);enemyTimer=null;}
  curMonIdx=-1;
  autoBattle=false;
  // 사망 통계
  if(!G.battleStats) G.battleStats={monKills:{},monDeaths:{},skillUse:{},skillDmg:{},critCount:0,vitalCount:0,totalBattles:0,totalDmgDealt:0,totalDmgTaken:0};
  const killer = G.curMonType?.name||'알 수 없음';
  G.battleStats.monDeaths[killer]=(G.battleStats.monDeaths[killer]||0)+1;
  // 캐릭터 체력 1로
  G.char.hp = 1;
  // 모든 몬스터 체력 풀회복
  const zid = G.curZone?.id;
  if(zid && G.zoneMonsters[zid]){
    G.zoneMonsters[zid].forEach(m=>{
      if(!m.isBoss) m.hp = m.maxHp;
    });
  }
  updateHUD();
  addLog('💀 전투 불능! 사냥터를 벗어났습니다.');
  toast('💀 전투 불능! 사냥터에서 퇴장합니다.');
  // 전투장 자동 탈출
  setTimeout(()=>{ exitFullMap(); }, 1500);
}

function renderBattleSkills(){renderFmSkills();}

// ── 레벨업 ────────────────────────────────────────
function checkLevelUp(){
  const c=G.char;
  // 레벨별 필요 경험치: Lv1→2: 100, Lv2→3: 200, Lv3→4: 400, 이후 ×2씩
  const need = Math.round(100 * Math.pow(2, c.lv-1));
  if(c.xp>=need){
    c.xp-=need; c.lv++;
    const bonus=c.lv%10===0?30:10;
    c.pts+=bonus;
    c.hp=c.mhp; c.mp=c.mmp;
    addLog(`🎉 레벨업! Lv${c.lv} — 체력·내공 회복!`);
    showLevelUpPopup(`🎉 레벨업! Lv${c.lv}`, `체력·내공 완전 회복!\n스탯 포인트 +${bonus}`);
    addHistory('레벨업', `${c.name}(이)가 Lv${c.lv}이 되었다.`);
  }
}

// ── 특성치 ────────────────────────────────────────


