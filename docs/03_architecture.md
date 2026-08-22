# Architecture Document
## Smart Campus Lost & Found

### 1. High-Level Architecture (no backend — client-only build for the 3-hour window)

```
┌──────────────────────────┐        ┌──────────────────┐
│   React + Vite (SPA)       │ <----> │  Google Gemini API │
│   - UI                     │        │  (multimodal +     │
│   - Matching logic          │        │   embeddings)       │
│   - IndexedDB storage layer │        └──────────────────┘
└──────────────────────────┘
```

No server, no database service, no auth provider, no deployment step required. Everything runs in the browser except the Gemini API calls. This is a deliberate scope decision for the time limit — documented as a trade-off in the README, not hidden.

### 2. Frontend
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS with a custom theme (see PRD / master prompt Section 6 for design direction — do not use default template styling)
- **Key screens:**
  - Home/Dashboard — recent reports, pending matches
  - Submit Report — Lost or Found flow (photo, description, location, time, your name + contact info)
  - Browse/Search — filterable list of all reports
  - Match Detail — side-by-side comparison, confidence score, explanation
  - Report Detail — single report view

### 3. Data Layer (browser-only, no backend)
- **Storage:** IndexedDB (recommended over localStorage since photos-as-base64 can be large; IndexedDB has a much higher storage ceiling and handles larger blobs cleanly). A small wrapper (e.g. the `idb` npm package) keeps this simple.
- **"Collections" (IndexedDB object stores):**
  - `reports`: `{id, type: 'lost'|'found', reporterName, contactInfo, photoBase64, description, structuredAttributes: {category, color[], brand, distinguishingFeatures[], summary}, embedding, location, timestamp, status}`
  - `matches`: `{id, lostReportId, foundReportId, confidenceScore, explanation, matchedAttributes[], createdAt, status: 'pending'|'confirmed'|'dismissed'}`
- **No authentication:** each report just carries a name + contact info field filled in at submission time. No login flow, no session management.
- **Persistence caveat:** data lives only in that browser/device — fine for a live demo on one laptop, but worth mentioning explicitly to judges as a scoped trade-off, not a bug.

### 4. AI / Matching Pipeline
1. **Attribute extraction (on submission):** photo + description → Gemini multimodal call → structured JSON attributes, stored on the report in IndexedDB.
2. **Embedding generation:** structured summary text → Gemini embedding → vector stored on the report.
3. **Candidate pre-filtering:** on new report creation, an in-browser cosine-similarity function compares embeddings against opposite-type reports (within a reasonable location/time window) to shortlist top ~5-10 candidates. This avoids expensive pairwise LLM calls against every report.
4. **Pairwise match scoring:** for each shortlisted candidate, one Gemini call comparing both reports' structured attributes → returns strict JSON `{confidence_score, explanation, matched_attributes}`.
5. **Persistence:** match results written to the `matches` object store so they're computed once, not on every page load.

### 5. Security
- All Gemini API calls happen client-side using a `VITE_GEMINI_API_KEY` environment variable — this exposes the key in the built bundle. **This is a stated, deliberate trade-off for the 3-hour build**, not an oversight — call it out clearly in the README along with the production fix (proxy calls through a minimal backend/serverless function).
- Input validation on the client (required fields, file type/size checks on photo upload).
- Sanitize any user-entered text before rendering to prevent XSS.
- Contact info (if using the reveal-on-match feature) can be masked/hidden in the UI until both parties confirm a match, even without a real backend enforcing it — good enough for a demo, with the caveat noted above.

### 6. Efficiency Considerations
- Embedding pre-filter step is the key efficiency mechanism — without it, matching is O(n²) LLM calls, which is slow and expensive. With it, it's O(n) cheap in-browser vector comparisons + a handful of LLM calls per new report.
- Paginated/lazy-loaded report lists in the Browse screen if the demo dataset grows large.
- Match computation triggered only on new report creation, not recomputed on every read (read from IndexedDB instead).

### 7. Testing Strategy
- Unit tests (Vitest/Jest) for:
  - Matching/scoring logic (mock Gemini responses, verify scoring/explanation handling)
  - Form validation (required fields, file type/size checks)
  - Cosine similarity utility function
- Manual test checklist before submission (see progress document).

### 8. Running the App
- `npm run dev` for local development — this is sufficient for the competition; no deployment is required unless time allows.
- If a hosted version is wanted for convenience, a static host (Vercel/Netlify/GitHub Pages) works fine since there's no backend to deploy — but treat this as optional polish, not a requirement.

### 9. Known Trade-offs (state these explicitly, don't hide them)
- No backend: Gemini API key is client-exposed, and data persists only in the local browser (no cross-device sync, no shared multi-user backend). Both are intentional, time-boxed decisions — state this plainly in the README rather than pretending it's production-ready.
- Time-boxed build: some nice-to-have features may be stubbed with clear TODOs rather than fully built — this is acceptable and should be documented in the README, but the 5 core requirements must not be stubbed.
- Reverse image search (if included) may use a simpler similarity check rather than a fully separate vision pipeline, given time constraints.
- Location is a fixed dropdown of known campus locations, not a real map/geocoding integration — deliberately cut given the 3-hour build window, since it isn't a core requirement.
