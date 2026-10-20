import {test} from "node:test";
import assert from "node:assert/strict";
import {parseHTML} from "linkedom";
import fs from "node:fs/promises";
import vm from "node:vm";
import {INTRO_TIMING,introPose,deformDragonPoint,startDragonIntro} from "../dist/intro.mjs";

const html=await fs.readFile(new URL("../dist/index.html",import.meta.url),"utf8");

test("the flight stops at screen center, curls into the original icon, then breathes",()=>{
  for(const [width,height] of [[320,568],[390,844],[1440,900]]) {
    assert.ok(introPose(0,width,height).x<0);
    const landing=introPose(INTRO_TIMING.fly,width,height);
    assert.ok(Math.abs(landing.x-width/2)<1e-8);assert.equal(landing.y,height/2);
    assert.equal(landing.phase,"hover");assert.equal(landing.fire,0);
    const end=introPose(INTRO_TIMING.curl,width,height);
    for(const [u,v] of [[0,0],[.922,.354],[.17,.55],[.9,.94],[1,1]]) {
      const p=deformDragonPoint(u,v,end);
      assert.ok(Math.abs(p.x-(width/2+(u-.5)*end.size))<1e-8);
      assert.ok(Math.abs(p.y-(height/2+(v-.5)*end.size))<1e-8);
    }
    assert.equal(end.fire,0,"fire starts only after the curl is complete");
    assert.ok(introPose(INTRO_TIMING.fire+300,width,height).fire>.9);
    assert.equal(introPose(INTRO_TIMING.end,width,height).opacity,0);
    for(let t=0;t<=INTRO_TIMING.end;t+=45)for(const [u,v] of [[0,0],[.7,.26],[.92,.35],[.5,.66],[.9,.94],[1,1]]) {
      const pose=introPose(t,width,height),point=deformDragonPoint(u,v,pose);
      assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));
      assert.ok(pose.fire>=0&&pose.fire<=1&&pose.opacity>=0&&pose.opacity<=1);
    }
  }
  const a=deformDragonPoint(.17,.5,introPose(500,1440,900)),b=deformDragonPoint(.17,.5,introPose(650,1440,900));
  assert.notEqual(a.y,b.y,"flight includes wing/body deformation");
});

function environment({enabled=true}={}) {
  const {window,document}=parseHTML(html);
  let focus=document.body,completed=0,next=1;
  const timeouts=new Map(),frames=new Map(),images=[];
  Object.defineProperty(document,"activeElement",{get:()=>focus,configurable:true});
  window.HTMLElement.prototype.focus=function(){focus=this;};
  class Image {constructor(){images.push(this);}}
  const host={innerWidth:390,innerHeight:844,devicePixelRatio:3,Image,
    addEventListener:window.addEventListener.bind(window),removeEventListener:window.removeEventListener.bind(window),
    setTimeout:fn=>{const id=next++;timeouts.set(id,fn);return id;},clearTimeout:id=>timeouts.delete(id),
    requestAnimationFrame:fn=>{const id=next++;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)};
  document.documentElement.dataset.intro="pending";
  const intro=startDragonIntro({enabled,host,doc:document,onComplete:()=>completed++});
  function key(value){const event=new window.Event("keydown",{bubbles:true,cancelable:true});Object.defineProperty(event,"key",{value});document.dispatchEvent(event);}
  return {window,document,intro,images,timeouts,frames,key,completed:()=>completed};
}

for(const action of ["skip","escape","image failure","watchdog","pagehide"])test("intro unlocks content and releases focus after "+action,()=>{
  const env=environment(),{document,intro,images,timeouts,key,window}=env;
  assert.equal(intro.active,true);assert.ok(document.querySelector("main").hasAttribute("inert"));
  assert.equal(document.activeElement,document.querySelector(".intro-skip"));
  if(action==="skip")document.querySelector(".intro-skip").click();
  if(action==="escape")key("Escape");
  if(action==="image failure")images[0].onerror();
  if(action==="watchdog")[...timeouts.values()][0]();
  if(action==="pagehide")window.dispatchEvent(new window.Event("pagehide"));
  assert.equal(intro.active,false);assert.equal(document.documentElement.dataset.intro,undefined);
  assert.equal(document.querySelectorAll("[inert]").length,0);assert.equal(env.completed(),1);
  assert.equal(document.activeElement,document.querySelector(".brand"));
  assert.equal(timeouts.size,0);intro.stop();assert.equal(env.completed(),1);
});

test("reduced motion never loads an image or holds page interaction",()=>{
  const {document,intro,images,timeouts}=environment({enabled:false});
  assert.equal(intro.active,false);assert.equal(images.length,0);assert.equal(timeouts.size,0);
  assert.equal(document.querySelectorAll("[inert]").length,0);
});

test("bootstrap respects reduced motion, saved motion choice, deep links and module failure",()=>{
  const {document}=parseHTML(html);
  const bootstrap=Array.from(document.querySelectorAll("script")).find(script=>!script.hasAttribute("src")).textContent;
  for(const options of [{reduced:true},{stored:"off"},{stored:"on"},{hash:"#contact"},{}]) {
    const {window,document}=parseHTML(html);let timeout;
    window.matchMedia=()=>({matches:!!options.reduced});window.location={hash:options.hash||""};
    window.setTimeout=fn=>{timeout=fn;return 1;};
    vm.runInNewContext(bootstrap,{window,document,localStorage:{getItem:()=>options.stored||null},Event:window.Event});
    const skip=!!(options.reduced||options.stored==="off"||options.hash);
    assert.equal(document.documentElement.dataset.intro,skip?undefined:"pending");
    if(!skip){timeout();assert.equal(document.documentElement.dataset.intro,undefined,"failed modules cannot leave a blocking overlay");}
  }
});
