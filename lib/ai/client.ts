export async function generateLocalArt(prompt: string, variant = 0) {
  const text = prompt.replace(/[<>&]/g, "").slice(0, 72);
  const palettes = [
    { bg: "#161616", stroke: "#FF3B00", fill: "#F3F3F0" },
    { bg: "#F3F3F0", stroke: "#121212", fill: "#FF3B00" },
    { bg: "#1B2A4A", stroke: "#F3F3F0", fill: "#FF3B00" },
  ];
  const palette = palettes[Math.abs(variant) % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
    <rect width="800" height="800" fill="${palette.bg}"/>
    <rect x="70" y="70" width="660" height="660" fill="none" stroke="${palette.stroke}" stroke-width="18"/>
    <text x="400" y="430" text-anchor="middle" fill="${palette.fill}" font-size="40" font-family="Arial">${text}</text>
  </svg>`;
  const file = new File([svg], "yerel.svg", { type: "image/svg+xml" });
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/api/uploads", { method: "POST", body });
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!payload.url) throw new Error(payload.error ?? "Yerel üretim kaydedilemedi.");
  return { url: payload.url, note: "Yerel üretim. Uzak model anahtarı tanımlı değil." };
}

export async function knockOutToFile(src: string) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Görsel okunamadı."));
    img.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return src;
  context.drawImage(image, 0, 0);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < frame.data.length; i += 4) {
    if (frame.data[i] > 236 && frame.data[i + 1] > 236 && frame.data[i + 2] > 236) frame.data[i + 3] = 0;
  }
  context.putImageData(frame, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return src;
  const body = new FormData();
  body.set("file", new File([blob], "temiz.png", { type: "image/png" }));
  const response = await fetch("/api/uploads", { method: "POST", body });
  const payload = (await response.json()) as { url?: string };
  return payload.url ?? src;
}
