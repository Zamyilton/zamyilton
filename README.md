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
