/* Scenic actors, not live people/vessel positions. Geography remains the real map. */
window.createIslandLife=function(map){
  const origin=maplibregl.MercatorCoordinate.fromLngLat([123.77,9.55],0),meter=origin.meterInMercatorCoordinateUnits();
  const actors=[],boats=[],crowds=[],materials={};let renderer,scene,camera,lastElevation=-1;
  function mat(color){return materials[color]||(materials[color]=new THREE.MeshLambertMaterial({color,flatShading:true}));}
  function block(parent,w,h,d,color,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));o.position.set(x,y,z);parent.add(o);return o;}
  function sphere(parent,r,color,x,y,z){const o=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),mat(color));o.position.set(x,y,z);parent.add(o);return o;}
  function locate(g,lnglat,height=0){const c=maplibregl.MercatorCoordinate.fromLngLat(lnglat);g.position.set((c.x-origin.x)/meter,height,(c.y-origin.y)/meter);}
  function person(parent,color,i){const g=new THREE.Group();parent.add(g);block(g,.53,.73,.3,color,0,1.18,0);sphere(g,.24,0xd8a57d,0,1.84,0);const hair=sphere(g,.25,0x423c31,0,1.94,-.025);hair.scale.y=.6;const left=block(g,.17,.7,.2,0x355060,-.17,.52,0),right=block(g,.17,.7,.2,0x355060,.17,.52,0);const a=block(g,.14,.7,.16,0xd8a57d,-.34,1.2,0),b=block(g,.14,.7,.16,0xd8a57d,.34,1.2,0);actors.push({g,left,right,a,b,phase:i*1.77,radius:12+i%4*10,speed:.07+(i%5)*.012});g.scale.setScalar(5);}
  function banca(lnglat,heading,index){const root=new THREE.Group(),g=new THREE.Group();root.add(g);scene.add(root);locate(root,lnglat,1);block(g,1.7,.75,7.5,0xf9f5de,0,.4,0);block(g,1.2,.8,5,0x3b9ec1,0,.45,0);const prow=new THREE.Mesh(new THREE.ConeGeometry(.85,2,4),mat(0xf9f5de));prow.rotation.x=Math.PI/2;prow.position.set(0,.4,4.2);g.add(prow);for(const x of [-3,3]){block(g,.24,.22,6.5,0xf1e4b8,x,.3,0);block(g,.16,1.8,.16,0x826448,x*.25,1.4,-1);block(g,.16,1.8,.16,0x826448,x*.25,1.4,1);}for(const z of [-1.7,1.7])block(g,6.1,.16,.16,0xd7c68e,0,.7,z);block(g,2.4,.18,3.5,index%2?0xe4c276:0x56add0,0,2.45,0);sphere(g,.3,0xd8a57d,0,1.6,2);block(g,.5,.55,.35,0xf09155,0,1.1,2);boats.push({root,g,lnglat,heading,index});}
  const layer={id:'island-life-3d',type:'custom',renderingMode:'3d',enabled:true,
    onAdd:function(map,gl){scene=new THREE.Scene();camera=new THREE.Camera();scene.add(new THREE.HemisphereLight(0xfff8e9,0x648b9a,2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-30,60,20);scene.add(sun);renderer=new THREE.WebGLRenderer({canvas:map.getCanvas(),context:gl,antialias:true});renderer.autoClear=false;
      const sites=[[123.773,9.55292],[123.7771,9.5496],[123.8012,9.5546],[123.7983,9.5532],[123.5106,9.1427],[123.4619,9.1784],[123.6814,9.2132],[123.6843,9.5173],[123.9237,9.4928],[123.7728,9.5516],[123.7736,9.5691],[123.7734,9.6205],[123.754,9.6001],[123.4872,9.2185]];
      sites.forEach((point,site)=>{const g=new THREE.Group();scene.add(g);locate(g,point);crowds.push({g,point});for(let i=0;i<8;i++)person(g,[0xeb8e55,0x408fb3,0xf3d56e,0xecede0,0x778768][(i+site)%5],i+site*3);});
      [[123.774,9.545,-.5],[123.792,9.546,1.2],[123.754,9.541,.9],[123.679,9.518,1.1],[123.691,9.514,-.7],[123.921,9.483,.4],[123.934,9.489,1.5],[123.505,9.14,-.8],[123.514,9.224,.2],[123.703,9.563,-.8]].forEach((p,i)=>banca(p.slice(0,2),p[2],i));
    },
    render:function(gl,matrix){if(!scene)return;if(!this.enabled||document.hidden){return;}const t=performance.now()/1000,zoom=map.getZoom();scene.visible=true;
      for(const a of actors){const theta=t*a.speed+a.phase;a.g.position.set(Math.cos(theta)*a.radius,0,Math.sin(theta)*a.radius);a.g.rotation.y=-theta;a.left.rotation.x=Math.sin(t*5+a.phase)*.4;a.right.rotation.x=-a.left.rotation.x;a.a.rotation.x=-a.left.rotation.x;a.b.rotation.x=a.left.rotation.x;}
      if(Math.floor(t/3)!==lastElevation){lastElevation=Math.floor(t/3);for(const c of crowds){c.g.position.y=map.queryTerrainElevation(c.point)||0;}}
      for(const c of crowds)c.g.visible=zoom>13.7;
      for(const b of boats){const a=t*.015+b.index*.8;const p=[b.lnglat[0]+Math.sin(a+b.heading)*.0012,b.lnglat[1]+Math.cos(a)*.0006];locate(b.root,p,1);b.g.rotation.y=Math.atan2(Math.cos(a+b.heading)*.0012,-Math.sin(a)*.0006);b.g.rotation.z=Math.sin(t*1.6+b.index)*.025;b.g.position.y=Math.sin(t*2+b.index)*.15;b.g.scale.setScalar(Math.max(5,Math.min(80,Math.pow(2,17-zoom))));}
      const transform=new THREE.Matrix4().makeTranslation(origin.x,origin.y,origin.z).scale(new THREE.Vector3(meter,-meter,meter)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));camera.projectionMatrix=new THREE.Matrix4().fromArray(matrix).multiply(transform);renderer.resetState();renderer.render(scene,camera);renderer.resetState();map.triggerRepaint();window.islandLifeState={npcs:actors.length,boats:boats.length,time:t,visibleNPCs:zoom>13.7,boatPosition:boats[0]?.root.position.toArray()};
    },
    onRemove:function(){scene?.traverse(o=>{o.geometry?.dispose();});Object.values(materials).forEach(m=>m.dispose());}
  };return layer;
};
