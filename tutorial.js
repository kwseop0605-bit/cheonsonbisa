// ── 천손비사 튜토리얼 모듈 (전면 재작성) ─────────────────────────────
// tutorial.js

// ═══════════════════════════════════════════════════════
// 튜토리얼 스텝 정의
// phase: 현재 단계를 나타내는 문자열 (updateQuestHUD에서 사용)
// ═══════════════════════════════════════════════════════
const TUTORIAL_STEPS = [
  // 0~3: 신단수 첫 대화
  { speaker:'신단수', text:'...', action:'shindansu_light', phase:'신단수' },
  { speaker:'신단수', text:'하늘의 백성 {name}.... 마침내 네가 천손임을 각성하였구나.', phase:'신단수' },
  { speaker:'신단수', text:'이 땅에 천손의 혈맥이 깨어난 것은 오랜 세월 만의 일이로다.', phase:'신단수' },
  { speaker:'신단수', text:'이제 천손으로 살아가는 법을 가르쳐주겠노라.', phase:'신단수' },
  // 4: 대장간으로 안내
  { speaker:'신단수', text:'먼저 저 대장간의 <span style="color:#e8b84b;font-weight:700">불메장이</span>를 찾아가거라.\n그가 네 첫걸음을 도와줄 것이니라.', action:'go_forge', phase:'대장간' },
  // 5~11: 대장간 (forge 클릭 후 trigger:'forge'로 진입)
  { speaker:'불메장이', text:'신단수께서 계시를 주셔서 오랫동안 기다렸습니다.', trigger:'forge', phase:'대장간' },
  { speaker:'불메장이', text:'이제 {name}님이 오셨군요. 어서 오십시오.', phase:'대장간' },
  { speaker:'불메장이', text:'천손으로 살아가시는 데 도움이 될\n\'호미\', \'도끼\', \'곡괭이\'를 드리겠습니다.', action:'give_tools', phase:'대장간' },
  { speaker:'불메장이', text:'채집, 벌목, 채광에 쓰이는 도구입니다.\n잘 간수하시길 바랍니다.', phase:'대장간' },
  { speaker:'불메장이', text:'하단의 인벤토리 탭을 눌러보십시오.\n호미를 클릭하여 장착 메뉴를 열고 착용하시면 됩니다.', action:'wait_equip_homi', phase:'대장간' },
  { speaker:'불메장이', text:'허허, 잘 하셨습니다.\n나머지 곡괭이와 도끼도 같은 방법으로 착용하십시오.', action:'wait_equip_all', phase:'대장간' },
  { speaker:'불메장이', text:'모든 도구를 갖추셨군요. 이제 준비가 되셨습니다.\n신단수께 돌아가 다음 가르침을 받으십시오.', action:'go_shindansu', phase:'신단수귀환' },
  // 12~16: 신단수 복귀 (shindansu_return trigger)
  { speaker:'신단수', text:'불메장이에게 호미, 도끼, 곡괭이 착용법은 잘 배웠구나.', trigger:'shindansu_return', phase:'신단수귀환' },
  { speaker:'신단수', text:'호미는 채집, 도끼는 벌목, 곡괭이는 채광을 할 수 있다.\n이제 직접 사용해보도록 하자.', phase:'쑥채집' },
  { speaker:'신단수', text:'먼저 채집을 해보거라.\n쑥 10개를 채집해서 가져오거라.', phase:'쑥채집' },
  { speaker:'신단수', text:'채집 스킬을 내리겠노라.\n이제 들판에서 채집을 할 수 있느니라.', action:'give_gather_skill', phase:'쑥채집' },
  { speaker:'신단수', text:'쑥은 들판 채집터에서 캘 수 있느니라.\n하단의 채집터 탭을 눌러 들판으로 나아가거라.', action:'wait_ssuk', phase:'쑥채집' },
  // 17: 쑥 완료 후 신단수 클릭 (ssuk_done trigger)
  { speaker:'신단수', text:'잘 하였노라. 돌호미 제작서를 내리겠다.', trigger:'ssuk_done', action:'give_homi_recipe', phase:'나뭇가지채집' },
  { speaker:'신단수', text:'이번엔 벌목을 해보거라.\n숲속 채집터에서 나뭇가지 10개를 가져오거라.', phase:'나뭇가지채집' },
  { speaker:'신단수', text:'벌목 스킬을 내리겠노라.\n이제 숲속에서 벌목을 할 수 있느니라.', action:'give_logging_skill', phase:'나뭇가지채집' },
  { speaker:'신단수', text:'하단의 채집터 탭을 눌러 숲속으로 나아가거라.', action:'wait_logging', phase:'나뭇가지채집' },
  // 21: logging_done trigger
  { speaker:'신단수', text:'잘 하였노라. 돌도끼 제작서를 내리겠다.', trigger:'logging_done', action:'give_axe_recipe', phase:'철광석채집' },
  { speaker:'신단수', text:'마지막으로 채광을 해보거라.\n광산 채광터에서 철광석 10개를 가져오거라.', phase:'철광석채집' },
  { speaker:'신단수', text:'채광 스킬을 내리겠노라.\n이제 광산에서 채광을 할 수 있느니라.', action:'give_mining_skill', phase:'철광석채집' },
  { speaker:'신단수', text:'하단의 채집터 탭을 눌러 광산으로 나아가거라.', action:'wait_mining', phase:'철광석채집' },
  // 25: mining_done trigger
  { speaker:'신단수', text:'잘 하였노라. 돌곡괭이 제작서를 내리겠다.', trigger:'mining_done', action:'give_pickaxe_recipe', phase:'마무리' },
  { speaker:'신단수', text:'천손의 길은 멀고도 험하나...\n하늘이 언제나 너와 함께하고 있음을 잊지 말아라.', phase:'마무리' },
  { speaker:'신단수', text:'마지막으로 한 가지 일러두겠다.\n채집, 벌목, 채광을 할 때 스페이스 키를 누르거나\n마우스를 클릭하면 채집 시간이 줄어드느니라.', phase:'마무리' },
  { speaker:'신단수', text:'이 한울의 세상에서는 모든 것을\n네 스스로 구해야 하느니라.', phase:'마무리' },
  { speaker:'신단수', text:'그리고 또 다른 천손을 찾아\n물물교환을 하며 살아가야 하느니라.', phase:'마무리' },
  { speaker:'신단수', text:'나는 언제나 이 자리에서\n너를 지켜보고 있을 것이니라.', action:'end_tutorial', phase:'마무리' },
];

// ═══════════════════════════════════════════════════════
// 상태 변수
// ═══════════════════════════════════════════════════════
let tutStep = 0;
let tutTyping = null;
let tutWaiting = false;
let _tutorialAllowedEl = null;
let _waitEquipTimer = null;
let _waitEquipAllTimer = null;
let _waitGatherTimer = null;
let _tutorialStartTimer = null;

// ═══════════════════════════════════════════════════════
// 클릭 잠금
// ═══════════════════════════════════════════════════════
document.addEventListener('click', function(e){
  if(!_tutorialAllowedEl) return;
  if(G && G.tutorialDone){ _tutorialAllowedEl = null; return; }
  if(_tutorialAllowedEl.contains(e.target) || _tutorialAllowedEl === e.target) return;
  const dialog = document.getElementById('tutorial-dialog');
  if(dialog && dialog.contains(e.target)) return;
  e.stopPropagation();
  e.preventDefault();
}, true);

function setTutLock(el){ _tutorialAllowedEl = el; }
function clearTutLock(){ _tutorialAllowedEl = null; }

// ═══════════════════════════════════════════════════════
// 퀘스트 HUD 업데이트 - phase 기반으로 단순하게
// ═══════════════════════════════════════════════════════
function updateQuestHUD(){
  const panel = document.getElementById('quest-panel');
  const titleEl = document.getElementById('quest-panel-title');
  const textEl = document.getElementById('quest-panel-text');
  if(!panel || !titleEl || !textEl) return;
  if(G.tutorialDone){ panel.style.display='none'; return; }

  const step = TUTORIAL_STEPS[tutStep] || TUTORIAL_STEPS[TUTORIAL_STEPS.length-1];
  const phase = step.phase || '';
  const mats = G.mats || {};

  let detail = '';
  if(phase === '신단수') {
    detail = '신단수와 대화하세요';
  } else if(phase === '대장간') {
    detail = '대장간 불메장이를 찾아가세요';
  } else if(phase === '신단수귀환') {
    detail = '신단수께 돌아가세요';
  } else if(phase === '쑥채집') {
    const cnt = mats['쑥']||0;
    if(cnt < 10) detail = `쑥 채집 ${cnt}/10`;
    else detail = '신단수께 돌아가세요';
  } else if(phase === '나뭇가지채집') {
    const cnt = mats['나뭇가지']||0;
    if(cnt < 10) detail = `나뭇가지 채집 ${cnt}/10`;
    else detail = '신단수께 돌아가세요';
  } else if(phase === '철광석채집') {
    const cnt = mats['철광석']||0;
    if(cnt < 10) detail = `철광석 채집 ${cnt}/10`;
    else detail = '신단수께 돌아가세요';
  } else if(phase === '마무리') {
    detail = '신단수와 대화하세요';
  } else {
    detail = '-';
  }

  titleEl.textContent = '천손 입문';
  textEl.textContent = detail;
  panel.style.display = 'block';
}

// ═══════════════════════════════════════════════════════
// tutStep 증가 - 오직 이 함수에서만
// ═══════════════════════════════════════════════════════
function advanceTutStep(){
  tutStep++;
  G.tutorialStep = tutStep;
  saveGame();
  updateQuestHUD();
}

// ═══════════════════════════════════════════════════════
// 타이핑 효과
// ═══════════════════════════════════════════════════════
function typeText(text, onDone){
  if(tutTyping) clearInterval(tutTyping);
  const el = document.getElementById('tutorial-text-inner');
  el.innerHTML = '';
  document.getElementById('tutorial-next').classList.remove('show');
  const processedText = text.replace(/\n/g, '<br>');
  if(processedText.includes('<')){
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

// ═══════════════════════════════════════════════════════
// 다음 버튼
// ═══════════════════════════════════════════════════════
function tutorialNext(){
  if(tutWaiting) return;
  if(tutTyping){
    clearInterval(tutTyping); tutTyping = null;
    const step = TUTORIAL_STEPS[tutStep];
    const el = document.getElementById('tutorial-text-inner');
    const text = (step.text||'').replace('{name}', G.char.name||'천손');
    if(text.includes('\n') || text.includes('<')){
      el.innerHTML = text.replace(/\n/g,'<br>');
    } else {
      el.textContent = text;
    }
    document.getElementById('tutorial-next').classList.add('show');
    return;
  }
  document.getElementById('tutorial-next').classList.remove('show');
  advanceTutStep();
  runTutorialStep();
}

// ═══════════════════════════════════════════════════════
// 대화창 표시 헬퍼
// ═══════════════════════════════════════════════════════
function showDialog(step, onDone){
  document.getElementById('tutorial-dialog').classList.add('show');
  document.getElementById('tutorial-speaker').textContent = step.speaker || '신단수';
  typeText((step.text||'').replace('{name}', G.char.name||'천손'), onDone);
}

function showNextBtn(callback){
  const btn = document.getElementById('tutorial-next');
  btn.classList.add('show');
  btn.onclick = ()=>{
    btn.classList.remove('show');
    btn.onclick = tutorialNext;
    if(callback) callback();
  };
}

// ═══════════════════════════════════════════════════════
// 메인 실행 함수
// ═══════════════════════════════════════════════════════
function runTutorialStep(){
  if(tutStep >= TUTORIAL_STEPS.length) return;
  const step = TUTORIAL_STEPS[tutStep];

  // trigger 단계: 특정 행동(건물 클릭 등) 대기 - 여기서 return
  if(step.trigger){ return; }

  document.getElementById('tutorial-speaker').textContent = step.speaker || '신단수';

  // ── 액션별 처리 ──
  if(step.action === 'shindansu_light'){
    document.getElementById('shindansu-light').classList.add('show');
    playShindansuSound();
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });

  } else if(step.action === 'go_forge'){
    showDialog(step, ()=>{
      const btn = document.getElementById('tutorial-next');
      btn.classList.add('show');
      btn.onclick = ()=>{
        btn.classList.remove('show');
        btn.onclick = tutorialNext;
        document.getElementById('tutorial-dialog').classList.remove('show');
        advanceTutStep(); // forge trigger 스텝으로
        _showForgeArrow();
      };
    });

  } else if(step.action === 'give_tools'){
    if(!G.inventory.some(i=>i&&i.name==='호미'))
      addToInventory({name:'호미', icon:'images/tools/homi.png', type:'tool', skill:'gather', dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
    if(!G.inventory.some(i=>i&&i.name==='곡괭이'))
      addToInventory({name:'곡괭이', icon:'images/tools/pickaxe.png', type:'tool', skill:'mining', dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
    if(!G.inventory.some(i=>i&&i.name==='도끼'))
      addToInventory({name:'도끼', icon:'images/tools/axe.png', type:'tool', skill:'logging', dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
    renderInv && renderInv();
    playGiveToolsSound();
    toast('🎁 호미, 곡괭이, 도끼를 받았습니다!');
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });

  } else if(step.action === 'wait_equip_homi'){
    // 호미 착용 대기 - 다음버튼은 advanceTutStep 없이 대화창만 닫음
    showDialog(step, ()=>{
      const btn = document.getElementById('tutorial-next');
      btn.classList.add('show');
      btn.onclick = ()=>{
        btn.classList.remove('show');
        btn.onclick = tutorialNext;
        document.getElementById('tutorial-dialog').classList.remove('show');
        showInvArrow();
        const invBtn = document.querySelectorAll('.tab-btn')[4];
        if(invBtn){ setTutLock(invBtn); invBtn.addEventListener('click', ()=>clearTutLock(), {once:true}); }
        tutWaiting = true;
        if(_waitEquipTimer) clearInterval(_waitEquipTimer);
        _waitEquipTimer = setInterval(()=>{
          const idx = G.inventory.findIndex(i=>i&&i.name==='호미');
          const equipped = idx>=0 && G.equippedTools && Object.values(G.equippedTools).includes(idx);
          if(equipped){
            clearInterval(_waitEquipTimer); _waitEquipTimer = null;
            tutWaiting = false;
            clearTutLock();
            playEquipSound();
            hideInvArrow();
            setTimeout(()=>{
              advanceTutStep();
              runTutorialStep();
            }, 500);
          }
        }, 500);
      };
    });

  } else if(step.action === 'wait_equip_all'){
    // 곡괭이+도끼 착용 대기
    showDialog(step, ()=>{
      const btn = document.getElementById('tutorial-next');
      btn.classList.add('show');
      setTutLock(btn);
      btn.onclick = ()=>{
        clearTutLock();
        btn.onclick = tutorialNext;
        btn.classList.remove('show');
        document.getElementById('tutorial-dialog').classList.remove('show');
        showInvArrow();
        tutWaiting = true;
        if(_waitEquipAllTimer) clearInterval(_waitEquipAllTimer);
        _waitEquipAllTimer = setInterval(()=>{
          const hi = G.inventory.findIndex(i=>i&&i.name==='호미');
          const pi = G.inventory.findIndex(i=>i&&i.name==='곡괭이');
          const ai = G.inventory.findIndex(i=>i&&i.name==='도끼');
          const eq = G.equippedTools||{};
          const allEq = hi>=0 && Object.values(eq).includes(hi)
                     && pi>=0 && Object.values(eq).includes(pi)
                     && ai>=0 && Object.values(eq).includes(ai);
          if(allEq){
            clearInterval(_waitEquipAllTimer); _waitEquipAllTimer = null;
            tutWaiting = false;
            clearTutLock();
            playEquipSound();
            hideInvArrow();
            setTimeout(()=>{
              advanceTutStep();
              runTutorialStep();
            }, 500);
          }
        }, 500);
      };
    });

  } else if(step.action === 'go_shindansu'){
    showDialog(step, ()=>{
      const btn = document.getElementById('tutorial-next');
      btn.classList.add('show');
      btn.onclick = ()=>{
        btn.classList.remove('show');
        btn.onclick = tutorialNext;
        document.getElementById('tutorial-dialog').classList.remove('show');
        advanceTutStep(); // shindansu_return trigger 스텝으로
        closeBuildingPanel && closeBuildingPanel();
        showTab('village');
        _showShindansuArrow();
        const sdBtn = Array.from(document.querySelectorAll('.village-btn'))
          .find(b=>b.getAttribute('onclick')?.includes("'shindansu'"));
        if(sdBtn) setTutLock(sdBtn);
      };
    });

  } else if(step.action === 'give_gather_skill'){
    if(!G.lifeSkills) G.lifeSkills = {};
    G.lifeSkills['gather'] = true;
    saveGame();
    toast('🌿 채집 스킬을 습득했습니다!');
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });

  } else if(step.action === 'give_logging_skill'){
    if(!G.lifeSkills) G.lifeSkills = {};
    G.lifeSkills['logging'] = true;
    saveGame();
    toast('🪓 벌목 스킬을 습득했습니다!');
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });

  } else if(step.action === 'give_mining_skill'){
    if(!G.lifeSkills) G.lifeSkills = {};
    G.lifeSkills['mining'] = true;
    saveGame();
    toast('⛏ 채광 스킬을 습득했습니다!');
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });

  } else if(step.action === 'wait_ssuk'){
    // 쑥 10개 채집 대기 - 다음버튼은 대화창만 닫음, tutStep 증가 없음
    showDialog(step, ()=>{
      const btn = document.getElementById('tutorial-next');
      btn.classList.add('show');
      btn.onclick = ()=>{
        btn.classList.remove('show');
        btn.onclick = tutorialNext;
        document.getElementById('tutorial-dialog').classList.remove('show');
        showGatherArrow();
        const gBtn = document.querySelectorAll('.tab-btn')[1];
        if(gBtn){ setTutLock(gBtn); gBtn.addEventListener('click', ()=>clearTutLock(), {once:true}); }
        tutWaiting = true;
        updateQuestHUD();
        if(_waitGatherTimer) clearInterval(_waitGatherTimer);
        _waitGatherTimer = setInterval(()=>{
          const cnt = (G.mats['쑥']||0) + (G.inventory.filter(i=>i&&i.name==='쑥').reduce((s,i)=>s+(i.qty||1),0));
          updateQuestHUD();
          if(cnt >= 10){
            clearInterval(_waitGatherTimer); _waitGatherTimer = null;
            tutWaiting = false;
            hideGatherArrow();
            playGatherCompleteSound();
            gatherStop && gatherStop();
            advanceTutStep(); // 16→17 (ssuk_done trigger 스텝)
            toast('✨ 쑥 10개 채집 완료! 신단수를 찾아가세요.');
            // 채집터 나가기 후 신단수 안내
            const origExit = window.exitGatherMap;
            window.exitGatherMap = function(){
              origExit && origExit();
              window.exitGatherMap = origExit;
              showTab('village');
              _showShindansuArrow();
              highlightVillageBuilding('shindansu');
              // 신단수 버튼만 클릭 허용 - 클릭 시 tutorialTrigger('ssuk_done') 발동
              const sdBtn = Array.from(document.querySelectorAll('.village-btn'))
                .find(b=>b.getAttribute('onclick')?.includes("'shindansu'"));
              if(sdBtn) setTutLock(sdBtn);
              updateQuestHUD();
            };
            // 나가기 버튼 잠금
            setTimeout(()=>{
              const backBtn = document.querySelector('#gathermap .back-btn');
              if(backBtn) setTutLock(backBtn);
            }, 300);
          }
        }, 1000);
      };
    });

  } else if(step.action === 'wait_logging'){
    showDialog(step, ()=>{
      const btn = document.getElementById('tutorial-next');
      btn.classList.add('show');
      btn.onclick = ()=>{
        document.getElementById('tutorial-dialog').classList.remove('show');
        showGatherArrow();
        const gBtn = document.querySelectorAll('.tab-btn')[1];
        if(gBtn){ setTutLock(gBtn); gBtn.addEventListener('click', ()=>clearTutLock(), {once:true}); }
        tutWaiting = true;
        updateQuestHUD();
        if(_waitGatherTimer) clearInterval(_waitGatherTimer);
        _waitGatherTimer = setInterval(()=>{
          const cnt = G.mats['나뭇가지']||0;
          updateQuestHUD();
          if(cnt >= 10){
            clearInterval(_waitGatherTimer); _waitGatherTimer = null;
            tutWaiting = false;
            hideGatherArrow();
            playGatherCompleteSound();
            gatherStop && gatherStop();
            advanceTutStep(); // logging_done trigger 스텝으로
            toast('✨ 나뭇가지 10개 벌목 완료! 신단수를 찾아가세요.');
            const origExit = window.exitGatherMap;
            window.exitGatherMap = function(){
              origExit && origExit();
              window.exitGatherMap = origExit;
              showTab('village');
              _showShindansuArrow();
              highlightVillageBuilding('shindansu');
              const sdBtn = Array.from(document.querySelectorAll('.village-btn'))
                .find(b=>b.getAttribute('onclick')?.includes("'shindansu'"));
              if(sdBtn) setTutLock(sdBtn);
              updateQuestHUD();
            };
            setTimeout(()=>{
              const backBtn = document.querySelector('#gathermap .back-btn');
              if(backBtn) setTutLock(backBtn);
            }, 300);
          }
        }, 1000);
      };
    });

  } else if(step.action === 'wait_mining'){
    showDialog(step, ()=>{
      const btn = document.getElementById('tutorial-next');
      btn.classList.add('show');
      btn.onclick = ()=>{
        document.getElementById('tutorial-dialog').classList.remove('show');
        showGatherArrow();
        const gBtn = document.querySelectorAll('.tab-btn')[1];
        if(gBtn){ setTutLock(gBtn); gBtn.addEventListener('click', ()=>clearTutLock(), {once:true}); }
        tutWaiting = true;
        updateQuestHUD();
        if(_waitGatherTimer) clearInterval(_waitGatherTimer);
        _waitGatherTimer = setInterval(()=>{
          const cnt = G.mats['철광석']||0;
          updateQuestHUD();
          if(cnt >= 10){
            clearInterval(_waitGatherTimer); _waitGatherTimer = null;
            tutWaiting = false;
            hideGatherArrow();
            playGatherCompleteSound();
            gatherStop && gatherStop();
            advanceTutStep(); // mining_done trigger 스텝으로
            toast('✨ 철광석 10개 채광 완료! 신단수를 찾아가세요.');
            const origExit = window.exitGatherMap;
            window.exitGatherMap = function(){
              origExit && origExit();
              window.exitGatherMap = origExit;
              showTab('village');
              _showShindansuArrow();
              highlightVillageBuilding('shindansu');
              const sdBtn = Array.from(document.querySelectorAll('.village-btn'))
                .find(b=>b.getAttribute('onclick')?.includes("'shindansu'"));
              if(sdBtn) setTutLock(sdBtn);
              updateQuestHUD();
            };
            setTimeout(()=>{
              const backBtn = document.querySelector('#gathermap .back-btn');
              if(backBtn) setTutLock(backBtn);
            }, 300);
          }
        }, 1000);
      };
    });

  } else if(step.action === 'give_homi_recipe'){
    addToInventory({name:'돌호미 제작서', icon:'📖', type:'recipe', recipeId:'tool_homi', desc:'돌호미 제작법이 담긴 책\n사용하면 제작법을 습득합니다.'});
    saveGame();
    toast('📖 돌호미 제작서를 받았습니다!');
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });

  } else if(step.action === 'give_axe_recipe'){
    addToInventory({name:'돌도끼 제작서', icon:'📖', type:'recipe', recipeId:'tool_axe', desc:'돌도끼 제작법이 담긴 책\n사용하면 제작법을 습득합니다.'});
    saveGame();
    toast('📖 돌도끼 제작서를 받았습니다!');
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });

  } else if(step.action === 'give_pickaxe_recipe'){
    addToInventory({name:'돌곡괭이 제작서', icon:'📖', type:'recipe', recipeId:'tool_pickaxe', desc:'돌곡괭이 제작법이 담긴 책\n사용하면 제작법을 습득합니다.'});
    saveGame();
    toast('📖 돌곡괭이 제작서를 받았습니다!');
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });

  } else if(step.action === 'end_tutorial'){
    // 즉시 tutorialDone 저장 (딜레이 전에 먼저)
    G.tutorialDone = true;
    G.tutorialStep = 0;
    localStorage.setItem('cheonson_tutorial_done', 'true');
    saveGame();
    showDialog(step, ()=>{
      setTimeout(()=>{
        giveToolRecipes();
        playTutorialCompleteSound();
        endTutorial();
        if(typeof updateQuestHUD === 'function') updateQuestHUD();
      }, 1000);
    });

  } else {
    // action 없는 일반 대화
    showDialog(step, ()=>{ document.getElementById('tutorial-next').classList.add('show'); });
  }
}

// ═══════════════════════════════════════════════════════
// trigger 발동 - openBuildingPanel에서 호출
// ═══════════════════════════════════════════════════════
function tutorialTrigger(trigger){
  if(G.tutorialDone) return false;
  const step = TUTORIAL_STEPS[tutStep];
  if(!step || step.trigger !== trigger) return false;

  clearTutLock();

  // trigger 스텝의 action 실행 (제작서 지급 등)
  if(step.action === 'give_homi_recipe'){
    addToInventory({name:'돌호미 제작서', icon:'📖', type:'recipe', recipeId:'tool_homi', desc:'돌호미 제작법이 담긴 책\n사용하면 제작법을 습득합니다.'});
    saveGame();
    toast('📖 돌호미 제작서를 받았습니다!');
  } else if(step.action === 'give_axe_recipe'){
    addToInventory({name:'돌도끼 제작서', icon:'📖', type:'recipe', recipeId:'tool_axe', desc:'돌도끼 제작법이 담긴 책\n사용하면 제작법을 습득합니다.'});
    saveGame();
    toast('📖 돌도끼 제작서를 받았습니다!');
  } else if(step.action === 'give_pickaxe_recipe'){
    addToInventory({name:'돌곡괭이 제작서', icon:'📖', type:'recipe', recipeId:'tool_pickaxe', desc:'돌곡괭이 제작법이 담긴 책\n사용하면 제작법을 습득합니다.'});
    saveGame();
    toast('📖 돌곡괭이 제작서를 받았습니다!');
  }

  // 대화 표시 후 다음 버튼으로 advanceTutStep
  document.getElementById('tutorial-dialog').classList.add('show');
  document.getElementById('tutorial-speaker').textContent = step.speaker || '신단수';
  typeText((step.text||'').replace('{name}', G.char.name||'천손'), ()=>{
    const btn = document.getElementById('tutorial-next');
    btn.classList.add('show');
    btn.onclick = ()=>{
      btn.classList.remove('show');
      btn.onclick = tutorialNext;
      advanceTutStep();
      runTutorialStep();
    };
  });

  return true;
}

// ═══════════════════════════════════════════════════════
// 화살표 표시/숨김
// ═══════════════════════════════════════════════════════
function _showForgeArrow(){
  document.getElementById('forge-arrow').style.display = 'block';
  document.getElementById('forge-arrow-label').style.display = 'block';
  highlightVillageBuilding('forge');
  const forgeBtn = Array.from(document.querySelectorAll('.village-btn'))
    .find(b=>b.getAttribute('onclick')?.includes("'forge'"));
  if(forgeBtn) setTutLock(forgeBtn);
}

function _hideForgeArrow(){
  document.getElementById('forge-arrow').style.display = 'none';
  document.getElementById('forge-arrow-label').style.display = 'none';
  document.querySelectorAll('.village-btn').forEach(b=>b.style.animation='');
}

function _showShindansuArrow(){
  document.getElementById('shindansu-arrow').style.display = 'block';
  document.getElementById('shindansu-arrow-label').style.display = 'block';
}

function hideShindansuArrow(){
  document.getElementById('shindansu-arrow').style.display = 'none';
  document.getElementById('shindansu-arrow-label').style.display = 'none';
  document.querySelectorAll('.village-btn').forEach(b=>b.style.animation='');
}

function showInvArrow(){
  const tabs = ['hunt','gather','char','skill','inv','village','build','quest'];
  const btn = document.querySelectorAll('.tab-btn')[tabs.indexOf('inv')];
  if(!btn) return;
  const rect = btn.getBoundingClientRect();
  const arrow = document.getElementById('inv-arrow');
  const label = document.getElementById('inv-arrow-label');
  arrow.style.left = (rect.left + rect.width/2 - 20) + 'px';
  arrow.style.top = (rect.bottom + 4) + 'px';
  arrow.style.display = 'block';
  label.style.left = (rect.left + rect.width/2 - 95) + 'px';
  label.style.top = (rect.bottom + 48) + 'px';
  label.style.display = 'block';
  highlightTabBtn('inv');
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
  const btn = document.querySelectorAll('.tab-btn')[tabs.indexOf('gather')];
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

// ═══════════════════════════════════════════════════════
// 튜토리얼 시작
// ═══════════════════════════════════════════════════════
function startTutorial(){
  if(G.tutorialDone) return;
  tutStep = G.tutorialStep || 0;
  tutWaiting = false;
  showTab('village');
  const hasCompletedBefore = localStorage.getItem('cheonson_tutorial_done') === 'true';
  const skipBtn = document.getElementById('tutorial-skip-btn');
  if(skipBtn) skipBtn.style.display = hasCompletedBefore ? 'inline-block' : 'none';
  _tutorialStartTimer = setTimeout(()=>{
    _tutorialStartTimer = null;
    document.getElementById('tutorial-overlay').classList.add('active');
    document.getElementById('tutorial-dialog').classList.add('show');
    updateQuestHUD();
    runTutorialStep();
  }, 800);
}

// ═══════════════════════════════════════════════════════
// 튜토리얼 종료
// ═══════════════════════════════════════════════════════
function endTutorial(){
  clearTutLock();
  document.getElementById('tutorial-overlay').classList.remove('active');
  document.getElementById('tutorial-dim').classList.remove('show');
  document.getElementById('shindansu-light').classList.remove('show');
  document.getElementById('tutorial-dialog').classList.remove('show');
  document.querySelectorAll('.village-btn').forEach(b=>b.style.animation='');
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('tab-highlight'));
  const nextBtn = document.getElementById('tutorial-next');
  if(nextBtn){ nextBtn.onclick = tutorialNext; nextBtn.classList.remove('show'); }
  if(!G.tutorialDone) toast('✨ 튜토리얼 완료! 천손의 여정이 시작됩니다.');
}

// ═══════════════════════════════════════════════════════
// 튜토리얼 건너뛰기
// ═══════════════════════════════════════════════════════
function skipTutorial(){
  if(!confirm('튜토리얼을 건너뛰시겠습니까?\n(도구는 자동으로 지급됩니다)')) return;
  document.getElementById('tutorial-dialog').classList.remove('show');
  clearTutLock();
  if(_tutorialStartTimer){ clearTimeout(_tutorialStartTimer); _tutorialStartTimer = null; }
  if(_waitEquipTimer){ clearInterval(_waitEquipTimer); _waitEquipTimer = null; }
  if(_waitEquipAllTimer){ clearInterval(_waitEquipAllTimer); _waitEquipAllTimer = null; }
  if(_waitGatherTimer){ clearInterval(_waitGatherTimer); _waitGatherTimer = null; }
  tutWaiting = false;
  if(tutTyping){ clearInterval(tutTyping); tutTyping = null; }
  // 도구 지급
  if(!G.inventory.some(i=>i&&i.name==='호미'))
    addToInventory({name:'호미', icon:'images/tools/homi.png', type:'tool', skill:'gather', dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
  if(!G.inventory.some(i=>i&&i.name==='곡괭이'))
    addToInventory({name:'곡괭이', icon:'images/tools/pickaxe.png', type:'tool', skill:'mining', dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
  if(!G.inventory.some(i=>i&&i.name==='도끼'))
    addToInventory({name:'도끼', icon:'images/tools/axe.png', type:'tool', skill:'logging', dur:50, maxDur:50, initMaxDur:50, repairCount:0, repairable:false, qty:1});
  G.tutorialDone = true;
  G.tutorialStep = 0;
  if(!G.lifeSkills) G.lifeSkills = {};
  G.lifeSkills['gather'] = true;
  G.lifeSkills['logging'] = true;
  G.lifeSkills['mining'] = true;
  giveToolRecipes();
  saveGame();
  hideInvArrow && hideInvArrow();
  hideGatherArrow && hideGatherArrow();
  hideShindansuArrow && hideShindansuArrow();
  _hideForgeArrow && _hideForgeArrow();
  document.querySelectorAll('.village-btn').forEach(b=>b.style.animation='');
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('tab-highlight'));
  updateQuestHUD();
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

// ═══════════════════════════════════════════════════════
// 튜토리얼 완료 시 도구 제작법 지급
// ═══════════════════════════════════════════════════════
function giveToolRecipes(){
  if(!G.craftSkills) G.craftSkills = {};
  G.craftSkills['tool'] = true;
  toast('📖 돌호미, 돌곡괭이, 돌도끼 제작법을 습득했습니다!');
  saveGame();
}

// ═══════════════════════════════════════════════════════
// 기타 유틸
// ═══════════════════════════════════════════════════════
function highlightTabBtn(tabId){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('tab-highlight'));
  const tabs = ['hunt','gather','char','skill','inv','village','build','quest'];
  const idx = tabs.indexOf(tabId);
  if(idx >= 0) document.querySelectorAll('.tab-btn')[idx]?.classList.add('tab-highlight');
}

function highlightVillageBuilding(building){
  showTab('village');
  document.querySelectorAll('.village-btn').forEach(b=>{
    b.style.animation = b.getAttribute('onclick')?.includes(`'${building}'`)
      ? 'tab-pulse 1s infinite' : '';
  });
}

function showQuestDetail(){
  const mats = G.mats || {};
  const ls = G.lifeSkills || {};
  const ssukCnt = mats['쑥']||0;
  const logCnt = mats['나뭇가지']||0;
  const mineCnt = mats['철광석']||0;
  let steps = [
    { done: ls['gather'], text: '채집 스킬 습득' },
    { done: ssukCnt>=10, text: `쑥 10개 채집 (${Math.min(ssukCnt,10)}/10)` },
    { done: G.craftSkills?.['tool_homi'], text: '돌호미 제작서 사용' },
    { done: ls['logging'], text: '벌목 스킬 습득' },
    { done: logCnt>=10, text: `나뭇가지 10개 채집 (${Math.min(logCnt,10)}/10)` },
    { done: G.craftSkills?.['tool_axe'], text: '돌도끼 제작서 사용' },
    { done: ls['mining'], text: '채광 스킬 습득' },
    { done: mineCnt>=10, text: `철광석 10개 채집 (${Math.min(mineCnt,10)}/10)` },
    { done: G.craftSkills?.['tool_pickaxe'], text: '돌곡괭이 제작서 사용' },
  ];
  const html = steps.map(s=>`
    <div style="display:flex;gap:.5rem;align-items:center;padding:.2rem 0">
      <span style="color:${s.done?'#6abf4a':'#888'}">${s.done?'✅':'⬜'}</span>
      <span style="color:${s.done?'#aaa':'#f0e6c8'};font-size:.75rem;${s.done?'text-decoration:line-through':''}">${s.text}</span>
    </div>`).join('');
  const existing = document.getElementById('quest-detail-popup');
  if(existing){ existing.remove(); return; }
  const popup = document.createElement('div');
  popup.id = 'quest-detail-popup';
  popup.style.cssText = 'position:fixed;top:90px;right:12px;z-index:900;background:rgba(10,8,3,.97);border:1px solid rgba(200,160,50,.5);border-radius:6px;padding:.8rem 1rem;min-width:220px';
  popup.innerHTML = `<div style="color:var(--gold2);font-weight:700;font-size:.8rem;margin-bottom:.5rem">📋 천손 입문 진행상황</div>${html}`;
  popup.onclick = ()=>popup.remove();
  document.body.appendChild(popup);
  setTimeout(()=>popup.remove(), 5000);
}

function quitGame(){
  if(!confirm('게임을 종료하시겠습니까?\n(저장된 데이터는 유지됩니다)')) return;
  saveGame();
  if(window._regenTimer) clearInterval(window._regenTimer);
  if(window.battleTimer) clearInterval(window.battleTimer);
  if(window.autoGatherTimer) clearInterval(window.autoGatherTimer);
  autoBattle = false;
  document.getElementById('game-scale-wrap').classList.remove('show');
  toast('게임을 저장하고 종료했습니다.');
  setTimeout(()=>initGame(), 800);
}

// ── 한얼 시간 시스템 ─────────────────────────────────
function getGameDate(timestamp){
  const start = G.char.createdAt || timestamp;
  const realMs = timestamp - start;
  const totalGameDays = realMs / 3600000;
  const totalDaysInt = Math.floor(totalGameDays);
  const gameHour = Math.floor((totalGameDays - totalDaysInt) * 24);
  const gameYear  = Math.floor(totalDaysInt / 360) + 1;
  const remaining = totalDaysInt % 360;
  const gameMonth = Math.floor(remaining / 30) + 1;
  const gameDay   = (remaining % 30) + 1;
  return `한얼 ${gameYear}년 ${gameMonth}월 ${gameDay}일 ${gameHour}시`;
}

function addHistory(type, detail){
  if(!G.history) G.history = [];
  G.history.push({ type, detail, ts: Date.now() });
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

function renderShindansu(){ showSdTab('summary'); }
function openShindansuPanel(){ renderShindansu(); }

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
    <div style="margin-top:.4rem;font-size:.72rem">${G.tutorialDone
      ? '📖 천손 입문 <span style="color:#6abf4a;font-weight:700">완료 ✅</span>'
      : `📖 천손 입문 <span style="color:#e8b84b;font-weight:700">진행중 🔄 (${G.tutorialStep||0}단계)</span>`
    }</div>
  `;
  const sk = document.getElementById('sd-skill-content');
  if(!sk) return;
  const skillNames = {gather:'채집',logging:'벌목',mining:'채광'};
  let html = '';
  ['gather','logging','mining'].forEach(s=>{
    if(!G.lifeSkills || !G.lifeSkills[s]) return;
    const skData = G.gatherSkills?.[s] || {lv:1,xp:0};
    const lv = skData.lv || 1;
    const xp = skData.xp || 0;
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
  const learned = G.craftSkills || {};
  const all = (typeof ALL_CRAFT_RECIPES !== 'undefined') ? ALL_CRAFT_RECIPES : [];
  if(!all.length){ el.innerHTML='<div style="color:var(--text3)">제작 레시피 없음</div>'; return; }
  let html = '';
  all.forEach(r=>{
    const isLearned = learned[r.id] || learned[r.skill];
    if(!isLearned) return;
    const mats = Object.entries(r.mats||{}).map(([n,q])=>{
      const have = G.mats[n]||0;
      const ok = have>=q;
      return `<span style="color:${ok?'#6abf4a':'#e74c3c'}">${n}×${q}</span>`;
    }).join(' + ');
    html += `
      <div style="padding:.4rem 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.5rem">
        <span style="font-size:1rem">${r.resultIcon||'⚒️'}</span>
        <div>
          <div style="color:var(--gold2);font-size:.75rem">${r.result}</div>
          <div style="color:var(--text3);font-size:.65rem">재료: ${mats||'없음'}</div>
        </div>
      </div>`;
  });
  el.innerHTML = html || '<div style="color:var(--text3)">습득한 제작법이 없습니다.</div>';
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

// ── 사운드 ────────────────────────────────────────────
let _audioCtx = null;
function getAudioCtx(){
  if(!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playShindansuSound(){
  try {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    const drone = ctx.createOscillator(); const droneGain = ctx.createGain();
    drone.type = 'sine'; drone.frequency.setValueAtTime(80,t); drone.frequency.linearRampToValueAtTime(85,t+3);
    droneGain.gain.setValueAtTime(0,t); droneGain.gain.linearRampToValueAtTime(0.15,t+0.5);
    droneGain.gain.linearRampToValueAtTime(0.1,t+2.5); droneGain.gain.linearRampToValueAtTime(0,t+4);
    drone.connect(droneGain); droneGain.connect(ctx.destination); drone.start(t); drone.stop(t+4);
    [523,659,784].forEach((freq,i)=>{
      const osc=ctx.createOscillator(); const gain=ctx.createGain();
      osc.type='sine'; osc.frequency.value=freq;
      gain.gain.setValueAtTime(0,t+i*0.6); gain.gain.linearRampToValueAtTime(0.3,t+i*0.6+0.01);
      gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.6+1.5);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(t+i*0.6); osc.stop(t+i*0.6+1.5);
      const osc2=ctx.createOscillator(); const gain2=ctx.createGain();
      osc2.type='sine'; osc2.frequency.value=freq*2;
      gain2.gain.setValueAtTime(0,t+i*0.6); gain2.gain.linearRampToValueAtTime(0.1,t+i*0.6+0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001,t+i*0.6+1.0);
      osc2.connect(gain2); gain2.connect(ctx.destination); osc2.start(t+i*0.6); osc2.stop(t+i*0.6+1.0);
    });
  } catch(e){}
}

function playGiveToolsSound(){
  try {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [0,0.15,0.3].forEach((delay,i)=>{
      const buf=ctx.createBuffer(1,ctx.sampleRate*0.3,ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let j=0;j<data.length;j++) data[j]=(Math.random()*2-1)*Math.exp(-j/(ctx.sampleRate*0.08));
      const src=ctx.createBufferSource(); const gain=ctx.createGain(); const filter=ctx.createBiquadFilter();
      filter.type='bandpass'; filter.frequency.value=800+i*200; filter.Q.value=5;
      src.buffer=buf; gain.gain.setValueAtTime(0.4,t+delay); gain.gain.exponentialRampToValueAtTime(0.001,t+delay+0.3);
      src.connect(filter); filter.connect(gain); gain.connect(ctx.destination); src.start(t+delay);
    });
  } catch(e){}
}

function playEquipSound(){
  try {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [523,659].forEach((freq,i)=>{
      const osc=ctx.createOscillator(); const gain=ctx.createGain();
      osc.type='sine'; osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.25,t+i*0.12); gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.4);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(t+i*0.12); osc.stop(t+i*0.12+0.4);
    });
  } catch(e){}
}

function playGatherCompleteSound(){
  try {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [392,523,659].forEach((freq,i)=>{
      const osc=ctx.createOscillator(); const gain=ctx.createGain();
      osc.type='sine'; osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.2,t+i*0.1); gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.1+0.6);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(t+i*0.1); osc.stop(t+i*0.1+0.6);
    });
  } catch(e){}
}

function playTutorialCompleteSound(){
  try {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    [523,659,784,1047].forEach((freq,i)=>{
      const osc=ctx.createOscillator(); const gain=ctx.createGain();
      osc.type='triangle'; osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.3,t+i*0.15); gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.15+0.5);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(t+i*0.15); osc.stop(t+i*0.15+0.5);
    });
  } catch(e){}
}

function playEquipItemSound(slot){
  try {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    if(slot==='weapon'){
      const osc=ctx.createOscillator(); const gain=ctx.createGain();
      osc.type='sawtooth'; osc.frequency.setValueAtTime(800,t); osc.frequency.exponentialRampToValueAtTime(200,t+0.2);
      gain.gain.setValueAtTime(0.3,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.3);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t+0.3);
      const osc2=ctx.createOscillator(); const gain2=ctx.createGain();
      osc2.type='sine'; osc2.frequency.value=440;
      gain2.gain.setValueAtTime(0.15,t+0.15); gain2.gain.exponentialRampToValueAtTime(0.001,t+0.8);
      osc2.connect(gain2); gain2.connect(ctx.destination); osc2.start(t+0.15); osc2.stop(t+0.8);
    } else if(slot==='armor'){
      [0,0.12].forEach(delay=>{
        const buf=ctx.createBuffer(1,ctx.sampleRate*0.15,ctx.sampleRate);
        const data=buf.getChannelData(0);
        for(let j=0;j<data.length;j++) data[j]=(Math.random()*2-1)*Math.exp(-j/(ctx.sampleRate*0.05));
        const src=ctx.createBufferSource(); const gain=ctx.createGain(); const filter=ctx.createBiquadFilter();
        filter.type='lowpass'; filter.frequency.value=400; gain.gain.value=0.5;
        src.buffer=buf; src.connect(filter); filter.connect(gain); gain.connect(ctx.destination); src.start(t+delay);
      });
    } else {
      [523,784].forEach((freq,i)=>{
        const osc=ctx.createOscillator(); const gain=ctx.createGain();
        osc.type='sine'; osc.frequency.value=freq;
        gain.gain.setValueAtTime(0.2,t+i*0.08); gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.5);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(t+i*0.08); osc.stop(t+i*0.08+0.5);
      });
    }
  } catch(e){}
}

function playEquipToolSound(){
  try {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.2,ctx.sampleRate);
    const data=buf.getChannelData(0);
    for(let j=0;j<data.length;j++) data[j]=(Math.random()*2-1)*Math.exp(-j/(ctx.sampleRate*0.06));
    const src=ctx.createBufferSource(); const gain=ctx.createGain(); const filter=ctx.createBiquadFilter();
    filter.type='bandpass'; filter.frequency.value=600; filter.Q.value=3; gain.gain.value=0.4;
    src.buffer=buf; src.connect(filter); filter.connect(gain); gain.connect(ctx.destination); src.start(t);
    const osc=ctx.createOscillator(); const gain2=ctx.createGain();
    osc.type='sine'; osc.frequency.value=350;
    gain2.gain.setValueAtTime(0.1,t+0.05); gain2.gain.exponentialRampToValueAtTime(0.001,t+0.4);
    osc.connect(gain2); gain2.connect(ctx.destination); osc.start(t+0.05); osc.stop(t+0.4);
  } catch(e){}
}

function playUnequipSound(){
  try {
    const ctx = getAudioCtx(); const t = ctx.currentTime;
    const osc=ctx.createOscillator(); const gain=ctx.createGain();
    osc.type='sine'; osc.frequency.setValueAtTime(400,t); osc.frequency.linearRampToValueAtTime(250,t+0.15);
    gain.gain.setValueAtTime(0.15,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.2);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t+0.2);
  } catch(e){}
}
