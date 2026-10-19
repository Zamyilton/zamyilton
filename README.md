# Zamyilton Portfolio

A static portfolio for Isaac Gold, styled in black, purple and gold. Includes four project stories, keyboard-accessible project tabs, project detail dialogs, a mobile menu, reduced-motion support, contact links, local fonts and the CV.

## Host on Vercel

1. Unzip this folder and put its contents in a GitHub repository.
2. In Vercel, choose Add New Project and import that repository.
3. Select the Other framework preset. Leave the build command empty and set the output directory to dist. The included vercel.json already supplies these settings.
4. Deploy. To use zamyilton.vercel.app, use zamyilton as the project name if it is available in your account. Vercel controls hostname availability.
5. If Vercel assigns another address, update the canonical URL, og:url, dist/robots.txt and dist/sitemap.xml to match it.
6. After the portfolio is live, remove the “in development” label beside its URL in the CV and replace dist/assets/Isaac_Gold_CV.pdf with that updated PDF.

No environment variables, API keys, database or dependency installation are required.

## Edit the content

- dist/index.html: page content and project summaries.
- dist/app.js: extended project stories and interactive behavior.
- dist/styles.css: responsive layout, typography and colors.
- dist/assets/Isaac_Gold_CV.pdf: downloadable CV.
- dist/assets/fonts-OFL.txt: license for the locally bundled Rubik fonts.

To open a local preview when Python is available, run:
    python3 -m http.server 8080 --directory dist

Then visit http://localhost:8080.

## Content and behavior

Zuwachs and IleOtaku link to their public domains. Eternal Nexus Echoes and VALEN use contact links for walkthrough requests; no unverified public demo or APK URL is invented. The contact action opens email, and copy-email uses the browser clipboard on secure origins. There is no form claiming to send messages without a backend.

Project artwork is a set of CSS and SVG visual identifiers, not product screenshots. Descriptions mark developing products and prototypes accordingly.

## Verification

JavaScript syntax and static document, link, asset and content checks were run. An interactive browser preview was unavailable in the build environment; review desktop and mobile layouts after deployment, including the project tabs, dialogs, menu and CV link.

