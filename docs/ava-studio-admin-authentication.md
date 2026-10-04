# AVA Studio Admin Authentication Contract

Status: Platform contract established on `main`-derived branch. This document defines the reusable Platform boundary; it does not enable any Independent App Admin capability or move App business logic into AVA Platform.

## Current implementation and gap assessment

Before this change, AVA Studio authenticated a password against the Platform GAS Web App and stored a self-contained HMAC token in `sessionStorage`. Homepage writes rechecked that token, but the token was not revocable, App Admin launches carried no authorization context, and there was no reusable backend verification protocol. `avaEntry=admin` therefore selected a route but could not authenticate it.

The implementation is now split into these Platform-owned pieces:

- [`ava-admin-auth.js`](../ava-admin-auth.js) is the browser contract for login, logout, App launch authorization, and memory/session-scoped transport.
- [`gas/Code.gs`](../gas/Code.gs) owns session activation/revocation, one-time launch tickets, App-scoped grants, and verification.
- [`index.html`](../index.html) owns the explicit registry capability flags and refuses Admin launch unless `capabilities.admin === true`.

## AVA Studio Admin Hub integration pattern

AVA Studio is the shared Admin management hub. Its Independent Apps directory
is rendered from the Platform `MODULE_REGISTRY`; an App appears only when its
registration declares `capabilities.admin === true` and a canonical
`entryModes.admin` destination. The directory does not contain App-specific
editor pages. Selecting **管理 / Manage** reuses the existing App-bound,
one-time launch-ticket flow and opens the App's own Admin surface. Platform
Homepage and Official Update Feed controls remain under a separate Platform
Management section.

To integrate a future App, the App must first implement and pass its own Admin
security/readiness gate. Platform then adds the reviewed registry capability
and canonical Admin entry; no per-App Studio page or Platform copy of the App
editor is required. An App without those declarations is omitted and cannot
receive a fabricated Admin destination.

## Contract

### 1. Login and identity

AVA User identity and Admin authorization are separate. User onboarding/profile data is not changed by Admin login. AVA Studio sends the password only to the Platform GAS endpoint. On success, the endpoint creates a 30-minute session with an opaque HMAC token and a server-side active-session record. The browser keeps the token in `sessionStorage` only; it is not User data, backup data, QR data, LocalStorage, IndexedDB, or a URL credential.

### 2. Lifetime and logout

The session expires after 30 minutes and is checked on every protected Platform operation. `logoutAdmin` deletes the server-side active-session record and clears the browser token. A failed, expired, revoked, malformed, or unknown token receives a safe authorization error and must not render or write Admin state. Ending Admin authorization does not delete or alter User identity, User Pages, User Overrides, ordering, visibility, or User-created content.

### 3. App Admin launch

The registry must explicitly declare `capabilities: { frontend, user, admin }`. `admin: false` has no Admin entry. `admin: true` is necessary but insufficient: the App must also be live-verified and registered in the Platform GAS `AVA_ADMIN_APP_IDS` property.

AVA Studio requests a two-minute, one-time, App-bound launch ticket. The ticket is opaque, short-lived, consumed once, and is not an Admin session or password. The Platform may transport that ticket as `avaAdminLaunch` on the App launch URL because it is neither permanent nor reusable; Apps must never put passwords, long-lived tokens, or credentials in query parameters. The App backend, never the browser alone, exchanges the ticket with the Platform using HTTPS and receives an opaque App grant. The exchanged App grant may remain valid after the two-minute ticket expires, but only until the originating active AVA Admin session expires. It never outlives that session: logout, revocation, or session expiry makes the grant invalid on the next verification. The App must reject `avaEntry=admin` without a successfully exchanged grant.

During normal exchange and verification, expired or invalid launch-ticket records and expired, revoked, or invalid App-grant records are deleted after the failed check. This is bounded cleanup of the records already being accessed; it is not a separate retention or cleanup service.

### 4. Official writes

Every Official-data write requires both:

1. App-specific business validation in the Independent App backend/GAS; and
2. Platform verification of the opaque App grant through `verifyAppGrant`, with the App ID and operation supplied by the backend.

The backend must perform that verification server-to-server for every write or according to a documented short cache that never outlives the grant. A public/read-only endpoint may remain public where appropriate. A write endpoint must not become anonymous, and UI visibility, referrer, query strings, frontend flags, LocalStorage, or `avaEntry=admin` are never authorization.

For an App-owned GAS Web App, the browser sends the App grant in an `Authorization` header or request body over HTTPS; GAS calls the Platform verification endpoint with `UrlFetchApp.fetch`, validates `success`, `appId`, operation, and expiry, then performs the App-owned Sheet write. The App must keep its Google Sheet as a data backend, not as a second password or Google-account allowlist. Platform credentials and Script Properties stay in the backend deployment environment.

### 5. Failure and return

Unsupported capability, `avaEntry=admin` without a grant, invalid ticket, expired ticket, revoked session, wrong App ID, failed Platform verification, or failed backend authorization must fail closed with a user-safe message and no Official write. An App returns to AVA Studio using its real registered return destination after Admin work; Return to AVA is navigation, not proof of permission. AVA Studio may be reopened on another authorized device, where a fresh Platform login establishes a fresh device session against the same Official Cloud state.

## Security and ownership boundaries

- `avaEntry=admin` is routing/capability selection only.
- AVA Platform owns common login, Admin sessions, launch authorization, revocation conventions, and verification.
- Each Independent App owns its domain data, schema, calculations, validation, publishing logic, backend, and Official/User merge behavior.
- Admin writes update only the Official Layer. They must not overwrite User Overrides or portable User data.
- Critical Illness is registered with `admin: true` only after its separate App PR consumes and verifies this contract. No Critical Illness repository is changed here.

## Deployment requirements

The Platform GAS deployment must configure `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and a reviewed comma-separated `AVA_ADMIN_APP_IDS` list. The deployment must be updated separately from source control and tested with the deployed endpoint. Each App backend must configure the Platform verification URL and its App ID, and must not expose the Platform session token or any Script Property to frontend code.
