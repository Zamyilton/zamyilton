# Zamyilton Portfolio

Isaac Gold's portfolio, deployed at https://zamyilton.vercel.app/.

## Source

- dist/index.html: semantic page, project chapters, links and dialog shell.
- dist/styles.css: responsive art direction and layered interface studies.
- dist/app.js: navigation, project stories, scroll motion, copy email and motion controls.
- dist/motion.mjs: bounded motion inputs and device rendering budgets.
- dist/scene.mjs: procedural Three.js Z sculpture, lighting, orbit details and lifecycle.
- dist/vendor/: pinned Three.js 0.180.0 modules and MIT license.
- dist/assets/: locally hosted Rubik fonts, license, favicon and downloadable CV.

The project artwork is clearly labeled as interface or visual studies. It does not claim to be product screenshots. Project descriptions distinguish beta products, development work and prototypes.

## Run checks

Use Node.js 22 or later:

    npm ci
    npm run check
    npm test

Tests cover links, assets, CSS parsing, scene geometry, mobile rendering budgets, reduced-motion preference, navigation, project stories and email copy. A real browser/GPU still needs to verify the visual rendering.

## Deployment

Vercel uses the repository root and serves the committed dist directory. No framework build or runtime backend is required; vercel.json selects the Other/static setup. Keep vercel.json and dist at the repository root.

Three.js is hosted locally; no CDN or API keys are needed. Its module loads after the core page is ready. The scene uses capped resolution and a reduced frame budget on smaller devices, pauses outside the hero and when the tab is hidden, and retains static artwork when 3D is unavailable. Reduced-motion preferences and the visitor's motion toggle are respected.

After any domain change, update the canonical URL, Open Graph URL, robots.txt and sitemap.xml. Keep the downloadable CV current.
