# Smart Campus Lost & Found — PromptWars x YenTech Submission

**One-Line Pitch:** An AI-powered platform where students submit lost/found item reports with a photo, description, location, and time, and the system automatically identifies and explains likely matches with a confidence score — plus lets people search and browse reports.

---

## 🎨 Visual Design System

This application features a warm, human-centered retail-grade design system:

- **Four-Tier Brand Greens**: Deep Brand Green (`#1E5F4A`), Luminous Accent Green (`#2C8C63`), House Deep Green (`#16332B`), and Mint Wash (`#DCEEE5`).
- **Warm Neutral Canvas**: Off-white Cream (`#F3F1EA`) and Ceramic (`#EDEBE9`) background surfaces referencing warm physical material textures rather than harsh stark whites.
- **Ceremonial Status Gold**: Gold (`#E0A61B`) reserved strictly for high-status AI match confidence callouts and awards.
- **50px Universal Full-Pill Buttons**: All CTAs feature 50px pill curvature with active `scale(0.95)` press feedback.
- **Contextual Editorial Serif**: Integrates `Lora` editorial serif for hero headline accents paired with `Inter` and `Manrope`.

---

## 📌 Submission Overview & Metadata

- **Live Deployed Application**: [https://campusfind-six.vercel.app/](https://campusfind-six.vercel.app/)
- **GitHub Repository**: [https://github.com/Jagadish-s-naik/Campusfind](https://github.com/Jagadish-s-naik/Campusfind)
- **Chosen Vertical**: Smart Campus Infrastructure / Student Utility
- **Problem Statement**: Reconnecting lost items with owners on campus is inefficient due to fragmented descriptions, missing location details, and manual search overhead.
- **Core AI Solution**: Uses Google Gemini Multimodal (`gemini-2.5-flash`) for visual attribute extraction and pairwise match evaluation, paired with Gemini Embeddings (`text-embedding-004`) for fast in-browser vector pre-filtering.

---

## 🎯 1. Alignment with Problem Statement & Recent Updates (High Impact)

All core requirements & challenge expectations are 100% functional, audited, and live:

1. **Lost & Found Report Submission**: 3-step progressive disclosure wizard taking photo upload (base64 stored in IndexedDB), free-text description, campus location dropdown (**13 specific campus landmarks**), date/time selector (restricted up to current timestamp), optional **Student Campus ID**, and student contact info.
2. **AI Analysis & Attribute Extraction**: Every report triggers Gemini Multimodal API to extract `{ category, color[], brand, distinguishing_features[], summary }`.
3. **Automated Smart Dynamic Assistant Engine**: Opposite-type reports (Lost vs Found) undergo vector cosine similarity pre-filtering followed by pairwise Gemini reasoning that evaluates item attributes, **Spatial Proximity** (`Same Location` | `Adjacent Area`), **Temporal Proximity**, and assigns a dynamic **Priority Level** (`HIGH_PRIORITY` | `MEDIUM_PRIORITY` | `ROUTINE`).
4. **Confidence Score**: Each potential match is assigned a clear numeric percentage score (0-100%).
5. **Grounded Human-Readable Explanation**: Explanations cite exact matching item attributes, brand names, visual marks, location proximity, and timing.
6. **Search & Browse Directory**: Filterable directory allowing instant keyword search, category filtering, campus location filtering, and report type toggling.

---

## 🧠 2. Technical Approach & Architecture (Medium Impact)

```
┌─────────────────────────────────────────────────────────┐
│              React 18 + TypeScript (Vite)               │
│ - Retail Flagship Design System (Green/Cream/Gold)      │
│ - 50px Pill Buttons + 12px Whisper-Shadow Cards         │
└───────────┬─────────────────────────────────┬───────────┘
            │                                 │
            ▼                                 ▼
┌──────────────────────────────┐  ┌───────────────────────┐
│ IndexedDB Storage (`idb`)    │  │ Google Gemini API     │
│ - `reports` Store            │  │ - Multimodal (Flash)  │
│ - `matches` Store            │  │ - Text Embeddings     │
└──────────────────────────────┘  └───────────────────────┘
```

---

## 🔒 3. Comprehensive Security & Safe Implementation (Strictly Audited)

- **Edge HTTP Security Headers ([vercel.json](file:///c:/xampp/htdocs/campusfind/Campusfind/vercel.json))**:
  - **Content-Security-Policy (CSP)**: `default-src 'self' ... connect-src https://generativelanguage.googleapis.com`
  - **X-Frame-Options (`DENY`)**: Eliminates clickjacking attacks.
  - **X-Content-Type-Options (`nosniff`)**: Blocks MIME-type spoofing.
  - **Strict-Transport-Security (HSTS)**: Enforces TLS encryption (`max-age=31536000; includeSubDomains; preload`).
  - **Permissions-Policy**: Restricts camera, microphone, and geolocation API vectors.
- **Binary Magic-Byte File Header Inspection**: Performs binary signature header verification (`0xFF 0xD8 0xFF` JPG, `0x89 0x50 0x4E 0x47` PNG, `RIFF/WEBP`, `GIF8`) to inspect uploaded files at the byte level, blocking executable binaries masquerading as images.
- **Multi-Vector XSS & URI Protocol Sanitization**: Escapes HTML entities (`&`, `<`, `>`, `"`, `'`, `/`, `` ` ``, `=`), strips `javascript:`, `vbscript:`, `data:` URI exploitation vectors, and removes inline event handlers (`onload=`, `onerror=`) across all text inputs.
- **Base64 Payload Sanitization**: Validates base64 data URI structure (`sanitizeBase64Image`) before storing image payloads in IndexedDB or transmitting to Gemini APIs.
- **Reveal-on-Match PII Protection**: Student email, phone numbers, and Campus IDs remain obfuscated and blurred until both parties explicitly confirm a match.

---

## 🧪 4. Testing & Code Quality (High Impact)

- **Vitest Unit Test Suite**: `npx vitest run` passes **11/11 unit tests** validating vector cosine similarity, Jaccard text overlap, fallback attribute extraction, binary magic-byte inspection, PII masking, and multi-character XSS entity sanitization.
- **TypeScript Strict Mode**: Zero TypeScript build errors (`tsc -b && vite build` clean).

---

## 📍 Campus Locations Taxonomy (13 Landmarks)

1. `Cafe(ground Floor)`
2. `cafe(6th Floor)`
3. `NIAT LAB`
4. `Mayura Block(ground Floor)`
5. `Seminar Hall`
6. `Prayer Hall`
7. `Maintainance Room`
8. `Computer Lab`
9. `IT Support room`
10. `LH 17(C Block)`
11. `Lift A Block`
12. `Lift C Block`
13. `Wash Room`

---

## 💻 Local Execution Guide

```bash
# 1. Clone repo
git clone https://github.com/Jagadish-s-naik/Campusfind.git
cd Campusfind

# 2. Install dependencies
npm install

# 3. Add Gemini API Key (Optional: fallback extractor works offline)
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# 4. Start local development server
npm run dev

# 5. Execute Unit Tests
npx vitest run

# 6. Verify Production Build
npm run build
```
