// The viewer inside the Hands console: an iframe of the console page, the only page the website lets frame
// it (Content-Security-Policy frame-ancestors). There the console's header holds every control and this
// page is only the desktop; a guest opens the viewer as a page of its own and keeps its controls.
export const embedded = (() => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
})()
if (embedded) document.documentElement.dataset.embed = ''

// The desktop size that fills a viewer area: the area's aspect ratio (kept between 1:2 and 12:5), at most
// as many pixels as 1280x800 so encoding never costs more than before, both sides multiples of 8 (Xorg).
export const SCREEN_BUDGET = 1280 * 800
export function fitScreen(width: number, height: number): { width: number; height: number } | null {
  if (!(width > 0 && height > 0)) return null
  const aspect = Math.min(2.4, Math.max(0.5, width / height))
  const w = Math.floor(Math.sqrt(SCREEN_BUDGET * aspect) / 8) * 8
  let h = Math.floor(w / aspect / 8) * 8
  while (w * h > SCREEN_BUDGET) h -= 8
  return { width: w, height: h }
}
