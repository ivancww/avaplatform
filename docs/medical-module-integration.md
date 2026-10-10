# AVA Medical independent-module integration

## Boundary and source of truth

Medical remains the independently deployed `ivancww/medical` application.
AVA Platform contains only registration, Home-card metadata, common discovery
and launch behavior, and Mother-standard navigation entries. It does not copy
Medical source, pages, claim-engine logic, data, calculations, Official Data
schema, or workflow into this repository.

The current verified Medical production reference is:

- Frontend: Medical `v1.1.8`
- Medical GAS: production `V17`
- Platform frontend: `v1.14.3`
- Platform GAS: production `V6`
- Deployment URL: `https://ivancww.github.io/medical/`

## Registered contract

| AVA surface | Context | Destination |
| --- | --- | --- |
| Home / favourites / tool library | Frontstage | `https://ivancww.github.io/medical/?avaEntry=frontend` |
| Settings → Medical / 我的流程 | User | `https://ivancww.github.io/medical/?avaEntry=user` |
| AVA Studio → Medical | Admin | `https://ivancww.github.io/medical/?avaEntry=admin` |

- Module ID: `medical`
- App name: `Medical`
- Chinese display name: `醫療`
- Capabilities: `frontend: true`, `user: true`, `admin: true`
- Admin authorization record: approved `ava-legacy-app-grant-v1`
- Official write operation: `medical:official-write`
- Admin UI: seven independent Traditional Chinese tabs with unsaved-change
  protection and responsive navigation.
- Platform ownership: registry, discovery, launch, common Admin authorization
  standards, and Return-to-AVA integration only.
- App ownership: Medical Admin UI, GAS, Official Data, validation, mapping,
  persistence, and domain workflow.

The registry is the only Platform module registry. Existing editable Home-card
rules continue to own default placement, visibility, ordering and User
overrides. AVA Studio can edit card presentation but cannot delete the
module-connected card as a competing product entry.

## Front / User / Admin

The normal Front entry points to Medical's customer flow. Platform does not
expose Medical's temporary `編輯` or Admin controls in the AVA Front UI; the
Medical runtime remains responsible for its own product-flow controls.

The Admin sequence is AVA Studio authentication → Medical-bound one-time
launch ticket → Medical App Grant exchange and verification → Medical Admin
initialization. The entry query alone is not authorization, there is no second
Medical password, and copied Admin URLs fail without valid Platform-issued
authorization. Medical's production evidence is recorded separately from
static source tests.

Medical Official Write confirmation is not inferred from Admin login or
Official Read. The verified v1.1.8/V17 path uses a canonical server revision,
server-side authorization and validation, server read-after-write confirmation,
matching dataset/record/changed fields, and only then updates the confirmed
frontend state/cache.

## Direct navigation, PWA and Return to AVA

Medical uses direct same-window, top-level navigation to its registered canonical
GitHub Pages deployment with `avaEntry=frontend`, `user`, or `admin`. No
iframe, gateway, popup or new tab is used. AVA navigation scope is `/`; the
Platform Service Worker remains scoped only to `/avaplatform/` and does not
own Medical's shell.

Medical's persistent Return control remains App-owned and returns to
`https://ivancww.github.io/avaplatform/`. Medical's manifest, Service
Worker, shell update lifecycle and App version remain Medical-owned; a Medical
release does not require a Platform release.

## Verified production reference evidence

The user-verified production sequence is:

- AVA Studio Admin access: `PASS`
- Medical App Grant launch and Admin initialization: `PASS`
- Seven Chinese Admin tabs: `PASS`
- Official Data Read: `PASS`
- Official Write, Google Sheets synchronization and persistence after Admin
  reopen: `PASS`
- Medical GAS V17 `checkVersion` and Full Bootstrap expose the same
  canonical SHA-256 revision: `PASS`
- Return to AVA: `PASS`

This is a verified reference implementation of the Mother Standard's Official
Data semantics, not a universal source template. Other Apps must preserve their
own field names, schemas, revision representation, GAS functions, Sheet
mapping, validation and domain workflows.

## Availability and dependencies

The Platform registry keeps the canonical Medical deployment unchanged. Admin
authorization remains subject to the applicable Platform contract and
server-side verification; the entry query alone does not grant permission.
Medical's independent release, GAS deployment, Google Sheet, Script
Properties, and Official Data remain outside this Platform repository.

No Medical repository, GAS deployment, Google Sheet, Script Property, CRM,
Mother Rule runtime, or other Independent App was changed by this Platform
documentation update.
