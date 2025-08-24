// Deterministic, seeded utilities for demo price series

// Simple string hash to 32-bit int
export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 PRNG
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate a realistic random-walk series around base price
export function generatePriceSeries(
  basePrice: number,
  length = 90,
  seed = 1
): number[] {
  const rand = mulberry32(seed);
  const series: number[] = [];
  let p = basePrice * (0.9 + rand() * 0.1);
  for (let i = 0; i < length; i++) {
    const drift = (basePrice - p) * 0.02;
    const noise = (rand() - 0.5) * basePrice * 0.06; // ±6%
    const weekly = (i % 7 === 6) ? -basePrice * 0.01 : 0;
    p = p + drift + noise + weekly;
    const minP = basePrice * 0.75;
    const maxP = basePrice * 1.25;
    p = Math.max(minP, Math.min(maxP, p));
    series.push(parseFloat(p.toFixed(2)));
  }
  series[series.length - 1] = parseFloat(basePrice.toFixed(2));
  return series;
}

export function generateSeededSeries(seedKey: string, basePrice: number, length = 90) {
  return generatePriceSeries(basePrice, length, hashString(seedKey));
}


