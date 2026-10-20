// The selected favicon appears in place; only the purple breath animates.
export const INTRO_TIMING = Object.freeze({appear:260,fire:320,fireEnd:1480,fade:1860,end:2220});
const clamp = (n,min=0,max=1) => Math.min(max,Math.max(min,n));
const smooth = n => { n=clamp(n);return n*n*(3-2*n); };

export function introPose(milliseconds,width,height) {
  const time=Math.max(0,milliseconds);
  return {
    time,size:Math.min(326,width*.54,height*.43),x:width*.5,y:height*.5,
    appearance:smooth(time/INTRO_TIMING.appear),
    fire:smooth((time-INTRO_TIMING.fire)/170)*(1-smooth((time-INTRO_TIMING.fireEnd)/290)),
    opacity:1-smooth((time-INTRO_TIMING.fade)/(INTRO_TIMING.end-INTRO_TIMING.fade)),
    phase:time<INTRO_TIMING.fire?"appear":time<INTRO_TIMING.fireEnd?"flame":time<INTRO_TIMING.fade?"sigil":"reveal"
  };
}

export function dragonPoint(u,v,pose) {
  return {x:pose.x+(u-.5)*pose.size,y:pose.y+(v-.5)*pose.size};
}

function drawFlame(ctx,pose,width,mobile) {
  if(pose.fire<=0)return;
  const mouth=dragonPoint(.922,.354,pose);
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

export function createIntroRenderer(canvas,image,{width,height,pixelRatio=1}={}) {
  const ctx=canvas.getContext("2d",{alpha:false});
  if(!ctx)throw new Error("Canvas unavailable");
  let w=width,h=height,dpr;
  function resize(nextWidth,nextHeight,nextRatio=pixelRatio) {
    w=Math.max(1,nextWidth);h=Math.max(1,nextHeight);dpr=clamp(nextRatio,1,w<700?1.35:1.75);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    if(canvas.style){canvas.style.width=w+"px";canvas.style.height=h+"px";}
  }
  resize(width,height);
  return {
    fps:30,
    resize,
    draw(milliseconds) {
      const pose=introPose(milliseconds,w,h),mobile=w<700;
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
      ctx.save();ctx.translate(pose.x,pose.y);
      ctx.globalAlpha=pose.appearance*.19;ctx.strokeStyle="#c4a574";ctx.lineWidth=.7;
      ctx.beginPath();ctx.arc(0,0,pose.size*.72,.2,Math.PI*1.34);ctx.stroke();
      ctx.strokeStyle="#a073d7";ctx.beginPath();ctx.arc(0,0,pose.size*.77,Math.PI,Math.PI*1.8);ctx.stroke();ctx.restore();
      ctx.globalAlpha=pose.appearance;
      ctx.drawImage(image,pose.x-pose.size/2,pose.y-pose.size/2,pose.size,pose.size);
      ctx.globalAlpha=1;
      drawFlame(ctx,pose,w,mobile);
      return pose;
    },
    dispose(){canvas.width=1;canvas.height=1;}
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
        renderer=createIntroRenderer(canvas,image,{width:host.innerWidth,height:host.innerHeight,pixelRatio:host.devicePixelRatio||1});
        overlay.dataset.ready="true";frame=host.requestAnimationFrame(tick);
      }catch{finish();}
    };
    image.onerror=finish;image.src="assets/zamyilton-dragon-gold-purple.png";
  }catch{finish();}
  return handle;
}
