import { clamp, heroProgress, parallaxOffset } from "./motion.mjs";
"use strict";
(function(){
  var projectData = {
    ileotaku: {
      title: "IleOtaku", kind: "PLATFORM / INDEPENDENT PRODUCT", type: "READERS / CREATORS / COMMUNITY",
      summary: "A reading and creator platform, bringing content publishing and community interactions into a shared product.",
      preview: "A reading and creator platform with content publishing, messaging and media.",
      blocks: [
        ["The product", "IleOtaku brings together reader experiences, creator tools, profiles, an activity feed and direct messaging. It is being developed and refined through beta use."],
        ["Project work", ["Reader, creator and admin interfaces with authentication, profiles and publishing workflows.", "Messaging, media and chat customization, including conversation and universal preferences.", "Responsive interface improvements and iteration based on beta feedback."]],
        ["Technology", "React, Next.js, TypeScript, Firebase Authentication, Firestore, Tailwind CSS and Zustand."],
        ["Status", "Beta product in active development. Specific features continue to be tested and improved."]
      ],
      links: [["Visit IleOtaku", "https://ileotaku.com"], ["Discuss this project", "mailto:zamyilton@ileotaku.com?subject=IleOtaku%20project"]]
    },
    nexus: {
      title: "Eternal Nexus Echoes", kind: "BROWSER RPG / INDEPENDENT PRODUCT", type: "WORLDS / SYSTEMS / INTERACTION",
      summary: "A multiplayer browser RPG combining a 3D game client, progression and social systems.",
      preview: "An interactive browser world with character creation, combat, progression and social interfaces.",
      blocks: [
        ["The experience", "Eternal Nexus Echoes is a web edition within the Eternal Nexus setting. The browser client brings players into a stylized world with character creation, gameplay controls and multiplayer interactions."],
        ["Project work", ["A React and Three.js client for character creation, the game interface and interaction controls.", "Chat, party interfaces and other real-time social features connected through Colyseus.", "Progression and economy interfaces backed by an authoritative game server and persistent player data."]],
        ["Technology", "Next.js, React, TypeScript, React Three Fiber, Three.js, Colyseus, Firebase Authentication and Firestore."],
        ["Status", "In development. The project continues to evolve through gameplay and interface testing."]
      ],
      links: [["Request a walkthrough", "mailto:zamyilton@ileotaku.com?subject=Eternal%20Nexus%20Echoes%20walkthrough"]]
    },
    valen: {
      title: "VALEN", kind: "ANDROID / ASSISTANT PROTOTYPE", type: "VOICE / MEMORY / INTERACTION",
      summary: "An Android assistant prototype exploring voice interaction, tasks, memory and a personal interface.",
      preview: "An Android assistant prototype exploring spoken interaction, tasks and memory.",
      blocks: [
        ["The prototype", "VALEN explores an assistant experience on Android. The current work includes tasks, memory notes, settings and spoken interaction."],
        ["Project work", ["Task, memory and settings screens built with Kotlin and Jetpack Compose.", "Speech input and spoken responses integrated into the Android interface.", "Signed builds through GitHub Actions and an Ubuntu-hosted backend maintained with systemd."]],
        ["Technology", "Kotlin, Jetpack Compose, Android speech APIs, GitHub Actions, Ubuntu and systemd."],
        ["Status", "Prototype. The long-term autonomous assistant vision extends beyond the capabilities represented here."]
      ],
      links: [["Discuss the prototype", "mailto:zamyilton@ileotaku.com?subject=VALEN%20prototype"]]
    },
    zuwachs: {
      title: "Zuwachs Travel and Tours", kind: "BUSINESS WEBSITE", type: "INFORMATION / CONSULTATION / ENQUIRIES",
      summary: "A website presenting a travel business and helping prospective customers find services and make contact.",
      preview: "A travel business website with services, consultation calls to action and enquiry forms.",
      blocks: [
        ["The business need", "Visitors need to understand the available travel services, find consultation options and reach the business with a relevant enquiry."],
        ["Project work", ["A website presenting travel service information and consultation calls to action.", "Contact details and enquiry form interfaces organized around prospective customer questions.", "Service content covering visa assistance, travel support and related offerings."]],
        ["Status", "Live business website. The public site is available at zuwachstravel.com."]
      ],
      links: [["Visit Zuwachs Travel", "https://zuwachstravel.com"], ["Discuss a website project", "mailto:zamyilton@ileotaku.com?subject=Website%20project"]]
    }
  };


  const root = document.documentElement;
  root.classList.add("js");
  const preference = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : {matches:false};
  let stored = null;
  try { stored = localStorage.getItem("zamyilton-motion"); } catch (_) {}
  let manualMotion = stored === "on" || stored === "off";
  let motionEnabled = manualMotion ? stored === "on" : !preference.matches;
  let scene = null, sceneLoading = false, sceneFailed = false, sceneAllowed = false;
  let frame = 0, sceneInput = {progress:0,x:0,y:0};
  const hero = document.querySelector(".hero-section");
  const heroArt = document.getElementById("hero-art");
  const sceneHost = document.getElementById("hero-scene");
  const motionButton = document.querySelector(".motion-toggle");
  const dialog = document.querySelector(".study-dialog");
  const parallaxElements = Array.from(document.querySelectorAll("[data-depth]"));
  const marquees = Array.from(document.querySelectorAll("[data-marquee]"));
  const chapters = Array.from(document.querySelectorAll("[data-chapter]"));
  const railLinks = Array.from(document.querySelectorAll("[data-rail]"));
  function scenePaused() { return !motionEnabled || !!dialog?.hasAttribute("open"); }
  function applyMotion() {
    root.dataset.motion = motionEnabled ? "on" : "off";
    if(motionButton){
      motionButton.hidden=false;
      motionButton.setAttribute("aria-pressed",String(motionEnabled));
      motionButton.setAttribute("aria-label","Animated effects");
      motionButton.querySelector(".motion-label").textContent=motionEnabled?"Motion on":"Motion off";
    }
    if(!motionEnabled){
      parallaxElements.forEach(el=>el.style.setProperty("--parallax-y","0px"));
      marquees.forEach(el=>el.style.setProperty("--word-shift","0px"));
      document.querySelectorAll(".magnetic").forEach(el=>{el.style.setProperty("--mx","0px");el.style.setProperty("--my","0px");});
      document.querySelectorAll("[data-tilt]").forEach(el=>{el.style.setProperty("--rx","0deg");el.style.setProperty("--ry","0deg");});
    }
    scene?.setPaused(scenePaused());
    if(motionEnabled)ensureScene();
    requestUpdate();
  }
  function ensureScene(){
    if(!sceneAllowed||scene||sceneLoading||sceneFailed||!motionEnabled||navigator.connection?.saveData||!("WebGL2RenderingContext" in window))return;
    const rect=hero?.getBoundingClientRect();
    if(rect&&(rect.bottom<0||rect.top>window.innerHeight))return;
    sceneLoading=true;
    import("./scene.mjs").then(({startScene})=>{
      scene=startScene({canvas:document.getElementById("hero-canvas"),host:sceneHost,observeTarget:hero,initialMotion:!scenePaused()});
      scene.setInput(sceneInput);
      scene.setPaused(scenePaused());
    }).catch(()=>{sceneFailed=true;if(sceneHost)sceneHost.dataset.scene="fallback";}).finally(()=>{sceneLoading=false;});
  }
  motionButton?.addEventListener("click",()=>{
    manualMotion=true;motionEnabled=!motionEnabled;sceneAllowed=true;
    try{localStorage.setItem("zamyilton-motion",motionEnabled?"on":"off");}catch(_){}
    applyMotion();
  });
  preference.addEventListener?.("change",event=>{if(!manualMotion){motionEnabled=!event.matches;applyMotion();}});

  const toggle=document.querySelector(".nav-toggle"),nav=document.getElementById("nav-links");
  function closeNav(){nav?.classList.remove("open");toggle?.setAttribute("aria-expanded","false");}
  if(toggle&&nav){
    toggle.hidden=false;
    toggle.addEventListener("click",()=>{
      const open=toggle.getAttribute("aria-expanded")!=="true";
      toggle.setAttribute("aria-expanded",String(open));nav.classList.toggle("open",open);
    });
    nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",closeNav));
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&nav.classList.contains("open")){closeNav();toggle.focus();}});
  }

  let previousFocus=null;
  function renderStudy(id){
    const data=projectData[id];if(!data||!dialog)return;
    previousFocus=document.activeElement;
    document.getElementById("study-title").textContent=data.title;
    document.getElementById("study-kind").textContent=data.kind;
    document.getElementById("study-summary").textContent=data.summary;
    const content=document.getElementById("study-content"),links=document.getElementById("study-links");
    content.replaceChildren();links.replaceChildren();
    data.blocks.forEach(([title,value])=>{
      const section=document.createElement("section");section.className="study-block";
      const heading=document.createElement("h3");heading.textContent=title;section.appendChild(heading);
      if(Array.isArray(value)){
        const ul=document.createElement("ul");
        value.forEach(line=>{const li=document.createElement("li");li.textContent=line;ul.appendChild(li);});section.appendChild(ul);
      }else{const p=document.createElement("p");p.textContent=value;section.appendChild(p);}
      content.appendChild(section);
    });
    data.links.forEach(([label,url])=>{
      const a=document.createElement("a");a.textContent=label+" ↗";a.href=url;
      if(url.startsWith("https://")){a.target="_blank";a.rel="noopener noreferrer";}links.appendChild(a);
    });
    if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
    document.body.classList.add("modal-open");scene?.setPaused(true);
    dialog.querySelector(".dialog-close").focus();
  }
  function afterClose(){document.body.classList.remove("modal-open");scene?.setPaused(scenePaused());previousFocus?.focus?.();}
  function closeStudy(){
    if(!dialog)return;
    if(typeof dialog.close==="function")dialog.close();else{dialog.removeAttribute("open");afterClose();}
  }
  document.querySelectorAll("[data-study]").forEach(button=>button.addEventListener("click",()=>renderStudy(button.dataset.study)));
  if(dialog){
    dialog.querySelector(".dialog-close").addEventListener("click",closeStudy);
    dialog.addEventListener("close",afterClose);
    dialog.addEventListener("click",event=>{
      const r=dialog.getBoundingClientRect();
      if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))closeStudy();
    });
    dialog.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&typeof dialog.close!=="function"){event.preventDefault();closeStudy();}
      if(event.key==="Tab"){
        const items=dialog.querySelectorAll("button:not([disabled]),a[href],[tabindex='0']");
        if(!items.length)return;
        const first=items[0],last=items[items.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    });
  }

  function updateScroll(){
    frame=0;
    const vh=Math.max(1,window.innerHeight),y=window.scrollY||0;
    const max=Math.max(1,document.documentElement.scrollHeight-vh);
    document.querySelector(".page-progress>span")?.style.setProperty("transform","scaleX("+clamp(y/max)+")");
    document.querySelector(".site-header")?.classList.toggle("scrolled",y>25);
    if(hero){
      const rect=hero.getBoundingClientRect();
      sceneInput.progress=heroProgress(rect.top,rect.height,vh,window.innerWidth<=850?74:82);
      hero.style.setProperty("--hero-progress",motionEnabled?String(sceneInput.progress):"0");
      scene?.setInput(sceneInput);
      ensureScene();
    }
    if(motionEnabled){
      const updates=parallaxElements.map(el=>{
        const rect=el.getBoundingClientRect();
        return {el,rect};
      });
      updates.forEach(({el,rect})=>{if(rect.bottom>-160&&rect.top<vh+160)el.style.setProperty("--parallax-y",parallaxOffset(rect.top+rect.height/2,vh,Number(el.dataset.depth)).toFixed(2)+"px");});
      marquees.forEach(el=>{
        const rect=el.parentElement.getBoundingClientRect();
        if(rect.bottom>0&&rect.top<vh)el.style.setProperty("--word-shift",(-clamp((vh-rect.top)/(vh+rect.height))*160).toFixed(2)+"px");
      });
    }
    let active=chapters[0]?.dataset.chapter;
    chapters.forEach(chapter=>{if(chapter.getBoundingClientRect().top<vh*.55)active=chapter.dataset.chapter;});
    railLinks.forEach(link=>{if(link.dataset.rail===active)link.setAttribute("aria-current","true");else link.removeAttribute("aria-current");});
  }
  function requestUpdate(){if(!frame)frame=requestAnimationFrame(updateScroll);}
  window.addEventListener("scroll",requestUpdate,{passive:true});
  window.addEventListener("resize",()=>{if(window.innerWidth>850)closeNav();requestUpdate();},{passive:true});

  if(heroArt){
    heroArt.addEventListener("pointermove",event=>{
      if(!motionEnabled||event.pointerType==="touch")return;
      const r=heroArt.getBoundingClientRect();
      sceneInput.x=clamp((event.clientX-r.left)/Math.max(1,r.width)*2-1,-1,1);
      sceneInput.y=clamp(1-(event.clientY-r.top)/Math.max(1,r.height)*2,-1,1);
      scene?.setInput(sceneInput);
    },{passive:true});
    heroArt.addEventListener("pointerleave",()=>{sceneInput.x=0;sceneInput.y=0;scene?.setInput(sceneInput);});
  }
  const finePointer=window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
  if(finePointer){
    document.querySelectorAll("[data-tilt]").forEach(el=>{
      el.addEventListener("pointermove",event=>{
        if(!motionEnabled)return;
        const r=el.getBoundingClientRect(),x=(event.clientX-r.left)/Math.max(1,r.width)-.5,y=(event.clientY-r.top)/Math.max(1,r.height)-.5;
        el.style.setProperty("--rx",(-y*5).toFixed(2)+"deg");el.style.setProperty("--ry",(x*6).toFixed(2)+"deg");
      },{passive:true});
      el.addEventListener("pointerleave",()=>{el.style.setProperty("--rx","0deg");el.style.setProperty("--ry","0deg");});
    });
    document.querySelectorAll(".magnetic").forEach(el=>{
      el.addEventListener("pointermove",event=>{
        if(!motionEnabled)return;
        const r=el.getBoundingClientRect();
        el.style.setProperty("--mx",clamp((event.clientX-r.left-r.width/2)*.07,-5,5).toFixed(2)+"px");
        el.style.setProperty("--my",clamp((event.clientY-r.top-r.height/2)*.09,-4,4).toFixed(2)+"px");
      },{passive:true});
      el.addEventListener("pointerleave",()=>{el.style.setProperty("--mx","0px");el.style.setProperty("--my","0px");});
    });
  }

  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}});
    },{threshold:.06});
    document.querySelectorAll(".reveal").forEach(el=>{el.classList.add("will-reveal");observer.observe(el);});
  }
  const copy=document.querySelector(".copy-email");
  if(copy&&navigator.clipboard&&window.isSecureContext){
    copy.hidden=false;copy.addEventListener("click",async()=>{
      try{
        await navigator.clipboard.writeText("zamyilton@ileotaku.com");copy.textContent="Email copied ✓";
        document.getElementById("copy-status").textContent="Email address copied to clipboard.";
        window.setTimeout(()=>{copy.textContent="Copy email ⧉";},2400);
      }catch(_){document.getElementById("copy-status").textContent="Use the email link to get in touch.";}
    });
  }
  document.getElementById("year").textContent=String(new Date().getFullYear());
  window.addEventListener("pagehide",event=>{if(event.persisted)scene?.setPaused(true);else scene?.dispose();});
  window.addEventListener("pageshow",()=>scene?.setPaused(scenePaused()));
  applyMotion();
  const allowScene=()=>{sceneAllowed=true;ensureScene();};
  if("requestIdleCallback" in window)window.requestIdleCallback(allowScene,{timeout:1500});else window.setTimeout(allowScene,500);
})();
