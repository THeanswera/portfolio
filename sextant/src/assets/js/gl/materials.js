/**
 * Материалы: металлы корпуса, родий механизма, камни, циферблаты и кожа.
 * Все поверхности процедурные — карты нормалей считаются из карт высот,
 * поэтому блики ложатся по рельефу, а не по ровной заливке.
 */
import * as THREE from 'three';
import { normalMap, roughnessMap } from './textures.js';

export const METALS = {
  steel: { color: 0xccd3dd, roughness: 0.17, metalness: 1 },
  steelBrushed: { color: 0xb9c0ca, roughness: 0.3, metalness: 1 },
  gold: { color: 0xd8a94e, roughness: 0.2, metalness: 1 },
  roseGold: { color: 0xd59a80, roughness: 0.22, metalness: 1 },
  titanium: { color: 0xa9aeb6, roughness: 0.36, metalness: 1 },
  dlc: { color: 0x1b1d22, roughness: 0.45, metalness: 0.9 },
  rhodium: { color: 0xdde1e7, roughness: 0.19, metalness: 1 },
  brass: { color: 0xc9a24a, roughness: 0.24, metalness: 1 },
  blued: { color: 0x2b4a8f, roughness: 0.18, metalness: 1 },
};

export const DIALS = {
  midnight: { color: 0x101a33, roughness: 0.32, metalness: 0.85 },
  opal: { color: 0xe9e6dd, roughness: 0.3, metalness: 0.35 },
  graphite: { color: 0x24262b, roughness: 0.4, metalness: 0.9 },
  salmon: { color: 0xc98a6a, roughness: 0.34, metalness: 0.5 },
  meteorite: { color: 0x6d727a, roughness: 0.36, metalness: 0.95 },
};

const standard = (options) => new THREE.MeshStandardMaterial({ envMapIntensity: 1.5, ...options });

/** Полированный металл корпуса. */
export function caseMaterial(kind = 'steel') {
  const preset = METALS[kind] ?? METALS.steel;
  const material = standard(preset);
  if (kind === 'steelBrushed' || kind === 'titanium' || kind === 'dlc') {
    material.normalMap = normalMap('circular', { size: 512, strength: 0.5, repeat: 2 });
    material.normalScale = new THREE.Vector2(0.35, 0.35);
    material.roughnessMap = roughnessMap('circular', { size: 512, repeat: 2, from: 0.7, to: 1.1 });
  }
  return material;
}

/** Мосты и ротор: женевские полосы. */
export function bridgeMaterial(kind = 'rhodium') {
  const material = standard(METALS[kind] ?? METALS.rhodium);
  material.normalMap = normalMap('cotes', { size: 1024, strength: 2.6, repeat: 1 });
  material.normalScale = new THREE.Vector2(0.85, 0.85);
  material.roughnessMap = roughnessMap('cotes', { size: 512, repeat: 0.5, from: 0.35, to: 0.95 });
  return material;
}

/** Плата: зернение. */
export function mainplateMaterial() {
  const material = standard({ color: 0x878d96, roughness: 0.36, metalness: 1 });
  material.normalMap = normalMap('perlage', { size: 1024, strength: 1.4, repeat: 1 });
  material.normalScale = new THREE.Vector2(0.6, 0.6);
  material.roughnessMap = roughnessMap('perlage', { size: 512, repeat: 2, from: 0.5, to: 0.92 });
  return material;
}

/** Колёса: золочение и круговое шлифование. */
export function wheelMaterial(tone = 0xd9b25f) {
  const material = standard({ color: tone, roughness: 0.22, metalness: 1 });
  material.normalMap = normalMap('circular', { size: 512, strength: 0.6, repeat: 3 });
  material.normalScale = new THREE.Vector2(0.25, 0.25);
  return material;
}

/** Камень: рубин в оправе. */
export const rubyMaterial = () =>
  standard({ color: 0x8d1020, roughness: 0.14, metalness: 0.15, emissive: 0x33050c, emissiveIntensity: 0.4 });

/**
 * Сапфировое стекло. Преломление через transmission на программном рендере
 * не работает, поэтому стекло собрано из двух честных признаков: почти
 * невидимый купол с сильным отражением окружения и просветляющий оттенок
 * по кромке. Без них циферблат выглядит незастеклённым.
 */
export const sapphireMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0xcfdfff,
    metalness: 0.2,
    roughness: 0.02,
    transparent: true,
    opacity: 0.13,
    ior: 1.77,
    reflectivity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
    specularIntensity: 1,
    envMapIntensity: 3.4,
    side: THREE.FrontSide,
  });

/** Тёмный сапфир задней крышки: видно механизм, но стекло читается. */
export const casebackGlassMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: 0xcfdfff,
    metalness: 0.2,
    roughness: 0.03,
    transparent: true,
    opacity: 0.14,
    ior: 1.77,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 2.8,
  });

/** Циферблат: солнечные лучи. */
export function dialMaterial(kind = 'midnight') {
  const preset = DIALS[kind] ?? DIALS.midnight;
  const material = standard(preset);
  material.normalMap = normalMap('sunburst', { size: 1024, strength: 1.1, repeat: 1 });
  material.normalScale = new THREE.Vector2(0.5, 0.5);
  material.roughnessMap = roughnessMap('sunburst', { size: 512, repeat: 1, from: 0.5, to: 1.05 });
  return material;
}

/** Светомасса: слабое свечение, как у заряженного люминофора. */
export const lumeMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: 0xdff3e8,
    roughness: 0.6,
    metalness: 0,
    emissive: 0x7ff0c4,
    emissiveIntensity: 0.9,
  });

/** Кожа ремешка и подкладка. */
export function leatherMaterial(tone = 0x4a3a2c) {
  /* Лента ремешка — открытая поверхность: без DoubleSide её не видно снаружи. */
  const material = standard({ color: tone, roughness: 0.72, metalness: 0.05, side: THREE.DoubleSide });
  material.normalMap = normalMap('leather', { size: 512, strength: 1.8, repeat: 4 });
  material.normalScale = new THREE.Vector2(1.1, 1.1);
  return material;
}

/** Стекло для мелких деталей и лакового слоя цифр. */
export const enamelMaterial = (color = 0xf2efe8) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.1, envMapIntensity: 0.8 });

export const polishMaterial = (color = 0xe8ecf2) =>
  standard({ color, roughness: 0.06, metalness: 1 });
