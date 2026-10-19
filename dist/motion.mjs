export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
export function heroProgress(top, height, viewport, header = 82) {
  return clamp((header - top) / Math.max(1, height - viewport + header));
}
export function parallaxOffset(center, viewport, depth) {
  return clamp((viewport * 0.5 - center) / Math.max(viewport, 1), -1, 1) * depth;
}
export function deviceProfile(width, ratio = 1, cores = 8) {
  const light = width < 768 || cores <= 4;
  return { light, pixelRatio: Math.min(Math.max(ratio, 1), light ? 1.25 : 1.8), particles: light ? 60 : 130, fps: light ? 30 : 60 };
}

