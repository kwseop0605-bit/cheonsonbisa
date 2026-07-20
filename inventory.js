// ── 천손비사 인벤토리/장비 모듈 (inventory.js) ──────────
// cheonson.html에서 분리됨

// ────── 07_inventory.js ──────
// ═══════════════════════════════════════
// 07_inventory
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 07_inventory
// ═══════════════════════════════════════

if(!G.equippedTools) G.equippedTools={gather:null,logging:null,mining:null};

function renderInv(){
  if(!G.bagSize) G.bagSize=30;
  if(!G.equipped) G.equipped={weapon:null,armor:null,accessory:null};
  const grid=document.getElementById('inv-grid'); grid.innerHTML='';
  for(let i=0;i<G.bagSize;i++){
    const d=document.createElement('div'); d.className='inv-slot';
    const item=G.inventory[i];
    if(item){
      const iconHtml = item.icon && item.icon.startsWith('images/')
        ? `<img src="${item.icon}" style="width:3.2rem;height:3.2rem;object-fit:contain" draggable="false">`
        : `<span style="font-size:2.6rem;line-height:1">${item.icon||'📦'}</span>`;
      d.innerHTML=`
        ${iconHtml}
        <span class="item-cnt">${item.qty||1}</span>
        <span style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:.72rem;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 4px;line-height:1.2">${item.name}</span>
      `;
      if(item.type==='skillbook') d.style.borderColor='#c9922a';
      if(item.type==='tool' && (item.dur||0)<=0) d.style.borderColor='#c0392b';
      // 장착 중 표시 (도구)
      const isEquippedTool = item.type==='tool' && G.equippedTools && Object.values(G.equippedTools).includes(i);
      // 장착 중 표시 (장비)
      const recipe = ALL_CRAFT_RECIPES.find(r=>r.result===item.name&&r.equip);
      const isEquippedGear = recipe && G.equipped?.[recipe.equip.slot]===item.name;
      if(isEquippedTool || isEquippedGear){
        d.style.borderColor='#2a8a3a';
        d.style.background='rgba(20,60,20,.25)';
        const tag = document.createElement('div');
        tag.style.cssText='position:absolute;top:1px;left:1px;font-size:.62rem;background:rgba(20,80,20,.9);color:#6abf4a;border-radius:2px;padding:0 3px;line-height:1.6;z-index:1';
        tag.textContent='장착중';
        d.style.position='relative';
        d.appendChild(tag);
      }
      d.onclick=(()=>{const idx=i;return(e)=>{e.stopPropagation();showItemContextMenu(idx,e);}})();
      d.ondblclick=(()=>{const idx=i;return()=>dblClickEquip(idx);})();
      d.oncontextmenu=(()=>{const idx=i;return(e)=>{e.preventDefault();e.stopPropagation();showItemContextMenu(idx,e);}})();
    }
    grid.appendChild(d);
  }
  // 가방 카운트
  const bagCount = document.getElementById('bag-count');
  if(bagCount) bagCount.textContent=`${G.inventory.filter(x=>x).length}/${G.bagSize}`;
  const expandCost = getBagExpandCost();
  const costEl = document.getElementById('bag-expand-cost');
  if(costEl) costEl.textContent = G.bagSize>=90?'최대':''+expandCost.toLocaleString()+'냥';
  const expandBtn = document.getElementById('bag-expand-btn');
  if(expandBtn) expandBtn.style.opacity = G.bagSize>=90?'.4':'1';
  // 재료창고
  const mats=Object.entries(G.mats).filter(([,v])=>v>0);
  const matEl=document.getElementById('mat-list');
  if(matEl) matEl.innerHTML=mats.length?mats.map(([n,v])=>`<div class="mat-chip">${n}<span>×${v}</span></div>`).join(''):'<span style="color:var(--text3);font-size:.75rem">재료 없음</span>';
  // 장착 슬롯 렌더링
  renderEquipSlots();
}

function renderEquipSlots(){
  if(!G.equipped) G.equipped={weapon:null,armor:null,accessory:null};
  if(!G.equippedTools) G.equippedTools={gather:null,logging:null,mining:null};
  // 전투 장비
  ['weapon','armor','accessory'].forEach(slot=>{
    const nameEl=document.getElementById(`eq-item-${slot}`);
    const slotEl=document.getElementById(`eq-slot-${slot}`);
    if(!nameEl) return;
    const name=G.equipped[slot];
    if(name){ nameEl.textContent=name; nameEl.className='eq-slot-item'; slotEl?.classList.add('filled'); }
    else { nameEl.textContent='비어있음'; nameEl.className='eq-slot-item empty'; slotEl?.classList.remove('filled'); }
  });
  // 채집 도구
  const toolNameMap = {gather:'호미', logging:'도끼', mining:'곡괭이'};
  ['gather','logging','mining'].forEach(skill=>{
    const nameEl=document.getElementById(`eq-item-${skill}`);
    const slotEl=document.getElementById(`eq-slot-${skill}`);
    if(!nameEl) return;
    const inv=G.equippedTools[skill];
    const toolItem = inv!=null ? G.inventory[inv] : null;
    // 유효성 검사: 인덱스는 있는데 엉뚱한 아이템을 가리킬 때만 재설정
    // 미착용(null)은 그대로 유지 (자동 착용 금지)
    const isValid = toolItem && toolItem.type==='tool' && toolItem.skill===skill;
    if(!isValid && inv!=null){
      // 잘못된 인덱스인 경우만 → null로 초기화
      G.equippedTools[skill] = null;
    }
    const finalItem = G.equippedTools[skill]!=null ? G.inventory[G.equippedTools[skill]] : null;
    if(finalItem && finalItem.type==='tool' && finalItem.skill===skill){
      const iconHtml = finalItem.icon && finalItem.icon.startsWith('images/')
        ? `<img src="${finalItem.icon}" style="width:1.2rem;height:1.2rem;object-fit:contain;vertical-align:middle;margin-right:3px" draggable="false">`
        : `${finalItem.icon||''} `;
      nameEl.innerHTML=`${iconHtml}${finalItem.name} (${finalItem.dur||0}/${finalItem.maxDur||0})`;
      nameEl.className='eq-slot-item';
      slotEl?.classList.add('filled');
    } else {
      nameEl.textContent='비어있음';
      nameEl.className='eq-slot-item empty';
      slotEl?.classList.remove('filled');
    }
  });
}

// 더블클릭 장착
// 우클릭 컨텍스트 메뉴
function showItemContextMenu(invIdx, e){
  const old = document.getElementById('ctx-menu');
  if(old) old.remove();

  const item = G.inventory[invIdx];
  if(!item) return;

  const menus = [];

  // 도구 타입
  if(item.type==='tool'){
    const skill = item.skill;
    const equippedIdx = G.equippedTools?.[skill];
    const isEquipped = equippedIdx === invIdx;
    if(isEquipped){
      menus.push({label:'🔓 장착 해제', fn:()=>{ G.equippedTools[skill]=null; toast(`${item.name} 해제`); renderInv(); renderEquipSlots(); saveGame(); }});
    } else {
      menus.push({label:'⛏ 장착', fn:()=>dblClickEquipTool(invIdx)});
    }
    // 구매 도구만 수리 가능 (repairable===true)
    if(item.repairable === true){
      menus.push({label:'🔧 수리 (대장간)', fn:()=>{ closeCtxMenu(); showTab('village'); openBuildingPanel('forge'); showForge('repair'); }});
    }
    menus.push({label:'🗑 버리기', fn:()=>deleteItem(invIdx)});
  }

  // 제작 아이템 (장착 가능)
  else if(ALL_CRAFT_RECIPES?.find(r=>r.result===item.name&&r.equip)){
    const recipe = ALL_CRAFT_RECIPES?.find(r=>r.result===item.name&&r.equip);
    const slot = recipe.equip.slot;
    const isEquipped = G.equipped?.[slot]===item.name;
    if(isEquipped){
      menus.push({label:'🔓 장착 해제', fn:()=>{ G.equipped[slot]=null; toast(`${item.name} 해제`); updateSide(); renderInv(); saveGame(); }});
    } else {
      menus.push({label:'⚔ 장착', fn:()=>dblClickEquip(invIdx)});
    }
    // 재료창고에 아이템이면 버리기 가능
    menus.push({label:'🗑 버리기', fn:()=>deleteItem(invIdx)});
  }

  // 열매
  else if(item.type==='berry'){
    const ef = BERRY_EFFECTS[item.name];
    menus.push({label:'🍎 섭취', fn:()=>{ closeCtxMenu(); useBerry(item.name); }});
    // HP 열매면 HP슬롯만, MP 열매면 MP슬롯만
    if(ef && ef.type==='hp'){
      menus.push({label:'📌 체력 슬롯(1)에 등록', fn:()=>{ registerBerrySlot(0,item.name); }});
    } else if(ef && ef.type==='mp'){
      menus.push({label:'📌 내공 슬롯(2)에 등록', fn:()=>{ registerBerrySlot(1,item.name); }});
    } else {
      menus.push({label:'📌 체력 슬롯 등록', fn:()=>{ registerBerrySlot(0,item.name); }});
      menus.push({label:'📌 내공 슬롯 등록', fn:()=>{ registerBerrySlot(1,item.name); }});
    }
    menus.push({label:'🗑 버리기', fn:()=>deleteItem(invIdx)});
  }

  // 제작서
  else if(item.type==='recipe'){
    menus.push({label:'📖 사용 (제작법 습득)', fn:()=>{ closeCtxMenu(); useRecipeBook(invIdx); }});
    menus.push({label:'🗑 버리기', fn:()=>deleteItem(invIdx)});
  }

  // 스킬북
  else if(item.type==='skillbook'){
    menus.push({label:'📖 사용 (스킬 습득)', fn:()=>{ closeCtxMenu(); useSkillBook(invIdx); }});
    menus.push({label:'🗑 버리기', fn:()=>deleteItem(invIdx)});
  }

  // 기타
  else {
    menus.push({label:'🗑 버리기', fn:()=>deleteItem(invIdx)});
  }

  menus.push({label:'ℹ 정보 보기', fn:()=>{ closeCtxMenu(); showItemPopup(invIdx, e); }});

  if(!menus.length) return;
  _showCtxMenu(menus, e);
}

// 아이템 삭제
function deleteItem(invIdx){
  const item = G.inventory[invIdx];
  if(!item) return;
  if(!confirm(`"${item.name}"을(를) 버리시겠습니까?\n삭제 후 복구되지 않습니다.`)) return;
  // 장착 슬롯 해제
  if(item.type==='tool'){
    const skill = item.skill;
    if(G.equippedTools?.[skill]===invIdx) G.equippedTools[skill]=null;
  }
  const recipe = ALL_CRAFT_RECIPES?.find(r=>r.result===item.name&&r.equip);
  if(recipe){ const slot=recipe.equip.slot; if(G.equipped?.[slot]===item.name) G.equipped[slot]=null; }
  G.inventory.splice(invIdx,1);
  toast(`🗑 ${item.name} 버림`);
  renderInv(); updateSide(); saveGame();
}

// 장착 슬롯 우클릭
function equipSlotCtx(e, slot){
  e.preventDefault(); e.stopPropagation();
  const old = document.getElementById('ctx-menu');
  if(old) old.remove();
  const name = G.equipped?.[slot];
  if(!name) return;
  const menus = [
    {label:`🔓 ${name} 해제`, fn:()=>{ G.equipped[slot]=null; toast(`${name} 해제`); updateSide(); renderInv(); saveGame(); }},
    {label:'ℹ 정보 보기', fn:()=>{ const idx=G.inventory.findIndex(i=>i&&i.name===name); if(idx>=0) showItemPopup(idx,e); }},
  ];
  _showCtxMenu(menus, e);
}

function toolSlotCtx(e, skill){
  e.preventDefault(); e.stopPropagation();
  const old = document.getElementById('ctx-menu');
  if(old) old.remove();
  const eqIdx = G.equippedTools?.[skill];
  if(eqIdx==null) return;
  const item = G.inventory[eqIdx];
  if(!item) return;
  const toolName = {gather:'호미',logging:'도끼',mining:'곡괭이'}[skill];
  const menus = [
    {label:`🔓 ${toolName} 해제`, fn:()=>{ G.equippedTools[skill]=null; toast(`${toolName} 해제`); renderInv(); renderEquipSlots(); saveGame(); }},
  ];
  _showCtxMenu(menus, e);
}

function _showCtxMenu(menus, e){
  const menu = document.createElement('div');
  menu.id = 'ctx-menu';
  const x = Math.min(e.clientX, window.innerWidth-160);
  const y = Math.min(e.clientY, window.innerHeight-menus.length*36-10);
  menu.style.cssText = `position:fixed;left:${x}px;top:${y}px;background:#110d08;border:1px solid #c9922a;border-radius:6px;z-index:99999;min-width:150px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.6)`;
  menu.innerHTML = menus.map((m,i)=>`
    <div style="padding:.45rem .8rem;font-size:.75rem;color:${m.label.includes('버리기')||m.label.includes('삭제')?'#e74c3c':'var(--text)'};cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05)"
      onmouseover="this.style.background='rgba(200,150,40,.15)'" onmouseout="this.style.background=''"
      onclick="ctxMenuClick(${i})">${m.label}</div>
  `).join('');
  document.body.appendChild(menu);
  window._ctxMenuFns = menus.map(m=>m.fn);
  setTimeout(()=>document.addEventListener('click', closeCtxMenu, {once:true}), 10);
}

function ctxMenuClick(idx){
  const fn = window._ctxMenuFns?.[idx];
  closeCtxMenu();
  if(fn) fn();
}

function closeCtxMenu(){
  const m = document.getElementById('ctx-menu');
  if(m) m.remove();
  window._ctxMenuFns = null;
}

function dblClickEquip(invIdx){
  const item=G.inventory[invIdx];
  if(!item) return;
  if(item.type==='skillbook'){ useSkillBook(invIdx); return; }
  if(item.type==='tool'){ dblClickEquipTool(invIdx); return; }
  // 제작 아이템 (무기/방어구/악세사리)
  const recipe=ALL_CRAFT_RECIPES.find(r=>r.result===item.name);
  if(!recipe||!recipe.equip){ toast('장착할 수 없는 아이템입니다!'); return; }
  const slot=recipe.equip.slot;
  const cur=G.equipped[slot];
  if(cur===item.name){ G.equipped[slot]=null; toast(`${item.name} 해제`); playUnequipSound(); }
  else if(cur){
    const curRecipe=ALL_CRAFT_RECIPES.find(r=>r.result===cur);
    showEquipComparePopup(item, recipe, curRecipe, slot);
    return;
  } else {
    G.equipped[slot]=item.name; toast(`⚔ ${item.name} 장착!`); playEquipItemSound(slot);
  }
  updateSide(); renderInv(); saveGame();
}

function dblClickEquipTool(invIdx){
  const item=G.inventory[invIdx];
  if(!item||item.type!=='tool') return;
  const skill=item.skill;
  const curIdx=G.equippedTools[skill];
  const slotName={gather:'호미',logging:'도끼',mining:'곡괭이'}[skill];
  if(curIdx===invIdx){ G.equippedTools[skill]=null; toast(`${item.name} 해제`); playUnequipSound(); }
  else if(curIdx!=null && G.inventory[curIdx]){
    const cur=G.inventory[curIdx];
    showToolComparePopup(item, invIdx, cur, curIdx, skill);
    return;
  } else {
    G.equippedTools[skill]=invIdx; toast(`⛏ ${item.name} 장착!`); playEquipToolSound();
  }
  renderInv(); saveGame();
}

// 장비 비교 팝업
function showEquipComparePopup(newItem, newRecipe, curRecipe, slot){
  closeItemPopup();
  const overlay=document.createElement('div');
  overlay.id='item-popup';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.onclick=closeItemPopup;
  const ne=newRecipe.equip, ce=curRecipe?.equip||{};
  const diffAtk=(ne.atk||0)-(ce.atk||0), diffDef=(ne.def||0)-(ce.def||0), diffLuck=(ne.luck||0)-(ce.luck||0);
  const diff=(v,s='')=>v===0?'':`<span style="color:${v>0?'#6abf4a':'#e74c3c'}">${v>0?'+':''}${v}${s}</span>`;
  const box=document.createElement('div');
  box.style.cssText='background:#110d08;border:1px solid #c9922a;border-radius:8px;padding:1.2rem 1.5rem;max-width:290px;width:90%';
  box.onclick=e=>e.stopPropagation();
  box.innerHTML=`
    <div style="font-size:.85rem;font-weight:700;color:#e8b84b;margin-bottom:.6rem">⚔ 장착 교체 비교</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-bottom:.7rem">
      <div style="background:rgba(20,40,20,.5);border-radius:4px;padding:.4rem">
        <div style="font-size:.65rem;color:#6abf4a;margin-bottom:.2rem">▶ 새 아이템</div>
        <div style="font-size:.75rem;font-weight:600;color:#e8b84b">${newItem.name}</div>
        <div style="font-size:.65rem;color:#ccc">${ne.atk?'ATK +'+ne.atk:''}${ne.def?' DEF +'+ne.def:''}${ne.luck?' 운 +'+ne.luck+'%':''}</div>
      </div>
      <div style="background:rgba(40,20,20,.5);border-radius:4px;padding:.4rem">
        <div style="font-size:.65rem;color:#e74c3c;margin-bottom:.2rem">◀ 현재 장착</div>
        <div style="font-size:.75rem;font-weight:600;color:#aaa">${G.equipped[slot]}</div>
        <div style="font-size:.65rem;color:#ccc">${ce.atk?'ATK +'+ce.atk:''}${ce.def?' DEF +'+ce.def:''}${ce.luck?' 운 +'+ce.luck+'%':''}</div>
      </div>
    </div>
    <div style="font-size:.7rem;color:#aaa;margin-bottom:.8rem">
      변화: ATK ${diff(diffAtk)} DEF ${diff(diffDef)} 운 ${diff(diffLuck,'%')}
    </div>
    <div style="display:flex;gap:.4rem">
      <button class="btn" style="flex:1;font-size:.7rem;padding:.3rem" onclick="doEquipSwap('${slot}','${newItem.name}')">교체</button>
      <button class="btn" style="flex:1;font-size:.7rem;padding:.3rem;background:rgba(30,30,30,.8)" onclick="closeItemPopup()">취소</button>
    </div>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function doEquipSwap(slot, name){
  G.equipped[slot]=name; closeItemPopup();
  toast(`⚔ ${name} 장착!`); updateSide(); renderInv(); saveGame();
}

// 도구 비교 팝업
function showToolComparePopup(newTool, newIdx, curTool, curIdx, skill){
  closeItemPopup();
  const overlay=document.createElement('div');
  overlay.id='item-popup';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.onclick=closeItemPopup;
  const box=document.createElement('div');
  box.style.cssText='background:#110d08;border:1px solid #c9922a;border-radius:8px;padding:1.2rem 1.5rem;max-width:290px;width:90%';
  box.onclick=e=>e.stopPropagation();
  box.innerHTML=`
    <div style="font-size:.85rem;font-weight:700;color:#e8b84b;margin-bottom:.6rem">⛏ 도구 교체 비교</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-bottom:.7rem">
      <div style="background:rgba(20,40,20,.5);border-radius:4px;padding:.4rem">
        <div style="font-size:.65rem;color:#6abf4a;margin-bottom:.2rem">▶ 새 도구</div>
        <div style="font-size:.75rem;font-weight:600;color:#e8b84b">${newTool.name}</div>
        <div style="font-size:.65rem;color:#ccc">내구도 ${newTool.dur}/${newTool.maxDur}</div>
        <div style="font-size:.62rem;color:${newTool.repairable?'#6abf4a':'#e74c3c'}">${newTool.repairable?'수리가능':'수리불가'}</div>
      </div>
      <div style="background:rgba(40,20,20,.5);border-radius:4px;padding:.4rem">
        <div style="font-size:.65rem;color:#e74c3c;margin-bottom:.2rem">◀ 현재 장착</div>
        <div style="font-size:.75rem;font-weight:600;color:#aaa">${curTool.name}</div>
        <div style="font-size:.65rem;color:#ccc">내구도 ${curTool.dur}/${curTool.maxDur}</div>
        <div style="font-size:.62rem;color:${curTool.repairable?'#6abf4a':'#e74c3c'}">${curTool.repairable?'수리가능':'수리불가'}</div>
      </div>
    </div>
    <div style="display:flex;gap:.4rem">
      <button class="btn" style="flex:1;font-size:.7rem;padding:.3rem" onclick="doToolSwap('${skill}',${newIdx})">교체</button>
      <button class="btn" style="flex:1;font-size:.7rem;padding:.3rem;background:rgba(30,30,30,.8)" onclick="closeItemPopup()">취소</button>
    </div>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function doToolSwap(skill, newIdx){
  G.equippedTools[skill]=newIdx; closeItemPopup();
  const item=G.inventory[newIdx];
  toast(`⛏ ${item?.name} 장착!`); renderInv(); saveGame();
}

function unequipSlot(slot){
  if(!G.equipped[slot]) return;
  toast(`${G.equipped[slot]} 해제`); G.equipped[slot]=null;
  updateSide(); renderInv(); saveGame();
}

function unequipToolSlot(skill){
  if(G.equippedTools[skill]==null) return;
  const item=G.inventory[G.equippedTools[skill]];
  toast(`${item?.name||'도구'} 해제`); G.equippedTools[skill]=null;
  renderInv(); saveGame();
}

// 가방 확장 비용 (6칸마다 500냥씩 증가)
function getBagExpandCost(){
  const step = (G.bagSize - 30) / 6;
  return Math.round(500 * Math.pow(1.8, step));
}

function sortInventory(){
  // null 제거 후 아이템만 앞으로, 나머지 null로 채우기
  const items = G.inventory.filter(i=>i!==null&&i!==undefined);
  const size = G.bagSize || 30;
  G.inventory = [...items, ...Array(size - items.length).fill(null)];
  // equippedTools 인덱스만 재계산 (자동 착용 금지 - 현재 착용 중인 도구만 인덱스 업데이트)
  if(G.equippedTools){
    ['gather','logging','mining'].forEach(skill=>{
      const toolName = {gather:'호미',logging:'도끼',mining:'곡괭이'}[skill];
      const curIdx = G.equippedTools[skill];
      // 이미 착용 중인 도구면 새 인덱스로 업데이트
      // 미착용(null)이면 그대로 null 유지
      if(curIdx !== null){
        const newIdx = G.inventory.findIndex(i=>i&&i.name===toolName&&(i.dur||0)>0);
        G.equippedTools[skill] = newIdx >= 0 ? newIdx : null;
      }
    });
  }
  renderInv(); renderEquipSlots();
  toast('✅ 가방 정렬 완료!');
  saveGame();
}

function expandBag(){
  if(!G.bagSize) G.bagSize=30;
  if(G.bagSize>=90){ toast('가방이 최대 크기입니다! (90칸)'); return; }
  const cost = getBagExpandCost();
  if(G.char.gold < cost){ toast(`냥이 부족합니다! (${cost.toLocaleString()}냥 필요)`); return; }
  G.char.gold -= cost;
  G.bagSize += 6;
  toast(`🎒 가방 확장! ${G.bagSize}칸 (-${cost.toLocaleString()}냥)`);
  renderInv(); updateHUD(); saveGame();
}

// 아이템 팝업
function showItemPopup(invIdx, event){
  event.stopPropagation(); // 외부 클릭 이벤트 버블링 차단

  const item = G.inventory[invIdx];
  if(!item) return;

  // 같은 아이템 다시 클릭 시 토글 (닫기)
  const existing = document.getElementById('item-popup');
  if(existing){
    const existingIdx = existing.dataset.invIdx;
    closeItemPopup();
    if(existingIdx == invIdx) return; // 같은 아이템이면 닫고 끝
  }

  // 타입별 내용
  let typeStr='', descHTML='', btnsHTML='';

  if(item.type==='tool'){
    const dur = item.dur||0, max = item.maxDur||0;
    const durPct = max>0 ? Math.round(dur/max*100) : 0;
    const durColor = durPct>50?'#2a8a3a':durPct>25?'#c9922a':'#c0392b';
    typeStr = '채집 도구';
    descHTML = `
      내구도: <span style="color:${durColor};font-weight:600">${dur}/${max}</span> (${durPct}%)<br>
      수리: ${item.repairable===false?'<span style="color:#e74c3c">불가 (지급)</span>':'<span style="color:#6abf4a">가능</span>'}
      ${item.repairCount?`<br>수리 횟수: ${item.repairCount}회`:''}
    `;
    if(dur<=0){
      btnsHTML = item.repairable===false
        ? `<button class="btn" style="font-size:.6rem;padding:.22rem .5rem;width:100%;margin-top:.4rem" onclick="closeItemPopup();showTab('village');openBuildingPanel('forge')">🔨 대장간 구매</button>`
        : `<button class="btn" style="font-size:.6rem;padding:.22rem .5rem;width:100%;margin-top:.4rem" onclick="closeItemPopup();showTab('village');openBuildingPanel('forge')">🔧 대장간 수리/구매</button>`;
    }
  } else if(item.type==='berry'){
    const ef = BERRY_EFFECTS[item.name];
    typeStr = '회복 열매';
    descHTML = ef ? ef.desc : '먹으면 회복됩니다.';
    btnsHTML = `<button class="btn" style="font-size:.6rem;padding:.22rem .5rem;width:100%;margin-top:.4rem;background:rgba(20,60,20,.8);border-color:#2a8a3a" onclick="closeItemPopup();useBerry('${item.name}')">🍎 섭취 (${item.qty||1}개 보유)</button>`;
  } else if(item.type==='skillbook'){
    typeStr = '무공 비급';
    const sk = SKILL_BOOK.find(s=>s.bookName===item.name);
    descHTML = sk ? `${sk.desc}<br>MP ${sk.mp} · 쿨 ${sk.maxCd}초<br>필요 Lv${sk.unlockLv}` : '사용하면 무공 습득';
    btnsHTML = `<button class="btn" style="font-size:.6rem;padding:.22rem .5rem;width:100%;margin-top:.4rem;background:rgba(100,60,10,.8);border-color:var(--gold)" onclick="closeItemPopup();useSkillBook(${invIdx})">📖 사용</button>`;
  } else {
    typeStr = '아이템';
    descHTML = item.desc||'';
  }

  // 툴팁 생성
  const tip = document.createElement('div');
  tip.id = 'item-popup';
  tip.dataset.invIdx = invIdx;
  tip.style.cssText = `
    position:fixed;z-index:9999;
    background:#110d08;border:1px solid #c9922a;border-radius:6px;
    padding:1rem 1.2rem;width:280px;
    box-shadow:0 4px 20px rgba(0,0,0,.8);
    pointer-events:auto;
  `;
  tip.onclick = e=>e.stopPropagation();
  tip.innerHTML = `
    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">
    ${item.icon && item.icon.startsWith('images/')
        ? `<img src="${item.icon}" style="width:5rem;height:5rem;object-fit:contain" draggable="false">`
        : `<span style="font-size:4rem;line-height:1">${item.icon||'📦'}</span>`}
      <div>
        <div style="font-size:1rem;font-weight:600;color:#e8b84b">${item.name}</div>
        <div style="font-size:.72rem;color:#888">${typeStr}</div>
      </div>
    </div>
    <div style="font-size:.82rem;color:#ccc;line-height:1.8">${descHTML}</div>
    ${btnsHTML}
  `;

  document.body.appendChild(tip);

  // 클릭 위치 기준으로 툴팁 위치 계산
  const rect = tip.getBoundingClientRect();
  const tipW = 170, tipH = tip.offsetHeight || 150;
  let x = event.clientX + 10;
  let y = event.clientY + 10;

  // 화면 오른쪽 벗어나면 왼쪽에
  if(x + tipW > window.innerWidth - 10) x = event.clientX - tipW - 10;
  // 화면 아래 벗어나면 위쪽에
  if(y + tipH > window.innerHeight - 10) y = event.clientY - tipH - 10;

  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';

  // 외부 클릭 시 닫기
  setTimeout(()=>{
    document.addEventListener('click', closeItemPopup, {once:true});
  }, 0);
}

// 열매 사용
function useBerry(name){
  const item = G.inventory.find(x=>x&&x.name===name&&x.type==='berry');
  if(!item||!((item.qty||1)>0)){ toast(`${name}이 없습니다!`); renderBerrySlots(); return; }
  const ef = BERRY_EFFECTS[name];
  if(!ef){ toast('알 수 없는 열매!'); return; }
  const c = G.char;
  const iconStr = item.icon && item.icon.startsWith('images/') ? '🌿' : (item.icon||'🌿');
  if(ef.type==='hp'){
    const heal = ef.pct ? Math.floor(c.mhp*ef.pct) : ef.val;
    c.hp = Math.min(c.mhp, c.hp+heal);
    toast(`${iconStr} ${name} 섭취! HP +${heal}`);
  } else {
    const heal = ef.pct ? Math.floor(c.mmp*ef.pct) : ef.val;
    c.mp = Math.min(c.mmp, c.mp+heal);
    toast(`${iconStr} ${name} 섭취! MP +${heal}`);
  }
  item.qty = (item.qty||1) - 1;
  if(item.qty <= 0){
    const idx = G.inventory.indexOf(item);
    if(idx!==-1) G.inventory.splice(idx,1);
  }
  updateHUD(); updateFmHUD(); updateGatherSkillHUD(); renderInv(); renderBerrySlots(); saveGame();
}

function closeItemPopup(){
  const el = document.getElementById('item-popup');
  if(el) el.remove();
}

// ── 퀘스트 ────────────────────────────────────────
function renderQuests(){
  document.getElementById('quest-list').innerHTML=G.quests.map(q=>`
    <div class="q-item" style="${q.done?'opacity:.5':''}">
      <div class="q-title">${q.done?'✅':'📜'} ${q.title}</div>
      <div class="q-desc">${q.desc}</div>
      ${q.obj&&q.obj.type==='kill'&&!q.done?`<div class="q-prog">처치: ${q.obj.cur||0}/${q.obj.val}</div>`:''}
    </div>`).join('');
}

// ── 채집 ──────────────────────────────────────────
// ── 채집터 시스템 ─────────────────────────────────


// ────── 08_gather.js ──────
