# AVA Medical independent-module integration

## Boundary and source of truth

`medical` remains the independently deployed `ivancww/medical` application on
its `main` branch at upstream commit `675d9c3ff7b594524e55aa83fe197d54f0626b82`.
AVA Platform contains only
registration, Home-card metadata and Mother-standard navigation entries. It
does not copy Medical source, pages, claim-engine logic, data, calculations or
workflow into this repository.

## Registered contract

| AVA surface | Context | Destination |
| --- | --- | --- |
| Home / favourites / tool library | Frontstage | `https://ivancww.github.io/medical/` |
| Settings → Medical / 我的流程 | User | Not exposed: Medical does not implement a User entry mode |
| AVA Studio → Medical | Admin | Not exposed: Medical does not implement an Admin entry mode |

- Module ID: `medical`
- App name: `Medical`
- Chinese display name: `醫療`
- Icon: existing AVA `medical` icon
- Category / Area: `medical` / `workspace`
- Home card: enabled, visible and favourite-eligible in the bundled official default
- Frontstage capability: enabled; User/Admin capability flags remain disabled until Medical declares and implements those entry modes
- Deployment: live at `https://ivancww.github.io/medical/`

The registry is the only Platform module registry. Existing editable Home-card
rules continue to own default placement, visibility, ordering and User
overrides. AVA Studio can edit the card presentation but cannot delete the
module-connected card as a competing product entry.

## Front / User / Admin

The normal Front entry points to Medical's customer flow. Platform does not
expose Medical's temporary `編輯` or `Admin` controls in the AVA Front UI; the
actual Medical runtime remains responsible for its own development/QA controls.

The current merged Medical runtime does not read `avaEntry` and does not expose
Platform User or AVA Studio entry modes. AVA therefore keeps those capabilities
disabled rather than routing to an unsupported URL. AVA Platform does not grant
Medical Admin permission or pass credentials.

## Gateway, PWA and Return to AVA

Medical is currently an external, cross-origin GitHub Pages target, so it is not
added to the same-origin iframe allowlist in `module-gateway.html`. The gateway
POC is intentionally limited to reviewed same-origin module embeddings. The
normal AVA entry remains a same-window navigation to Medical's independent
deployment; no `_blank` or `window.open()` is introduced.

Medical's existing persistent `返回 AVA` control returns to the AVA Platform
home and remains Medical-owned. The Platform does not rewrite Medical's PWA
manifest, service worker, storage namespace or standalone behavior.

## Availability and dependencies

On 2026-09-28, `https://ivancww.github.io/medical/` returned HTTP 200 and is the
verified GitHub Pages deployment. The registry opens this live Frontstage URL
normally; User/Admin launches remain unavailable until Medical implements those
entry modes.

The current Medical MVP does not yet provide the common AVA Portable User Data
adapter, Backup / Restore, QR Restore, shared Cloud Media or common auth/version
integration. Those remain shared-infrastructure or Medical-side follow-up;
this Platform change does not fabricate them or create competing services.

## Medical-side follow-up

Medical PR #1 is merged. A future Medical-side change may add explicit User or
Admin entry modes if required; Platform should enable them only after verifying
the real deployed routes. The current deployment has a persistent `返回 AVA`
link to `https://ivancww.github.io/avaplatform/`. No Medical repository files
were changed by this Platform task.
