"use strict";
(function () {
  document.documentElement.classList.add("has-js");
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

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.hidden = false;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus();
      }
    });
  }

  var tabs = Array.from(document.querySelectorAll("[data-project]"));
  var projectIcons = {
    ileotaku: '<path d="M100 42C74 24 44 25 26 33v106c26-8 49-5 74 11 25-16 48-19 74-11V33c-18-8-48-9-74 9Z"/><path d="M100 42v108M45 53c12-2 24 1 36 7m-36 19c12-2 24 1 36 7m38-26c12-6 24-9 36-7m-36 33c12-6 24-9 36-7"/>',
    nexus: '<path d="m100 22 64 68-64 68-64-68Z"/><path d="m100 22 22 68-22 68-22-68Zm-64 68h128"/>',
    valen: '<circle cx="100" cy="90" r="62"/><path d="M55 77v26m15-42v58m15-66v74m15-95v116m15-95v74m15-66v58m15-42v26"/>',
    zuwachs: '<circle cx="100" cy="90" r="66"/><path d="m151 42-8 35-34 20-4 43-16 9-4-39-30 11-12-12 36-20-8-32 13-7 20 27 30-27Z"/>'
  };
  var stage = document.querySelector(".preview-stage");
  var panel = document.getElementById("preview-panel");
  function chooseProject(id, focus) {
    var data = projectData[id];
    if (!data || !stage) return;
    stage.dataset.active = id;
    stage.querySelector(".project-mark svg").innerHTML = projectIcons[id];
    stage.querySelector(".preview-type").textContent = data.type;
    var title = stage.querySelector(".preview-title");
    title.textContent = data.title;
    var dot = document.createElement("span"); dot.textContent = "."; title.appendChild(dot);
    stage.querySelector(".preview-desc").textContent = data.preview;
    stage.querySelector(".preview-open").dataset.study = id;
    tabs.forEach(function (tab) {
      var active = tab.dataset.project === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    if (panel) {
      panel.setAttribute("aria-labelledby", "tab-" + id);
      panel.textContent = data.title + ": " + data.preview;
    }
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { chooseProject(tab.dataset.project, false); });
    tab.addEventListener("keydown", function (event) {
      var target = index;
      if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") target = (index + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = tabs.length - 1;
      else return;
      event.preventDefault(); chooseProject(tabs[target].dataset.project, true);
    });
  });

  var dialog = document.querySelector(".study-dialog");
  var previousFocus = null;
  function renderStudy(id) {
    var data = projectData[id];
    if (!data || !dialog) return;
    previousFocus = document.activeElement;
    document.getElementById("study-title").textContent = data.title;
    document.getElementById("study-kind").textContent = data.kind;
    document.getElementById("study-summary").textContent = data.summary;
    var content = document.getElementById("study-content");
    var links = document.getElementById("study-links");
    content.replaceChildren(); links.replaceChildren();
    data.blocks.forEach(function (block) {
      var section = document.createElement("section"); section.className = "study-block";
      var heading = document.createElement("h3"); heading.textContent = block[0]; section.appendChild(heading);
      if (Array.isArray(block[1])) {
        var ul = document.createElement("ul");
        block[1].forEach(function (line) { var li = document.createElement("li"); li.textContent = line; ul.appendChild(li); });
        section.appendChild(ul);
      } else {
        var p = document.createElement("p"); p.textContent = block[1]; section.appendChild(p);
      }
      content.appendChild(section);
    });
    data.links.forEach(function (link) {
      var a = document.createElement("a"); a.textContent = link[0] + " ↗"; a.href = link[1];
      if (link[1].indexOf("https://") === 0) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      links.appendChild(a);
    });
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.body.classList.add("modal-open");
    dialog.querySelector(".dialog-close").focus();
  }
  document.querySelectorAll("[data-study]").forEach(function (button) {
    button.addEventListener("click", function () { renderStudy(button.dataset.study); });
  });
  function afterClose() {
    document.body.classList.remove("modal-open");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }
  function closeStudy() {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close(); else { dialog.removeAttribute("open"); afterClose(); }
  }
  if (dialog) {
    dialog.querySelector(".dialog-close").addEventListener("click", closeStudy);
    dialog.addEventListener("close", afterClose);
    dialog.addEventListener("click", function (event) {
      var r = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) closeStudy();
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && typeof dialog.close !== "function") closeStudy();
    });
  }

  var copy = document.querySelector(".copy-email");
  if (copy && navigator.clipboard && window.isSecureContext) {
    copy.hidden = false;
    copy.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText("zamyilton@ileotaku.com");
        copy.textContent = "Email copied ✓";
        document.getElementById("copy-status").textContent = "Email address copied to clipboard.";
        window.setTimeout(function () { copy.textContent = "Copy email ⧉"; }, 2400);
      } catch (_) { document.getElementById("copy-status").textContent = "Copy unavailable. Use the email link above."; }
    });
  }
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("will-reveal"); observer.observe(el); });
  }
}());

