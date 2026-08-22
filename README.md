# Smart Campus Lost & Found — PromptWars x YenTech Submission

**One-Line Pitch:** An AI-powered platform where students submit lost/found item reports with a photo, description, location, and time, and the system automatically identifies and explains likely matches with a confidence score — plus lets people search and browse reports.

---

## 🎨 Visual Design System 

This application has been crafted adhering strictly to the **Starbucks Design System Specification** (`docs/DESIGN-starbucks.md`):

- **Four-Tier Brand Greens**: Starbucks Green (`#006241`), Green Accent (`#00754A`), House Green (`#1E3932`), and Mint Wash (`#D4E9E2`).
- **Warm Neutral Canvas**: Off-white Cream (`#F2F0EB`) and Ceramic (`#EDEBE9`) background surfaces referencing physical café materials rather than harsh stark whites.
- **Starbucks Ceremonial Gold**: Gold (`#CBA258`) reserved strictly for high-status AI match confidence callouts and awards.
- **50px Universal Full-Pill Buttons**: All CTAs feature 50px pill curvature with active `scale(0.95)` press feedback.
- **Contextual Editorial Serif**: Integrates `Lora` editorial serif for hero headline accents paired with `Plus Jakarta Sans`.

---

## 📌 Submission Overview & Metadata

- **Chosen Vertical**: Smart Campus Infrastructure / Student Utility
- **Problem Statement**: Reconnecting lost items with owners on campus is inefficient due to fragmented descriptions, missing location details, and manual search overhead.
- **Core AI Solution**: Uses Google Gemini Multimodal (`gemini-2.5-flash`) for visual attribute extraction and pairwise match evaluation, paired with Gemini Embeddings (`text-embedding-004`) for fast in-browser vector pre-filtering.

---

## 🎯 1. Alignment with Problem Statement (High Impact)

All 5 non-negotiable core requirements are 100% functional and demonstrably live:

1. **Lost & Found Report Submission**: 3-step wizard taking photo upload (base64 stored in IndexedDB), free-text description, campus location dropdown (12 landmarks), date/time selector, and student contact info.
2. **AI Analysis & Attribute Extraction**: Every report triggers Gemini Multimodal API to extract `{ category, color[], brand, distinguishing_features[], summary }`.
3. **Automated AI Matching Engine**: Opposite-type reports (Lost vs Found) undergo vector cosine similarity pre-filtering followed by pairwise Gemini comparison.
4. **Confidence Score**: Each potential match is assigned a clear numeric percentage score (0-100%).
5. **Grounded Human-Readable Explanation**: Explanations cite exact matching item attributes, brand names, visual marks, location proximity, and timing (e.g. *"Both reports detail a black JanSport backpack featuring a red keychain, reported at the Library Main Entrance within 2 hours of each other"*).
6. **Search & Browse Directory**: Filterable directory allowing instant keyword search, category filtering, campus location filtering, and report type toggling.

---

## 🧠 2. Technical Approach & Architecture (Medium Impact)

```
┌─────────────────────────────────────────────────────────┐
│              React 18 + TypeScript (Vite)               │
│ - Starbucks Flagship Design System (Green/Cream/Gold)   │
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

## 🔒 3. Security & Key Trade-Offs (Medium Impact)

- **Input Sanitization**: HTML entity encoder utility escaping all user text (`reporterName`, `contactInfo`, `description`, `locationDetails`).
- **File Upload Constraints**: MIME-type header checks (`image/jpeg`, `image/png`, `image/webp`) and 5MB file ceiling.
- **Client-Exposed Gemini API Key**: Documented trade-off for a 3-hour hackathon build. Production would route calls via backend serverless functions.
- **Reveal-on-Match Privacy Protection**: Contact info remains blurred until both parties confirm a match.

---

## 🧪 4. Testing & Code Quality (High Impact)

- **Vitest Unit Test Suite**: `npx vitest run` passes **8/8 unit tests**.
- **TypeScript Strict Mode**: Zero TypeScript build errors (`tsc -b && vite build` clean).

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
