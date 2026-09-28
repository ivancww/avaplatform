# AVA Medical independent-module integration

## Boundary and source of truth

`medical` remains the independently deployed `ivancww/medical` application on
its `main` branch at upstream merge commit
`d73c662f2d489bdf9051cfa437ec111334d5c635` (Medical PR #3).
AVA Platform contains only
registration, Home-card metadata and Mother-standard navigation entries. It
does not copy Medical source, pages, claim-engine logic, data, calculations or
workflow into this repository.

## Registered contract

| AVA surface | Context | Destination |
| --- | --- | --- |
| Home / favourites / tool library | Frontstage | `https://ivancww.github.io/medical/?avaEntry=frontend` |
| Settings → Medical / 我的流程 | User | `https://ivancww.github.io/medical/?avaEntry=user` |
| AVA Studio → Medical | Admin | Not exposed: Medical does not implement an Admin entry mode |

- Module ID: `medical`
- App name: `Medical`
- Chinese display name: `醫療`
- Icon: existing AVA `medical` icon
- Category / Area: `medical` / `workspace`
- Home card: enabled, visible and favourite-eligible in the bundled official default
- Capabilities: `frontend: true`, `user: true`, `admin: false`
- Deployment: live at `https://ivancww.github.io/medical/`

The registry is the only Platform module registry. Existing editable Home-card
rules continue to own default placement, visibility, ordering and User
overrides. AVA Studio can edit the card presentation but cannot delete the
module-connected card as a competing product entry.

## Front / User / Admin

The normal Front entry points to Medical's customer flow. Platform does not
expose Medical's temporary `編輯` or `Admin` controls in the AVA Front UI; the
actual Medical runtime remains responsible for its own development/QA controls.

The merged Medical runtime reads `avaEntry` on the existing deployment. Bare and
`avaEntry=frontend` entries render the customer Frontstage. `avaEntry=user`
renders that same Frontstage in User/Edit context without selecting Ready or Not
Ready automatically; those remain explicit Medical product-flow choices. The
normal Frontstage does not expose Edit/Admin controls. AVA Platform does not
grant Medical Admin permission or pass credentials.

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
existing GitHub Pages deployment. The Platform registry keeps that deployment
unchanged and passes only the canonical `avaEntry` query parameter for explicit
Frontstage/User launches. Admin remains unsupported.

The current Medical MVP does not yet provide the common AVA Portable User Data
adapter, Backup / Restore, QR Restore, shared Cloud Media or common auth/version
integration. Those remain shared-infrastructure or Medical-side follow-up;
this Platform change does not fabricate them or create competing services.

## Medical-side follow-up

Medical PR #3 is merged. The current deployment has a persistent `返回 AVA`
link to `https://ivancww.github.io/avaplatform/`. No Medical repository files
were changed by this Platform task.
