(() => {
  const $=id=>document.getElementById(id),body=document.body;
  const shell=document.createElement('div');shell.innerHTML=`<header class="scene-header"><button id="scene-day" aria-label="오늘 시간표"><small></small><b></b></button><button id="scene-menu-toggle" aria-expanded="false" aria-controls="scene-menu">☰ 메뉴</button></header><aside id="scene-menu" role="dialog" aria-modal="true" aria-label="여행 메뉴" inert><div class="scene-drawer-head"><b>여행 도구</b><button id="scene-menu-close">닫기 ✕</button></div></aside><button id="scene-shade" aria-label="메뉴 닫기" hidden></button><button id="scene-place" aria-expanded="false"></button><div class="scene-player"><button id="scene-play">▶ 전 일정</button><span id="scene-progress"></span><button id="scene-settings" aria-label="재생 속도와 지도 설정">⚙</button></div>`;body.appendChild(shell);
  const drawer=$('scene-menu');for(const selector of ['.masthead','#island-jumps','.map-controls','.playback','.route-panel','.map-caption']){const el=document.querySelector(selector);if(el)drawer.appendChild(el);}
  const close=document.createElement('button');close.id='scene-place-close';close.textContent='설명 접기 ⌄';document.querySelector('.place-panel').prepend(close);
  const daySmall=$('scene-day').querySelector('small'),dayTitle=$('scene-day').querySelector('b');
  const forecast=document.createElement('span');forecast.className='scene-forecast';$('scene-day').appendChild(forecast);
  function dayWeather(index=window.travelAnimationState?.day??1){const d=window.TRAVEL.days[index],weather=d.weatherSummary||'날씨 현장 확인',icon=weather.match(/[☀🌦⛈]/u)?.[0]||'☁';forecast.replaceChildren();const line=document.createElement('span'),symbol=document.createElement('i'),summary=document.createElement('span');line.className='forecast-main';symbol.textContent=icon;symbol.setAttribute('aria-hidden','true');summary.textContent=weather.replace(icon,'').replace('9/13 조회 예보 · ','');summary.title=weather;line.append(symbol,summary);forecast.appendChild(line);const tide=document.createElement('span');tide.className='tide-mini';tide.textContent=d.tideSummary||'조석 현장 확인';tide.title='시키호르 참고값 · 팡라오 현지 조석 아님';forecast.appendChild(tide);const sleep=document.createElement('span');sleep.textContent=d.sleepSummary||'수면 시각 미정';forecast.appendChild(sleep);}
  document.addEventListener('travel-day',e=>dayWeather(e.detail.day));dayWeather();
  function text(el,value){if(el.textContent!==value)el.textContent=value;}
  function refresh(){
    const d=$('day-kicker').textContent.replace('DAY ','').replace(' / ',' · ');
    text(daySmall,d);text(dayTitle,$('day-title').textContent);text($('scene-place'),$('place-title').textContent+' · 상세 보기 ⌃');
    const playing=$('tour').classList.contains('playing');body.classList.toggle('scene-playing',playing);
    text($('scene-play'),playing?'Ⅱ 일시정지':((Number($('route-progress').value)>0||window.travelAnimationState?.scope==='all')&&!window.travelAnimationState?.completed)?'▶ 이어보기':window.travelAnimationState?.completed?'▶ 처음부터':'▶ '+window.TRAVEL.days[window.travelAnimationState?.day??1].date.slice(3)+'일부터');
    text($('scene-progress'),$('travel-status').textContent);
  }
  function menu(value){
    const wasOpen=body.classList.contains('scene-menu-open');body.classList.toggle('scene-menu-open',value);drawer.inert=!value;$('scene-shade').hidden=!value;$('scene-menu-toggle').setAttribute('aria-expanded',String(value));
    if(value){hidePlace();$('scene-menu-close').focus();}
    else if(wasOpen&&!$('modal').open){$('scene-menu-toggle').focus();}
    window.poiLayer?.refresh?.();
  }
  function hidePlace(){const focused=document.querySelector('.place-panel').contains(document.activeElement);body.classList.remove('scene-place-open');$('scene-place').setAttribute('aria-expanded','false');if(focused&&!$('modal').open)$('scene-place').focus();window.poiLayer?.refresh?.();}
  function showPlace(){menu(false);body.classList.add('scene-place-open');$('scene-place').setAttribute('aria-expanded','true');close.focus();window.poiLayer?.refresh?.();}
  $('scene-menu-toggle').onclick=()=>menu(!body.classList.contains('scene-menu-open'));$('scene-menu-close').onclick=()=>menu(false);$('scene-shade').onclick=()=>menu(false);$('scene-settings').onclick=()=>menu(true);
  $('scene-place').onclick=()=>body.classList.contains('scene-place-open')?hidePlace():showPlace();close.onclick=hidePlace;$('scene-day').onclick=()=>$('day-list').click();
  $('scene-play').onclick=()=>{hidePlace();if($('tour').classList.contains('playing')){if($('all-tour').classList.contains('playing'))$('all-tour').click();else $('tour').click();}else if(Number($('route-progress').value)>0&&!window.travelAnimationState?.completed&&window.travelAnimationState?.scope==='day')$('tour').click();else if(Number($('route-progress').value)>0||window.travelAnimationState?.completed||window.travelAnimationState?.scope==='all')$('all-tour').click();else window.startTripFromDay();refresh();};
  drawer.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!['scene-menu-close','zoom-in','zoom-out','terrain','life','follow','surf'].includes(b.id)){menu(false);if(['tour','all-tour'].includes(b.id))hidePlace();}});
  document.addEventListener('keydown',e=>{
    if($('modal').open)return;
    if(e.key==='Escape'){menu(false);hidePlace();}
    if(e.key==='Tab'&&body.classList.contains('scene-menu-open')){
      const items=[...drawer.querySelectorAll('button,a[href],input,select')].filter(el=>!el.disabled&&el.getClientRects().length),first=items[0],last=items.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  const observer=new MutationObserver(refresh);for(const id of ['day-kicker','day-title','place-title','travel-status','tour'])observer.observe($(id),id==='tour'?{attributes:true,attributeFilter:['class']}:{childList:true,subtree:true});
  $('modal').addEventListener('close',()=>{if(!$('modal').open)(body.classList.contains('scene-place-open')?close:$('scene-menu-toggle')).focus();});
  window.sceneUI={showPlace,hidePlace,closeMenu:()=>menu(false)};refresh();
})();
