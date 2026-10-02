# ColorSafe — Color Vision & Accessibility Studio

ColorSafe is an interactive, client-side web application designed to test pictures and color palettes for color vision deficiency (CVD) accessibility. It allows designers, developers, students, and users to see how images and color choices appear to people with different types of color blindness and automatically fix color collisions.

---

## Features

- **Side-by-Side Picture Checker**: Compare your original picture directly next to simulated vision views (Red-blind Protanopia, Green-blind Deuteranopia, Blue-blind Tritanopia, and Monochrome).
- **Interactive Pixel Inspector**: Click anywhere on a picture to inspect exact RGB/Hex colors, CIE76 Delta E perceptual distance shifts, and WCAG text contrast ratios.
- **Palette Accessibility Helper**: Create, edit, and evaluate color palettes against color vision algorithms with customizable Delta E sensitivity sliders.
- **Magic Auto-Fix**: Automatically tweak color hues using luminance-preserving HSV rotation to separate colliding colors while keeping them distinct and visually appealing.
- **Pairwise Distance Matrix**: Grid view displaying exact perceptual distances (Delta E) between every color combination in your palette.
- **Multi-Format Export**: Export palettes in Hex codes, CSS Custom Properties, JSON arrays, or Tailwind CSS configuration snippets.
- **Light & Dark Themes**: Toggle between light mode and dark theme.

---

## How to Clone and Run

### Prerequisites

You only need **Git** and any simple local web server (such as **Python 3** or **Node.js**). No npm installation or build step is required.

### Step 1: Clone the Repository

Open your terminal or command prompt and run:

```bash
git clone https://github.com/khushi-dudhalkar/ColorSafe_Web.git
```

### Step 2: Navigate to the Project Directory

```bash
cd ColorSafe_Web
```

### Step 3: Start a Local Server

#### Option A: Using Python 3 (Recommended)
```bash
python3 -m http.server 8000
```

#### Option B: Using Node.js / npx
```bash
npx serve .
```

#### Option C: Using PHP
```bash
php -S localhost:8000
```

### Step 4: Open in Your Browser

Open your browser and go to:
```text
http://localhost:8000
```

---

## Computer Graphics & Color Science

ColorSafe uses colorimetric algorithms to simulate and correct colors:

- **RGB / LMS Matrix Transformation**: Transforms sRGB colors into Hunt-Pointer-Estevez LMS cone response space using linear matrix multiplication:
  $$\begin{bmatrix} L \\ M \\ S \end{bmatrix} = M_{\text{RGB} \to \text{LMS}} \begin{bmatrix} R_{\text{linear}} \\ G_{\text{linear}} \\ B_{\text{linear}} \end{bmatrix}$$
- **Linear sRGB Gamma Correction**: Linearizes sRGB values before matrix operations and applies inverse gamma transformation (1 / 2.4) for color output.
- **CVD Simulation Models**: Implements standard Bienot and Machado et al. projection matrices for Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.
- **CIE76 Delta E Color Distance**: Converts colors to CIELAB space under D65 standard illuminant reference and measures perceptual distance:
  $$\Delta E_{76} = \sqrt{(L_1^* - L_2^*)^2 + (a_1^* - a_2^*)^2 + (b_1^* - b_2^*)^2}$$
- **WCAG 2.1 Contrast Ratio**: Calculates relative luminance to verify AA (4.5:1) and AAA (7:1) text readability.

---

## Project Structure

```text
ColorSafe_Web/
├── index.html        # Main application HTML structure
├── README.md         # Documentation & guide
├── .gitignore        # Git ignore rules
├── css/
│   └── styles.css    # Responsive design system & themes
└── js/
    ├── color.js      # Color science math (XYZ, Lab, LMS, Delta E76, WCAG)
    ├── cvd.js        # CVD simulation matrices & auto-fix engine
    └── app.js        # UI events, canvas rendering & studio logic
```

---

## Privacy

All processing happens **100% locally in your browser** using HTML5 Canvas. No images or color data are ever uploaded to any server.

---

## License

Distributed under the MIT License.
