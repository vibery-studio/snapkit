// Gradient preset definitions for background picker
// CSS gradient strings used directly as background values

export interface GradientPreset {
  id: string;
  name: string;
  css: string;  // full CSS gradient string, e.g. "linear-gradient(135deg, #667eea, #764ba2)"
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'purple-deep',    name: 'Purple Deep',    css: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'pink-sunset',    name: 'Pink Sunset',    css: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'ocean-blue',     name: 'Ocean Blue',     css: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'emerald-spring', name: 'Emerald Spring', css: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'flamingo-gold',  name: 'Flamingo Gold',  css: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { id: 'lavender-blush', name: 'Lavender Blush', css: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { id: 'midnight-city',  name: 'Midnight City',  css: 'linear-gradient(135deg, #232526, #414345)' },
  { id: 'citrus-burst',   name: 'Citrus Burst',   css: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  { id: 'royal-navy',     name: 'Royal Navy',     css: 'linear-gradient(135deg, #1a1a3e, #3a3a8a)' },
  { id: 'aurora',         name: 'Aurora',         css: 'linear-gradient(135deg, #00c3ff, #ffff1c)' },
  { id: 'rose-gold',      name: 'Rose Gold',      css: 'linear-gradient(135deg, #f8b4c8, #d4a0ff)' },
  { id: 'forest-night',   name: 'Forest Night',   css: 'linear-gradient(135deg, #134e5e, #71b280)' },
];

export const GRADIENT_IDS = GRADIENT_PRESETS.map((g) => g.id);

export function getGradientById(id: string): GradientPreset | undefined {
  return GRADIENT_PRESETS.find((g) => g.id === id);
}
