// ColorSafe — Studio Logic

const state = {
  activeTab: "imageTab",
  theme: localStorage.getItem("colorsafe_theme") || "light",
  
  // Image Simulator State
  image: null,
  imageData: null,
  simulatedData: null,
  imageCvd: "all",
  inspectedPixel: null,

  // Palette Studio State
  palette: [
    { r: 255, g: 82, b: 82 },   // Coral Red
    { r: 152, g: 255, b: 152 }, // Mint Green
    { r: 135, g: 206, b: 235 }, // Sky Blue
    { r: 255, g: 191, b: 0 },   // Amber
    { r: 128, g: 0, b: 128 }    // Purple
  ],
  previousPalette: null,
  correctedPalette: [],
  threshold: 20,
  paletteCvd: "all",

  // Preset Color Palettes
  presets: {
    candy: [
      { r: 255, g: 82, b: 82 },
      { r: 255, g: 123, b: 0 },
      { r: 255, g: 183, b: 0 },
      { r: 16, g: 185, b: 129 },
      { r: 2, g: 132, b: 199 },
      { r: 236, g: 72, b: 153 }
    ],
    superhero: [
      { r: 225, g: 29, b: 72 },
      { r: 37, g: 99, b: 235 },
      { r: 234, g: 179, b: 8 },
      { r: 22, g: 163, b: 74 }
    ],
    ocean: [
      { r: 15, g: 23, b: 42 },
      { r: 30, g: 58, b: 138 },
      { r: 2, g: 132, b: 199 },
      { r: 56, g: 189, b: 248 },
      { r: 125, g: 211, b: 252 }
    ],
    pastel: [
      { r: 254, g: 202, b: 202 },
      { r: 187, g: 247, b: 208 },
      { r: 191, g: 219, b: 254 },
      { r: 254, g: 240, b: 138 },
      { r: 221, g: 214, b: 254 }
    ],
    problematic: [
      { r: 239, g: 68, b: 68 },  // Red
      { r: 34, g: 197, b: 94 },  // Green
      { r: 59, g: 130, b: 246 },
      { r: 168, g: 85, b: 247 }
    ]
  }
};

const $ = id => document.getElementById(id);

// DOM Elements Registry
const els = {
  themeToggle: $("themeToggle"),
  themeIconSun: $("themeIconSun"),
  themeIconMoon: $("themeIconMoon"),
  resetBtn: $("resetBtn"),
  
  // Navigation
  navTabs: document.querySelectorAll(".nav-tab"),
  tabPanels: document.querySelectorAll(".tab-panel"),

  // Image Tab
  visionPills: document.querySelectorAll(".vision-pill"),
  dropzone: $("dropzone"),
  imageInput: $("imageInput"),
  sampleChips: document.querySelectorAll(".sample-chip-playful"),
  imageCanvasWrapper: $("imageCanvasWrapper"),
  canvasOriginal: $("canvasOriginal"),
  canvasSimulated: $("canvasSimulated"),
  labelRight: $("labelRight"),
  imageDimensions: $("imageDimensions"),
  activeCvdLabel: $("activeCvdLabel"),
  extractPaletteBtn: $("extractPaletteBtn"),
  downloadSimulatedBtn: $("downloadSimulatedBtn"),

  // Inspector
  inspectedPosBadge: $("inspectedPosBadge"),
  inspectOriginalSwatch: $("inspectOriginalSwatch"),
  inspectOriginalHex: $("inspectOriginalHex"),
  inspectOriginalRgb: $("inspectOriginalRgb"),
  copyOrigHexBtn: $("copyOrigHexBtn"),
  inspectSimulatedSwatch: $("inspectSimulatedSwatch"),
  inspectSimulatedHex: $("inspectSimulatedHex"),
  inspectSimulatedRgb: $("inspectSimulatedRgb"),
  copySimHexBtn: $("copySimHexBtn"),
  inspectDeltaE: $("inspectDeltaE"),
  inspectDeltaLabel: $("inspectDeltaLabel"),
  inspectContrast: $("inspectContrast"),
  inspectWcagAa: $("inspectWcagAa"),
  inspectWcagAaa: $("inspectWcagAaa"),
  inspectSummary: $("inspectSummary"),

  // Palette Studio Tab
  palettePresetSelect: $("palettePresetSelect"),
  paletteCvdSelect: $("paletteCvdSelect"),
  paletteEditor: $("paletteEditor"),
  addColorBtn: $("addColorBtn"),
  paletteCount: $("paletteCount"),
  sortHueBtn: $("sortHueBtn"),
  sortLumBtn: $("sortLumBtn"),

  statusSummaryBox: $("statusSummaryBox"),
  statusBadge: $("statusBadge"),
  statusTitle: $("statusTitle"),
  statusDesc: $("statusDesc"),
  correctionCard: $("correctionCard"),
  correctedSwatchesPreview: $("correctedSwatchesPreview"),

  // Hex Picker
  hexPickerModal: $("hexPickerModal"),
  closeHexPickerBtn: $("closeHexPickerBtn"),
  hexGridContainer: $("hexGridContainer"),
  hexPickerInfo: $("hexPickerInfo"),
  hexPickerColorName: $("hexPickerColorName"),
  hexPickerLuminance: $("hexPickerLuminance"),
  
  applyFixBtn: $("applyFixBtn"),
  undoFixBtn: $("undoFixBtn"),
  exportBtn: $("exportBtn"),
  
  // Image Actions
  imageActionsWrapper: $("imageActionsWrapper"),
  downloadFixedImageBtn: $("downloadFixedImageBtn"),
  canvasFixed: $("canvasFixed"),
  fixedPictureCard: $("fixedPictureCard"),

  // Matrix Tab
  matrixTableWrapper: $("matrixTableWrapper"),

  // Export Modal & Toast
  exportModal: $("exportModal"),
  closeExportBtn: $("closeExportBtn"),
  exportTabs: document.querySelectorAll(".export-tab"),
  exportCodeText: $("exportCodeText"),
  copyExportBtn: $("copyExportBtn"),
  toastNotification: $("toastNotification"),
  toastMsg: $("toastMsg")
};

// Toast Notification
function showToast(msg) {
  els.toastMsg.textContent = msg;
  els.toastNotification.classList.remove("hidden");
  setTimeout(() => els.toastNotification.classList.add("hidden"), 2200);
}

// Theme
function initTheme() {
  document.body.className = state.theme === "dark" ? "dark-theme" : "light-theme";
  els.themeIconSun.classList.toggle("hidden", state.theme !== "dark");
  els.themeIconMoon.classList.toggle("hidden", state.theme === "dark");
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("colorsafe_theme", state.theme);
  initTheme();
}

// Tab Switcher
function switchTab(tabId) {
  state.activeTab = tabId;
  els.navTabs.forEach(btn => {
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active);
  });
  els.tabPanels.forEach(panel => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  if (tabId === "matrixTab") renderDistanceMatrix();
  if (tabId === "paletteTab") renderPaletteStudio();
}

// Image Loading & Simulation
function processImage(img) {
  state.image = img;
  els.imageCanvasWrapper.classList.remove("hidden");

  const maxDim = 1200;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  els.imageDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;

  [els.canvasOriginal, els.canvasSimulated, els.canvasFixed].forEach(c => {
    c.width = width;
    c.height = height;
  });
  
  els.fixedPictureCard.classList.add("hidden");
  state.fixedImageData = null;

  const ctxOriginal = els.canvasOriginal.getContext("2d", { willReadFrequently: true });
  ctxOriginal.drawImage(img, 0, 0, width, height);
  state.imageData = ctxOriginal.getImageData(0, 0, width, height);

  updateImageSimulation();

  // Auto-inspect center pixel on image load
  inspectPixel(Math.round(width / 2), Math.round(height / 2));
}

function updateImageSimulation() {
  const sourceData = state.fixedImageData || state.imageData;
  if (!sourceData) return;

  const cvdType = state.imageCvd === "all" ? "protanopia" : state.imageCvd;
  const cvdNames = {
    protanopia: "Red Vision Friend View",
    deuteranopia: "Green Vision Friend View",
    tritanopia: "Blue Vision Friend View",
    achromatopsia: "Monochrome Friend View"
  };

  els.activeCvdLabel.textContent = cvdNames[cvdType] || "Simulated Vision View";
  els.labelRight.textContent = cvdNames[cvdType] || "Simulated Vision View";

  const width = sourceData.width;
  const height = sourceData.height;
  const simulated = new ImageData(width, height);
  const src = sourceData.data;
  const dest = simulated.data;

  for (let i = 0; i < src.length; i += 4) {
    const alpha = src[i + 3];
    if (alpha === 0) {
      dest[i + 3] = 0;
      continue;
    }

    const rgb = { r: src[i], g: src[i + 1], b: src[i + 2] };
    const simRgb = CVD.simulate(rgb, cvdType);

    dest[i] = simRgb.r;
    dest[i + 1] = simRgb.g;
    dest[i + 2] = simRgb.b;
    dest[i + 3] = alpha;
  }

  state.simulatedData = simulated;
  const ctxSimulated = els.canvasSimulated.getContext("2d");
  ctxSimulated.putImageData(simulated, 0, 0);

  // Re-inspect current pixel if already inspected
  if (state.inspectedPixel) {
    inspectPixel(state.inspectedPixel.x, state.inspectedPixel.y);
  }
}

// Fun Sample Image Generators
function generateSampleImage(type) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext("2d");

  if (type === "castle") {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 350);
    skyGrad.addColorStop(0, "#87ceeb");
    skyGrad.addColorStop(1, "#fff0f5");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 800, 500);

    // Sun
    ctx.fillStyle = "#ffb700";
    ctx.beginPath(); ctx.arc(700, 80, 50, 0, Math.PI * 2); ctx.fill();

    // Grass
    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, 380, 800, 120);

    // Castle Base
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(250, 180, 300, 200);

    // Towers
    ctx.fillStyle = "#ff5252";
    ctx.fillRect(220, 120, 70, 260);
    ctx.fillRect(510, 120, 70, 260);

    // Roof Cone Towers
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath(); ctx.moveTo(210, 120); ctx.lineTo(255, 40); ctx.lineTo(300, 120); ctx.fill();
    ctx.beginPath(); ctx.moveTo(500, 120); ctx.lineTo(545, 40); ctx.lineTo(590, 120); ctx.fill();

    // Flag
    ctx.fillStyle = "#ff7b00";
    ctx.beginPath(); ctx.moveTo(255, 40); ctx.lineTo(290, 55); ctx.lineTo(255, 70); ctx.fill();

    // Door
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath(); ctx.roundRect(360, 280, 80, 100, [40, 40, 0, 0]); ctx.fill();

  } else if (type === "chart") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 800, 500);

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 24px Fredoka, sans-serif";
    ctx.fillText("Favorite Fruit Survey", 40, 50);

    const categories = [
      { name: "Apples", color: "#ef4444", val: 320 },
      { name: "Bananas", color: "#eab308", val: 260 },
      { name: "Blueberries", color: "#3b82f6", val: 380 },
      { name: "Kiwi", color: "#22c55e", val: 210 },
      { name: "Grapes", color: "#a855f7", val: 290 }
    ];

    categories.forEach((cat, idx) => {
      const x = 60 + idx * 140;
      const h = cat.val;
      const y = 410 - h;

      ctx.fillStyle = cat.color;
      ctx.beginPath(); ctx.roundRect(x, y, 90, h, [12, 12, 0, 0]); ctx.fill();

      ctx.fillStyle = "#475569";
      ctx.font = "bold 13px Outfit, sans-serif";
      ctx.fillText(cat.name, x - 5, 440);
    });

  } else if (type === "heatmap") {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 800, 500);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Fredoka, sans-serif";
    ctx.fillText("World Heatmap Grid", 40, 45);

    const colors = ["#1e3a8a", "#0284c7", "#10b981", "#eab308", "#f97316", "#ef4444"];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 14; c++) {
        const colorIdx = Math.floor(Math.sin(r * 0.5 + c * 0.4) * 2.5 + 2.5) % colors.length;
        ctx.fillStyle = colors[colorIdx];
        ctx.beginPath(); ctx.roundRect(50 + c * 50, 70 + r * 48, 44, 42, 6); ctx.fill();
      }
    }

  } else { // Palette Grid
    const swatches = [
      "#ff5252", "#ff7b00", "#ffb700", "#10b981",
      "#0284c7", "#6366f1", "#8b5cf6", "#ec4899",
      "#14b8a6", "#f43f5e", "#84cc16", "#64748b"
    ];

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 800, 500);

    swatches.forEach((hex, idx) => {
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      ctx.fillStyle = hex;
      ctx.beginPath(); ctx.roundRect(50 + col * 175, 30 + row * 145, 155, 125, 16); ctx.fill();
    });
  }

  const img = new Image();
  img.onload = () => processImage(img);
  img.src = canvas.toDataURL();
}

// Pixel Inspector
function inspectPixel(x, y) {
  if (!state.imageData || !state.simulatedData) return;

  const w = state.imageData.width;
  const h = state.imageData.height;
  const clampedX = Math.max(0, Math.min(w - 1, Math.round(x)));
  const clampedY = Math.max(0, Math.min(h - 1, Math.round(y)));
  state.inspectedPixel = { x: clampedX, y: clampedY };

  const idx = (clampedY * w + clampedX) * 4;

  const origRgb = {
    r: state.imageData.data[idx],
    g: state.imageData.data[idx + 1],
    b: state.imageData.data[idx + 2]
  };

  const simRgb = {
    r: state.simulatedData.data[idx],
    g: state.simulatedData.data[idx + 1],
    b: state.simulatedData.data[idx + 2]
  };

  const deltaE = ColorMath.deltaE76(origRgb, simRgb);
  const contrastWhite = ColorMath.contrastRatio(origRgb, { r: 255, g: 255, b: 255 });
  const contrastBlack = ColorMath.contrastRatio(origRgb, { r: 0, g: 0, b: 0 });
  const maxContrast = Math.max(contrastWhite, contrastBlack);

  els.inspectedPosBadge.textContent = `Pixel: ${clampedX}, ${clampedY}`;

  const origName = ColorMath.getColorName(origRgb);
  const simName = ColorMath.getColorName(simRgb);
  const origHex = ColorMath.rgbToHex(origRgb);
  const simHex = ColorMath.rgbToHex(simRgb);

  els.inspectOriginalSwatch.style.backgroundColor = origHex;
  els.inspectOriginalHex.textContent = origHex;
  els.inspectOriginalRgb.textContent = origName;

  els.inspectSimulatedSwatch.style.backgroundColor = simHex;
  els.inspectSimulatedHex.textContent = simHex;
  els.inspectSimulatedRgb.textContent = simName;

  els.inspectDeltaE.textContent = deltaE.toFixed(1);
  
  let shiftText = "";
  let shiftIcon = "";

  if (deltaE < 2.0) {
    els.inspectDeltaLabel.className = "sub-badge badge-playful badge-slate";
    els.inspectDeltaLabel.textContent = "Looks the same";
    shiftText = "Small shift — most people with this vision type can still identify this color."; 
    shiftIcon = "—";
  } else if (deltaE < 15.0) {
    els.inspectDeltaLabel.className = "sub-badge badge-playful badge-purple";
    els.inspectDeltaLabel.textContent = "Slightly different";
    shiftText = "Moderate shift — the color tone changes slightly but may still be recognizable."; 
    shiftIcon = "≈";
  } else {
    els.inspectDeltaLabel.className = "sub-badge badge-playful badge-yellow";
    els.inspectDeltaLabel.textContent = "Very different";
    shiftText = "Significant shift — this color looks very different and may cause confusion."; 
    shiftIcon = "!";
  }

  els.inspectContrast.textContent = `${maxContrast.toFixed(1)} : 1`;
  els.inspectWcagAa.className = `badge-playful ${maxContrast >= 4.5 ? "badge-green" : "badge-red"}`;
  els.inspectWcagAa.textContent = maxContrast >= 4.5 ? "Readable" : "Hard to Read";

  els.inspectWcagAaa.className = `badge-playful ${maxContrast >= 7.0 ? "badge-green" : "badge-slate"}`;
  els.inspectWcagAaa.textContent = maxContrast >= 7.0 ? "Very Readable" : "AAA Low";

  const readableText = maxContrast >= 4.5 ? "Readable" : "Hard to read";

  const cvdNames = {
    protanopia: "Red-Weak Vision",
    deuteranopia: "Green-Weak Vision",
    tritanopia: "Blue-Yellow Vision",
    achromatopsia: "Grayscale Vision"
  };
  const cvdType = state.imageCvd === "all" ? "protanopia" : state.imageCvd;

  if (els.inspectSummary) {
    els.inspectSummary.innerHTML = `
      <div style="font-size: 14px; line-height: 1.6; color: var(--text-main);">
        <strong>📍 You clicked on:</strong> ${origName} (${origHex}) <br>
        <strong>👀 For someone with ${cvdNames[cvdType] || 'Simulated Vision'}, this looks like:</strong> ${simName} (${simHex}) <br>
        <strong>Difference:</strong> ${shiftIcon} ${shiftText} <br>
        <strong>Text readability:</strong> White/Black text on this color is ${readableText} (${maxContrast.toFixed(1)}:1)
      </div>
    `;
    els.inspectSummary.classList.remove("hidden");
  }
}

function recolorImageWithFixes(changes) {
  if (!state.imageData) return;
  
  // Create fixed image data
  const fixedImageData = new ImageData(
    new Uint8ClampedArray(state.imageData.data),
    state.imageData.width,
    state.imageData.height
  );
  
  const src = fixedImageData.data;
  const activeChanges = changes.filter(c => c.fixed && c.angle !== 0);
  if (activeChanges.length === 0) return;
  
  for (let i = 0; i < src.length; i += 4) {
    if (src[i + 3] === 0) continue; // Skip transparent
    
    const pixel = { r: src[i], g: src[i+1], b: src[i+2] };
    
    // Find closest changed color
    let bestChange = null;
    let minDelta = Infinity;
    
    for (const change of activeChanges) {
      const delta = ColorMath.deltaE76(pixel, change.original);
      if (delta < 30) { // Threshold for color grouping
        if (delta < minDelta) {
          minDelta = delta;
          bestChange = change;
        }
      }
    }
    
    if (bestChange) {
      const originalLuminance = ColorMath.relativeLuminance(pixel);
      let newPixel = ColorMath.rotateHue(pixel, bestChange.angle);
      newPixel = ColorMath.restoreLuminance(newPixel, originalLuminance);
      
      src[i] = newPixel.r;
      src[i+1] = newPixel.g;
      src[i+2] = newPixel.b;
    }
  }
  
  state.fixedImageData = fixedImageData;
  const ctxFixed = els.canvasFixed.getContext("2d");
  ctxFixed.putImageData(fixedImageData, 0, 0);
  
  els.fixedPictureCard.classList.remove("hidden");
  updateImageSimulation();
  els.imageActionsWrapper.classList.remove("hidden");
  showToast("Image recolored perfectly!");
}

// Extract Palette
function extractPaletteFromImage() {
  if (!state.imageData) return;

  const data = state.imageData.data;
  const colorMap = {};
  const step = 8 * 4;

  for (let i = 0; i < data.length; i += step) {
    if (data[i + 3] < 128) continue;
    const r = Math.round(data[i] / 24) * 24;
    const g = Math.round(data[i + 1] / 24) * 24;
    const b = Math.round(data[i + 2] / 24) * 24;
    const key = `${r},${g},${b}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  const sorted = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return { r, g, b };
    });

  if (sorted.length >= 2) {
    state.palette = sorted;
    showToast("Extracted 6 key colors to Palette Helper");
    switchTab("paletteTab");
  }
}

// Palette Studio Rendering
function renderPaletteStudio() {
  els.paletteEditor.innerHTML = "";

  state.palette.forEach((color, index) => {
    const row = document.createElement("div");
    row.className = "swatch-row-playful";

    const hex = ColorMath.rgbToHex(color);
    const colorName = ColorMath.getColorName(color);
    const luminance = ColorMath.getLuminancePercent(color);
    const contrastWhite = ColorMath.contrastRatio(color, { r: 255, g: 255, b: 255 });
    const contrastBlack = ColorMath.contrastRatio(color, { r: 0, g: 0, b: 0 });
    const bestContrast = Math.max(contrastWhite, contrastBlack);
    const passesAA = bestContrast >= 4.5;
    
    row.innerHTML = `
      <div class="swatch-color-box pattern-swatch" style="background-color: ${hex};" aria-hidden="true"></div>
      <div class="swatch-details">
        <button class="btn-playful btn-soft open-hex-picker-btn" data-idx="${index}" style="width:100%; text-align:left; padding: 6px 12px;">
          ${colorName}
        </button>
        <div class="luminance-text">Brightness: ${luminance}%</div>
      </div>
      <div class="contrast-badge-box">
        <span class="badge-playful ${passesAA ? 'badge-green' : 'badge-yellow'}">
          ${passesAA ? 'Readable' : 'Hard to read'}
        </span>
      </div>
      <button class="remove-swatch-btn" data-remove="${index}" title="Remove" aria-label="Remove color">×</button>
    `;

    els.paletteEditor.appendChild(row);
  });

  els.paletteCount.textContent = `${state.palette.length} / 16 colors`;
  analyzePaletteStudio();
}

function analyzePaletteStudio() {
  const pairs = [];
  const problematicSet = new Set();

  for (let i = 0; i < state.palette.length; i++) {
    for (let j = i + 1; j < state.palette.length; j++) {
      const minDist = CVD.minimumSimulatedDistance(
        state.palette[i],
        state.palette[j],
        state.paletteCvd
      );

      const isCollision = minDist.deltaE < state.threshold;
      pairs.push({ i, j, deltaE: minDist.deltaE, type: minDist.type, isCollision });

      if (isCollision) {
        problematicSet.add(i);
        problematicSet.add(j);
      }
    }
  }

  const problematicIndices = [...problematicSet];

  if (problematicIndices.length === 0) {
    els.statusSummaryBox.className = "status-card-playful";
    els.statusBadge.className = "badge-playful badge-green";
    els.statusBadge.textContent = "All Clear";
    els.statusTitle.textContent = "Your colors look awesome";
    els.statusDesc.textContent = `All colors are easy to tell apart for everyone.`;
    els.correctionCard.classList.add("hidden");
  } else {
    els.statusSummaryBox.className = "status-card-playful warning";
    els.statusBadge.className = "badge-playful badge-yellow";
    els.statusBadge.textContent = `${problematicIndices.length} Problem Colors`;
    els.statusTitle.textContent = "Some colors are hard to tell apart";
    els.statusDesc.textContent = `These might get confused by people with your selected vision friend. Click Magic Fix to tweak them.`;

    const fixResult = CVD.correctPalette(
      state.palette,
      state.paletteCvd,
      state.threshold,
      problematicIndices
    );

    state.correctedPalette = fixResult.corrected;
    state.fixChanges = fixResult.changes;
    renderCorrectedPreview(fixResult);
    els.correctionCard.classList.remove("hidden");
  }
}

function renderCorrectedPreview(fixResult) {
  els.correctedSwatchesPreview.innerHTML = "";
  fixResult.corrected.forEach((color, idx) => {
    const change = fixResult.changes.find(c => c.index === idx);
    const hex = ColorMath.rgbToHex(color);

    const chip = document.createElement("div");
    chip.className = "corrected-chip";
    chip.style.width = "100%";
    chip.style.textAlign = "left";
    
    if (change && change.fixed) {
      chip.innerHTML = `
        <div style="padding: 6px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          <div class="mini-swatch pattern-swatch" style="background-color: ${ColorMath.rgbToHex(change.original)};"></div>
          ${ColorMath.getColorName(change.original)} 
          <span>→</span>
          <div class="mini-swatch pattern-swatch" style="background-color: ${hex};"></div>
          <strong>${ColorMath.getColorName(color)}</strong>
          <span style="color:var(--text-muted); font-size: 12px; margin-left: 8px;">(shifted color tone)</span>
        </div>
      `;
      els.correctedSwatchesPreview.appendChild(chip);
    }
  });
}

// Distance Matrix
function renderDistanceMatrix() {
  const n = state.palette.length;
  let html = `<table class="matrix-table"><thead><tr><th>Color</th>`;

  for (let i = 0; i < n; i++) {
    const hex = ColorMath.rgbToHex(state.palette[i]);
    const name = ColorMath.getColorName(state.palette[i]);
    html += `<th><div class="matrix-cell-swatch"><span class="mini-swatch pattern-swatch" style="background:${hex}"></span> ${name}</div></th>`;
  }
  html += `</tr></thead><tbody>`;

  for (let i = 0; i < n; i++) {
    const hexI = ColorMath.rgbToHex(state.palette[i]);
    const nameI = ColorMath.getColorName(state.palette[i]);
    html += `<tr><th><div class="matrix-cell-swatch"><span class="mini-swatch pattern-swatch" style="background:${hexI}"></span> ${nameI}</div></th>`;

    for (let j = 0; j < n; j++) {
      if (i === j) {
        html += `<td><span class="matrix-val val-self">—</span></td>`;
      } else {
        const minDist = CVD.minimumSimulatedDistance(state.palette[i], state.palette[j], state.paletteCvd);
        const delta = minDist.deltaE;
        const safe = delta >= state.threshold;
        html += `<td><span class="matrix-val ${safe ? 'val-safe' : 'val-warning'}">${safe ? 'Easy' : 'Hard'}</span></td>`;
      }
    }
    html += `</tr>`;
  }

  html += `</tbody></table>`;
  els.matrixTableWrapper.innerHTML = html;
}

function formatExportCode(format) {
  const hexes = state.palette.map(ColorMath.rgbToHex);

  if (format === "hex") return hexes.join(", ");
  if (format === "css") return `:root {\n` + hexes.map((h, i) => `  --color-${i + 1}: ${h};`).join("\n") + `\n}`;
  if (format === "json") return JSON.stringify(hexes, null, 2);
  if (format === "tailwind") {
    const obj = {};
    hexes.forEach((h, i) => obj[`color-${i+1}`] = h);
    return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(obj, null, 8)}\n    }\n  }\n}`;
  }
}

// Hex Picker Logic
let activePickerIdx = null;

function initHexPicker() {
  els.hexGridContainer.innerHTML = "";
  
  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if(t < 0) t += 1; if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  for (let r = 0; r < 11; r++) {
    let y = r - 5;
    let rowLen = 11 - Math.abs(y);
    const rowEl = document.createElement("div");
    rowEl.className = "hex-row";
    
    for (let i = 0; i < rowLen; i++) {
      let x = i - (rowLen - 1) / 2;
      let dy = y * Math.sqrt(3)/2;
      let dx = x;
      let dist = Math.sqrt(dx*dx + dy*dy);
      let angle = Math.atan2(dy, dx);
      let hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
      
      let sat = dist === 0 ? 0 : Math.min(100, (dist / 5) * 100 + 20);
      let lightness = dist === 0 ? 100 : Math.max(20, 100 - (dist / 5) * 60);
      
      let rgb = hslToRgb(hue, sat, lightness);
      let hex = ColorMath.rgbToHex(rgb);
      let name = ColorMath.getColorName(rgb);
      
      const cell = document.createElement("button");
      cell.className = "hex-cell pattern-swatch";
      cell.style.backgroundColor = hex;
      cell.setAttribute("aria-label", name);
      
      const showInfo = () => {
        const lum = ColorMath.getLuminancePercent(rgb);
        els.hexPickerColorName.textContent = name;
        els.hexPickerColorName.style.backgroundColor = hex;
        els.hexPickerColorName.style.color = lum > 50 ? "#000" : "#fff";
        els.hexPickerLuminance.textContent = `Brightness: ${lum}%`;
        els.hexPickerInfo.classList.remove("hidden");
      };
      
      cell.addEventListener("mouseenter", showInfo);
      cell.addEventListener("focus", showInfo);
      
      cell.addEventListener("click", () => {
        if (activePickerIdx !== null) {
          state.palette[activePickerIdx] = rgb;
          analyzePaletteStudio();
          renderPaletteStudio();
          closeHexPicker();
        }
      });
      
      rowEl.appendChild(cell);
    }
    els.hexGridContainer.appendChild(rowEl);
  }
  
  // Add Grayscale row
  const grayRow = document.createElement("div");
  grayRow.className = "hex-row";
  grayRow.style.marginTop = "12px";
  for (let i = 0; i < 11; i++) {
    let l = 100 - (i * 10);
    let rgb = hslToRgb(0, 0, l);
    let hex = ColorMath.rgbToHex(rgb);
    let name = ColorMath.getColorName(rgb);
    
    const cell = document.createElement("button");
    cell.className = "hex-cell pattern-swatch";
    cell.style.backgroundColor = hex;
    cell.setAttribute("aria-label", name);
    
    const showInfo = () => {
      els.hexPickerColorName.textContent = name;
      els.hexPickerColorName.style.backgroundColor = hex;
      els.hexPickerColorName.style.color = l > 50 ? "#000" : "#fff";
      els.hexPickerLuminance.textContent = `Brightness: ${ColorMath.getLuminancePercent(rgb)}%`;
      els.hexPickerInfo.classList.remove("hidden");
    };
    
    cell.addEventListener("mouseenter", showInfo);
    cell.addEventListener("focus", showInfo);
    
    cell.addEventListener("click", () => {
      if (activePickerIdx !== null) {
        state.palette[activePickerIdx] = rgb;
        analyzePaletteStudio();
        renderPaletteStudio();
        closeHexPicker();
      }
    });
    
    grayRow.appendChild(cell);
  }
  els.hexGridContainer.appendChild(grayRow);

  els.closeHexPickerBtn.addEventListener("click", closeHexPicker);
}

function openHexPicker(idx) {
  activePickerIdx = Number(idx);
  els.hexPickerModal.classList.remove("hidden");
  els.hexGridContainer.focus();
}

function closeHexPicker() {
  activePickerIdx = null;
  els.hexPickerModal.classList.add("hidden");
}

// Attach Event Listeners
function setupEvents() {
  els.themeToggle.addEventListener("click", toggleTheme);

  els.navTabs.forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Vision Friend Pills Selector
  els.visionPills.forEach(pill => {
    pill.addEventListener("click", () => {
      els.visionPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.imageCvd = pill.dataset.cvd;
      updateImageSimulation();
    });
  });

  // Image Upload
  els.imageInput.addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) processImageFile(e.target.files[0]);
  });

  els.dropzone.addEventListener("dragover", e => {
    e.preventDefault();
    els.dropzone.classList.add("dragover");
  });

  els.dropzone.addEventListener("dragleave", () => els.dropzone.classList.remove("dragover"));

  els.dropzone.addEventListener("drop", e => {
    e.preventDefault();
    els.dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  });

  function processImageFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please choose a valid picture.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      processImage(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // Sample Images
  els.sampleChips.forEach(chip => {
    chip.addEventListener("click", () => generateSampleImage(chip.dataset.sample));
  });

  // Click Viewport Canvases to Inspect Pixel
  function attachCanvasClickListener(canvas) {
    if (!canvas) return;
    canvas.addEventListener("click", e => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      inspectPixel(clickX * scaleX, clickY * scaleY);
    });
  }

  attachCanvasClickListener(els.canvasOriginal);
  attachCanvasClickListener(els.canvasSimulated);

  // Copy Hex Buttons in Color Inspector
  els.copyOrigHexBtn.addEventListener("click", async () => {
    const hex = els.inspectOriginalHex.textContent;
    try {
      await navigator.clipboard.writeText(hex);
      showToast(`Copied ${hex} to clipboard`);
    } catch {
      alert(`Copied ${hex}`);
    }
  });

  els.copySimHexBtn.addEventListener("click", async () => {
    const hex = els.inspectSimulatedHex.textContent;
    try {
      await navigator.clipboard.writeText(hex);
      showToast(`Copied ${hex} to clipboard`);
    } catch {
      alert(`Copied ${hex}`);
    }
  });

  // Extract Palette & Download
  els.extractPaletteBtn.addEventListener("click", extractPaletteFromImage);

  els.downloadSimulatedBtn.addEventListener("click", () => {
    if (!els.canvasSimulated) return;
    const link = document.createElement("a");
    link.download = `colorsafe-picture-${state.imageCvd}.png`;
    link.href = els.canvasSimulated.toDataURL();
    link.click();
    showToast("Saved picture to downloads");
  });

  // Palette Studio Events
  els.palettePresetSelect.addEventListener("change", e => {
    const presetKey = e.target.value;
    if (state.presets[presetKey]) {
      state.palette = state.presets[presetKey].map(c => ({ ...c }));
      renderPaletteStudio();
      showToast("Loaded ready palette");
    }
  });

  els.paletteCvdSelect.addEventListener("change", e => {
    state.paletteCvd = e.target.value;
    analyzePaletteStudio();
  });

  els.addColorBtn.addEventListener("click", () => {
    if (state.palette.length >= 16) {
      alert("Maximum 16 colors in palette studio.");
      return;
    }
    state.palette.push({ r: 128, g: 128, b: 128 });
    renderPaletteStudio();
  });

  els.sortHueBtn.addEventListener("click", () => {
    state.palette.sort((a, b) => ColorMath.rgbToHsv(a).h - ColorMath.rgbToHsv(b).h);
    renderPaletteStudio();
    showToast("Sorted colors by Rainbow");
  });

  els.sortLumBtn.addEventListener("click", () => {
    state.palette.sort((a, b) => ColorMath.relativeLuminance(a) - ColorMath.relativeLuminance(b));
    renderPaletteStudio();
    showToast("Sorted colors by Brightness");
  });



  els.paletteEditor.addEventListener("click", e => {
    const btn = e.target.closest(".open-hex-picker-btn");
    if (btn) {
      const idx = btn.dataset.idx;
      openHexPicker(idx);
    }
  });

  els.paletteEditor.addEventListener("click", e => {
    if (e.target.dataset.remove !== undefined) {
      const idx = Number(e.target.dataset.remove);
      if (state.palette.length <= 2) {
        alert("At least 2 colors required.");
        return;
      }
      state.palette.splice(idx, 1);
      renderPaletteStudio();
    }
  });

  // Apply Magic Fix
  els.applyFixBtn.addEventListener("click", () => {
    if (!state.correctedPalette.length) return;
    state.previousPalette = state.palette.map(c => ({ ...c }));
    state.palette = state.correctedPalette.map(c => ({ ...c }));
    els.undoFixBtn.disabled = false;
    
    if (state.imageData && state.fixChanges) {
      recolorImageWithFixes(state.fixChanges);
    }
    
    renderPaletteStudio();
    showToast("Applied Fixed Colors");
  });

  els.undoFixBtn.addEventListener("click", () => {
    if (!state.previousPalette) return;
    state.palette = state.previousPalette.map(c => ({ ...c }));
    state.previousPalette = null;
    els.undoFixBtn.disabled = true;
    
    // Hide fixed image
    state.fixedImageData = null;
    els.fixedPictureCard.classList.add("hidden");
    els.imageActionsWrapper.classList.add("hidden");
    updateImageSimulation();
    
    renderPaletteStudio();
    showToast("Restored original colors");
  });

  if (els.downloadFixedImageBtn) {
    els.downloadFixedImageBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = "ColorSafe_Fixed.png";
      // Download from fixed canvas
      link.href = els.canvasFixed.toDataURL();
      link.click();
    });
  }

  // Export Modal Events
  let activeFormat = "hex";

  els.exportBtn.addEventListener("click", () => {
    els.exportCodeText.value = formatExportCode(activeFormat);
    els.exportModal.showModal();
  });

  els.closeExportBtn.addEventListener("click", () => els.exportModal.close());

  els.exportTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      els.exportTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFormat = tab.dataset.format;
      els.exportCodeText.value = formatExportCode(activeFormat);
    });
  });

  els.copyExportBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(els.exportCodeText.value);
      showToast("Copied colors to clipboard");
      els.exportModal.close();
    } catch {
      alert("Copied colors!");
    }
  });

  // Reset All
  els.resetBtn.addEventListener("click", () => {
    state.palette = [
      { r: 255, g: 82, b: 82 },
      { r: 16, g: 185, b: 129 },
      { r: 2, g: 132, b: 199 },
      { r: 245, g: 158, b: 11 },
      { r: 139, g: 92, b: 246 }
    ];
    state.threshold = 20;
    
    // Reset vision pills
    els.visionPills.forEach(p => p.classList.toggle("active", p.dataset.cvd === "all"));
    
    generateSampleImage("castle");
    renderPaletteStudio();
    showToast("Started fresh");
  });
}

// Boot Application
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupEvents();
  renderPaletteStudio();
  initHexPicker();
  generateSampleImage("castle");
});
