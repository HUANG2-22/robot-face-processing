/**
 * Generative 3D flow (p5.js WEBGL)
 * Inspired by "unsupervised"-style visuals: noise-driven vector field,
 * 3D particle advection, additive glow, and motion trails.
 */

const CONFIG = {
  w: 400,
  h: 570,
  // Particle count: increase for denser look, but may hurt FPS.
  particleCount: 11000,
  // World scale (in pixels). Larger = more spread.
  bounds: 260,
  // Vector field sampling scale (smaller => smoother flow).
  fieldScale: 0.011,
  // Speed of particle advection.
  step: 1.6,
  // How quickly the vector field evolves over time.
  timeSpeed: 0.12,
  // Background alpha controls trail length (lower alpha => longer trails).
  trailAlpha: 7,
};

let particles = [];
let t = 0;

function setup() {
  const c = createCanvas(CONFIG.w, CONFIG.h, WEBGL);
  c.parent("canvas-wrap");
  pixelDensity(1);

  // Use HSB for easy neon-like palette.
  colorMode(HSB, 360, 100, 100, 100);

  initParticles();
}

function initParticles() {
  particles = new Array(CONFIG.particleCount);

  for (let i = 0; i < particles.length; i++) {
    const p = spawnParticle();
    particles[i] = p;
  }
}

function spawnParticle() {
  // Spawn inside a sphere-ish volume for a "cloud" look.
  const r = Math.pow(random(), 0.55) * CONFIG.bounds;
  const u = random();
  const v = random();
  const theta = TWO_PI * u;
  const phi = Math.acos(2 * v - 1);

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  const seed = random(1000);
  return {
    x,
    y,
    z,
    px: x,
    py: y,
    pz: z,
    seed,
  };
}

function vectorField(x, y, z, time, seed) {
  // A "soft" vector field from Perlin noise. Not a perfect curl-noise,
  // but visually close for generative flow.
  const s = CONFIG.fieldScale;
  const nx = (y + seed) * s;
  const ny = (z - seed) * s;
  const nz = (x + seed) * s;

  const tt = time * CONFIG.timeSpeed;

  const vx = noise(nx, ny, tt) * 2 - 1;
  const vy = noise(ny, nz, tt + 37.0) * 2 - 1;
  const vz = noise(nz, nx, tt + 91.0) * 2 - 1;

  // Bias toward smoother motion.
  return {
    vx: vx * 0.9,
    vy: vy * 0.9,
    vz: vz * 0.9,
  };
}

function draw() {
  // Motion trails: draw a translucent background each frame.
  // Deep teal-ish base to match your reference.
  background(180, 80, 20, CONFIG.trailAlpha);

  // Emissive/additive feel.
  blendMode(ADD);

  // Slow global rotation to enhance 3D perception.
  t += 1;
  const time = t * 0.01;
  const rotY = time * 0.35;
  const rotX = time * 0.18;

  push();
  rotateY(rotY);
  rotateX(rotX);

  strokeWeight(2.2);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const f = vectorField(p.x, p.y, p.z, time, p.seed);

    // Save previous position so we can draw a "streamline" segment.
    p.px = p.x;
    p.py = p.y;
    p.pz = p.z;

    p.x += f.vx * CONFIG.step;
    p.y += f.vy * CONFIG.step;
    p.z += f.vz * CONFIG.step;

    // Respawn particles leaving the volume.
    const m = CONFIG.bounds * 1.15;
    if (
      Math.abs(p.x) > m ||
      Math.abs(p.y) > m ||
      Math.abs(p.z) > m ||
      !Number.isFinite(p.x)
    ) {
      const np = spawnParticle();
      p.x = np.x;
      p.y = np.y;
      p.z = np.z;
      p.seed = np.seed;
      continue;
    }

    // Color comes from noise field for a chromatic-flow look.
    const colN = noise(p.x * 0.01 + p.seed, p.y * 0.01, time * 0.8);
    const hue = 170 + 170 * colN; // ~teal -> purple range
    const sat = 90;
    const bri = 95 * (0.25 + 0.75 * colN);

    // Slight alpha modulation gives more depth.
    const a = 35 + 35 * (0.5 + 0.5 * f.vy);
    stroke(hue, sat, bri, a);

    // Render as short segments to mimic continuous flow.
    // Glow pass (thicker, dimmer)
    const briGlow = Math.min(100, bri * 1.2);
    const aGlow = a * 0.35;
    stroke(hue, sat, briGlow, aGlow);
    strokeWeight(4.5);
    line(p.px, p.py, p.pz, p.x, p.y, p.z);

    // Core pass (thinner, brighter)
    stroke(hue, sat, bri, a);
    strokeWeight(1.8);
    line(p.px, p.py, p.pz, p.x, p.y, p.z);

    point(p.x, p.y, p.z);
  }

  pop();

  // Restore blending for any future 2D overlays.
  blendMode(BLEND);
}
