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
    { r: 16, g: 185, b: 129 },  // Emerald Mint
    { r: 2, g: 132, b: 199 },   // Sky Blue
    { r: 245, g: 158, b: 11 },  // Sunny Yellow
    { r: 139, g: 92, b: 246 }   // Purple Blossom
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

  // Palette Studio Tab
  palettePresetSelect: $("palettePresetSelect"),
  paletteCvdSelect: $("paletteCvdSelect"),
  paletteEditor: $("paletteEditor"),
  addColorBtn: $("addColorBtn"),
  paletteCount: $("paletteCount"),
  sortHueBtn: $("sortHueBtn"),
  sortLumBtn: $("sortLumBtn"),
  thresholdSlider: $("thresholdSlider"),
  thresholdVal: $("thresholdVal"),
  statusSummaryBox: $("statusSummaryBox"),
  statusBadge: $("statusBadge"),
  statusTitle: $("statusTitle"),
  statusDesc: $("statusDesc"),
  correctionCard: $("correctionCard"),
  correctedSwatchesPreview: $("correctedSwatchesPreview"),
  applyFixBtn: $("applyFixBtn"),
  undoFixBtn: $("undoFixBtn"),
  exportBtn: $("exportBtn"),

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

  [els.canvasOriginal, els.canvasSimulated].forEach(c => {
    c.width = width;
    c.height = height;
  });

  const ctxOriginal = els.canvasOriginal.getContext("2d", { willReadFrequently: true });
  ctxOriginal.drawImage(img, 0, 0, width, height);
  state.imageData = ctxOriginal.getImageData(0, 0, width, height);

  updateImageSimulation();

  // Auto-inspect center pixel on image load
  inspectPixel(Math.round(width / 2), Math.round(height / 2));
}

function updateImageSimulation() {
  if (!state.imageData) return;

  const cvdType = state.imageCvd === "all" ? "protanopia" : state.imageCvd;
  const cvdNames = {
    protanopia: "Red Vision Friend View",
    deuteranopia: "Green Vision Friend View",
    tritanopia: "Blue Vision Friend View",
    achromatopsia: "Monochrome Friend View"
  };

  els.activeCvdLabel.textContent = cvdNames[cvdType] || "Simulated Vision View";
  els.labelRight.textContent = cvdNames[cvdType] || "Simulated Vision View";

  const width = state.imageData.width;
  const height = state.imageData.height;
  const simulated = new ImageData(width, height);
  const src = state.imageData.data;
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

  els.inspectOriginalSwatch.style.backgroundColor = ColorMath.rgbToHex(origRgb);
  els.inspectOriginalHex.textContent = ColorMath.rgbToHex(origRgb);
  els.inspectOriginalRgb.textContent = `RGB(${origRgb.r}, ${origRgb.g}, ${origRgb.b})`;

  els.inspectSimulatedSwatch.style.backgroundColor = ColorMath.rgbToHex(simRgb);
  els.inspectSimulatedHex.textContent = ColorMath.rgbToHex(simRgb);
  els.inspectSimulatedRgb.textContent = `RGB(${simRgb.r}, ${simRgb.g}, ${simRgb.b})`;

  els.inspectDeltaE.textContent = deltaE.toFixed(1);
  
  if (deltaE < 2.0) {
    els.inspectDeltaLabel.className = "sub-badge badge-playful badge-slate";
    els.inspectDeltaLabel.textContent = "No shift";
  } else if (deltaE < 15.0) {
    els.inspectDeltaLabel.className = "sub-badge badge-playful badge-purple";
    els.inspectDeltaLabel.textContent = "Moderate shift";
  } else {
    els.inspectDeltaLabel.className = "sub-badge badge-playful badge-yellow";
    els.inspectDeltaLabel.textContent = "Significant shift";
  }

  els.inspectContrast.textContent = `${maxContrast.toFixed(1)} : 1`;
  els.inspectWcagAa.className = `badge-playful ${maxContrast >= 4.5 ? "badge-green" : "badge-red"}`;
  els.inspectWcagAa.textContent = maxContrast >= 4.5 ? "AA Pass" : "AA Low";

  els.inspectWcagAaa.className = `badge-playful ${maxContrast >= 7.0 ? "badge-green" : "badge-slate"}`;
  els.inspectWcagAaa.textContent = maxContrast >= 7.0 ? "AAA Pass" : "AAA Low";
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
    const contrastWhite = ColorMath.contrastRatio(color, { r: 255, g: 255, b: 255 });
    const contrastBlack = ColorMath.contrastRatio(color, { r: 0, g: 0, b: 0 });
    const bestContrast = Math.max(contrastWhite, contrastBlack);
    const passesAA = bestContrast >= 4.5;

    row.innerHTML = `
      <input type="color" class="swatch-input-color" value="${hex}" data-idx="${index}">
      <input type="text" class="swatch-input-hex" value="${hex}" data-hex-idx="${index}" maxlength="7">
      <div class="contrast-badge-box">
        <span class="badge-playful ${passesAA ? 'badge-green' : 'badge-yellow'}">
          ${bestContrast.toFixed(1)}:1 ${passesAA ? 'AA Pass' : 'Low Text'}
        </span>
      </div>
      <button class="remove-swatch-btn" data-remove="${index}" title="Remove">×</button>
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
    els.statusBadge.textContent = "Super Accessible";
    els.statusTitle.textContent = "Your colors look awesome";
    els.statusDesc.textContent = `All colors have clear perceptual separation (ΔE ≥ ${state.threshold}) under the selected vision test.`;
    els.correctionCard.classList.add("hidden");
  } else {
    els.statusSummaryBox.className = "status-card-playful warning";
    els.statusBadge.className = "badge-playful badge-yellow";
    els.statusBadge.textContent = `${problematicIndices.length} Colors Look Like Twins`;
    els.statusTitle.textContent = "Some colors are hard to tell apart";
    els.statusDesc.textContent = `${problematicIndices.length} colors look too similar for your selected vision friend. Click Magic Fix to tweak them.`;

    const fixResult = CVD.correctPalette(
      state.palette,
      state.paletteCvd,
      state.threshold,
      problematicIndices
    );

    state.correctedPalette = fixResult.corrected;
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
    chip.innerHTML = `
      <div class="chip-swatch" style="background-color: ${hex}"></div>
      <div class="chip-hex">${hex}</div>
      <div class="chip-note">${change ? (change.fixed ? `${change.angle > 0 ? '+' : ''}${change.angle}°` : 'Pattern') : 'Keep'}</div>
    `;
    els.correctedSwatchesPreview.appendChild(chip);
  });
}

// Distance Matrix
function renderDistanceMatrix() {
  const n = state.palette.length;
  let html = `<table class="matrix-table"><thead><tr><th>Color</th>`;

  for (let i = 0; i < n; i++) {
    const hex = ColorMath.rgbToHex(state.palette[i]);
    html += `<th><div class="matrix-cell-swatch"><span class="mini-swatch" style="background:${hex}"></span> C${i+1}</div></th>`;
  }
  html += `</tr></thead><tbody>`;

  for (let i = 0; i < n; i++) {
    const hexI = ColorMath.rgbToHex(state.palette[i]);
    html += `<tr><th><div class="matrix-cell-swatch"><span class="mini-swatch" style="background:${hexI}"></span> C${i+1}</div></th>`;

    for (let j = 0; j < n; j++) {
      if (i === j) {
        html += `<td><span class="matrix-val val-self">—</span></td>`;
      } else {
        const minDist = CVD.minimumSimulatedDistance(state.palette[i], state.palette[j], state.paletteCvd);
        const delta = minDist.deltaE;
        const safe = delta >= state.threshold;
        html += `<td><span class="matrix-val ${safe ? 'val-safe' : 'val-warning'}">${delta.toFixed(1)}</span></td>`;
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

  els.thresholdSlider.addEventListener("input", e => {
    state.threshold = Number(e.target.value);
    els.thresholdVal.textContent = `ΔE ${state.threshold}`;
    analyzePaletteStudio();
  });

  els.paletteEditor.addEventListener("input", e => {
    const colorIdx = e.target.dataset.idx;
    const hexIdx = e.target.dataset.hexIdx;

    if (colorIdx !== undefined) {
      const rgb = ColorMath.hexToRgb(e.target.value);
      if (rgb) {
        state.palette[Number(colorIdx)] = rgb;
        const hexInput = document.querySelector(`[data-hex-idx="${colorIdx}"]`);
        if (hexInput) hexInput.value = ColorMath.rgbToHex(rgb);
        analyzePaletteStudio();
      }
    } else if (hexIdx !== undefined) {
      const rgb = ColorMath.hexToRgb(e.target.value);
      if (rgb) {
        state.palette[Number(hexIdx)] = rgb;
        const picker = document.querySelector(`[data-idx="${hexIdx}"]`);
        if (picker) picker.value = ColorMath.rgbToHex(rgb);
        analyzePaletteStudio();
      }
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
    renderPaletteStudio();
    showToast("Applied Fixed Colors");
  });

  els.undoFixBtn.addEventListener("click", () => {
    if (!state.previousPalette) return;
    state.palette = state.previousPalette.map(c => ({ ...c }));
    state.previousPalette = null;
    els.undoFixBtn.disabled = true;
    renderPaletteStudio();
    showToast("Restored original colors");
  });

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
    state.imageCvd = "all";
    state.paletteCvd = "all";
    els.thresholdSlider.value = 20;
    els.thresholdVal.textContent = "ΔE 20";
    
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
  generateSampleImage("castle");
});
