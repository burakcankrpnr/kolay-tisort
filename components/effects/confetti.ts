/**
 * Çok hafif canvas konfeti. Modül yalnızca kutlama anında dinamik import edilir.
 * Hareketi azalt tercihinde hiçbir şey çizmez.
 */
export function burst({ x = 0.5, y = 0.35, count = 120 }: { x?: number; y?: number; count?: number } = {}) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "80" });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);
  const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  const colors = [`hsl(${primary})`, "#111111", "#F4C542", "#3B82F6", "#E8E6E1"];
  const parts = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 7;
    return {
      x: innerWidth * x,
      y: innerHeight * y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      w: 5 + Math.random() * 5,
      h: 8 + Math.random() * 6,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)] ?? "#111111",
    };
  });
  const start = performance.now();
  const frame = (now: number) => {
    const t = (now - start) / 1800;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.22;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < 1) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
