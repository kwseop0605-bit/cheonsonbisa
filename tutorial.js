// ── 천손비사 튜토리얼 모듈 ─────────────────────────────
// tutorial.js - cheonson.html에서 분리된 튜토리얼 전용 코드

const TUTORIAL_STEPS = [
  // 신단수 대화
  {speaker:'신단수', text:'...', action:'shindansu_light'},
  {speaker:'신단수', text:'하늘의 백성 {name}.... 마침내 네가 천손임을 각성하였구나.'},
  {speaker:'신단수', text:'이 땅에 천손의 혈맥이 깨어난 것은 오랜 세월 만의 일이로다.'},
  {speaker:'신단수', text:'이제 천손으로 살아가는 법을 가르쳐주겠노라.'},
  {speaker:'신단수', text:'먼저 저 대장간의 <span style="color:#e8b84b;font-weight:700">불메장이</span>를 찾아가거라.\n그가 네 첫걸음을 도와줄 것이니라.', action:'close_and_highlight_forge'},
  // 대장간 (불메장이) - 대장간 클릭 후 자동 진행
  {speaker:'불메장이', text:'신단수께서 계시를 주셔서 오랫동안 기다렸습니다.', trigger:'forge'},
  {speaker:'불메장이', text:'이제 {name}님이 오셨군요. 어서 오십시오.'},
  {speaker:'불메장이', text:'천손으로 살아가시는 데 도움이 될\n\'호미\', \'도끼\', \'곡괭이\'를 드리겠습니다.', action:'give_tools'},
  {speaker:'불메장이', text:'채집, 벌목, 채광에 쓰이는 도구입니다.\n잘 간수하시길 바랍니다.'},
  {speaker:'불메장이', text:'하단의 인벤토리 탭을 눌러보십시오.\n호미를 더블클릭하거나 우클릭하여 착용하시면 됩니다.', action:'highlight_inv_and_wait'},
  {speaker:'불메장이', text:'허허, 잘 하셨습니다.\n나머지 곡괭이와 도끼도 같은 방법으로 착용하십시오.', action:'wait_equip_all'},
  {speaker:'불메장이', text:'모든 도구를 갖추셨군요. 이제 준비가 되셨습니다.\n신단수께 돌아가 다음 가르침을 받으십시오.', action:'close_and_highlight_shindansu'},
  // 신단수 복귀
  {speaker:'신단수', text:'불메장이에게 호미, 도끼, 곡괭이 착용법은 잘 배웠구나.', trigger:'shindansu_return'},
  {speaker:'신단수', text:'호미는 채집, 도끼는 벌목, 곡괭이는 채광을 할 수 있다.\n이제 직접 사용해보도록 하자.'},
  // 퀘스트 1: 쑥 채집
  {speaker:'신단수', text:'먼저 채집을 해보거라.\n쑥 10개를 채집해서 가져오거라.'},
  {speaker:'신단수', text:'채집 스킬을 내리겠노라.\n이제 들판에서 채집을 할 수 있느니라.', action:'give_gather_skill'},
  {speaker:'신단수', text:'쑥은 들판 채집터에서 캘 수 있느니라.\n하단의 채집터 탭을 눌러 들판으로 나아가거라.', action:'quest_gather_ssuk'},
  // 쑥 채집 완료 후
  {speaker:'신단수', text:'잘 하였노라. 돌호미 제작서를 내리겠다.', trigger:'ssuk_done', action:'give_homi_recipe'},
  {speaker:'신단수', text:'이번엔 벌목을 해보거라.\n숲속 채집터에서 나뭇가지 10개를 가져오거라.'},
  {speaker:'신단수', text:'벌목 스킬을 내리겠노라.\n이제 숲속에서 벌목을 할 수 있느니라.', action:'give_logging_skill'},
  {speaker:'신단수', text:'하단의 채집터 탭을 눌러 숲속으로 나아가거라.', action:'quest_logging'},
  // 벌목 완료 후
  {speaker:'신단수', text:'잘 하였노라. 돌도끼 제작서를 내리겠다.', trigger:'logging_done', action:'give_axe_recipe'},
  {speaker:'신단수', text:'마지막으로 채광을 해보거라.\n광산 채광터에서 철광석 10개를 가져오거라.'},
  {speaker:'신단수', text:'채광 스킬을 내리겠노라.\n이제 광산에서 채광을 할 수 있느니라.', action:'give_mining_skill'},
  {speaker:'신단수', text:'하단의 채집터 탭을 눌러 광산으로 나아가거라.', action:'quest_mining'},
  // 채광 완료 후
  {speaker:'신단수', text:'잘 하였노라. 돌곡괭이 제작서를 내리겠다.', trigger:'mining_done', action:'give_pickaxe_recipe'},
  {speaker:'신단수', text:'천손의 길은 멀고도 험하나...\n하늘이 언제나 너와 함께하고 있음을 잊지 말아라.'},
  {speaker:'신단수', text:'마지막으로 한 가지 일러두겠다.\n채집, 벌목, 채광을 할 때 스페이스 키를 누르거나\n마우스를 클릭하면 채집 시간이 줄어드느니라.'},
  {speaker:'신단수', text:'이 한울의 세상에서는 모든 것을\n네 스스로 구해야 하느니라.'},
  {speaker:'신단수', text:'그리고 또 다른 천손을 찾아\n물물교환을 하며 살아가야 하느니라.'},
  {speaker:'신단수', text:'나는 언제나 이 자리에서\n너를 지켜보고 있을 것이니라.', action:'end_tutorial'},
];

let tutStep = 0;
let tutTyping = null;
let tutWaiting = false;
let _tutorialAllowedEl = null; // 현재 클릭 허용된 요소

// 튜토리얼 클릭 잠금 - 허용된 요소 외 클릭 차단
document.addEventListener('click', function(e){
  if(!_tutorialAllowedEl) return;
  if(G && G.tutorialDone){ _tutorialAllowedEl = null; return; }
  // 허용된 요소이거나 그 자식이면 통과
  if(_tutorialAllowedEl.contains(e.target) || _tutorialAllowedEl === e.target) return;
  // 튜토리얼 대화창 클릭은 항상 허용
  const dialog = document.getElementById('tutorial-dialog');
  if(dialog && dialog.contains(e.target)) return;
  // 그 외 차단
  e.stopPropagation();
  e.preventDefault();
}, true); // capture 단계에서 가로채기

function setTutLock(el){ _tutorialAllowedEl = el; }
function clearTutLock(){ _tutorialAllowedEl = null; }

function quitGame(){
  if(!confirm('게임을 종료하시겠습니까?\n(저장된 데이터는 유지됩니다)')) return;
  saveGame();
  // 타이머 정리
  if(window._regenTimer) clearInterval(window._regenTimer);
  if(window.battleTimer) clearInterval(window.battleTimer);
  if(window.autoGatherTimer) clearInterval(window.autoGatherTimer);
  autoBattle = false;
  // 게임 화면 숨기고 타이틀로
  document.getElementById('game').classList.remove('show');
  toast('게임을 저장하고 종료했습니다.');
  setTimeout(()=>initGame(), 800);
}

// 무기 장착 - 묵직한 금속음
// ── 한얼 시간 시스템 ─────────────────────────────────
function getGameDate(timestamp){
  const start = G.char.createdAt || timestamp;
  const realMs = timestamp - start;
  const totalGameDays = realMs / 3600000; // 1시간 = 1게임일
  const totalDaysInt = Math.floor(totalGameDays);
  const gameHour = Math.floor((totalGameDays - totalDaysInt) * 24);
  const gameYear  = Math.floor(totalDaysInt / 360) + 1;
  const remaining = totalDaysInt % 360;
  const gameMonth = Math.floor(remaining / 30) + 1;
  const gameDay   = (remaining % 30) + 1;
  return `한얼 ${gameYear}년 ${gameMonth}월 ${gameDay}일 ${gameHour}시`;
}

// 역사 기록 추가
function addHistory(type, detail){
  if(!G.history) G.history = [];
  G.history.push({ type, detail, ts: Date.now() });
  // 최대 500개 유지
  if(G.history.length > 500) G.history.shift();
  saveGame();
}

// ── 신단수 패널 렌더링 ────────────────────────────────
function showSdTab(tab){
  ['summary','craft','history'].forEach(t=>{
    document.getElementById('sd-'+t).style.display = t===tab?'block':'none';
    const btn = document.getElementById('sdTab-'+t);
    if(btn) btn.style.background = t===tab?'rgba(180,130,20,.3)':'';
  });
  if(tab==='summary') renderSdSummary();
  if(tab==='craft')   renderSdCraft();
  if(tab==='history') renderSdHistory();
}

function renderShindansu(){
  showSdTab('summary');
}

function renderSdSummary(){
  const c = G.char;
  const el = document.getElementById('sd-summary-content');
  if(!el) return;
  const totalKills = Object.values(G.killCount||{}).reduce((s,v)=>s+v,0);
  const bossKills  = Object.values(G.bossKill||{}).reduce((s,v)=>s+v,0);
  el.innerHTML = `
    <div>📛 이름: <span style="color:var(--gold2)">${c.name}</span> (${c.gender==='남'?'남자':'여자'} · ${c.body||'균형'}형)</div>
    <div>⭐ 레벨: <span style="color:var(--gold2)">Lv${c.lv}</span> · 경험치: ${c.xp||0}/${c.lv*100}</div>
    <div>❤️ 체력: ${c.mhp} · 💙 내공: ${c.mmp}</div>
    <div>⚔️ 공격력: ${c.atk} · 🛡 방어력: ${c.def}</div>
    <div>🐛 총 처치: <span style="color:var(--gold2)">${totalKills.toLocaleString()}</span>마리</div>
    <div>👹 보스 처치: <span style="color:var(--gold2)">${bossKills.toLocaleString()}</span>회</div>
    <div>🎒 보유 냥: <span style="color:var(--gold2)">${(G.gold||0).toLocaleString()}</span>냥</div>
    <div style="font-size:.65rem;color:var(--text3);margin-top:.3rem">📅 각성일: ${c.createdAt ? getGameDate(c.createdAt) : '-'}</div>
  `;
  const sk = document.getElementById('sd-skill-content');
  if(!sk) return;
  const ls = G.lifeSkill||{};
  const skillNames = {gather:'채집',logging:'벌목',mining:'채광'};
  let html = '';
  ['gather','logging','mining'].forEach(s=>{
    // lifeSkills로 해금된 스킬만 표시
    if(!G.lifeSkills || !G.lifeSkills[s]) return;
    const sk = G.gatherSkills[s] || {lv:1,xp:0};
    const lv = sk.lv || 1;
    const xp = sk.xp || 0;
    const bar = Math.min(100, xp);
    const qty = xp >= 50 ? 2 : 1;
    html += `
      <div style="margin-bottom:.4rem">
        <span style="color:var(--gold2)">${skillNames[s]}</span> Lv${lv}
        <span style="color:var(--text3);font-size:.65rem;margin-left:.3rem">(숙련도 ${xp}/100 · 채집 ${qty}개)</span>
        <div style="background:var(--bg2);border-radius:2px;height:4px;margin-top:2px">
          <div style="background:#4aaf5a;width:${bar}%;height:100%;border-radius:2px"></div>
        </div>
      </div>`;
  });
  sk.innerHTML = html || '<div style="color:var(--text3)">스킬 없음</div>';
}

function renderSdCraft(){
  const el = document.getElementById('sd-craft-content');
  if(!el) return;
  const learned = G.craftSkills||[];
  const all = (typeof ALL_CRAFT_RECIPES !== 'undefined') ? ALL_CRAFT_RECIPES : [];
  if(!all.length){ el.innerHTML='<div style="color:var(--text3)">제작 레시피 없음</div>'; return; }

  let html = '';
  all.forEach(r=>{
    const canLearn = learned.includes(r.id);
    const mats = (r.mats||[]).map(m=>`${m.name}×${m.qty}`).join(', ');
    html += `
      <div style="padding:.4rem 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.5rem">
        <span style="font-size:.65rem;padding:.1rem .35rem;border-radius:2px;background:${canLearn?'rgba(74,175,90,.25)':'rgba(80,80,80,.3)'};color:${canLearn?'#6abf4a':'var(--text3)'}">${canLearn?'습득':'미습득'}</span>
        <div>
          <div style="color:var(--gold2);font-size:.75rem">${r.result}</div>
          <div style="color:var(--text3);font-size:.65rem">재료: ${mats||'없음'}</div>
        </div>
      </div>`;
  });
  el.innerHTML = html || '<div style="color:var(--text3)">제작 레시피 없음</div>';
}

function renderSdHistory(){
  const el = document.getElementById('sd-history-content');
  if(!el) return;
  if(!G.history||!G.history.length){
    el.innerHTML='<div style="color:var(--text3);text-align:center;padding:1rem">기록이 없습니다.</div>';
    return;
  }
  const typeIcon = {탄생:'🌟',레벨업:'⭐',채집:'🌿',벌목:'🪓',채광:'⛏️',제작:'⚒️',보스:'👹',퀘스트:'📋',기타:'📝'};
  const html = [...G.history].reverse().map(h=>`
    <div style="padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;gap:.5rem;align-items:flex-start">
      <span style="flex-shrink:0">${typeIcon[h.type]||'📝'}</span>
      <div>
        <div style="color:var(--text2);font-size:.73rem">${h.detail}</div>
        <div style="color:var(--text3);font-size:.62rem">${getGameDate(h.ts)}</div>
      </div>
    </div>`).join('');
  el.innerHTML = html;
}

// 신단수 패널 열릴 때 호출
function openShindansuPanel(){
  renderShindansu();
}

function playEquipItemSound(slot){
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    if(slot === 'weapon'){
      // 칼 뽑는 느낌 - 고음에서 저음으로
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(200, t+0.2);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t+0.3);
      // 금속 울림
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 440;
      gain2.gain.setValueAtTime(0.15, t+0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, t+0.8);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.start(t+0.15); osc2.stop(t+0.8);
    } else if(slot === 'armor'){
      // 갑옷 입는 느낌 - 둔탁한 소리 2번
      [0, 0.12].forEach(delay=>{
        const buf = ctx.createBuffer(1, ctx.sampleRate*0.15, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for(let j=0; j<data.length; j++)
          data[j] = (Math.random()*2-1) * Math.exp(-j/(ctx.sampleRate*0.05));
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 400;
        gain.gain.value = 0.5;
        src.buffer = buf;
        src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        src.start(t+delay);
      });
    } else {
      // 악세사리 - 가벼운 딸랑 소리
      [523, 784].forEach((freq, i)=>{
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, t+i*0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t+i*0.08+0.5);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t+i*0.08); osc.stop(t+i*0.08+0.5);
      });
    }
  } catch(e){}
}

// 도구 장착 - 툭 하는 소리
function playEquipToolSound(){
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate*0.2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let j=0; j<data.length; j++)
      data[j] = (Math.random()*2-1) * Math.exp(-j/(ctx.sampleRate*0.06));
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 600; filter.Q.value = 3;
    gain.gain.value = 0.4;
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start(t);
    // 짧은 금속 울림
    const osc = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = 350;
    gain2.gain.setValueAtTime(0.1, t+0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, t+0.4);
    osc.connect(gain2); gain2.connect(ctx.destination);
    osc.start(t+0.05); osc.stop(t+0.4);
  } catch(e){}
}

// 해제 - 가벼운 소리
function playUnequipSound(){
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(250, t+0.15);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t+0.2);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t+0.2);
  } catch(e){}
}
let _audioCtx = null;
function getAudioCtx(){
  if(!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

// 신단수 등장 - 신비로운 종소리 + 저음 드론
function playShindansuSound(){
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;

    // 저음 드론 (신비로운 분위기)
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(80, t);
    drone.frequency.linearRampToValueAtTime(85, t+3);
    droneGain.gain.setValueAtTime(0, t);
    droneGain.gain.linearRampToValueAtTime(0.15, t+0.5);
    droneGain.gain.linearRampToValueAtTime(0.1, t+2.5);
    droneGain.gain.linearRampToValueAtTime(0, t+4);
    drone.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start(t); drone.stop(t+4);

    // 종소리 3번 (서로 다른 음높이)
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + i*0.6);
      gain.gain.linearRampToValueAtTime(0.3, t + i*0.6 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i*0.6 + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i*0.6);
      osc.stop(t + i*0.6 + 1.5);

      // 배음 추가
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;
      gain2.gain.setValueAtTime(0, t + i*0.6);
      gain2.gain.linearRampToValueAtTime(0.1, t + i*0.6 + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + i*0.6 + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + i*0.6);
      osc2.stop(t + i*0.6 + 1.0);
    });
  } catch(e){}
}

// 도구 지급 - 금속 소리
function playGiveToolsSound(){
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [0, 0.15, 0.3].forEach((delay, i) => {
      const buf = ctx.createBuffer(1, ctx.sampleRate*0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for(let j=0; j<data.length; j++){
        data[j] = (Math.random()*2-1) * Math.exp(-j/(ctx.sampleRate*0.08));
      }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800 + i*200;
      filter.Q.value = 5;
      src.buffer = buf;
      gain.gain.setValueAtTime(0.4, t+delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t+delay+0.3);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t+delay);
    });
  } catch(e){}
}

// 착용 완료 - 가벼운 딩동
function playEquipSound(){
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, t + i*0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i*0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i*0.12);
      osc.stop(t + i*0.12 + 0.4);
    });
  } catch(e){}
}

// 튜토리얼 완료 - 밝은 팡파레
function playTutorialCompleteSound(){
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, t + i*0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i*0.15 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i*0.15);
      osc.stop(t + i*0.15 + 0.5);
    });
  } catch(e){}
}

// 채집 완료 - 자연스러운 소리
function playGatherCompleteSound(){
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [392, 523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, t + i*0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i*0.1 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i*0.1);
      osc.stop(t + i*0.1 + 0.6);
    });
  } catch(e){}
}

let _tutorialStartTimer = null;

function startTutorial(){
  if(G.tutorialDone) return;
  tutStep = G.tutorialStep || 0;
  tutWaiting = false;
  showTab('village');
  // 이전에 튜토리얼을 완료한 적 있으면 건너뛰기 표시
  const hasCompletedBefore = localStorage.getItem('cheonson_tutorial_done') === 'true';
  const skipBtn = document.getElementById('tutorial-skip-btn');
  if(skipBtn) skipBtn.style.display = hasCompletedBefore ? 'inline-block' : 'none';
  _tutorialStartTimer = setTimeout(()=>{
    _tutorialStartTimer = null;
    document.getElementById('tutorial-overlay').classList.add('active');
    document.getElementById('tutorial-dialog').classList.add('show');
    runTutorialStep();
  }, 800);
}

// 튜토리얼 완료 시 도구 제작법 지급
function giveToolRecipes(){
  if(!G.craftSkills) G.craftSkills = {};
  // tool 스킬 자체를 습득 처리
  G.craftSkills['tool'] = true;
  toast('📖 돌호미, 돌곡괭이, 돌도끼 제작법을 습득했습니다!');
  saveGame();
}

function skipTutorial(){
  if(!confirm('튜토리얼을 건너뛰시겠습니까?\n(도구는 자동으로 지급됩니다)')) return;
  // 대화창 즉시 닫기
  document.getElementById('tutorial-dialog').classList.remove('show');
  clearTutLock(); // 클릭 잠금 해제
  // 시작 타이머 취소
  if(_tutorialStartTimer){ clearTimeout(_tutorialStartTimer); _tutorialStartTimer = null; }
  // 모든 대기 타이머 강제 취소
  if(_waitEquipTimer){ clearInterval(_waitEquipTimer); _waitEquipTimer = null; }
  if(_waitEquipAllTimer){ clearInterval(_waitEquipAllTimer); _waitEquipAllTimer = null; }
  if(_waitSsukTimer){ clearInterval(_waitSsukTimer); _waitSsukTimer = null; }
  // 진행 중인 튜토리얼 완전 정지
  tutWaiting = false;
  if(tutTyping){ clearInterval(tutTyping); tutTyping = null; }
  // 도구 지급
  if(!G.inventory.some(i=>i&&i.name==='호미'))   addToInventory({name:'호미',   icon:'images/tools/homi.png',    type:'tool', skill:'gather',  dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
  if(!G.inventory.some(i=>i&&i.name==='곡괭이')) addToInventory({name:'곡괭이', icon:'images/tools/pickaxe.png', type:'tool', skill:'mining',  dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
  if(!G.inventory.some(i=>i&&i.name==='도끼'))   addToInventory({name:'도끼',   icon:'images/tools/axe.png',     type:'tool', skill:'logging', dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
  G.tutorialDone = true;
  G.tutorialStep = 0;
  // 생활 스킬 지급
  if(!G.lifeSkills) G.lifeSkills = {};
  G.lifeSkills['gather'] = true;
  G.lifeSkills['logging'] = true;
  G.lifeSkills['mining'] = true;
  giveToolRecipes();
  saveGame();
  // 화살표/강조 모두 제거
  hideInvArrow && hideInvArrow();
  hideGatherArrow && hideGatherArrow();
  hideShindansuArrow && hideShindansuArrow();
  document.querySelectorAll('.village-btn').forEach(b=>b.style.animation='');
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('tab-highlight'));
  // 안내 팝업
  showSkipTutorialNotice();
}

function showSkipTutorialNotice(){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center';
  const box = document.createElement('div');
  box.style.cssText = 'background:#110d08;border:2px solid #c9922a;border-radius:8px;padding:1.5rem 2rem;max-width:360px;width:90%;text-align:center';
  box.innerHTML = `
    <div style="font-size:2rem;margin-bottom:.8rem">⚠️</div>
    <div style="font-size:.95rem;font-weight:700;color:#e8b84b;margin-bottom:1rem">도구 사용 안내</div>
    <div style="font-size:.82rem;color:#f0e6c8;line-height:1.9;margin-bottom:1.2rem">
      지급된 <span style="color:#e8b84b">호미·곡괭이·도끼</span>는<br>
      파손되면 다시 구매할 수 없습니다.<br><br>
      파손 시 <span style="color:#6abf4a">대장간 → 제작 탭</span>에서<br>
      <span style="color:#e8b84b">돌호미·돌곡괭이·돌도끼</span>를<br>
      직접 제작하여 사용하십시오.<br><br>
      <span style="font-size:.72rem;color:#aaa">(재료: 돌조각 5개 + 소나무 2개)</span>
    </div>
    <button onclick="this.closest('div[style*=fixed]').remove()"
      style="background:#c9922a;border:none;color:#1a1200;font-size:.9rem;font-weight:700;padding:.6rem 2.5rem;border-radius:4px;cursor:pointer;letter-spacing:.05em">
      확인
    </button>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function runTutorialStep(){
  if(tutStep >= TUTORIAL_STEPS.length) return;
  const step = TUTORIAL_STEPS[tutStep];

  // trigger 단계는 특정 행동 후에만 실행 (건너뜀)
  if(step.trigger) { return; } // trigger 발동 대기 (tutorialTrigger에서 처리)

  // 화자 설정
  document.getElementById('tutorial-speaker').textContent = step.speaker || '신단수';

  // 액션 처리
  if(step.action === 'shindansu_light'){
    document.getElementById('shindansu-light').classList.add('show');
    playShindansuSound();
  } else if(step.action === 'give_tools'){
    // 도구 지급 (없는 것만)
    if(!G.inventory.some(i=>i&&i.name==='호미'))   addToInventory({name:'호미',   icon:'images/tools/homi.png',    type:'tool', skill:'gather',  dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
    if(!G.inventory.some(i=>i&&i.name==='곡괭이')) addToInventory({name:'곡괭이', icon:'images/tools/pickaxe.png', type:'tool', skill:'mining',  dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
    if(!G.inventory.some(i=>i&&i.name==='도끼'))   addToInventory({name:'도끼',   icon:'images/tools/axe.png',     type:'tool', skill:'logging', dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
    renderInv();
    playGiveToolsSound();
    toast('🎁 호미, 곡괭이, 도끼를 받았습니다!');
  } else if(step.action === 'highlight_forge'){
    highlightVillageBuilding('forge');
  } else if(step.action === 'close_and_highlight_forge'){
    typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
      const nextBtn = document.getElementById('tutorial-next');
      nextBtn.classList.add('show');
      nextBtn.onclick = ()=>{
        nextBtn.classList.remove('show');
        document.getElementById('tutorial-dialog').classList.remove('show');
        setTimeout(()=>{ 
          highlightVillageBuilding('forge');
          document.getElementById('forge-arrow').style.display='block';
          document.getElementById('forge-arrow-label').style.display='block';
          // 대장간 버튼만 클릭 허용
          const forgeBtn = Array.from(document.querySelectorAll('.village-btn')).find(b=>b.getAttribute('onclick')?.includes("'forge'"));
          if(forgeBtn) setTutLock(forgeBtn);
        }, 400);
        tutStep++;
        nextBtn.onclick = tutorialNext;
      };
    });
    return;
  } else if(step.action === 'highlight_inv'){
    // 인벤토리 탭 깜빡임 강조만 (유저가 직접 클릭해야 함)
    highlightTabBtn('inv');
  } else if(step.action === 'highlight_inv_and_wait'){
    typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
      const nextBtn = document.getElementById('tutorial-next');
      nextBtn.classList.add('show');
      nextBtn.onclick = ()=>{
        document.getElementById('tutorial-dialog').classList.remove('show');
        nextBtn.classList.remove('show');
        nextBtn.onclick = null; // 착용 대기 중 다음 버튼 완전 비활성화
        setTimeout(()=>{
          showInvArrow();
          const invBtn = document.querySelectorAll('.tab-btn')[['hunt','gather','char','skill','inv','village','build','quest'].indexOf('inv')];
          if(invBtn){
            setTutLock(invBtn);
            // 탭 클릭하는 순간 잠금 해제 → 인벤토리 안에서 자유롭게 클릭 가능
            invBtn.addEventListener('click', ()=>clearTutLock(), {once:true});
          }
        }, 300);
        tutWaiting = true;
        waitForEquip('호미', ()=>{
          tutWaiting = false;
          clearTutLock();
          playEquipSound();
          hideInvArrow();
          setTimeout(()=>{
            if(!G.tutorialDone){
              document.getElementById('tutorial-dialog').classList.add('show');
              nextBtn.onclick = tutorialNext;
              tutStep++;
              runTutorialStep();
            }
          }, 500);
        });
      };
    });
    return;
  } else if(step.action === 'wait_equip_all'){
    typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
      const nextBtn = document.getElementById('tutorial-next');
      nextBtn.classList.add('show');
      nextBtn.onclick = ()=>{
        document.getElementById('tutorial-dialog').classList.remove('show');
        nextBtn.classList.remove('show');
        nextBtn.onclick = null; // 착용 대기 중 완전 비활성화
        setTimeout(()=>{
          showInvArrow();
          // 이미 인벤토리에 있으므로 잠금 없이 자유롭게
        }, 300);
        tutWaiting = true;
        waitForEquipAll(()=>{
          tutWaiting = false;
          clearTutLock();
          playEquipSound();
          hideInvArrow();
          setTimeout(()=>{
            if(!G.tutorialDone){
              document.getElementById('tutorial-dialog').classList.add('show');
              nextBtn.onclick = tutorialNext;
              tutStep++;
              runTutorialStep();
            }
          }, 500);
        });
      };
    });
    return;
  } else if(step.action === 'give_gather_skill'){
    if(!G.lifeSkills) G.lifeSkills = {};
    G.lifeSkills['gather'] = true;
    saveGame();
    toast('🌿 채집 스킬을 습득했습니다!');
  } else if(step.action === 'give_logging_skill'){
    if(!G.lifeSkills) G.lifeSkills = {};
    G.lifeSkills['logging'] = true;
    saveGame();
    toast('🪓 벌목 스킬을 습득했습니다!');
  } else if(step.action === 'give_mining_skill'){
    if(!G.lifeSkills) G.lifeSkills = {};
    G.lifeSkills['mining'] = true;
    saveGame();
    toast('⛏ 채광 스킬을 습득했습니다!');
  } else if(step.action === 'give_homi_recipe'){
    if(!G.craftSkills) G.craftSkills = {};
    G.craftSkills['tool_homi'] = true;
    saveGame();
    toast('📖 돌호미 제작서를 획득했습니다! (대장간 → 제작)');
  } else if(step.action === 'give_axe_recipe'){
    if(!G.craftSkills) G.craftSkills = {};
    G.craftSkills['tool'] = true;
    G.craftSkills['tool_axe'] = true;
    saveGame();
    toast('📖 돌도끼 제작서를 획득했습니다! (대장간 → 제작)');
  } else if(step.action === 'give_pickaxe_recipe'){
    if(!G.craftSkills) G.craftSkills = {};
    G.craftSkills['tool_pickaxe'] = true;
    saveGame();
    toast('📖 돌곡괭이 제작서를 획득했습니다! (대장간 → 제작)');
  } else if(step.action === 'highlight_shindansu'){
    highlightVillageBuilding('shindansu');
  } else if(step.action === 'quest_gather_ssuk'){
    typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
      const nextBtn = document.getElementById('tutorial-next');
      nextBtn.classList.add('show');
      nextBtn.onclick = ()=>{
        document.getElementById('tutorial-dialog').classList.remove('show');
        nextBtn.classList.remove('show');
        nextBtn.onclick = tutorialNext;
        setTimeout(()=>{
          showGatherArrow();
          // 채집터 탭만 클릭 허용
          const gBtn = document.querySelectorAll('.tab-btn')[['hunt','gather','char','skill','inv','village','build','quest'].indexOf('gather')];
          if(gBtn){
            setTutLock(gBtn);
            // 탭 클릭하는 순간 잠금 해제 → 채집터 안에서 자유롭게 클릭 가능
            gBtn.addEventListener('click', ()=>clearTutLock(), {once:true});
          }
        }, 300);
        tutWaiting = true;
        if(_waitSsukTimer){ clearInterval(_waitSsukTimer); }
        _waitSsukTimer = setInterval(()=>{
          const cnt = (G.mats['쑥']||0) + (G.inventory.filter(i=>i&&i.name==='쑥').reduce((s,i)=>s+(i.qty||1),0));
          if(cnt >= 10){
            clearInterval(_waitSsukTimer); _waitSsukTimer = null;
            tutWaiting = false;
            hideGatherArrow();
            playGatherCompleteSound();
            toast('✨ 쑥 10개 채집 완료! 신단수로 돌아가세요.');
            setTimeout(()=>{ showTab('village'); showShindansuArrow(); highlightVillageBuilding('shindansu');
              const sdBtn2 = Array.from(document.querySelectorAll('.village-btn')).find(b=>b.getAttribute('onclick')?.includes("'shindansu'"));
              if(sdBtn2) setTutLock(sdBtn2); tutStep++; }, 800);
          }
        }, 1000);
      };
    });
    return;
  } else if(step.action === 'quest_logging'){
    typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
      const nextBtn = document.getElementById('tutorial-next');
      nextBtn.classList.add('show');
      nextBtn.onclick = ()=>{
        document.getElementById('tutorial-dialog').classList.remove('show');
        nextBtn.classList.remove('show');
        nextBtn.onclick = tutorialNext;
        setTimeout(()=>{
          showGatherArrow();
          // 채집터 탭만 클릭 허용
          const gBtn = document.querySelectorAll('.tab-btn')[['hunt','gather','char','skill','inv','village','build','quest'].indexOf('gather')];
          if(gBtn){
            setTutLock(gBtn);
            // 탭 클릭하는 순간 잠금 해제 → 채집터 안에서 자유롭게 클릭 가능
            gBtn.addEventListener('click', ()=>clearTutLock(), {once:true});
          }
        }, 300);
        tutWaiting = true;
        if(_waitSsukTimer){ clearInterval(_waitSsukTimer); }
        _waitSsukTimer = setInterval(()=>{
          const cnt = G.mats['나뭇가지']||0;
          if(cnt >= 10){
            clearInterval(_waitSsukTimer); _waitSsukTimer = null;
            tutWaiting = false;
            hideGatherArrow();
            playGatherCompleteSound();
            toast('✨ 나뭇가지 10개 벌목 완료! 신단수로 돌아가세요.');
            setTimeout(()=>{ showTab('village'); showShindansuArrow(); highlightVillageBuilding('shindansu');
              const sdBtn2 = Array.from(document.querySelectorAll('.village-btn')).find(b=>b.getAttribute('onclick')?.includes("'shindansu'"));
              if(sdBtn2) setTutLock(sdBtn2); tutStep++; }, 800);
          }
        }, 1000);
      };
    });
    return;
  } else if(step.action === 'quest_mining'){
    typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
      const nextBtn = document.getElementById('tutorial-next');
      nextBtn.classList.add('show');
      nextBtn.onclick = ()=>{
        document.getElementById('tutorial-dialog').classList.remove('show');
        nextBtn.classList.remove('show');
        nextBtn.onclick = tutorialNext;
        setTimeout(()=>{
          showGatherArrow();
          // 채집터 탭만 클릭 허용
          const gBtn = document.querySelectorAll('.tab-btn')[['hunt','gather','char','skill','inv','village','build','quest'].indexOf('gather')];
          if(gBtn){
            setTutLock(gBtn);
            // 탭 클릭하는 순간 잠금 해제 → 채집터 안에서 자유롭게 클릭 가능
            gBtn.addEventListener('click', ()=>clearTutLock(), {once:true});
          }
        }, 300);
        tutWaiting = true;
        if(_waitSsukTimer){ clearInterval(_waitSsukTimer); }
        _waitSsukTimer = setInterval(()=>{
          const cnt = G.mats['철광석']||0;
          if(cnt >= 10){
            clearInterval(_waitSsukTimer); _waitSsukTimer = null;
            tutWaiting = false;
            hideGatherArrow();
            playGatherCompleteSound();
            toast('✨ 철광석 10개 채광 완료! 신단수로 돌아가세요.');
            setTimeout(()=>{ showTab('village'); showShindansuArrow(); highlightVillageBuilding('shindansu');
              const sdBtn2 = Array.from(document.querySelectorAll('.village-btn')).find(b=>b.getAttribute('onclick')?.includes("'shindansu'"));
              if(sdBtn2) setTutLock(sdBtn2); tutStep++; }, 800);
          }
        }, 1000);
      };
    });
    return;
  } else if(step.action === 'close_and_highlight_shindansu'){
    typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
      const nextBtn = document.getElementById('tutorial-next');
      nextBtn.classList.add('show');
      nextBtn.onclick = ()=>{
        document.getElementById('tutorial-dialog').classList.remove('show');
        nextBtn.classList.remove('show');
        nextBtn.onclick = tutorialNext;
        // 마을 탭으로 이동 후 신단수 강조
        setTimeout(()=>{
          showTab('village');
          closeBuildingPanel();
          highlightVillageBuilding('shindansu');
          showShindansuArrow();
          // 신단수 버튼만 클릭 허용
          const sdBtn = Array.from(document.querySelectorAll('.village-btn')).find(b=>b.getAttribute('onclick')?.includes("'shindansu'"));
          if(sdBtn) setTutLock(sdBtn);
        }, 400);
        tutStep++; // trigger 단계 건너뜀
      };
    });
    return;
  } else if(step.action === 'end_tutorial'){
    G.tutorialDone = true;
    G.tutorialStep = 0;
    giveToolRecipes();
    // 완료 이력 저장 (다음 새 게임에서 건너뛰기 표시용)
    localStorage.setItem('cheonson_tutorial_done', 'true');
    saveGame();
    playTutorialCompleteSound();
    setTimeout(()=>{ endTutorial(); }, 3000);
  }

  // 타이핑 효과
  typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
    const nextBtn = document.getElementById('tutorial-next');
    if(step.action !== 'wait_equip_homi' && step.action !== 'wait_equip_all' && step.action !== 'end_tutorial'){
      nextBtn.classList.add('show');
    }
  });
}

function typeText(text, onDone){
  if(tutTyping) clearInterval(tutTyping);
  const el = document.getElementById('tutorial-text-inner');
  el.innerHTML = '';
  document.getElementById('tutorial-next').classList.remove('show');
  // \n → <br> 변환
  const processedText = text.replace(/\n/g, '<br>');
  // HTML 태그 포함 여부 확인
  const hasHtml = processedText.includes('<');
  if(hasHtml){
    el.innerHTML = processedText;
    if(onDone) onDone();
    return;
  }
  let i = 0;
  tutTyping = setInterval(()=>{
    el.textContent += text[i++];
    if(i >= text.length){
      clearInterval(tutTyping);
      tutTyping = null;
      if(onDone) onDone();
    }
  }, 40);
}

function tutorialNext(){
  if(tutWaiting) return; // 착용 대기 중엔 무시
  if(tutTyping){
    clearInterval(tutTyping); tutTyping = null;
    const step = TUTORIAL_STEPS[tutStep];
    document.getElementById('tutorial-text-inner').textContent = 
      (step.text||'').replace('{name}', G.char.name||'천손');
    document.getElementById('tutorial-next').classList.add('show');
    return;
  }
  document.getElementById('tutorial-next').classList.remove('show');
  tutStep++;
  G.tutorialStep = tutStep;
  saveGame();
  runTutorialStep();
}

function highlightTabBtn(tabId){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('tab-highlight'));
  const tabs = ['hunt','gather','char','skill','inv','village','build','quest'];
  const idx = tabs.indexOf(tabId);
  if(idx >= 0) document.querySelectorAll('.tab-btn')[idx]?.classList.add('tab-highlight');
}

function highlightVillageBuilding(building){
  // 마을 탭이 아니면 이동
  showTab('village');
  // 해당 건물 버튼에 강조
  document.querySelectorAll('.village-btn').forEach(b=>{
    b.style.animation = b.getAttribute('onclick')?.includes(`'${building}'`) 
      ? 'tab-pulse 1s infinite' : '';
  });
}

let _waitEquipTimer = null;
let _waitEquipAllTimer = null;
let _waitSsukTimer = null;

function waitForEquip(toolName, callback){
  const getEquipped = ()=>{
    const idx = G.inventory.findIndex(i=>i&&i.name===toolName);
    return idx>=0 && G.equippedTools && Object.values(G.equippedTools).includes(idx);
  };
  if(getEquipped()){
    const idx = G.inventory.findIndex(i=>i&&i.name===toolName);
    const skill = G.inventory[idx]?.skill;
    if(skill && G.equippedTools) G.equippedTools[skill] = null;
    renderInv && renderInv();
  }
  if(_waitEquipTimer){ clearInterval(_waitEquipTimer); _waitEquipTimer = null; }
  _waitEquipTimer = setInterval(()=>{
    if(getEquipped()){ clearInterval(_waitEquipTimer); _waitEquipTimer = null; callback(); }
  }, 500);
}

function waitForEquipAll(callback){
  if(_waitEquipAllTimer){ clearInterval(_waitEquipAllTimer); _waitEquipAllTimer = null; }
  _waitEquipAllTimer = setInterval(()=>{
    const homiIdx = G.inventory.findIndex(i=>i&&i.name==='호미');
    const pickIdx = G.inventory.findIndex(i=>i&&i.name==='곡괭이');
    const axeIdx  = G.inventory.findIndex(i=>i&&i.name==='도끼');
    const allEquipped =
      homiIdx>=0 && Object.values(G.equippedTools||{}).includes(homiIdx) &&
      pickIdx>=0 && Object.values(G.equippedTools||{}).includes(pickIdx) &&
      axeIdx>=0  && Object.values(G.equippedTools||{}).includes(axeIdx);
    if(allEquipped){ clearInterval(_waitEquipAllTimer); _waitEquipAllTimer = null; callback(); }
  }, 500);
}

function showInvArrow(){
  const tabs = ['hunt','gather','char','skill','inv','village','build','quest'];
  const invIdx = tabs.indexOf('inv');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const invBtn = tabBtns[invIdx];
  if(!invBtn) return;
  const rect = invBtn.getBoundingClientRect();
  const arrow = document.getElementById('inv-arrow');
  const label = document.getElementById('inv-arrow-label');
  arrow.style.left = (rect.left + rect.width/2 - 20) + 'px';
  arrow.style.top = (rect.bottom + 4) + 'px';
  arrow.style.display = 'block';
  label.style.left = (rect.left + rect.width/2 - 95) + 'px';
  label.style.top = (rect.bottom + 48) + 'px';
  label.style.display = 'block';
  highlightTabBtn('inv');
  // 인벤토리 착용 팁도 표시
  const tip = document.getElementById('inv-equip-tip');
  if(tip) tip.style.display = 'block';
}

function hideInvArrow(){
  document.getElementById('inv-arrow').style.display = 'none';
  document.getElementById('inv-arrow-label').style.display = 'none';
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('tab-highlight'));
  const tip = document.getElementById('inv-equip-tip');
  if(tip) tip.style.display = 'none';
}

function showGatherArrow(){
  const tabs = ['hunt','gather','char','skill','inv','village','build','quest'];
  const idx = tabs.indexOf('gather');
  const btn = document.querySelectorAll('.tab-btn')[idx];
  if(!btn) return;
  const rect = btn.getBoundingClientRect();
  const arrow = document.getElementById('gather-arrow');
  const label = document.getElementById('gather-arrow-label');
  arrow.style.left = (rect.left + rect.width/2 - 20) + 'px';
  arrow.style.top = (rect.bottom + 4) + 'px';
  arrow.style.display = 'block';
  label.style.left = (rect.left + rect.width/2 - 110) + 'px';
  label.style.top = (rect.bottom + 48) + 'px';
  label.style.display = 'block';
  highlightTabBtn('gather');
}

function hideGatherArrow(){
  document.getElementById('gather-arrow').style.display = 'none';
  document.getElementById('gather-arrow-label').style.display = 'none';
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('tab-highlight'));
}

function showShindansuArrow(){
  document.getElementById('shindansu-arrow').style.display = 'block';
  document.getElementById('shindansu-arrow-label').style.display = 'block';
}

function hideShindansuArrow(){
  document.getElementById('shindansu-arrow').style.display = 'none';
  document.getElementById('shindansu-arrow-label').style.display = 'none';
  document.querySelectorAll('.village-btn').forEach(b=>b.style.animation='');
}

function endTutorial(){
  clearTutLock();
  document.getElementById('tutorial-overlay').classList.remove('active');
  document.getElementById('tutorial-dim').classList.remove('show');
  document.getElementById('shindansu-light').classList.remove('show');
  document.getElementById('tutorial-dialog').classList.remove('show');
  document.querySelectorAll('.village-btn').forEach(b=>b.style.animation='');
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('tab-highlight'));
  // 다음 버튼 onclick 초기화
  const nextBtn = document.getElementById('tutorial-next');
  if(nextBtn){ nextBtn.onclick = tutorialNext; nextBtn.classList.remove('show'); }
  if(!G.tutorialDone) toast('✨ 튜토리얼 완료! 천손의 여정이 시작됩니다.');
}

// 대장간 클릭 시 튜토리얼 step 연결
function tutorialTrigger(trigger){
  if(G.tutorialDone) return false;
  const step = TUTORIAL_STEPS[tutStep];
  if(step && step.trigger === trigger){
    clearTutLock(); // 잠금 해제
    document.getElementById('tutorial-dialog').classList.add('show');
    // trigger step의 텍스트 직접 표시
    document.getElementById('tutorial-speaker').textContent = step.speaker || '신단수';
    typeText(step.text.replace('{name}', G.char.name||'천손'), ()=>{
      const nextBtn = document.getElementById('tutorial-next');
      nextBtn.classList.add('show');
      nextBtn.onclick = ()=>{
        nextBtn.classList.remove('show');
        nextBtn.onclick = tutorialNext;
        tutStep++;
        runTutorialStep();
      };
    });
    return true;
  }
  return false;
}
