/**
 * Automatická detekce obličeje / hlavy postavy na portrétu a výřez čtvercového medailonku (200x200 px).
 * Kombinuje:
 * 1) Nativní prohlížečové FaceDetector API (pokud je dostupné)
 * 2) Analýzu kontrastu a pleťových/světlých tónů v horní třetině ilustrace (pro D&D kresby, elfy, atd.)
 */

export interface FaceCropBox {
  /** Relativní X středu obličeje (0 až 1) */
  centerX: number;
  /** Relativní Y středu obličeje (0 až 1) */
  centerY: number;
  /** Velikost čtvercového výřezu vůči kratší straně obrázku (např. 0.30 = přiblížení na hlavu) */
  zoomSize: number;
}

export async function detectFaceCropBox(img: HTMLImageElement): Promise<FaceCropBox> {
  const minSide = Math.min(img.width, img.height);

  // 1. Pokus o nativní FaceDetector API v prohlížeči (Chrome / Edge)
  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      // @ts-ignore
      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(img);
      if (faces && faces.length > 0) {
        const box = faces[0].boundingBox;
        const cx = (box.x + box.width / 2) / img.width;
        const cy = (box.y + box.height / 2) / img.height;
        // Přidáme kolem samotného obličeje prostor pro vlasy / přilbu / uši (cca 2.2x šířka obličeje)
        const faceSizePx = Math.max(box.width, box.height) * 2.2;
        const zoomSize = Math.min(0.6, Math.max(0.2, faceSizePx / minSide));
        return { centerX: cx, centerY: cy, zoomSize };
      }
    } catch {
      // Pokud FaceDetector selže nebo není povolen, pokračujeme na analýzu obrazu níže
    }
  }

  // 2. Chytrá analýza horní části ilustrace (hledání hlavy/obličeje v horních 5–38 % výšky)
  try {
    const sampleW = 120;
    const sampleH = 160;
    const canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(img, 0, 0, sampleW, sampleH);
      const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

      let bestWeight = 0;
      let weightedX = 0;
      let weightedY = 0;

      // Prohledáváme oblast, kde se na fantasy portrétech nachází hlava postavy:
      // Y: 6 % až 32 % výšky, X: 18 % až 82 % šířky
      const minY = Math.floor(sampleH * 0.06);
      const maxY = Math.floor(sampleH * 0.32);
      const minX = Math.floor(sampleW * 0.18);
      const maxX = Math.floor(sampleW * 0.82);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const i = (y * sampleW + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Lokální kontrast (hrany očí, vlasů, obličeje) vůči sousednímu pixelu
          const iRight = (y * sampleW + Math.min(sampleW - 1, x + 1)) * 4;
          const diff =
            Math.abs(r - data[iRight]) +
            Math.abs(g - data[iRight + 1]) +
            Math.abs(b - data[iRight + 2]);

          // Bonus pro teplé/pleťové odstíny (R > G > B a střední až vyšší jas)
          const isWarmTone = r > g && g >= b * 0.85 && r > 90 && r < 245;
          const skinBoost = isWarmTone ? 2.6 : 1.0;

          // Mírné upřednostnění středu a horních 15 %
          const centerBias = 1 - Math.abs(x / sampleW - 0.45) * 0.7;

          const score = diff * skinBoost * centerBias;
          if (score > 25) {
            bestWeight += score;
            weightedX += x * score;
            weightedY += y * score;
          }
        }
      }

      if (bestWeight > 0) {
        const cx = Math.min(0.75, Math.max(0.25, weightedX / bestWeight / sampleW));
        const cy = Math.min(0.32, Math.max(0.11, weightedY / bestWeight / sampleH));
        return {
          centerX: cx,
          centerY: cy,
          zoomSize: 0.3, // Výřez cca 30 % šířky obrázku = krásný detail hlavy a ramen
        };
      }
    }
  } catch {
    // Fallback níže
  }

  // 3. Bezpečný výchozí výřez hlavy v horní části
  return {
    centerX: 0.46,
    centerY: 0.16,
    zoomSize: 0.3,
  };
}

/**
 * Vygeneruje čtvercový portrét obličeje (200x200 px WebP/JPEG) podle zadaného FaceCropBoxu.
 */
export function renderFaceCropDataUrl(img: HTMLImageElement, crop: FaceCropBox): string {
  const outSize = 200;
  const canvas = document.createElement('canvas');
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const minSide = Math.min(img.width, img.height);
  const boxSize = Math.max(40, Math.min(minSide, minSide * crop.zoomSize));

  let sx = crop.centerX * img.width - boxSize / 2;
  let sy = crop.centerY * img.height - boxSize / 2;

  // Udržíme výřez uvnitř hranic obrázku
  sx = Math.max(0, Math.min(img.width - boxSize, sx));
  sy = Math.max(0, Math.min(img.height - boxSize, sy));

  ctx.drawImage(img, sx, sy, boxSize, boxSize, 0, 0, outSize, outSize);

  let dataUrl = canvas.toDataURL('image/webp', 0.85);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  }
  return dataUrl;
}
