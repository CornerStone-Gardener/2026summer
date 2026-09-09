window.listTravelPOIs=function(places,geo){
  const icons={cafe:'🍴',falls:'💧',beach:'🏖',reef:'🐠',church:'⛪',tree:'🌳',cave:'◒',mountain:'⛰'};
  return Object.entries(places).filter(([id,p])=>geo.places[id]?.lngLat&&(icons[p.kind]||p.type==='해변')).map(([id,p])=>({id,p,point:geo.places[id].lngLat,icon:icons[p.kind]||'🏖'})).sort((a,b)=>Number(!!b.p.extra)-Number(!!a.p.extra));
};
window.createPOILayer=function(map,places,geo,onSelect){
  const list=window.listTravelPOIs(places,geo),extra=list.filter(a=>a.p.extra).length;
  const holder=document.createElement('div');holder.className='poi-layer';document.getElementById('world').appendChild(holder);let route=new Set(),selected='',ordered=list,frame=0;
  for(const a of list){const el=document.createElement('button');el.className='poi-icon '+(a.p.kind==='cafe'?'food':'sight');el.setAttribute('aria-label',a.p.name+' · '+a.p.type);el.title=a.p.name;el.innerHTML='<b>'+a.icon+'</b><span>'+a.p.name+'</span>';el.onclick=()=>onSelect(a.id);holder.appendChild(el);a.el=el;}
  function draw(){
    frame=0;const zoom=map.getZoom(),w=map.getCanvas().clientWidth,h=map.getCanvas().clientHeight,placed=[],gap=w<=900?32:36;
    const panels=zoom<9?[]:[...document.querySelectorAll('.scene-header,.scene-player,#scene-place,.place-panel,.day-nav,#scene-menu')].map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height);let visible=0;
    for(const a of ordered){
      if(zoom<9||route.has(a.id)){a.el.hidden=true;continue;}
      const p=map.project(a.point),show=p.x>15&&p.y>85&&p.x<w-15&&p.y<h-85&&!placed.some(q=>Math.abs(p.x-q.x)<gap&&Math.abs(p.y-q.y)<gap)&&!panels.some(r=>p.x>r.left-16&&p.x<r.right+16&&p.y>r.top-16&&p.y<r.bottom+16);
      a.el.hidden=!show;if(show){placed.push(p);visible++;a.el.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;a.el.classList.toggle('selected',selected===a.id);}
    }
    window.poiState={total:list.length,visible,extra};
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  function select(id){if(selected!==id){selected=id;ordered=[...list].sort((a,b)=>Number(b.id===selected)-Number(a.id===selected));}schedule();}
  map.on('move',schedule);draw();return{list,refresh:schedule,update(ids,current){route=new Set(ids);select(current);},select,remove(){cancelAnimationFrame(frame);map.off('move',schedule);holder.remove();}};
};
