"""Bake the procedural terrain used by world.js.

Outputs (assets/terrain/):
  height.bin  - uint16 little-endian N*N heights, 0..65535 -> 0..HMAX world units
  albedo.jpg  - 2048^2 satellite-style colour map (sRGB)
  light.jpg   - N^2 baked sun shadow * ambient occlusion (greyscale)
  meta.json   - size / range info

World mapping: terrain spans [-SIZE/2, SIZE/2] on x and z; column = x, row = z.
Run:  python tools/gen_terrain.py
"""
import json, os, time
import numpy as np
from PIL import Image

N = 1024
SIZE = 2200.0
HMAX = 320.0
CELL = SIZE / N
TOWN = (520.0, -820.0)
SUN = np.array([-0.55, 0.62, 0.35]); SUN /= np.linalg.norm(SUN)
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'terrain')
rng = np.random.default_rng(20260924)

# ------------------------------------------------------------------ noise
perm = rng.permutation(256); perm = np.concatenate([perm, perm])
ang = rng.random(256) * np.pi * 2
GX, GY = np.cos(ang), np.sin(ang)

def perlin(x, y):
    x0 = np.floor(x); y0 = np.floor(y)
    xf = x - x0; yf = y - y0
    xi = x0.astype(np.int64) & 255; yi = y0.astype(np.int64) & 255
    def g(ix, iy, dx, dy):
        h = perm[perm[ix] + iy]
        return GX[h] * dx + GY[h] * dy
    u = xf * xf * xf * (xf * (xf * 6 - 15) + 10)
    v = yf * yf * yf * (yf * (yf * 6 - 15) + 10)
    n00 = g(xi, yi, xf, yf); n10 = g((xi + 1) & 255, yi, xf - 1, yf)
    n01 = g(xi, (yi + 1) & 255, xf, yf - 1); n11 = g((xi + 1) & 255, (yi + 1) & 255, xf - 1, yf - 1)
    return (n00 + u * (n10 - n00)) + v * ((n01 + u * (n11 - n01)) - (n00 + u * (n10 - n00)))

def fbm(x, y, o, lac=2.03, gain=0.5):
    s = np.zeros_like(x); a = 0.5
    for i in range(o):
        s += a * perlin(x + i * 17.3, y - i * 9.1); x = x * lac; y = y * lac; a *= gain
    return s

def ridged(x, y, o):
    s = np.zeros_like(x); a = 0.5; w = np.ones_like(x)
    for i in range(o):
        n = 1 - np.abs(perlin(x + i * 5.7, y + i * 3.3) * 1.4)
        n = np.clip(n, 0, 1) ** 2 * w
        w = np.clip(n * 1.7, 0, 1)
        s += n * a; x = x * 2.07; y = y * 2.07; a *= 0.5
    return s

def blur(a, r=1, it=1):
    for _ in range(it):
        p = np.pad(a, r, mode='edge'); acc = np.zeros_like(a)
        k = 2 * r + 1
        for dy in range(k):
            for dx in range(k):
                acc += p[dy:dy + a.shape[0], dx:dx + a.shape[1]]
        a = acc / (k * k)
    return a

# ------------------------------------------------------------------ base height
t0 = time.time()
lin = (np.arange(N) + 0.5) / N * SIZE - SIZE / 2
X, Z = np.meshgrid(lin, lin)  # X[row, col] = x, Z[row, col] = z
wx = X + 160 * fbm(X * 0.0011 + 3.1, Z * 0.0011 - 7.3, 4)
wz = Z + 160 * fbm(X * 0.0011 - 11.7, Z * 0.0011 + 5.2, 4)
r1 = ridged(wx * 0.0021, wz * 0.0021, 6)
r2 = ridged(wx * 0.0009 + 9, wz * 0.0009 - 3, 3)
base = fbm(X * 0.0007 + 20, Z * 0.0007 - 4, 3)
h = r1 * 150 + r2 * 120 + base * 60 + 30
# lake basins
lake = fbm(X * 0.0022 - 40, Z * 0.0022 + 12, 2)
h -= np.clip(lake - 0.28, 0, 1) * 260
# town plateau + valley floor
dT = np.hypot(X - TOWN[0], Z - TOWN[1])
tw = np.clip((260 - dT) / 150, 0, 1); tw = tw * tw * (3 - 2 * tw)
h = h * (1 - tw) + (62 + fbm(X * 0.01, Z * 0.01, 2) * 4) * tw
h = np.clip(h, 0, HMAX * 0.95)
print('base', round(time.time() - t0, 1), 's', h.min(), h.max())

# ------------------------------------------------------------------ hydraulic erosion (vectorised droplets)
def erode(hm, drops=650000, batch=16000, steps=80):
    H = hm / CELL  # work in cell units so slopes are geometric
    inertia, capF, minCap, dep, ero, evap, grav = 0.1, 8.0, 0.02, 0.2, 0.5, 0.015, 8.0
    offs = [(dy, dx, w) for dy in (-1, 0, 1) for dx in (-1, 0, 1) for w in [1.0 / (1 + dx * dx + dy * dy)]]
    wsum = sum(w for _, _, w in offs)
    flow = np.zeros_like(H)
    def sample(px, py):
        ix = np.clip(px.astype(np.int64), 0, N - 2); iy = np.clip(py.astype(np.int64), 0, N - 2)
        fx = px - ix; fy = py - iy
        a = H[iy, ix]; b = H[iy, ix + 1]; c = H[iy + 1, ix]; d = H[iy + 1, ix + 1]
        gx = (b - a) * (1 - fy) + (d - c) * fy
        gy = (c - a) * (1 - fx) + (d - b) * fx
        hh = a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy
        return hh, gx, gy, ix, iy, fx, fy
    done = 0
    while done < drops:
        M = min(batch, drops - done); done += M
        px = rng.random(M) * (N - 3) + 1; py = rng.random(M) * (N - 3) + 1
        dx = np.zeros(M); dy = np.zeros(M); sp = np.ones(M); wat = np.ones(M); sed = np.zeros(M)
        alive = np.ones(M, bool)
        for _ in range(steps):
            hh, gx, gy, ix, iy, fx, fy = sample(px, py)
            dx = dx * inertia - gx * (1 - inertia); dy = dy * inertia - gy * (1 - inertia)
            ln = np.hypot(dx, dy); ok = ln > 1e-6
            dx = np.where(ok, dx / np.maximum(ln, 1e-6), 0); dy = np.where(ok, dy / np.maximum(ln, 1e-6), 0)
            nx = px + dx; ny = py + dy
            alive &= ok & (nx > 1) & (nx < N - 2) & (ny > 1) & (ny < N - 2)
            if not alive.any(): break
            nh = sample(np.clip(nx, 1, N - 2.001), np.clip(ny, 1, N - 2.001))[0]
            dh = nh - hh
            cap = np.maximum(-dh * sp * wat * capF, minCap)
            depo = (sed > cap) | (dh > 0)
            amtD = np.where(dh > 0, np.minimum(dh, sed), (sed - cap) * dep)
            amtD = np.where(depo & alive, amtD, 0)
            amtE = np.where(~depo & alive, np.minimum(np.minimum((cap - sed) * ero, -dh), 0.4), 0)
            sed = np.minimum(sed, 30)
            sed = sed + amtE - amtD
            # deposit bilinear
            delta = np.zeros_like(H)
            for (oy, ox, w) in ((0, 0, (1 - fx) * (1 - fy)), (0, 1, fx * (1 - fy)), (1, 0, (1 - fx) * fy), (1, 1, fx * fy)):
                np.add.at(delta, (iy + oy, ix + ox), amtD * w)
            # erode with 3x3 brush
            for (oy, ox, w) in offs:
                np.add.at(delta, (np.clip(iy + oy, 0, N - 1), np.clip(ix + ox, 0, N - 1)), -amtE * w / wsum)
            np.clip(delta, -0.35, 0.35, out=delta)
            H += delta
            np.maximum(H, 0, out=H)
            np.add.at(flow, (iy, ix), wat * alive)
            sp = np.minimum(np.sqrt(np.maximum(sp * sp + (-dh) * grav, 0)), 8.0) * alive
            wat = wat * (1 - evap)
            px = np.where(alive, nx, px); py = np.where(alive, ny, py)
    return H * CELL, flow

t0 = time.time()
h, flow = erode(h)
h = 0.7 * h + 0.3 * blur(h, 1)
h = np.clip(h, 0, HMAX * 0.99)
print('erosion', round(time.time() - t0, 1), 's', h.min(), h.max())

# ------------------------------------------------------------------ derived maps
gz, gx = np.gradient(h, CELL)
nrm = np.dstack([-gx, np.ones_like(h), -gz]); nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
slope = 1 - nrm[..., 1]
lap = blur(h, 3) - h  # >0 in valleys
lap2 = blur(h, 10, 1) - h
flowL = np.log1p(blur(flow, 1)); flowL /= flowL.max()

# ambient occlusion from multi-scale concavity
ao = np.clip(1 - np.clip(blur(h, 4) - h, 0, None) * 0.035 - np.clip(blur(h, 14) - h, 0, None) * 0.012, 0.35, 1)

# sun shadows by marching toward the sun
t0 = time.time()
sd = np.array([SUN[0], SUN[2]]); sdl = np.linalg.norm(sd); sd /= sdl
rise = SUN[1] / sdl  # height gained per unit horizontal distance
shadow = np.ones_like(h)
rows, cols = np.mgrid[0:N, 0:N]
for k in range(1, 140):
    dist = k * 1.5 * CELL
    cx = np.clip((cols + sd[0] * k * 1.5).round().astype(np.int64), 0, N - 1)
    cy = np.clip((rows + sd[1] * k * 1.5).round().astype(np.int64), 0, N - 1)
    occl = h[cy, cx] - (h + dist * rise)
    shadow = np.minimum(shadow, np.clip(1 - occl * 0.25, 0, 1))
shadow = blur(shadow, 1)
print('shadow', round(time.time() - t0, 1), 's')

# ------------------------------------------------------------------ albedo
def up(a, f=2):
    return np.array(Image.fromarray(a.astype(np.float32)).resize((N * f, N * f), Image.BILINEAR))
F = 2
M = N * F
linM = (np.arange(M) + 0.5) / M * SIZE - SIZE / 2
XM, ZM = np.meshgrid(linM, linM)
hU, sU, lapU, lap2U, flU, tU = up(h), up(slope), up(lap), up(lap2), up(flowL), up(tw)
n1 = fbm(XM * 0.35, ZM * 0.35, 2) * 0.5 + 0.5       # canopy texture
n2 = fbm(XM * 0.05, ZM * 0.05, 3) * 0.5 + 0.5       # mid patches
n3 = fbm(XM * 0.006 + 7, ZM * 0.006, 3)             # large vegetation zones

forest = np.clip(0.78 + n3 * 0.9 + lapU * 0.09 + lap2U * 0.01 + flU * 0.3 - sU * 0.55 - np.clip(hU - 220, 0, None) * 0.004 + (n1 - 0.5) * 0.35, 0, 1)
forest = np.clip((forest - 0.4) * 2.6, 0, 1)
dry = np.clip(0.5 - lapU * 0.08 + (n2 - 0.5) * 0.9 + np.clip(hU - 150, 0, None) * 0.002, 0, 1)

c_forest_d = np.array([0.075, 0.10, 0.065]); c_forest_l = np.array([0.17, 0.205, 0.12])
c_grass = np.array([0.33, 0.33, 0.22]); c_dry = np.array([0.52, 0.48, 0.36])
c_rock = np.array([0.42, 0.40, 0.36]); c_water = np.array([0.08, 0.10, 0.11])
c_town = np.array([0.36, 0.35, 0.32])

forestCol = c_forest_d[None, None] * (1 - n1[..., None]) + c_forest_l[None, None] * n1[..., None]
openCol = c_grass[None, None] * (1 - dry[..., None]) + c_dry[None, None] * dry[..., None]
col = openCol * (1 - forest[..., None]) + forestCol * forest[..., None]
rock = np.clip((sU - 0.42) * 3 + (n1 - 0.5) * 0.6, 0, 1)
col = col * (1 - rock[..., None]) + c_rock[None, None] * rock[..., None] * (0.8 + 0.4 * n2[..., None])
col *= (0.86 + 0.28 * n2[..., None])
# rivers
river = np.clip((flU - 0.62) * 6, 0, 1) * np.clip(1 - sU * 2, 0, 1)
col = col * (1 - river[..., None] * 0.8) + c_water[None, None] * river[..., None] * 0.8
# lakes
water = np.clip((12 - hU) / 6, 0, 1)
col = col * (1 - water[..., None]) + c_water[None, None] * water[..., None]
# town patch
town = np.clip(tU * 1.6 - 0.3, 0, 1) * (0.6 + 0.4 * n1)
col = col * (1 - town[..., None] * 0.7) + c_town[None, None] * town[..., None] * 0.7

os.makedirs(OUT, exist_ok=True)
img = (np.clip(col, 0, 1) ** (1 / 1.0) * 255).astype(np.uint8)
Image.fromarray(img, 'RGB').save(os.path.join(OUT, 'albedo.jpg'), quality=86, optimize=True)
lightI = (np.clip(shadow * 0.85 + 0.15, 0, 1) * 0 + 1)  # placeholder to keep shape
L = np.dstack([np.clip(shadow, 0, 1), ao, np.zeros_like(ao)])
Image.fromarray((L * 255).astype(np.uint8), 'RGB').save(os.path.join(OUT, 'light.jpg'), quality=90, optimize=True)
q = np.clip(np.round(h / HMAX * 65535), 0, 65535).astype('<u2')
q.tofile(os.path.join(OUT, 'height.bin'))
json.dump({'N': N, 'size': SIZE, 'hmax': HMAX, 'town': TOWN}, open(os.path.join(OUT, 'meta.json'), 'w'))
# preview hillshade
hs = np.clip((nrm @ SUN) * shadow * 0.9 + 0.1, 0, 1)
prev = (np.clip(col[::F, ::F] * (hs[..., None] * 1.1 + 0.3) * ao[..., None], 0, 1) * 255).astype(np.uint8)
Image.fromarray(prev, 'RGB').save(os.path.join(OUT, '..', '..', 'tools', 'terrain_preview.jpg'), quality=80)
print('done')
