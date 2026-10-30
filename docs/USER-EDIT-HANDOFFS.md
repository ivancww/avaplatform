# Independent implementation handoffs

This is a documentation handoff, not an instruction to modify an App during PR #79. Before each implementation, re-fetch default, release branch, target HEAD and open PRs; read App AGENTS and latest merged Mother Rules / Design System, verify live source, and choose an independent branch/version. Avoid overlap, do not merge/deploy. Use [contract](UNIFIED-USER-EDIT-v1.md), [UI](USER-EDIT-UI-v1.md) and [field audit](USER-EDIT-SEVEN-APP-AUDIT.md). Unknown fields are not editable by default; legacy User data migration requires an explicit safe strategy. No App may depend on another App or a Platform-hosted runtime library to operate.

## Common acceptance and screenshot package

For each App test actual Frontend/User/Admin entry and rejected privilege escalation; real in-flow edit/preview/return edit/save/readback/reload, global cancel and dirty navigation, save and readback failures, protected values/Official write, return destination, PWA update and existing tests. For unsupported capability test safe notice and no fake save. Test keyboard, status, safe-area, phone/foldable, iPad portrait/landscape, desktop, long text and local overflow. Capture candidate screenshots: frontend, edit with one labelled field and protected content, preview, save success, save error and dirty confirmation; unsupported App captures its notice instead. Capture compact, iPad and desktop; record viewport, browser, SHA and real vs emulated. Physical iPad, live Pages, WebView and actual authenticated external service checks are separate NOT VERIFIED until executed. No mockup or static assertion is a production QA pass. Every PR reports HEAD, version, changed components, tests, source boundary, screenshots and independent Gemini evidence or NOT VERIFIED.

## 5pay Saving

- Existing: User enters edit, appended current-page panel; P1–P7 plus scenario and custom pages; localStorage overrides, immediate writes for ordering/pages and swallowed storage failure.
- Change: direct adjacent controls and standard mode bar; stage all permitted operations, exact allowlist, preview same journey, atomic save/readback, rollback, failure retention and User return fallback.
- Boundaries: custom user-authored content/media references only as permitted in matrix; page/card official wording REVIEW REQUIRED; illustrations, rates, multipliers and calculations protected. Preserve storage format/backups and media rules.
- Conflict: open #29; compare changed files and latest release before branching. Tests: P3/P4/P6 scenarios, year rails, saved custom pages/media, Official/User composition and existing calculation suite. Screenshots per common package. Prohibit Sheet/GAS, auth and calculation changes.

## Medical

- Existing: User edit on journey; title/subtitle draft but P7 comparison changes persist separately, User return root. Ready/Not Ready and product data remain App-owned.
- Change: standard toolbar and staged multi-page transaction, readback/cancel and User return; preserve P7 User-created items, their edit/delete/order and separately labelled User explanations. Classify each item by ownership and meaning, not field name. Split Official facts and User sales text within the same flow; preserve existing overrides and use a verified reversible migration.
- Boundaries: User-created presentation items and notes ALLOW when accurate; Official benefit values, premiums, deductibles, eligibility and conditions PROTECTED; Official visibility/order and ambiguous or mixed legacy values REVIEW REQUIRED. Do not suppress mandatory disclosures or treat User-authored statements as verified Official facts.
- Conflicts: #5 return, #39 media, #41 Admin; inspect latest state, and recent merged #48/#49. Tests: Ready/Not Ready, P7 custom create/edit/delete/order, Official visibility/disclosure safeguards, same-field-name different ownership, mixed override backup/migration/rollback and failed readback, conditional Wise/AVF, premium and calculations; common screenshot package. Prohibit official writes, GAS/Sheet, auth and calculation changes.

## Critical Illness

- Existing: User flag and separate `#/edit` intro/preferences editor, local state; custom pages save immediately; preview temporarily modifies state.
- Change: permitted intro/page edits directly beside content in the journey, stage and preview actual flow, readback/rollback/return; preserve custom-page ownership and cloud media references.
- Boundaries: user-authored non-product copy only; intro wording REVIEW REQUIRED; premiums, claims, health program, coverage and disclosures protected.
- Conflict: #34 v0.6.9 changes premium and customer presentation; inspect current diff/base and coordinate, do not modify it. Tests: claims/premium, multiple payouts, flow navigation, custom-page backup and unauthorized Admin; common screenshots. Prohibit product, Official, calculation, Firebase and GAS changes.

## AVA-CRM

- Existing: two in-flow editable titles; IndexedDB settings with localStorage fallback; preview and cancel do not provide proven rollback/readback. User return explicit.
- Change: preserve exact `homeTitle` and `intake-title` candidate scope, stage/save/readback/restore draft, Chinese controls and accessibility; distinguish customer records from presentation.
- Conflict: open #16 release/PWA; verify release source and Admin registry/source discrepancy, avoid version collision. Tests: frontstage override and DB fallback, customer/household/policy/Review/AI extraction, backup, User/Admin negatives, PWA data preservation; common screenshots. Prohibit business/customer data edits by presentation save, auth/data schema changes.

## EverBliss

- Existing: closest flow-integrated UI; `PRESENTATION_FIELDS`, IndexedDB overrides with localStorage fallback, user surface return.
- Change: preserve journey-integrated editing of legitimate User introductions, non-product-specific titles, explanations, notes, permitted options/order and feature presentation. Use toolbar, draft/readback/cancel and accessibility. Split mixed legacy fields into read-only Official explanation and separately editable User explanation on the same page; retain exact old overrides and verify reversible migration before applying restrictions.
- Boundaries: `home.note`, `j05.helper`, `j07.year8Extra` and `features.F01–F04` are classified per meaning: Official guarantee/timing/eligibility/limits and mandatory qualifications PROTECTED; separated User explanation ALLOW; legacy mixed text or conditional visibility/order REVIEW REQUIRED. Never hide, replace or contradict Official facts. No change to annuity values, payment timing, OALA or health features.
- Conflict: no open PR at audit; re-fetch. Tests: J01–J08/F01–F04/OALA and annuity snapshots, legitimate User feature/notes preview/save/cancel, mandatory Official facts visible, mixed override backup/migration/rollback, IndexedDB fallback, official vs User and return; common screenshots. Prohibit changing Official data, GAS, rates, calculations or default qualifications.

## Medsave

- Existing: no parsed User entry; User settings reuse legacy role dashboard; local role/password UI is not server authorization, with role default potentially Admin. Dynamic zones and four named fixed pages.
- Change: first independently assess existing auth and prevent User entry from invoking privileged/Official controls; only verified User-owned content receives in-flow editing, otherwise safe unsupported notice. Do not introduce client-side authorization or make Official writes.
- Boundaries: field ownership unresolved; classify dynamic page fields individually. Preserve scenario data and legitimate existing features; do not expose role, Sheet mapping, password, cloud sync or product calculations.
- Conflict: no open PR; repository workflow can auto-merge non-draft `codex` labelled PRs, so retain draft/unlabelled and verify auto-merge disabled before any PR. Tests: role tampering and copied URL denial, journey, calculations, storage migration, safe user return; common or unsupported screenshots. Prohibit server/auth policy, official data and production changes.

## Retiremedical

- Existing: user parameter only changes context; no presentation customization or local persistence, financial inputs drive calculator.
- Change: safe unsupported state for User Edit until a genuine presentation field is established; preserve normal scenario inputs and User return. Do not fabricate persistent editing or an Admin capability.
- Boundaries: all customer financial inputs stay normal domain operations; rates, mappings, formulas and computed results protected. No presentation allowlist proposed.
- Conflict: no open PR; re-fetch. Tests: all calculator inputs/results, CSV parsing and fetch failure, unsupported entry/no Save, safe user return, copied Admin URL fails safely; unsupported screenshots at required viewports. Prohibit storage migration, premium logic and Sheet changes.
