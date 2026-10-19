import * as THREE from "./vendor/three.module.min.mjs";
import { clamp, deviceProfile } from "./motion.mjs";

export function buildZGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.12, 1.13);
  [[1.12,1.13],[1.12,.68],[-.3,-.66],[1.12,-.66],[1.12,-1.13],[-1.12,-1.13],[-1.12,-.68],[.3,.66],[-1.12,.66]].forEach(([x,y])=>shape.lineTo(x,y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {depth:.31,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.065,bevelThickness:.065,curveSegments:8});
  geometry.center();
  return geometry;
}

export function startScene({canvas, host, observeTarget, initialMotion = true}) {
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
  camera.position.set(0,.12,9.2);
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

  const face = new THREE.MeshPhysicalMaterial({color:0xb08bdc,metalness:.72,roughness:.24,clearcoat:1,clearcoatRoughness:.15,envMapIntensity:1.2});
  const edge = new THREE.MeshStandardMaterial({color:0xd7b27c,metalness:.86,roughness:.22,envMapIntensity:1.3});
  const z = new THREE.Mesh(buildZGeometry(),[face,edge]);
  sculpture.add(z);
  const orbitGroup = new THREE.Group();
  sculpture.add(orbitGroup);
  const ringMaterial = new THREE.MeshStandardMaterial({color:0xa88ac7,metalness:.55,roughness:.35});
  const goldMaterial = new THREE.MeshStandardMaterial({color:0xdac18f,metalness:.75,roughness:.3});
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.9,.012,6,100),goldMaterial);
  ringA.rotation.set(1.05,.3,-.4);orbitGroup.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.12,.008,6,100),ringMaterial);
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

  let disposed=false, lost=false, inView=true, enabled=initialMotion, frameId=0, lastFrame=0, start=performance.now();
  const input={progress:0,x:0,y:0},smooth={progress:0,x:0,y:0};
  function size(){
    if(disposed)return;
    const rect=host.getBoundingClientRect(),width=Math.max(1,rect.width),height=Math.max(1,rect.height);
    camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
    camera.position.z=width<420?10:9.2;
    draw(performance.now());
  }
  function draw(now){
    if(disposed||lost)return;
    const t=(now-start)/1000;
    smooth.progress+=(input.progress-smooth.progress)*.07;
    smooth.x+=(input.x-smooth.x)*.06;smooth.y+=(input.y-smooth.y)*.06;
    const p=smooth.progress;
    z.rotation.set(-.12+smooth.y*.1+p*.28,-.45+smooth.x*.24+p*1.4,-.13+Math.sin(t*.24)*.04+p*.4);
    sculpture.position.set(.1+smooth.x*.05,-.05+Math.sin(t*.65)*.07-p*.18,0);
    sculpture.scale.setScalar(1.2-p*.12);
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

