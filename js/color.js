// Color conversion, color science, and color-distance functions for ColorSafe.

const ColorMath = (() => {
  // Transformation matrix between RGB and Hunt-Pointer-Estevez LMS space
  const RGB_TO_LMS = [
    [0.60974, 0.20528, 0.14919],
    [0.31111, 0.62567, 0.06322],
    [0.01947, 0.06087, 0.74457]
  ];

  // Exact mathematical inverse of RGB_TO_LMS
  const LMS_TO_RGB = [
    [1.96253855, -0.61068925, -0.34138275],
    [-0.97875805, 1.91616247, 0.03341677],
    [0.02869626, -0.14068078, 1.34925211]
  ];

  function multiplyMatrixVector(m, v) {
    return m.map(row => row.reduce((sum, value, i) => sum + value * v[i], 0));
  }

  function clamp(v, min = 0, max = 1) {
    return Math.min(max, Math.max(min, v));
  }

  function srgbToLinear(c) {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function linearToSrgb(c) {
    const clamped = clamp(c, 0, 1);
    const v = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return Math.round(clamp(v, 0, 1) * 255);
  }

  function rgbToLms(rgb) {
    const lin = [
      srgbToLinear(rgb.r),
      srgbToLinear(rgb.g),
      srgbToLinear(rgb.b)
    ];
    return multiplyMatrixVector(RGB_TO_LMS, lin);
  }

  function lmsToRgb(lms) {
    const lin = multiplyMatrixVector(LMS_TO_RGB, lms);
    return {
      r: linearToSrgb(lin[0]),
      g: linearToSrgb(lin[1]),
      b: linearToSrgb(lin[2])
    };
  }

  function rgbToHsv(rgb) {
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;

    if (d !== 0) {
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;

    return {
      h,
      s: max === 0 ? 0 : d / max,
      v: max
    };
  }

  function hsvToRgb(hsv) {
    const h = ((hsv.h % 360) + 360) % 360;
    const s = clamp(hsv.s, 0, 1);
    const v = clamp(hsv.v, 0, 1);
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let rp = 0, gp = 0, bp = 0;

    if (h < 60) [rp, gp, bp] = [c, x, 0];
    else if (h < 120) [rp, gp, bp] = [x, c, 0];
    else if (h < 180) [rp, gp, bp] = [0, c, x];
    else if (h < 240) [rp, gp, bp] = [0, x, c];
    else if (h < 300) [rp, gp, bp] = [x, 0, c];
    else [rp, gp, bp] = [c, 0, x];

    return {
      r: Math.round(clamp(rp + m, 0, 1) * 255),
      g: Math.round(clamp(gp + m, 0, 1) * 255),
      b: Math.round(clamp(bp + m, 0, 1) * 255)
    };
  }

  function relativeLuminance(rgb) {
    const r = srgbToLinear(rgb.r);
    const g = srgbToLinear(rgb.g);
    const b = srgbToLinear(rgb.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrastRatio(rgb1, rgb2) {
    const l1 = relativeLuminance(rgb1);
    const l2 = relativeLuminance(rgb2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function restoreLuminance(rgb, targetLum) {
    const current = relativeLuminance(rgb);
    if (current < 0.0001) return rgb;

    const scale = targetLum / current;
    // Apply in linear RGB space to preserve color balance correctly
    const rLin = clamp(srgbToLinear(rgb.r) * scale, 0, 1);
    const gLin = clamp(srgbToLinear(rgb.g) * scale, 0, 1);
    const bLin = clamp(srgbToLinear(rgb.b) * scale, 0, 1);

    return {
      r: linearToSrgb(rLin),
      g: linearToSrgb(gLin),
      b: linearToSrgb(bLin)
    };
  }

  function rotateHue(rgb, degrees) {
    const hsv = rgbToHsv(rgb);
    return hsvToRgb({ h: hsv.h + degrees, s: hsv.s, v: hsv.v });
  }

  function rgbToLab(rgb) {
    const r = srgbToLinear(rgb.r);
    const g = srgbToLinear(rgb.g);
    const b = srgbToLinear(rgb.b);

    // D65 Standard Illuminant reference normalization
    const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
    const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000;
    const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;

    const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);

    const fx = f(x), fy = f(y), fz = f(z);

    return {
      L: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz)
    };
  }

  function deltaE76(a, b) {
    const labA = rgbToLab(a);
    const labB = rgbToLab(b);
    return Math.sqrt(
      Math.pow(labA.L - labB.L, 2) +
      Math.pow(labA.a - labB.a, 2) +
      Math.pow(labA.b - labB.b, 2)
    );
  }

  function hexToRgb(hex) {
    if (!hex) return null;
    let h = hex.trim().replace("#", "");
    if (/^[0-9a-fA-F]{3}$/.test(h)) {
      h = h.split("").map(c => c + c).join("");
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  function rgbToHex(rgb) {
    if (!rgb) return "#000000";
    return "#" + [rgb.r, rgb.g, rgb.b]
      .map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  return {
    multiplyMatrixVector, clamp, srgbToLinear, linearToSrgb,
    rgbToLms, lmsToRgb, rgbToHsv, hsvToRgb,
    relativeLuminance, contrastRatio, restoreLuminance,
    rotateHue, rgbToLab, deltaE76, hexToRgb, rgbToHex
  };
})();
