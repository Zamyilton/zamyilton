import * as THREE from "./vendor/three.module.min.mjs";
import { clamp, deviceProfile } from "./motion.mjs";
import { dragonOutline, dragonEye } from "./identity.mjs";

function drawPath(target, commands) {
  const point=(x,y)=>[(x-135)/100,(135-y)/100];
  commands.forEach(([command,...values])=>{
    if(command==="M")target.moveTo(...point(...values));
    else if(command==="L")target.lineTo(...point(...values));
    else if(command==="C")target.bezierCurveTo(...point(values[0],values[1]),...point(values[2],values[3]),...point(values[4],values[5]));
    else target.closePath();
  });
}

export function buildDragonGeometry() {
  const shape = new THREE.Shape();
  drawPath(shape,dragonOutline);
  const eye=new THREE.Path();drawPath(eye,dragonEye);shape.holes.push(eye);
  const geometry = new THREE.ExtrudeGeometry(shape, {depth:.24,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.012,bevelThickness:.026,curveSegments:16});
  geometry.center();
  return geometry;
}

export function startScene({canvas, host, observeTarget, initialMotion = true, initialFinish = "gold"}) {
  if (!canvas || !host) throw new Error("Scene requires a canvas and host");
  const profile = deviceProfile(window.innerWidth, window.devicePixelRatio || 1, navigator.hardwareConcurrency || 8);
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:!profile.light,powerPreference:"low-power",stencil:false});
  renderer.setPixelRatio(profile.pixelRatio);
  renderer.setClearColor(0x101014,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32,1,.1,40);
  camera.position.set(0,.12,8.7);
  const sculpture = new THREE.Group();
  scene.add(sculpture);

  const room = new THREE.Scene();
  room.background = new THREE.Color(0x25202d);
  const roomBox = new THREE.Mesh(new THREE.BoxGeometry(18,18,18), new THREE.MeshBasicMaterial({color:0x302537,side:THREE.BackSide}));
  room.add(roomBox);
  const panels = [
    {color:0xf5e2ff,pos:[-4,3,4],rot:[0,Math.PI/3,0],size:[5,7]},
    {color:0x9570cc,pos:[5,1,-2],rot:[0,-Math.PI/2,0],size:[5,8]},
    {color:0xffdc9d,pos:[0,5,0],rot:[Math.PI/2,0,0],size:[7,5]}
  ];
  panels.forEach(p=>{
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...p.size),new THREE.MeshBasicMaterial({color:p.color,side:THREE.DoubleSide}));
    mesh.position.set(...p.pos);mesh.rotation.set(...p.rot);room.add(mesh);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room,.035);
  scene.environment = environment.texture;
  room.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});
  pmrem.dispose();

  const face = new THREE.MeshPhysicalMaterial({color:0xe8c88d,metalness:.78,roughness:.22,clearcoat:1,clearcoatRoughness:.13,envMapIntensity:1.4});
  const edge = new THREE.MeshStandardMaterial({color:0x84603d,metalness:.9,roughness:.21,envMapIntensity:1.5});
  const z = new THREE.Mesh(buildDragonGeometry(),[face,edge]);
  sculpture.add(z);
  const echoMaterial=new THREE.MeshBasicMaterial({color:0xb99be8,wireframe:true,transparent:true,opacity:.035,depthWrite:false});
  const echo=new THREE.Mesh(z.geometry,echoMaterial);
  echo.position.z=-.32;sculpture.add(echo);
  const orbitGroup = new THREE.Group();
  sculpture.add(orbitGroup);
  const ringMaterial = new THREE.MeshStandardMaterial({color:0xa88ac7,metalness:.55,roughness:.35});
  const goldMaterial = new THREE.MeshStandardMaterial({color:0xdac18f,metalness:.75,roughness:.3});
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.9,.009,6,100,Math.PI*1.55),goldMaterial);
  ringA.rotation.set(1.05,.3,-.4);orbitGroup.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.12,.006,6,100,Math.PI*1.2),ringMaterial);
  ringB.rotation.set(-.6,1.1,.6);orbitGroup.add(ringB);
  const nodes=[];
  const nodeGeometry=new THREE.IcosahedronGeometry(.055,0);
  for(let i=0;i<5;i++){
    const node=new THREE.Mesh(nodeGeometry,i%2?ringMaterial:goldMaterial);
    const angle=i*Math.PI*2/5;node.position.set(Math.cos(angle)*1.9,Math.sin(angle)*1.15,Math.sin(angle)*.8);
    orbitGroup.add(node);nodes.push(node);
  }
  let seed=9831;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const positions=new Float32Array(profile.particles*3);
  for(let i=0;i<profile.particles;i++){
    positions[i*3]=(random()-.5)*7.5;positions[i*3+1]=(random()-.5)*5.5;positions[i*3+2]=(random()-.5)*2.7-1.2;
  }
  const dustGeometry=new THREE.BufferGeometry();
  dustGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
  const dustMaterial=new THREE.PointsMaterial({color:0xcab6df,size:.017,transparent:true,opacity:.45,depthWrite:false});
  const dust=new THREE.Points(dustGeometry,dustMaterial);scene.add(dust);
  scene.add(new THREE.HemisphereLight(0xe9d8ff,0x251c2c,2));
  const key=new THREE.DirectionalLight(0xffefdb,4.2);key.position.set(-4,5,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xaf82e3,3);fill.position.set(4,1,3);scene.add(fill);

  const finishes={gold:[0xe8c88d,0x84603d],amethyst:[0xb594e5,0x63408f]};
  let finish=initialFinish in finishes?initialFinish:"gold";
  const targetFace=new THREE.Color(finishes[finish][0]),targetEdge=new THREE.Color(finishes[finish][1]);
  face.color.copy(targetFace);edge.color.copy(targetEdge);
  let disposed=false, lost=false, inView=true, enabled=initialMotion, frameId=0, lastFrame=0, start=performance.now();
  const input={progress:0,x:0,y:0},smooth={progress:0,x:0,y:0};
  function size(){
    if(disposed)return;
    const rect=host.getBoundingClientRect(),width=Math.max(1,rect.width),height=Math.max(1,rect.height);
    camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
    camera.position.z=width<420?9.4:8.7;
    draw(performance.now());
  }
  function draw(now){
    if(disposed||lost)return;
    const t=(now-start)/1000;
    smooth.progress+=(input.progress-smooth.progress)*.07;
    smooth.x+=(input.x-smooth.x)*.06;smooth.y+=(input.y-smooth.y)*.06;
    const p=smooth.progress;
    z.rotation.set(-.08+smooth.y*.13+p*.24,-.23+smooth.x*.3+p*.9,-.1+Math.sin(t*.24)*.035+p*.22);
    echo.rotation.copy(z.rotation);echo.position.z=-.32-p*.65;
    echo.scale.setScalar(1.025+p*.08);echoMaterial.opacity=.035+p*.065;
    face.color.lerp(targetFace,.075);edge.color.lerp(targetEdge,.075);
    sculpture.position.set(.1+smooth.x*.05,-.05+Math.sin(t*.65)*.07-p*.18,0);
    sculpture.scale.setScalar(1.38-p*.12);
    orbitGroup.rotation.set(Math.sin(t*.12)*.1,.1+t*.045+p*.6,-.12+p*.35);
    dust.rotation.y=t*.014;
    nodes.forEach((node,i)=>node.scale.setScalar(1+Math.sin(t+i)*.12));
    camera.position.x=smooth.x*.11;camera.position.y=.12+smooth.y*.08;camera.lookAt(0,0,0);
    renderer.render(scene,camera);
    host.classList.add("has-webgl");
  }
  function active(){return !disposed&&!lost&&enabled&&inView&&!document.hidden;}
  function loop(now){
    frameId=0;
    if(!active())return;
    if(now-lastFrame>=1000/profile.fps-1){draw(now);lastFrame=now;}
    frameId=requestAnimationFrame(loop);
  }
  function schedule(){if(active()&&!frameId)frameId=requestAnimationFrame(loop);else if(!active()&&frameId){cancelAnimationFrame(frameId);frameId=0;}}
  const resize=new ResizeObserver(size);resize.observe(host);
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{rootMargin:"100px"});
  observer.observe(observeTarget||host);
  const onVisibility=()=>schedule();
  document.addEventListener("visibilitychange",onVisibility);
  function onLost(event){event.preventDefault();lost=true;host.classList.remove("has-webgl");schedule();}
  function onRestore(){lost=false;size();schedule();}
  canvas.addEventListener("webglcontextlost",onLost);
  canvas.addEventListener("webglcontextrestored",onRestore);
  size();schedule();
  return {
    setInput(next){input.progress=clamp(next.progress??input.progress);input.x=clamp(next.x??input.x,-1,1);input.y=clamp(next.y??input.y,-1,1);},
    setFinish(next){
      if(!(next in finishes))return;
      finish=next;targetFace.set(finishes[finish][0]);targetEdge.set(finishes[finish][1]);
      if(!active()){face.color.copy(targetFace);edge.color.copy(targetEdge);draw(performance.now());}
    },
    setPaused(paused){enabled=!paused;schedule();},
    dispose(){
      if(disposed)return;disposed=true;if(frameId)cancelAnimationFrame(frameId);
      resize.disconnect();observer.disconnect();document.removeEventListener("visibilitychange",onVisibility);
      canvas.removeEventListener("webglcontextlost",onLost);canvas.removeEventListener("webglcontextrestored",onRestore);
      const geometries=new Set(),materials=new Set();
      scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment.dispose();renderer.dispose();host.classList.remove("has-webgl");
    }
  };
}

