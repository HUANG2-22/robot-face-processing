/**
 * Generative 3D flow (Processing, P3D)
 * Similar look to the p5.js version: noise-driven vector field + 3D particles + trails + glow.
 */

final int W = 400;
final int H = 570;

final int particleCount = 11000;
final float bounds = 260;
final float fieldScale = 0.011;
final float step = 1.6;
final float timeSpeed = 0.12;
final float trailAlpha = 7; // lower => longer trails

Particle[] particles = new Particle[particleCount];
float t = 0;

class Particle {
  float x, y, z;
  float px, py, pz;
  float seed;

  Particle(float x, float y, float z, float seed) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.px = x;
    this.py = y;
    this.pz = z;
    this.seed = seed;
  }
}

void setup() {
  size(W, H, P3D);
  colorMode(HSB, 360, 100, 100, 100);

  smooth(8);

  // Depth test makes additive points feel "washed out"; disabling helps.
  hint(DISABLE_DEPTH_TEST);

  for (int i = 0; i < particles.length; i++) {
    particles[i] = spawnParticle();
  }
}

Particle spawnParticle() {
  // Spawn inside a sphere-ish volume for a cloud.
  float r = pow(random(1), 0.55) * bounds;
  float u = random(1);
  float v = random(1);
  float theta = TWO_PI * u;
  float phi = acos(2 * v - 1);

  float x = r * sin(phi) * cos(theta);
  float y = r * sin(phi) * sin(theta);
  float z = r * cos(phi);

  return new Particle(x, y, z, random(1000));
}

PVector vectorField(float x, float y, float z, float time, float seed) {
  float s = fieldScale;
  float nx = (y + seed) * s;
  float ny = (z - seed) * s;
  float nz = (x + seed) * s;
  float tt = time * timeSpeed;

  float vx = noise(nx, ny, tt) * 2 - 1;
  float vy = noise(ny, nz, tt + 37.0) * 2 - 1;
  float vz = noise(nz, nx, tt + 91.0) * 2 - 1;

  return new PVector(vx * 0.9, vy * 0.9, vz * 0.9);
}

void draw() {
  // Trails: translucent background each frame.
  background(180, 80, 20, trailAlpha);
  blendMode(ADD);

  t += 1;
  float time = t * 0.01;

  // Global rotation for 3D perception.
  pushMatrix();
  rotateY(time * 0.35);
  rotateX(time * 0.18);

  strokeWeight(2.2);

  for (int i = 0; i < particles.length; i++) {
    Particle p = particles[i];
    PVector f = vectorField(p.x, p.y, p.z, time, p.seed);

    // Save previous position so we can draw a streamline segment.
    p.px = p.x;
    p.py = p.y;
    p.pz = p.z;

    p.x += f.x * step;
    p.y += f.y * step;
    p.z += f.z * step;

    float m = bounds * 1.15;
    if (abs(p.x) > m || abs(p.y) > m || abs(p.z) > m || !Float.isFinite(p.x)) {
      Particle np = spawnParticle();
      p.x = np.x;
      p.y = np.y;
      p.z = np.z;
      p.seed = np.seed;
      continue;
    }

    float colN = noise(p.x * 0.01 + p.seed, p.y * 0.01, time * 0.8);
    float hue = 170 + 170 * colN;
    float sat = 90;
    float bri = 95 * (0.25 + 0.75 * colN);
    float a = 35 + 35 * (0.5 + 0.5 * f.y);

    // Glow pass (thicker, dimmer)
    float briGlow = min(100, bri * 1.2);
    float aGlow = a * 0.35;
    strokeWeight(4.5);
    stroke(hue, sat, briGlow, aGlow);
    line(p.px, p.py, p.pz, p.x, p.y, p.z);

    // Core pass (thinner, brighter)
    strokeWeight(1.8);
    stroke(hue, sat, bri, a);
    line(p.px, p.py, p.pz, p.x, p.y, p.z);
    point(p.x, p.y, p.z);
  }

  popMatrix();

  // Keep blend mode sane if you add other 2D elements later.
  blendMode(BLEND);
}
