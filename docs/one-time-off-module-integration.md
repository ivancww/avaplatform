# One-Time-Off independent App — AVA Platform integration

## Active module and deployment
- Existing single `MODULE_REGISTRY` record: `one-time-off`; no second card or vendored App source.
- Repo: `ivancww/one-time-off`, reviewed and auto-deployed commit `8521b3c5c87a0d8905c52105368c85b17fc83fcb`.
- GitHub Pages canonical project destination: `https://ivancww.github.io/one-time-off/`.
- Latest One-Time-Off Pages Action: `https://github.com/ivancww/one-time-off/actions/runs/44026057510` — build PASS, publish PASS.
- Frontstage: `https://ivancww.github.io/one-time-off/?avaEntry=frontend`.
- User Edit: `https://ivancww.github.io/one-time-off/?avaEntry=user`.
- Admin: **disabled**; there is no Admin entry or integration authorization.
- The App source, calculations, local IndexedDB/User Edit data, backup files and PWA remain owned by the independent App repository.

## Scope and known limitations
- Enable Front and User, visible in the standard registry-driven directories with normal favourites and User Settings behavior. Do not alter seven existing App registrations, their URLs, storage, calculation or role access.
- The App is currently using a clearly distinguished **non-live manual snapshot**. Its successful GAS contract tests are not evidence of a connected, authenticated production Google Sheet/GAS live feed. Data freshness remains unverified until separately approved and implemented.
- App browser QA (after Back top-left fix, PR #6) and Pages build/publish succeeded on the exact App code; responsive viewport simulation and local navigation/Preview/Save Local/backups have test coverage. Physical iPad/HONOR devices, installed PWA, WebViews and a complete deployed cross-repository session remain **not independently verified**. Do not portray simulated checks as actual device checks.
- The deploy success verifies the GitHub Pages publication job for the canonical repository destination; end-to-end live browsing was not possible in this review environment.
- Platform activation is limited to registry paths and tests. No GAS/Sheet, Firebase, credentials, DNS, authentication, subscription or Admin configuration changes.

## Review / release contract
- Platform PR #80 carries the activation. Platform release v1.15.4 is proposed and must pass release-governance CI.
- On Owner-authorized merge, verify Platform production publication and test Front → App, User → Preview → Save Local → reopen → Return to AVA using real devices. Escalate any blocked or incorrect link before treating real-device QA as complete.
