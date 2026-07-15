# Quantum Calc 🌌

A premium, high-fidelity browser-based calculation interface with a responsive glassmorphic design, operator chaining, and complete keyboard integration. This project was developed for the **Oasis Infobyte Web Development & Designing Internship** (Level 2, Task 1).

---

## ✨ Features

- **🔮 Glassmorphic UI**: High-end styling using CSS `backdrop-filter` blurs, subtle glowing borders, radial gradient background decorations, and responsive interactive transitions on button hover and clicks.
- **⌨️ Hardware Keyboard Bindings**: Complete physical keyboard support mapping numeric digits, mathematical operations, backspace, clear, and equals keys to their counterpart on-screen elements. Keystrokes animate the virtual buttons in real-time.
- **🔗 Operator Chaining**: Perform continuous calculations (e.g., `12 * 5 + 40 - 2`) without needing to press the equals button after every operator.
- **🛡️ Input Validation**: Protects against division by zero errors, formats large values with proper decimal representations, and caps input length to prevent layout overflows.
- **🧼 Floating-Point Correction**: Uses a custom rounding precision layer to eliminate common floating-point bugs inherent to binary arithmetic (such as resolving `0.1 + 0.2` perfectly to `0.3`).

---

## 🎹 Keyboard Mappings

| Keyboard Key | Action / Function | Equivalent Button |
| :--- | :--- | :--- |
| `0` - `9` | Input Numeric Digits | `0` - `9` |
| `.` | Input Decimal | `.` |
| `+` | Addition Operator | `+` |
| `-` | Subtraction Operator | `−` |
| `*` | Multiplication Operator | `×` |
| `/` | Division Operator | `÷` |
| `%` | Percentage Conversion | `%` |
| `Enter` or `=` | Calculate Result | `=` |
| `Backspace` | Delete Last Digit | `⌫` |
| `Escape` or `C` / `c` | Clear Calculator | `C` |

---

## 📂 Project Structure

```text
OIBSIP-WEB DEVELOPMENT & DESIGNING-Level2Task1-calculator/
│
├── index.html     # Semantic structure, FontAwesome icons, fonts, and responsive grid layout.
├── styles.css     # CSS Custom properties, glassmorphic themes, and press/active state key animations.
├── script.js     # State management, keyboard listeners, formatting engines, and math routines.
└── README.md      # Documentation.
```

---

## 🚀 How to Run Locally

Since this app is built purely using standard web technologies (**HTML5, Vanilla CSS3, and ES6 Javascript**), it has no heavy dependencies and doesn't require any compilation.

1. **Clone or Download** this repository.
2. Open the project folder on your local machine.
3. Open `index.html` directly in any web browser (Chrome, Firefox, Safari, Edge), or serve it locally using a development server tool like VS Code's **Live Server** extension, or run Python's built-in server:
   ```bash
   python -m http.server 8000
   ```
4. Navigate to `http://localhost:8000` in your browser.

---

## 🎨 Tech Stack & Libraries Used

- **HTML5**: Structured semantic markers.
- **CSS3 (Vanilla)**: Grid alignments, Flexbox layouts, Custom Properties, Glassmorphism, animations, and typography layers.
- **JavaScript (ES6)**: Event delegation, DOM manipulation, state routing, keyboard events, and mathematical calculations.
- **Outfit & Share Tech Mono**: Premium typography imported from [Google Fonts](https://fonts.google.com/).
- **FontAwesome**: Modern icons for buttons and badges.
