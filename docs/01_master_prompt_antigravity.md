# MASTER PROMPT — Paste this into Antigravity AI

---

You are a senior full-stack engineer building a production-quality submission for a hackathon called "PromptWars x YenTech." Follow this brief exactly. Do not invent requirements that aren't listed here. Do not skip or water down any core requirement to save time. If something is ambiguous, make the most sensible, well-justified choice and state the assumption in a comment — do not silently guess or hallucinate features, APIs, or data that weren't specified.

## 1. Project

**Name:** Smart Campus Lost & Found
**One-line pitch:** An AI-powered platform where students submit lost/found item reports with a photo, description, location, and time, and the system automatically identifies and explains likely matches with a confidence score — plus lets people search and browse reports.

## 2. Non-negotiable core requirements (from the official problem statement)

Build these first, fully, before touching anything else:

1. Users can submit a **Lost** report or a **Found** report containing: photo upload, free-text description, location (campus location), and date/time.
2. The AI must **analyze reports and identify likely matches** between lost and found items.
3. Each potential match must show a **confidence score** (numeric or percentage).
4. Each potential match must include a **human-readable explanation** of *why* the AI thinks these two items match (e.g. "Both mention a black Jansport backpack with a red keychain, reported within 200m and 3 hours of each other").
5. Users can **search and browse** lost and found reports (not just wait for auto-matching).

Everything else in this prompt is secondary to these five. If you're ever short on time, cut polish before you cut any of these five.

## 3. Tech stack (simplified for a 3-hour build — no backend infrastructure)

- **Frontend:** React + TypeScript + Vite, Tailwind CSS (custom design tokens, not default theme — see Section 6)
- **Data persistence:** Browser IndexedDB (or localStorage if simpler) — no server, no database setup, no deployment infra. All reports, matches, and photos (as base64) are stored locally in the browser. This is a deliberate, documented trade-off for the time limit, not an oversight — mention it in the README.
- **No authentication system.** Instead, each report just has a "Your name" + "Contact info" text field, filled in at submission time. This is enough for the demo without any auth setup overhead.
- **AI/Matching:**
  - Google **Gemini API** (multimodal) for: (a) generating a structured description + tags from the uploaded photo, (b) comparing a lost report against candidate found reports and producing a confidence score + natural-language explanation
  - Text embeddings (Gemini embedding model) for fast semantic pre-filtering of candidate matches before doing the expensive pairwise Gemini comparison — this keeps it efficient at scale instead of doing O(n²) LLM calls
  - **Gemini API called directly from the frontend** with the API key in an environment variable (`import.meta.env.VITE_GEMINI_API_KEY`). This is a known trade-off for a client-only hackathon build — state clearly in the README that a production version would proxy this through a backend to avoid exposing the key. Being explicit about this is better than pretending otherwise.
  - **Do NOT use Google Maps API** — out of scope given the time limit. Location is a simple dropdown/select of known campus locations (Library, Cafeteria, Gym, Hostel Block A/B, Main Gate, Lecture Hall 1/2/3, Parking Lot, Sports Complex, Admin Block — adjust to match your actual campus) with a free-text "additional details" field as fallback. This still gives the matching engine a usable location signal without any map integration overhead.
- **Testing:** Vitest/Jest for unit tests on the matching logic and utility functions; at least a few tests are required by the evaluation criteria — do not skip this.

## 4. Matching engine — build it like this (for both correctness and efficiency)

1. On report submission, call Gemini (multimodal) once to extract structured attributes from photo + description: `{category, color[], brand, distinguishing_features[], summary}`. Store this alongside the raw report in IndexedDB.
2. Generate a text embedding from the structured summary and store it with the report.
3. When looking for matches for a report of type Lost, do a cheap in-browser vector-similarity pre-filter (simple cosine similarity function, no external service needed) against all *opposite-type* (Found) reports within a reasonable time/location window to get the top ~5-10 candidates.
4. For only those top candidates, make a single Gemini call that receives both reports' structured attributes and returns strict JSON: `{confidence_score: 0-100, explanation: string, matched_attributes: string[]}`.
5. Persist match results in IndexedDB so they don't need to be recomputed every page load. Recompute only when a new report comes in that could match existing ones.
6. Never fabricate a match explanation that isn't grounded in the actual stored attributes of both reports — the explanation must reference real fields, not generic filler text.

## 5. Additional innovative features (only after core requirements are complete and solid)

Pick 2-4 of these, don't try to cram in all of them:

- **Reveal-on-match privacy flow:** contact info stays hidden until both parties confirm a match, at which point a secure "reveal" unlocks a private chat/contact exchange — protects student privacy.
- **Reverse image search:** let a user upload a photo of an item they're looking for and search directly against found-item photos via embeddings, without filing a formal report first.
- **Location hotspot list:** instead of a map, a simple ranked list/bar chart of "most common lost/found locations" (computed from your dropdown data) — same insight as a heatmap, zero map API cost.
- **Smart notifications:** when a new report is filed that matches an existing open report, notify the original poster automatically.
- **"Confidence-based inbox":** sort a user's potential matches by confidence score so the most likely match is triaged first.

Do not let these secondary features add unhandled edge cases to the core five requirements.

## 6. UI/UX requirements — this must NOT look like a default AI-generated app

Explicitly avoid: default shadcn purple/indigo gradients, generic "Inter font on white card" templates, centered hero with a rocket emoji, and unstyled default browser form elements. Instead:

- Pick a real, intentional visual identity: a defined color palette (2-3 primary colors + 1 accent, tied to a "campus" feel — e.g. warm neutrals + a single confident accent color), a distinctive type pairing (not just default Inter — pick something with character for headings), and consistent spacing/radius scale.
- Design a real information hierarchy: dashboard/home showing recent reports and any matches needing the user's attention, a report submission flow that feels like 2-3 clear steps not one giant form, a search/browse page with filters (category, location, date range, lost vs found), and a match detail view that clearly shows both items side-by-side with the confidence score and explanation front and center.
- Use empty states, loading states, and error states everywhere — a screen with no data should never look broken.
- Mobile-responsive: this is a campus app, most usage will be on phones.

## 7. Non-functional requirements (map directly to evaluation criteria)

- **Code Quality:** consistent formatting/linting, clear component/module boundaries, no dead code, meaningful naming, comments only where logic is non-obvious.
- **Security:** validate all inputs (required fields, file type/size on photo upload), sanitize any user text before rendering to prevent XSS. Since there's no backend in this build, note in the README that the Gemini API key is client-exposed as a deliberate hackathon trade-off, and that a production version would move all AI calls behind a server-side proxy.
- **Efficiency:** the embedding pre-filter step in Section 4 exists specifically so you're not making expensive LLM calls against every report — keep it that way. Paginate/lazy-load report lists if the demo dataset grows large.
- **Testing:** unit tests for the matching/scoring logic and at least the core form validation; note in the code where you'd add integration tests if time allowed.
- **Accessibility:** semantic HTML, proper labels on all form inputs, sufficient color contrast, keyboard-navigable, alt text on images (can be AI-generated alt text from the structured description).
- **Problem Statement Alignment:** re-read Section 2 before final submission and verify every single item is demonstrably working, not just present in the code.
- **Google Services usage:** make sure Gemini usage (multimodal attribute extraction, embeddings, and match scoring) is real, functional, and visible in the demo — not stubbed out or mocked at submission time. This is your primary Google services footprint given the simplified no-backend build, and it's the more impressive one to showcase anyway.

## 8. Guardrails for the build process itself

- Do not invent scoring rules, judges' preferences, or requirements beyond what's in Sections 2 and 7 — if unsure, prioritize Section 2.
- Do not silently swap out the required tech (e.g., don't quietly drop Gemini for a hardcoded fake matching function) — if an API integration is genuinely blocked, say so explicitly rather than faking success.
- Keep the demo data realistic (real campus item types: backpacks, water bottles, ID cards, laptops, umbrellas, keys, AirPods, textbooks) — don't use placeholder lorem ipsum in the final demo.
- Build in this order: (1) data model + IndexedDB storage layer → (2) report submission flow → (3) matching engine → (4) search/browse → (5) match detail UI → (6) polish/tests/accessibility pass → (7) 2-3 innovative features if time remains.

## 9. What to deliver

A working, runnable app (locally via `npm run dev` is sufficient — no deployment required) fulfilling Sections 2, 4, 6, and 7, plus a short README explaining what was built, how the matching engine works, what Google services (Gemini) are used and why, and an explicit note on the no-backend/client-exposed-API-key trade-off made for the time limit.
