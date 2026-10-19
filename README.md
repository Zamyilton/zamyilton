# Zamyilton Portfolio

Isaac Gold's portfolio, deployed at https://zamyilton.vercel.app/.

## Source

- dist/index.html: semantic page, project chapters, links and dialog shell.
- dist/styles.css: responsive foundation and layered interface studies.
- dist/experience.css: dragon identity, project atlas, sculpture controls and visual case studies.
- dist/app.js: navigation, project stories, scroll motion, finish selection, copy email and motion controls.
- dist/motion.mjs: bounded motion inputs and device rendering budgets.
- dist/identity.mjs: shared dragon curves for the vector icon and 3D sculpture.
- dist/scene.mjs: extruded Three.js dragon, gold/amethyst materials, lighting, orbit details and lifecycle.
- dist/vendor/: pinned Three.js 0.180.0 modules and MIT license.
- dist/assets/: locally hosted Rubik fonts, license, scalable dragon icons, social preview and downloadable CV.
- scripts/export-identity.mjs: regenerate the SVG identity assets from their shared source.
- design/: original generated concept and identity notes.

The project artwork is clearly labeled as interface or visual studies. It does not claim to be product screenshots. Project descriptions distinguish beta products, development work and prototypes.

## Run checks

Use Node.js 22 or later:

    npm ci
    npm run check
    npm test

Tests cover links, assets, CSS parsing, scene geometry and the eye cutout, synchronized vector assets, mobile rendering budgets, reduced-motion preference, navigation, visual project stories, return focus, finish controls and email copy. A real browser/GPU still needs to verify the visual rendering.

## Identity assets

The final icon is a dragon whose wing, diagonal body and tail form a Z. It contains no typography. The navigation, favicon, page details, social preview and 3D hero share the same shape. The standalone transparent SVG is `dist/assets/zamyilton-dragon.svg`; a dark variant is also included. The original generated image is a design reference rather than a runtime dependency.

Run `node scripts/export-identity.mjs` after changing the shared curves. The social preview SVG uses Rubik; export it to the committed 1200 × 630 PNG with a vector renderer that has the bundled Rubik fonts available.

## Deployment

Vercel uses the repository root and serves the committed dist directory. No framework build or runtime backend is required; vercel.json selects the Other/static setup. Keep vercel.json and dist at the repository root.

Three.js is hosted locally; no CDN or API keys are needed. Its module loads after the core page is ready. The scene uses capped resolution and a reduced frame budget on smaller devices, pauses outside the hero and when the tab is hidden, and retains static artwork when 3D is unavailable. Reduced-motion preferences and the visitor's motion toggle are respected.

After any domain change, update the canonical URL, Open Graph URL, robots.txt and sitemap.xml. Keep the downloadable CV current.
