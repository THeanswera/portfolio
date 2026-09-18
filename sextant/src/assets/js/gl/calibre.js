/**
 * Калибр SXT-01: механизм собирается кодом из примитивов — плата, барабан
 * с заводной пружиной, колёсная передача, анкерный ход, баланс со спиралью,
 * мосты, камни и ротор автоподзавода.
 *
 * Детали сгруппированы по узлам: по этим группам работает разборка на
 * странице калибра, поэтому имена узлов совпадают с данными сайта.
 * Ось Z — толщина механизма, +Z — сторона мостов и ротора.
 */
import * as THREE from 'three';
import {
  bridgeMaterial,
  caseMaterial,
  mainplateMaterial,
  polishMaterial,
  rubyMaterial,
  wheelMaterial,
  METALS,
} from './materials.js';

const TAU = Math.PI * 2;

/* --- Примитивы ---------------------------------------------------------- */

/** Шестерня: зубчатый венец, спицы и ступица — как у настоящего колеса. */
export function gearGeometry({ teeth = 60, radius = 0.3, thickness = 0.03, spokes = 5, hub = 0.05 }) {
  const step = TAU / teeth;
  const rootRadius = radius * 0.93;
  const shape = new THREE.Shape();
  const points = [];

  for (let index = 0; index < teeth; index += 1) {
    const angle = index * step;
    points.push(new THREE.Vector2(Math.cos(angle) * rootRadius, Math.sin(angle) * rootRadius));
    points.push(
      new THREE.Vector2(Math.cos(angle + step * 0.22) * radius, Math.sin(angle + step * 0.22) * radius),
      new THREE.Vector2(Math.cos(angle + step * 0.5) * radius, Math.sin(angle + step * 0.5) * radius),
      new THREE.Vector2(Math.cos(angle + step * 0.72) * rootRadius, Math.sin(angle + step * 0.72) * rootRadius),
    );
  }

  shape.setFromPoints(points);

  const hole = new THREE.Path();
  hole.absarc(0, 0, rootRadius * 0.66, 0, TAU, true);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSize: 0.0035,
    bevelThickness: 0.0035,
    bevelSegments: 1,
    curveSegments: 6,
  });
  geometry.translate(0, 0, -thickness / 2);

  /* Спицы и ступица: венец без них выглядит шайбой. */
  const parts = [geometry];
  const inner = rootRadius * 0.66;

  for (let index = 0; index < spokes; index += 1) {
    const angle = (index / spokes) * TAU;
    const spoke = new THREE.BoxGeometry(inner, Math.max(0.016, radius * 0.075), thickness * 0.7);
    spoke.translate(inner / 2, 0, 0);
    spoke.rotateZ(angle);
    parts.push(spoke);
  }

  const hubGeometry = new THREE.CylinderGeometry(hub, hub, thickness * 2.2, 18);
  hubGeometry.rotateX(Math.PI / 2);
  parts.push(hubGeometry);

  return mergeGeometries(parts);
}

/** Скруглённый многоугольник. */
export function roundedShape(points, radius = 0.08) {
  const shape = new THREE.Shape();
  const count = points.length;

  for (let index = 0; index < count; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % count];
    const previous = points[(index - 1 + count) % count];

    const toPrev = new THREE.Vector2().subVectors(previous, current).normalize();
    const toNext = new THREE.Vector2().subVectors(next, current).normalize();
    const start = current.clone().addScaledVector(toPrev, radius);
    const end = current.clone().addScaledVector(toNext, radius);

    if (index === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);

    shape.quadraticCurveTo(current.x, current.y, end.x, end.y);
  }

  shape.closePath();
  return shape;
}

export function extrudeShape(shape, depth, holes = []) {
  shape.holes.push(...holes);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.006,
    bevelThickness: 0.006,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/**
 * Мост: сектор кольца. Такая форма читается как деталь механизма,
 * а не как полоса — мосты в часах идут по дуге вокруг осей.
 */
export function arcBridge({ from, to, inner, outer, depth }) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, from, to, false);
  shape.absarc(0, 0, inner, to, from, true);
  shape.closePath();
  return extrudeShape(shape, depth);
}

/** Спираль: заводная пружина и спираль Бреге. */
export function spiralCurve({ turns = 6, from = 0.05, to = 0.3, height = 0 }) {
  const points = [];
  const steps = turns * 40;

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const angle = t * turns * TAU;
    const radius = from + (to - from) * t;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, height * t));
  }

  return new THREE.CatmullRomCurve3(points);
}

/** Склейка геометрий без внешних зависимостей. */
export function mergeGeometries(geometries) {
  const attributeNames = ['position', 'normal', 'uv'];
  const merged = new THREE.BufferGeometry();
  const arrays = {};
  let indexCount = 0;

  geometries.forEach((geometry) => {
    const index = geometry.getIndex();
    const position = geometry.getAttribute('position');
    indexCount += index ? index.count : position.count;
    attributeNames.forEach((name) => {
      if (!geometry.getAttribute(name)) return;
      arrays[name] = arrays[name] ?? [];
      arrays[name].push(geometry.getAttribute(name).array);
    });
  });

  attributeNames.forEach((name) => {
    if (!arrays[name]) return;
    const total = arrays[name].reduce((sum, array) => sum + array.length, 0);
    const combined = new Float32Array(total);
    let offset = 0;
    arrays[name].forEach((array) => {
      combined.set(array, offset);
      offset += array.length;
    });
    merged.setAttribute(name, new THREE.BufferAttribute(combined, name === 'uv' ? 2 : 3));
  });

  const indices = new Uint32Array(indexCount);
  let vertexOffset = 0;
  let indexOffset = 0;

  geometries.forEach((geometry) => {
    const index = geometry.getIndex();
    const count = geometry.getAttribute('position').count;

    if (index) {
      for (let i = 0; i < index.count; i += 1) indices[indexOffset + i] = index.getX(i) + vertexOffset;
      indexOffset += index.count;
    } else {
      for (let i = 0; i < count; i += 1) indices[indexOffset + i] = i + vertexOffset;
      indexOffset += count;
    }

    vertexOffset += count;
  });

  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  merged.computeBoundingSphere();
  return merged;
}

/* --- Мелкие детали ------------------------------------------------------ */

const disc = (radius, height, segments = 64) => {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
  geometry.rotateX(Math.PI / 2);
  return geometry;
};

const jewelGeometry = (radius = 0.03) => {
  const geometry = new THREE.CylinderGeometry(radius, radius, 0.026, 20);
  geometry.rotateX(Math.PI / 2);
  return geometry;
};

const screwGeometry = (radius = 0.03) => {
  const head = new THREE.CylinderGeometry(radius, radius * 0.9, 0.02, 20);
  head.rotateX(Math.PI / 2);
  const slot = new THREE.BoxGeometry(radius * 1.8, radius * 0.26, 0.026);
  return mergeGeometries([head, slot]);
};

/** Текст на прозрачном canvas: гравировка на мостах. */
function engravingTexture(text, { width = 1024, height = 128, size = 62, letterSpacing = 10 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';

  const chars = [...text];
  const total = chars.reduce((sum, char) => sum + ctx.measureText(char).width + letterSpacing, 0) - letterSpacing;
  let x = (width - total) / 2;

  chars.forEach((char) => {
    ctx.fillText(char, x, height / 2);
    x += ctx.measureText(char).width + letterSpacing;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function engraving(text, { width = 0.62, x = 0, y = 0, z = 0, size = 62, letterSpacing = 10, rotation = 0 } = {}) {
  const texture = engravingTexture(text, { size, letterSpacing });
  const material = new THREE.MeshStandardMaterial({
    color: 0x363a43,
    roughness: 0.4,
    metalness: 0.7,
    transparent: true,
    alphaMap: texture,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 0.125), material);
  mesh.position.set(x, y, z);
  mesh.rotation.z = rotation;
  return mesh;
}

const placed = (object, x, y, z) => {
  object.position.set(x, y, z);
  return object;
};

/* --- Сборка калибра ----------------------------------------------------- */

/**
 * Возвращает группу механизма и узлы по именам.
 * Раскладка осей повторяет настоящий калибр: барабан слева сверху,
 * колёсная передача справа, баланс внизу, анкер между ними.
 */
export function createCalibre({ detail = 'high' } = {}) {
  const group = new THREE.Group();
  const nodes = {};

  const metalRhodium = bridgeMaterial('rhodium');
  const metalPlate = mainplateMaterial();
  const metalWheel = wheelMaterial();
  const metalSteel = polishMaterial(0xe6ebf2);
  const metalBlued = new THREE.MeshStandardMaterial({ ...METALS.blued, envMapIntensity: 1.6 });
  const ruby = rubyMaterial();
  const gold = caseMaterial('gold');
  const tungsten = new THREE.MeshStandardMaterial({ color: 0x70767f, roughness: 0.44, metalness: 1, envMapIntensity: 1.2 });

  const segments = detail === 'high' ? 96 : 48;

  /* --- Плата ------------------------------------------------------------ */
  const mainplate = new THREE.Group();
  mainplate.name = 'mainplate';

  mainplate.add(placed(new THREE.Mesh(disc(1.0, 0.13, segments), metalPlate), 0, 0, -0.065));

  /* Углубления под оси: без них плата выглядит пустым диском. */
  const recessMaterial = new THREE.MeshStandardMaterial({ color: 0x2f333a, roughness: 0.65, metalness: 1 });
  [
    [0.0, 0.0, 0.34],
    [0.34, 0.3, 0.24],
    [0.5, -0.06, 0.21],
    [0.24, -0.46, 0.15],
    [-0.44, 0.16, 0.42],
    [-0.24, -0.54, 0.3],
  ].forEach(([x, y, radius]) => {
    mainplate.add(placed(new THREE.Mesh(disc(radius, 0.016, 40), recessMaterial), x, y, 0.0015));
  });

  /* Винты по краю платы. */
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * TAU + 0.2;
    mainplate.add(
      placed(new THREE.Mesh(screwGeometry(0.022), metalSteel), Math.cos(angle) * 0.94, Math.sin(angle) * 0.94, 0.072),
    );
  }

  group.add(mainplate);
  nodes.mainplate = mainplate;

  /* --- Барабан с заводной пружиной -------------------------------------- */
  const barrel = new THREE.Group();
  barrel.name = 'barrel';
  barrel.position.set(-0.44, 0.16, 0);

  barrel.add(placed(new THREE.Mesh(disc(0.4, 0.24, segments), metalRhodium), 0, 0, 0.14));
  barrel.add(placed(new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.015, 10, segments), metalSteel), 0, 0, 0.26));

  const spring = new THREE.Mesh(
    new THREE.TubeGeometry(spiralCurve({ turns: 8, from: 0.09, to: 0.35 }), 460, 0.013, 8, false),
    metalBlued,
  );
  barrel.add(placed(spring, 0, 0, 0.28));

  barrel.add(placed(new THREE.Mesh(disc(0.05, 0.46, 28), metalSteel), 0, 0, 0.24));

  const ratchet = new THREE.Mesh(
    gearGeometry({ teeth: 44, radius: 0.17, thickness: 0.026, spokes: 4, hub: 0.04 }),
    metalWheel,
  );
  barrel.add(placed(ratchet, 0, 0, 0.34));

  const crownWheel = new THREE.Mesh(
    gearGeometry({ teeth: 28, radius: 0.1, thickness: 0.024, spokes: 3, hub: 0.03 }),
    metalWheel,
  );
  barrel.add(placed(crownWheel, 0.22, -0.14, 0.3));

  group.add(barrel);
  nodes.barrel = barrel;

  /* --- Колёсная передача ------------------------------------------------- */
  const train = new THREE.Group();
  train.name = 'train';

  [
    { teeth: 64, radius: 0.3, x: 0.0, y: 0.0, z: 0.07, spokes: 5 },
    { teeth: 56, radius: 0.22, x: 0.34, y: 0.3, z: 0.14, spokes: 4 },
    { teeth: 48, radius: 0.19, x: 0.5, y: -0.06, z: 0.21, spokes: 4 },
  ].forEach((wheel) => {
    const mesh = new THREE.Mesh(
      gearGeometry({ teeth: wheel.teeth, radius: wheel.radius, thickness: 0.024, spokes: wheel.spokes }),
      metalWheel,
    );
    train.add(placed(mesh, wheel.x, wheel.y, wheel.z));
    train.add(placed(new THREE.Mesh(disc(0.045, 0.24, 24), metalSteel), wheel.x, wheel.y, wheel.z));
  });

  const escapeWheel = new THREE.Mesh(
    gearGeometry({ teeth: 15, radius: 0.12, thickness: 0.02, spokes: 3, hub: 0.032 }),
    metalWheel,
  );
  train.add(placed(escapeWheel, 0.24, -0.46, 0.27));
  train.add(placed(new THREE.Mesh(disc(0.036, 0.3, 20), metalSteel), 0.24, -0.46, 0.27));

  group.add(train);
  nodes.train = train;

  /* --- Анкерный ход и баланс --------------------------------------------- */
  const escapement = new THREE.Group();
  escapement.name = 'escapement';

  const fork = new THREE.Mesh(
    extrudeShape(
      roundedShape(
        [
          new THREE.Vector2(-0.05, -0.03),
          new THREE.Vector2(0.12, 0.07),
          new THREE.Vector2(0.16, 0.0),
          new THREE.Vector2(0.02, -0.08),
        ],
        0.02,
      ),
      0.016,
    ),
    metalSteel,
  );
  escapement.add(placed(fork, 0.05, -0.5, 0.29));
  escapement.add(placed(new THREE.Mesh(disc(0.03, 0.26, 20), metalSteel), 0.05, -0.5, 0.29));

  const balance = new THREE.Group();
  balance.name = 'balance';
  balance.position.set(-0.24, -0.54, 0);

  balance.add(placed(new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.028, 14, segments), gold), 0, 0, 0.3));

  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * TAU + 0.4;
    const timingScrew = new THREE.Mesh(disc(0.024, 0.065, 16), metalSteel);
    timingScrew.rotation.x = Math.PI / 2;
    balance.add(placed(timingScrew, Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0.3));
  }

  for (let index = 0; index < 2; index += 1) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.028, 0.022), gold);
    arm.rotation.z = index * Math.PI * 0.5;
    balance.add(placed(arm, 0, 0, 0.3));
  }

  balance.add(placed(new THREE.Mesh(disc(0.024, 0.5, 20), metalSteel), 0, 0, 0.22));

  const hairspring = new THREE.Mesh(
    new THREE.TubeGeometry(spiralCurve({ turns: 11, from: 0.048, to: 0.17 }), 520, 0.007, 6, false),
    metalBlued,
  );
  balance.add(placed(hairspring, 0, 0, 0.42));
  balance.add(placed(new THREE.Mesh(disc(0.024, 0.028, 16), metalBlued), 0, 0, 0.42));

  escapement.add(balance);
  escapement.add(placed(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.036), metalSteel), -0.49, -0.46, 0.42));

  group.add(escapement);
  nodes.escapement = escapement;

  /* --- Мосты ------------------------------------------------------------- */
  const bridges = new THREE.Group();
  bridges.name = 'bridges';

  /* Мост колёсной передачи: широкая дуга справа, накрывает три колеса. */
  const trainBridge = new THREE.Mesh(
    arcBridge({ from: -1.5, to: 1.15, inner: 0.38, outer: 0.74, depth: 0.045 }),
    metalRhodium,
  );
  bridges.add(placed(trainBridge, 0, 0, 0.36));

  /* Мост барабана: узкая дуга по внешнему краю, пружина остаётся видна. */
  const barrelBridge = new THREE.Mesh(
    arcBridge({ from: 2.0, to: 3.8, inner: 0.66, outer: 0.95, depth: 0.04 }),
    metalRhodium,
  );
  bridges.add(placed(barrelBridge, 0, 0, 0.4));

  /* Мост баланса: дуга снизу слева, держит верхнюю ось баланса. */
  const balanceCock = new THREE.Mesh(
    arcBridge({ from: -3.0, to: -1.95, inner: 0.66, outer: 0.94, depth: 0.04 }),
    metalRhodium,
  );
  balanceCock.name = 'balanceCock';
  bridges.add(placed(balanceCock, 0, 0, 0.52));
  bridges.add(placed(new THREE.Mesh(disc(0.15, 0.04, 40), metalRhodium), -0.24, -0.54, 0.52));

  bridges.add(
    engraving('SXT-01 · 62 КАМНЯ', {
      width: 0.46, x: 0.46, y: -0.3, z: 0.386, size: 56, letterSpacing: 6, rotation: -0.6,
    }),
  );
  bridges.add(
    engraving('28 800 A/h', { width: 0.42, x: -0.6, y: 0.42, z: 0.424, size: 56, letterSpacing: 6, rotation: 1.05 }),
  );

  group.add(bridges);
  nodes.bridges = bridges;

  /* --- Камни и винты ----------------------------------------------------- */
  const jewels = new THREE.Group();
  jewels.name = 'jewels';

  [
    [0.0, 0.0, 0.39],
    [0.34, 0.3, 0.39],
    [0.5, -0.06, 0.39],
    [0.24, -0.46, 0.3],
    [-0.24, -0.54, 0.55],
    [-0.44, 0.16, 0.43],
    [0.05, -0.5, 0.32],
  ].forEach(([x, y, z]) => {
    jewels.add(placed(new THREE.Mesh(jewelGeometry(0.03), ruby), x, y, z));
    jewels.add(placed(new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.013, 8, 24), gold), x, y, z - 0.004));
  });

  [
    [0.14, 0.62, 0.39],
    [0.62, -0.36, 0.39],
    [-0.78, 0.44, 0.43],
    [-0.72, -0.6, 0.55],
    [0.42, -0.02, 0.39],
    [-0.9, 0.06, 0.43],
  ].forEach(([x, y, z], index) => {
    const screw = new THREE.Mesh(screwGeometry(index % 2 ? 0.03 : 0.026), index % 2 ? metalBlued : metalSteel);
    jewels.add(placed(screw, x, y, z));
  });

  group.add(jewels);
  nodes.jewels = jewels;

  /* --- Ротор автоподзавода: скелетон, механизм остаётся виден ------------ */
  const rotor = new THREE.Group();
  rotor.name = 'rotor';

  rotor.add(placed(new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.026, 14, segments), metalRhodium), 0, 0, 0.6));

  /* Тяжёлый сектор из вольфрама: из-за него ротор и вращается. */
  const heavy = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.036, 14, segments, Math.PI * 0.7), tungsten);
  heavy.rotation.z = Math.PI * 0.15;
  rotor.add(placed(heavy, 0, 0, 0.6));

  for (let index = 0; index < 2; index += 1) {
    const angle = (index / 2) * Math.PI + 0.35;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.032, 0.02), metalRhodium);
    spoke.rotation.z = angle;
    rotor.add(placed(spoke, Math.cos(angle) * 0.52, Math.sin(angle) * 0.52, 0.6));
  }

  rotor.add(placed(new THREE.Mesh(disc(0.1, 0.08, 32), metalSteel), 0, 0, 0.6));
  rotor.add(placed(new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.016, 8, 32), gold), 0, 0, 0.6));

  group.add(rotor);
  nodes.rotor = rotor;

  /* --- Ход и вращение ---------------------------------------------------- */
  const state = { rotorAngle: 0, amplitude: 0.6 };

  const animate = (time, delta) => {
    const seconds = time / 1000;

    /* Баланс: 4 Гц в замедлении — иначе движение не разглядеть. */
    const swing = Math.sin(seconds * TAU * 1.33) * state.amplitude;
    balance.rotation.z = swing;
    hairspring.rotation.z = swing * 0.82;

    /* Анкерное колесо идёт шагами: по зубу на полуколебание. */
    const steps = seconds * 2.66;
    escapeWheel.rotation.z = -Math.floor(steps) * (TAU / 15) - (steps % 1) * (TAU / 15) * 0.6;
    fork.rotation.z = Math.sin(seconds * TAU * 1.33) * 0.05;

    /* Ротор качается, как на руке; в покое отведён в сторону. */
    state.rotorAngle += delta * 0.00016;
    rotor.rotation.z = -1.15 + Math.sin(state.rotorAngle) * 0.3 + state.rotorAngle * 0.06;
  };

  return {
    group,
    nodes,
    animate,
    materials: { metalRhodium, metalPlate, metalWheel, metalSteel, metalBlued, ruby, gold, tungsten },
  };
}
