import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { parseHTML } from "linkedom";
import postcss from "postcss";
import { buildZGeometry } from "../dist/scene.mjs";
import { deviceProfile, heroProgress, parallaxOffset } from "../dist/motion.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),dist=path.join(root,"dist");
const html=await fs.readFile(path.join(dist,"index.html"),"utf8");
const appSource=await fs.readFile(path.join(dist,"app.js"),"utf8");
const mathSource=await fs.readFile(path.join(dist,"motion.mjs"),"utf8");

test("all local links and chapter controls resolve without JavaScript",async()=>{
  const {document}=parseHTML(html),ids=Array.from(document.querySelectorAll("[id]"),e=>e.id);
  assert.equal(new Set(ids).size,ids.length,"duplicate id");
  assert.equal(document.querySelectorAll("h1").length,1);
  for(const el of document.querySelectorAll("[href],[src]")){
    const ref=el.getAttribute("href")||el.getAttribute("src")||"";
    if(ref.startsWith("#"))assert.ok(ids.includes(ref.slice(1)),ref);
    else if(ref&&!/^[a-z]+:|^\/\//i.test(ref))await fs.access(path.join(dist,ref.split("?")[0]));
  }
  for(const control of document.querySelectorAll("[data-study]")){
    assert.ok(["ileotaku","nexus","valen","zuwachs"].includes(control.dataset.study));
    assert.equal(control.getAttribute("type"),"button");
  }
  assert.equal(document.querySelectorAll("[data-chapter]").length,4);
  for(const a of document.querySelectorAll('[target="_blank"]'))assert.ok(a.getAttribute("rel").includes("noopener"));
  assert.ok(document.querySelector(".hero-fallback svg"),"static visual fallback");
  assert.equal(document.querySelectorAll('a[href="assets/Isaac_Gold_CV.pdf"]').length,2);
  assert.ok(document.querySelector("noscript"));
});

test("stylesheet is valid and motion can be disabled",async()=>{
  const css=await fs.readFile(path.join(dist,"styles.css"),"utf8");
  const ast=postcss.parse(css);
  assert.ok(ast.nodes.length>20);
  for(const hex of css.match(/#[a-f0-9]+\b/gi)||[])assert.ok([3,4,6,8].includes(hex.length-1),"Invalid color "+hex);
  assert.ok(css.includes("prefers-reduced-motion"));
  assert.ok(css.includes("html[data-motion=off]"));
  assert.ok(css.includes("max-width:480px"));
  assert.ok(css.includes("max-width:850px"));
});

test("3D monogram is finite, volumetric, and contains front and edge faces",()=>{
  const geometry=buildZGeometry();geometry.computeBoundingBox();
  const b=geometry.boundingBox;
  assert.ok(b.max.x-b.min.x>2&&b.max.x-b.min.x<2.6);
  assert.ok(b.max.z-b.min.z>.3&&b.max.z-b.min.z<.6);
  const positions=geometry.getAttribute("position"),normals=geometry.getAttribute("normal");
  assert.ok(positions.count>60);
  assert.ok(Array.from(positions.array).every(Number.isFinite));
  assert.ok(Array.from(normals.array).every(Number.isFinite));
  assert.deepEqual([...new Set(geometry.groups.map(g=>g.materialIndex))].sort(),[0,1]);
  const p=positions.array;let volume=0;
  for(let i=0;i<p.length;i+=9){
    volume+=(p[i]*(p[i+4]*p[i+8]-p[i+5]*p[i+7])+p[i+1]*(p[i+5]*p[i+6]-p[i+3]*p[i+8])+p[i+2]*(p[i+3]*p[i+7]-p[i+4]*p[i+6]))/6;
  }
  assert.ok(Math.abs(volume)>.3,"closed extrusion has physical volume");
  geometry.dispose();
});

test("scroll inputs and mobile rendering budgets stay bounded",()=>{
  const mobile=deviceProfile(390,3,4),desktop=deviceProfile(1440,3,12);
  assert.ok(mobile.pixelRatio<=1.25);assert.ok(mobile.fps<=30);
  assert.ok(mobile.particles<desktop.particles);
  assert.equal(heroProgress(1000,1000,800),0);
  assert.equal(heroProgress(-10000,1000,800),1);
  assert.ok(Math.abs(parallaxOffset(-10000,800,70))<=70);
});

async function environment(reduced=true){
  const {window,document}=parseHTML(html);
  let focus=document.body,nextFrame=1;
  const frames=new Map(),storage=new Map(),copied=[];
  Object.defineProperty(document,"activeElement",{get:()=>focus,configurable:true});
  Object.defineProperty(document.documentElement,"scrollHeight",{value:10000,configurable:true});
  window.HTMLElement.prototype.focus=function(){focus=this;};
  window.HTMLElement.prototype.getBoundingClientRect=function(){
    const index=["ileotaku","nexus","valen","zuwachs"].indexOf(this.dataset?.chapter);
    const top=index>=0?1600+index*900-window.scrollY:100;
    return {top,bottom:top+700,left:0,right:600,width:600,height:700};
  };
  Object.assign(window,{innerWidth:390,innerHeight:844,scrollY:0,isSecureContext:true});
  window.matchMedia=query=>({matches:query.includes("prefers-reduced-motion")?reduced:false,addEventListener(){}});
  const requestAnimationFrame=fn=>{const id=nextFrame++;frames.set(id,fn);return id;};
  window.requestAnimationFrame=requestAnimationFrame;
  window.setTimeout=()=>1;window.requestIdleCallback=()=>1;
  const navigator={connection:{saveData:true},clipboard:{writeText:async value=>copied.push(value)}};
  const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
  const context=vm.createContext({window,document,navigator,localStorage,requestAnimationFrame,cancelAnimationFrame:id=>frames.delete(id),console,Date,Math,Number,Array,String,performance:{now:()=>0}});
  const math=new vm.SourceTextModule(mathSource,{context,identifier:"motion.mjs"});
  const app=new vm.SourceTextModule(appSource,{context,identifier:"app.js"});
  await app.link(specifier=>{assert.equal(specifier,"./motion.mjs");return math;});
  await app.evaluate();
  function flush(){for(const [id,fn] of [...frames]){frames.delete(id);fn(0);}}
  flush();
  function key(target,value){const event=new window.Event("keydown",{bubbles:true,cancelable:true});Object.defineProperty(event,"key",{value});target.dispatchEvent(event);}
  return {window,document,storage,copied,flush,key};
}

test("mobile menu opens, closes on navigation, and responds to Escape",async()=>{
  const {document,key}=await environment();
  const button=document.querySelector(".nav-toggle"),nav=document.querySelector(".nav-links");
  assert.equal(button.hidden,false);
  button.click();assert.equal(button.getAttribute("aria-expanded"),"true");assert.ok(nav.classList.contains("open"));
  nav.querySelector("a").click();assert.equal(button.getAttribute("aria-expanded"),"false");
  button.click();key(document,"Escape");assert.ok(!nav.classList.contains("open"));
});

test("each project story opens with the correct content and closes cleanly",async()=>{
  const {document,key}=await environment();
  const dialog=document.querySelector("dialog");
  for(const [id,title] of [["ileotaku","IleOtaku"],["nexus","Eternal Nexus Echoes"],["valen","VALEN"],["zuwachs","Zuwachs Travel and Tours"]]){
    document.querySelector('[data-study="'+id+'"]').click();
    assert.ok(dialog.hasAttribute("open"));
    assert.equal(document.getElementById("study-title").textContent,title);
    assert.ok(document.getElementById("study-content").textContent.length>100);
    assert.ok(document.body.classList.contains("modal-open"));
    key(dialog,"Escape");
    assert.ok(!dialog.hasAttribute("open"));assert.ok(!document.body.classList.contains("modal-open"));
  }
});

test("reduced motion is respected, manual choice is saved, and email copy works",async()=>{
  const {document,storage,copied,flush}=await environment(true);
  const button=document.querySelector(".motion-toggle");
  assert.equal(document.documentElement.dataset.motion,"off");
  assert.equal(button.getAttribute("aria-pressed"),"false");
  button.click();flush();
  assert.equal(document.documentElement.dataset.motion,"on");
  assert.equal(storage.get("zamyilton-motion"),"on");
  button.click();flush();
  assert.equal(document.documentElement.dataset.motion,"off");
  assert.equal(storage.get("zamyilton-motion"),"off");
  const copy=document.querySelector(".copy-email");copy.click();await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(copied,["zamyilton@ileotaku.com"]);
  assert.equal(document.getElementById("copy-status").textContent,"Email address copied to clipboard.");
});

