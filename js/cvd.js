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

  function correctColor(original, currentPalette, selected, threshold) {
    const targetLuminance = ColorMath.relativeLuminance(original);

    // Try small hue rotations, searching for a visually close color that satisfies ΔE
    for (let angle = 5; angle <= 180; angle += 5) {
      for (const signedAngle of [angle, -angle]) {
        let candidate = ColorMath.rotateHue(original, signedAngle);
        candidate = ColorMath.restoreLuminance(candidate, targetLuminance);

        let safe = true;
        for (const other of currentPalette) {
          if (other === original) continue;
          if (!isPairSafe(candidate, other, selected, threshold)) {
            safe = false;
            break;
          }
        }

        if (safe) {
          return { color: candidate, angle: signedAngle, fixed: true };
        }
      }
    }

    return { color: { ...original }, angle: 0, fixed: false };
  }

  function correctPalette(palette, selected, threshold, problematicIndices) {
    // Work on a copy of the palette and update candidate choices dynamically
    const workingPalette = palette.map(c => ({ ...c }));
    const changes = [];

    for (const index of problematicIndices) {
      const originalColor = palette[index];
      const result = correctColor(originalColor, workingPalette, selected, threshold);
      workingPalette[index] = result.color;
      changes.push({
        index,
        original: originalColor,
        corrected: result.color,
        angle: result.angle,
        fixed: result.fixed
      });
    }

    return { corrected: workingPalette, changes };
  }

  return { simulate, types, minimumSimulatedDistance, isPairSafe, correctColor, correctPalette };
})();
