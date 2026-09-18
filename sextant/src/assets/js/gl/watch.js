/**
 * Часы целиком: корпус, безель, циферблат с накладными метками, стрелки,
 * сапфировое стекло, задняя крышка с механизмом и ремешок.
 *
 * Плоскость XY — циферблат, +Z — сторона стекла. Конфигуратор меняет
 * материал корпуса, циферблат, размер и ремешок, не пересобирая сцену.
 */
import * as THREE from 'three';
import {
  METALS,
  caseMaterial,
  casebackGlassMaterial,
  dialMaterial,
  enamelMaterial,
  leatherMaterial,
  lumeMaterial,
  polishMaterial,
  sapphireMaterial,
} from './materials.js';
import { createCalibre, engraving, extrudeShape, mergeGeometries, roundedShape } from './calibre.js';

const TAU = Math.PI * 2;

/** Корпус: тело вращения по профилю — от задней крышки до безеля. */
function caseGeometry(size) {
  const k = size / 38;
  const profile = [
    [0.0, -0.62],
    [0.62, -0.62],
    [0.96, -0.6],
    [1.1, -0.54],
    [1.15, -0.34],
    [1.16, -0.08],
    [1.15, 0.02],
    [1.1, 0.06],
    [1.0, 0.08],
    [0.95, 0.06],
    [0.95, 0.0],
    [0.0, 0.0],
  ].map(([x, y]) => new THREE.Vector2(x * k, y * k));

  const geometry = new THREE.LatheGeometry(profile, 96);
  geometry.rotateX(Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** Ушки: два выступа под ремешок сверху и снизу. */
function lugGeometry(size) {
  const k = size / 38;
  const shape = roundedShape(
    [
      new THREE.Vector2(-0.16, -0.1),
      new THREE.Vector2(0.16, -0.1),
      new THREE.Vector2(0.19, 0.34),
      new THREE.Vector2(0.0, 0.42),
      new THREE.Vector2(-0.19, 0.34),
    ],
    0.08,
  );
  const geometry = extrudeShape(shape, 0.16);
  geometry.scale(k, k, k);
  return geometry;
}

/** Метки и минутная шкала: одна геометрия на весь циферблат. */
function markerGeometry(size, count, { inner, outer, width, thickness = 0.022 }) {
  const k = size / 38;
  const parts = [];

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * TAU;
    const isHour = count === 12 || index % 5 === 0;
    const length = (outer - inner) * (isHour ? 1 : 0.55);
    const start = inner + (outer - inner - length);

    const bar = new THREE.BoxGeometry(width * (isHour ? 1 : 0.55), length, thickness);
    bar.translate(0, start + length / 2, 0);
    bar.rotateZ(angle);
    bar.scale(k, k, k);
    parts.push(bar);
  }

  return mergeGeometries(parts);
}

/** Стрелка: вытянутый многоугольник с противовесом. */
function handGeometry({ length, width, tail, thickness = 0.02, size }) {
  const k = size / 38;
  const shape = roundedShape(
    [
      new THREE.Vector2(-width / 2, -tail),
      new THREE.Vector2(width / 2, -tail),
      new THREE.Vector2(width / 2 * 0.8, length * 0.62),
      new THREE.Vector2(0, length),
      new THREE.Vector2(-width / 2 * 0.8, length * 0.62),
    ],
    width * 0.22,
  );
  const geometry = extrudeShape(shape, thickness);
  geometry.scale(k, k, k);
  return geometry;
}

/** Ремешок: лента, построенная по кривой от ушка вниз и под корпус. */
function strapGeometry({ size, side, length = 0.86, width = 1.04, thickness = 0.07 }) {
  const k = size / 38;
  const direction = side === 'top' ? 1 : -1;
  const segments = 32;
  const half = width / 2;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    /* Локальные оси: y — к ушкам, z — толщина. После разворота сцены
       лента уходит от ушек вниз и под корпус, как ремешок на руке. */
    const y = direction * (0.92 + t * length);
    const z = -0.14 - Math.sin(t * 1.5) * 1.62;
    /* Лента сужается к пряжке — так ремешок не выглядит доской. */
    const taper = half * (1 - t * 0.2);

    positions.push(-taper, y * k, z * k, taper, y * k, z * k);
    uvs.push(0, t * 4, 1, t * 4);

    if (index < segments) {
      const base = index * 2;
      indices.push(base, base + 1, base + 3, base, base + 3, base + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  /* Вторая сторона ленты: без неё ремешок виден только снаружи. */
  const back = geometry.clone();
  back.scale(1, 1, 1);
  const offset = back.getAttribute('position');
  for (let index = 0; index < offset.count; index += 1) {
    offset.setZ(index, offset.getZ(index) - thickness * k);
  }
  back.computeVertexNormals();

  return mergeGeometries([geometry, back]);
}

export function createWatch(options = {}) {
  const {
    size = 38,
    caseKind = 'steel',
    dialKind = 'midnight',
    strapKind = 'leather',
    strapTone = 0x4a3a2c,
    showStrap = true,
    showMovement = true,
  } = options;

  const group = new THREE.Group();
  const nodes = {};

  const metalCase = caseMaterial(caseKind);
  const metalPolish = polishMaterial(caseKind === 'gold' ? 0xe8c477 : 0xeef2f8);
  const lume = lumeMaterial();

  /* --- Корпус ------------------------------------------------------------ */
  const caseGroup = new THREE.Group();
  caseGroup.name = 'case';

  caseGroup.add(new THREE.Mesh(caseGeometry(size), metalCase));

  const bezel = new THREE.Mesh(new THREE.TorusGeometry((1.05 * size) / 38, (0.03 * size) / 38, 16, 96), metalPolish);
  bezel.position.z = (0.075 * size) / 38;
  caseGroup.add(bezel);

  const lugTop = new THREE.Mesh(lugGeometry(size), metalCase);
  lugTop.position.set(-(0.62 * size) / 38, (1.0 * size) / 38, (-0.16 * size) / 38);
  lugTop.rotation.z = -0.16;
  caseGroup.add(lugTop);

  const lugTopRight = lugTop.clone();
  lugTopRight.position.x *= -1;
  lugTopRight.rotation.z *= -1;
  caseGroup.add(lugTopRight);

  const lugBottom = lugTop.clone();
  lugBottom.position.y *= -1;
  lugBottom.rotation.z *= -1;
  caseGroup.add(lugBottom);

  const lugBottomRight = lugTopRight.clone();
  lugBottomRight.position.y *= -1;
  lugBottomRight.rotation.z *= -1;
  caseGroup.add(lugBottomRight);

  /* Заводная головка: рифлёный цилиндр справа. */
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry((0.1 * size) / 38, (0.1 * size) / 38, (0.1 * size) / 38, 24),
    metalPolish,
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.set((1.24 * size) / 38, 0, 0.02);
  caseGroup.add(crown);

  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * TAU;
    const flute = new THREE.Mesh(new THREE.BoxGeometry((0.11 * size) / 38, 0.012, 0.012), metalPolish);
    flute.position.set(
      (1.24 * size) / 38,
      Math.sin(angle) * (0.1 * size) / 38,
      Math.cos(angle) * (0.1 * size) / 38 + 0.02,
    );
    flute.rotation.x = -angle;
    caseGroup.add(flute);
  }

  group.add(caseGroup);
  nodes.case = caseGroup;

  /* --- Механизм внутри --------------------------------------------------- */
  let calibre = null;
  if (showMovement) {
    calibre = createCalibre();
    /* Механизм развёрнут мостами к задней крышке — так его видно через
       сапфир, как в жизни. Масштаб подобран по толщине корпуса. */
    calibre.group.scale.setScalar(0.75);
    calibre.group.rotation.x = Math.PI;
    calibre.group.position.z = (-0.15 * size) / 38;
    group.add(calibre.group);
  }

  /* --- Циферблат --------------------------------------------------------- */
  const dialGroup = new THREE.Group();
  dialGroup.name = 'dial';

  const dial = new THREE.Mesh(
    new THREE.CylinderGeometry((0.94 * size) / 38, (0.94 * size) / 38, 0.02, 96),
    dialMaterial(dialKind),
  );
  dial.rotation.x = Math.PI / 2;
  dial.position.z = (0.02 * size) / 38;
  dialGroup.add(dial);

  const hours = new THREE.Mesh(
    markerGeometry(size, 12, { inner: 0.6, outer: 0.86, width: 0.09, thickness: 0.03 }),
    metalPolish,
  );
  hours.position.z = (0.04 * size) / 38;
  dialGroup.add(hours);

  const minutes = new THREE.Mesh(
    markerGeometry(size, 60, { inner: 0.82, outer: 0.88, width: 0.03, thickness: 0.015 }),
    enamelMaterial(0xbfc6d2),
  );
  minutes.position.z = (0.033 * size) / 38;
  dialGroup.add(minutes);

  /* Светомасса на часовых метках: светится в темноте. */
  const lumeMarks = new THREE.Mesh(
    markerGeometry(size, 12, { inner: 0.63, outer: 0.8, width: 0.05, thickness: 0.028 }),
    lume,
  );
  lumeMarks.position.z = (0.05 * size) / 38;
  dialGroup.add(lumeMarks);

  /* Логотип и подписи на циферблате. */
  const dialText = (text, x, y, width, size, color) => {
    const plane = engraving(text, { width, x, y, z: (0.05 * size) / 38 + 0.001, size: 58, letterSpacing: 12 });
    plane.material.color.set(color);
    return plane;
  };

  dialGroup.add(dialText('СЕКСТАНТ', 0, (0.34 * size) / 38, (0.5 * size) / 38, size, 0xd9dee8));
  dialGroup.add(dialText('САНКТ-ПЕТЕРБУРГ', 0, (-0.42 * size) / 38, (0.34 * size) / 38, size, 0x9aa4b6));
  dialGroup.add(dialText('SXT-01', 0, (0.24 * size) / 38, (0.24 * size) / 38, size, 0x9aa4b6));

  group.add(dialGroup);
  nodes.dial = dialGroup;

  /* --- Стрелки ----------------------------------------------------------- */
  const handsGroup = new THREE.Group();
  handsGroup.name = 'hands';

  const hourHand = new THREE.Group();
  hourHand.add(new THREE.Mesh(handGeometry({ length: 0.48, width: 0.08, tail: 0.12, size }), metalPolish));
  const hourLume = new THREE.Mesh(
    handGeometry({ length: 0.4, width: 0.04, tail: 0.1, thickness: 0.012, size }),
    lume,
  );
  hourLume.position.z = (0.03 * size) / 38;
  hourHand.add(hourLume);
  hourHand.position.z = (0.06 * size) / 38;

  const minuteHand = new THREE.Group();
  minuteHand.add(new THREE.Mesh(handGeometry({ length: 0.74, width: 0.06, tail: 0.16, size }), metalPolish));
  const minuteLume = new THREE.Mesh(
    handGeometry({ length: 0.62, width: 0.03, tail: 0.14, thickness: 0.012, size }),
    lume,
  );
  minuteLume.position.z = (0.03 * size) / 38;
  minuteHand.add(minuteLume);
  minuteHand.position.z = (0.09 * size) / 38;

  const secondHand = new THREE.Group();
  secondHand.add(
    new THREE.Mesh(
      handGeometry({ length: 0.82, width: 0.022, tail: 0.24, thickness: 0.012, size }),
      new THREE.MeshStandardMaterial({ color: 0xd8a94e, roughness: 0.25, metalness: 1 }),
    ),
  );
  secondHand.position.z = (0.12 * size) / 38;

  handsGroup.add(hourHand, minuteHand, secondHand);
  group.add(handsGroup);
  nodes.hands = handsGroup;

  /* --- Стекло и задняя крышка -------------------------------------------- */
  /* Купол: сферический сегмент с радиусом основания 0,94 и подъёмом 0,09. */
  const crystal = new THREE.Mesh(
    new THREE.SphereGeometry(4.47, 96, 24, 0, TAU, 0, 0.212),
    sapphireMaterial(),
  );
  crystal.rotation.x = Math.PI / 2;
  crystal.position.z = 0.09 - 4.47;
  group.add(crystal);
  nodes.crystal = crystal;

  if (showMovement) {
    const backRing = new THREE.Mesh(
      new THREE.TorusGeometry((0.92 * size) / 38, (0.055 * size) / 38, 14, 80),
      metalCase,
    );
    backRing.position.z = (-0.6 * size) / 38;
    group.add(backRing);

    const backGlass = new THREE.Mesh(
      new THREE.CylinderGeometry((0.9 * size) / 38, (0.9 * size) / 38, 0.012, 80),
      casebackGlassMaterial(),
    );
    backGlass.rotation.x = Math.PI / 2;
    backGlass.position.z = (-0.585 * size) / 38;
    group.add(backGlass);
  }

  /* --- Ремешок ----------------------------------------------------------- */
  let strap = null;
  const strapMaterial = leatherMaterial(strapTone);
  if (showStrap) {
    strap = new THREE.Group();
    strap.name = 'strap';

    const top = new THREE.Mesh(strapGeometry({ size, side: 'top' }), strapMaterial);
    const bottom = new THREE.Mesh(strapGeometry({ size, side: 'bottom' }), strapMaterial);
    strap.add(top, bottom);

    /* Пряжка на нижнем ремешке. */
    const buckle = new THREE.Mesh(new THREE.TorusGeometry((0.42 * size) / 38, (0.045 * size) / 38, 12, 40), metalPolish);
    buckle.position.set(0, (-1.72 * size) / 38, (-1.62 * size) / 38);
    buckle.rotation.x = Math.PI / 2.1;
    strap.add(buckle);

    group.add(strap);
    nodes.strap = strap;
  }

  /* --- Время на стрелках -------------------------------------------------- */
  const state = { second: 0, sweep: 0 };

  const animate = (time, delta) => {
    const now = new Date(time);
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;

    /* Секундная стрелка идёт восемью шагами в секунду — как у механики
       с 28 800 полуколебаниями. */
    state.sweep = Math.floor(seconds * 8) / 8;

    hourHand.rotation.z = -(hours / 12) * TAU;
    minuteHand.rotation.z = -(minutes / 60) * TAU;
    secondHand.rotation.z = -(state.sweep / 60) * TAU;

    if (calibre) calibre.animate(time, delta);
  };

  animate(performance.now(), 16);

  /** Соответствие идентификаторов конфигуратора материалам. */
  const CASE_KINDS = { steel: 'steel', rhodium: 'steelBrushed', 'titanium-dlc': 'dlc', gold: 'gold' };
  const DIAL_KINDS = { midnight: 'midnight', graphite: 'graphite', 'white-opal': 'opal', meteorite: 'meteorite' };

  /**
   * Смена варианта: материалы меняются на месте, геометрия не пересобирается.
   * Размер меняется масштабом узла на стороне страницы.
   */
  const apply = (next = {}) => {
    if (next.caseKind) {
      const preset = caseMaterial(CASE_KINDS[next.caseKind] ?? next.caseKind);
      metalCase.color.copy(preset.color);
      metalCase.roughness = preset.roughness;
      metalCase.metalness = preset.metalness;
      metalCase.normalMap = preset.normalMap ?? null;
      metalCase.normalScale.copy(preset.normalScale ?? new THREE.Vector2(1, 1));
      metalCase.roughnessMap = preset.roughnessMap ?? null;
      metalCase.needsUpdate = true;
      preset.dispose();

      const polished =
        next.caseKind === 'gold' ? 0xe8c477 : next.caseKind === 'titanium-dlc' ? 0x5a6068 : 0xeef2f8;
      metalPolish.color.set(polished);
    }

    if (next.dialKind) {
      const preset = dialMaterial(DIAL_KINDS[next.dialKind] ?? next.dialKind);
      dial.material.color.copy(preset.color);
      dial.material.roughness = preset.roughness;
      dial.material.metalness = preset.metalness;
      dial.material.needsUpdate = true;
      preset.dispose();
    }

    if (next.strapTone !== undefined) {
      strapMaterial.color.set(next.strapTone);
      /* Браслет и каучук блестят иначе, чем кожа. */
      const kind = next.strapKind ?? 'leather';
      strapMaterial.metalness = kind === 'bracelet' ? 0.9 : 0.05;
      strapMaterial.roughness = kind === 'bracelet' ? 0.28 : kind === 'rubber' ? 0.62 : 0.72;
      strapMaterial.needsUpdate = true;
    }
  };

  return { group, nodes, animate, apply, calibre, materials: { case: metalCase, polish: metalPolish, strap: strapMaterial, dial: dial.material } };
}

export const WATCH_METALS = METALS;
