// The selected dragon is the texture and the final pose, not a substitute icon.
export const INTRO_TIMING = Object.freeze({fly:1550,hold:1870,curl:2780,fire:2900,fireEnd:3650,fade:3970,end:4380});
const clamp = (n,min=0,max=1) => Math.min(max,Math.max(min,n));
const smooth = n => { n=clamp(n);return n*n*(3-2*n); };
const mix = (a,b,n) => a+(b-a)*n;

export function introPose(milliseconds,width,height) {
  const time=Math.max(0,milliseconds),p=clamp(time/INTRO_TIMING.fly);
  const curl=smooth((time-INTRO_TIMING.hold)/(INTRO_TIMING.curl-INTRO_TIMING.hold));
  const size=Math.min(326,width*.54,height*.43)*mix(.91,1,curl);
  const travel=1-(1-p)**2;
  return {
    time,size,curl,
    x:mix(-size*1.1,width*.5,travel),
    y:height*.5+Math.sin(p*Math.PI*3)*Math.sin(p*Math.PI)*Math.min(90,height*.13),
    rotation:Math.sin(p*Math.PI*2)*Math.sin(p*Math.PI)*.2,
    fire:smooth((time-INTRO_TIMING.fire)/170)*(1-smooth((time-INTRO_TIMING.fireEnd)/290)),
    opacity:1-smooth((time-INTRO_TIMING.fade)/(INTRO_TIMING.end-INTRO_TIMING.fade)),
    phase:time<INTRO_TIMING.fly?"flight":time<INTRO_TIMING.hold?"hover":time<INTRO_TIMING.curl?"curl":time<INTRO_TIMING.fireEnd?"flame":time<INTRO_TIMING.fade?"sigil":"reveal"
  };
}

// A deformable texture grid unfolds the body, ripples the tail and beats the wing.
// The head settles first; the tail follows into the exact, undeformed favicon.
export function deformDragonPoint(u,v,pose) {
  const curl=smooth((pose.curl-v*.14)/.86);
  const tailWave=Math.sin(v*10.5-pose.time*.0078)*.105*(.18+v*.82);
  const wing=(1-smooth((u-.4)/.34))*(1-smooth((v-.4)/.2));
  const flap=Math.sin(pose.time*.012)*wing*.135;
  const x=mix((.5-v)*1.54+(u-.5)*.34+flap*.28,u-.5,curl);
  const y=mix((u-.55)*.53+tailWave+flap,v-.5,curl);
  const c=Math.cos(pose.rotation),s=Math.sin(pose.rotation);
  return {x:pose.x+(x*c-y*s)*pose.size,y:pose.y+(x*s+y*c)*pose.size};
}

function paintTriangle(ctx,texture,a,b,c) {
  const denominator=a.u*(b.v-c.v)+b.u*(c.v-a.v)+c.u*(a.v-b.v);
  const coefficient=(key)=>[
    (a[key]*(b.v-c.v)+b[key]*(c.v-a.v)+c[key]*(a.v-b.v))/denominator,
    (a[key]*(c.u-b.u)+b[key]*(a.u-c.u)+c[key]*(b.u-a.u))/denominator,
    (a[key]*(b.u*c.v-c.u*b.v)+b[key]*(c.u*a.v-a.u*c.v)+c[key]*(a.u*b.v-b.u*a.v))/denominator
  ];
  const [ax,cx,ex]=coefficient("x"),[by,dy,fy]=coefficient("y");
  const center={x:(a.x+b.x+c.x)/3,y:(a.y+b.y+c.y)/3};
  ctx.save();ctx.beginPath();
  [a,b,c].forEach((point,i)=>{
    const dx=point.x-center.x,dy=point.y-center.y,length=Math.hypot(dx,dy)||1;
    ctx[i?"lineTo":"moveTo"](point.x+dx/length*.35,point.y+dy/length*.35);
  });
  ctx.closePath();ctx.clip();ctx.transform(ax,by,cx,dy,ex,fy);
  const minU=Math.max(0,Math.min(a.u,b.u,c.u)-1),minV=Math.max(0,Math.min(a.v,b.v,c.v)-1);
  const tileW=Math.min(512,Math.max(a.u,b.u,c.u)+1)-minU,tileH=Math.min(512,Math.max(a.v,b.v,c.v)+1)-minV;
  ctx.drawImage(texture,minU,minV,tileW,tileH,minU,minV,tileW,tileH);ctx.restore();
}

function drawFlame(ctx,pose,width,mobile) {
  if(pose.fire<=0)return;
  const mouth=deformDragonPoint(.922,.354,pose);
  const length=Math.min(220,width*.275)*(.36+.64*pose.fire);
  const tick=(pose.time-INTRO_TIMING.fire)/1000;
  ctx.save();ctx.translate(mouth.x,mouth.y);ctx.rotate(.14);
  ctx.globalCompositeOperation="lighter";
  const glow=ctx.createRadialGradient(20,0,0,40,0,length);
  glow.addColorStop(0,"rgba(178,77,255,"+pose.fire*.38+")");glow.addColorStop(1,"rgba(90,23,197,0)");
  ctx.fillStyle=glow;ctx.fillRect(-length*.6,-length,length*2,length*2);
  for(let layer=0;layer<3;layer++) {
    const scale=[1,.68,.3][layer],reach=length*[1,.85,.64][layer];
    const outline=[];
    for(let side=0;side<2;side++)for(let i=0;i<=28;i++) {
      const u=(side?28-i:i)/28;
      const wave=Math.sin(u*13-tick*17)*u*length*.033;
      const edge=(Math.sin(Math.PI*u)**.68)*length*.16*scale*(.73+.27*Math.sin(u*31-tick*23+layer));
      const x=u*reach,y=wave+(side?1:-1)*edge;
      outline.push({x,y});
    }
    ctx.beginPath();ctx.moveTo(outline[0].x,outline[0].y);
    for(let i=1;i<outline.length;i++){
      const point=outline[i],next=outline[(i+1)%outline.length];
      ctx.quadraticCurveTo(point.x,point.y,(point.x+next.x)/2,(point.y+next.y)/2);
    }
    ctx.closePath();
    const fire=ctx.createLinearGradient(0,0,reach,0);
    fire.addColorStop(0,["rgba(154,69,255,.9)","rgba(215,153,255,.96)","rgba(255,238,255,.97)"][layer]);
    fire.addColorStop(.35,["rgba(124,39,245,.85)","rgba(171,82,255,.9)","rgba(214,160,255,.9)"][layer]);
    fire.addColorStop(1,"rgba(83,20,189,0)");
    ctx.globalAlpha=pose.fire;ctx.fillStyle=fire;ctx.fill();
  }
  const count=mobile?24:44;
  for(let i=0;i<count;i++) {
    const u=((tick*1.55+i*.6180339)%1+1)%1;
    const spread=Math.sin(i*78.23)*length*.22*u**1.2;
    const x=length*u,y=spread+Math.sin(u*12-tick*12)*length*.035;
    ctx.globalAlpha=pose.fire*(1-u)*.7;
    ctx.fillStyle=i%4?"#ad65ff":"#f1d4ff";ctx.beginPath();
    ctx.arc(x,y,(.7+(i%4)*.5)*(1-u*.5),0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// One GPU mesh draw keeps the articulated flight light on desktop and phones.
// A small 2D mesh remains available when WebGL is disabled or loses its context.
function createMeshPainter(texture,vertices,triangles,createCanvas) {
  const surface=createCanvas();let gl=null,program=null,positionBuffer=null,uvBuffer=null,indexBuffer=null,artwork=null;
  const shaders=[];
  function dispose(){
    if(!gl)return;
    [positionBuffer,uvBuffer,indexBuffer].forEach(buffer=>{if(buffer)gl.deleteBuffer(buffer);});
    if(artwork)gl.deleteTexture(artwork);if(program)gl.deleteProgram(program);
    shaders.forEach(shader=>gl.deleteShader(shader));
    surface.width=1;surface.height=1;
  }
  try {
    gl=surface.getContext("webgl",{alpha:true,antialias:true,depth:false,stencil:false,powerPreference:"low-power"});
    if(!gl)return null;
    function compile(type,source){
      const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error("Intro shader unavailable");
      return shader;
    }
    program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,"attribute vec2 a_position;attribute vec2 a_uv;varying mediump vec2 v_uv;void main(){v_uv=a_uv;gl_Position=vec4(a_position,0.,1.);}"));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,"precision mediump float;varying mediump vec2 v_uv;uniform sampler2D u_art;void main(){gl_FragColor=texture2D(u_art,v_uv);}"));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Intro program unavailable");
    gl.useProgram(program);
    const positions=new Float32Array(vertices.length*2),uvs=new Float32Array(vertices.length*2);
    vertices.forEach((vertex,i)=>{uvs[i*2]=vertex.u;uvs[i*2+1]=vertex.v;});
    positionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,positions.byteLength,gl.DYNAMIC_DRAW);
    const positionLocation=gl.getAttribLocation(program,"a_position");gl.enableVertexAttribArray(positionLocation);gl.vertexAttribPointer(positionLocation,2,gl.FLOAT,false,0,0);
    uvBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffer);gl.bufferData(gl.ARRAY_BUFFER,uvs,gl.STATIC_DRAW);
    const uvLocation=gl.getAttribLocation(program,"a_uv");gl.enableVertexAttribArray(uvLocation);gl.vertexAttribPointer(uvLocation,2,gl.FLOAT,false,0,0);
    const indices=new Uint16Array(triangles.flat());
    indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
    artwork=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,artwork);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,texture);
    gl.uniform1i(gl.getUniformLocation(program,"u_art"),0);
    gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0,0,0,0);
    return {
      get available(){return !gl.isContextLost();},
      draw(points,width,height,pixelRatio){
        const w=Math.round(width*pixelRatio),h=Math.round(height*pixelRatio);
        if(surface.width!==w||surface.height!==h){surface.width=w;surface.height=h;gl.viewport(0,0,w,h);}
        points.forEach((point,i)=>{positions[i*2]=point.x/width*2-1;positions[i*2+1]=1-point.y/height*2;});
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,positions);
        gl.clear(gl.COLOR_BUFFER_BIT);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
        return surface;
      },dispose
    };
  }catch{dispose();return null;}
}

export function createIntroRenderer(canvas,image,{width,height,pixelRatio=1,createCanvas=()=>document.createElement("canvas")}={}) {
  const ctx=canvas.getContext("2d",{alpha:false});
  if(!ctx)throw new Error("Canvas unavailable");
  const texture=createCanvas();texture.width=512;texture.height=512;
  const sample=texture.getContext("2d",{willReadFrequently:true});
  sample.drawImage(image,0,0,512,512);
  const alpha=sample.getImageData(0,0,512,512).data;
  const mobile=width<700,columns=mobile?12:18,rows=mobile?16:22;
  function cellHasInk(x,y,cols,lines) {
    for(let sy=Math.floor(y/lines*512);sy<Math.ceil((y+1)/lines*512);sy+=3)
      for(let sx=Math.floor(x/cols*512);sx<Math.ceil((x+1)/cols*512);sx+=3)
        if(alpha[(sy*512+sx)*4+3]>12)return true;
    return false;
  }
  const vertices=[],triangles=[];
  for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++)vertices.push({u:x/columns,v:y/rows});
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++) {
    if(cellHasInk(x,y,columns,rows)){const a=y*(columns+1)+x,b=a+1,c=a+columns+1,d=c+1;triangles.push([a,b,d],[a,d,c]);}
  }
  const gpu=createMeshPainter(texture,vertices,triangles,createCanvas);
  const fallbackVertices=[],fallbackTriangles=[];
  for(let y=0;y<=10;y++)for(let x=0;x<=8;x++)fallbackVertices.push({u:x/8,v:y/10});
  for(let y=0;y<10;y++)for(let x=0;x<8;x++){
    if(cellHasInk(x,y,8,10)){const a=y*9+x,b=a+1,c=a+9,d=c+1;fallbackTriangles.push([a,b,d],[a,d,c]);}
  }
  let w=width,h=height,dpr;
  function resize(nextWidth,nextHeight,nextRatio=pixelRatio) {
    w=Math.max(1,nextWidth);h=Math.max(1,nextHeight);dpr=clamp(nextRatio,1,w<700?1.35:1.75);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    if(canvas.style){canvas.style.width=w+"px";canvas.style.height=h+"px";}
  }
  resize(width,height);
  return {
    get fps(){return gpu?.available?(mobile?30:60):24;},
    resize,
    draw(milliseconds) {
      const pose=introPose(milliseconds,w,h);
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
      ctx.fillStyle="#0b0910";ctx.fillRect(0,0,w,h);
      const aura=ctx.createRadialGradient(w*.5,h*.5,5,w*.5,h*.5,Math.min(w,h)*.66);
      aura.addColorStop(0,"rgba(91,37,133,"+(.12+pose.fire*.15)+")");aura.addColorStop(1,"rgba(11,9,16,0)");
      ctx.fillStyle=aura;ctx.fillRect(0,0,w,h);
      for(let i=0;i<(mobile?22:46);i++) {
        const x=((i*.618034)%1)*w,y=((i*.38217+.19)%1)*h;
        ctx.fillStyle="rgba(222,192,139,"+(.1+.12*Math.sin(i+milliseconds*.0006)**2)+")";
        ctx.fillRect(x,y,1,1);
      }
      if(milliseconds<INTRO_TIMING.hold) {
        for(let line=0;line<3;line++) {
          ctx.beginPath();
          for(let i=0;i<=36;i++) {
            const past=introPose(Math.max(0,milliseconds-650+i/36*570),w,h);
            const tail=deformDragonPoint(.67,.9,past);
            ctx[i?"lineTo":"moveTo"](tail.x,tail.y+(line-1)*7);
          }
          const trail=ctx.createLinearGradient(pose.x-pose.size*2,0,pose.x,0);
          trail.addColorStop(0,"rgba(118,66,170,0)");trail.addColorStop(1,line===1?"rgba(221,174,85,.28)":"rgba(165,92,230,.19)");
          ctx.strokeStyle=trail;ctx.lineWidth=line===1?1:.6;ctx.stroke();
        }
      }
      if(pose.curl>0) {
        ctx.save();ctx.translate(w*.5,h*.5);ctx.rotate(milliseconds*.00017);
        ctx.globalAlpha=pose.curl*.19;ctx.strokeStyle="#c4a574";ctx.lineWidth=.7;
        ctx.beginPath();ctx.arc(0,0,pose.size*.72,.2,Math.PI*1.34);ctx.stroke();
        ctx.strokeStyle="#a073d7";ctx.beginPath();ctx.arc(0,0,pose.size*.77,Math.PI,Math.PI*1.8);ctx.stroke();ctx.restore();
      }
      if(pose.curl>=1)ctx.drawImage(image,pose.x-pose.size/2,pose.y-pose.size/2,pose.size,pose.size);
      else {
        const useGPU=gpu?.available,source=useGPU?vertices:fallbackVertices;
        const points=source.map(vertex=>({...deformDragonPoint(vertex.u,vertex.v,pose),u:vertex.u*512,v:vertex.v*512}));
        if(useGPU)ctx.drawImage(gpu.draw(points,w,h,dpr),0,0,w,h);
        else for(const [a,b,c] of fallbackTriangles)paintTriangle(ctx,texture,points[a],points[b],points[c]);
      }
      drawFlame(ctx,pose,w,mobile);
      return pose;
    },
    dispose(){gpu?.dispose();canvas.width=1;canvas.height=1;texture.width=1;texture.height=1;}
  };
}

export function startDragonIntro({enabled=true,onComplete=()=>{},host=window,doc=document}={}) {
  const root=doc.documentElement,overlay=doc.getElementById("dragon-intro");
  const canvas=doc.getElementById("intro-canvas"),skip=overlay?.querySelector(".intro-skip");
  let active=false,frame=0,renderer=null,watchdog=0,started=null,lastPaint=-Infinity,image=null;
  const previousFocus=doc.activeElement,locked=[];
  const handle={get active(){return active;},stop:finish};
  function finish() {
    const wasActive=active;active=false;
    host.cancelAnimationFrame?.(frame);host.clearTimeout(watchdog);host.clearTimeout(host.__zamyiltonIntroTimer);
    delete host.__zamyiltonIntroTimer;delete root.dataset.intro;
    locked.forEach(element=>element.removeAttribute("inert"));
    skip?.removeEventListener("click",finish);doc.removeEventListener("keydown",key);
    doc.removeEventListener("visibilitychange",visibility);host.removeEventListener("pagehide",finish);
    host.removeEventListener("resize",resize);host.removeEventListener("zamyilton:intro-timeout",finish);
    if(image){image.onload=null;image.onerror=null;}
    renderer?.dispose();renderer=null;
    if(wasActive&&overlay?.contains(doc.activeElement)){
      const focus=previousFocus&&previousFocus!==doc.body?previousFocus:doc.querySelector(".brand");
      focus?.focus?.({preventScroll:true});
    }
    if(wasActive)onComplete();
  }
  function key(event){
    if(event.key==="Escape"){event.preventDefault();finish();}
    else if(event.key==="Tab"){event.preventDefault();skip?.focus();}
  }
  function visibility(){if(doc.hidden)finish();}
  function resize(){renderer?.resize(host.innerWidth,host.innerHeight,host.devicePixelRatio||1);}
  function tick(now) {
    if(!active||!renderer)return;
    if(started===null)started=now;
    const elapsed=now-started;
    try {
      if(now-lastPaint>=1000/renderer.fps-1) {
        const pose=renderer.draw(elapsed);lastPaint=now;
        overlay.dataset.phase=pose.phase;overlay.style.opacity=String(pose.opacity);
      }
      if(elapsed>=INTRO_TIMING.end)finish();else frame=host.requestAnimationFrame(tick);
    } catch {finish();}
  }
  if(!enabled||root.dataset.intro!=="pending"||!overlay||!canvas||!skip||!host.Image||doc.hidden){finish();return handle;}
  try {
    active=true;
    for(const element of doc.body.children)if(element!==overlay&&!element.hasAttribute("inert")&&!['SCRIPT','NOSCRIPT','STYLE'].includes(element.tagName)){
      element.setAttribute("inert","");locked.push(element);
    }
    root.dataset.intro="playing";overlay.style.opacity="1";
    skip.addEventListener("click",finish);doc.addEventListener("keydown",key);
    doc.addEventListener("visibilitychange",visibility);host.addEventListener("pagehide",finish);
    host.addEventListener("resize",resize,{passive:true});host.addEventListener("zamyilton:intro-timeout",finish);
    skip.focus({preventScroll:true});watchdog=host.setTimeout(finish,6500);
    image=new host.Image();image.decoding="async";
    image.onload=()=>{
      if(!active)return;
      try {
        renderer=createIntroRenderer(canvas,image,{width:host.innerWidth,height:host.innerHeight,pixelRatio:host.devicePixelRatio||1,createCanvas:()=>doc.createElement("canvas")});
        overlay.dataset.ready="true";frame=host.requestAnimationFrame(tick);
      }catch{finish();}
    };
    image.onerror=finish;image.src="assets/zamyilton-dragon-gold-purple.png";
  }catch{finish();}
  return handle;
}
