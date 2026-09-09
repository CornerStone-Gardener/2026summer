/* Lightweight scenic actors. Screen-size illustrations; not live vessel/person positions. */
window.createLocalLife=function(map){
  const people=[[123.773,9.55292],[123.7771,9.5496],[123.8012,9.5546],[123.7983,9.5532],[123.5106,9.1427],[123.4619,9.1784],[123.6814,9.2132],[123.6843,9.5173],[123.9237,9.4928],[123.7728,9.5516],[123.7736,9.5691],[123.7734,9.6205],[123.754,9.6001],[123.4872,9.2185]];
  const boatSites=[[123.774,9.545],[123.792,9.546],[123.754,9.541],[123.679,9.518],[123.691,9.514],[123.921,9.483],[123.934,9.489],[123.505,9.14],[123.514,9.224],[123.703,9.563]];
  const holder=document.createElement('div');holder.className='local-life';document.getElementById('world').appendChild(holder);
  const actors=[];let enabled=true,last=0,timer;
  function add(point,boat,index){const el=document.createElement('div');el.className='local-actor '+(boat?'banca':'npc');el.setAttribute('aria-hidden','true');el.innerHTML=boat?'<svg viewBox="0 0 64 48"><g stroke="#605646" stroke-width="2"><path d="M9 8v32M55 8v32M9 16h46M9 32h46" stroke="#fff6d8" stroke-width="4"/><path d="M32 3Q47 18 39 43H25Q17 18 32 3Z" fill="#fff6d8"/><path d="M28 12h8v25h-8z" fill="#389aaf"/><path d="M21 18h22v12H21z" fill="'+(index%2?'#e9b967':'#659fcd')+'"/></g></svg>':'<span class="head"></span><span class="body" style="background:'+['#e9874d','#3b87ac','#d8b344'][index%3]+'"></span><i class="leg a"></i><i class="leg b"></i>';holder.appendChild(el);actors.push({el,point,boat,index});}
  people.forEach((p,i)=>{add(p,false,i*2);add([p[0]+.00017,p[1]+.00012],false,i*2+1);});boatSites.forEach((p,i)=>add(p,true,i));
  function draw(){const t=performance.now()/1000;let visible=0;const zoom=map.getZoom(),w=map.getCanvas().clientWidth,h=map.getCanvas().clientHeight;
    if(!enabled||document.hidden)return;holder.classList.toggle('overview',zoom<12);
    for(const a of actors){const theta=t*(a.boat?.08:.18)+a.index;const point=[a.point[0]+Math.sin(theta)*(a.boat?.0008:.00006),a.point[1]+Math.cos(theta)*(a.boat?.0004:.00004)];const p=map.project(point);const show=(!a.boat||zoom>=12||[0,3,5,7].includes(a.index))&&(a.boat||zoom>12.5)&&p.x>-40&&p.y>-40&&p.x<w+40&&p.y<h+40;a.el.hidden=!show;if(show){visible++;a.el.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-50%)${a.boat?' rotate('+(-theta*180/Math.PI)+'deg)':''}`;}if(a.boat&&a.index===0)window.localBoatPosition=point;}
    window.islandLifeState={npcs:28,boats:10,time:t,visibleNPCs:zoom>12.5,visibleActors:visible,boatPosition:window.localBoatPosition};last=t;
  }
  function schedule(){clearInterval(timer);timer=undefined;holder.hidden=!enabled||document.hidden;if(enabled&&!document.hidden){timer=setInterval(draw,100);draw();}}
  map.on('move',draw);document.addEventListener('visibilitychange',schedule);schedule();
  return {get enabled(){return enabled;},set enabled(value){enabled=value;schedule();},remove(){clearInterval(timer);map.off('move',draw);document.removeEventListener('visibilitychange',schedule);holder.remove();}};
};
