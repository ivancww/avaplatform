# AVA Medical independent-module integration

## Boundary and source of truth

`medical` remains the independently deployed `ivancww/medical` application on
its `main` branch at upstream merge commit
`d71e92a8107c49ef7b0b7a2db702fb50632f4789` (Medical PR #4).
AVA Platform contains only
registration, Home-card metadata and Mother-standard navigation entries. It
does not copy Medical source, pages, claim-engine logic, data, calculations or
workflow into this repository.

## Registered contract

| AVA surface | Context | Destination |
| --- | --- | --- |
| Home / favourites / tool library | Frontstage | `https://ivancww.github.io/medical/?avaEntry=frontend` |
| Settings → Medical / 我的流程 | User | `https://ivancww.github.io/medical/?avaEntry=user` |
| AVA Studio → Medical | Admin | `https://ivancww.github.io/medical/?avaEntry=admin` |

- Module ID: `medical`
- App name: `Medical`
- Chinese display name: `醫療`
- Icon: existing AVA `medical` icon
- Category / Area: `medical` / `workspace`
- Home card: enabled, visible and favourite-eligible in the bundled official default
- Capabilities: `frontend: true`, `user: true`, `admin: true`
- Admin scope: partial Admin capability—Official data read / refresh, dataset
  information, and AI/manual-confirmed local draft workflow. Medical does not
  currently provide an Official write endpoint.
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
Ready automatically; those remain explicit Medical product-flow choices.
`avaEntry=admin` opens Medical's partial Admin surface only after the AVA
Platform issues a one-time, Medical-bound launch ticket and Medical exchanges
it for its App Grant. The normal Frontstage does not expose Edit/Admin controls,
and AVA Platform never passes its session credential to Medical.

## Gateway, PWA and Return to AVA

Medical is launched through the reviewed AVA-owned `module-gateway.html`
allowlist. The gateway remains the top-level document under `/avaplatform/` and
embeds the independent GitHub Pages deployment with `avaEntry=frontend`,
`avaEntry=user`, or `avaEntry=admin`. The gateway does not copy or cache
Medical source and no `_blank` or `window.open()` is used.

Medical's existing persistent `返回 AVA` control remains Medical-owned. The
gateway also provides an AVA-owned return control and bridges the reviewed
same-origin return link, keeping the top-level context under AVA. The Platform
does not rewrite Medical's PWA manifest, service worker, storage namespace or
standalone behavior.

## Availability and dependencies

On 2026-09-28, `https://ivancww.github.io/medical/` returned HTTP 200 and is the
existing GitHub Pages deployment. The Platform registry keeps that deployment
unchanged and passes the canonical `avaEntry` query parameter for explicit
Frontstage/User/Admin launches. Admin authorization remains subject to the
existing AVA Platform Unified Admin Authentication contract; the entry query
alone does not grant permission. Medical currently has no Official write
endpoint, so Platform does not expose or imply Official save/publish capability.

The current Medical MVP does not yet provide the common AVA Portable User Data
adapter, Backup / Restore, QR Restore, shared Cloud Media or common auth/version
integration. Those remain shared-infrastructure or Medical-side follow-up;
this Platform change does not fabricate them or create competing services.

## Medical-side follow-up

Medical PR #4 is merged. The current deployment has a persistent `返回 AVA`
link to `https://ivancww.github.io/avaplatform/`. No Medical repository files
were changed by this Platform task.
