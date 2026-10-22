// Color vision deficiency simulation and correction engine for ColorSafe.

const CVD = (() => {
  // Standard Viénot / Machado color vision deficiency simulation matrices in linear RGB space
  const MATRICES = {
    protanopia: [
      [0.56667, 0.43333, 0.00000],
      [0.55833, 0.44167, 0.00000],
      [0.00000, 0.24167, 0.75833]
    ],
    deuteranopia: [
      [0.62500, 0.37500, 0.00000],
      [0.70000, 0.30000, 0.00000],
      [0.00000, 0.30000, 0.70000]
    ],
    tritanopia: [
      [0.95000, 0.05000, 0.00000],
      [0.00000, 0.43333, 0.56667],
      [0.00000, 0.47500, 0.52500]
    ],
    achromatopsia: [
      [0.21260, 0.71520, 0.07220],
      [0.21260, 0.71520, 0.07220],
      [0.21260, 0.71520, 0.07220]
    ]
  };

  function simulate(rgb, type) {
    if (!type || type === "normal") return { ...rgb };

    const matrix = MATRICES[type];
    if (!matrix) return { ...rgb };

    // Linearize sRGB values before matrix multiplication
    const linRgb = [
      ColorMath.srgbToLinear(rgb.r),
      ColorMath.srgbToLinear(rgb.g),
      ColorMath.srgbToLinear(rgb.b)
    ];

    const simLin = ColorMath.multiplyMatrixVector(matrix, linRgb);

    return {
      r: ColorMath.linearToSrgb(simLin[0]),
      g: ColorMath.linearToSrgb(simLin[1]),
      b: ColorMath.linearToSrgb(simLin[2])
    };
  }

  function types(selected) {
    if (selected === "all") {
      return ["protanopia", "deuteranopia", "tritanopia"];
    }
    return [selected];
  }

  function minimumSimulatedDistance(a, b, selected) {
    const cvdTypes = types(selected);
    const results = cvdTypes.map(type => ({
      type,
      deltaE: ColorMath.deltaE76(simulate(a, type), simulate(b, type))
    }));

    return results.sort((x, y) => x.deltaE - y.deltaE)[0];
  }

  function isPairSafe(a, b, selected, threshold) {
    return minimumSimulatedDistance(a, b, selected).deltaE >= threshold;
  }

  // How well a candidate colour fits the rest of the palette:
  // the number of clashing pairs (fewer is better), then the smallest ΔE (bigger is better).
  function scoreCandidate(candidate, palette, skipIndex, selected, threshold) {
    let clashes = 0;
    let minDelta = Infinity;
    palette.forEach((other, i) => {
      if (i === skipIndex) return; // never compare a colour with itself
      const d = minimumSimulatedDistance(candidate, other, selected).deltaE;
      if (d < threshold) clashes++;
      if (d < minDelta) minDelta = d;
    });
    return { clashes, minDelta };
  }

  function isBetter(a, b) {
    return a.clashes < b.clashes || (a.clashes === b.clashes && a.minDelta > b.minDelta + 0.5);
  }

  function correctColor(original, currentPalette, selected, threshold, index = -1) {
    const targetLuminance = ColorMath.relativeLuminance(original);
    let best = { color: { ...original }, angle: 0, ...scoreCandidate(original, currentPalette, index, selected, threshold) };
    if (best.clashes === 0) return { color: best.color, angle: 0, fixed: true };

    // Try small hue rotations first (5°, -5°, 10°, -10° ... 180°).
    // The first fully safe one wins; otherwise keep the rotation that removes the most clashes.
    for (let angle = 5; angle <= 180; angle += 5) {
      for (const signedAngle of [angle, -angle]) {
        let candidate = ColorMath.rotateHue(original, signedAngle);
        candidate = ColorMath.restoreLuminance(candidate, targetLuminance);
        const score = scoreCandidate(candidate, currentPalette, index, selected, threshold);

        if (score.clashes === 0) {
          return { color: candidate, angle: signedAngle, fixed: true };
        }
        if (isBetter(score, best)) {
          best = { color: candidate, angle: signedAngle, ...score };
        }
      }
    }

    // No fully safe angle: return the best improvement found (partial fix)
    return { color: best.color, angle: best.angle, fixed: false, partial: best.angle !== 0 };
  }

  function correctPalette(palette, selected, threshold, problematicIndices, passes = 3) {
    // Work on a copy of the palette. Several passes, because moving one colour
    // can make room for (or crowd) another.
    const workingPalette = palette.map(c => ({ ...c }));
    const angles = palette.map(() => 0);

    for (let pass = 0; pass < passes; pass++) {
      let changed = false;
      for (const index of problematicIndices) {
        const result = correctColor(palette[index], workingPalette, selected, threshold, index);
        if (result.angle !== angles[index]) changed = true;
        workingPalette[index] = result.color;
        angles[index] = result.angle;
      }
      if (!changed) break;
    }

    const changes = problematicIndices.map(index => {
      const stillClashes = scoreCandidate(workingPalette[index], workingPalette, index, selected, threshold).clashes;
      return {
        index,
        original: palette[index],
        corrected: workingPalette[index],
        angle: angles[index],
        fixed: stillClashes === 0,
        partial: stillClashes > 0 && angles[index] !== 0
      };
    });

    return { corrected: workingPalette, changes };
  }

  return { simulate, types, minimumSimulatedDistance, isPairSafe, correctColor, correctPalette };
})();