/**
 * Студийное окружение: панорама рисуется на canvas и превращается в карту
 * отражений. Металл без окружения выглядит пластиком, поэтому мягкие
 * софтбоксы и тёмный горизонт здесь важнее любых источников света.
 */
import * as THREE from 'three';

const canvasOf = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const softBox = (ctx, x, y, width, height, color, blur, alpha = 1) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = `blur(${blur}px)`;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
};

/** Панорама 2:1: тёмный низ, холодный верх, три источника разного тепла. */
export function studioPanorama() {
  const width = 2048;
  const height = 1024;
  const canvas = canvasOf(width, height);
  const ctx = canvas.getContext('2d');

  /* Металл отражает окружение целиком, поэтому «тёмный фон» и «тёмный свет» —
     разные вещи: фон остаётся чёрным, а панорама должна быть светлой,
     иначе родий и сталь превращаются в чёрные пятна. */
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#dee3ec');
  background.addColorStop(0.28, '#b0b8c6');
  background.addColorStop(0.5, '#868e9c');
  background.addColorStop(0.62, '#5a616e');
  background.addColorStop(1, '#33383f');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  /* Верхний широкий софтбокс — основной рисунок на металле. */
  softBox(ctx, width * 0.12, height * 0.02, width * 0.76, height * 0.2, '#ffffff', 60, 1);
  /* Боковые полосы: дают длинные блики на корпусе и мостах. */
  softBox(ctx, width * 0.03, height * 0.1, width * 0.06, height * 0.55, '#f2f6ff', 40, 0.95);
  softBox(ctx, width * 0.86, height * 0.08, width * 0.05, height * 0.5, '#ffffff', 38, 0.9);
  /* Тёплый контровой свет. */
  softBox(ctx, width * 0.42, height * 0.12, width * 0.14, height * 0.34, '#ffdcae', 46, 0.8);
  /* Узкие яркие полоски: точка на безеле, камнях и спирали. */
  softBox(ctx, width * 0.24, height * 0.2, width * 0.02, height * 0.28, '#ffffff', 12, 1);
  softBox(ctx, width * 0.62, height * 0.16, width * 0.015, height * 0.3, '#ffffff', 10, 1);
  /* Отражение от стола: мягкий подсвет снизу. */
  softBox(ctx, width * 0.15, height * 0.6, width * 0.7, height * 0.16, '#4a5164', 70, 0.6);

  return canvas;
}

/**
 * Собирает окружение для сцены. PMREM размывает панораму по уровням
 * шероховатости, поэтому один источник работает и как чёткое отражение,
 * и как мягкая подсветка.
 */
export function createEnvironment(renderer) {
  const source = new THREE.CanvasTexture(studioPanorama());
  source.mapping = THREE.EquirectangularReflectionMapping;
  source.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const target = pmrem.fromEquirectangular(source);
  source.dispose();
  pmrem.dispose();

  return target.texture;
}

/** Свет: окружение даёт отражения, лампы — объём и тень под деталями. */
export function createLights(scene) {
  const key = new THREE.DirectionalLight(0xfff2dd, 2.1);
  key.position.set(3.4, 5.2, 4.2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9fb6ff, 0.7);
  fill.position.set(-4.2, 1.4, 2.6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffc98a, 1.1);
  rim.position.set(-2.4, -1.8, -3.6);
  scene.add(rim);

  const ambient = new THREE.AmbientLight(0x2a2f3c, 1.2);
  scene.add(ambient);

  return { key, fill, rim, ambient };
}
