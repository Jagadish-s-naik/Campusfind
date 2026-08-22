# Product Requirements Document (PRD)
## Smart Campus Lost & Found — PromptWars x YenTech

### 1. Problem Statement
Lost and found items on campus are often difficult to reconnect with their owners because descriptions vary, information may be incomplete, and manually searching through multiple reports is inefficient.

### 2. Goal
Build an AI-powered Lost & Found system that lets users submit lost or found item reports (photo, description, location, time), automatically identifies likely matches with a confidence score and explanation, and lets users search/discover relevant reports.

### 3. Target Users
- **Students/staff who lost an item** — want to file a report quickly and be notified of likely matches.
- **Students/staff who found an item** — want to file a report quickly so it can reach the right owner.
- **Casual browsers** — want to search/skim reports without filing one, in case they spot their item.

### 4. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|---------------|------------|
| US-1 | User who lost something | Submit a report with a photo, description, location, and time | The system can try to find it for me |
| US-2 | User who found something | Submit a report the same way | The owner can be reunited with it |
| US-3 | User | See AI-suggested matches with a confidence score | I know how likely a match is before reaching out |
| US-4 | User | See *why* the AI thinks two items match | I can trust or dismiss the suggestion |
| US-5 | User | Search/filter existing reports by category, location, date | I can find relevant items without waiting for a match |
| US-6 | User | Reveal contact info only after confirming a match | My privacy is protected until I choose to share |

### 5. Functional Requirements (Must-Have — maps to grading)
1. Report submission form: photo upload, description, location, date/time — for both Lost and Found types.
2. AI analysis of submitted reports to extract structured attributes (category, color, brand, distinguishing features).
3. Automated matching between Lost and Found reports.
4. Confidence score displayed per match (0-100 or %).
5. Natural-language explanation of each match, grounded in actual report data.
6. Search and browse functionality across all reports, with filters.

### 6. Functional Requirements (Nice-to-Have — pick 2-4)
- Reveal-on-match private contact exchange
- Reverse image search
- Location hotspot list (ranked/chart view of common lost/found locations — no map API)
- Auto-notifications on new matches
- Confidence-sorted match inbox

### 7. Non-Functional Requirements
- **Security:** server-side validation, Firebase Security Rules, no exposed API keys, sanitized user input.
- **Performance/Efficiency:** avoid O(n²) LLM calls — use embedding pre-filter before expensive comparisons; paginate lists.
- **Accessibility:** semantic HTML, labeled inputs, keyboard navigation, adequate contrast, image alt text.
- **Testing:** unit tests covering matching logic and form validation at minimum.
- **Code Quality:** linted, consistent, modular, documented where non-obvious.

### 8. Success Metrics (for this competition)
- All 5 core functional requirements demonstrably working live.
- Judges can submit a lost item and a found item and see a real match with a real confidence score and explanation — not a mocked/hardcoded example.
- Clean UI that doesn't look like a default AI-scaffolded template.

### 9. Out of Scope (explicitly, to avoid scope creep tonight)
- Multi-campus/multi-tenant support
- Native mobile app (responsive web is sufficient)
- Payment/reward monetary systems
- Admin moderation dashboard (unless time allows and core is fully done)

### 10. Constraints
- Build window: ~3 hours.
- No backend infrastructure — data persists in browser IndexedDB/localStorage, no auth system, Gemini API called directly from the frontend (documented trade-off, not an oversight).
- Must use Google services meaningfully (explicit grading criterion) — satisfied via Gemini (multimodal + embeddings), the more technically impressive piece anyway.
- Final submission score only counts the final state, not best attempt — so leave time to verify everything still works before submitting, don't leave it mid-refactor.
