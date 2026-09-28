# AVA Medical independent-module integration

## Boundary and source of truth

`medical` remains the independently deployed `ivancww/medical` application on
`build/medical-mvp` at upstream commit `9e41544`. AVA Platform contains only
registration, Home-card metadata and Mother-standard navigation entries. It
does not copy Medical source, pages, claim-engine logic, data, calculations or
workflow into this repository.

## Registered contract

| AVA surface | Context | Destination |
| --- | --- | --- |
| Home / favourites / tool library | Frontstage | `https://ivancww.github.io/medical/index.html?avaEntry=frontend` |
| Settings → Medical / 我的流程 | User | `https://ivancww.github.io/medical/index.html?avaEntry=user` |
| AVA Studio → Medical | Admin | `https://ivancww.github.io/medical/index.html?avaEntry=admin` |

- Module ID: `medical`
- App name: `Medical`
- Chinese display name: `醫療`
- Icon: existing AVA `medical` icon
- Category / Area: `medical` / `workspace`
- Home card: enabled, visible and favourite-eligible in the bundled official default
- User and Admin capability flags: enabled; the actual editor and Official configuration remain Medical-owned
- Availability: `deployment-pending` until the independent Pages deployment exists

The registry is the only Platform module registry. Existing editable Home-card
rules continue to own default placement, visibility, ordering and User
overrides. AVA Studio can edit the card presentation but cannot delete the
module-connected card as a competing product entry.

## Front / User / Admin

The normal Front entry points to Medical's customer flow. Platform does not
expose Medical's temporary `編輯` or `Admin` controls in the AVA Front UI; the
actual Medical runtime remains responsible for its own development/QA controls
until Medical-side integration hides them for integrated Front mode.

Settings → Medical uses `avaEntry=user`; AVA Studio → Medical uses
`avaEntry=admin`. These entries preserve Medical ownership of User Edit →
Preview → Save Local and Admin Official configuration. AVA Platform does not
grant Admin permission or pass credentials.

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

On 2026-09-28, `https://ivancww.github.io/medical/` returned HTTP 404. The
registry therefore records the target contract while `openModule` fails safely
with an unavailable-deployment message. No live Medical integration PASS is
claimed until Medical is deployed and its real entry paths are verified.

The current Medical MVP does not yet provide the common AVA Portable User Data
adapter, Backup / Restore, QR Restore, shared Cloud Media or common auth/version
integration. Those remain shared-infrastructure or Medical-side follow-up;
this Platform change does not fabricate them or create competing services.

## Medical-side follow-up

After Medical deployment, Medical PR #1 / a follow-up Medical change must
verify `avaEntry=frontend|user|admin`, hide temporary direct User/Admin controls
from integrated Front, preserve the persistent Return to AVA control in every
required mode, and complete real responsive and installed-PWA QA. No Medical
repository files were changed by this Platform task.
