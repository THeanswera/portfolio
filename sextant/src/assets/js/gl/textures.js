/**
 * Процедурные текстуры механизма: рисуются на canvas в браузере, ничего
 * не скачивается. Из карт высот считаются нормали — именно они дают
 * женевским полосам, зернению и коже рельеф, который ловит свет.
 */
import * as THREE from 'three';

const cache = new Map();

const canvasOf = (width, height = width) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

/** Детерминированный шум: одинаковые текстуры при каждой загрузке. */
const makeRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

/**
 * Карта высот → карта нормалей. Собел по яркости: так на плоскости
 * появляется рельеф, который видно на бликах металла.
 */
export function heightToNormal(source, strength = 2.2) {
  const size = source.width;
  const ctx = source.getContext('2d');
  const { data } = ctx.getImageData(0, 0, size, size);
  const height = new Float32Array(size * size);

  for (let index = 0; index < size * size; index += 1) {
    height[index] = data[index * 4] / 255;
  }

  const target = canvasOf(size);
  const targetCtx = target.getContext('2d');
  const image = targetCtx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const left = height[y * size + ((x - 1 + size) % size)];
      const right = height[y * size + ((x + 1) % size)];
      const up = height[((y - 1 + size) % size) * size + x];
      const down = height[((y + 1) % size) * size + x];

      let nx = (left - right) * strength;
      let ny = (up - down) * strength;
      const nz = 1;
      const length = Math.hypot(nx, ny, nz);
      nx /= length;
      ny /= length;

      const offset = (y * size + x) * 4;
      image.data[offset] = (nx * 0.5 + 0.5) * 255;
      image.data[offset + 1] = (ny * 0.5 + 0.5) * 255;
      image.data[offset + 2] = (nz / length) * 255;
      image.data[offset + 3] = 255;
    }
  }

  targetCtx.putImageData(image, 0, 0);
  return target;
}

const asTexture = (canvas, repeat = 1) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  return texture;
};

/** Женевские полосы: параллельные волны на мостах и роторе. */
export function cotesDeGeneveHeight(size = 1024, stripes = 34) {
  return cached(`cotes-${size}-${stripes}`, () => {
    const canvas = canvasOf(size);
    const ctx = canvas.getContext('2d');
    const step = size / stripes;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let index = 0; index < stripes; index += 1) {
      const y = index * step;
      const gradient = ctx.createLinearGradient(0, y, 0, y + step);
      gradient.addColorStop(0, '#3a3a3a');
      gradient.addColorStop(0.32, '#e8e8e8');
      gradient.addColorStop(0.5, '#bcbcbc');
      gradient.addColorStop(1, '#4a4a4a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y, size, step);
    }

    /* Мелкая шероховатость, чтобы полосы не выглядели печатными. */
    const random = makeRandom(7);
    ctx.globalAlpha = 0.05;
    for (let index = 0; index < 4000; index += 1) {
      ctx.fillStyle = random() > 0.5 ? '#ffffff' : '#000000';
      ctx.fillRect(random() * size, random() * size, 2, 1);
    }
    ctx.globalAlpha = 1;

    return canvas;
  });
}

/** Зернение (perlage): перекрывающиеся круги на плате. */
export function perlageHeight(size = 1024) {
  return cached(`perlage-${size}`, () => {
    const canvas = canvasOf(size);
    const ctx = canvas.getContext('2d');
    const step = size / 26;
    const radius = step * 0.78;
    const random = makeRandom(11);

    ctx.fillStyle = '#6e6e6e';
    ctx.fillRect(0, 0, size, size);

    for (let row = -1; row * step < size + step; row += 1) {
      for (let column = -1; column * step < size + step; column += 1) {
        const x = column * step + (row % 2 ? step / 2 : 0);
        const y = row * step;
        const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
        const tone = 150 + random() * 40;
        gradient.addColorStop(0, `rgb(${tone},${tone},${tone})`);
        gradient.addColorStop(0.7, `rgb(${tone * 0.55},${tone * 0.55},${tone * 0.55})`);
        gradient.addColorStop(1, 'rgb(70,70,70)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return canvas;
  });
}

/** Круговое шлифование платы: тонкие концентрические риски. */
export function circularBrushHeight(size = 1024) {
  return cached(`circular-${size}`, () => {
    const canvas = canvasOf(size);
    const ctx = canvas.getContext('2d');
    const random = makeRandom(23);
    const center = size / 2;

    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(0, 0, size, size);

    for (let radius = 2; radius < size * 0.75; radius += 1.4) {
      const tone = 110 + random() * 90;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${tone},${tone},${tone},0.55)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    return canvas;
  });
}

/** Циферблат «солнечные лучи»: радиальные риски из центра. */
export function sunburstHeight(size = 1024) {
  return cached(`sunburst-${size}`, () => {
    const canvas = canvasOf(size);
    const ctx = canvas.getContext('2d');
    const random = makeRandom(31);
    const center = size / 2;

    ctx.fillStyle = '#787878';
    ctx.fillRect(0, 0, size, size);
    ctx.translate(center, center);

    for (let ray = 0; ray < 720; ray += 1) {
      const angle = (ray / 720) * Math.PI * 2;
      const tone = 90 + random() * 120;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
      ctx.strokeStyle = `rgba(${tone},${tone},${tone},0.5)`;
      ctx.lineWidth = size / 720 + 0.6;
      ctx.stroke();
    }

    return canvas;
  });
}

/** Кожа ремешка: мелкие поры и неровности. */
export function leatherHeight(size = 512) {
  return cached(`leather-${size}`, () => {
    const canvas = canvasOf(size);
    const ctx = canvas.getContext('2d');
    const random = makeRandom(53);

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let index = 0; index < 5200; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = 1 + random() * 3.4;
      const tone = random() > 0.5 ? 150 : 60;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tone},${tone},${tone},0.5)`;
      ctx.fill();
    }

    /* Крупные заломы: кожа без них выглядит пластиком. */
    ctx.lineWidth = 1.6;
    for (let index = 0; index < 40; index += 1) {
      ctx.beginPath();
      let x = random() * size;
      let y = random() * size;
      ctx.moveTo(x, y);
      for (let step = 0; step < 8; step += 1) {
        x += (random() - 0.5) * 60;
        y += (random() - 0.5) * 60;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(40,40,40,0.35)';
      ctx.stroke();
    }

    return canvas;
  });
}

/** Готовая пара «карта высот → нормали → текстура three». */
export function normalMap(kind, { size = 1024, strength = 2.2, repeat = 1 } = {}) {
  return cached(`${kind}-${size}-${strength}-${repeat}`, () => {
    const height =
      kind === 'cotes'
        ? cotesDeGeneveHeight(size)
        : kind === 'perlage'
          ? perlageHeight(size)
          : kind === 'sunburst'
            ? sunburstHeight(size)
            : kind === 'leather'
              ? leatherHeight(size)
              : circularBrushHeight(size);

    return asTexture(heightToNormal(height, strength), repeat);
  });
}

/** Шероховатость по той же карте высот: свет ложится по рельефу. */
export function roughnessMap(kind, { size = 512, repeat = 1, from = 0.6, to = 1.0 } = {}) {
  return cached(`rough-${kind}-${size}-${repeat}-${from}-${to}`, () => {
    const height =
      kind === 'cotes'
        ? cotesDeGeneveHeight(size)
        : kind === 'perlage'
          ? perlageHeight(size)
          : kind === 'sunburst'
            ? sunburstHeight(size)
            : kind === 'leather'
              ? leatherHeight(size)
              : circularBrushHeight(size);

    const canvas = canvasOf(size);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(height, 0, 0, size, size);
    const image = ctx.getImageData(0, 0, size, size);

    for (let index = 0; index < image.data.length; index += 4) {
      const value = image.data[index] / 255;
      const mapped = from + value * (to - from);
      const byte = Math.round(mapped * 255);
      image.data[index] = byte;
      image.data[index + 1] = byte;
      image.data[index + 2] = byte;
    }

    ctx.putImageData(image, 0, 0);
    return asTexture(canvas, repeat);
  });
}

export const disposeTextureCache = () => {
  cache.forEach((value) => {
    if (value?.isTexture) value.dispose();
  });
  cache.clear();
};
