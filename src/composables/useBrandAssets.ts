import { ref } from 'vue';

const wordmark = ref<string | null>(null);
let started = false;

export function useBrandAssets() {
  async function prepare(): Promise<void> {
    if (started) return; started = true;
    try {
      const src = (await import('@/assets/zeenster-sheet.png')).default as string;
      const img = await loadImage(src);
      // Crop regions tuned for the middle wordmark and the press icon
      const wordmarkCrop = { x: 420, y: 470, w: 460, h: 140 }; // middle logo (approx)
      const pressCrop = { x: 445, y: 115, w: 170, h: 170 }; // press icon (approx)

      const wordmarkUrl = chromaKeyCrop(img, wordmarkCrop);
      const pressUrl = chromaKeyCrop(img, pressCrop);
      wordmark.value = wordmarkUrl;
      setFavicon(pressUrl);
    } catch (e) {
      console.warn('Brand asset preparation failed', e);
    }
  }

  return { wordmark, prepare };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function chromaKeyCrop(img: HTMLImageElement, crop: { x: number; y: number; w: number; h: number }): string {
  const canvas = document.createElement('canvas');
  canvas.width = crop.w; canvas.height = crop.h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

  // Sample background from top-left pixel and key it out
  const imgData = ctx.getImageData(0, 0, crop.w, crop.h);
  const data = imgData.data;
  const br = data[0], bg = data[1], bb = data[2];
  const T = 38; // tolerance
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (Math.abs(r - br) < T && Math.abs(g - bg) < T && Math.abs(b - bb) < T) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

function setFavicon(dataUrl: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/png';
  link.href = dataUrl;
}


