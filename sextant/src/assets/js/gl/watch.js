/**
 * Часы целиком: корпус из трёх тел вращения с разной отделкой, внутренний
 * борт, печатный циферблат с накладными метками, стрелки со светомассой,
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
  leatherMaterial,
  lumeMaterial,
  polishMaterial,
  sapphireMaterial,
} from './materials.js';
import { createCalibre, engraving, extrudeShape, mergeGeometries, roundedShape } from './calibre.js';
import { dialTexture } from './textures.js';

const TAU = Math.PI * 2;

/** Тело вращения: профиль задаётся парами «радиус, высота». */
function lathe(profile, k, segments = 128) {
  const geometry = new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x * k, y * k)),
    segments,
  );
  geometry.rotateX(Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Корпус из трёх частей: задняя крышка, боковина и безель. Разная отделка
 * на стыке даёт ту самую границу «полировка — сатин», по которой часы
 * и читаются как металл, а не как литая деталь.
 */
function caseParts(size) {
  const k = size / 38;

  const back = lathe(
    [
      [0.81, -0.56],
      [0.81, -0.605],
      [0.82, -0.615],
      [0.9, -0.6],
      [0.93, -0.56],
    ],
    k,
  );

  const band = lathe(
    [
      [0.93, -0.56],
      [1.0, -0.5],
      [1.1, -0.4],
      [1.16, -0.26],
      [1.185, -0.06],
      [1.175, 0.005],
    ],
    k,
  );

  const bezel = lathe(
    [
      [1.175, 0.005],
      [1.155, 0.04],
      [1.1, 0.062],
      [1.045, 0.07],
      [1.012, 0.05],
      [0.99, 0.018],
      [0.988, -0.005],
    ],
    k,
  );

  return { back, band, bezel };
}

/** Ушки: сужаются к концу, сверху полированная фаска. */
function lugGeometry(size) {
  const k = size / 38;
  const shape = roundedShape(
    [
      new THREE.Vector2(-0.17, -0.12),
      new THREE.Vector2(0.17, -0.12),
      new THREE.Vector2(0.2, 0.22),
      new THREE.Vector2(0.12, 0.42),
      new THREE.Vector2(0.0, 0.46),
      new THREE.Vector2(-0.12, 0.42),
      new THREE.Vector2(-0.2, 0.22),
    ],
    0.07,
  );
  const geometry = extrudeShape(shape, 0.15);
  geometry.scale(k, k, k);
  return geometry;
}

/** Накладные метки: металлическая оправа и светомасса внутри неё. */
function markerGeometry(size, count, { inner, outer, width, thickness = 0.026 }) {
  const k = size / 38;

  const build = (shrink) => {
    const parts = [];

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * TAU;
      const length = (outer - inner) * shrink;
      const start = inner + (outer - inner - length) / 2;

      const bar = new THREE.BoxGeometry(width * shrink, length, thickness);
      bar.translate(0, start + length / 2, 0);
      bar.rotateZ(angle);
      parts.push(bar);
    }

    const merged = mergeGeometries(parts);
    merged.scale(k, k, k);
    return merged;
  };

  return { frame: build(1), inlay: build(0.5) };
}

/** Стрелка: гранёная, с продольной канавкой под светомассу. */
function handGeometry({ length, width, tail, thickness = 0.02, size }) {
  const k = size / 38;
  const shape = roundedShape(
    [
      new THREE.Vector2(-width / 2, -tail),
      new THREE.Vector2(width / 2, -tail),
      new THREE.Vector2((width / 2) * 0.72, length * 0.66),
      new THREE.Vector2(0, length),
      new THREE.Vector2((-width / 2) * 0.72, length * 0.66),
    ],
    width * 0.24,
  );
  const geometry = extrudeShape(shape, thickness);
  geometry.scale(k, k, k);
  return geometry;
}

/** Ремешок: лента, построенная по кривой от ушка вниз и под запястье. */
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
  const k = size / 38;

  const metalCase = caseMaterial(caseKind);
  const metalPolish = polishMaterial(caseKind === 'gold' ? 0xe8c477 : 0xeef2f8);
  const metalDark = new THREE.MeshStandardMaterial({ color: 0x3a3f47, roughness: 0.5, metalness: 1 });
  const lume = lumeMaterial();

  /* --- Корпус ------------------------------------------------------------ */
  const caseGroup = new THREE.Group();
  caseGroup.name = 'case';

  const parts = caseParts(size);
  caseGroup.add(new THREE.Mesh(parts.back, metalCase));
  caseGroup.add(new THREE.Mesh(parts.band, metalCase));
  caseGroup.add(new THREE.Mesh(parts.bezel, metalPolish));

  const lugTop = new THREE.Mesh(lugGeometry(size), metalCase);
  lugTop.position.set((-0.62 * size) / 38, (1.02 * size) / 38, (-0.1 * size) / 38);
  lugTop.rotation.z = -0.15;
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

  /* Заводная головка: рифлёный цилиндр с полированной шляпкой. */
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry((0.1 * size) / 38, (0.1 * size) / 38, (0.11 * size) / 38, 28),
    metalPolish,
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.set((1.24 * size) / 38, 0, 0.01);
  caseGroup.add(crown);

  for (let index = 0; index < 18; index += 1) {
    const angle = (index / 18) * TAU;
    const flute = new THREE.Mesh(new THREE.BoxGeometry((0.12 * size) / 38, 0.009, 0.009), metalDark);
    flute.position.set(
      (1.24 * size) / 38,
      (Math.sin(angle) * 0.1 * size) / 38,
      (Math.cos(angle) * 0.1 * size) / 38 + 0.01,
    );
    flute.rotation.x = -angle;
    caseGroup.add(flute);
  }

  const crownCap = new THREE.Mesh(
    new THREE.CylinderGeometry((0.062 * size) / 38, (0.062 * size) / 38, (0.02 * size) / 38, 28),
    metalPolish,
  );
  crownCap.rotation.z = Math.PI / 2;
  crownCap.position.set((1.3 * size) / 38, 0, 0.01);
  caseGroup.add(crownCap);

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

  /* --- Внутренний борт и циферблат --------------------------------------- */
  const dialGroup = new THREE.Group();
  dialGroup.name = 'dial';

  const rehautGeometry = new THREE.CylinderGeometry(
    (0.988 * size) / 38,
    (0.92 * size) / 38,
    (0.032 * size) / 38,
    128,
    1,
    true,
  );
  rehautGeometry.rotateX(Math.PI / 2);

  const rehautMaterial = metalPolish.clone();
  rehautMaterial.side = THREE.DoubleSide;
  const rehaut = new THREE.Mesh(rehautGeometry, rehautMaterial);
  rehaut.position.z = (0.014 * size) / 38;
  dialGroup.add(rehaut);

  const dialMaterialInstance = dialMaterial(dialKind);
  /* Цвет уже нарисован в карте: если оставить цвет материала, он умножится
     и циферблат станет серым. */
  dialMaterialInstance.map = dialTexture(dialKind);
  dialMaterialInstance.color.set(0xffffff);
  dialMaterialInstance.roughness = 0.34;

  const dial = new THREE.Mesh(new THREE.CircleGeometry((0.92 * size) / 38, 128), dialMaterialInstance);
  dial.position.z = (0.004 * size) / 38;
  dialGroup.add(dial);

  /* Накладные метки: металлическая оправа и светомасса внутри. */
  const markers = markerGeometry(size, 12, { inner: 0.58, outer: 0.8, width: 0.075, thickness: 0.03 });
  const markerFrame = new THREE.Mesh(markers.frame, metalPolish);
  markerFrame.position.z = (0.022 * size) / 38;
  dialGroup.add(markerFrame);

  const markerInlay = new THREE.Mesh(markers.inlay, lume);
  markerInlay.position.z = (0.036 * size) / 38;
  dialGroup.add(markerInlay);

  group.add(dialGroup);
  nodes.dial = dialGroup;

  /* --- Стрелки ----------------------------------------------------------- */
  const handsGroup = new THREE.Group();
  handsGroup.name = 'hands';

  const makeHand = ({ length, width, tail, thickness, lumeScale, z, material }) => {
    const holder = new THREE.Group();
    holder.add(new THREE.Mesh(handGeometry({ length, width, tail, thickness, size }), material));

    const inlay = new THREE.Mesh(
      handGeometry({
        length: length * lumeScale,
        width: width * 0.42,
        tail: tail * 0.5,
        thickness: thickness * 0.6,
        size,
      }),
      lume,
    );
    inlay.position.z = (thickness * 0.9 * size) / 38;
    holder.add(inlay);

    holder.position.z = z;
    return holder;
  };

  const hourHand = makeHand({
    length: 0.46,
    width: 0.085,
    tail: 0.12,
    thickness: 0.022,
    lumeScale: 0.78,
    z: (0.05 * size) / 38,
    material: metalPolish,
  });

  const minuteHand = makeHand({
    length: 0.72,
    width: 0.062,
    tail: 0.15,
    thickness: 0.02,
    lumeScale: 0.8,
    z: (0.078 * size) / 38,
    material: metalPolish,
  });

  const secondHand = new THREE.Group();
  const secondMetal = new THREE.MeshStandardMaterial({ color: 0xd8a94e, roughness: 0.22, metalness: 1 });
  secondHand.add(
    new THREE.Mesh(handGeometry({ length: 0.8, width: 0.02, tail: 0.2, thickness: 0.009, size }), secondMetal),
  );

  const counterweight = new THREE.Mesh(
    new THREE.CylinderGeometry((0.05 * size) / 38, (0.05 * size) / 38, (0.012 * size) / 38, 24),
    secondMetal,
  );
  counterweight.rotation.x = Math.PI / 2;
  counterweight.position.y = (-0.2 * size) / 38;
  secondHand.add(counterweight);
  secondHand.position.z = (0.1 * size) / 38;

  handsGroup.add(hourHand, minuteHand, secondHand);
  group.add(handsGroup);
  nodes.hands = handsGroup;

  /* --- Стекло и задняя крышка -------------------------------------------- */
  /* Купол: сферический сегмент с радиусом основания 0,95 и подъёмом 0,07. */
  const crystal = new THREE.Mesh(
    new THREE.SphereGeometry(6.4, 128, 32, 0, TAU, 0, 0.149),
    sapphireMaterial(),
  );
  crystal.rotation.x = Math.PI / 2;
  crystal.position.z = (0.20 - 6.4) * size / 38;
  crystal.scale.setScalar(size / 38);
  group.add(crystal);

  /* Кромка стекла: без неё купол не читается — стекло выглядит отсутствующим. */
  const crystalEdge = new THREE.Mesh(
    new THREE.TorusGeometry((0.945 * size) / 38, (0.012 * size) / 38, 12, 128),
    new THREE.MeshStandardMaterial({ color: 0xdfe9ff, roughness: 0.05, metalness: 1, envMapIntensity: 2.6 }),
  );
  crystalEdge.position.z = (0.13 * size) / 38;
  group.add(crystalEdge);
  nodes.crystal = crystal;

  if (showMovement) {
    const backRing = new THREE.Mesh(
      new THREE.TorusGeometry((0.88 * size) / 38, (0.05 * size) / 38, 16, 96),
      metalCase,
    );
    backRing.position.z = (-0.57 * size) / 38;
    group.add(backRing);

    const backGlass = new THREE.Mesh(
      new THREE.CylinderGeometry((0.86 * size) / 38, (0.86 * size) / 38, 0.012, 96),
      casebackGlassMaterial(),
    );
    backGlass.rotation.x = Math.PI / 2;
    backGlass.position.z = (-0.56 * size) / 38;
    group.add(backGlass);

    /* Гравировка на задней крышке: имя, калибр, водозащита. */
    const backText = engraving('СЕКСТАНТ · SXT-01 · 100 м', {
      width: (0.8 * size) / 38,
      z: (-0.618 * size) / 38,
      size: 46,
      letterSpacing: 8,
    });
    backText.rotation.y = Math.PI;
    backText.material.color.set(0x2a2f38);
    group.add(backText);
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
    const buckle = new THREE.Mesh(
      new THREE.TorusGeometry((0.42 * size) / 38, (0.045 * size) / 38, 14, 48),
      metalPolish,
    );
    buckle.position.set(0, (-1.72 * size) / 38, (-1.62 * size) / 38);
    buckle.rotation.x = Math.PI / 2.1;
    strap.add(buckle);

    group.add(strap);
    nodes.strap = strap;
  }

  /* --- Время на стрелках -------------------------------------------------- */
  const state = { sweep: 0 };

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
        next.caseKind === 'gold' ? 0xe8c477 : next.caseKind === 'titanium-dlc' ? 0x6a707a : 0xeef2f8;
      metalPolish.color.set(polished);
      rehautMaterial.color.set(polished);
    }

    if (next.dialKind) {
      const preset = dialMaterial(DIAL_KINDS[next.dialKind] ?? next.dialKind);
      dial.material.color.set(0xffffff);
      dial.material.roughness = preset.roughness;
      dial.material.metalness = preset.metalness;
      dial.material.map = dialTexture(next.dialKind);
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

  return {
    group,
    nodes,
    animate,
    apply,
    calibre,
    materials: { case: metalCase, polish: metalPolish, strap: strapMaterial, dial: dial.material },
  };
}

export const WATCH_METALS = METALS;
