<img align="right" src="https://zamyilton.vercel.app/assets/zamyilton-dragon-gold-purple.png" alt="Zamyilton dragon icon" width="100" />

# Isaac Gold

Frontend developer in Lagos, Nigeria. I build responsive interfaces with React, Next.js, TypeScript and Firebase.

**Open to hybrid frontend opportunities in Lagos. Available immediately.**

[Portfolio](https://zamyilton.vercel.app/) · [CV](https://zamyilton.vercel.app/assets/Isaac_Gold_CV.pdf?v=20261020-email) · [One-column CV](https://zamyilton.vercel.app/assets/Isaac_Gold_Frontend_ATS_CV.pdf?v=20261020-email) · [Email](mailto:zamyilton@eternalnexus.app)

## Selected work

| Project | My work | Status and links |
| --- | --- | --- |
| **IleOtaku** | Reader, creator and admin interfaces, authentication, publishing, messaging and responsive UI. React, Next.js, TypeScript and Firebase. | Beta product. [Website](https://ileotaku.com) · [Case study](https://zamyilton.vercel.app/#ileotaku) |
| **Zuwachs Travel and Tours** | Business website presenting travel services, consultation options and an enquiry flow. | [Live website](https://zuwachstravel.com) · [Case study](https://zamyilton.vercel.app/#zuwachs) |
| **Eternal Nexus Echoes** | React/Three.js browser game client with character creation, gameplay and real-time social interfaces. | In development. [Case study](https://zamyilton.vercel.app/#nexus) |
| **VALEN** | Android task, memory and settings screens with speech interaction. Kotlin and Jetpack Compose. | Prototype. [Case study](https://zamyilton.vercel.app/#valen) |
| **Personal portfolio** | Responsive presentation, project dialogs, scroll motion and a Three.js identity scene, developed with AI assistance. Automated interaction and geometry checks. | [Website](https://zamyilton.vercel.app/) · [Public source](https://github.com/Zamyilton/zamyilton) |

## Technical focus

React, Next.js, JavaScript, TypeScript, HTML, CSS, Tailwind CSS, Zustand, Firebase Authentication, Firestore, Git and GitHub. My work also includes Three.js and Kotlin/Jetpack Compose.

## Background

BSc Computer Science, ESM Bènin University (2025), Second Class Upper, CGPA 3.99/5.00. HTML, CSS and JavaScript training at EkoBits ICT Academy, Lekki (2022). Student Union President from 100 level through final year across Heim Weldios University and ESM Bènin University.

---

<details>
<summary>Portfolio source, local checks and deployment</summary>

# Zamyilton Portfolio

Isaac Gold's portfolio, deployed at https://zamyilton.vercel.app/.

## Source

- dist/index.html: semantic page, project chapters, links and dialog shell.
- dist/styles.css: responsive foundation and layered interface studies.
- dist/experience.css: dragon identity, project atlas, sculpture controls and visual case studies.
- dist/app.js: navigation, project stories, scroll motion, finish selection, copy email and motion controls.
- dist/motion.mjs: bounded motion inputs and device rendering budgets.
- dist/identity.mjs: the selected first dragon's alpha contours and image asset reference.
- dist/scene.mjs: extruded Three.js dragon with the approved gold/purple image texture, lighting, orbit details and lifecycle.
- dist/vendor/: pinned Three.js 0.180.0 modules and MIT license.
- dist/assets/: locally hosted Rubik fonts, license, scalable dragon icons, social preview and downloadable CV.
- scripts/export-identity.mjs: regenerate the supporting SVG silhouettes and social preview source.
- scripts/trace-identity.py: read the approved PNG's alpha contour as 3D mesh data without modifying its pixels.
- design/: original generated concept and identity notes.

The project artwork is clearly labeled as interface or visual studies. It does not claim to be product screenshots. Project descriptions distinguish beta products, development work and prototypes.

## Run checks

Use Node.js 22 or later:

    npm ci
    npm run check
    npm test

Tests cover links, assets, CSS parsing, scene geometry and its negative space, texture coordinates, synchronized identity assets, mobile rendering budgets, reduced-motion preference, navigation, visual project stories, return focus, finish controls and email copy. A real browser/GPU still needs to verify the visual rendering.

## Identity assets

The final icon is the user's selected first detailed dragon, recolored gold and purple. It contains no typography. The navigation, favicon, page details, social preview and 3D hero use the exact transparent PNG at `dist/assets/zamyilton-dragon-gold-purple.png`. Supporting SVG silhouettes and the extruded mesh follow that image's alpha contour. Both hero lighting modes retain the two-color artwork.

If the approved artwork changes, run `python scripts/trace-identity.py` (Pillow and NumPy required) and `node scripts/export-identity.mjs`. The social preview SVG uses Rubik and the logo PNG; export it to the committed 1200 × 630 PNG with a vector renderer that has the bundled Rubik fonts available.

## Deployment

Vercel uses the repository root and serves the committed dist directory. No framework build or runtime backend is required; vercel.json selects the Other/static setup. Keep vercel.json and dist at the repository root.

Three.js is hosted locally; no CDN or API keys are needed. Its module loads after the core page is ready. The scene uses capped resolution and a reduced frame budget on smaller devices, pauses outside the hero and when the tab is hidden, and retains static artwork when 3D is unavailable. Reduced-motion preferences and the visitor's motion toggle are respected.

After any domain change, update the canonical URL, Open Graph URL, robots.txt and sitemap.xml. Keep the downloadable CV current.

</details>
