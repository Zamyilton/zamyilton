// The dragon's wing, neck and tail form one continuous Z silhouette.
// These same curves drive the SVG identity and the extruded Three.js sculpture.
export const dragonOutline = [
  ["M",18,53],["C",67,45,100,52,128,65],["L",173,81],["L",185,77],
  ["L",167,54],["L",187,60],["C",174,49,165,35,160,19],
  ["L",195,47],["L",184,18],["L",218,51],["L",234,78],
  ["L",247,88],["L",247,80],["L",255,100],["L",249,116],
  ["L",244,103],["L",233,100],["L",242,113],["L",235,126],
  ["L",229,111],["L",216,103],["C",205,132,173,155,143,174],
  ["L",91,207],["C",84,212,87,219,102,221],["L",195,214],
  ["L",224,221],["C",225,210,221,200,211,190],
  ["L",242,212],["L",251,237],["L",234,229],["L",242,249],
  ["L",217,233],["C",189,227,153,239,114,240],["L",67,240],
  ["C",49,240,36,235,36,222],["L",15,236],
  ["C",21,220,35,207,58,191],["L",154,122],
  ["C",165,114,174,104,178,96],
  ["C",131,91,85,95,36,117],["L",59,88],["L",46,79],
  ["L",72,84],["C",59,68,37,58,18,53],["Z"]
];
export const dragonEye = [["M",220,79],["L",232,91],["L",224,88],["Z"]];
export const dragonPath = [...dragonOutline,...dragonEye].map(([command,...points])=>command+points.join(" ")).join(" ");

export function identitySVG({background=false,dark=false}={}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 270" role="img" aria-labelledby="title"><title id="title">Zamyilton dragon sigil</title>${background?'<rect width="270" height="270" rx="58" fill="#101014"/>':""}<path d="${dragonPath}" fill="${dark?"#3b2948":"#e8c88d"}" fill-rule="evenodd"/></svg>\n`;
}
